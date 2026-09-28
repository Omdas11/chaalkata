"use client";

import Link from "next/link";
import LeafCanopy from "../components/LeafCanopy";
import PhotoLeafField from "../components/PhotoLeafField";
import LeafPanel from "../components/LeafPanel";
import GamosaStrip from "../components/GamosaStrip";
import Footer from "../components/Footer";
import AccountChip from "../components/AccountChip";
import Leaderboard from "../components/Leaderboard";
import LangToggle from "../components/LangToggle";
import Icon from "../components/Icon";
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

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <LeafCanopy />
      <PhotoLeafField />
      <main className="wrap" style={{ position: "relative", zIndex: 2, padding: "4rem 0 2rem" }}>
        <LeafPanel labelledBy="ck-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.4em" }}>
            <p className="eyebrow" style={{ margin: 0 }}>{t.home.eyebrow}</p>
            <LangToggle />
          </div>
          <h1 id="ck-title" className="font-display">
            {t.home.titleA}<span className="hl-turmeric">{t.home.titleEm}</span>{t.home.titleB}
          </h1>
          <p className="font-body" style={{ fontSize: "1.3rem", maxWidth: "34rem" }}>
            {t.home.tagline}
          </p>
          <p>
            <Link href="/play/lau-kata-kati" className="btn-clay" style={{ textDecoration: "none" }}>
              <Icon name="play" size={18} /> {t.home.play}
            </Link>
          </p>
          <p className="font-label" style={{ opacity: 0.75, marginTop: "0.75rem" }}>
            {t.home.meta}
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            <AccountChip />
          </p>
        </LeafPanel>

        <div style={{ height: "3rem" }} />

        <LeafPanel labelledBy="more-games">
          <p className="eyebrow">{t.home.benchEyebrow}</p>
          <h2 id="more-games" className="font-display">
            {t.home.benchTitle}
          </h2>
          <GamosaStrip />
          {COMING_KEYS.map((key) => {
            const g: { name: string; note: string } = t.games[key];
            return (
              <div
                key={key}
                className="row-action"
                aria-disabled="true"
                style={{ cursor: "default", justifyContent: "space-between" }}
              >
                <span>
                  <strong className="font-display" style={{ fontWeight: 400 }}>{g.name}</strong>
                  <span className="font-body" style={{ opacity: 0.7 }}> — {g.note}</span>
                </span>
                <span className="stamp" style={{ fontSize: "0.65rem" }}>{t.home.soon}</span>
              </div>
            );
          })}
          <GamosaStrip />
          <Leaderboard gameId="lau-kata-kati" />
          <GamosaStrip />
          <p className="font-body" style={{ opacity: 0.8 }}>
            {t.family.text}
          </p>
        </LeafPanel>

        <Footer />
      </main>
    </>
  );
}
