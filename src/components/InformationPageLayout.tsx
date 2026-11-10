"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/components/ThemeProvider";
import type { ReactNode } from "react";

export default function InformationPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { darkMode, toggleTheme } = useTheme();
  const themeClass = darkMode
    ? "dark bg-[#0b0c10] text-[#fafafa]"
    : "bg-[#f8fafc] text-[#0f172a]";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClass}`}>
      <Navbar darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className="mx-auto max-w-[960px] px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <header className="mb-9 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-zinc-400">
            Zunvox · Information
          </p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-[-0.06em]">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base dark:text-[#a1a1aa]">
            {description}
          </p>
        </header>
        <div className="space-y-5">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function InformationSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 dark:text-[#a1a1aa]">
        {children}
      </div>
    </section>
  );
}
