import type { ReactNode } from "react";

type Tilt = "l" | "r" | "flat";
type TapePos = "tl" | "tr" | "tc";

interface Props {
  children: ReactNode;
  tilt?: Tilt;
  tape?: TapePos | TapePos[];
  stamp?: string;
  className?: string;
  labelledBy?: string;
}

export default function PaperPanel({ children, tilt = "l", tape, stamp, className = "", labelledBy }: Props) {
  const tiltClass = tilt === "r" ? "paper-panel--tilt-r" : tilt === "flat" ? "paper-panel--flat" : "";
  const tapes = tape ? (Array.isArray(tape) ? tape : [tape]) : [];
  return (
    <section
      aria-labelledby={labelledBy}
      className={`paper-panel ${tiltClass} ${className}`.trim()}
    >
      {tapes.map((t) => (
        <div key={t} aria-hidden="true" className={`tape tape--${t}`} />
      ))}
      {stamp ? (
        <div className="stamp" style={{ position: "absolute", top: "1rem", right: "1.2rem" }}>
          {stamp}
        </div>
      ) : null}
      {children}
    </section>
  );
}
