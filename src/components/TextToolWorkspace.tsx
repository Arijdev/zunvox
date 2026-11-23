"use client";

import { useState, useCallback } from "react";
import { Copy, RotateCcw, Check } from "lucide-react";

type TextTool =
  | "word-counter"
  | "case-converter"
  | "lorem-ipsum"
  | "find-replace"
  | "line-sorter"
  | "text-diff";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copied, copy };
}

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]";

const textareaClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-mono leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-800 resize-y";

const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-[#007783] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006b75] active:scale-95 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200";

const btnSecondary =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

// --- Word Counter ---
function WordCounter() {
  const [text, setText] = useState("");

  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences =
    text.trim() === ""
      ? 0
      : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs =
    text.trim() === ""
      ? 0
      : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
          Input Text
        </h2>
        {text && (
          <button
            onClick={() => setText("")}
            className={btnSecondary}
            aria-label="Clear text"
          >
            <RotateCcw size={14} /> Clear
          </button>
        )}
      </div>
      <textarea
        className={textareaClass}
        rows={8}
        placeholder="Paste or type your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(
          [
            ["Words", words],
            ["Characters", chars],
            ["Chars (no spaces)", charsNoSpaces],
            ["Sentences", sentences],
            ["Paragraphs", paragraphs],
            ["Reading time", `~${readingTime} min`],
          ] as [string, string | number][]
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-800 dark:text-zinc-100">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Case Converter ---
function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}
function toSentenceCase(str: string) {
  return str
    .toLowerCase()
    .replace(
      /(^|[.!?]\s+)([a-z])/g,
      (_, prefix: string, char: string) => prefix + char.toUpperCase(),
    );
}
function toCamelCase(str: string) {
  const words = str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/);
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}
function toSnakeCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/^_|_$/g, "");
}
function toKebabCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}

function CaseConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopy();

  const cases: { label: string; fn: (s: string) => string }[] = [
    { label: "UPPER CASE", fn: (s) => s.toUpperCase() },
    { label: "lower case", fn: (s) => s.toLowerCase() },
    { label: "Title Case", fn: toTitleCase },
    { label: "Sentence case", fn: toSentenceCase },
    { label: "camelCase", fn: toCamelCase },
    { label: "snake_case", fn: toSnakeCase },
    { label: "kebab-case", fn: toKebabCase },
  ];

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input Text
      </h2>
      <textarea
        className={textareaClass}
        rows={5}
        placeholder="Paste or type your text here…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {cases.map(({ label, fn }) => (
          <button
            key={label}
            className={btnPrimary}
            onClick={() => setOutput(fn(input))}
          >
            {label}
          </button>
        ))}
      </div>
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <button
              className={btnSecondary}
              onClick={() => copy(output, "case")}
            >
              {copied === "case" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "case" ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea className={textareaClass} rows={5} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- Lorem Ipsum Generator ---
const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do",
  "eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim",
  "ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi",
  "aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit",
  "voluptate","velit","esse","cillum","eu","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt",
  "mollit","anim","est","perspiciatis","unde","omnis","iste","natus","error",
  "accusantium","doloremque","laudantium","totam","rem","aperiam","eaque","ipsa","quae",
  "ab","inventore","veritatis","quasi","architecto","beatae","vitae","dicta",
  "explicabo","nemo","ipsam","quia","voluptas","aspernatur","aut","odit","fugit",
  "quo","minus","maxime",
];

function loremWord() {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function loremParagraph(wordCount: number) {
  const words = Array.from({ length: wordCount }, (_, i) => {
    const w = loremWord();
    return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });
  return words.join(" ") + ".";
}

function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerPara, setWordsPerPara] = useState(50);
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopy();

  const generate = () => {
    const paras = Array.from({ length: paragraphs }, () =>
      loremParagraph(wordsPerPara),
    );
    setOutput(paras.join("\n\n"));
  };

  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Options
      </h2>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-zinc-400">
          Paragraphs
          <input
            type="number"
            min={1}
            max={10}
            value={paragraphs}
            onChange={(e) =>
              setParagraphs(Math.min(10, Math.max(1, Number(e.target.value))))
            }
            className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-zinc-400">
          Words per paragraph
          <input
            type="number"
            min={10}
            max={200}
            value={wordsPerPara}
            onChange={(e) =>
              setWordsPerPara(Math.min(200, Math.max(10, Number(e.target.value))))
            }
            className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      </div>
      <button className={`${btnPrimary} mt-4`} onClick={generate}>
        Generate
      </button>
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <button
              className={btnSecondary}
              onClick={() => copy(output, "lorem")}
            >
              {copied === "lorem" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "lorem" ? "Copied!" : "Copy all"}
            </button>
          </div>
          <textarea className={textareaClass} rows={10} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- Find & Replace ---
