import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chaal-Kaata · চাল-কাটা",
    short_name: "Chaal-Kaata",
    description:
      "A playable collection of lesser-known Indian board games in the Alquerque family: Lau Kata Kati, Pretwa, Dash-Guti and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#2a1c10",
    theme_color: "#2a1c10",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
