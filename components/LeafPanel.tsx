"use client";

import type { CSSProperties, ReactNode } from "react";
import { useTilt } from "./Tilt";

type Props = {
  as?: "section" | "div";
  className?: string;
  labelledBy?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Frosted light card floating over the photographic leaf canopy.
 *  Keeps text readable while the real leaves show through around it. */
export default function LeafPanel({ as = "section", className = "", labelledBy, style, children }: Props) {
  const { x, y } = useTilt();
  const Tag = as as "section";
  const dx = x * 5;
  const dy = y * 4;
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={`leaf-panel ${className}`.trim()}
      style={{ ...style, transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)` }}
    >
      {children}
    </Tag>
  );
}
