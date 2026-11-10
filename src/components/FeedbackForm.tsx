"use client";

import { useState, type FormEvent } from "react";

export default function FeedbackForm() {
  const [kind, setKind] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);

  async function copyFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setFailed(false);

    const feedback = `Zunvox feedback — ${kind}\n\n${message.trim()}`;
    try {
      await navigator.clipboard.writeText(feedback);
      setStatus("Feedback copied. You can now paste it wherever you choose to send it.");
    } catch {
      setFailed(true);
      setStatus("Clipboard access is unavailable. Select your message and copy it manually.");
    }
  }

  return (
    <form
      onSubmit={(event) => void copyFeedback(event)}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]"
    >
      <label htmlFor="feedback-kind" className="block text-sm font-semibold">
        Feedback type
      </label>
      <select
        id="feedback-kind"
        value={kind}
        onChange={(event) => setKind(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f8fafc] px-3 text-sm dark:border-zinc-800 dark:bg-[#18181b]"
      >
        <option>Suggestion</option>
        <option>Bug report</option>
        <option>Usability feedback</option>
        <option>Other</option>
      </select>

      <label htmlFor="feedback-message" className="mt-5 block text-sm font-semibold">
        Your message
      </label>
      <textarea
        id="feedback-message"
        required
        minLength={5}
        maxLength={5000}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Tell us what worked well or what could be better…"
        className="mt-2 min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 text-sm leading-6 outline-none focus:border-[#008B99] dark:border-zinc-800 dark:bg-[#18181b] dark:focus:border-[#00F0FF]"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-[#a1a1aa]">
          {message.length} / 5000
        </span>
        <button
          type="submit"
          disabled={message.trim().length < 5}
          className="min-h-12 rounded-xl bg-[#007783] px-5 text-sm font-semibold text-white transition hover:bg-[#006b75] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
        >
          Copy feedback
        </button>
      </div>
      {status && (
        <p
          role={failed ? "alert" : "status"}
          className={`mt-4 rounded-lg border p-3 text-sm leading-6 ${
            failed
              ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-300/20 dark:bg-amber-300/[0.06] dark:text-amber-200"
              : "border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          }`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
