"use client";

import { useLang, type Lang } from "../lib/i18n";

/** One-tap language switch. Shows a single language at a time across the UI. */
export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label={t.langLabel}>
      {(["en", "bn"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          title={l === "en" ? "English" : "বাংলা"}
        >
          {l === "en" ? "EN" : "বাং"}
        </button>
      ))}
      <span className="sr-only">{t.langToggle}</span>
    </div>
  );
}
