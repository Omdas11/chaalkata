// Engine unit tests: run with `npm test` (tsx + node:assert, no framework).
import assert from "node:assert/strict";
import {
  newGame,
  getBoard,
  legalMoves,
  applyMove,
  aiChooseMove,
  positionKey,
  type GameState,
} from "../lib/engine";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

// ---- 1. Initial board: 9 stones a side, centre empty, triangles share apex ----
test("lau-kata-kati starts 9 vs 9 with the shared apex empty", () => {
  const board = getBoard("lau-kata-kati");
  assert.equal(board.points.length, 19);
  assert.equal(board.piecesPerSide, 9);
  assert.deepEqual(board.start.sideA.length, 9);
  assert.deepEqual(board.start.sideB.length, 9);

  const s = newGame("lau-kata-kati");
  const coords = new Map(board.points.map((p) => [p.id, p]));
  let a = 0;
  let b = 0;
  for (const [pid, side] of Object.entries(s.occupant)) {
    const p = coords.get(pid);
    assert.ok(p, `point ${pid} exists on the board`);
    if (side === "A") {
      a++;
      assert.ok(p.y < 0.5, `side A stone ${pid} sits in the near triangle`);
    } else {
      b++;
      assert.ok(p.y > 0.5, `side B stone ${pid} sits in the far triangle`);
    }
  }
  assert.equal(a, 9);
  assert.equal(b, 9);
  // The single shared apex of the two triangles starts empty.
  assert.equal(s.occupant["p9"], undefined);
  assert.equal(s.turn, "A");
  assert.equal(s.winner, null);
  assert.equal(s.positionCounts[positionKey(s)], 1);
});

// ---- 2. Captures are compulsory (and chains maximal) ----
function captureFixture(): GameState {
  // A on p7 can leap over B on p4 onto p1; p1/p3/p5 geometry only allows p1.
  const s = newGame("lau-kata-kati");
  return {
    ...s,
    occupant: { p7: "A", p4: "B" },
    turn: "A",
    history: [],
    capturesA: 0,
    capturesB: 0,
    pliesSinceCapture: 0,
    positionCounts: {},
  };
}

test("a capture, when available, is the only legal move", () => {
  const moves = legalMoves(captureFixture());
  assert.ok(moves.length > 0, "there is at least one move");
  assert.ok(
    moves.every((m) => m.captures.length > 0),
    "every legal move is a capture",
  );
  assert.ok(
    moves.some((m) => m.from === "p7" && m.to === "p1" && m.captures[0] === "p4"),
    "the p7 x p4 -> p1 leap is legal",
  );
});

test("AI obeys compulsory capture at every difficulty", () => {
  const s = captureFixture();
  for (const d of ["easy", "medium", "hard"] as const) {
    const m = aiChooseMove(s, d);
    assert.ok(m, `AI (${d}) finds a move`);
    assert.ok(m.captures.length > 0, `AI (${d}) takes the compulsory capture`);
  }
});

// ---- 3. Threefold repetition is a draw ----
test("the third occurrence of a position is a draw", () => {
  const s0 = newGame("lau-kata-kati");
  // Real opening: A steps onto the shared apex, B must capture back.
  const m1 = legalMoves(s0).find((m) => m.from === "p7" && m.to === "p9");
  assert.ok(m1, "A can open p7 -> p9");
  const s1 = applyMove(s0, m1);
  assert.equal(s1.winner, null);
  const b1 = legalMoves(s1).find((m) => m.from === "p10");
  assert.ok(b1, "B has a reply");
  assert.ok(b1.captures.length > 0, "B's reply is a compulsory capture");

  // Pretend the position after B's capture already occurred twice before.
  const probe = applyMove({ ...s1, positionCounts: {} }, b1);
  const rkey = positionKey(probe);
  const seeded: GameState = { ...s1, positionCounts: { ...s1.positionCounts, [rkey]: 2 } };
  const s2 = applyMove(seeded, b1);
  assert.equal(s2.winner, "draw");
  assert.match(s2.winReason ?? "", /three times/);
  assert.equal(s2.positionCounts[rkey], 3);
});

test("non-repeating positions do not draw", () => {
  const s0 = newGame("lau-kata-kati");
  const m1 = legalMoves(s0).find((m) => m.from === "p7" && m.to === "p9")!;
  const s1 = applyMove(s0, m1);
  assert.equal(s1.winner, null);
  assert.ok(Object.values(s1.positionCounts).every((n) => n <= 1));
});

console.log(`\n${passed} tests passed`);
