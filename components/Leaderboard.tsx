"use client";

import { useEffect, useState } from "react";
import { getStorage, type LeaderEntry } from "../lib/storage";

/** Top players by AI-mode wins for one game. Renders nothing when empty. */
export default function Leaderboard({ gameId }: { gameId: string }) {
  const [rows, setRows] = useState<LeaderEntry[] | null>(null);

  useEffect(() => {
    getStorage().leaderboard(gameId, 5).then(setRows).catch(() => setRows([]));
  }, [gameId]);

  if (!rows || rows.length === 0) return null;

  return (
    <div>
      <p className="eyebrow">Hall of fame · Lau Kata Kati</p>
      <ol className="font-body" style={{ fontSize: "1.2rem", paddingLeft: "1.4rem", margin: ".5rem 0 0" }}>
        {rows.map((r, i) => (
          <li key={r.userId}>
            <span className="font-type" style={{ fontSize: ".75rem" }}>
              player {r.userId.slice(0, 8)}
            </span>{" "}
            — {r.aiWins} {r.aiWins === 1 ? "win" : "wins"} vs AI · {r.games} games
            {i === 0 && <span className="hl-badge" style={{ marginLeft: ".5em" }}>top</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
