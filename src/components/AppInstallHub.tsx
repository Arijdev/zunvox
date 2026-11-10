"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Download, Monitor, Smartphone } from "lucide-react";

type InstallPlatform = "windows" | "android" | "ios";
type PromptChoice = { outcome: "accepted" | "dismissed"; platform: string };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<PromptChoice>;
};

const platforms: {
  id: InstallPlatform;
  title: string;
  subtitle: string;
  instructions: string[];
  icon: typeof Monitor;
}[] = [
  {
    id: "windows",
    title: "Windows",
    subtitle: "Install from Microsoft Edge or Google Chrome",
    instructions: [
      "Open Zunvox in Edge or Chrome.",
      "Select the Install icon in the address bar, or open the browser menu.",
      "Choose Install Zunvox and confirm.",
    ],
    icon: Monitor,
  },
  {
    id: "android",
    title: "Android",
    subtitle: "Add Zunvox to your home screen",
    instructions: [
      "Open this website in Chrome on your Android device.",
      "Tap the browser menu.",
      "Choose Install app or Add to Home screen and confirm.",
    ],
    icon: Smartphone,
  },
  {
    id: "ios",
    title: "iPhone / iPad",
    subtitle: "Add Zunvox from Safari",
    instructions: [
      "Open this website in Safari on your iPhone or iPad.",
      "Tap the Share button.",
      "Choose Add to Home Screen, then tap Add.",
    ],
    icon: Smartphone,
  },
];

function getCurrentPlatform(): InstallPlatform | null {
  const userAgent = navigator.userAgent;
  if (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/i.test(userAgent)) return "android";
  if (/Windows/i.test(userAgent)) return "windows";
  return null;
}

function subscribeToPlatform() {
  return () => {};
}

function getInstalledState() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function subscribeToInstalledState(onChange: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    displayMode.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

export default function AppInstallHub() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const currentPlatform = useSyncExternalStore(
    subscribeToPlatform,
    getCurrentPlatform,
    () => null,
  );
  const installed = useSyncExternalStore(
    subscribeToInstalledState,
    getInstalledState,
    () => false,
  );
  const [openGuide, setOpenGuide] = useState<InstallPlatform | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setStatus("Zunvox has been installed on this device.");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installOrShowGuide(platform: InstallPlatform) {
    setStatus("");
    if (installed && currentPlatform === platform) {
      setStatus("Zunvox is already installed on this device.");
      return;
    }

    if (platform === currentPlatform && installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setInstallPrompt(null);
        setStatus(
          choice.outcome === "accepted"
            ? "Zunvox is being installed."
            : "Installation was dismissed. You can install Zunvox from your browser menu.",
        );
      } catch {
        setInstallPrompt(null);
        setOpenGuide(platform);
        setStatus(
          "Your browser could not open the install prompt. Follow the steps below to install from its menu.",
        );
      }
      return;
    }

    setOpenGuide((current) => (current === platform ? null : platform));
  }

  return (
    <div>
      <p>
        Install Zunvox as a Progressive Web App (PWA) from your browser. It adds
        the same client-side suite to your app launcher or home screen; these are
        not separate Electron or Capacitor installers.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map(({ id, title, subtitle, instructions, icon: Icon }) => {
          const isInstalled = installed && currentPlatform === id;
          const isOpen = openGuide === id;
          return (
            <section
              key={id}
              className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5 dark:border-zinc-800 dark:bg-[#12131c]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-slate-700 shadow-sm dark:bg-zinc-900 dark:text-[#fafafa]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#fafafa]">
                    {title}
                  </h3>
                  <p className="text-xs leading-5 text-slate-600 dark:text-[#a1a1aa]">
                    {subtitle}
                  </p>
                </div>
              </div>
              <button
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#007783] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#006b75] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006b75] dark:bg-[#00f0ff] dark:text-[#0b0c10] dark:hover:bg-[#76f7ff] dark:focus-visible:outline-[#00f0ff]"
                type="button"
                aria-expanded={isOpen}
                onClick={() => void installOrShowGuide(id)}
              >
                {isInstalled ? (
                  <>
                    <Check size={16} aria-hidden="true" />
                    Installed
                  </>
                ) : id === currentPlatform && installPrompt ? (
                  <>
                    <Download size={16} aria-hidden="true" />
                    Install Zunvox
                  </>
                ) : (
                  <>How to install</>
                )}
              </button>
              {isOpen && (
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-[#a1a1aa]">
                  {instructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-[#a1a1aa]">
        {status ||
          "For the automatic install prompt, open this page in the browser on the device where you want to install Zunvox. On iPhone and iPad, use Safari’s Share menu."}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-400">
        Zunvox runs as a browser-based PWA; AI and OCR may still need an internet
        connection to download their models or language data.
      </p>
    </div>
  );
}
