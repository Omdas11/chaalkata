"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLang } from "../lib/i18n";

const COMING_KEYS = [
  "pretwa",
  "dashGuti",
  "egaraGuti",
  "terhuchu1",
  "terhuchu3",
  "sumi",
  "sixteen",
] as const;

function HourglassMotif() {
  return (
    <svg className="card-motif" width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 6 L40 6 L24 23 Z" fill="none" stroke="#e0a526" strokeWidth="2.5" />
      <path d="M24 25 L8 42 L40 42 Z" fill="none" stroke="#e0a526" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="3" fill="#e0a526" />
    </svg>
  );
}

function SeedMotif() {
  return (
    <svg className="card-motif" width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="13" fill="none" stroke="#f1e9d8" strokeWidth="2.5" strokeDasharray="5 4" opacity="0.7" />
      <circle cx="24" cy="24" r="4" fill="#f1e9d8" opacity="0.5" />
    </svg>
  );
}

/** Left-right swipeable shelf: the playable game plus coming-soon cards.
 *  Card proportions follow the golden ratio (1 : 1.618). */
export default function GameCarousel() {
  const { t } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="carousel-wrap">
      <div className="carousel" ref={trackRef} role="list" aria-label={t.home.carouselTitle}>
        <Link
          href="/play/lau-kata-kati"
          className="game-card game-card--playable"
          role="listitem"
          aria-label={`${t.game.title} — ${t.home.play}`}
        >
          <HourglassMotif />
          <p className="eyebrow" style={{ margin: 0 }}>{t.game.region}</p>
          <h3 className="font-display">{t.game.title}</h3>
          <p className="font-body">{t.home.meta}</p>
          <p className="card-cta">
            <span className="btn-clay btn-clay--sm">{t.home.play} →</span>
          </p>
        </Link>

        {COMING_KEYS.map((key) => {
          const g: { name: string; note: string; blurb: string } = t.games[key];
          return (
            <div key={key} className="game-card" role="listitem" aria-disabled="true" aria-label={`${g.name} — ${t.home.soon}`}>
              <SeedMotif />
              <h3 className="font-display">{g.name}</h3>
              <p className="font-body">{g.blurb}</p>
              <p className="card-cta">
                <span className="stamp" style={{ fontSize: "0.7rem" }}>{t.home.soon}</span>
              </p>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "0.4rem" }}>
        <button className="btn-clay btn-clay--ghost btn-clay--sm" onClick={() => nudge(-1)} aria-label="←">
          ←
        </button>
        <button className="btn-clay btn-clay--ghost btn-clay--sm" onClick={() => nudge(1)} aria-label="→">
          →
        </button>
      </div>
    </div>
  );
}
