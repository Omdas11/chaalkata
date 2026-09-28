// Chaal-Kaata shared rules engine.
// TypeScript, no dependencies. PURE functions: game state is immutable;
// applyMove always returns a new GameState.

import dashGutiRaw from './boards/dash-guti.json';
import egaraGutiRaw from './boards/egara-guti.json';
import lauKataKatiRaw from './boards/lau-kata-kati.json';
import pretwaRaw from './boards/pretwa.json';
import sixteenSoldiersRaw from './boards/sixteen-soldiers.json';
import sumiNagaWarGameRaw from './boards/sumi-naga-war-game.json';
import terhuchuV1Raw from './boards/terhuchu-v1.json';
import terhuchuV3Raw from './boards/terhuchu-v3.json';

export interface BoardPoint { id: string; x: number; y: number }
export interface BoardDef {
  id: string;
  name: string;
  piecesPerSide: number;
  region: string;
  boardDescription: string;
  points: BoardPoint[];
  edges: [string, string][];
  start: { sideA: string[]; sideB: string[] };
  confidence: 'high' | 'medium' | 'low';
}
export type Side = 'A' | 'B';
export interface Move { from: string; to: string; captures: string[]; path: string[] }
export interface HistoryEntry {
  side: Side; from: string; to: string; captures: string[];
  path: string[]; capturesA: number; capturesB: number;
}
export interface GameState {
  boardId: string;
  occupant: Record<string, Side>;
  turn: Side;
  winner: Side | 'draw' | null;
  winReason: string | null;
  history: HistoryEntry[];
  capturesA: number;
  capturesB: number;
  pliesSinceCapture: number;
  /** Position repetition counts, for the threefold-repetition draw rule.
   *  Key: side-to-move + sorted point:side pairs. Absent on legacy saves. */
  positionCounts: Record<string, number>;
}

const SIXTEEN_SOLDIERS = 'sixteen-soldiers';
const SUMI_NAGA = 'sumi-naga-war-game';
// Terhüchü v3's "skip one junction" refuge move is a documented rule note,
// deliberately NOT encoded in the engine (no extra edges, no special moves).

function asBoardDef(raw: unknown): BoardDef {
  const r = raw as Record<string, unknown>;
  return {
    id: r.id as string,
    name: r.name as string,
    piecesPerSide: r.piecesPerSide as number,
    region: r.region as string,
    boardDescription: r.boardDescription as string,
    points: (r.points as BoardPoint[]).map(p => ({ id: p.id, x: p.x, y: p.y })),
    edges: (r.edges as [string, string][]).map(e => [e[0], e[1]]),
    start: {
      sideA: [...(r.start as { sideA: string[] }).sideA],
      sideB: [...(r.start as { sideB: string[] }).sideB],
    },
    confidence: r.confidence as 'high' | 'medium' | 'low',
  };
}

// Family-tree order (not alphabetical).
const BOARDS: BoardDef[] = [
  'lau-kata-kati', 'pretwa', 'dash-guti', 'terhuchu-v1',
  'egara-guti', 'terhuchu-v3', 'sumi-naga-war-game', 'sixteen-soldiers',
].map(id => {
  const raw: Record<string, unknown> = {
    'lau-kata-kati': lauKataKatiRaw, 'pretwa': pretwaRaw,
    'dash-guti': dashGutiRaw, 'terhuchu-v1': terhuchuV1Raw,
    'egara-guti': egaraGutiRaw, 'terhuchu-v3': terhuchuV3Raw,
    'sumi-naga-war-game': sumiNagaWarGameRaw, 'sixteen-soldiers': sixteenSoldiersRaw,
  }[id] as Record<string, unknown>;
  return asBoardDef(raw);
});

const BY_ID = new Map(BOARDS.map(b => [b.id, b]));

export function other(s: Side): Side { return s === 'A' ? 'B' : 'A'; }

export function getBoard(id: string): BoardDef {
  const b = BY_ID.get(id);
  if (!b) throw new Error(`Unknown board id: ${id}`);
  return b;
}

