"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

type EncodeTool =
  | "base64"
  | "url-encoder"
  | "html-entities"
  | "json-formatter"
  | "number-base"
  | "color-converter"
  | "hash-generator"
  | "uuid-generator";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-[#007783] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#006b75] active:scale-95 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200";

const btnSecondary =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

function CopyBtn({ text, copyKey }: { text: string; copyKey: string }) {
  const { copied, copy } = useCopy();
  return (
    <button className={btnSecondary} onClick={() => copy(text, copyKey)}>
      {copied === copyKey ? <Check size={14} /> : <Copy size={14} />}
      {copied === copyKey ? "Copied!" : "Copy"}
    </button>
  );
}

// --- Base64 ---
function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
      setError("");
    } catch {
      setError("Could not encode this text. Make sure it is valid UTF-8.");
    }
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(escape(atob(input.trim()))));
      setError("");
    } catch {
      setError(
        "Invalid Base64 input. Make sure the text is a valid Base64-encoded string.",
      );
    }
  };

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input
      </h2>
      <textarea
        className={textareaClass}
        rows={5}
        placeholder="Paste text or Base64 here…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <button className={btnPrimary} onClick={encode}>
          Encode
        </button>
        <button className={btnPrimary} onClick={decode}>
          Decode
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <CopyBtn text={output} copyKey="b64" />
          </div>
          <textarea className={textareaClass} rows={5} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- URL Encoder ---
function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input
      </h2>
      <textarea
        className={textareaClass}
        rows={5}
        placeholder="Paste URL or query string…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <button
          className={btnPrimary}
          onClick={() => {
            setOutput(encodeURIComponent(input));
            setError("");
          }}
        >
          Encode
        </button>
        <button
          className={btnPrimary}
          onClick={() => {
            try {
              setOutput(decodeURIComponent(input));
              setError("");
            } catch {
              setError("Invalid URL-encoded input.");
            }
          }}
        >
          Decode
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <CopyBtn text={output} copyKey="url" />
          </div>
          <textarea className={textareaClass} rows={5} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- HTML Entities ---
function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    setOutput(
      input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;"),
    );
  };

  const decode = () => {
    const el = document.createElement("textarea");
    el.innerHTML = input;
    setOutput(el.value);
  };

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input
      </h2>
      <textarea
        className={textareaClass}
        rows={5}
        placeholder="Paste HTML or plain text…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <button className={btnPrimary} onClick={encode}>
          Encode
        </button>
        <button className={btnPrimary} onClick={decode}>
          Decode
        </button>
      </div>
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <CopyBtn text={output} copyKey="html" />
          </div>
          <textarea className={textareaClass} rows={5} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- JSON Formatter ---
function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const prettify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
      setError("");
      setStatus("Valid JSON");
    } catch (e) {
      setError((e as Error).message);
      setStatus("");
    }
  };

  const minify = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input)));
      setError("");
      setStatus("Valid JSON");
    } catch (e) {
      setError((e as Error).message);
      setStatus("");
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError("");
      setStatus("\u2713 Valid JSON");
      setOutput("");
    } catch (e) {
      setError((e as Error).message);
      setStatus("");
    }
  };

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input JSON
      </h2>
      <textarea
        className={textareaClass}
        rows={8}
        placeholder='{"key": "value"}'
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setStatus("");
          setError("");
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className={btnPrimary} onClick={prettify}>
          Prettify
        </button>
        <button className={btnPrimary} onClick={minify}>
          Minify
        </button>
        <button className={btnPrimary} onClick={validate}>
          Validate
        </button>
      </div>
      {status && (
        <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
          {status}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Output
            </h2>
            <CopyBtn text={output} copyKey="json" />
          </div>
          <textarea className={textareaClass} rows={8} readOnly value={output} />
        </div>
      )}
    </div>
  );
}

