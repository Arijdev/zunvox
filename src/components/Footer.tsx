import { LockKeyhole } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { href: "/tools/image-compressor", label: "Image compressor" },
  { href: "/tools/pdf-to-word", label: "PDF to Word" },
  { href: "/tools/ocr", label: "OCR" },
  { href: "/tools/summarize", label: "AI summarizer" },
  { href: "/tools/vault", label: "Zunvox Vault" },
];

const informationLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/feedback", label: "Feedback" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-zinc-800">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 text-xs text-slate-600 sm:grid-cols-[1fr_auto] sm:items-center sm:px-8">
        <div>
          <Link href="/" className="font-semibold tracking-wide text-slate-800 dark:text-slate-200">
            Zunvox
          </Link>
          <nav aria-label="Footer links" className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {[...footerLinks, ...informationLinks].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="min-h-11 inline-flex items-center hover:text-slate-950 dark:hover:text-zinc-50"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="inline-flex items-center gap-2 text-slate-600 dark:text-[#a1a1aa]">
          <LockKeyhole size={13} aria-hidden="true" /> Private by design · Runs in your browser
        </span>
      </div>
    </footer>
  );
}
