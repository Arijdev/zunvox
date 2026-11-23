"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

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

const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-[#007783] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006b75] active:scale-95 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200";

const btnSecondary =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
const AMBIGUOUS_RE = /[0O1lI]/g;

function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean,
): string {
  let chars = "";
  if (useUpper) chars += UPPERCASE;
  if (useLower) chars += LOWERCASE;
  if (useNumbers) chars += NUMBERS;
  if (useSymbols) chars += SYMBOLS;
  if (excludeAmbiguous) chars = chars.replace(AMBIGUOUS_RE, "");
  if (!chars) return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

function getStrength(password: string): {
  label: string;
  color: string;
  pct: number;
  textColor: string;
} {
  if (!password) return { label: "", color: "", pct: 0, textColor: "" };
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return {
      label: "Weak",
      color: "bg-red-500",
      pct: 25,
      textColor: "text-red-600 dark:text-red-400",
    };
  if (score <= 3)
    return {
      label: "Fair",
      color: "bg-orange-400",
      pct: 50,
      textColor: "text-orange-500",
    };
  if (score <= 4)
    return {
      label: "Good",
      color: "bg-yellow-400",
      pct: 75,
      textColor: "text-yellow-600 dark:text-yellow-400",
    };
  return {
    label: "Strong",
    color: "bg-green-500",
    pct: 100,
    textColor: "text-green-600 dark:text-green-400",
  };
}

export default function PasswordGeneratorWorkspace() {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    const generated = Array.from({ length: count }, () =>
      generatePassword(
        length,
        useUpper,
        useLower,
        useNumbers,
        useSymbols,
        excludeAmbiguous,
      ),
    ).filter(Boolean);
    setPasswords(generated);
  };

  const firstStrength = passwords[0] ? getStrength(passwords[0]) : null;

  return (
    <div className={cardClass}>
      <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Options
      </h2>

      {/* Length slider */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs text-slate-600 dark:text-zinc-400">
            Password length
          </label>
          <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            {length}
          </span>
        </div>
        <input
          type="range"
          min={8}
          max={128}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[#007783] dark:accent-[#00F0FF]"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-zinc-500">
          <span>8</span>
          <span>128</span>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { label: "Uppercase (A\u2013Z)", state: useUpper, set: setUseUpper },
          { label: "Lowercase (a\u2013z)", state: useLower, set: setUseLower },
          { label: "Numbers (0\u20139)", state: useNumbers, set: setUseNumbers },
          { label: "Symbols (!@#\u2026)", state: useSymbols, set: setUseSymbols },
          {
            label: "Exclude ambiguous (0, O, l, 1\u2026)",
            state: excludeAmbiguous,
            set: setExcludeAmbiguous,
          },
        ].map(({ label, state, set }) => (
          <label
            key={label}
            className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-zinc-300"
          >
            <input
              type="checkbox"
              checked={state}
              onChange={(e) => set(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-[#007783] dark:accent-[#00F0FF]"
            />
            {label}
          </label>
        ))}
      </div>

      {/* Count */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-600 dark:text-zinc-400">
          Number of passwords (1\u201310)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(e) =>
            setCount(Math.min(10, Math.max(1, Number(e.target.value))))
          }
          className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={btnPrimary} onClick={generate}>
          <RefreshCw size={14} /> Generate
        </button>
        {passwords.length > 0 && (
          <button
            className={btnSecondary}
            onClick={() => copy(passwords.join("\n"), "all-pw")}
          >
            {copied === "all-pw" ? <Check size={14} /> : <Copy size={14} />}
            {copied === "all-pw" ? "Copied!" : "Copy all"}
          </button>
        )}
      </div>

      {firstStrength && passwords.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-zinc-400">
              Password strength
            </span>
            <span className={`font-semibold ${firstStrength.textColor}`}>
              {firstStrength.label}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${firstStrength.color}`}
              style={{ width: `${firstStrength.pct}%` }}
            />
          </div>
        </div>
      )}

      {passwords.length > 0 && (
        <div className="mt-4 space-y-2">
          {passwords.map((pw, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <span className="break-all font-mono text-sm text-slate-800 dark:text-zinc-100">
                {pw}
              </span>
              <button
                className={`${btnSecondary} shrink-0`}
                onClick={() => copy(pw, `pw-${i}`)}
              >
                {copied === `pw-${i}` ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
