"use client";

import Link from "next/link";
import { MenuDrawer } from "../components/SiteChrome";
import GameCarousel from "../components/GameCarousel";
import GamosaStrip from "../components/GamosaStrip";
import Footer from "../components/Footer";
import AccountChip from "../components/AccountChip";
import AuthNotice from "../components/AuthNotice";
import Leaderboard from "../components/Leaderboard";
import Icon from "../components/Icon";
import { useLang } from "../lib/i18n";

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <MenuDrawer />
      <main className="wrap page-main">
        <AuthNotice />
        <section aria-labelledby="ck-title">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 id="ck-title" className="font-display">
            {t.home.titleA}<span className="hl-turmeric">{t.home.titleEm}</span>{t.home.titleB}
          </h1>
          <p className="lede hero-tagline font-body">{t.home.tagline}</p>
          <p style={{ marginTop: "1.2rem" }}>
            <Link href="/play/lau-kata-kati" className="btn-clay">
              <Icon name="play" size={18} /> {t.home.play}
            </Link>
          </p>
          <p className="font-label" style={{ opacity: 0.75, marginTop: "0.9rem" }}>
            {t.home.meta}
          </p>
        </section>

        <section aria-labelledby="choose-game">
          <p className="eyebrow">{t.home.carouselEyebrow}</p>
          <h2 id="choose-game" className="font-display">
            {t.home.carouselTitle}
          </h2>
          <GameCarousel />
        </section>

        <GamosaStrip />

        <section aria-label={t.home.signInPrompt}>
          <p style={{ margin: "0 0 0.8rem" }}>
            <AccountChip />
          </p>
          <p className="font-body" style={{ opacity: 0.8, marginTop: 0 }}>
            {t.home.signInPrompt}
          </p>
          <Leaderboard gameId="lau-kata-kati" />
        </section>

        <Footer />
      </main>
    </>
  );
}