export function listBoards(): BoardDef[] { return [...BOARDS]; }

// ---- adjacency / geometry caches ----
interface BoardCache {
  neighbors: Map<string, Set<string>>;
  coords: Map<string, { x: number; y: number }>;
}
const CACHE = new Map<string, BoardCache>();
function cache(board: BoardDef): BoardCache {
  let c = CACHE.get(board.id);
  if (!c) {
    const neighbors = new Map<string, Set<string>>();
    for (const p of board.points) neighbors.set(p.id, new Set());
    for (const [a, b] of board.edges) {
      neighbors.get(a)!.add(b);
      neighbors.get(b)!.add(a);
    }
    c = { neighbors, coords: new Map(board.points.map(p => [p.id, { x: p.x, y: p.y }])) };
    CACHE.set(board.id, c);
  }
  return c;
}

// Turn at the jumped piece must not be sharp: the jump must keep going
// through E (angle > 90°), i.e. dot((F-E),(T-E)) < 0. Allows straight-line
// leaps and gentle arc turns (Pretwa's circles); forbids fold-backs.
function turnIsGentle(c: BoardCache, from: string, over: string, to: string): boolean {
  const F = c.coords.get(from)!, E = c.coords.get(over)!, T = c.coords.get(to)!;
  const v1x = F.x - E.x, v1y = F.y - E.y;
  const v2x = T.x - E.x, v2y = T.y - E.y;
  return v1x * v2x + v1y * v2y < 0;
}

interface CapturePath { landings: string[]; captured: string[]; }

// All maximal capture paths for the piece on `from`, given the current
// occupancy. Captured pieces are removed as the path is explored, so a path
// may not jump the same enemy twice or land on a square it already used.
function capturePaths(
  c: BoardCache, occupant: Record<string, Side>,
  from: string, side: Side,
): CapturePath[] {
  const enemy = other(side);
  const out: CapturePath[] = [];
  const isEmpty = (p: string, removed: Set<string>) =>
    occupant[p] === undefined || removed.has(p);

  function dfs(
    cur: string, landings: string[], captured: string[],
    removed: Set<string>, landed: Set<string>,
  ): void {
    let extended = false;
    for (const over of c.neighbors.get(cur)!) {
      if (occupant[over] !== enemy || removed.has(over)) continue;
      for (const to of c.neighbors.get(over)!) {
        if (to === cur || !isEmpty(to, removed) || landed.has(to)) continue;
        if (!turnIsGentle(c, cur, over, to)) continue;
        extended = true;
        const nRemoved = new Set(removed); nRemoved.add(over);
        const nLanded = new Set(landed); nLanded.add(to);
        dfs(to, [...landings, to], [...captured, over], nRemoved, nLanded);
      }
    }
    if (!extended && landings.length > 0) out.push({ landings, captured });
  }

  dfs(from, [], [], new Set(), new Set([from]));
  return out;
}

function moveFromPath(from: string, p: CapturePath): Move {
  return { from, to: p.landings[p.landings.length - 1], captures: p.captured, path: [from, ...p.landings] };
}

export function legalMoves(state: GameState, side: Side = state.turn): Move[] {
  if (state.winner !== null) return [];
  const board = getBoard(state.boardId);
  const c = cache(board);
  const captures: Move[] = [];
  const simples: Move[] = [];

  for (const pid of Object.keys(state.occupant)) {
    if (state.occupant[pid] !== side) continue;
    const paths = capturePaths(c, state.occupant, pid, side);
    if (board.id === SIXTEEN_SOLDIERS) {
      // Parker (1909): multi-captures may stop early, so every prefix of a
      // maximal path is also a legal move. Dedupe identical paths.
      const seen = new Set<string>();
      for (const p of paths) {
        for (let i = 1; i <= p.landings.length; i++) {
          const key = pid + '|' + p.landings.slice(0, i).join(',');
          if (seen.has(key)) continue;
          seen.add(key);
          captures.push(moveFromPath(pid, {
            landings: p.landings.slice(0, i),
            captured: p.captured.slice(0, i),
          }));
        }
      }
    } else {
      // Chained captures are compulsory: only maximal paths are legal.
      for (const p of paths) captures.push(moveFromPath(pid, p));
    }
    for (const nb of c.neighbors.get(pid)!) {
      if (state.occupant[nb] === undefined) {
        simples.push({ from: pid, to: nb, captures: [], path: [pid, nb] });
      }
    }
  }

  if (captures.length > 0 && board.id !== SIXTEEN_SOLDIERS) return captures; // mandatory capture
  return board.id === SIXTEEN_SOLDIERS
    ? [...captures, ...simples]   // Parker: captures not mandatory
    : captures.length > 0 ? captures : simples;
}

