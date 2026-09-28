"use client";

import { useMemo } from "react";
import { LeafSvg, type LeafShape } from "./LeafPanel";
import { useTilt } from "./Tilt";

interface DriftLeaf {
  shape: LeafShape;
  left: string;
  top: string;
  size: number;
  depth: number;
  rot: number;
  delay: string;
  opacity: number;
}

const LEAVES: DriftLeaf[] = [
  { shape: "mango", left: "4%", top: "6%", size: 120, depth: 1.6, rot: -24, delay: "0s", opacity: 0.5 },
  { shape: "peepal", left: "82%", top: "12%", size: 96, depth: 1.1, rot: 18, delay: "1.4s", opacity: 0.42 },
  { shape: "lobed", left: "70%", top: "64%", size: 140, depth: 2.1, rot: -12, delay: "2.6s", opacity: 0.38 },
  { shape: "mango", left: "12%", top: "74%", size: 88, depth: 0.8, rot: 32, delay: "0.8s", opacity: 0.45 },
  { shape: "peepal", left: "48%", top: "88%", size: 110, depth: 1.4, rot: -40, delay: "3.8s", opacity: 0.34 },
  { shape: "lobed", left: "88%", top: "42%", size: 74, depth: 0.7, rot: 55, delay: "2s", opacity: 0.4 },
  { shape: "mango", left: "34%", top: "2%", size: 66, depth: 0.6, rot: 70, delay: "4.6s", opacity: 0.36 },
  { shape: "peepal", left: "2%", top: "44%", size: 80, depth: 1.2, rot: -58, delay: "5.4s", opacity: 0.4 },
];

/** Fixed layer of decorative leaves that drift with the device gyroscope
 *  (or mouse on desktop). Each leaf has its own depth for parallax. */
export default function LeafField() {
  const { x, y } = useTilt();
  const leaves = useMemo(
    () =>
      LEAVES.map((l) => ({
        ...l,
        transform: `translate3d(${(x * l.depth * 34).toFixed(1)}px, ${(y * l.depth * 26).toFixed(1)}px, 0) rotate(${(l.rot + x * l.depth * 6).toFixed(1)}deg)`,
      })),
    [x, y],
  );
  return (
    <div className="leaf-field" aria-hidden="true">
      {leaves.map((l, i) => (
        <div
          key={i}
          className="drift-leaf"
          style={{
            left: l.left,
            top: l.top,
            width: l.size,
            height: l.size * 1.4,
            transform: l.transform,
            animationDelay: l.delay,
            opacity: l.opacity,
          }}
        >
          <LeafSvg shape={l.shape} />
        </div>
      ))}
    </div>
  );
}
