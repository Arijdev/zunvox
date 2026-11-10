"use client";

import {
  Check,
  CircleAlert,
  Copy,
  Download,
  FileText,
  LoaderCircle,
  ScanText,
  ShieldCheck,
  Sparkles,
  SpellCheck,
  Trash2,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { textToDocx } from "@/lib/processors";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AiTab = "summarize" | "ocr" | "proofread";
type AiTask = Exclude<AiTab, "ocr">;
type WorkerMessage =
  | {
      id: number;
      type: "capabilities";
      supported: boolean;
      reason?: string;
    }
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

type PendingRequest = {
  task: AiTask;
  sourceText: string;
  resolve: (text: string) => void;
  reject: (error: Error) => void;
};

type OcrWorkerHandle = {
  terminate: () => Promise<unknown>;
};

const tabs: { id: AiTab; label: string; icon: typeof Sparkles }[] = [
  { id: "summarize", label: "Summarize", icon: Sparkles },
  { id: "ocr", label: "Extract text", icon: ScanText },
  { id: "proofread", label: "Proofread", icon: SpellCheck },
];

const maxInputLength: Record<AiTask, number> = {
  summarize: 12000,
  proofread: 4000,
};

function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) ?? [];
}

function selectTakeaways(source: string, summary: string) {
  const ignored = new Set(
    "about after again against all also am an and any are as at be because been before being between both but by can could did do does doing down during each few for from further had has have he her here hers him his how i if in into is it its itself just may me might more most must my no nor not of off on once only or other our out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your".split(
      " ",
    ),
  );
  const summaryTerms = new Set(
    (summary.toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []).filter(
      (term) => !ignored.has(term),
    ),
  );
  const overviewKey = sentences(summary)[0]?.toLocaleLowerCase().replace(/\s+/g, " ");
  const ranked = sentences(source)
    .map((text, index) => {
      const terms = text.toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
      const matched = new Set(terms.filter((term) => summaryTerms.has(term)));
      return {
        text,
        index,
        score: matched.size / Math.sqrt(Math.max(terms.length, 1)),
        duplicateOfOverview:
          text.toLocaleLowerCase().replace(/\s+/g, " ") === overviewKey,
      };
    })
    .filter((item) => item.score > 0 && !item.duplicateOfOverview)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .sort((left, right) => left.index - right.index);
  return ranked.map((item) => item.text);
}

type DiffPart = { type: "same" | "removed" | "added"; text: string };

function wordDiff(original: string, revised: string): DiffPart[] | null {
  const before = original.match(/\s+|[\p{L}\p{N}_]+|[^\s]/gu) ?? [];
  const after = revised.match(/\s+|[\p{L}\p{N}_]+|[^\s]/gu) ?? [];
  const columns = after.length + 1;
  if (before.length * after.length > 300_000) return null;

  const matrix = new Uint16Array((before.length + 1) * columns);
  for (let row = before.length - 1; row >= 0; row -= 1) {
    for (let column = after.length - 1; column >= 0; column -= 1) {
      const current = row * columns + column;
      matrix[current] =
        before[row] === after[column]
          ? matrix[(row + 1) * columns + column + 1] + 1
          : Math.max(matrix[(row + 1) * columns + column], matrix[current + 1]);
    }
  }

  const parts: DiffPart[] = [];
  function append(type: DiffPart["type"], text: string) {
    const last = parts[parts.length - 1];
    if (last?.type === type) last.text += text;
    else parts.push({ type, text });
  }
  let row = 0;
  let column = 0;
  while (row < before.length && column < after.length) {
    if (before[row] === after[column]) {
      append("same", before[row]);
      row += 1;
      column += 1;
    } else if (
      matrix[(row + 1) * columns + column] >=
      matrix[row * columns + column + 1]
    ) {
      append("removed", before[row]);
      row += 1;
    } else {
      append("added", after[column]);
      column += 1;
    }
  }
  while (row < before.length) append("removed", before[row++]);
  while (column < after.length) append("added", after[column++]);
  return parts;
}

