"use client";

import Link from "next/link";
import LeafPanel from "../components/LeafPanel";
import PhotoLeafField from "../components/PhotoLeafField";
import LeafCanopy from "../components/LeafCanopy";
import GamosaStrip from "../components/GamosaStrip";
import Footer from "../components/Footer";
import LangToggle from "../components/LangToggle";
import { useLang } from "../lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <>
      <LeafCanopy />
      <PhotoLeafField />
      <main className="wrap" style={{ position: "relative", zIndex: 2, padding: "4rem 0" }}>
        <LeafPanel labelledBy="nf-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.4em" }}>
            <span className="stamp">404</span>
            <LangToggle />
          </div>
          <h1 id="nf-title" className="font-display">
            {t.notFound.title}
          </h1>
          <p className="font-body" style={{ fontSize: "1.2rem" }}>
            {t.notFound.text}
          </p>
          <GamosaStrip />
          <p>
            <Link href="/" className="btn-clay">
              ← {t.notFound.home}
            </Link>
          </p>
        </LeafPanel>
        <Footer />
      </main>
    </>
  );
}
