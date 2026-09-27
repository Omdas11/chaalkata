import { useEffect, useMemo, useRef, useState } from 'react';
import {
  aiChooseMove,
  applyMove,
  getBoard,
  legalMoves,
  newGame,
  pieceCount,
  type GameState,
  type Move,
} from '../engine';
import { GAME_META } from '../gameMeta';
import BoardView from './BoardView';
import { isSoundMuted, playSound, setSoundMuted } from '../sound';

interface GamePageProps {
  id: string;
  onBack: () => void;
}

type Mode = '2p' | 'ai';

/** Deterministic confetti pieces for the winner banner (no Math.random in render). */
const CONFETTI_COLORS = ['#d97706', '#f5ead6', '#b45309', '#e9b44c', '#f7f1e3'];
const CONFETTI_PIECES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: ((i * 37) % 10) * 0.28,
  dur: 2.2 + ((i * 29) % 10) * 0.12,
}));

export default function GamePage({ id, onBack }: GamePageProps) {
  const board = useMemo(() => getBoard(id), [id]);
  const meta = GAME_META[id];
  const [state, setState] = useState<GameState>(() => newGame(id));
  const [mode, setMode] = useState<Mode>('2p');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAcc, setOpenAcc] = useState<'history' | 'rules' | 'caveat' | null>(null);
  const [muted, setMuted] = useState(isSoundMuted);
  const aiTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const restart = () => {
    if (aiTimer.current) window.clearTimeout(aiTimer.current);
    setState(newGame(id));
    setSelectedId(null);
  };

  const toggleMute = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
    if (!next) playSound('click'); // audible confirmation when unmuting
  };

  /** Sounds for a completed move: tap on placement, knock on capture. */
  const playMoveSounds = (mv: Move) => {
    playSound('place');
    if (mv.captures.length > 0) playSound('capture');
  };

  // AI plays side B after a short delay
  useEffect(() => {
    if (mode !== 'ai' || state.turn !== 'B' || state.winner) return;
    aiTimer.current = window.setTimeout(() => {
      const mv = aiChooseMove(stateRef.current);
      if (mv) {
        playMoveSounds(mv);
        setState((s) => applyMove(s, mv));
        setSelectedId(null);
      }
    }, 450);
    return () => {
      if (aiTimer.current) window.clearTimeout(aiTimer.current);
    };
  }, [mode, state.turn, state.winner, state]);

  const allLegal = useMemo(() => legalMoves(state), [state]);
  const targetsFor = (from: string): Move[] => allLegal.filter((m) => m.from === from);
  const legalTargetIds = selectedId ? targetsFor(selectedId).map((m) => m.to) : [];

  // Subtle tick on turn change (not on first render, not after game over).
  const firstTurn = useRef(true);
  useEffect(() => {
    if (firstTurn.current) {
      firstTurn.current = false;
      return;
    }
    if (!state.winner) playSound('turn');
  }, [state.turn, state.history.length, state.winner]);

  // Win fanfare when a winner first appears.
  const prevWinner = useRef<string | null>(null);
  useEffect(() => {
    if (state.winner && prevWinner.current !== state.winner) playSound('win');
    prevWinner.current = state.winner;
  }, [state.winner]);

  const occupant: Record<string, 'A' | 'B' | null> = {};
  for (const p of board.points) occupant[p.id] = state.occupant[p.id] ?? null;

  const onPointTap = (pid: string) => {
    if (state.winner) return;
    if (mode === 'ai' && state.turn === 'B') return;
    const occ = state.occupant[pid];
    if (selectedId && legalTargetIds.includes(pid)) {
      const mv = targetsFor(selectedId).find((m) => m.to === pid);
      if (mv) {
        playMoveSounds(mv);
        setState((s) => applyMove(s, mv));
        setSelectedId(null);
      }
      return;
    }
    if (selectedId && occ !== state.turn) {
      // A piece is selected and the tap hit an illegal target
      // (empty non-target point or an enemy piece): buzz and deselect.
      setSelectedId(null);
      playSound('invalid');
      return;
    }
    if (occ === state.turn && allLegal.some((m) => m.from === pid)) {
      setSelectedId(pid === selectedId ? null : pid);
    } else if (occ === state.turn) {
      // selected a piece with no legal moves (e.g. capture mandatory elsewhere)
      setSelectedId(pid === selectedId ? null : pid);
    } else {
      setSelectedId(null);
    }
  };

  const lastPath = state.history.length ? state.history[state.history.length - 1].path : [];
  const lastMove = state.history.length ? state.history[state.history.length - 1] : null;
  const countA = pieceCount(state, 'A');
  const countB = pieceCount(state, 'B');

  const tray = (n: number, cls: string) => (
    <div className={`tray ${cls}`} aria-label={`${n} captured pieces`}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="tray-dot" />
      ))}
      <span className="tray-n">{n}</span>
    </div>
  );

  const turnName = state.turn === 'A' ? 'Maroon' : 'Ivory';
  const winnerName = state.winner === 'A' ? 'Maroon' : state.winner === 'B' ? 'Ivory' : null;

  return (
    <div className="game-page">
      <header className="game-topbar">
        <button className="link-btn" onClick={() => { playSound('click'); onBack(); }}>← Tree</button>
        <div className="mode-toggle" role="group" aria-label="Game mode">
          <button className={mode === '2p' ? 'active' : ''} onClick={() => { playSound('click'); setMode('2p'); restart(); }}>
            2 players
          </button>
          <button className={mode === 'ai' ? 'active' : ''} onClick={() => { playSound('click'); setMode('ai'); restart(); }}>
            vs AI
          </button>
        </div>
        <button className="link-btn" onClick={() => { playSound('click'); restart(); }}>↻ Restart</button>
        <button
          className="mute-btn"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      <div className="game-title">
        <h1>{meta.title}</h1>
        <p className="subtitle">{meta.subtitle}</p>
      </div>

      {!state.winner && (
        <div className={`turn-banner turn-${state.turn}`}>
          <span className="turn-dot" />
          <span className="turn-text" key={`${state.turn}-${state.history.length}`}>
            {mode === 'ai' && state.turn === 'B' ? 'AI is thinking…' : `${turnName} to move`}
          </span>
          {allLegal.some((m) => m.captures.length > 0) && id !== 'sixteen-soldiers' && (
            <span className="capture-note"> — capture is compulsory</span>
          )}
        </div>
      )}

      {state.winner && (
        <div className="winner-banner">
          <div className="confetti-field" aria-hidden="true">
            {CONFETTI_PIECES.map((c, i) => (
              <span
                key={i}
                className="confetti"
                style={{
                  left: `${c.left}%`,
                  background: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.dur}s`,
                }}
              />
            ))}
          </div>
          <div className="winner-title">
            {state.winner === 'draw' ? 'Draw' : `${winnerName} wins`}
          </div>
          {state.winReason && <div className="winner-reason">{state.winReason}</div>}
          <button className="btn-primary" onClick={() => { playSound('click'); restart(); }}>Play again</button>
        </div>
      )}

      <div className="board-wrap">
        <BoardView
          board={board}
          occupant={occupant}
          selectedId={selectedId}
          legalTargets={legalTargetIds}
          lastMovePath={lastPath}
          interactive={!state.winner && !(mode === 'ai' && state.turn === 'B')}
          onPointTap={onPointTap}
          moveSeq={state.history.length}
          landedId={lastMove?.to ?? null}
          lastCaptured={lastMove?.captures ?? []}
          lastMoveSide={lastMove?.side ?? null}
        />
      </div>

      <div className="score-row">
        <div className="score">
          <span className="score-dot score-a" /> Maroon · {countA} left
        </div>
        <div className="score">
          <span className="score-dot score-b" /> Ivory · {countB} left
        </div>
      </div>
      <div className="tray-row">
        <div><span className="tray-label">Captured by Maroon</span> {tray(state.capturesA, 'tray-a')}</div>
        <div><span className="tray-label">Captured by Ivory</span> {tray(state.capturesB, 'tray-b')}</div>
      </div>

      {state.history.length > 0 && (
        <details className="accordion">
          <summary>Move list ({state.history.length})</summary>
          <ol className="moves">
            {state.history.map((h, i) => (
              <li key={i}>
                <span className={h.side === 'A' ? 'mv-a' : 'mv-b'}>{h.side === 'A' ? 'M' : 'I'}</span>
                {' '}{h.from} → {h.to}
                {h.captures.length > 0 && (
                  <span className="mv-cap"> ✕ {h.captures.join(', ')}</span>
                )}
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="accordions">
        <details className="accordion" open={openAcc === 'history'} onToggle={(e) => setOpenAcc((e.target as HTMLDetailsElement).open ? 'history' : null)}>
          <summary>History</summary>
          <p>{meta.history}</p>
        </details>
        <details className="accordion" open={openAcc === 'rules'} onToggle={(e) => setOpenAcc((e.target as HTMLDetailsElement).open ? 'rules' : null)}>
          <summary>Rules</summary>
          <p>{meta.rules}</p>
        </details>
        <details className="accordion" open={openAcc === 'caveat'} onToggle={(e) => setOpenAcc((e.target as HTMLDetailsElement).open ? 'caveat' : null)}>
          <summary>Scholarly caveat</summary>
          <p>{meta.caveat}</p>
        </details>
      </div>
    </div>
  );
}
