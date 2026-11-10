"use client";

import dynamic from "next/dynamic";
import type { AiTab } from "@/app/AiToolsModule";

const AiToolsModule = dynamic(() => import("@/app/AiToolsModule"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-[#a1a1aa]" role="status">
      Loading on-device AI tools…
    </div>
  ),
});

export default function AiToolWorkspace({ initialTab }: { initialTab: AiTab }) {
  return <AiToolsModule initialTab={initialTab} />;
}
