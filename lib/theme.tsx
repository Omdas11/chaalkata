"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeId = "raat" | "jungle" | "alo";
export const THEMES: ThemeId[] = ["raat", "jungle", "alo"];

const KEY = "ck-theme";

/** Maps retired theme ids (soil/canopy/night) to the new set. */
function migrate(v: string | null): ThemeId | null {
  if (v === "raat" || v === "jungle" || v === "alo") return v;
  if (v === "soil") return "raat";
  if (v === "canopy") return "jungle";
  if (v === "night") return "raat";
  return null;
}

function readTheme(): ThemeId {
  try {
    return migrate(localStorage.getItem(KEY)) ?? "raat";
  } catch {
    return "raat";
  }
}

const ThemeCtx = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void }>({
  theme: "raat",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("raat");

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
