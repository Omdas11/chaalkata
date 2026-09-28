"use client";

/** Reserves the fixed background layer for the 3D soil scene.
 *  Renders a soil-tone gradient fallback so the page looks fine before WebGL loads. */
export default function SoilBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(120% 90% at 50% 20%, #6B4A2E 0%, #4A3220 55%, #3E2C1C 100%)",
      }}
    />
  );
}

export function SoilVignette() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        background:
          "radial-gradient(90% 75% at 50% 45%, transparent 55%, rgba(20,12,6,.45) 100%)",
      }}
    />
  );
}
