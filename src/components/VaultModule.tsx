"use client";

import {
  AlertCircle,
  CloudOff,
  Eye,
  EyeOff,
  FileKey2,
  LockKeyhole,
  ShieldCheck,
  UnlockKeyhole,
  Upload,
} from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { decryptFile, encryptFile } from "@/utils/crypto";

type VaultMode = "encrypt" | "decrypt";

function isVaultFilename(filename: string) {
  const normalizedFilename = filename.toLowerCase();
  return normalizedFilename.endsWith(".zunvox") || normalizedFilename.endsWith(".kurox");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function passwordQuality(password: string) {
  return [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
}

export default function VaultModule() {
  const [mode, setMode] = useState<VaultMode>("encrypt");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [working, setWorking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const passwordStrength = passwordQuality(password);

  function chooseMode(nextMode: VaultMode) {
    if (working) return;
    setMode(nextMode);
    setFile(null);
    setPassword("");
    setError("");
    setStatus("");
    setProgress(0);
    setPhase("");
  }

  function addFile(candidate?: File) {
    if (!candidate) return;
    setError("");
    setStatus("");
    const isVaultFile = isVaultFilename(candidate.name);
    if (mode === "decrypt" && !isVaultFile) {
      setFile(null);
      setError("Choose a Zunvox Vault .zunvox or legacy .kurox file to unlock.");
      return;
    }
    if (mode === "encrypt" && isVaultFile) {
      setFile(null);
      setError("This vault file is already encrypted. Switch to Unlock Document to restore it.");
      return;
    }
    if (candidate.size > 1024 * 1024 * 1024 + 320 * 1024) {
      setFile(null);
      setError("Files larger than 1 GB are not supported. Try a smaller document.");
      return;
    }
    setFile(candidate);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    addFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFile(event.dataTransfer.files[0]);
  }

  async function runVaultOperation() {
    if (!file) {
      setError(
        mode === "encrypt"
          ? "Choose a file to encrypt first."
          : "Choose a .zunvox or legacy .kurox file first.",
      );
      return;
    }
    if (password.length < 12) {
      setError("Use a passphrase with at least 12 characters.");
      return;
    }
    setWorking(true);
    setError("");
    setStatus("");
    setProgress(0);
    setPhase(mode === "encrypt" ? "Deriving encryption key" : "Deriving decryption key");
    try {
      const onProgress = (percent: number, nextPhase: string) => {
        setProgress(percent);
        setPhase(nextPhase);
      };
      if (mode === "encrypt") {
        const encrypted = await encryptFile(file, password, onProgress);
        downloadBlob(encrypted, "locked-document.zunvox");
        setStatus("Encrypted file downloaded. Keep your passphrase safe; it cannot be recovered.");
      } else {
        const restored = await decryptFile(file, password, onProgress);
        downloadBlob(restored.blob, restored.filename);
        setStatus("Document decrypted and downloaded.");
      }
      setPassword("");
      setFile(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The file could not be processed. Check your passphrase and try again.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <section
      aria-label="Zunvox Vault workspace"
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold">Private document locker</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Encryption and decryption happen locally in your browser.
          </p>
        </div>
        <div role="tablist" aria-label="Vault operation" className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "encrypt"}
            onClick={() => chooseMode("encrypt")}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition active:scale-95 ${mode === "encrypt" ? "bg-white text-[#006b75] shadow-sm dark:bg-zinc-800 dark:text-[#00F0FF]" : "text-slate-500 dark:text-zinc-400"}`}
          >
            <LockKeyhole size={14} /> Lock document
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "decrypt"}
            onClick={() => chooseMode("decrypt")}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition active:scale-95 ${mode === "decrypt" ? "bg-white text-[#006b75] shadow-sm dark:bg-zinc-800 dark:text-[#00F0FF]" : "text-slate-500 dark:text-zinc-400"}`}
          >
            <UnlockKeyhole size={14} /> Unlock document
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-label={mode === "encrypt" ? "Drop any file here to encrypt" : "Drop a Zunvox Vault file here to decrypt"}
          className={`flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-7 text-center transition ${dragging ? "cyber-glow border-cyan-600 bg-cyan-50 dark:border-[#00F0FF] dark:bg-cyan-300/[0.06]" : "border-slate-300 bg-slate-50/60 dark:border-zinc-700 dark:bg-zinc-900/50"}`}
        >
          <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 transition dark:border-zinc-800 ${working ? "cyber-pulse bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-100" : "bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:text-zinc-200"}`}>
            {working ? (
              mode === "encrypt" ? <LockKeyhole size={21} /> : <UnlockKeyhole size={21} />
            ) : (
              <FileKey2 size={21} />
            )}
          </span>
          <p className="text-sm font-semibold">
            {file ? file.name : mode === "encrypt" ? "Drop any document here" : "Drop a .zunvox or legacy .kurox file here"}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : mode === "encrypt" ? "Any file type · up to 1 GB" : "Only Zunvox Vault files · up to 1 GB + encryption overhead"}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={working}
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Upload size={15} /> Browse files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={mode === "decrypt" ? ".zunvox,.kurox,application/vnd.zunvox.vault,application/vnd.kurox.vault" : undefined}
            onChange={onFileChange}
            disabled={working}
            className="hidden"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="vault-password" className="text-xs font-semibold">
            {mode === "encrypt" ? "Create a passphrase" : "Enter your passphrase"}
          </label>
          <div className="relative mt-2">
            <input
              id="vault-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={working}
              placeholder="At least 12 characters"
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 pr-12 text-sm outline-none transition focus:border-cyan-700 dark:border-zinc-800 dark:bg-[#18181b] dark:focus:border-[#00F0FF]"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 dark:hover:bg-zinc-800"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {mode === "encrypt" && (
            <div className="mt-2">
              <div className="flex gap-1" aria-label={`Passphrase strength ${passwordStrength} out of 4`}>
                {[0, 1, 2, 3].map((level) => (
                  <span key={level} className={`h-1 flex-1 rounded-full ${passwordStrength > level ? "bg-[#008B99] dark:bg-[#00F0FF]" : "bg-slate-200 dark:bg-zinc-800"}`} />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                Use 12+ unique characters with mixed case, numbers, and symbols. A longer passphrase is stronger.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-5 text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <p className="flex items-start gap-2 font-semibold">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              Your files are encrypted locally. We do not store your files, passwords, or keys.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#008B99]/25 bg-[#008B99]/[0.07] px-2.5 py-1 font-semibold text-[#006b75] dark:border-[#00F0FF]/25 dark:bg-[#00F0FF]/[0.08] dark:text-[#00F0FF]">
              <CloudOff size={14} /> 0 document bytes uploaded
            </p>
            <p className="mt-1.5 text-slate-600 dark:text-[#a1a1aa]">
              AES-256-GCM with PBKDF2-SHA-256 and a unique random salt. Your passphrase cannot be recovered.
            </p>
            <p className="mt-1.5 text-slate-600 dark:text-[#a1a1aa]">
              Temporary byte buffers are overwritten after use. Web pages cannot guarantee secure erasure of immutable passphrase strings, browser-managed keys, or memory.
            </p>
          </div>

          {working && (
            <div className="mt-4" role="status" aria-live="polite">
              <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{phase || "Preparing secure operation…"}</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="cyber-progress h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}
          {status && (
            <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {status}
            </p>
          )}

          <button
            type="button"
            onClick={() => void runVaultOperation()}
            disabled={working || !file || password.length < 12}
            className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#007783] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#006b75] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            {mode === "encrypt" ? <LockKeyhole size={16} /> : <UnlockKeyhole size={16} />}
            {working ? "Securing your file…" : mode === "encrypt" ? "Encrypt & Download" : "Decrypt & Restore"}
          </button>
          <p className="mt-3 text-center text-[10px] leading-5 text-slate-400">
            Reads are processed in 256 KB chunks to limit working buffers. Your browser still needs space for the final downloadable file.
          </p>
        </div>
      </div>
    </section>
  );
}