function FindReplace() {
  const [input, setInput] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const { copied, copy } = useCopy();

  const output = find ? input.split(find).join(replace) : input;
  const count = find && input ? input.split(find).length - 1 : 0;

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input Text
      </h2>
      <textarea
        className={textareaClass}
        rows={6}
        placeholder="Paste your text here…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-slate-600 dark:text-zinc-400">
            Find
          </label>
          <input
            type="text"
            placeholder="Text to find…"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-slate-600 dark:text-zinc-400">
            Replace with
          </label>
          <input
            type="text"
            placeholder="Replacement…"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>
      {find && (
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
          {count} occurrence{count !== 1 ? "s" : ""} found
        </p>
      )}
      {input && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <button className={btnSecondary} onClick={() => copy(output, "fr")}>
              {copied === "fr" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "fr" ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea className={textareaClass} rows={6} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- Line Sorter ---
function LineSorter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopy();
  const [history, setHistory] = useState<string[]>([]);

  const applyOp = (fn: (lines: string[]) => string[]) => {
    const lines = (output || input).split("\n");
    const result = fn(lines).join("\n");
    setHistory((h) => [...h, output || input]);
    setOutput(result);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (prev !== undefined) {
      setOutput(prev);
      setHistory((h) => h.slice(0, -1));
    }
  };

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input Lines
      </h2>
      <textarea
        className={textareaClass}
        rows={6}
        placeholder="Paste lines of text here…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOutput("");
          setHistory([]);
        }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: "Sort A\u2192Z", fn: (l: string[]) => [...l].sort() },
          { label: "Sort Z\u2192A", fn: (l: string[]) => [...l].sort().reverse() },
          { label: "Reverse", fn: (l: string[]) => [...l].reverse() },
          { label: "Deduplicate", fn: (l: string[]) => [...new Set(l)] },
          {
            label: "Shuffle",
            fn: (l: string[]) => {
              const a = [...l];
              for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
              }
              return a;
            },
          },
        ].map(({ label, fn }) => (
          <button
            key={label}
            className={btnPrimary}
            onClick={() => applyOp(fn)}
          >
            {label}
          </button>
        ))}
        {history.length > 0 && (
          <button className={btnSecondary} onClick={undo}>
            <RotateCcw size={14} /> Undo
          </button>
        )}
      </div>
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <button className={btnSecondary} onClick={() => copy(output, "ls")}>
              {copied === "ls" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "ls" ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea className={textareaClass} rows={6} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- Text Diff ---
type DiffLine =
  | { type: "added"; text: string }
  | { type: "removed"; text: string }
  | { type: "unchanged"; text: string };

function computeDiff(original: string, modified: string): DiffLine[] {
  const a = original.split("\n");
  const b = modified.split("\n");
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result: DiffLine[] = [];
  let i = 0,
    j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: "unchanged", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: a[i] });
      i++;
    } else {
      result.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", text: a[i++] });
  }
  while (j < n) {
    result.push({ type: "added", text: b[j++] });
  }
  return result;
}

function TextDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const diff = computeDiff(original, modified);
  const hasChanges = diff.some((d) => d.type !== "unchanged");

  return (
    <div className={cardClass}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Original
          </h2>
          <textarea
            className={textareaClass}
            rows={8}
            placeholder="Paste original text…"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
          />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Modified
          </h2>
          <textarea
            className={textareaClass}
            rows={8}
            placeholder="Paste modified text…"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
          />
        </div>
      </div>
      {(original || modified) && (
        <div className="mt-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Diff {!hasChanges ? "\u2014 no differences" : ""}
          </h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-6 dark:border-zinc-700 dark:bg-zinc-900">
            {diff.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.type === "added"
                    ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                    : line.type === "removed"
                      ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                      : "text-slate-600 dark:text-zinc-400"
                }
              >
                {line.type === "added"
                  ? "+ "
                  : line.type === "removed"
                    ? "- "
                    : "  "}
                {line.text || " "}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TextToolWorkspace({ tool }: { tool: TextTool }) {
  if (tool === "word-counter") return <WordCounter />;
  if (tool === "case-converter") return <CaseConverter />;
  if (tool === "lorem-ipsum") return <LoremIpsum />;
  if (tool === "find-replace") return <FindReplace />;
  if (tool === "line-sorter") return <LineSorter />;
  if (tool === "text-diff") return <TextDiff />;
  return null;
}
