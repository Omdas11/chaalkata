"use client";

import GamosaStrip from "./GamosaStrip";
import { useLang } from "../lib/i18n";

const GITHUB = "https://github.com/Omdas11/chaalkata";

/** Site footer: credit, source link, and the originality disclaimer. */
export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <GamosaStrip />
      <p className="font-hand" style={{ fontSize: "1.05rem", color: "var(--chalk)" }}>
        {t.footer.tagline}
      </p>
      <p>
        <a href={GITHUB} target="_blank" rel="noreferrer">{t.footer.source}</a>
      </p>
      <p className="font-label" style={{ opacity: 0.75 }}>
        {t.footer.disclaimer}
      </p>
    </footer>
  );
}
