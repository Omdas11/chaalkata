"use client";

import { useEffect, useState } from "react";
import GamosaStrip from "./GamosaStrip";
import Icon from "./Icon";
import { useLang } from "../lib/i18n";

const GITHUB = "https://github.com/Omdas11/chaalkata";

/** Site footer: credit, source link, visitor counter, originality disclaimer. */
export default function Footer() {
  const { t } = useLang();
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/visits", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && typeof j.count === "number") setVisits(j.count);
      })
      .catch(() => {
        /* backend not configured: counter stays hidden */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <footer className="site-footer">
      <GamosaStrip />
      <p className="font-hand" style={{ fontSize: "1.05rem", color: "var(--chalk)" }}>
        {t.footer.tagline}
      </p>
      <p>
        <a href={GITHUB} target="_blank" rel="noreferrer">{t.footer.source}</a>
      </p>
      {visits !== null && (
        <p className="font-label" style={{ color: "var(--turmeric)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.45rem" }}>
          <Icon name="eye" size={16} />
          {t.footer.visits(visits)}
        </p>
      )}
      <p className="font-label" style={{ opacity: 0.75 }}>
        {t.footer.disclaimer}
      </p>
    </footer>
  );
}
