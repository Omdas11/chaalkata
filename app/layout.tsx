import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://chaalkata.vercel.app";

export const viewport: Viewport = {
  themeColor: "#2a1c10",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Chaal-Kaata · চাল-কাটা — move and cut",
    template: "%s · Chaal-Kaata",
  },
  description:
    "A playable collection of lesser-known Indian board games in the Alquerque family: Lau Kata Kati, Pretwa, Dash-Guti, Terhüchü and more — free, offline-first, no account needed to play.",
  keywords: [
    "Lau Kata Kati",
    "Indian board games",
    "Alquerque",
    "Pretwa",
    "Dash-Guti",
    "Terhüchü",
    "traditional games",
    "লাউ কাটা কাটি",
  ],
  openGraph: {
    type: "website",
    siteName: "Chaal-Kaata",
    title: "Chaal-Kaata · চাল-কাটা — move and cut",
    description:
      "Lau Kata Kati and seven more Indian board games — played on village soil.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Chaal-Kaata — move and cut" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaal-Kaata · চাল-কাটা — move and cut",
    description:
      "Lau Kata Kati and seven more Indian board games — played on village soil.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