// --- Number Base Converter ---
function NumberBase() {
  const [value, setValue] = useState("");
  const [base, setBase] = useState<2 | 8 | 10 | 16>(10);
  const { copied, copy } = useCopy();

  const decimal = (() => {
    if (!value.trim()) return null;
    const n = parseInt(value.trim(), base);
    if (isNaN(n)) return null;
    return n;
  })();

  const bases: { label: string; b: 2 | 8 | 10 | 16; prefix: string }[] = [
    { label: "Binary (base-2)", b: 2, prefix: "0b" },
    { label: "Octal (base-8)", b: 8, prefix: "0o" },
    { label: "Decimal (base-10)", b: 10, prefix: "" },
    { label: "Hexadecimal (base-16)", b: 16, prefix: "0x" },
  ];

  return (
    <div className={cardClass}>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs text-slate-600 dark:text-zinc-400">
            Input number
          </label>
          <input
            className={inputClass}
            placeholder="Enter a number…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-600 dark:text-zinc-400">
            Input base
          </label>
          <select
            value={base}
            onChange={(e) =>
              setBase(Number(e.target.value) as 2 | 8 | 10 | 16)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value={2}>Binary (2)</option>
            <option value={8}>Octal (8)</option>
            <option value={10}>Decimal (10)</option>
            <option value={16}>Hexadecimal (16)</option>
          </select>
        </div>
      </div>
      {value && decimal === null && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">
          Invalid input for selected base.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {bases.map(({ label, b, prefix }) => {
          const val =
            decimal !== null ? decimal.toString(b).toUpperCase() : "\u2014";
          const display = `${prefix}${val}`;
          return (
            <div
              key={b}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {label}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="break-all font-mono text-sm font-semibold text-slate-800 dark:text-zinc-100">
                  {display}
                </span>
                {decimal !== null && (
                  <button
                    className={btnSecondary}
                    onClick={() => copy(display, `base-${b}`)}
                  >
                    {copied === `base-${b}` ? (
                      <Check size={12} />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Color Converter ---
function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function ColorConverter() {
  const [hex, setHex] = useState("#007783");
  const { copied, copy } = useCopy();

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(...rgb) : null;

  const handleRgbChange = (index: 0 | 1 | 2, val: number) => {
    if (!rgb) return;
    const next = [...rgb] as [number, number, number];
    next[index] = Math.min(255, Math.max(0, val));
    const h = next.map((v) => v.toString(16).padStart(2, "0")).join("");
    setHex(`#${h}`);
  };

  const isValid = rgb !== null;

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-start gap-5">
        <div
          className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 shadow-sm dark:border-zinc-700"
          style={{ backgroundColor: isValid ? hex : "#ccc" }}
          aria-label="Color preview"
        />
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs text-slate-600 dark:text-zinc-400">
            Pick a color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={isValid ? hex : "#000000"}
              onChange={(e) => setHex(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              maxLength={7}
              className={`${inputClass} max-w-[120px]`}
              placeholder="#000000"
            />
          </div>
        </div>
      </div>
      {!isValid && hex.length > 1 && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          Invalid hex color. Use format #RRGGBB.
        </p>
      )}
      {isValid && rgb && hsl && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-slate-500 dark:text-zinc-400">HEX</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-slate-800 dark:text-zinc-100">
                {hex.toUpperCase()}
              </span>
              <button
                className={btnSecondary}
                onClick={() => copy(hex.toUpperCase(), "hex")}
              >
                {copied === "hex" ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-slate-500 dark:text-zinc-400">RGB</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-slate-800 dark:text-zinc-100">
                rgb({rgb[0]}, {rgb[1]}, {rgb[2]})
              </span>
              <button
                className={btnSecondary}
                onClick={() =>
                  copy(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, "rgb")
                }
              >
                {copied === "rgb" ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              {(["R", "G", "B"] as const).map((ch, i) => (
                <label
                  key={ch}
                  className="flex flex-col gap-1 text-xs text-slate-500"
                >
                  {ch}
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[i]}
                    onChange={(e) =>
                      handleRgbChange(i as 0 | 1 | 2, Number(e.target.value))
                    }
                    className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-slate-500 dark:text-zinc-400">HSL</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-slate-800 dark:text-zinc-100">
                hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)
              </span>
              <button
                className={btnSecondary}
                onClick={() =>
                  copy(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`, "hsl")
                }
              >
                {copied === "hsl" ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Hash Generator ---
async function computeHash(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function HashGenerator() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopy();

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const hash = await computeHash(algorithm, input);
      setOutput(hash);
    } catch {
      setOutput("Error generating hash.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        Input Text
      </h2>
      <textarea
        className={textareaClass}
        rows={5}
        placeholder="Paste text to hash…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOutput("");
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option>SHA-256</option>
          <option>SHA-1</option>
          <option>SHA-512</option>
        </select>
        <button className={btnPrimary} onClick={generate} disabled={loading}>
          {loading ? "Generating\u2026" : "Generate Hash"}
        </button>
      </div>
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              {algorithm} Hash
            </h2>
            <button className={btnSecondary} onClick={() => copy(output, "hash")}>
              {copied === "hash" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "hash" ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}

// --- UUID Generator ---
function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const generate = () => {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
  };

  return (
    <div className={cardClass}>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-zinc-400">
          How many UUIDs?
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) =>
              setCount(Math.min(20, Math.max(1, Number(e.target.value))))
            }
            className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
        <button className={btnPrimary} onClick={generate}>
          Generate
        </button>
        {uuids.length > 0 && (
          <button
            className={btnSecondary}
            onClick={() => copy(uuids.join("\n"), "all-uuid")}
          >
            {copied === "all-uuid" ? <Check size={14} /> : <Copy size={14} />}
            {copied === "all-uuid" ? "Copied!" : "Copy all"}
          </button>
        )}
      </div>
      {uuids.length > 0 && (
        <div className="space-y-2">
          {uuids.map((uuid, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <span className="font-mono text-sm text-slate-800 dark:text-zinc-100">
                {uuid}
              </span>
              <button
                className={btnSecondary}
                onClick={() => copy(uuid, `uuid-${i}`)}
              >
                {copied === `uuid-${i}` ? (
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

export default function EncodeToolWorkspace({ tool }: { tool: EncodeTool }) {
  if (tool === "base64") return <Base64Tool />;
  if (tool === "url-encoder") return <UrlEncoder />;
  if (tool === "html-entities") return <HtmlEntities />;
  if (tool === "json-formatter") return <JsonFormatter />;
  if (tool === "number-base") return <NumberBase />;
  if (tool === "color-converter") return <ColorConverter />;
  if (tool === "hash-generator") return <HashGenerator />;
  if (tool === "uuid-generator") return <UuidGenerator />;
  return null;
}
