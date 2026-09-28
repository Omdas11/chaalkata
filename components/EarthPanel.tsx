import type { ReactNode } from "react";

type Tilt = "l" | "r" | "flat";

interface Props {
  children: ReactNode;
  tilt?: Tilt;
  stamp?: string;
  className?: string;
  labelledBy?: string;
}

/** Packed-earth panel: the village-soil surface everything sits on. */
export default function EarthPanel({ children, tilt = "flat", stamp, className = "", labelledBy }: Props) {
  const tiltClass = tilt === "r" ? "earth-panel--tilt-r" : tilt === "l" ? "earth-panel--tilt-l" : "";
  return (
    <section
      aria-labelledby={labelledBy}
      className={`earth-panel ${tiltClass} ${className}`.trim()}
    >
      {stamp ? (
        <div className="stamp" style={{ position: "absolute", top: "1rem", right: "1.2rem" }}>
          {stamp}
        </div>
      ) : null}
      {children}
    </section>
  );
}
