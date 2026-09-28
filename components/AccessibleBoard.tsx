"use client";

import { useRef } from "react";
import type { BoardDef, Side } from "../lib/engine";

interface Props {
  board: BoardDef;
  occupant: Record<string, Side>;
  movable: string[];
  selected: string | null;
  onSelectPoint: (pointId: string) => void;
}

/**
 * Operable equivalent of the 3D board for keyboard and screen-reader users.
 * Visually hidden until focused (see .a11y-board in globals.css): arrow keys
 * move between points, Enter/Space selects or moves, exactly like tapping.
 */
export default function AccessibleBoard({ board, occupant, movable, selected, onSelectPoint }: Props) {
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const n = board.points.length;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next !== null) {
      e.preventDefault();
      btnRefs.current[next]?.focus();
    }
  };

  const stoneName = (s: Side | undefined) =>
    s === "A" ? "dark stone" : s === "B" ? "pale stone" : "empty point";

  return (
    <div className="a11y-board">
      <p id="a11y-board-label">
        Keyboard board: arrow keys move between the {board.points.length} points,
        Enter selects a stone or moves to a marked point.
      </p>
      <div className="pts" role="group" aria-labelledby="a11y-board-label">
        {board.points.map((p, i) => {
          const side = occupant[p.id];
          const isSel = selected === p.id;
          return (
            <button
              key={p.id}
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              type="button"
              data-side={side ?? ""}
              data-active={movable.includes(p.id) || undefined}
              aria-pressed={isSel}
              aria-label={`Point ${p.id.replace("p", "")}, ${stoneName(side)}${isSel ? ", selected" : ""}${
                movable.includes(p.id) ? ", can move" : ""
              }`}
              onClick={() => onSelectPoint(p.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span aria-hidden="true">
                {p.id.replace("p", "")}
                {side === "A" ? " ●" : side === "B" ? " ○" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
