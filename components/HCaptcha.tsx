"use client";

import { useEffect, useRef } from "react";

/** Public sitekey — safe to ship in the page. Override via env if you rotate it. */
export const HCAPTCHA_SITEKEY =
  process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? "6af2681a-cac2-4d4a-85da-b79a5d5057b8";

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
    };
  }
}

type Props = {
  onToken: (token: string | null) => void;
  /** Increment to force the widget back to unsolved. */
  resetKey: number;
};

/** Explicit-render hCaptcha checkbox. Matches the page theme (dark/light). */
export default function HCaptcha({ onToken, resetKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cbRef = useRef(onToken);
  cbRef.current = onToken;

  useEffect(() => {
    let cancelled = false;
    const render = () => {
      if (cancelled || !ref.current || !window.hcaptcha || widgetId.current) return;
      widgetId.current = window.hcaptcha.render(ref.current, {
        sitekey: HCAPTCHA_SITEKEY,
        theme: document.documentElement.dataset.theme === "alo" ? "light" : "dark",
        callback: (t: string) => cbRef.current(t),
        "expired-callback": () => cbRef.current(null),
        "error-callback": () => cbRef.current(null),
      });
    };
    if (window.hcaptcha) {
      render();
    } else if (!document.querySelector('script[data-hcaptcha="1"]')) {
      const s = document.createElement("script");
      s.dataset.hcaptcha = "1";
      s.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      // Script tag exists but not loaded yet — poll briefly.
      const iv = window.setInterval(() => {
        if (window.hcaptcha || cancelled) {
          window.clearInterval(iv);
          render();
        }
      }, 200);
      return () => {
        cancelled = true;
        window.clearInterval(iv);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resetKey > 0 && widgetId.current && window.hcaptcha) {
      window.hcaptcha.reset(widgetId.current);
      cbRef.current(null);
    }
  }, [resetKey]);

  return <div ref={ref} style={{ minHeight: 78 }} />;
}
