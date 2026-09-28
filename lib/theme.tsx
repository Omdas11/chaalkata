"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeId = "soil" | "canopy" | "night";
export const THEMES: ThemeId[] = ["soil", "canopy", "night"];

const KEY = "ck-theme";

function readTheme(): ThemeId {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "soil" || v === "canopy" || v === "night") return v;
  } catch {
    /* ignore */
  }
  return "soil";
}

const ThemeCtx = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void }>({
  theme: "soil",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("soil");

  useEffect(() => {
    setThemeState(readTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme: setThemeState }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
