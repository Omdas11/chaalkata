import type { Metadata } from "next";
import { HistoryClient } from "./client";

export const metadata: Metadata = {
  title: "History of Lau Kata Kati — roots in Lower Bengal",
  description:
    "Lau Kata Kati hails from Lower Bengal, also called Kowwu Dunki. A traditional Indian board game from the Alquerque family. Play free at Chaal-Kaata.",
  alternates: { canonical: "/history/lau-kata-kati" },
  openGraph: {
    title: "History of Lau Kata Kati — roots in Lower Bengal",
    description:
      "Lau Kata Kati hails from Lower Bengal, also called Kowwu Dunki. A traditional Indian board game from the Alquerque family.",
    url: "/history/lau-kata-kati",
  },
};

export default function HistoryPage() {
  return <HistoryClient />;
}
