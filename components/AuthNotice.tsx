"use client";

import { useEffect, useState } from "react";
import { useLang } from "../lib/i18n";

/**
 * Magic-link redirects land on the home page with the result in the URL
 * fragment (#error=access_denied&error_code=otp_expired …). Supabase's client
 * handles success silently; this surfaces failures in plain language and
 * scrubs the fragment so the dead link isn't copied around.
 */
export default function AuthNotice() {
  const { t } = useLang();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const h = window.location.hash;
    if (!h.includes("error=")) return;
    const params = new URLSearchParams(h.slice(1));
    setMsg(params.get("error_code") === "otp_expired" ? t.auth.linkExpired : t.auth.linkError);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [t]);

  if (!msg) return null;

  return (
    <p role="alert" className="auth-notice">
      <span>{msg}</span>
      <button
        type="button"
        className="btn-clay btn-clay--sm btn-clay--ghost"
        onClick={() => setMsg(null)}
      >
        {t.auth.dismiss}
      </button>
    </p>
  );
}
