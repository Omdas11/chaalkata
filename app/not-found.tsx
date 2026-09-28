"use client";

import Link from "next/link";
import { MenuDrawer } from "../components/SiteChrome";
import GamosaStrip from "../components/GamosaStrip";
import Footer from "../components/Footer";
import { useLang } from "../lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <>
      <MenuDrawer />
      <main className="wrap page-main">
        <section aria-labelledby="nf-title" style={{ textAlign: "center", padding: "4rem 0" }}>
          <span className="stamp">404</span>
          <h1 id="nf-title" className="font-display" style={{ marginTop: "0.6em" }}>
            {t.notFound.title}
          </h1>
          <p className="lede font-body" style={{ marginInline: "auto" }}>
            {t.notFound.text}
          </p>
          <GamosaStrip />
          <p>
            <Link href="/" className="btn-clay">
              ← {t.notFound.home}
            </Link>
          </p>
        </section>
        <Footer />
      </main>
    </>
  );
}
