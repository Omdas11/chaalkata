"use client";

import Link from "next/link";
import LeafCanopy from "../../../components/LeafCanopy";
import PhotoLeafField from "../../../components/PhotoLeafField";
import { MenuDrawer } from "../../../components/SiteChrome";
import GamosaStrip from "../../../components/GamosaStrip";
import Footer from "../../../components/Footer";
import Icon from "../../../components/Icon";
import { HowToPlay } from "../../../components/GameInfo";
import { useLang } from "../../../lib/i18n";

export function HowToPlayClient() {
  const { t } = useLang();
  return (
    <>
      <LeafCanopy />
      <PhotoLeafField />
      <MenuDrawer />
      <main className="wrap page-main">
        <HowToPlay />
        <GamosaStrip />
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          <Link href="/play/lau-kata-kati" className="btn-clay btn-clay--sm">
            <Icon name="play" size={16} /> {t.menu.play}
          </Link>
          <Link href="/history/lau-kata-kati" className="btn-clay btn-clay--ghost btn-clay--sm">
            <Icon name="scroll" size={16} /> {t.menu.history}
          </Link>
        </nav>
        <Footer />
      </main>
    </>
  );
}
