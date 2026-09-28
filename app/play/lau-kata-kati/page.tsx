"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Board3D, { type LastMove } from "../../../components/Board3D";
import AccessibleBoard from "../../../components/AccessibleBoard";
import GamosaStrip from "../../../components/GamosaStrip";
import Icon from "../../../components/Icon";
import Footer from "../../../components/Footer";
import { MenuDrawer } from "../../../components/SiteChrome";
import Ambience from "../../../components/Ambience";
import {
  buzz,
  ensureAudio,
  getMuted,
  playCapture,
  playInvalid,
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
  normalizeState,
  pieceCount,
  type Difficulty,
  type GameState,
  type Move,
  type Side,
} from "../../../lib/engine";
import { getStorage } from "../../../lib/storage";
import { useLang, translateReason, type Dict } from "../../../lib/i18n";

const GAME_ID = "lau-kata-kati";
const board = getBoard(GAME_ID);

const DIFFICULTY_IDS: Difficulty[] = ["easy", "medium", "hard"];

function sideName(side: Side, mode: "ai" | "2p", t: Dict): string {
  if (mode === "ai") return side === "A" ? t.game.youDark : t.game.aiPale;
  return side === "A" ? t.game.sideADark : t.game.sideBPale;
}

function isValidSaved(s: unknown): s is GameState {
  if (!s || typeof s !== "object") return false;
  const g = s as Record<string, unknown>;
  return g.boardId === GAME_ID && typeof g.occupant === "object" && Array.isArray(g.history);
}

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLS(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

const pt = (id: string) => id.replace(/^p/, "");

// Keyed by n at the call site so the pop animation replays on every capture.
function CounterTick({ n }: { n: number }) {
  return (
    <span className="font-label counter-pop counter-pop--tick" style={{ marginLeft: 8 }}>
      ×{n}
    </span>
  );
}

export default function LauKataKatiPage() {
  const { t } = useLang();
  const [state, setState] = useState<GameState>(() => newGame(GAME_ID));
  const [selected, setSelected] = useState<string | null>(null);
  const [moveSeq, setMoveSeq] = useState(0);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [mode, setMode] = useState<"ai" | "2p">(() => (readLS("ck-mode") === "2p" ? "2p" : "ai"));
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const d = readLS("ck-difficulty");
    return d === "easy" || d === "hard" ? d : "medium";
  });
  const [saveAvailable, setSaveAvailable] = useState(false);
  const [muted, setMutedState] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const startTime = useRef(Date.now());
  const resultSaved = useRef(false);
  const undoStack = useRef<GameState[]>([]);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    setMutedState(getMuted());
  }, []);

  const toggleMute = () => {
    ensureAudio();
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const flashNotice = (msg: string) => {
    setNotice(msg);
    playInvalid();
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  };

  const moves = useMemo(() => legalMoves(state), [state]);
  const selectedMoves = useMemo(
    () => (selected ? moves.filter((m) => m.from === selected) : []),
    [moves, selected],
  );
  const activePoints = useMemo(() => [...new Set(moves.map((m) => m.from))], [moves]);
  const mustCapture = useMemo(() => moves.some((m) => m.captures.length > 0), [moves]);
  const captureFrom = useMemo(
    () => (mustCapture ? [...new Set(moves.filter((m) => m.captures.length > 0).map((m) => m.from))] : []),
    [moves, mustCapture],
  );

  const doMove = (mv: Move) => {
    const t = tRef.current;
    undoStack.current.push(state);
    if (undoStack.current.length > 200) undoStack.current.shift();
    setCanUndo(true);
    const mover = state.turn;
    const ns = applyMove(state, mv);
    setState(ns);
    setSelected(null);
    setMoveSeq((s) => s + 1);
    setLastMove({ from: mv.from, to: mv.to, path: mv.path, captures: mv.captures });
    ensureAudio();
    if (mv.captures.length > 0) {
      playCapture();
      buzz([25, 40, 25]);
    } else {
      playMove();
      buzz(15);
    }
    let msg = t.game.announceMove(sideName(mover, mode, t), pt(mv.from), pt(mv.to));
    if (mv.captures.length > 0) msg += " " + t.game.announceCaptured(mv.captures.length);
    if (ns.winner) {
      msg += " " + t.game.announceGameOver(translateReason(ns.winReason, t));
    } else {
      msg += " " + t.game.announceTurn(sideName(ns.turn, mode, t));
    }
    setAnnouncement(msg);
  };
  const doMoveRef = useRef(doMove);
  doMoveRef.current = doMove;

  const onSelectPoint = (pid: string) => {
    const t = tRef.current;
    if (state.winner) return;
    if (mode === "ai" && state.turn === "B") return; // AI's turn
    ensureAudio();
    if (selected) {
      if (pid === selected) {
        setSelected(null);
        return;
      }
      const mv = moves.find((m) => m.from === selected && m.to === pid);
      if (mv) {
        doMoveRef.current(mv);
        return;
      }
      // Tapping elsewhere: not a legal destination from the selected stone.
      if (state.occupant[pid] !== state.turn) {
        flashNotice(
          mustCapture ? t.game.noticeCapture : t.game.noticeInvalid,
        );
        return;
      }
      // else: fall through and select the newly tapped own stone
    }
    if (state.occupant[pid] === state.turn) {
      if (selected !== pid) playSelect();
      setSelected(pid);
      const mine = moves.filter((m) => m.from === pid);
      if (mine.length === 0 && mustCapture) {
        flashNotice(t.game.noticeMustCapture);
      }
      return;
    }
    // Tapped an empty point or enemy stone with nothing selected: nothing to refuse yet.
  };

  // AI replies as Side B.
  useEffect(() => {
    if (mode !== "ai" || state.turn !== "B" || state.winner) return;
    setAnnouncement(tRef.current.game.announceAi(tRef.current.game[difficulty]));
    const t = setTimeout(() => {
      const mv = aiChooseMove(state, difficulty);
      if (mv) doMoveRef.current(mv);
    }, 650);
    return () => clearTimeout(t);
  }, [mode, state, difficulty]);

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

  // Focus the game-over dialog for keyboard / screen-reader users.
  const showDialog = !!state.winner && !dismissed;
  useEffect(() => {
    if (showDialog) dialogRef.current?.focus();
  }, [showDialog]);

  const restart = () => {
    setState(newGame(GAME_ID));
    setSelected(null);
    setMoveSeq((s) => s + 1);
    setLastMove(null);
    setNotice(null);
    setDismissed(false);
    setCanUndo(false);
    undoStack.current = [];
    startTime.current = Date.now();
    resultSaved.current = false;
    setAnnouncement(tRef.current.game.announceRestarted);
    getStorage().clearGame(GAME_ID).catch(() => {});
  };

  const switchMode = (m: "ai" | "2p") => {
    setMode(m);
    writeLS("ck-mode", m);
    restart();
  };

  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    writeLS("ck-difficulty", d);
  };

  const undo = () => {
    const stack = undoStack.current;
    if (stack.length === 0) return;
    // Undo a full turn: your move plus the AI's reply (one move in 2p).
    const steps = mode === "ai" ? 2 : 1;
    let prev: GameState | undefined;
    for (let i = 0; i < steps && stack.length > 0; i++) prev = stack.pop();
    if (!prev) return;
    setState(prev);
    setSelected(null);
    setMoveSeq((s) => s + 1);
    setLastMove(null);
    setDismissed(false);
    setCanUndo(stack.length > 0);
    resultSaved.current = prev.winner !== null;
    setAnnouncement(tRef.current.game.announceUndone);
  };

  const resume = async () => {
    const s = await getStorage().loadGame(GAME_ID).catch(() => null);
    if (s && isValidSaved(s.state)) {
      setState(normalizeState(s.state as GameState));
      setSelected(null);
      setMoveSeq((n) => n + 1);
      setLastMove(null);
      setSaveAvailable(false);
      setDismissed(false);
      setCanUndo(false);
      undoStack.current = [];
      startTime.current = Date.now();
      resultSaved.current = (s.state as GameState).winner !== null;
      setAnnouncement(tRef.current.game.announceResumed);
    }
  };

  const thinking = mode === "ai" && state.turn === "B" && !state.winner;

  const dots = (n: number, label: string) => (
    <span>
      <span aria-hidden="true" style={{ letterSpacing: 2 }}>
        {"●".repeat(Math.min(n, 18))}
      </span>
      <CounterTick key={n} n={n} />
      <span className="sr-only">{label}: {n}</span>
    </span>
  );

  const resultText = state.winner
    ? state.winner === "draw"
      ? t.game.draw
      : t.game.wins(sideName(state.winner as Side, mode, t))
    : null;

  const diffLabel = (d: Difficulty) => t.game[d];

  const controls = (
    <div className="drawer-controls">
      <div className="seg-row" role="group" aria-label={t.game.twoPlayers}>
        <button
          className={`btn-clay btn-clay--sm ${mode === "2p" ? "" : "btn-clay--ghost"}`}
          onClick={() => switchMode("2p")}
          aria-pressed={mode === "2p"}
        >
          <Icon name="users" size={16} /> {t.game.twoPlayers}
        </button>
        <button
          className={`btn-clay btn-clay--sm ${mode === "ai" ? "" : "btn-clay--ghost"}`}
          onClick={() => switchMode("ai")}
          aria-pressed={mode === "ai"}
        >
          {t.game.vsAi}
        </button>
      </div>
      {mode === "ai" && (
        <div className="seg-row" role="group" aria-label={t.game.difficulty}>
          {DIFFICULTY_IDS.map((d) => (
            <button
              key={d}
              className={`btn-clay btn-clay--sm ${difficulty === d ? "" : "btn-clay--ghost"}`}
              onClick={() => changeDifficulty(d)}
              aria-pressed={difficulty === d}
            >
              {diffLabel(d)}
            </button>
          ))}
        </div>
      )}
      <button className="btn-clay btn-clay--sm btn-clay--ghost" onClick={restart}>
        <Icon name="restart" size={16} /> {t.game.restart}
      </button>
      {mode === "ai" && (
        <button className="btn-clay btn-clay--sm btn-clay--ghost" onClick={undo} disabled={!canUndo}>
          <Icon name="undo" size={16} /> {t.game.undo}
        </button>
      )}
      <button
        className="btn-clay btn-clay--sm btn-clay--ghost"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? t.game.unmute : t.game.mute}
        title={muted ? t.game.unmute : t.game.mute}
      >
        {muted ? <><Icon name="sound-off" size={16} /> {t.game.soundOff}</> : <><Icon name="sound-on" size={16} /> {t.game.soundOn}</>}
      </button>
      {saveAvailable && state.history.length === 0 && (
        <button className="btn-clay btn-clay--sm" onClick={resume}>
          {t.game.resume}
        </button>
      )}
    </div>
  );

  return (
    <>
      <Ambience />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Lau Kata Kati",
            alternateName: "Kowwu Dunki",
            url: "https://chaalkata.vercel.app/play/lau-kata-kati",
            description:
              "Play Lau Kata Kati, a classic Indian board game. Nine stones a side, cuts compulsory. Free browser play vs AI or a friend.",
            genre: ["Board Game", "Strategy"],
            playMode: ["SinglePlayer", "MultiPlayer"],
            applicationCategory: "Game",
            operatingSystem: "Web",
            inLanguage: ["en", "bn"],
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          }),
        }}
      />
      <MenuDrawer controls={controls} />
      <main className="wrap page-main">
        <section aria-labelledby="lkk-title">
          <p className="eyebrow">{t.game.region}</p>
          <h1 id="lkk-title" className="font-display">
            {t.game.title}
          </h1>
          <p className="lede font-body">{t.game.rules}</p>
        </section>

        <section aria-label={t.game.moves} style={{ marginTop: "1.2rem" }}>
          {notice && (
            <p className="notice" role="alert">
              {notice}
            </p>
          )}

          <div
            className={`turn-banner${mode === "2p" && state.turn === "B" ? " turn-banner--flip" : ""}`}
            role="status"
            aria-live="polite"
          >
            {!state.winner && (
              <span
                className="dot"
                aria-hidden="true"
                style={{ background: state.turn === "A" ? "#241a10" : "#e8dcc2" }}
              />
            )}
            {resultText ? (
              <span className="stamp" style={{ fontSize: ".95rem" }}>{resultText}</span>
            ) : (
              <span>
                {t.game.turnYou(sideName(state.turn, mode, t))}{thinking ? ` — ${t.game.turnThinking}` : ""}
              </span>
            )}
            <span className="font-label" style={{ opacity: 0.7, fontSize: ".72rem" }}>
              {t.game.moveN(state.history.length + 1)}
            </span>
          </div>

          <div className="sr-only" aria-live="polite">
            {announcement}
          </div>

          <AccessibleBoard
            board={board}
            occupant={state.occupant}
            movable={activePoints}
            selected={selected}
            onSelectPoint={onSelectPoint}
          />

          <div className="board-stage">
            <Board3D
              board={board}
              occupant={state.occupant}
              turn={state.turn}
              selected={selected}
              selectedMoves={selectedMoves}
              activePoints={activePoints}
              captureFrom={captureFrom}
              onSelectPoint={onSelectPoint}
              moveSeq={moveSeq}
              lastMove={lastMove}
            />
          </div>
        </section>

        <section aria-label={t.game.moves}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <p className="eyebrow">{t.game.capturedBy(t.game.dark)}</p>
              <p className="font-body" style={{ fontSize: "1.3rem", margin: ".25rem 0" }}>
                {dots(state.capturesA, t.game.capturedBy(t.game.dark))}
              </p>
            </div>
            <div>
              <p className="eyebrow">{t.game.capturedBy(t.game.pale)}</p>
              <p className="font-body" style={{ fontSize: "1.3rem", margin: ".25rem 0" }}>
                {dots(state.capturesB, t.game.capturedBy(t.game.pale))}
              </p>
            </div>
          </div>

          {state.history.length > 0 && (
            <>
              <GamosaStrip />
              <p className="eyebrow">{t.game.moves}</p>
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
                    {h.side === "A" ? t.game.dark : t.game.pale}: {pt(h.from)} → {pt(h.to)}
                    {h.captures.length > 0 && (
                      <strong className="hl-turmeric"> ×{h.captures.length}</strong>
                    )}
                  </li>
                )).reverse()}
              </ol>
            </>
          )}

          <GamosaStrip />
          <nav aria-label={t.menu.nav} style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            <Link href="/how-to-play/lau-kata-kati" className="btn-clay btn-clay--ghost btn-clay--sm">
              <Icon name="book" size={16} /> {t.menu.howToPlay}
            </Link>
            <Link href="/history/lau-kata-kati" className="btn-clay btn-clay--ghost btn-clay--sm">
              <Icon name="scroll" size={16} /> {t.menu.history}
            </Link>
          </nav>
        </section>

        <Footer />
      </main>

      {showDialog && (
        <div className="dialog-overlay" onKeyDown={(e) => e.key === "Escape" && setDismissed(true)}>
          <div className="dialog">
            <div
              ref={dialogRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="game-over-title"
              style={{ outline: "none" }}
            >
              <span className="stamp">{state.winner === "draw" ? t.game.draw : t.game.gameOver}</span>
              <h2 id="game-over-title" className="font-display">
                {resultText}
              </h2>
              <p className="font-body" style={{ opacity: 0.85 }}>{translateReason(state.winReason, t)}</p>
              <p className="font-body">
                {t.game.standing(pieceCount(state, "A"), pieceCount(state, "B"))}
              </p>
              <div className="dialog-actions">
                <button className="btn-clay" onClick={restart} autoFocus>
                  <Icon name="play" size={18} /> {t.game.playAgain}
                </button>
                <Link href="/" className="btn-clay btn-clay--ghost">
                  {t.game.allGames}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
