// Chaal-Kaata engine smoke test.
// Run from ~/workspace/chaalkata/site:  npx --yes tsx engine-smoke.ts
// 1) Unit checks: opening move legality, hand-placed captures, fold-back
//    rejection, maximal vs prefix multi-jump rules, mandatory-capture switch.
// 2) AI vs AI full games on all 8 boards (max 600 plies).
// Exits non-zero on any failure.

import {
  newGame, legalMoves, applyMove, aiChooseMove, listBoards, pieceCount,
  boardBounds, other, getBoard,
  type GameState, type Move,
} from './src/engine';

let failures = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) console.log(`  ok: ${name}`);
  else { failures++; console.log(`  FAIL: ${name} ${detail}`); }
}
function blankOn(boardId: string, occupant: Record<string, 'A' | 'B'>, turn: 'A' | 'B' = 'A'): GameState {
  return {
    boardId, occupant: { ...occupant }, turn, winner: null, winReason: null,
    history: [], capturesA: 0, capturesB: 0, pliesSinceCapture: 0,
  };
}
const hasMove = (moves: Move[], from: string, path: string[], captures: string[]) =>
  moves.some(m => m.from === from &&
    JSON.stringify(m.path) === JSON.stringify(path) &&
    JSON.stringify(m.captures) === JSON.stringify(captures));
const SUMI = 'sumi-naga-war-game';

console.log('== unit checks ==');

// --- lau-kata-kati opening: simple moves only, no captures ---
{
  const s = newGame('lau-kata-kati');
  const mA = legalMoves(s, 'A');
  const mB = legalMoves(s, 'B');
  check('opening A moves exist', mA.length > 0, `got ${mA.length}`);
  check('opening A has no captures', mA.every(m => m.captures.length === 0));
  check('opening B moves exist', mB.length > 0, `got ${mB.length}`);
  check('opening B has no captures', mB.every(m => m.captures.length === 0));
  check('opening moves are all simple (path len 2)', mA.every(m => m.path.length === 2));
  // Apex p9 starts empty; every A move should head toward the apex region
  check('A can move into apex p9', mA.some(m => m.to === 'p9'));
  check('turn defaults to A', s.turn === 'A');
  check('piece counts 9/9', pieceCount(s, 'A') === 9 && pieceCount(s, 'B') === 9);
}

// --- hand-placed single capture (p6 -> p10 over p9) ---
{
  const s = blankOn('lau-kata-kati', { p6: 'A', p9: 'B' });
  const moves = legalMoves(s, 'A');
  check('single capture found', hasMove(moves, 'p6', ['p6', 'p10'], ['p9']));
  check('mandatory capture: no simple moves', moves.every(m => m.captures.length > 0),
    JSON.stringify(moves.map(m => m.path)));
  // fold-back / sharp turn rejected: p6 -> p8 over p9 has dot > 0
  check('sharp turn p6->p8 over p9 rejected',
    !moves.some(m => m.from === 'p6' && m.to === 'p8'));
  // applyMove is pure and updates state correctly
  const mv = moves.find(m => m.from === 'p6')!;
  const s2 = applyMove(s, mv);
  check('applyMove pure (input untouched)', s.occupant['p6'] === 'A' && s.occupant['p9'] === 'B');
  check('applyMove moves piece + removes captive',
    s2.occupant['p10'] === 'A' && s2.occupant['p9'] === undefined && s2.occupant['p6'] === undefined);
  check('applyMove flips turn', s2.turn === 'B');
  check('capturesA incremented', s2.capturesA === 1 && s2.capturesB === 0);
  check('pliesSinceCapture reset', s2.pliesSinceCapture === 0);
  check('history recorded', s2.history.length === 1 && s2.history[0].capturesA === 1);
}

// --- multi-jump maximality on lau-kata-kati (only full path legal) ---
{
  // p6->p10 over p9, then p10->p12 over p11 (both gentle turns, verified)
  const s = blankOn('lau-kata-kati', { p6: 'A', p9: 'B', p11: 'B' });
  const moves = legalMoves(s, 'A');
  check('maximal 2-jump present', hasMove(moves, 'p6', ['p6', 'p10', 'p12'], ['p9', 'p11']));
  check('non-maximal prefix NOT legal (compulsory chain)',
    !hasMove(moves, 'p6', ['p6', 'p10'], ['p9']));
}

// --- sixteen-soldiers: non-maximal prefixes ARE legal, captures NOT mandatory ---
{
  // 2-chain: p0->p3 over p1, then p3->p5 over p4 (verified geometry)
  const s = blankOn('sixteen-soldiers', { p0: 'A', p1: 'B', p4: 'B' });
  const moves = legalMoves(s, 'A');
  check('16soldiers full path present', hasMove(moves, 'p0', ['p0', 'p3', 'p5'], ['p1', 'p4']),
    JSON.stringify(moves));
  check('16soldiers prefix path present', hasMove(moves, 'p0', ['p0', 'p3'], ['p1']));
  check('16soldiers simple moves also legal (no mandatory capture)',
    moves.some(m => m.captures.length === 0));
}

