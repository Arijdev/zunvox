/// <reference lib="webworker" />

import {
  env,
  pipeline,
  type ProgressInfo,
  type SummarizationPipeline,
  type Text2TextGenerationPipeline,
} from "@huggingface/transformers";
import {
  indexedDbCache,
  setModelCacheProgressListener,
} from "./indexedDbCache";

type AiTask = "summarize" | "proofread";

type WorkerRequest =
  | { id: number; type: "capabilities" }
  | {
      id: number;
      type: "run";
      task: AiTask;
      text: string;
    };

type WorkerResponse =
  | { id: number; type: "capabilities"; supported: boolean; reason?: string }
  | {
      id: number;
      type: "progress";
      task: AiTask;
      phase: string;
      percent: number | null;
      file?: string;
    }
  | { id: number; type: "result"; task: AiTask; text: string }
  | { id: number; type: "error"; message: string };

const workerScope = self as DedicatedWorkerGlobalScope;
const modelIds = {
  summarize: "Xenova/distilbart-cnn-6-6",
  proofread: "Xenova/t5-base-grammar-correction",
} as const;

let summarizer: Promise<SummarizationPipeline> | undefined;
let proofreader: Promise<Text2TextGenerationPipeline> | undefined;

env.allowRemoteModels = true;
env.useFS = false;
env.useFSCache = false;
env.useBrowserCache = false;
env.useCustomCache = true;
env.customCache = indexedDbCache;
env.useWasmCache = true;

function post(message: WorkerResponse) {
  workerScope.postMessage(message);
}

function progressCallback(task: AiTask, id: number) {
  return (progress: ProgressInfo) => {
    if (progress.status === "ready") {
      post({ id, type: "progress", task, phase: "Model ready", percent: 100 });
    } else if (progress.status === "progress" || progress.status === "progress_total") {
      post({
        id,
        type: "progress",
        task,
        phase: "Downloading and caching model",
        percent: Math.round(progress.progress),
        file: progress.status === "progress" ? progress.file : undefined,
      });
    } else if (progress.status === "initiate" || progress.status === "download") {
      post({
        id,
        type: "progress",
        task,
        phase:
          progress.status === "initiate"
            ? "Checking cached model files"
            : "Downloading and caching model",
        percent: null,
        file: progress.file,
      });
    }
  };
}

function getSummarizer(id: number) {
  if (!summarizer) {
    setModelCacheProgressListener(({ progress }) => {
      post({
        id,
        type: "progress",
        task: "summarize",
        phase: "Downloading and caching model",
        percent: Math.round(progress),
      });
    });
    summarizer = pipeline("summarization", modelIds.summarize, {
      dtype: "q4",
      progress_callback: progressCallback("summarize", id),
    }).finally(() => setModelCacheProgressListener());
    summarizer.catch(() => {
      summarizer = undefined;
    });
  }
  return summarizer;
}

function getProofreader(id: number) {
  if (!proofreader) {
    setModelCacheProgressListener(({ progress }) => {
      post({
        id,
        type: "progress",
        task: "proofread",
        phase: "Downloading and caching model",
        percent: Math.round(progress),
      });
    });
    proofreader = pipeline("text2text-generation", modelIds.proofread, {
      dtype: "q4",
      progress_callback: progressCallback("proofread", id),
    }).finally(() => setModelCacheProgressListener());
    proofreader.catch(() => {
      proofreader = undefined;
    });
  }
  return proofreader;
}

function splitText(text: string, limit: number) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  let chunk = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if (chunk && chunk.length + trimmed.length + 1 > limit) {
      chunks.push(chunk);
      chunk = "";
    }
    if (trimmed.length > limit) {
      if (chunk) chunks.push(chunk);
      for (let offset = 0; offset < trimmed.length; offset += limit) {
        chunks.push(trimmed.slice(offset, offset + limit));
      }
      chunk = "";
    } else {
      chunk = chunk ? `${chunk} ${trimmed}` : trimmed;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

function postTaskProgress(id: number, task: AiTask, phase: string, percent: number) {
  post({ id, type: "progress", task, phase, percent });
}

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type === "capabilities") {
    const supported = typeof WebAssembly !== "undefined" && "indexedDB" in self;
    post({
      id: request.id,
      type: "capabilities",
      supported,
      reason: supported
        ? undefined
        : "This browser needs WebAssembly and IndexedDB to run and cache local AI models.",
    });
    return;
  }

  if (request.type !== "run") return;
  try {
    let outputText: string;

    if (request.task === "summarize") {
      const model = await getSummarizer(request.id);
      const chunks = splitText(request.text, 2600);
      const summaries: string[] = [];
      for (const [index, chunk] of chunks.entries()) {
        postTaskProgress(
          request.id,
          request.task,
          `Summarizing section ${index + 1} of ${chunks.length}`,
          Math.round(((index + 1) / (chunks.length + 1)) * 90),
        );
        const value = await model(chunk, {
          max_new_tokens: 120,
          min_new_tokens: 12,
          truncation: true,
        });
        if (value[0]?.summary_text) summaries.push(value[0].summary_text.trim());
      }
      if (summaries.length > 1) {
        postTaskProgress(request.id, request.task, "Combining section summaries", 95);
        const combined = await model(summaries.join(" "), {
          max_new_tokens: 160,
          min_new_tokens: 20,
          truncation: true,
        });
        outputText = combined[0]?.summary_text ?? summaries.join(" ");
      } else {
        outputText = summaries[0] ?? "";
      }
    } else {
      const model = await getProofreader(request.id);
      const chunks = splitText(request.text, 1500);
      const revisions: string[] = [];
      for (const [index, chunk] of chunks.entries()) {
        postTaskProgress(
          request.id,
          request.task,
          `Proofreading section ${index + 1} of ${chunks.length}`,
          Math.round(((index + 1) / chunks.length) * 95),
        );
        const value = await model(`grammar: ${chunk}`, {
          max_new_tokens: 192,
          min_new_tokens: 1,
          num_beams: 5,
          truncation: true,
        });
        if (value[0]?.generated_text) revisions.push(value[0].generated_text.trim());
      }
      outputText = revisions.join(" ");
    }
    if (!outputText) throw new Error("The local model returned an empty result.");
    post({
      id: request.id,
      type: "result",
      task: request.task,
      text: outputText,
    });
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : "The local model could not finish this request.";
    const message =
      /quota|out of memory|allocation failed|memory access out of bounds|blob[_ ]out[_ ]of[_ ]memory/i.test(
        rawMessage,
      )
      ? "This device ran low on memory or browser storage. Close other tabs, try shorter text, or clear unused site data and retry."
      : /fetch|network|failed to load|connection/i.test(rawMessage)
        ? "The model could not be downloaded. Check your connection and browser storage, then try again."
        : rawMessage;
    post({
      id: request.id,
      type: "error",
      message,
    });
  }
};
