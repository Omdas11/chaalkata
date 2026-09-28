import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Lau Kata Kati online — free vs AI or a friend",
  description:
    "Play Lau Kata Kati, a classic Indian board game. Nine stones a side, cuts compulsory. Free browser play vs AI or a friend.",
  alternates: { canonical: "/play/lau-kata-kati" },
  openGraph: {
    type: "website",
    title: "Play Lau Kata Kati online — free vs AI or a friend",
    description:
      "Play Lau Kata Kati, a classic Indian board game. Nine stones a side, cuts compulsory. Free browser play vs AI or a friend.",
    url: "/play/lau-kata-kati",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Lau Kata Kati board on Chaal-Kaata" }],
  },
};

export default function LauKataKatiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