export function newGame(boardId: string): GameState {
  const board = getBoard(boardId); // throws on unknown id
  const occupant: Record<string, Side> = {};
  for (const p of board.start.sideA) occupant[p] = 'A';
  for (const p of board.start.sideB) occupant[p] = 'B';
  // No game documents a fixed first player; sources agree players choose.
  // Engine default: side A moves first.
  const state: GameState = {
    boardId, occupant, turn: 'A', winner: null, winReason: null,
    history: [], capturesA: 0, capturesB: 0, pliesSinceCapture: 0,
    positionCounts: {},
  };
  state.positionCounts[positionKey(state)] = 1;
  return state;
}

export function pieceCount(state: GameState, side: Side): number {
  let n = 0;
  for (const k of Object.keys(state.occupant)) if (state.occupant[k] === side) n++;
  return n;
}

function sideLabel(s: Side): string { return s === 'A' ? 'Side A' : 'Side B'; }

/** Canonical key for the current position (occupancy + side to move). */
export function positionKey(state: GameState): string {
  const keys = Object.keys(state.occupant).sort();
  return state.turn + '|' + keys.map(k => k + state.occupant[k]).join(',');
}

/** Fill in fields that older saved games (created before threefold draws) may lack. */
export function normalizeState(state: GameState): GameState {
  if (!state.positionCounts || typeof state.positionCounts !== 'object') {
    state.positionCounts = {};
  }
  return state;
}

