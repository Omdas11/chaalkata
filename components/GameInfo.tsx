import Link from "next/link";

/* Original explanatory diagrams for Lau Kata Kati. Hand-drawn SVGs,
 * chalk on soil, in the site's own visual language. */

const CHALK = "#f1e9d8";
const TURMERIC = "#e0a526";
const RED = "#b3261e";
const DARK = "#2b2724";
const PALE = "#d9cdb4";

function SetupDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M8 8 L34 36 L8 64 Z" fill="none" stroke={CHALK} strokeWidth="2" />
      <path d="M64 8 L38 36 L64 64 Z" fill="none" stroke={CHALK} strokeWidth="2" />
      <path d="M8 36 L21 36 M51 36 L64 36" stroke={CHALK} strokeWidth="2" />
      <circle cx="15" cy="20" r="4.5" fill={DARK} stroke={CHALK} strokeWidth="1.5" />
      <circle cx="15" cy="52" r="4.5" fill={DARK} stroke={CHALK} strokeWidth="1.5" />
      <circle cx="57" cy="20" r="4.5" fill={PALE} />
      <circle cx="57" cy="52" r="4.5" fill={PALE} />
      <circle cx="36" cy="36" r="4.5" fill="none" stroke={TURMERIC} strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

function StepDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M8 52 L64 52" stroke={CHALK} strokeWidth="2" />
      <circle cx="14" cy="52" r="7" fill={DARK} stroke={CHALK} strokeWidth="1.5" />
      <path d="M28 52 L50 52" stroke={TURMERIC} strokeWidth="2.5" />
      <path d="M50 52 l-9 -4 M50 52 l-9 4" stroke={TURMERIC} strokeWidth="2.5" />
      <circle cx="58" cy="52" r="4" fill="none" stroke={TURMERIC} strokeWidth="2" />
    </svg>
  );
}

function LeapDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M6 54 L66 54" stroke={CHALK} strokeWidth="2" />
      <circle cx="14" cy="54" r="7" fill={DARK} stroke={CHALK} strokeWidth="1.5" />
      <circle cx="36" cy="54" r="7" fill={PALE} />
      <circle cx="58" cy="54" r="4" fill="none" stroke={TURMERIC} strokeWidth="2" />
      <path d="M14 44 Q36 18 58 44" fill="none" stroke={TURMERIC} strokeWidth="2.5" strokeDasharray="5 3" />
      <path d="M58 44 l-9 -3 M58 44 l-4 -9" stroke={TURMERIC} strokeWidth="2.5" />
    </svg>
  );
}

function ChainDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <path d="M6 56 L66 56" stroke={CHALK} strokeWidth="2" />
      <circle cx="12" cy="56" r="6" fill={DARK} stroke={CHALK} strokeWidth="1.5" />
      <circle cx="30" cy="56" r="6" fill={PALE} />
      <circle cx="48" cy="56" r="6" fill={PALE} />
      <path d="M12 46 Q22 26 34 42" fill="none" stroke={TURMERIC} strokeWidth="2.5" />
      <path d="M34 42 Q46 24 60 40" fill="none" stroke={TURMERIC} strokeWidth="2.5" strokeDasharray="5 3" />
      <circle cx="62" cy="56" r="3.5" fill="none" stroke={TURMERIC} strokeWidth="2" />
      <text x="60" y="18" fill={TURMERIC} fontSize="13" fontFamily="Kalam, cursive">×2</text>
    </svg>
  );
}

function BlockedDiagram() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="22" fill="none" stroke={RED} strokeWidth="2" strokeDasharray="5 3" />
      <circle cx="36" cy="36" r="7" fill={DARK} stroke={CHALK} strokeWidth="1.5" />
      <circle cx="36" cy="16" r="5.5" fill={PALE} />
      <circle cx="36" cy="56" r="5.5" fill={PALE} />
      <circle cx="16" cy="36" r="5.5" fill={PALE} />
      <circle cx="56" cy="36" r="5.5" fill={PALE} />
    </svg>
  );
}

const STEPS: Array<{ title: string; text: string; Diagram: () => React.JSX.Element }> = [
  {
    title: "Line up",
    text: "Nine stones a side start packed into their own triangle. The shared centre point starts empty.",
    Diagram: SetupDiagram,
  },
  {
    title: "Step",
    text: "On your turn, slide one stone to a neighbouring empty point along a scratched line.",
    Diagram: StepDiagram,
  },
  {
    title: "Leap and cut",
    text: "Leap over an adjacent enemy stone onto the empty point behind it to capture it. Captures are compulsory — if you can cut, you must.",
    Diagram: LeapDiagram,
  },
  {
    title: "Keep leaping",
    text: "From the landing point, keep leaping while you can. The whole chain counts as one move.",
    Diagram: ChainDiagram,
  },
  {
    title: "No moves, no game",
    text: "If you have no legal move, you lose at once. Otherwise the side with more stones standing wins.",
    Diagram: BlockedDiagram,
  },
];

export function HowToPlay() {
  return (
    <section aria-labelledby="lkk-howto">
      <p className="eyebrow">
        How to play · <span className="font-bengali">কীভাবে খেলবেন</span>
      </p>
      <h2 id="lkk-howto" className="font-display">
        Five steps to your first cut
      </h2>
      <ol className="howto-steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <s.Diagram />
            <p>
              <strong className="font-hand" style={{ color: TURMERIC, fontSize: "1.1rem" }}>
                {i + 1}. {s.title}.{" "}
              </strong>
              {s.text}
            </p>
          </li>
        ))}
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
  return (
    <section aria-labelledby="lkk-roots">
      <p className="eyebrow">
        Roots · <span className="font-bengali">ইতিহাস</span>
      </p>
      <h2 id="lkk-roots" className="font-display">
        Where this game comes from
      </h2>
      <p>
        Lau Kata Kati — <span className="font-bengali">লাউ কাটা কাটি</span> — is
        traditionally played in Lower Bengal, where it is also recorded under
        the name Kowwu Dunki. Nine stones a side face off across a butterfly
        board: two triangles sharing a single apex, captures compulsory.
      </p>
      <p>
        It belongs to the Alquerque family of leap-capture games — the old
        family that draughts also comes from.
      </p>
      <p className="font-label" style={{ opacity: 0.75 }}>
        Sources:{" "}
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
  return (
    <section aria-labelledby="lkk-family">
      <p className="eyebrow">The family</p>
      <h2 id="lkk-family" className="font-display">
        More cousins, coming soon
      </h2>
      <p className="font-body" style={{ opacity: 0.85 }}>
        Seven more Alquerque-family games are on the bench — Pretwa, Dash-Guti,
        Egara-Guti, two Terhüchü boards, the Sümi Naga war game, and Sixteen
        Soldiers.
      </p>
      <p>
        <Link href="/#more-games" className="row-action" style={{ display: "inline-flex" }}>
          <span className="arr">←</span> See all upcoming games
        </Link>
      </p>
    </section>
  );
}
