"use client";

import { FileStack, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavbarProps = {
  darkMode: boolean;
  onToggleTheme: () => void;
};

const informationLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/feedback", label: "Feedback" },
] as const;

export default function Navbar({ darkMode, onToggleTheme }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-2 z-40 mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
      <div className="flex min-h-[68px] items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-[rgba(248,250,252,0.9)] px-3 shadow-sm backdrop-blur-xl sm:px-5 dark:border-zinc-800 dark:bg-[rgba(11,12,16,0.86)]">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyber"
          aria-label="Zunvox home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-slate-200 bg-slate-100 text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            <FileStack size={21} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-[17px] font-bold tracking-[-0.045em]">
            Zunvox<span className="text-slate-500 dark:text-zinc-400">.</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Information"
        >
          {informationLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-12 items-center rounded-full px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300/80 text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300/80 text-slate-700 transition hover:bg-slate-100 active:scale-95 md:hidden dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Open information menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-information"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <nav
            id="mobile-information"
            aria-label="Information"
            className="mobile-drawer absolute inset-y-0 right-0 flex w-[min(88vw,400px)] flex-col border-l border-slate-200 bg-[#f8fafc] p-5 shadow-2xl dark:border-zinc-800 dark:bg-[#09090b]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-zinc-800">
              <span className="text-sm font-semibold">Zunvox information</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/70 active:scale-95 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="Close information menu"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 grid gap-2">
              {informationLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-14 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
