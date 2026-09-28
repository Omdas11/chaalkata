import type { Metadata } from "next";
import { ProfileClient } from "./client";

export const metadata: Metadata = {
  title: "Your profile — games, stats & saved boards",
  description:
    "Your corner of the Chaal-Kaata courtyard: match record, saved boards, and recent games for Lau Kata Kati.",
  alternates: { canonical: "/profile" },
  openGraph: {
    title: "Your Chaal-Kaata profile",
    description: "Match record, saved boards, and recent games.",
    url: "/profile",
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
