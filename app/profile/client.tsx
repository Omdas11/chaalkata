"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "../../lib/i18n";
import { getStorage, type GameRecord, type SavedGame } from "../../lib/storage";
import { getSupabase, supabaseConfigured } from "../../lib/auth";
import AccountChip from "../../components/AccountChip";
import Icon from "../../components/Icon";

const GAME_ID = "lau-kata-kati";

interface Stats {
  wins: number;
  losses: number;
  draws: number;
  twoPlayer: number;
}

function emptyStats(): Stats {
  return { wins: 0, losses: 0, draws: 0, twoPlayer: 0 };
}

/** Profile: account, match record, saved boards, recent games. */
export function ProfileClient() {
  const { t } = useLang();
  const [stats, setStats] = useState<Stats>(emptyStats());
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [save, setSave] = useState<SavedGame | null>(null);
  const [backend, setBackend] = useState<"local" | "supabase">("local");
  const [signedIn, setSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const s = getStorage();
    setBackend(s.backend);
    try {
      const results = await s.myResults(GAME_ID, 500);
      const st = emptyStats();
      for (const r of results) {
        if (r.mode === "2p") {
          st.twoPlayer++;
          continue;
        }
        if (r.winner === "A") st.wins++;
        else if (r.winner === "B") st.losses++;
        else st.draws++;
      }
      setStats(st);
      setHistory(results.slice(0, 12));
      setSave(await s.loadGame(GAME_ID));
    } catch {
      /* signed out of supabase: show empty */
    }
    if (supabaseConfigured()) {
      try {
        const { data } = await getSupabase()!.auth.getUser();
        setSignedIn(!!data.user);
      } catch {
        setSignedIn(false);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const discardSave = useCallback(async () => {
    await getStorage().clearGame(GAME_ID);
    setSave(null);
  }, []);

  const resultLabel = (r: GameRecord): { text: string; cls: string } => {
    if (r.mode === "2p") {
      if (r.winner === "A") return { text: t.profile.aWins, cls: "record-item--win" };
      if (r.winner === "B") return { text: t.profile.bWins, cls: "record-item--win" };
      return { text: t.profile.draw, cls: "record-item--draw" };
    }
    if (r.winner === "A") return { text: t.profile.youWin, cls: "record-item--win" };
    if (r.winner === "B") return { text: t.profile.aiWins, cls: "record-item--loss" };
    return { text: t.profile.draw, cls: "record-item--draw" };
  };

  const p = t.profile;
  const hasStats = stats.wins + stats.losses + stats.draws + stats.twoPlayer > 0;

  return (
    <main className="wrap page-main">
      <p className="eyebrow">{p.account}</p>
      <h1>{p.title}</h1>
      <p className="lede">{p.tagline}</p>

      <section aria-label={p.account} style={{ marginTop: "var(--sp-2)" }}>
        <AccountChip />
        {!signedIn && supabaseConfigured() && (
          <p className="empty-note" style={{ marginTop: "var(--sp-1)" }}>
            {p.signinNudge}
          </p>
        )}
        {loaded && (
          <p style={{ marginTop: "0.8rem" }}>
            <span className="backend-badge">
              {p.backend(backend === "supabase" ? p.cloudBackend : p.localBackend)}
            </span>
          </p>
        )}
      </section>

      <section aria-label={p.stats} style={{ marginTop: "var(--sp-3)" }}>
        <h2>{p.stats}</h2>
        {!loaded ? null : !hasStats ? (
          <p className="empty-note">{p.emptyStats}</p>
        ) : (
          <>
            <p className="font-label" style={{ color: "var(--chalk-dim)" }}>{p.statsVsAi}</p>
            <div className="stat-row">
              <div className="stat-chip">
                <div className="stat-chip__num">{stats.wins}</div>
                <div className="stat-chip__label">{p.wins}</div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip__num">{stats.losses}</div>
                <div className="stat-chip__label">{p.losses}</div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip__num">{stats.draws}</div>
                <div className="stat-chip__label">{p.draws}</div>
              </div>
              <div className="stat-chip">
                <div className="stat-chip__num">{stats.twoPlayer}</div>
                <div className="stat-chip__label">{p.twoPlayer}</div>
              </div>
            </div>
          </>
        )}
      </section>

      <section aria-label={p.saves} style={{ marginTop: "var(--sp-3)" }}>
        <h2>{p.saves}</h2>
        {!loaded ? null : !save ? (
          <p className="empty-note">{p.emptySaves}</p>
        ) : (
          <div className="record-item">
            <Icon name="play" size={18} />
            <span>
              {new Date(save.updatedAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="record-item__meta">
              <Link href="/play/lau-kata-kati" className="btn-clay btn-clay--sm" style={{ marginRight: "0.5rem" }}>
                {p.resume}
              </Link>
              <button type="button" className="btn-clay btn-clay--sm btn-clay--ghost" onClick={discardSave}>
                {p.discard}
              </button>
            </span>
          </div>
        )}
      </section>

      <section aria-label={p.history} style={{ marginTop: "var(--sp-3)" }}>
        <h2>{p.history}</h2>
        {!loaded ? null : history.length === 0 ? (
          <p className="empty-note">{p.emptyStats}</p>
        ) : (
          <ul className="record-list">
            {history.map((r, i) => {
              const rl = resultLabel(r);
              return (
                <li key={`${r.createdAt}-${i}`} className={`record-item ${rl.cls}`}>
                  <span className="record-item__result">{rl.text}</span>
                  <span>{r.mode === "ai" ? p.vsAi : p.twoP}</span>
                  <span className="record-item__meta">
                    {p.moves(r.moves)} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p style={{ marginTop: "var(--sp-3)" }}>
        <Link href="/play/lau-kata-kati" className="btn-clay">
          {p.playCta}
        </Link>
      </p>
    </main>
  );
}
