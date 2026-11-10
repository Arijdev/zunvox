import {
  ArrowRight,
  FileImage,
  FileText,
  LockKeyhole,
  Minimize2,
  ScanText,
  ShieldCheck,
} from "lucide-react";

export default function HeroUtilitiesGraphic() {
  return (
    <div
      role="img"
      aria-label="Zunvox tools for compressing, converting, scanning, and protecting files on your device"
      className="relative mx-auto flex min-h-[330px] w-full max-w-[520px] items-center justify-center sm:min-h-[380px]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 520 380"
        className="absolute inset-0 h-full w-full text-[#b8c5c2] dark:text-zinc-700"
        fill="none"
      >
        <path
          d="M142 112 224 155M378 103 300 151M154 278 225 230M366 270 299 228"
          stroke="currentColor"
          strokeDasharray="4 7"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <circle cx="142" cy="112" r="3" fill="currentColor" />
        <circle cx="378" cy="103" r="3" fill="currentColor" />
        <circle cx="154" cy="278" r="3" fill="currentColor" />
        <circle cx="366" cy="270" r="3" fill="currentColor" />
      </svg>

      <div className="relative grid h-64 w-64 place-items-center sm:h-72 sm:w-72">
        <div
          aria-hidden="true"
          className="absolute inset-5 rounded-full bg-[#007783]/[0.06] dark:bg-[#00F0FF]/[0.05]"
        />
        <div className="relative w-40 rotate-[-5deg] rounded-[1.35rem] bg-[#fffefa] p-4 shadow-[0_20px_55px_-24px_rgba(38,35,28,0.36)] ring-1 ring-[#e8e4da] sm:w-44 sm:p-5 dark:bg-zinc-800 dark:ring-zinc-700">
          <div className="flex items-center justify-between">
            <span className="grid size-9 place-items-center rounded-xl bg-[#007783]/10 text-[#007783] dark:bg-[#00F0FF]/10 dark:text-[#00F0FF]">
              <FileText size={18} aria-hidden="true" />
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              READY
            </span>
          </div>
          <div className="mt-5 space-y-2.5" aria-hidden="true">
            <div className="h-2 w-3/4 rounded-full bg-[#dcd8ce] dark:bg-zinc-600" />
            <div className="h-1.5 w-full rounded-full bg-[#eeece6] dark:bg-zinc-700" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#eeece6] dark:bg-zinc-700" />
            <div className="h-1.5 w-2/3 rounded-full bg-[#eeece6] dark:bg-zinc-700" />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[#ebe8e0] pt-3 dark:border-zinc-700">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
              Processed locally
            </span>
            <ShieldCheck
              size={16}
              className="text-[#007783] dark:text-[#00F0FF]"
              aria-hidden="true"
            />
          </div>
        </div>

        <span className="absolute left-0 top-7 grid size-12 place-items-center rounded-2xl bg-[#e7f2ef] text-[#007783] shadow-sm sm:left-2 sm:top-8 dark:bg-zinc-800 dark:text-[#00F0FF]">
          <Minimize2 size={20} aria-hidden="true" />
        </span>
        <span className="absolute right-0 top-5 grid size-12 place-items-center rounded-2xl bg-[#f1eee7] text-slate-700 shadow-sm sm:right-1 sm:top-6 dark:bg-zinc-800 dark:text-zinc-200">
          <ScanText size={20} aria-hidden="true" />
        </span>
        <span className="absolute bottom-5 left-2 grid size-12 place-items-center rounded-2xl bg-[#f1eee7] text-slate-700 shadow-sm sm:bottom-7 sm:left-3 dark:bg-zinc-800 dark:text-zinc-200">
          <FileImage size={20} aria-hidden="true" />
        </span>
        <span className="absolute bottom-4 right-1 grid size-12 place-items-center rounded-2xl bg-[#e7f2ef] text-[#007783] shadow-sm sm:bottom-6 sm:right-2 dark:bg-zinc-800 dark:text-[#00F0FF]">
          <LockKeyhole size={20} aria-hidden="true" />
        </span>
        <span
          aria-hidden="true"
          className="absolute -right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-[#007783] text-white shadow-md dark:bg-[#00F0FF] dark:text-[#071014]"
        >
          <ArrowRight size={15} />
        </span>
      </div>
    </div>
  );
}
