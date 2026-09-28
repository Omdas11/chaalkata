"use client";

import { useTilt } from "./Tilt";

/** Fixed full-viewport photorealistic leaf canopy with gyro parallax and a
 *  readability scrim. Replaces the old WebGL soil scene. */
export default function LeafCanopy() {
  const { x, y } = useTilt();
  const dx = x * -36;
  const dy = y * -28;
  return (
    <>
      <div className="canopy" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/leaves/canopy.jpg"
          alt=""
          className="canopy__img"
          style={{
            transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(1.12)`,
          }}
        />
      </div>
      <div className="scrim" aria-hidden="true" />
    </>
  );
}
