"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Board3D, { type LastMove } from "../../../components/Board3D";
import PaperPanel from "../../../components/PaperPanel";
import AccountChip from "../../../components/AccountChip";
import Ambience from "../../../components/Ambience";
import SoilBackdrop, { SoilVignette } from "../../../components/SoilBackdrop";
import SoilScene from "../../../components/SoilScene";
import {
  ensureAudio,
  getMuted,
  playCapture,
  playMove,
  playSelect,
  playWin,
  setMuted,
} from "../../../lib/sounds";
import {
  aiChooseMove,
  applyMove,
  getBoard,
  legalMoves,
  newGame,
  type GameState,
  type Move,
  type Side,
} from "../../../lib/engine";
import { getStorage } from "../../../lib/storage";

const GAME_ID = "lau-kata-kati";
const board = getBoard(GAME_ID);

const RULES_BLURB =
  "Two triangles share one apex. Each side holds its nine stones; the centre starts empty. " +
  "Step along the etched lines. Captures are by the short leap — and they are compulsory, " +
  "chained while they last. If you cannot move, you lose; otherwise the most stones standing wins.";

function sideName(side: Side, mode: "ai" | "2p"): string {
  if (mode === "ai") return side === "A" ? "You (dark)" : "AI (pale)";
  return side === "A" ? "Side A (dark)" : "Side B (pale)";
}

function isValidSaved(s: unknown): s is GameState {
  if (!s || typeof s !== "object") return false;
  const g = s as Record<string, unknown>;
  return g.boardId === GAME_ID && typeof g.occupant === "object" && Array.isArray(g.history);
}

