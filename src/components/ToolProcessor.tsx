"use client";

import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  FileImage,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Upload,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  acceptedFormats,
  estimatedOutputLabel,
  processFiles,
  supportsMultipleFiles,
  type ProcessingOptions,
  type ProcessingResult,
  type ToolId,
} from "@/lib/processors";

const initialOptions: ProcessingOptions = {
  quality: 76,
  imageFormat: "image/jpeg",
  maxWidth: 1600,
  maxHeight: 1600,
  cropEnabled: false,
  cropX: 0,
  cropY: 0,
  cropWidth: 800,
  cropHeight: 800,
  pageRanges: "1-3",
  documentFormat: "auto",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ToolProcessor({
  tool,
  defaultDocumentFormat = "auto",
}: {
  tool: ToolId;
  defaultDocumentFormat?: ProcessingOptions["documentFormat"];
}) {
  const isImageCompressor = tool === "image-compress";
  const usesImageQuality = [
    "image-compress",
    "image-convert",
    "image-resize",
  ].includes(tool);
  const workspaceLabel =
    {
      "image-compress": "Image compression workspace",
      "image-convert": "Image conversion workspace",
      "image-resize": "Image resizing workspace",
      "images-to-pdf": "Images to PDF workspace",
      "pdf-compress": "PDF compression workspace",
      "pdf-merge": "PDF merger workspace",
      "pdf-split": "PDF splitter workspace",
      "pdf-crop": "PDF cropping workspace",
      "pdf-to-images": "PDF to images workspace",
      "document-compress": "Word compression workspace",
      "document-convert": "Document conversion workspace",
    }[tool] ?? "File processing workspace";
  const formatLabel = acceptedFormats(tool)
    .split(",")
    .map((extension) => extension.replace(".", "").toUpperCase())
    .join(" · ");
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState({
    ...initialOptions,
    imageFormat: isImageCompressor ? "auto" as const : initialOptions.imageFormat,
    documentFormat: defaultDocumentFormat,
  });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState<{ original: string; compressed: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const multi = supportsMultipleFiles(tool);

  useEffect(() => {
    return () => {
      if (comparison) {
        URL.revokeObjectURL(comparison.original);
        URL.revokeObjectURL(comparison.compressed);
      }
    };
  }, [comparison]);

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const allowed = acceptedFormats(tool)
      .split(",")
      .map((extension) => extension.toLowerCase());
    const unsupported = incoming.find(
      (file) => !allowed.includes(`.${file.name.split(".").pop()?.toLowerCase()}`),
    );
    if (unsupported) {
      setError(`Unsupported file type: ${unsupported.name}. Choose ${allowed.join(", ")}.`);
      return;
    }
    const oversized = incoming.find((file) => file.size > 100 * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name} exceeds the 100 MB per-file limit.`);
      return;
    }
    setError("");
    setResult(null);
    setComparison(null);
    setFiles((current) => {
      const next = multi ? [...current, ...incoming] : incoming.slice(0, 1);
      return next.filter(
        (file, index, list) =>
          list.findIndex(
            (other) =>
              other.name === file.name &&
              other.size === file.size &&
              other.lastModified === file.lastModified,
          ) === index,
      );
    });
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setResult(null);
    setComparison(null);
    setProgress(0);
    setError("");
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResult(null);
  }

  async function process() {
    if (!files.length) return;
    setWorking(true);
    setProgress(0);
    setError("");
    setResult(null);
    try {
      const completed = await processFiles(
        tool,
        files,
        options,
        setProgress,
      );
      setResult(completed);
      if (isImageCompressor && files.length === 1 && /\.(jpe?g|png|webp)$/i.test(completed.filename)) {
        setComparison({
          original: URL.createObjectURL(files[0]),
          compressed: URL.createObjectURL(completed.blob),
        });
      }
      setProgress(100);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The file could not be processed. Please try a different file.",
      );
      setProgress(0);
    } finally {
      setWorking(false);
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      aria-label={workspaceLabel}
      className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-label="File upload area"
          className={`flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-7 text-center transition ${
            dragging
              ? "cyber-glow border-cyan-500 bg-cyan-50 dark:border-[#00F0FF] dark:bg-cyan-300/[0.06]"
              : "border-slate-300 bg-slate-50/60 dark:border-zinc-700 dark:bg-zinc-900/50"
          }`}
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {isImageCompressor ? <FileImage size={21} /> : <FileText size={21} />}
          </span>
          <p className="text-sm font-semibold">
            Drop {multi ? "files" : "a file"} here
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Or browse your device · up to 100 MB per file
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Upload size={15} /> Choose {multi ? "files" : "file"}
          </button>
          <span className="mt-3 text-[10px] font-semibold tracking-wide text-slate-400">
            {formatLabel}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedFormats(tool)}
            multiple={multi}
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2" aria-label="Selected files">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {isImageCompressor ? <FileImage size={16} /> : <FileText size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{file.name}</span>
                  <span className="text-[10px] text-slate-400">{formatSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                  disabled={working}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-rose-400/10"
                >
                  <X size={15} />
                </button>
                {tool === "pdf-merge" && (
                  <span className="flex items-center">
                    <button
                      type="button"
                      aria-label={`Move ${file.name} up`}
                      onClick={() => moveFile(index, -1)}
                      disabled={index === 0 || working}
                      className="flex h-11 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${file.name} down`}
                      onClick={() => moveFile(index, 1)}
                      disabled={index === files.length - 1 || working}
                      className="flex h-11 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-200">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]">
        {usesImageQuality && (
          <label>
            <span className="flex items-center justify-between text-sm font-semibold">
              Image quality{" "}
              <span className="text-slate-700 dark:text-zinc-200">
                {options.quality}%
              </span>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={options.quality}
              onChange={(event) => {
                setOptions((current) => ({
                  ...current,
                  quality: Number(event.target.value),
                }));
                setResult(null);
                setComparison(null);
              }}
              className="mt-4 h-6 w-full accent-slate-500 dark:accent-zinc-400"
              aria-label="Image quality"
            />
            <span className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </span>
          </label>
        )}

        {(tool === "image-compress" ||
          tool === "image-convert" ||
          tool === "image-resize" ||
          tool === "pdf-to-images") && (
          <label className="mt-5 block text-sm font-semibold">
            Output format
            <select
              value={options.imageFormat}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  imageFormat: event.target.value as ProcessingOptions["imageFormat"],
                }))
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-[#18181b]"
            >
              {tool === "image-compress" && (
                <option value="auto">Auto optimize (PNG to WebP)</option>
              )}
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              {tool !== "pdf-to-images" && <option value="image/webp">WebP</option>}
            </select>
            {tool === "image-compress" && (
              <span className="mt-1 block text-xs font-normal text-slate-500">
                PNG files use quality-adjustable WebP by default; choose PNG to preserve lossless output.
              </span>
            )}
          </label>
        )}

        {tool === "image-resize" && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {(["maxWidth", "maxHeight"] as const).map((dimension) => (
              <label key={dimension} className="text-xs font-semibold">
                {dimension === "maxWidth" ? "Maximum width (px)" : "Maximum height (px)"}
                <input
                  type="number"
                  min="1"
                  max="12000"
                  value={options[dimension]}
                  onChange={(event) =>
                    setOptions((current) => ({
                      ...current,
                      [dimension]: Math.max(1, Number(event.target.value) || 1),
                    }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-[#18181b]"
                />
              </label>
            ))}
          </div>
        )}

        {tool === "pdf-split" && (
          <label className="mt-5 block text-sm font-semibold">
            Page ranges
            <input
              type="text"
              value={options.pageRanges}
              onChange={(event) =>
                setOptions((current) => ({ ...current, pageRanges: event.target.value }))
              }
              placeholder="For example: 1-3, 5"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-[#18181b]"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Use page numbers and ranges separated by commas.
            </span>
          </label>
        )}

        {tool === "pdf-crop" && (
          <div className="mt-5">
            <p className="text-sm font-semibold">Crop box (PDF points)</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(
                [
                  ["cropX", "Left"],
                  ["cropY", "Bottom"],
                  ["cropWidth", "Width"],
                  ["cropHeight", "Height"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-xs text-slate-500">
                  {label}
                  <input
                    type="number"
                    min="0"
                    value={options[key]}
                    onChange={(event) =>
                      setOptions((current) => ({
                        ...current,
                        [key]: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-zinc-800 dark:bg-[#18181b] dark:text-[#fafafa]"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {tool === "document-convert" && (
          <>
            <label className="mt-5 block text-sm font-semibold">
              Convert to
              <select
                value={options.documentFormat}
                onChange={(event) =>
                  setOptions((current) => ({
                    ...current,
                    documentFormat: event.target.value as ProcessingOptions["documentFormat"],
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-[#18181b]"
              >
                <option value="docx">Word (.docx)</option>
                <option value="txt">Plain text (.txt)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </label>
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              PDF conversion extracts selectable text only. Original page layout,
              images, and scanned text are not preserved; use OCR for scanned files.
            </p>
          </>
        )}

        {working && (
          <div className="mt-6" role="status">
            <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Processing locally…</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="cyber-progress h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => void process()}
            disabled={working || files.length === 0}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#007783] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#006b75] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            {working ? <LoaderCircle size={16} className="animate-spin" /> : <Zap size={16} />}
            {working
              ? "Processing…"
              : {
                  "image-compress": "Compress images",
                  "image-convert": "Convert images",
                  "image-resize": "Resize images",
                  "images-to-pdf": "Create PDF",
                  "pdf-compress": "Compress PDF",
                  "pdf-merge": "Merge PDFs",
                  "pdf-split": "Split PDF",
                  "pdf-crop": "Crop PDF pages",
                  "pdf-to-images": "Convert PDF to images",
                  "document-compress": "Compress DOCX",
                  "document-convert": "Convert document",
                }[tool]}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <LockKeyhole size={12} /> Files stay on this device
          </p>
        </div>
      </div>

      {result && (
        <>
          {comparison && files[0] && (
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              {[
                { label: "Original", src: comparison.original, size: files[0].size },
                { label: "Compressed", src: comparison.compressed, size: result.blob.size },
              ].map(({ label, src, size }) => (
                <figure key={label} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                  <figcaption className="flex justify-between px-3 py-2 text-xs font-semibold">
                    <span>{label}</span><span className="text-slate-500">{formatSize(size)}</span>
                  </figcaption>
                  <div className="relative h-56 bg-slate-50 dark:bg-black/20">
                    <Image src={src} alt={`${label} image comparison preview`} fill unoptimized className="object-contain p-2" />
                  </div>
                </figure>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)] lg:col-span-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Your file is ready</p>
              <p className="mt-1 truncate text-xs text-slate-600 dark:text-[#a1a1aa]">
                {result.filename} · {result.details} · {formatSize(result.originalSize)}
                {" → "}
                {estimatedOutputLabel(result)}
                {result.originalSize > 0 && (
                  <>
                    {" · "}
                    {result.originalSize >= result.blob.size
                      ? `${Math.round(
                          ((result.originalSize - result.blob.size) /
                            result.originalSize) *
                            100,
                        )}% smaller`
                      : `${Math.round(
                          ((result.blob.size - result.originalSize) /
                            result.originalSize) *
                            100,
                        )}% larger`}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={download}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#007783] px-4 text-xs font-semibold text-white transition hover:bg-[#006b75] active:scale-95 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200"
            >
              <ArrowDownToLine size={15} /> Download file
            </button>
          </div>
        </>
      )}
    </section>
  );
}