// --- capture-all win ---
{
  const s = blankOn('lau-kata-kati', { p6: 'A', p9: 'B' });
  const s2 = applyMove(s, legalMoves(s, 'A')[0]);
  check('capture-all wins', s2.winner === 'A' && /captured all/.test(s2.winReason ?? ''));
}

// --- no-legal-moves win: generic harness ---
// Surround B's lone piece at q with A (neighbors + all capture landings),
// then search A's simple moves for one after which B is still immobilized.
function adjacencyOf(boardId: string): Record<string, string[]> {
  const b = getBoard(boardId);
  const adj: Record<string, string[]> = {};
  for (const p of b.points) adj[p.id] = [];
  for (const [a, c] of b.edges) { adj[a].push(c); adj[c].push(a); }
  return adj;
}
function findNoMovesWin(boardId: string, capA = 0, capB = 0)
  : { base: GameState; move: Move } | null {
  const adj = adjacencyOf(boardId);
  const b = getBoard(boardId);
  const pts = b.points.map(p => p.id);
  for (const q of pts) {
    const occ: Record<string, 'A' | 'B'> = { [q]: 'B' };
    const near = new Set<string>([q]);
    for (const nb of adj[q]) { occ[nb] = 'A'; near.add(nb); }
    for (const nb of adj[q]) for (const t of adj[nb])
      if (t !== q && occ[t] === undefined) { occ[t] = 'A'; near.add(t); }
    // A "far" piece, outside B's whole neighborhood, gives A a move that
    // cannot disturb B's immobilization.
    let far: [string, string] | null = null;
    outer: for (const a of pts) {
      if (near.has(a) || occ[a] !== undefined) continue;
      for (const c of adj[a]) {
        if (!near.has(c) && occ[c] === undefined) { far = [a, c]; break outer; }
      }
    }
    if (!far) continue;
    occ[far[0]] = 'A';
    const base = blankOn(boardId, occ, 'A');
    base.capturesA = capA; base.capturesB = capB;
    if (legalMoves(base, 'B').length !== 0) continue; // B not immobilized pre-move
    const farMove = legalMoves(base, 'A').find(m => m.from === far![0] && m.to === far![1]);
    if (!farMove) continue;
    const s2 = applyMove(base, farMove);
    if (s2.winner === 'A') return { base, move: farMove };
  }
  return null;
}
// Search a genuine most-captures draw on the Sümi board (the only board with
// the most-captures rule): B fully immobilized, captures tied, pieces tied.
// Construction: 24 of 25 points occupied, 12 A / 12 B, one empty square e.
// A's piece at a (adjacent to e) moves a->e. Post-move the only empty square
// is a; every neighbor of a is A (no B simple moves) and every point that
// could jump-capture into a with a gentle turn is A (no B captures).
function findDrawSetup(): { base: GameState; move: Move } | null {
  const b = getBoard(SUMI);
  const adj = adjacencyOf(SUMI);
  const pts = b.points.map(p => p.id);
  const coords = new Map(b.points.map(p => [p.id, { x: p.x, y: p.y }]));
  const gentle = (F: string, E: string, T: string) => {
    const f = coords.get(F)!, e = coords.get(E)!, t = coords.get(T)!;
    return (f.x - e.x) * (t.x - e.x) + (f.y - e.y) * (t.y - e.y) < 0;
  };
  for (const a of pts) {
    for (const e of adj[a]) { // e = pre-move empty square, adjacent to a
      // Points that must be A in the post-move state:
      // a's neighbors (block B simple moves into a) and every gentle
      // distance-2 jump source into a (block B captures into a).
      const mustA = new Set<string>([a, ...adj[a]]);
      for (const E of adj[a]) for (const F of adj[E]) {
        if (F !== a && gentle(F, E, a)) mustA.add(F);
      }
      mustA.delete(e); // e is empty pre-move; the A piece lands there
      const free = pts.filter(p => p !== e && !mustA.has(p));
      if (free.length < 12) continue;
      const occ: Record<string, 'A' | 'B'> = {};
      for (const p of mustA) occ[p] = 'A';
      const bSet = new Set(free.slice(0, 12));
      for (const p of free) occ[p] = bSet.has(p) ? 'B' : 'A';
      const base = blankOn(SUMI, occ, 'A');
      if (pieceCount(base, 'A') !== 12 || pieceCount(base, 'B') !== 12) continue;
      const mv = legalMoves(base, 'A').find(m => m.from === a && m.to === e && m.captures.length === 0);
      if (!mv) continue; // a->e must be genuinely legal (no mandatory capture etc.)
      const post = applyMove(base, mv);
      if (post.winner === 'draw' && legalMoves(post, 'B').length === 0) return { base, move: mv };
    }
  }
  return null;
}
{
  const found = findNoMovesWin('lau-kata-kati');
  check('no-moves win found on lau-kata-kati', found !== null);
  if (found) {
    const s2 = applyMove(found.base, found.move);
    check('no-moves win: A wins', s2.winner === 'A');
    check('no-moves win: reason', /Side B has no legal moves/.test(s2.winReason ?? ''), s2.winReason ?? 'none');
  }
}

