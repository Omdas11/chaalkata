import Link from "next/link";
import SoilBackdrop, { SoilVignette } from "../components/SoilBackdrop";
import SoilScene from "../components/SoilScene";
import PaperPanel from "../components/PaperPanel";
import AccountChip from "../components/AccountChip";
import Leaderboard from "../components/Leaderboard";

const COMING = [
  { name: "Pretwa", note: "the ring fighter" },
  { name: "Dash-Guti", note: "ten aside" },
  { name: "Egara-Guti", note: "eleven aside" },
  { name: "Terhüchü v1", note: "Naga hills" },
  { name: "Terhüchü v3", note: "Naga hills" },
  { name: "Sümi Naga war game", note: "unnamed no more, soon" },
  { name: "Sixteen Soldiers", note: "sixteen aside" },
];

export default function Home() {
  return (
    <>
      <SoilBackdrop />
      <SoilScene />
      <SoilVignette />
      <main className="wrap" style={{ position: "relative", zIndex: 2, padding: "4rem 0 5rem" }}>
        <PaperPanel tilt="l" tape={["tl", "tr"]} labelledBy="ck-title">
          <p className="eyebrow">Chaal-Kaata · চাল-কাটা</p>
          <h1 id="ck-title" className="font-display">
            Move <span className="hl-badge">and</span> cut.
          </h1>
          <p className="font-body" style={{ fontSize: "1.35rem", maxWidth: "34rem" }}>
            A playable collection of lesser-known Indian board games in the
            Alquerque family — first scratched into village soil, now dug into
            this page.
          </p>
          <p>
            <Link href="/play/lau-kata-kati" className="btn-ink font-condensed" style={{ textDecoration: "none", display: "inline-block" }}>
              Play Lau Kata Kati
            </Link>
          </p>
          <p className="font-type" style={{ fontSize: ".75rem", opacity: 0.75 }}>
            9 pieces a side · Lower Bengal · captures compulsory
          </p>
          <p style={{ marginTop: ".75rem" }}>
            <AccountChip />
          </p>
        </PaperPanel>

        <div style={{ height: "3rem" }} />

        <PaperPanel tilt="r" tape="tc" labelledBy="more-games">
          <p className="eyebrow">On the bench</p>
          <h2 id="more-games" className="font-display" style={{ fontSize: "1.9rem" }}>
            More games, coming soon
          </h2>
          <hr className="perforation" />
          {COMING.map((g) => (
            <div
              key={g.name}
              className="row-action"
              aria-disabled="true"
              style={{ cursor: "default", justifyContent: "space-between" }}
            >
              <span>
                <strong className="font-display">{g.name}</strong>
                <span className="font-body" style={{ opacity: 0.75 }}> — {g.note}</span>
              </span>
              <span className="stamp" style={{ fontSize: ".65rem" }}>soon</span>
            </div>
          ))}
          <hr className="perforation" />
          <Leaderboard gameId="lau-kata-kati" />
          <hr className="perforation" />
          <p className="font-body" style={{ opacity: 0.8 }}>
            One game at a time, each rebuilt from scratch in real 3D.
          </p>
        </PaperPanel>

        <footer style={{ textAlign: "center", marginTop: "3rem", color: "#D8CBB2" }}>
          <p className="font-type" style={{ fontSize: ".72rem", opacity: 0.8 }}>
            Chaal-Kaata · traditional games, digitised with care
          </p>
        </footer>
      </main>
    </>
  );
}