export default function LauKataKatiPage() {
  const [state, setState] = useState<GameState>(() => newGame(GAME_ID));
  const [selected, setSelected] = useState<string | null>(null);
  const [moveSeq, setMoveSeq] = useState(0);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [mode, setMode] = useState<"ai" | "2p">("ai");
  const [saveAvailable, setSaveAvailable] = useState(false);
  const [muted, setMutedState] = useState(false);
  const startTime = useRef(Date.now());
  const resultSaved = useRef(false);

  useEffect(() => {
    setMutedState(getMuted());
  }, []);

  const toggleMute = () => {
    ensureAudio();
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const moves = useMemo(() => legalMoves(state), [state]);
  const selectedMoves = useMemo(
    () => (selected ? moves.filter((m) => m.from === selected) : []),
    [moves, selected],
  );
  const activePoints = useMemo(() => [...new Set(moves.map((m) => m.from))], [moves]);

  const doMove = (mv: Move) => {
    const ns = applyMove(state, mv);
    setState(ns);
    setSelected(null);
    setMoveSeq((s) => s + 1);
    setLastMove({ from: mv.from, to: mv.to, path: mv.path, captures: mv.captures });
    ensureAudio();
    if (mv.captures.length > 0) playCapture();
    else playMove();
  };
  const doMoveRef = useRef(doMove);
  doMoveRef.current = doMove;

  const onSelectPoint = (pid: string) => {
    if (state.winner) return;
    if (mode === "ai" && state.turn === "B") return; // AI's turn
    ensureAudio();
    if (state.occupant[pid] === state.turn) {
      setSelected((s) => {
        if (s !== pid) playSelect();
        return s === pid ? null : pid;
      });
      return;
    }
    if (selected) {
      const mv = moves.find((m) => m.from === selected && m.to === pid);
      if (mv) doMoveRef.current(mv);
      else setSelected(null);
    }
  };

  // AI replies as Side B.
  useEffect(() => {
    if (mode !== "ai" || state.turn !== "B" || state.winner) return;
    const t = setTimeout(() => {
      const mv = aiChooseMove(state);
      if (mv) doMoveRef.current(mv);
    }, 650);
    return () => clearTimeout(t);
  }, [mode, state]);

  // Auto-save after every move; offer resume on load.
  useEffect(() => {
    if (state.history.length === 0) return;
    getStorage()
      .saveGame({ gameId: GAME_ID, state, updatedAt: new Date().toISOString() })
      .catch(() => {});
  }, [state]);

  useEffect(() => {
    getStorage()
      .loadGame(GAME_ID)
      .then((s) => {
        if (s && isValidSaved(s.state) && (s.state as GameState).history.length > 0) {
          setSaveAvailable(true);
        }
      })
      .catch(() => {});
  }, []);

  // Record the result once, when the game ends.
  useEffect(() => {
    if (!state.winner || resultSaved.current) return;
    resultSaved.current = true;
    ensureAudio();
    if (state.winner !== "draw") playWin();
    getStorage()
      .saveResult({
        gameId: GAME_ID,
        mode,
        winner: state.winner,
        moves: state.history.length,
        durationSec: Math.round((Date.now() - startTime.current) / 1000),
        createdAt: new Date().toISOString(),
      })
      .catch(() => {});
  }, [state.winner, state.history.length, mode]);

  const restart = () => {
    setState(newGame(GAME_ID));
    setSelected(null);
    setMoveSeq((s) => s + 1);
    setLastMove(null);
    startTime.current = Date.now();
    resultSaved.current = false;
    getStorage().clearGame(GAME_ID).catch(() => {});
  };

  const resume = async () => {
    const s = await getStorage().loadGame(GAME_ID).catch(() => null);
    if (s && isValidSaved(s.state)) {
      setState(s.state as GameState);
      setSelected(null);
      setMoveSeq((n) => n + 1);
      setLastMove(null);
      setSaveAvailable(false);
      startTime.current = Date.now();
      resultSaved.current = (s.state as GameState).winner !== null;
    }
  };

  const switchMode = (m: "ai" | "2p") => {
    setMode(m);
    restart();
  };

  const dots = (n: number, dark: boolean) => (
    <span aria-hidden="true" style={{ letterSpacing: 2 }}>
      {"●".repeat(Math.min(n, 18))}
      <span className="font-type" style={{ fontSize: ".7rem", marginLeft: 6, color: dark ? "#2b2724" : "#8a7a5c" }}>
        {n > 0 ? `×${n}` : "—"}
      </span>
    </span>
  );

  return (
    <>
      <SoilBackdrop />
      <SoilScene />
      <SoilVignette />
      <Ambience />
      <main className="wrap" style={{ position: "relative", zIndex: 2, padding: "2.5rem 0 4rem" }}>
        <PaperPanel tilt="l" tape={["tl", "tr"]} labelledBy="lkk-title">
          <p>
            <Link href="/" className="row-action" style={{ display: "inline-flex", paddingLeft: 0 }}>
              <span className="arr">←</span> all games
            </Link>
          </p>
          <p className="eyebrow">{board.region}</p>
          <h1 id="lkk-title" className="font-display" style={{ margin: "0 0 .25rem" }}>
            {board.name}
          </h1>
          <p className="font-body" style={{ fontSize: "1.2rem", maxWidth: "36rem" }}>{RULES_BLURB}</p>
          <p style={{ margin: ".25rem 0 .75rem" }}>
            <AccountChip />
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", alignItems: "center", margin: "1rem 0" }}>
            <button
              className={`btn-ink font-condensed ${mode === "2p" ? "" : "btn-ink--ghost"}`}
              onClick={() => switchMode("2p")}
              aria-pressed={mode === "2p"}
            >
              2 players
            </button>
            <button
              className={`btn-ink font-condensed ${mode === "ai" ? "" : "btn-ink--ghost"}`}
              onClick={() => switchMode("ai")}
              aria-pressed={mode === "ai"}
            >
              vs AI
            </button>
            <button className="btn-ink btn-ink--ghost font-condensed" onClick={restart}>
              ↻ Restart
            </button>
            <button
              className="btn-ink btn-ink--ghost font-condensed"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={muted ? "Unmute sounds" : "Mute sounds"}
              title={muted ? "Unmute sounds" : "Mute sounds"}
            >
              {muted ? "🔇 Muted" : "🔊 Sound"}
            </button>
            {saveAvailable && state.history.length === 0 && (
              <button className="btn-ink font-condensed" onClick={resume}>
                Resume saved game
              </button>
            )}
          </div>

          <div
            role="status"
            aria-live="polite"
            style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: ".5rem" }}
          >
            {state.winner ? (
              <span className="stamp" style={{ fontSize: ".95rem" }}>
                {state.winner === "draw" ? "Draw" : `${sideName(state.winner as Side, mode)} wins`} — {state.winReason}
              </span>
            ) : (
              <span className="font-display" style={{ fontSize: "1.5rem", color: "var(--ink)" }}>
                {sideName(state.turn, mode)} to move
                {mode === "ai" && state.turn === "B" ? "…" : ""}
              </span>
            )}
            <span className="font-type" style={{ fontSize: ".72rem", opacity: 0.8 }}>
              move {state.history.length + 1}
            </span>
          </div>

          <div
            style={{
              height: "min(66vh, 560px)",
              minHeight: 340,
              position: "relative",
              margin: "0 auto",
              maxWidth: 640,
            }}
          >
            <Board3D
              board={board}
              occupant={state.occupant}
              turn={state.turn}
              selected={selected}
              selectedMoves={selectedMoves}
              activePoints={activePoints}
              onSelectPoint={onSelectPoint}
              moveSeq={moveSeq}
              lastMove={lastMove}
            />
          </div>

          <hr className="perforation" />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <p className="eyebrow">Captured by dark</p>
              <p className="font-body" style={{ fontSize: "1.3rem", margin: ".25rem 0" }}>{dots(state.capturesA, true)}</p>
            </div>
            <div>
              <p className="eyebrow">Captured by pale</p>
              <p className="font-body" style={{ fontSize: "1.3rem", margin: ".25rem 0" }}>{dots(state.capturesB, false)}</p>
            </div>
          </div>

          {state.history.length > 0 && (
            <>
              <hr className="perforation" />
              <p className="eyebrow">Moves</p>
              <ol
                reversed
                className="font-body"
                style={{
                  maxHeight: 160,
                  overflowY: "auto",
                  paddingLeft: "1.4rem",
                  fontSize: "1.1rem",
                  margin: ".5rem 0 0",
                }}
              >
                {[...state.history].map((h, i) => (
                  <li key={i}>
                    {h.side === "A" ? "Dark" : "Pale"}: {h.from} → {h.to}
                    {h.captures.length > 0 && (
                      <strong style={{ color: "var(--accent)" }}> ×{h.captures.length}</strong>
                    )}
                  </li>
                )).reverse()}
              </ol>
            </>
          )}
        </PaperPanel>
      </main>
    </>
  );
}
