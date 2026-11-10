"use client";

import {
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/app/JsonLd";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/components/ThemeProvider";

type FAQ = { question: string; answer: string };
type RelatedTool = { href: string; title: string; description: string };

type ToolWorkspaceLayoutProps = {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  workspace: ReactNode;
  steps: string[];
  features: string[];
  faqs: FAQ[];
  relatedTools: RelatedTool[];
};

export default function ToolWorkspaceLayout({
  title,
  description,
  icon,
  path,
  workspace,
  steps,
  features,
  faqs,
  relatedTools,
}: ToolWorkspaceLayoutProps) {
  const { darkMode, toggleTheme } = useTheme();
  const pageUrl = new URL(path, siteUrl).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: title,
        description,
        url: pageUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any modern web browser",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-[#0b0c10] text-[#fafafa]" : "bg-[#f8fafc] text-slate-950"}`}>
      <JsonLd data={structuredData} />
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />
      <main className="mx-auto max-w-[1120px] px-4 pb-20 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden pb-10 pt-12 sm:pb-14 sm:pt-16">
          <div className="cyber-grid pointer-events-none absolute inset-x-0 top-0 h-96" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#008B99]/25 bg-[#008B99]/[0.07] px-3 py-2 text-[11px] font-semibold text-[#006b75] dark:border-[#00F0FF]/25 dark:bg-[#00F0FF]/[0.08] dark:text-[#00F0FF]">
              <ShieldCheck size={14} aria-hidden="true" />
              100% Client-Side / Private
            </div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200" aria-hidden="true">
                {icon}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                Zunvox browser utility
              </span>
            </div>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.06em]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-[#a1a1aa]">
              {description}
            </p>
          </div>
        </header>

        <section aria-label={`${title} workspace`} className="scroll-mt-24">
          {workspace}
        </section>

        <section aria-labelledby="how-to-heading" className="mt-16">
          <h2 id="how-to-heading" className="text-2xl font-semibold tracking-tight">
            How to use {title}
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)]">
                  <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700 dark:text-zinc-300">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features-heading" className="mt-14">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
            Private, fast, and easy to use
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)] dark:text-zinc-300">
                <Check size={17} className="mt-0.5 shrink-0 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="mt-14">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-5 space-y-3">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group rounded-xl border border-slate-200 bg-white px-4 py-4 open:border-slate-300 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)] dark:open:border-zinc-700">
                <summary className="min-h-6 cursor-pointer text-sm font-semibold marker:text-slate-500 dark:marker:text-zinc-400">
                  {question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-[#a1a1aa]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section id="related-tools" aria-labelledby="related-heading" className="mt-14">
          <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
            Explore more Zunvox tools
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.7)] dark:hover:border-zinc-700"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {tool.title}
                  <ArrowRight size={15} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 dark:text-zinc-400" />
                </span>
                <span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-[#a1a1aa]">
                  {tool.description}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <LockKeyhole size={13} aria-hidden="true" />
            Your files are processed on your device, not uploaded to Zunvox.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
