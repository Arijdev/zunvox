"use client";

import {
  ArrowRight,
  Combine,
  FileImage,
  FileStack,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
  Maximize2,
  Minimize2,
  ScanText,
  Scissors,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import HeroUtilitiesGraphic from "@/components/HeroUtilitiesGraphic";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/components/ThemeProvider";
import { faqItems } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { utilityTools, type UtilityCategory } from "@/lib/utility-tools";
import JsonLd from "./JsonLd";

const categoryOrder: UtilityCategory[] = [
  "Compress",
  "Convert",
  "Organize",
  "AI & Privacy",
];

const icons = [
  Minimize2,
  FileText,
  FileStack,
  FileImage,
  FileText,
  WandSparkles,
  ImageIcon,
  FileImage,
  Maximize2,
  Maximize2,
  Combine,
  Scissors,
  ScanText,
  Sparkles,
  LockKeyhole,
];

export default function Home() {
  const { darkMode, toggleTheme } = useTheme();
  const themeClass = darkMode
    ? "dark bg-[#0b0c10] text-[#fafafa]"
    : "bg-[#f8fafc] text-[#0f172a]";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": new URL("/#faq", siteUrl).toString(),
    url: new URL("/", siteUrl).toString(),
    inLanguage: "en",
    mainEntity: faqItems.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClass}`}>
      <JsonLd data={structuredData} />
      <Navbar darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden pb-12 pt-12 sm:pb-16 sm:pt-20">
          <div className="cyber-grid pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
          <div className="relative grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-14">
            <div className="home-hero-left mx-auto w-full max-w-2xl text-center md:mx-0 md:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#008B99]/25 bg-[#008B99]/[0.07] px-3.5 py-2 text-[11px] font-semibold text-[#006b75] dark:border-[#00F0FF]/25 dark:bg-[#00F0FF]/[0.08] dark:text-[#00F0FF]">
                <ShieldCheck size={14} aria-hidden="true" />
                100% CLIENT-SIDE · ZERO FILE UPLOADS
              </div>
              <h1 className="text-[clamp(2.35rem,5.2vw,4.6rem)] font-semibold leading-[1.04] tracking-[-0.065em]">
                Fast client-side tools for private file work.
              </h1>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base dark:text-[#a1a1aa]">
                Compress, convert, organize, and protect files right in your
                browser. No server uploads, no account, and no waiting in line.
              </p>
              <a
                href="#tools"
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#007783] px-5 text-sm font-semibold text-white shadow-md transition hover:bg-[#006b75] active:scale-95 dark:bg-[#00F0FF] dark:text-[#071014] dark:hover:bg-cyan-200"
              >
                Explore all tools <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="home-hero-right">
              <HeroUtilitiesGraphic />
            </div>
          </div>
        </section>

        <section id="tools" aria-labelledby="tools-heading" className="home-fade-up scroll-mt-28">
          <div className="home-fade-up mb-9">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.17em] text-slate-500 dark:text-zinc-400">
              The Zunvox toolbox
            </p>
            <h2
              id="tools-heading"
              className="text-[clamp(1.7rem,4vw,2.4rem)] font-semibold tracking-[-0.05em]"
            >
              Private PDF tools and secure AI processing
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#a1a1aa]">
              Choose from Zunvox&apos;s client-side utility suite for private
              PDFs, secure AI document processing, OCR, and more. Your files
              stay on this device.
            </p>
          </div>

          <div className="space-y-10">
            {categoryOrder.map((category) => {
              const tools = utilityTools.filter((tool) => tool.category === category);
              return (
                <section key={category} aria-labelledby={`category-${category}`}>
                  <h3
                    id={`category-${category}`}
                    className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
                  >
                    {category}
                  </h3>
                  <div className="home-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool) => {
                      const index = utilityTools.indexOf(tool);
                      const Icon = icons[index];
                      return (
                        <Link
                          key={tool.slug}
                          href={`/tools/${tool.slug}`}
                          className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99] sm:p-5 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.72)] dark:hover:border-zinc-700"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                            <Icon size={20} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                              {tool.title}
                              <ArrowRight
                                size={15}
                                className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="mt-2 block text-xs leading-5 text-slate-600 dark:text-[#a1a1aa]">
                              {tool.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="home-fade-up mt-16 grid gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-7 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.72)]"
        >
          <div>
            <h2 id="about-heading" className="text-xl font-semibold tracking-tight">
              Useful tools, without the detour
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-[#a1a1aa]">
              Zunvox brings everyday file tasks and on-device AI into one
              straightforward workspace. Open any tool directly, process a file,
              then download your result.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            {[
              ["15", "dedicated tools"],
              ["0", "bytes uploaded"],
              ["Free", "no account"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="font-bold">{value}</span>
                <span className="ml-1.5 text-slate-500 dark:text-[#a1a1aa]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="privacy"
          aria-labelledby="privacy-heading"
          className="home-fade-up mt-5 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.72)]"
        >
          <LockKeyhole
            size={20}
            className="mt-0.5 shrink-0 text-slate-600 dark:text-zinc-300"
            aria-hidden="true"
          />
          <div>
            <h2 id="privacy-heading" className="text-sm font-semibold">
              Your files stay yours
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-zinc-300">
              File processing happens locally in your browser. The AI and OCR
              tools may download their models or language data, but do not send
              your documents to a Zunvox server.
            </p>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-heading" className="home-fade-up mt-14">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
            Zunvox privacy and file-processing FAQs
          </h2>
          <div className="home-stagger mt-5 space-y-3">
            {faqItems.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-xl border border-slate-200 bg-white px-4 py-4 open:border-slate-300 dark:border-zinc-800 dark:bg-[rgba(24,24,27,0.72)] dark:open:border-zinc-700"
              >
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
      </main>

      <Footer />
    </div>
  );
}
