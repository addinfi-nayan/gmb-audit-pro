"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { SessionProvider } from "next-auth/react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Initialize theme from localStorage / system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("theme") as Theme | null;
    let initial: Theme = "dark";

    if (stored === "light" || stored === "dark") {
      initial = stored;
    } else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      initial = "light";
    }

    setThemeState(initial);
  }, []);

  // Apply theme to <html> / <body> and persist
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    root.dataset.theme = theme;
    body.dataset.theme = theme;

    root.classList.toggle("dark", theme === "dark");

    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // ignore write errors
    }
  }, [theme]);

  const setTheme = (value: Theme) => setThemeState(value);
  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}