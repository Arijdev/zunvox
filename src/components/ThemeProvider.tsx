"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

type ThemeContextValue = {
  darkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "Zunvox-theme";
const LEGACY_THEME_STORAGE_KEY = "Kurox-theme";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("Zunvox-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("Zunvox-theme-change", callback);
  };
}

function getThemeSnapshot() {
  const preference =
    window.localStorage.getItem(THEME_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  return preference !== "light";
}

function getServerThemeSnapshot() {
  return true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const darkMode = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);

  const value = useMemo(
    () => ({
      darkMode,
      toggleTheme() {
        window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "light" : "dark");
        window.dispatchEvent(new Event("Zunvox-theme-change"));
      },
    }),
    [darkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used within ThemeProvider.");
  return theme;
}
