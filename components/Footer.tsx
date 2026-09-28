import GamosaStrip from "./GamosaStrip";

const GITHUB = "https://github.com/Omdas11/chaalkata";

/** Site footer: credit, source link, and the originality disclaimer. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <GamosaStrip />
      <p className="font-hand" style={{ fontSize: "1.05rem", color: "var(--chalk)" }}>
        Chaal-Kaata · <span className="font-bengali">চাল-কাটা</span> — traditional games, dug up with care.
      </p>
      <p>
        <a href={GITHUB} target="_blank" rel="noreferrer">Source on GitHub</a>
      </p>
      <p className="font-label" style={{ opacity: 0.75 }}>
        Original design. Inspired by traditional games; not affiliated with any other site.
      </p>
    </footer>
  );
}
