import type { Metadata } from "next";
import { HowToPlayClient } from "./client";

export const metadata: Metadata = {
  title: "How to play Lau Kata Kati — 5 illustrated steps",
  description:
    "Learn Lau Kata Kati in 5 steps. This traditional Indian board game needs nine stones a side and compulsory cuts. Illustrated guide at Chaal-Kaata.",
  alternates: { canonical: "/how-to-play/lau-kata-kati" },
  openGraph: {
    title: "How to play Lau Kata Kati — 5 illustrated steps",
    description:
      "Learn Lau Kata Kati in 5 steps. This traditional Indian board game needs nine stones a side and compulsory cuts.",
    url: "/how-to-play/lau-kata-kati",
  },
};

export default function HowToPlayPage() {
  return <HowToPlayClient />;
}
