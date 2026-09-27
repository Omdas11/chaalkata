import { useMemo } from 'react';
import type { BoardDef, Side } from '../engine';

export interface BoardViewProps {
  board: BoardDef;
  occupant: Record<string, Side | null>;
  selectedId?: string | null;
  legalTargets?: string[];
  lastMovePath?: string[];
  interactive?: boolean;
  onPointTap?: (id: string) => void;
  /** Compact, non-interactive card preview */
  preview?: boolean;
}

const PIECE_A = '#7c2d12';
const PIECE_B = '#f5ead6';
const STROKE = '#3a2a1a';

export default function BoardView({
  board,
  occupant,
  selectedId = null,
  legalTargets = [],
  lastMovePath = [],
  interactive = false,
  onPointTap,
  preview = false,
}: BoardViewProps) {
  const { viewBox, pts, w, h } = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of board.points) {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    }
    const padX = (maxX - minX) * 0.08 + 0.001;
    const padY = (maxY - minY) * 0.08 + 0.001;
    const vb = `${minX - padX} ${minY - padY} ${(maxX - minX) + padX * 2} ${(maxY - minY) + padY * 2}`;
    const map = new Map<string, { x: number; y: number }>();
    for (const p of board.points) map.set(p.id, { x: p.x, y: p.y });
    const span = Math.max(maxX - minX, maxY - minY, 0.001);
    return { viewBox: vb, pts: map, w: maxX - minX, h: maxY - minY, spanX: span, spanY: span };
  }, [board]);

  const pieceR = Math.max(w, h) * (preview ? 0.028 : 0.022);
  const lineW = Math.max(w, h) * (preview ? 0.006 : 0.005);
  const targetSet = useMemo(() => new Set(legalTargets), [legalTargets]);
  const pathSet = useMemo(() => new Set(lastMovePath), [lastMovePath]);

  // Draw edges; highlight the last-move trail
  const edges = board.edges.map(([a, b], i) => {
    const pa = pts.get(a), pb = pts.get(b);
    if (!pa || !pb) return null;
    const inPath = pathSet.has(a) && pathSet.has(b);
    return (
      <line
        key={i}
        x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
        stroke={inPath ? '#d97706' : STROKE}
        strokeWidth={inPath ? lineW * 2.4 : lineW}
        strokeOpacity={inPath ? 0.95 : preview ? 0.75 : 0.55}
        strokeLinecap="round"
      />
    );
  });

  const points = board.points.map((p) => {
    const occ = occupant[p.id];
    const isSel = selectedId === p.id;
    const isTarget = targetSet.has(p.id);
    const r = isSel ? pieceR * 1.25 : pieceR;
    return (
      <g
        key={p.id}
        onClick={interactive && onPointTap ? () => onPointTap(p.id) : undefined}
        style={interactive && onPointTap ? { cursor: 'pointer' } : undefined}
      >
        {/* fat invisible hit area when interactive */}
        {interactive && <circle cx={p.x} cy={p.y} r={pieceR * 2.1} fill="transparent" />}
        {occ ? (
          <g>
            <circle
              cx={p.x} cy={p.y} r={r}
              fill={occ === 'A' ? PIECE_A : PIECE_B}
              stroke={isSel ? '#d97706' : STROKE}
              strokeWidth={isSel ? lineW * 2.2 : lineW * 1.4}
            />
            {isSel && (
              <circle
                cx={p.x} cy={p.y} r={r * 1.45}
                fill="none" stroke="#d97706" strokeWidth={lineW}
                strokeDasharray={`${lineW * 2} ${lineW * 1.6}`}
              />
            )}
          </g>
        ) : (
          <circle
            cx={p.x} cy={p.y} r={pieceR * 0.42}
            fill={isTarget ? '#d97706' : STROKE}
            opacity={isTarget ? 1 : 0.6}
          />
        )}
        {isTarget && (
          <circle cx={p.x} cy={p.y} r={pieceR * 0.85} fill="none" stroke="#d97706" strokeWidth={lineW} className="pulse" />
        )}
      </g>
    );
  });

  return (
    <svg
      viewBox={viewBox}
      className={preview ? 'board-svg board-preview' : 'board-svg'}
      role={preview ? 'img' : 'application'}
      aria-label={preview ? `${board.name} board preview` : `${board.name} board`}
      style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'manipulation' }}
    >
      {edges}
      {points}
    </svg>
  );
}
