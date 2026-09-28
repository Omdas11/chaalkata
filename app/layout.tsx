import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";
import { SiteHeader } from "../components/SiteChrome";

/** Applies the stored theme before first paint (no flash). */
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('ck-theme');var m={soil:'raat',canopy:'jungle',night:'raat',raat:'raat',jungle:'jungle',alo:'alo'};document.documentElement.dataset.theme=m[t]||'raat'}catch(e){document.documentElement.dataset.theme='raat'}})();`;

const SITE_URL = "https://chaalkata.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0f0b07",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chaal-Kaata — Traditional Indian Board Games",
    template: "%s · Chaal-Kaata",
  },
  description:
    "Chaal-Kaata brings you Lau Kata Kati and other traditional Indian board games of the Alquerque family. Play free in your browser.",
  keywords: [
    "Chaal-Kaata",
    "Lau Kata Kati",
    "lau kata kati online",
    "play lau kata kati",
    "Indian board games",
    "traditional Indian games",
    "Alquerque",
    "Pretwa",
    "Dash-Guti",
    "Terhüchü",
    "board games of Bengal",
    "লাউ কাটা কাটি",
    "চাল-কাটা",
  ],
  authors: [{ name: "Chaal-Kaata" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Chaal-Kaata",
    locale: "en_IN",
    title: "Chaal-Kaata — Traditional Indian Board Games",
    description:
      "Chaal-Kaata brings you Lau Kata Kati and other traditional Indian board games of the Alquerque family. Play free in your browser.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Chaal-Kaata — move and cut" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaal-Kaata — Traditional Indian Board Games",
    description:
      "Lau Kata Kati and seven more Indian board games — played on village soil.",
    images: ["/og.png"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Chaal-Kaata",
  alternateName: "চাল-কাটা",
  url: SITE_URL,
  description:
    "A playable collection of traditional Indian board games in the Alquerque family, starting with Lau Kata Kati.",
  inLanguage: ["en", "bn"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <div className="theme-bg theme-bg--raat" aria-hidden="true" />
            <div className="theme-bg theme-bg--jungle" aria-hidden="true" />
            <div className="theme-bg theme-bg--alo" aria-hidden="true" />
            <SiteHeader />
            {children}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
