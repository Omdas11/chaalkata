"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

interface Tilt {
  /** -1..1, left-right */
  x: number;
  /** -1..1, front-back */
  y: number;
  /** true once we have a live motion/pointer source */
  live: boolean;
}

const TiltContext = createContext<Tilt>({ x: 0, y: 0, live: false });

/** Provides device-tilt (-1..1) to the subtree. Gyro on mobile (with the
 *  iOS permission dance handled on first touch), pointer position on
 *  desktop. Honors prefers-reduced-motion by staying at zero. */
export function TiltProvider({ children }: { children: React.ReactNode }) {
  const [tilt, setTilt] = useState<Tilt>({ x: 0, y: 0, live: false });
  const raf = useRef(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion.current) return;

    const push = (x: number, y: number) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() =>
        setTilt({
          x: Math.max(-1, Math.min(1, x)),
          y: Math.max(-1, Math.min(1, y)),
          live: true,
        }),
      );
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // gamma: left(-90)..right(90); beta: 0 flat .. 90 upright-ish
      push(e.gamma / 40, (e.beta - 45) / 40);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      push((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };

    // iOS requires an explicit user gesture before gyro data flows.
    const requestIOS = () => {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE.requestPermission === "function") {
        DOE.requestPermission().catch(() => {});
      }
      window.removeEventListener("pointerdown", requestIOS);
    };

    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", requestIOS);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", requestIOS);
    };
  }, []);

  return <TiltContext.Provider value={tilt}>{children}</TiltContext.Provider>;
}

export function useTilt(): Tilt {
  return useContext(TiltContext);
}

/** Style for a layer that drifts against the tilt. depth 1 = foreground. */
export function useTiltStyle(depth: number): React.CSSProperties {
  const { x, y } = useTilt();
  const tx = useCallback(() => x * depth * 14, [x, depth]);
  const ty = useCallback(() => y * depth * 10, [y, depth]);
  return { transform: `translate3d(${tx().toFixed(2)}px, ${ty().toFixed(2)}px, 0) rotate(${(x * depth * 1.2).toFixed(2)}deg)` };
}
