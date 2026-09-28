import type { MetadataRoute } from "next";

const SITE_URL = "https://chaalkata.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/play/lau-kata-kati", priority: 0.9 },
    { path: "/how-to-play/lau-kata-kati", priority: 0.8 },
    { path: "/history/lau-kata-kati", priority: 0.8 },
    { path: "/profile", priority: 0.5 },
  ];
  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
