"use client";

import Link from "next/link";
import { useLang } from "../lib/i18n";

/* Original explanatory diagrams for Lau Kata Kati. Hand-drawn SVGs,
 * soil-ink on leaf, in the site's own visual language. */

const LINE = "#241a10";
const AMBER = "#b45309";
const RED = "#b3261e";
const DARK = "#241a10";
const PALE = "#f7f2e2";

function SetupDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M8 8 L34 36 L8 64 Z" fill="none" stroke={LINE} strokeWidth="2" />
      <path d="M64 8 L38 36 L64 64 Z" fill="none" stroke={LINE} strokeWidth="2" />
      <path d="M8 36 L21 36 M51 36 L64 36" stroke={LINE} strokeWidth="2" />
      <circle cx="15" cy="20" r="4.5" fill={DARK} />
      <circle cx="15" cy="52" r="4.5" fill={DARK} />
      <circle cx="57" cy="20" r="4.5" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="57" cy="52" r="4.5" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="36" cy="36" r="4.5" fill="none" stroke={AMBER} strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

function StepDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M8 52 L64 52" stroke={LINE} strokeWidth="2" />
      <circle cx="14" cy="52" r="7" fill={DARK} />
      <path d="M28 52 L50 52" stroke={AMBER} strokeWidth="2.5" />
      <path d="M50 52 l-9 -4 M50 52 l-9 4" stroke={AMBER} strokeWidth="2.5" />
      <circle cx="58" cy="52" r="4" fill="none" stroke={AMBER} strokeWidth="2" />
    </svg>
  );
}

function LeapDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M6 54 L66 54" stroke={LINE} strokeWidth="2" />
      <circle cx="14" cy="54" r="7" fill={DARK} />
      <circle cx="36" cy="54" r="7" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="58" cy="54" r="4" fill="none" stroke={AMBER} strokeWidth="2" />
      <path d="M14 44 Q36 18 58 44" fill="none" stroke={AMBER} strokeWidth="2.5" strokeDasharray="5 3" />
      <path d="M58 44 l-9 -3 M58 44 l-4 -9" stroke={AMBER} strokeWidth="2.5" />
    </svg>
  );
}

function ChainDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M6 56 L66 56" stroke={LINE} strokeWidth="2" />
      <circle cx="12" cy="56" r="6" fill={DARK} />
      <circle cx="30" cy="56" r="6" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="48" cy="56" r="6" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <path d="M12 46 Q22 26 34 42" fill="none" stroke={AMBER} strokeWidth="2.5" />
      <path d="M34 42 Q46 24 60 40" fill="none" stroke={AMBER} strokeWidth="2.5" strokeDasharray="5 3" />
      <circle cx="62" cy="56" r="3.5" fill="none" stroke={AMBER} strokeWidth="2" />
      <text x="60" y="18" fill={AMBER} fontSize="13" fontFamily="Kalam, cursive">×2</text>
    </svg>
  );
}

function BlockedDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="22" fill="none" stroke={RED} strokeWidth="2" strokeDasharray="5 3" />
      <circle cx="36" cy="36" r="7" fill={DARK} />
      <circle cx="36" cy="16" r="5.5" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="36" cy="56" r="5.5" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="16" cy="36" r="5.5" fill={PALE} stroke={LINE} strokeWidth="1.5" />
      <circle cx="56" cy="36" r="5.5" fill={PALE} stroke={LINE} strokeWidth="1.5" />
    </svg>
  );
}

const DIAGRAMS = [SetupDiagram, StepDiagram, LeapDiagram, ChainDiagram, BlockedDiagram];

export function HowToPlay() {
  const { t } = useLang();
  return (
    <section aria-labelledby="lkk-howto">
      <p className="eyebrow">{t.howto.eyebrow}</p>
      <h2 id="lkk-howto" className="font-display">
        {t.howto.title}
      </h2>
      <ol className="howto-steps">
        {t.howto.steps.map((s, i) => {
          const Diagram = DIAGRAMS[i];
          return (
            <li key={s.title}>
              <Diagram />
              <p>
                <strong className="font-hand" style={{ color: "#1e3d1a", fontSize: "1.1rem" }}>
                  {i + 1}. {s.title}.{" "}
                </strong>
                {s.text}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const SOURCES: Array<[string, string]> = [
  ["Wikipedia", "https://en.wikipedia.org/wiki/Lau_kata_kati"],
  ["Ludii", "https://ludii.games/details.php?keyword=Lau%20kata%20kati"],
  ["bead.game", "https://www.bead.game/games/traditional/lau-kata-kati"],
  ["whatdowedoallday", "https://www.whatdowedoallday.com/lau-kata-kati/"],
];

export function HistoryBlurb() {
  const { t } = useLang();
  return (
    <section aria-labelledby="lkk-roots">
      <p className="eyebrow">{t.history.eyebrow}</p>
      <h2 id="lkk-roots" className="font-display">
        {t.history.title}
      </h2>
      <p>{t.history.p1}</p>
      <p>{t.history.p2}</p>
      <p className="font-label" style={{ opacity: 0.75 }}>
        {t.history.sources}{" "}
        {SOURCES.map(([name, url], i) => (
          <span key={name}>
            {i > 0 && " · "}
            <a href={url} target="_blank" rel="noreferrer">
              {name}
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}

export function FamilyLinks() {
  const { t } = useLang();
  return (
    <section aria-labelledby="lkk-family">
      <p className="eyebrow">{t.family.eyebrow}</p>
      <h2 id="lkk-family" className="font-display">
        {t.family.title}
      </h2>
      <p className="font-body" style={{ opacity: 0.85 }}>
        {t.family.text}
      </p>
      <p>
        <Link href="/#more-games" className="row-action" style={{ display: "inline-flex" }}>
          <span className="arr">←</span> {t.family.seeAll}
        </Link>
      </p>
    </section>
  );
}
