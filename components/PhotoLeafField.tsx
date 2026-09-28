"use client";

import type { CSSProperties } from "react";

const LEAVES = [
  { src: "/leaves/leaf-mango.jpg",  left: "2%",  top: "4%",  size: 150, depth: 1.0,  dur: "9s",  delay: "0s",  rot: -14 },
  { src: "/leaves/leaf-peepal.jpg", left: "76%", top: "10%", size: 190, depth: 0.6,  dur: "12s", delay: "-4s", rot: 18 },
  { src: "/leaves/leaf-lobed.jpg",  left: "64%", top: "56%", size: 130, depth: 1.3,  dur: "8s",  delay: "-2s", rot: -30 },
  { src: "/leaves/leaf-mango.jpg",  left: "10%", top: "70%", size: 210, depth: 0.45, dur: "14s", delay: "-7s", rot: 24 },
  { src: "/leaves/leaf-peepal.jpg", left: "36%", top: "36%", size: 110, depth: 1.6,  dur: "7s",  delay: "-3s", rot: 8 },
  { src: "/leaves/leaf-lobed.jpg",  left: "84%", top: "80%", size: 160, depth: 0.8,  dur: "11s", delay: "-5s", rot: -8 },
];

/** Photorealistic floating leaves on black, blended with `screen` so the
 *  black vanishes. Gentle CSS drift only — the gyro parallax is gone. */
export default function PhotoLeafField() {
  return (
    <div className="photo-leaves" aria-hidden="true">
      {LEAVES.map((l, i) => {
        const imgStyle = {
          width: l.size,
          animationDuration: l.dur,
          animationDelay: l.delay,
          opacity: Math.min(0.95, 0.5 + l.depth * 0.28),
          "--leaf-rot": `${l.rot}deg`,
        } as CSSProperties;
        return (
          <div key={i} className="photo-leaf" style={{ left: l.left, top: l.top }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.src} alt="" className="photo-leaf__img" style={imgStyle} />
          </div>
        );
      })}
    </div>
  );
}
