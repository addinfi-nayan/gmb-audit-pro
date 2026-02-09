"use client";

import React from "react";
import { useTheme } from "../app/providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/10 bg-white/5 text-xs text-gray-200 hover:bg-white/10 hover:border-cyan-500/40 transition"
      aria-label="Toggle color theme"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          isDark ? "bg-yellow-400/80" : "bg-slate-800"
        }`}
      >
        {isDark ? <span className="text-[10px]">☀️</span> : <span className="text-[10px]">🌙</span>}
      </span>
    </button>
  );
}