export function applyMove(state: GameState, move: Move): GameState {
  const mover = state.turn;
  const enemy = other(mover);
  const occupant: Record<string, Side> = { ...state.occupant };
  for (const cp of move.captures) delete occupant[cp];
  delete occupant[move.from];
  occupant[move.to] = mover;

  const capA = state.capturesA + (mover === 'A' ? move.captures.length : 0);
  const capB = state.capturesB + (mover === 'B' ? move.captures.length : 0);
  const pliesSinceCapture = move.captures.length > 0 ? 0 : state.pliesSinceCapture + 1;

  const next: GameState = {
    boardId: state.boardId,
    occupant,
    turn: enemy,
    winner: null,
    winReason: null,
    history: [...state.history, {
      side: mover, from: move.from, to: move.to,
      captures: [...move.captures], path: [...move.path],
      capturesA: capA, capturesB: capB,
    }],
    capturesA: capA,
    capturesB: capB,
    pliesSinceCapture,
    positionCounts: {},
  };

  // 1. Capture-all: opponent has no pieces left.
  //    (Pretwa implements capture-all; the reduce-to-3 dispute is a UI note.)
  if (pieceCount(next, enemy) === 0) {
    next.winner = mover;
    next.winReason = `${sideLabel(mover)} captured all enemy pieces`;
    return next;
  }

  // 2. Opponent has no legal moves.
  if (legalMoves(next, enemy).length === 0) {
    if (state.boardId === SUMI_NAGA) {
      // Hutton documents most-captures scoring, not capture-all.
      const ca = next.capturesA, cb = next.capturesB;
      if (ca !== cb) {
        next.winner = ca > cb ? 'A' : 'B';
        next.winReason = `${sideLabel(next.winner as Side)} wins on captures (${ca} vs ${cb})`;
      } else {
        const pa = pieceCount(next, 'A'), pb = pieceCount(next, 'B');
        if (pa !== pb) {
          next.winner = pa > pb ? 'A' : 'B';
          next.winReason = `Captures tied ${ca}–${cb}; ${sideLabel(next.winner as Side)} has more pieces (${pa} vs ${pb})`;
        } else {
          next.winner = 'draw';
          next.winReason = `Draw — captures tied ${ca}–${cb}, pieces tied ${pa}–${pb}`;
        }
      }
    } else {
      next.winner = mover;
      next.winReason = `${sideLabel(enemy)} has no legal moves`;
    }
    return next;
  }

  // 3. Threefold repetition: the same position (pieces + side to move)
  //    occurring three times is a draw.
  const counts: Record<string, number> = { ...(state.positionCounts ?? {}) };
  const key = positionKey(next);
  counts[key] = (counts[key] ?? 0) + 1;
  next.positionCounts = counts;
  if (counts[key] >= 3) {
    next.winner = 'draw';
    next.winReason = 'Draw — the same position occurred three times';
    return next;
  }

  // 4. Anti-stall: 60 plies without a capture ends the game on material.
  if (pliesSinceCapture >= 60) {
    const pa = pieceCount(next, 'A'), pb = pieceCount(next, 'B');
    if (pa !== pb) {
      next.winner = pa > pb ? 'A' : 'B';
      next.winReason = `60 moves without a capture — more pieces wins (${sideLabel(next.winner as Side)}, ${pa} vs ${pb})`;
    } else {
      next.winner = 'draw';
      next.winReason = `Draw — 60 moves without a capture, equal pieces (${pa})`;
    }
  }
  return next;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export function aiChooseMove(state: GameState, difficulty: Difficulty = 'medium'): Move | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  if (difficulty === 'easy') {
    // Easy: pure random legal move (still obeys compulsory capture,
    // because legalMoves already filters).
    return moves[Math.floor(Math.random() * moves.length)];
  }
  if (difficulty === 'hard') return aiHard(state);
  // Medium: greedy — most captures wins, random among equals.
  let best = -1;
  let pool: Move[] = [];
  for (const m of moves) {
    if (m.captures.length > best) { best = m.captures.length; pool = [m]; }
    else if (m.captures.length === best) pool.push(m);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---- hard AI: negamax with alpha-beta pruning ----

const HARD_DEPTH = 3;
const HARD_NODE_CAP = 40000;
let hardNodes = 0;

/** Static evaluation from `side`'s perspective: material + captures. */
function evaluate(state: GameState, side: Side): number {
  const foe = other(side);
  const pieces = pieceCount(state, side) - pieceCount(state, foe);
  const caps = (side === 'A' ? state.capturesA : state.capturesB)
    - (side === 'A' ? state.capturesB : state.capturesA);
  return pieces * 10 + caps * 12;
}

function negamax(state: GameState, depth: number, alpha: number, beta: number, root: Side): number {
  if (state.winner !== null) {
    if (state.winner === 'draw') return 0;
    return state.winner === root ? 100000 + depth : -(100000 + depth);
  }
  if (depth === 0 || ++hardNodes > HARD_NODE_CAP) {
    const sign = state.turn === root ? 1 : -1;
    return sign * evaluate(state, root);
  }
  let best = -Infinity;
  for (const m of legalMoves(state)) {
    const v = -negamax(applyMove(state, m), depth - 1, -beta, -alpha, root);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function aiHard(state: GameState): Move | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  hardNodes = 0;
  // Captures first: better move ordering, faster pruning.
  const ordered = [...moves].sort((a, b) => b.captures.length - a.captures.length);
  let best: Move | null = null;
  let alpha = -Infinity;
  for (const m of ordered) {
    const v = -negamax(applyMove(state, m), HARD_DEPTH - 1, -Infinity, -alpha, state.turn);
    if (best === null || v > alpha) { alpha = v; best = m; }
  }
  return best;
}

export function boardBounds(board: BoardDef): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of board.points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}
