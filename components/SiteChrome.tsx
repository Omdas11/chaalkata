"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LangToggle from "./LangToggle";
import ThemeSwitch from "./ThemeSwitch";
import Icon from "./Icon";
import { useLang } from "../lib/i18n";

const GITHUB = "https://github.com/Omdas11/chaalkata";
const MENU_EVENT = "ck:menu-toggle";

/** Any header hamburger dispatches this; the drawer listens for it. */
export function toggleMenu() {
  window.dispatchEvent(new CustomEvent(MENU_EVENT));
}

/** Fixed top bar: hamburger, animated Chaal-Kaata wordmark, language toggle. */
export function SiteHeader() {
  const { t } = useLang();
  return (
    <header className="site-header">
      <button
        className="hamburger"
        onClick={toggleMenu}
        aria-label={t.menu.open}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <Link href="/" className="wordmark" aria-label="Chaal-Kaata — home">
        Chaal-Kaata
      </Link>
      <LangToggle compact />
    </header>
  );
}

/** Slide-in drawer: game controls (on game pages), navigation, language. */
export function MenuDrawer({ controls }: { controls?: ReactNode }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener(MENU_EVENT, onToggle);
    return () => window.removeEventListener(MENU_EVENT, onToggle);
  }, []);

  // Close on navigation and lock body scroll while open.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <>
      <div
        className={`drawer-scrim${open ? " drawer-scrim--open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <nav
        className={`drawer${open ? " drawer--open" : ""}`}
        aria-label={t.menu.menu}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="drawer-head">
          <span className="wordmark wordmark--sm">Chaal-Kaata</span>
          <button className="hamburger hamburger--close" onClick={() => setOpen(false)} aria-label={t.menu.close}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        {controls && (
          <section aria-label={t.menu.controls} className="drawer-section">
            <p className="eyebrow">{t.menu.controls}</p>
            {controls}
          </section>
        )}

        <section aria-label={t.menu.nav} className="drawer-section">
          <p className="eyebrow">{t.menu.nav}</p>
          <Link href="/" className="row-action" onClick={() => setOpen(false)}>
            <Icon name="home" size={18} /> {t.menu.home}
          </Link>
          <Link href="/play/lau-kata-kati" className="row-action" onClick={() => setOpen(false)}>
            <Icon name="play" size={18} /> {t.menu.play}
          </Link>
          <Link href="/how-to-play/lau-kata-kati" className="row-action" onClick={() => setOpen(false)}>
            <Icon name="book" size={18} /> {t.menu.howToPlay}
          </Link>
          <Link href="/history/lau-kata-kati" className="row-action" onClick={() => setOpen(false)}>
            <Icon name="scroll" size={18} /> {t.menu.history}
          </Link>
          <Link href="/profile" className="row-action" onClick={() => setOpen(false)}>
            <Icon name="user" size={18} /> {t.menu.profile}
          </Link>
        </section>

        <section aria-label={t.menu.theme} className="drawer-section">
          <p className="eyebrow">{t.menu.theme}</p>
          <ThemeSwitch />
        </section>

        <section aria-label={t.menu.language} className="drawer-section">
          <p className="eyebrow">{t.menu.language}</p>
          <LangToggle />
          <p style={{ marginTop: "1rem" }}>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="row-action">
              <Icon name="code" size={18} /> {t.menu.source}
            </a>
          </p>
        </section>
      </nav>
    </>
  );
}