function ModelNotice({
  phase,
  percent,
  filename,
  onCancel,
}: {
  phase: string;
  percent: number | null;
  filename?: string;
  onCancel?: () => void;
}) {
  return (
    <div className="cyber-pulse mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-800 dark:text-zinc-100">
        <LoaderCircle size={14} className="animate-spin" />
        {phase}
      </div>
      {filename && (
        <p className="mt-1 truncate pl-[22px] text-[9px] text-slate-500 dark:text-zinc-400">
          {filename}
        </p>
      )}
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
        <div
          className={`cyber-progress h-full rounded-full transition-all ${
            percent === null ? "w-1/4 animate-pulse" : ""
          }`}
          style={percent === null ? undefined : { width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[9px] leading-4 text-slate-600 dark:text-[#a1a1aa]">
        First use downloads open model weights from Hugging Face. They are cached
        locally in IndexedDB; your text is not uploaded.
      </p>
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-2 min-h-11 rounded-md px-3 text-[9px] font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function AiToolsModule({
  onClose,
  initialTab = "summarize",
}: {
  onClose?: () => void;
  initialTab?: AiTab;
}) {
  const [tab, setTab] = useState<AiTab>(initialTab);
  const [fileDragging, setFileDragging] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [summary, setSummary] = useState("");
  const [summarySourceText, setSummarySourceText] = useState("");
  const [proofreadText, setProofreadText] = useState("");
  const [workerReady, setWorkerReady] = useState<boolean | null>(null);
  const [workerWarning, setWorkerWarning] = useState("");
  const [memoryWarning, setMemoryWarning] = useState("");
  const [busy, setBusy] = useState<AiTask | "ocr" | null>(null);
  const [progress, setProgress] = useState<{
    phase: string;
    percent: number | null;
    file?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const ocrWorkerRef = useRef<OcrWorkerHandle | null>(null);
  const pendingRef = useRef(new Map<number, PendingRequest>());
  const sequenceRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWorkerMessage = useCallback((event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    if (message.type === "capabilities") {
      setWorkerReady(message.supported);
      setWorkerWarning(message.reason ?? "");
      return;
    }
    if (message.type === "progress") {
      setProgress({
        phase: message.phase,
        percent: message.percent,
        file: message.file,
      });
      return;
    }
    const pending = pendingRef.current.get(message.id);
    if (!pending) return;
    pendingRef.current.delete(message.id);
    setProgress(null);
    setBusy(null);
    if (message.type === "result") {
      if (message.task === "summarize") {
        setSummary(message.text);
        setSummarySourceText(pending.sourceText);
      }
      if (message.task === "proofread") setProofreadText(message.text);
      setStatus("Done. Your text was processed on this device.");
      pending.resolve(message.text);
    } else {
      setError(message.message);
      pending.reject(new Error(message.message));
    }
  }, []);

  useEffect(() => {
    const pendingRequests = pendingRef.current;
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      const ocrWorker = ocrWorkerRef.current;
      ocrWorkerRef.current = null;
      if (ocrWorker) void ocrWorker.terminate();
      for (const pending of pendingRequests.values()) {
        pending.reject(new Error("The AI workspace was closed."));
      }
      pendingRequests.clear();
    };
  }, []);

  function ensureWorker() {
    if (workerRef.current) return workerRef.current;
    if (typeof Worker === "undefined") {
      throw new Error("Web Workers are not available in this browser.");
    }
    if (typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly is unavailable. Try a current desktop browser.");
    }
    if (typeof indexedDB === "undefined") {
      throw new Error("IndexedDB is unavailable for local model caching.");
    }
    try {
      const worker = new Worker(
        new URL("../workers/ai.worker.ts", import.meta.url),
        { type: "module", name: "zunvox-ai" },
      );
      workerRef.current = worker;
      worker.addEventListener("message", handleWorkerMessage);
      worker.addEventListener("error", (event) => {
        event.preventDefault();
        const failure = new Error(
          "The AI worker stopped unexpectedly. Your text is still on this device; reload the page and try again.",
        );
        for (const pending of pendingRef.current.values()) pending.reject(failure);
        pendingRef.current.clear();
        workerRef.current = null;
        setWorkerReady(false);
        setWorkerWarning(failure.message);
        setBusy(null);
        setProgress(null);
        setError(failure.message);
      });
      worker.postMessage({
        id: ++sequenceRef.current,
        type: "capabilities",
      });
      setWorkerReady(true);
      const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      setMemoryWarning(
        deviceMemory !== undefined && deviceMemory <= 4
          ? "This device reports 4 GB of memory or less. Large models may run slowly or run out of memory."
          : "",
      );
      return worker;
    } catch (cause) {
      const message =
        cause instanceof Error
          ? `This browser could not start the local AI worker: ${cause.message}`
          : "This browser could not start the local AI worker.";
      setWorkerReady(false);
      setWorkerWarning(message);
      throw new Error(message);
    }
  }

  function cancelTask() {
    workerRef.current?.terminate();
    workerRef.current = null;
    const cancellation = new Error(
      "Processing was canceled. Any completely downloaded model files remain cached on this device.",
    );
    for (const pending of pendingRef.current.values()) pending.reject(cancellation);
    pendingRef.current.clear();
    setBusy(null);
    setProgress(null);
    setError(cancellation.message);
  }

  function runTask(
    task: AiTask,
    text: string,
  ) {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Enter or extract some text first.");
      return Promise.reject(new Error("No text was provided."));
    }
    if (trimmed.length > maxInputLength[task]) {
      setError(
        `Please keep this text under ${maxInputLength[task].toLocaleString()} characters for a reliable in-browser run.`,
      );
      return Promise.reject(new Error("The text is longer than the local model limit."));
    }
    let worker: Worker;
    try {
      worker = ensureWorker();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Local AI is unavailable.";
      setError(message);
      return Promise.reject(new Error(message));
    }
    setError("");
    setStatus("");
    setBusy(task);
    setProgress({ phase: "Preparing local model", percent: null });
    const id = ++sequenceRef.current;
    const request = new Promise<string>((resolve, reject) => {
      pendingRef.current.set(id, {
        task,
        sourceText: trimmed,
        resolve,
        reject,
      });
    });
    worker.postMessage({
      id,
      type: "run",
      task,
      text: trimmed,
    });
    return request;
  }

  async function extractPdfText(file: File) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
    try {
      const pdf = await loadingTask.promise;
      if (pdf.numPages > 100) {
        throw new Error(
          "This PDF has more than 100 pages. Split it into smaller files first.",
        );
      }
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" "),
        );
        setProgress({
          phase: `Reading PDF page ${pageNumber} of ${pdf.numPages}`,
          percent: Math.round((pageNumber / pdf.numPages) * 100),
        });
      }
      return pages.join("\n\n").trim();
    } finally {
      await loadingTask.destroy();
    }
  }

  async function handleTextFile(file: File) {
    if (file.size > 30 * 1024 * 1024) {
      throw new Error("Please choose a file smaller than 30 MB.");
    }
    let text: string;
    if (file.name.toLowerCase().endsWith(".pdf")) {
      text = await extractPdfText(file);
      if (!text) {
        throw new Error(
          "No selectable text was found. Use Extract text to run OCR on this scanned PDF.",
        );
      }
    } else if (file.name.toLowerCase().endsWith(".txt")) {
      text = await file.text();
    } else {
      throw new Error("Choose a .txt or .pdf document.");
    }
    if (text.length > 12000) {
      text = text.slice(0, 12000);
      setStatus("The extracted text was shortened to 12,000 characters for this model.");
    }
    setSourceText(text);
    setTab("summarize");
    setStatus("Document text extracted locally and added to the summarizer.");
  }

  async function recognize(file: File) {
    if (file.size > 30 * 1024 * 1024) {
      throw new Error("Please choose an image or PDF smaller than 30 MB.");
    }
    const tesseract = await import("tesseract.js");
    const worker = await tesseract.createWorker("eng", 1, {
      logger: (event) => {
        const percent =
          typeof event.progress === "number"
            ? Math.round(event.progress * 100)
            : null;
        setProgress({
          phase: event.status || "Preparing OCR",
          percent,
        });
      },
    });
    ocrWorkerRef.current = worker;
    try {
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 3200 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          bitmap.close();
          throw new Error("Could not prepare this image for OCR.");
        }
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const result = await worker.recognize(canvas);
        canvas.width = 0;
        canvas.height = 0;
        setSourceText(result.data.text.trim());
        return result.data.text.trim();
      }

      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
      try {
        const pdf = await loadingTask.promise;
        if (pdf.numPages > 25) {
          throw new Error("OCR is limited to 25 PDF pages per run to protect device memory.");
        }
        const recognized: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const initialViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(
            1.5,
            3200 / Math.max(initialViewport.width, initialViewport.height),
          );
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Could not prepare a PDF page for OCR.");
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          const result = await worker.recognize(canvas);
          recognized.push(result.data.text.trim());
          canvas.width = 0;
          canvas.height = 0;
          setProgress({
            phase: `Reading PDF page ${pageNumber} of ${pdf.numPages}`,
            percent: Math.round((pageNumber / pdf.numPages) * 100),
          });
        }
        const text = recognized.filter(Boolean).join("\n\n");
        setSourceText(text);
        return text;
      } finally {
        await loadingTask.destroy();
      }
    } finally {
      if (ocrWorkerRef.current === worker) {
        ocrWorkerRef.current = null;
        await worker.terminate();
      }
    }
  }

  async function handleFile(
    file: File,
    target: "summarize" | "ocr",
  ) {
    setError("");
    setStatus("");
    setBusy(target === "ocr" ? "ocr" : "summarize");
    setProgress({ phase: "Preparing document", percent: null });
    try {
      if (target === "ocr" && !/\.(png|jpe?g|webp|pdf)$/i.test(file.name)) {
        throw new Error("Choose a PNG, JPG, WebP, or PDF file.");
      }
      if (target === "ocr") {
        await recognize(file);
        setStatus("Text extracted locally. You can copy it or send it to the summarizer.");
      } else {
        await handleTextFile(file);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The file could not be processed. Try a smaller or different file.",
      );
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(sourceText);
      setStatus("Text copied to clipboard.");
    } catch {
      setError("Clipboard access was denied. Select and copy the text manually.");
    }
  }

  async function copyOutput(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setError("");
      setStatus("Result copied to clipboard.");
    } catch {
      setError("Clipboard access was denied. Select and copy the result manually.");
    }
  }

  function downloadOutput(text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `zunvox-${tab}-result.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Text result downloaded.");
  }

  async function downloadDocxOutput(text: string) {
    try {
      const blob = await textToDocx(text);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `zunvox-${tab}-result.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
      setStatus("Word document downloaded.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The Word document could not be created.");
    }
  }

  function clearOutput() {
    setSourceText("");
    setSummary("");
    setSummarySourceText("");
    setProofreadText("");
    setError("");
    setStatus("Workspace cleared.");
  }

  function moveExtractedText() {
    setTab("summarize");
    setStatus("Extracted text is ready to summarize.");
    document.getElementById("ai-input")?.focus();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(
        file,
        tab === "ocr" ? "ocr" : "summarize",
      );
    }
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setFileDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      void handleFile(
        file,
        tab === "ocr" ? "ocr" : "summarize",
      );
    }
  }

  const available = workerReady !== false;
  const summarySentences = sentences(summary);
  const overview = summarySentences.slice(0, 1).join(" ");
  const takeaways = selectTakeaways(summarySourceText, summary);
  const outputText =
    tab === "summarize" ? summary : tab === "proofread" ? proofreadText : sourceText;
  const activeTab = tabs.find((item) => item.id === tab);
  const ActiveIcon = activeTab?.icon ?? Sparkles;
  const activeInputLimit = tab === "ocr" ? 12000 : maxInputLength[tab];
  const proofreadDiff = useMemo(
    () => (proofreadText ? wordDiff(sourceText, proofreadText) : null),
    [proofreadText, sourceText],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]">
      <div className="relative flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <WandSparkles size={16} />
            </span>
            <h2 className="text-[15px] font-semibold tracking-[-0.025em]">
              AI Utilities
            </h2>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            Local inference in a web worker. No sign-in or text uploads.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#008B99]/25 bg-[#008B99]/[0.07] px-2.5 py-1.5 text-[9px] font-semibold text-[#006b75] dark:border-[#00F0FF]/25 dark:bg-[#00F0FF]/[0.08] dark:text-[#00F0FF]">
          <ShieldCheck size={12} /> Private, on-device processing
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close AI utilities"
            className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 sm:static dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="AI utilities"
        className="hide-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto border-b border-slate-200/80 px-2 pt-2 sm:px-5 dark:border-zinc-800"
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`ai-tab-${item.id}`}
              role="tab"
              aria-selected={tab === item.id}
              aria-controls="ai-tab-panel"
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => {
                setTab(item.id);
                setError("");
                setStatus("");
              }}
              className={`inline-flex min-h-12 min-w-[108px] snap-start shrink-0 items-center justify-center gap-1.5 border-b-2 px-3 text-[11px] font-semibold transition active:scale-95 sm:px-4 ${
                tab === item.id
                  ? "border-[#008B99] text-[#006b75] dark:border-[#00F0FF] dark:text-[#00F0FF]"
                  : "border-transparent text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              <Icon size={14} /> {item.label}
            </button>
          );
        })}
      </div>

      <div
        id="ai-tab-panel"
        role="tabpanel"
        aria-labelledby={`ai-tab-${tab}`}
        className="grid min-w-0 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_0.85fr] lg:gap-5"
      >
        <div className="min-w-0">
          {tab === "ocr" ? (
            <>
              <h3 className="text-[13px] font-semibold">Extract text from an image or scan</h3>
              <p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                OCR runs locally using Tesseract.js. English recognition data is
                downloaded on first use and cached by your browser.
              </p>
              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setFileDragging(true);
                }}
                onDragLeave={() => setFileDragging(false)}
                onDrop={onDrop}
                className={`mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center transition duration-200 dark:bg-zinc-900/50 ${
                  fileDragging
                    ? "cyber-glow scale-[1.01] border-[#008B99] bg-cyan-50 dark:border-[#00F0FF] dark:bg-cyan-300/[0.08]"
                    : "border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-100 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                }`}
              >
                <Upload size={19} className="mb-2 text-slate-600 dark:text-zinc-300" aria-hidden="true" />
                <span className="text-[11px] font-semibold">Drop a scan or browse files</span>
                <span className="mt-1 text-[9px] text-slate-400">
                  PNG · JPG · WebP · scanned PDF · max 30 MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  onChange={onFileChange}
                  className="hidden"
                  disabled={busy !== null}
                  aria-label="Choose image or PDF to extract text"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy !== null}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  {busy === "ocr" ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    <ScanText size={13} />
                  )}
                  {busy === "ocr" ? "Extracting…" : "Extract text"}
                </button>
                <button
                  onClick={moveExtractedText}
                  disabled={!sourceText.trim()}
                  className="min-h-12 rounded-lg px-3 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Summarize text
                </button>
              </div>
              {sourceText && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                      Extracted text
                    </span>
                    <button
                      onClick={() => void copyText()}
                      className="inline-flex min-h-11 items-center gap-1 px-2 text-[10px] font-semibold text-slate-700 dark:text-zinc-200"
                    >
                      <Copy size={11} /> Copy text
                    </button>
                  </div>
                  <textarea
                    value={sourceText}
                    onChange={(event) => setSourceText(event.target.value)}
                    aria-label="Extracted text"
                    className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-[#f8fafc] p-3 text-[12px] leading-6 text-slate-800 outline-none transition focus:border-[#008B99] dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-100 dark:focus:border-[#00F0FF]"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[13px] font-semibold">
                  {tab === "summarize"
                    ? "What would you like summarized?"
                    : "Text to proofread"}
                </h3>
                {tab === "summarize" && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy !== null}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <FileText size={12} /> Upload TXT / PDF
                  </button>
                )}
              </div>
              <p className="mt-1 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                {tab === "summarize"
                  ? "Paste text or load a document. The local model creates a short overview and key takeaways."
                  : "English grammar correction runs locally. Review its suggestions before using them."}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={onFileChange}
                className="hidden"
                disabled={busy !== null}
                aria-label="Choose a TXT or PDF document to summarize"
              />
              <textarea
                id="ai-input"
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder={
                  tab === "summarize"
                    ? "Paste an article, meeting notes, or document text…"
                    : "Enter an English sentence or paragraph to improve…"
                }
                className="mt-3 min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 text-[13px] leading-6 text-slate-800 outline-none transition focus:border-[#008B99] dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-100 dark:focus:border-[#00F0FF]"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[9px] text-slate-400">
                  {sourceText.length.toLocaleString()} /{" "}
                  {activeInputLimit.toLocaleString()} characters
                </span>
                <button
                  onClick={() => {
                    void runTask(tab, sourceText).catch(() => undefined);
                  }}
                  disabled={busy !== null || !sourceText.trim() || !available}
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-lg bg-[#007783] px-4 text-[11px] font-semibold text-white transition hover:bg-[#006b75] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
                >
                  {busy === tab ? (
                    <LoaderCircle size={13} className="animate-spin" />
                  ) : (
                    <WandSparkles size={13} />
                  )}
                  {busy === tab
                    ? "Working locally…"
                    : tab === "summarize"
                      ? "Summarize"
                      : "Proofread"}
                </button>
              </div>
            </>
          )}

          {busy && progress && (
            <ModelNotice
              phase={progress.phase}
              percent={progress.percent}
              filename={progress.file}
              onCancel={busy === "ocr" ? undefined : cancelTask}
            />
          )}
          {workerWarning && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-900 dark:border-amber-300/15 dark:bg-amber-300/[0.06] dark:text-amber-200">
              <CircleAlert size={14} className="mt-0.5 shrink-0" />
              <span>
                {workerWarning} Try a current desktop browser with WebAssembly
                enabled. WebGPU is optional; the models use WebAssembly.
              </span>
            </div>
          )}
          {memoryWarning && !workerWarning && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-900 dark:border-amber-300/15 dark:bg-amber-300/[0.06] dark:text-amber-200">
              <CircleAlert size={14} className="mt-0.5 shrink-0" />
              {memoryWarning}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[10px] leading-5 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-200"
            >
              <CircleAlert size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {status && !error && (
            <p role="status" className="mt-3 flex items-start gap-1.5 text-[10px] leading-5 text-[#006b75] dark:text-[#00F0FF]">
              <Check size={13} className="mt-0.5 shrink-0" /> {status}
            </p>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-[#f1f5f9] p-4 sm:p-5 dark:border-zinc-800 dark:bg-[#18181b]/80">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <ActiveIcon size={14} />
            </span>
            <h3 className="text-[11px] font-semibold">
              {tab === "summarize"
                ? "Summary"
                : tab === "ocr"
                  ? "Extracted result"
                  : "Proofread suggestion"}
            </h3>
          </div>

          {tab === "summarize" && (
            summary ? (
              <div className="space-y-3">
                {overview && (
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Overview
                    </p>
                    <p className="text-[11px] leading-5 text-slate-700 dark:text-zinc-200">
                      {overview}
                    </p>
                  </div>
                )}
                {takeaways.length > 0 ? (
                  <div>
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Key takeaways
                    </p>
                    <ul className="space-y-2">
                      {takeaways.map((item, index) => (
                        <li
                          key={`${index}-${item.slice(0, 18)}`}
                          className="flex gap-2 text-[10px] leading-5 text-slate-600 dark:text-slate-300"
                        >
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-zinc-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                Your concise overview and key takeaways will appear here.
              </p>
            )
          )}

          {tab === "ocr" && (
            sourceText ? (
              <div className="space-y-3">
                <p className="whitespace-pre-wrap break-words text-[10px] leading-5 text-slate-700 dark:text-zinc-200">
                  {sourceText.slice(0, 900)}
                  {sourceText.length > 900 ? "…" : ""}
                </p>
                <button
                  onClick={() => void copyText()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <Copy size={12} /> Copy text
                </button>
              </div>
            ) : (
              <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                OCR output will appear here. Extracted text can be copied or passed
                to the summarizer.
              </p>
            )
          )}

          {tab === "proofread" && (
            proofreadText ? (
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Suggested revision · review before use
                </p>
                <p className="whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-700 dark:text-zinc-200">
                  {proofreadText}
                </p>
                <p className="mb-1 mt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Changes from original
                </p>
                {proofreadDiff ? (
                  <p className="whitespace-pre-wrap break-words text-[11px] leading-6 text-slate-700 dark:text-zinc-200">
                    {proofreadDiff.map((part, index) =>
                      part.type === "removed" ? (
                        <del
                          key={index}
                          title="Removed text"
                          className="mx-0.5 rounded bg-slate-200 px-0.5 text-slate-800 dark:bg-zinc-700 dark:text-zinc-100"
                        >
                          {part.text}
                        </del>
                      ) : part.type === "added" ? (
                        <ins
                          key={index}
                          title="Suggested text"
                          className="mx-0.5 rounded bg-slate-100 px-0.5 text-slate-900 underline decoration-1 underline-offset-2 dark:bg-zinc-800 dark:text-zinc-100"
                        >
                          {part.text}
                        </ins>
                      ) : (
                        <span key={index}>{part.text}</span>
                      ),
                    )}
                  </p>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-700 dark:text-zinc-200">
                    {proofreadText}
                  </p>
                )}
                <p className="mt-2 text-[9px] text-slate-400">
                  <span className="text-slate-600 dark:text-zinc-400">Strikethrough: removed</span>
                  {" · "}
                  <span className="text-slate-700 dark:text-zinc-200">
                    Underline: suggested
                  </span>
                </p>
                <button
                  onClick={() => setSourceText(proofreadText)}
                  className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-semibold text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  Use suggestion as input
                </button>
              </div>
            ) : (
              <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                The model&apos;s English correction suggestion will appear here. Check
                names, facts, and tone before accepting.
              </p>
            )
          )}

          {outputText && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3 dark:border-zinc-800">
              <button
                onClick={() => void copyOutput(outputText)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Copy size={12} /> Copy result
              </button>
              <button
                onClick={() => downloadOutput(outputText)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Download size={12} /> Download .txt
              </button>
              {tab === "ocr" && (
                <button
                  onClick={() => void downloadDocxOutput(outputText)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Download size={12} /> Export .docx
                </button>
              )}
              <button
                onClick={clearOutput}
                className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          )}

          <div className="mt-5 border-t border-slate-200/80 pt-3 dark:border-zinc-800">
            <p className="flex items-center gap-1.5 text-[9px] leading-4 text-slate-400">
              <ShieldCheck size={11} className="shrink-0 text-[#006b75] dark:text-[#00F0FF]" />
              Text is processed on this device and is not sent to an AI service.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 border-t border-slate-100 px-4 py-3 text-[9px] leading-4 text-slate-400 sm:px-6 dark:border-zinc-800">
        <CircleAlert size={12} className="mt-0.5 shrink-0" />
        Model weights and OCR language data are downloaded from public model/CDN
        hosts on first use. Your selected documents and text stay in browser
        memory; AI tools need available RAM and storage.
      </div>
    </div>
  );
}
