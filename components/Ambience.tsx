"use client";

import { useEffect, useRef } from "react";
import { getMuted } from "../lib/sounds";

/**
 * Looping nature ambience (stream water + distant birds).
 * Starts on the first user gesture (autoplay policy), fades in gently,
 * and follows the shared ck-muted flag.
 */
export default function Ambience() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;

    const applyMute = () => {
      if (getMuted()) {
        audio.pause();
      } else if (startedRef.current) {
        void audio.play().catch(() => {});
      }
    };

    const begin = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (getMuted()) return;
      void audio
        .play()
        .then(() => {
          // gentle fade-in over ~4s
          const target = 0.16;
          const step = target / 40;
          const id = setInterval(() => {
            if (audio.volume + step >= target) {
              audio.volume = target;
              clearInterval(id);
            } else {
              audio.volume += step;
            }
          }, 100);
        })
        .catch(() => {
          startedRef.current = false;
        });
    };

    window.addEventListener("pointerdown", begin, { once: false });
    window.addEventListener("keydown", begin, { once: false });
    window.addEventListener("ck-muted-changed", applyMute);
    return () => {
      window.removeEventListener("pointerdown", begin);
      window.removeEventListener("keydown", begin);
      window.removeEventListener("ck-muted-changed", applyMute);
    };
  }, []);

  return (
    <audio ref={audioRef} loop preload="auto" aria-hidden="true" tabIndex={-1}>
      <source src="/sounds/ambience.ogg" type="audio/ogg" />
      <source src="/sounds/ambience.mp3" type="audio/mpeg" />
    </audio>
  );
}
