"use client";

import { useId } from "react";
import { useTiltStyle } from "./Tilt";

export type LeafShape = "mango" | "peepal" | "lobed";

interface LeafDef {
  viewBox: string;
  body: string;
  midrib: string;
  veins: string[];
}

/** Hand-drawn realistic leaf silhouettes with midrib + side veins.
 *  mango: long lanceolate leaf · peepal: heart-shaped with a drip tip ·
 *  lobed: rounded oak-style lobes. */
const LEAVES: Record<LeafShape, LeafDef> = {
  mango: {
    viewBox: "0 0 200 300",
    body: "M100,8 C150,60 168,110 162,170 C156,225 128,258 100,272 C72,258 44,225 38,170 C32,110 50,60 100,8 Z",
    midrib: "M100,22 L100,266",
    veins: [
      "M100,70 C120,78 136,92 146,112",
      "M100,70 C80,78 64,92 54,112",
      "M100,110 C122,118 140,132 150,154",
      "M100,110 C78,118 60,132 50,154",
      "M100,150 C122,158 138,172 148,194",
      "M100,150 C78,158 62,172 52,194",
      "M100,190 C120,198 134,212 142,232",
      "M100,190 C80,198 66,212 58,232",
      "M100,228 C110,234 116,244 120,256",
      "M100,228 C90,234 84,244 80,256",
    ],
  },
  peepal: {
    viewBox: "0 0 200 240",
    body: "M100,30 C80,18 45,25 30,55 C15,85 35,120 70,150 C85,163 95,180 98,205 C99,216 101,216 102,205 C105,180 115,163 130,150 C165,120 185,85 170,55 C155,25 120,18 100,30 Z",
    midrib: "M100,44 L100,208",
    veins: [
      "M100,60 C80,58 60,62 44,74",
      "M100,60 C120,58 140,62 156,74",
      "M100,85 C76,86 56,96 44,112",
      "M100,85 C124,86 144,96 156,112",
      "M100,112 C80,116 64,128 56,144",
      "M100,112 C120,116 136,128 144,144",
      "M100,140 C88,146 80,158 78,172",
      "M100,140 C112,146 120,158 122,172",
      "M100,165 C95,174 94,184 95,194",
      "M100,165 C105,174 106,184 105,194",
    ],
  },
  lobed: {
    viewBox: "0 0 200 250",
    body: "M100,8 C122,8 128,30 144,34 C160,38 162,58 148,66 C162,68 170,84 156,94 C144,104 150,118 162,124 C174,130 172,148 156,150 C144,152 142,162 150,172 C160,184 150,202 136,196 C124,191 118,200 121,214 C124,230 108,242 100,232 C92,242 76,230 79,214 C82,200 76,191 64,196 C50,202 40,184 50,172 C58,162 56,152 44,150 C28,148 26,130 38,124 C50,118 56,104 44,94 C30,84 38,68 52,66 C38,58 40,38 56,34 C72,30 78,8 100,8 Z",
    midrib: "M100,20 L100,226",
    veins: [
      "M100,55 L140,42",
      "M100,55 L60,42",
      "M100,90 L152,80",
      "M100,90 L48,80",
      "M100,125 L158,122",
      "M100,125 L42,122",
      "M100,160 L148,168",
      "M100,160 L52,168",
      "M100,195 L132,206",
      "M100,195 L68,206",
    ],
  },
};

export function LeafSvg({ shape, className }: { shape: LeafShape; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `leafg-${uid}`;
  const leaf = LEAVES[shape];
  return (
    <svg className={className} viewBox={leaf.viewBox} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#c9e3a9" />
          <stop offset="0.45" stopColor="#93c464" />
          <stop offset="1" stopColor="#5d8f46" />
        </linearGradient>
      </defs>
      <path d={leaf.body} fill={`url(#${gid})`} />
      <path d={leaf.body} fill="none" stroke="#2e5b28" strokeWidth="3" strokeOpacity="0.55" />
      <path d={leaf.midrib} fill="none" stroke="#2e5b28" strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />
      {leaf.veins.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2e5b28" strokeWidth="1.4" strokeOpacity="0.45" strokeLinecap="round" />
      ))}
      {/* soft sunlit sheen near the top-left */}
      <ellipse cx="70" cy="70" rx="46" ry="60" fill="#ffffff" opacity="0.14" />
    </svg>
  );
}

interface LeafPanelProps {
  shape?: LeafShape;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}

/** A content card shaped like a realistic leaf. Drifts gently with device gyro. */
export default function LeafPanel({ shape = "mango", labelledBy, className = "", children }: LeafPanelProps) {
  const tiltStyle = useTiltStyle(0.4);
  return (
    <section className={`leaf-panel ${className}`} aria-labelledby={labelledBy} style={tiltStyle}>
      <LeafSvg shape={shape} className="leaf-panel__svg" />
      <div className="leaf-panel__content">{children}</div>
    </section>
  );
}