// --- sumi-naga-war-game: most-captures scoring on no-moves ---
{
  // (a) higher captures wins even though both sides still have pieces
  const f1 = findNoMovesWin(SUMI, 5, 2);
  check('sumi setup found', f1 !== null);
  if (f1) {
    const s2 = applyMove(f1.base, f1.move);
    check('sumi: higher captures wins',
      s2.winner === 'A' && /wins on captures \(5 vs 2\)/.test(s2.winReason ?? ''), s2.winReason ?? 'none');
  }
  // (b) captures tied -> more remaining pieces wins
  const f2 = findNoMovesWin(SUMI, 3, 3);
  if (f2) {
    const s2 = applyMove(f2.base, f2.move);
    check('sumi: tied captures -> more pieces wins',
      s2.winner === 'A' && /more pieces/.test(s2.winReason ?? ''), s2.winReason ?? 'none');
  } else check('sumi tied-captures setup found', false);
  // (c) captures tied AND pieces tied -> draw (searched 2v2 setup, any board)
  const drawSetup = findDrawSetup();
  check('sumi draw setup found (12v12)', drawSetup !== null);
  if (drawSetup) {
    const s2 = applyMove(drawSetup.base, drawSetup.move);
    check('tied captures + tied pieces -> draw',
      s2.winner === 'draw' && /Draw/.test(s2.winReason ?? ''),
      `winner=${s2.winner} reason=${s2.winReason}`);
  }
}

// --- anti-stall ---
{
  const s = blankOn('lau-kata-kati', { p0: 'A', p18: 'B' }, 'A');
  s.pliesSinceCapture = 59;
  const mv = legalMoves(s, 'A')[0];
  const s2 = applyMove(s, mv);
  check('60 plies no capture ends game', s2.winner !== null, `winner=${s2.winner}`);
}

// --- misc API ---
{
  check('other()', other('A') === 'B' && other('B') === 'A');
  check('listBoards family-tree order',
    JSON.stringify(listBoards().map(b => b.id)) === JSON.stringify([
      'lau-kata-kati', 'pretwa', 'dash-guti', 'terhuchu-v1',
      'egara-guti', 'terhuchu-v3', 'sumi-naga-war-game', 'sixteen-soldiers']));
  let threw = false;
  try { getBoard('nope'); } catch { threw = true; }
  check('getBoard throws on unknown id', threw);
  const bb = boardBounds(getBoard('terhuchu-v3'));
  check('terhuchu-v3 bounds are -0.25..1.25',
    Math.abs(bb.minX + 0.25) < 1e-9 && Math.abs(bb.maxX - 1.25) < 1e-9,
    JSON.stringify(bb));
  const bb2 = boardBounds(getBoard('lau-kata-kati'));
  check('lau-kata-kati bounds within 0..1',
    bb2.minX >= 0 && bb2.minY >= 0 && bb2.maxX <= 1 && bb2.maxY <= 1);
  check('aiChooseMove null when no moves',
    aiChooseMove(blankOn('lau-kata-kati', {}, 'A')) === null);
}

console.log('== AI vs AI games ==');
const MAX_PLIES = 600;
for (const b of listBoards()) {
  let s = newGame(b.id);
  let plies = 0;
  try {
    while (s.winner === null && plies < MAX_PLIES) {
      const mv = aiChooseMove(s);
      if (!mv) break; // shouldn't happen: applyMove ends game on no-moves
      s = applyMove(s, mv);
      plies++;
    }
  } catch (e) {
    failures++;
    console.log(`${b.id}: THREW after ${plies} plies: ${(e as Error).message}`);
    continue;
  }
  const terminated = s.winner !== null;
  if (!terminated) failures++;
  const w = s.winner === 'A' || s.winner === 'B' ? s.winner : 'draw';
  console.log(`${b.id}: ${plies} plies → winner=${w} (${s.winReason ?? 'no reason; FAILED TO TERMINATE'})`);
}

console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
