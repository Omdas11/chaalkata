"use client";

import { useEffect, useState } from "react";
import {
  getSession,
  onAuthChange,
  signInWithEmail,
  signOut,
  supabaseConfigured,
} from "../lib/auth";
import { useLang } from "../lib/i18n";
import type { Session } from "@supabase/supabase-js";

/** Minimal account UI: magic-link sign-in when Supabase is configured. */
export default function AccountChip() {
  const { t } = useLang();
  const [enabled] = useState(supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    getSession().then(setSession).catch(() => {});
    return onAuthChange(setSession);
  }, [enabled]);

  if (!enabled) return null;

  if (session?.user) {
    const label = session.user.email ?? session.user.id.slice(0, 8);
    return (
      <span style={{ display: "inline-flex", gap: ".6rem", alignItems: "center" }}>
        <span className="stamp" style={{ fontSize: ".68rem" }} title={t.auth.signedInAs(label)}>{label}</span>
        <button className="btn-clay btn-clay--sm btn-clay--ghost" onClick={() => signOut()}>
          {t.auth.signOut}
        </button>
      </span>
    );
  }

  const send = async () => {
    const em = email.trim();
    if (!em || !em.includes("@")) {
      setMsg(t.auth.emailPlaceholder);
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await signInWithEmail(em);
    setBusy(false);
    setMsg(error ?? t.auth.checkEmail);
  };

  return (
    <span style={{ display: "inline-flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.auth.emailPlaceholder}
        aria-label={t.auth.signIn}
        onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        style={{
          fontFamily: "\"Hind\", sans-serif",
          fontSize: "1.05rem",
          padding: ".35em .7em",
          borderRadius: 8,
          border: "2px solid rgba(36,26,16,.5)",
          background: "rgba(255,255,255,.5)",
          color: "#241a10",
          maxWidth: "12rem",
          minHeight: 44,
        }}
      />
      <button className="btn-clay btn-clay--sm" onClick={send} disabled={busy}>
        {busy ? "…" : t.auth.signIn}
      </button>
      {msg && <span className="font-body" style={{ fontSize: ".85rem" }}>{msg}</span>}
    </span>
  );
}
