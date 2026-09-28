import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chaal-Kaata · চাল-কাটা — move and cut",
  description:
    "A playable collection of lesser-known Indian board games in the Alquerque family: Lau Kata Kati, Pretwa, Dash-Guti and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
