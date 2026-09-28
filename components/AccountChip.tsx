"use client";

import { useEffect, useState } from "react";
import {
  getSession,
  onAuthChange,
  signInWithEmail,
  signOut,
  supabaseConfigured,
} from "../lib/auth";
import type { Session } from "@supabase/supabase-js";

/** Minimal account UI: magic-link sign-in when Supabase is configured. */
export default function AccountChip() {
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
        <span className="stamp" style={{ fontSize: ".68rem" }}>{label}</span>
        <button className="btn-ink btn-ink--ghost font-condensed" style={{ fontSize: ".8rem", padding: ".45em 1em" }} onClick={() => signOut()}>
          Sign out
        </button>
      </span>
    );
  }

  const send = async () => {
    const em = email.trim();
    if (!em || !em.includes("@")) {
      setMsg("Enter an email address.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await signInWithEmail(em);
    setBusy(false);
    setMsg(error ?? "Check your inbox for the sign-in link.");
  };

  return (
    <span style={{ display: "inline-flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email for sign-in"
        onKeyDown={(e) => { if (e.key === "Enter") send(); }}
        style={{
          fontFamily: "Caveat, cursive",
          fontSize: "1.05rem",
          padding: ".35em .7em",
          borderRadius: 4,
          border: "2px solid var(--ink)",
          background: "rgba(255,255,255,.6)",
          color: "var(--ink-body)",
          maxWidth: "12rem",
        }}
      />
      <button className="btn-ink font-condensed" style={{ fontSize: ".8rem", padding: ".5em 1.1em" }} onClick={send} disabled={busy}>
        {busy ? "Sending…" : "Sign in"}
      </button>
      {msg && <span className="font-type" style={{ fontSize: ".7rem" }}>{msg}</span>}
    </span>
  );
}
