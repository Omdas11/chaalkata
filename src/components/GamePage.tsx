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

interface GamePageProps {
  id: string;
  onBack: () => void;
}

type Mode = '2p' | 'ai';

export default function GamePage({ id, onBack }: GamePageProps) {
  const board = useMemo(() => getBoard(id), [id]);
  const meta = GAME_META[id];
  const [state, setState] = useState<GameState>(() => newGame(id));
  const [mode, setMode] = useState<Mode>('2p');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAcc, setOpenAcc] = useState<'history' | 'rules' | 'caveat' | null>(null);
  const aiTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const restart = () => {
    if (aiTimer.current) window.clearTimeout(aiTimer.current);
    setState(newGame(id));
    setSelectedId(null);
  };

  // AI plays side B after a short delay
  useEffect(() => {
    if (mode !== 'ai' || state.turn !== 'B' || state.winner) return;
    aiTimer.current = window.setTimeout(() => {
      const mv = aiChooseMove(stateRef.current);
      if (mv) {
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

  const occupant: Record<string, 'A' | 'B' | null> = {};
  for (const p of board.points) occupant[p.id] = state.occupant[p.id] ?? null;

  const onPointTap = (pid: string) => {
    if (state.winner) return;
    if (mode === 'ai' && state.turn === 'B') return;
    const occ = state.occupant[pid];
    if (selectedId && legalTargetIds.includes(pid)) {
      const mv = targetsFor(selectedId).find((m) => m.to === pid);
      if (mv) {
        setState((s) => applyMove(s, mv));
        setSelectedId(null);
      }
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
        <button className="link-btn" onClick={onBack}>← Tree</button>
        <div className="mode-toggle" role="group" aria-label="Game mode">
          <button className={mode === '2p' ? 'active' : ''} onClick={() => { setMode('2p'); restart(); }}>
            2 players
          </button>
          <button className={mode === 'ai' ? 'active' : ''} onClick={() => { setMode('ai'); restart(); }}>
            vs AI
          </button>
        </div>
        <button className="link-btn" onClick={restart}>↻ Restart</button>
      </header>

      <div className="game-title">
        <h1>{meta.title}</h1>
        <p className="subtitle">{meta.subtitle}</p>
      </div>

      {!state.winner && (
        <div className={`turn-banner turn-${state.turn}`}>
          <span className="turn-dot" />
          {mode === 'ai' && state.turn === 'B' ? 'AI is thinking…' : `${turnName} to move`}
          {allLegal.some((m) => m.captures.length > 0) && id !== 'sixteen-soldiers' && (
            <span className="capture-note"> — capture is compulsory</span>
          )}
        </div>
      )}

      {state.winner && (
        <div className="winner-banner">
          <div className="winner-title">
            {state.winner === 'draw' ? 'Draw' : `${winnerName} wins`}
          </div>
          {state.winReason && <div className="winner-reason">{state.winReason}</div>}
          <button className="btn-primary" onClick={restart}>Play again</button>
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
        <div>Captured by Maroon {tray(state.capturesA, 'tray-a')}</div>
        <div>Captured by Ivory {tray(state.capturesB, 'tray-b')}</div>
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
