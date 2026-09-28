import Link from "next/link";
import SoilBackdrop, { SoilVignette } from "../components/SoilBackdrop";
import SoilScene from "../components/SoilScene";
import EarthPanel from "../components/EarthPanel";
import GamosaStrip from "../components/GamosaStrip";
import Footer from "../components/Footer";
import AccountChip from "../components/AccountChip";
import Leaderboard from "../components/Leaderboard";
import Icon from "../components/Icon";

const COMING = [
  { name: "Pretwa", bn: "প্রেত্বা", note: "the ring fighter" },
  { name: "Dash-Guti", bn: "দশ-গুটি", note: "ten aside" },
  { name: "Egara-Guti", bn: "এগারো-গুটি", note: "eleven aside" },
  { name: "Terhüchü v1", bn: "", note: "Naga hills" },
  { name: "Terhüchü v3", bn: "", note: "Naga hills" },
  { name: "Sümi Naga war game", bn: "", note: "still unnamed — soon" },
  { name: "Sixteen Soldiers", bn: "ষোলো সৈন্য", note: "sixteen aside" },
];

export default function Home() {
  return (
    <>
      <SoilBackdrop />
      <SoilScene />
      <SoilVignette />
      <main className="wrap" style={{ position: "relative", zIndex: 2, padding: "4rem 0 2rem" }}>
        <EarthPanel tilt="l" labelledBy="ck-title">
          <p className="eyebrow">Chaal-Kaata · <span className="font-bengali">চাল-কাটা</span></p>
          <h1 id="ck-title" className="font-display">
            Move <span className="hl-turmeric">and</span> cut.
          </h1>
          <p className="font-body" style={{ fontSize: "1.3rem", maxWidth: "34rem" }}>
            A playable collection of lesser-known Indian board games in the
            Alquerque family — first scratched into village soil, now dug into
            this page.
          </p>
          <p>
            <Link href="/play/lau-kata-kati" className="btn-clay" style={{ textDecoration: "none" }}>
              <Icon name="play" size={18} /> Play Lau Kata Kati · <span className="font-bengali">লাউ কাটা কাটি</span>
            </Link>
          </p>
          <p className="font-label" style={{ opacity: 0.75, marginTop: "0.75rem" }}>
            9 pieces a side · Lower Bengal · captures compulsory
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            <AccountChip />
          </p>
        </EarthPanel>

        <div style={{ height: "3rem" }} />

        <EarthPanel tilt="r" labelledBy="more-games">
          <p className="eyebrow">On the bench</p>
          <h2 id="more-games" className="font-display">
            More games, coming soon
          </h2>
          <GamosaStrip />
          {COMING.map((g) => (
            <div
              key={g.name}
              className="row-action"
              aria-disabled="true"
              style={{ cursor: "default", justifyContent: "space-between" }}
            >
              <span>
                <strong className="font-display" style={{ fontWeight: 400 }}>{g.name}</strong>
                {g.bn ? <span className="font-bengali" style={{ opacity: 0.7 }}> · {g.bn}</span> : null}
                <span className="font-body" style={{ opacity: 0.7 }}> — {g.note}</span>
              </span>
              <span className="stamp" style={{ fontSize: "0.65rem" }}>soon</span>
            </div>
          ))}
          <GamosaStrip />
          <Leaderboard gameId="lau-kata-kati" />
          <GamosaStrip />
          <p className="font-body" style={{ opacity: 0.8 }}>
            One game at a time, each rebuilt from scratch in real 3D.
          </p>
        </EarthPanel>

        <Footer />
      </main>
    </>
  );
}
