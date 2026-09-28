"use client";

import Link from "next/link";
import LeafCanopy from "../../../components/LeafCanopy";
import PhotoLeafField from "../../../components/PhotoLeafField";
import { MenuDrawer } from "../../../components/SiteChrome";
import GamosaStrip from "../../../components/GamosaStrip";
import Footer from "../../../components/Footer";
import Icon from "../../../components/Icon";
import { FamilyLinks } from "../../../components/GameInfo";
import { useLang } from "../../../lib/i18n";

const SOURCES: Array<[string, string]> = [
  ["Wikipedia", "https://en.wikipedia.org/wiki/Lau_kata_kati"],
  ["Ludii", "https://ludii.games/details.php?keyword=Lau%20kata%20kati"],
  ["bead.game", "https://www.bead.game/games/traditional/lau-kata-kati"],
  ["whatdowedoallday", "https://www.whatdowedoallday.com/lau-kata-kati/"],
];

/** Extended narrative generated with a high-end model, held strictly to
 *  documented facts (no invented dates, people or events). English only for
 *  now — Bengali readers get the core two paragraphs below. */
const NARRATIVE_EN = [
  "Lau Kata Kati is a two-player strategy game long played in the courtyards of Lower Bengal, in what is now West Bengal and Bangladesh. The board is simple: two triangles joined at their tips, with nine pieces set per side and the shared middle point left empty at the start. The game belongs to the same broad family as draughts and Fanorona, relying on careful positioning and compulsory captures.",
  "Players move their pieces along the lines, jumping over adjacent enemy pieces to remove them from the board. A single turn may contain several chained jumps, and captures cannot be refused. The game is known by another name in some districts as Kowwu Dunki, and similar games appear across South and Southeast Asia, each with its own local flavour.",
  "In homes across the region, the board was traditionally scratched into the courtyard soil or traced on cloth, and pieces were made from seeds, pebbles or cowrie shells. These quiet afternoon games carried the weight of generations, passed down without written records. Documented sources are thin, and the site welcomes corrections from players who grew up with the game.",
];

export function HistoryClient() {
  const { t, lang } = useLang();
  return (
    <>
      <LeafCanopy />
      <PhotoLeafField />
      <MenuDrawer />
      <main className="wrap page-main">
        <section aria-labelledby="lkk-history">
          <p className="eyebrow">{t.history.eyebrow}</p>
          <h1 id="lkk-history" className="font-display">
            {t.history.title}
          </h1>
          <div className="lede font-body" style={{ display: "grid", gap: "1rem" }}>
            <p style={{ margin: 0 }}>{t.history.p1}</p>
            <p style={{ margin: 0 }}>{t.history.p2}</p>
            {lang === "en" &&
              NARRATIVE_EN.map((p, i) => (
                <p key={i} style={{ margin: 0 }}>
                  {p}
                </p>
              ))}
          </div>
          <p className="font-label" style={{ opacity: 0.75, marginTop: "1.2rem" }}>
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
        <GamosaStrip />
        <FamilyLinks />
        <GamosaStrip />
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          <Link href="/play/lau-kata-kati" className="btn-clay btn-clay--sm">
            <Icon name="play" size={16} /> {t.menu.play}
          </Link>
          <Link href="/how-to-play/lau-kata-kati" className="btn-clay btn-clay--ghost btn-clay--sm">
            <Icon name="book" size={16} /> {t.menu.howToPlay}
          </Link>
        </nav>
        <Footer />
      </main>
    </>
  );
}
