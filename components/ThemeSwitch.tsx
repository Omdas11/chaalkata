"use client";

import { THEMES, useTheme, type ThemeId } from "../lib/theme";
import { useLang } from "../lib/i18n";

/** Three-way theme picker for the drawer: soil / canopy / night. */
export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  return (
    <div className="theme-switch" role="radiogroup" aria-label={t.menu.theme}>
      {THEMES.map((id: ThemeId) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`theme-pick${active ? " theme-pick--active" : ""} theme-pick--${id}`}
            onClick={() => setTheme(id)}
            title={t.themes[id].desc}
          >
            <span className="theme-pick__swatch" aria-hidden="true" />
            <span className="theme-pick__name">{t.themes[id].name}</span>
          </button>
        );
      })}
    </div>
  );
}
