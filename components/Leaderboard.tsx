"use client";

import { useEffect, useState } from "react";
import { getStorage, type LeaderEntry } from "../lib/storage";
import { useLang } from "../lib/i18n";

/** Top players by AI-mode wins for one game. Renders nothing when empty. */
export default function Leaderboard({ gameId }: { gameId: string }) {
  const { t } = useLang();
  const [rows, setRows] = useState<LeaderEntry[] | null>(null);

  useEffect(() => {
    getStorage().leaderboard(gameId, 5).then(setRows).catch(() => setRows([]));
  }, [gameId]);

  if (!rows || rows.length === 0) return null;

  return (
    <div>
      <p className="eyebrow">{t.leaderboard.title}</p>
      <ol className="font-body" style={{ fontSize: "1.2rem", paddingLeft: "1.4rem", margin: ".5rem 0 0" }}>
        {rows.map((r, i) => (
          <li key={r.userId}>
            <span className="font-label" style={{ fontSize: ".75rem" }}>
              {t.leaderboard.player} {r.userId.slice(0, 8)}
            </span>{" "}
            — {r.aiWins} {r.aiWins === 1 ? t.leaderboard.win : t.leaderboard.wins} {t.leaderboard.vsAi} · {r.games} {t.leaderboard.games}
            {i === 0 && <span className="stamp" style={{ marginLeft: ".5em", fontSize: ".65rem" }}>{t.leaderboard.top}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
