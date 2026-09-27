import { useState } from 'react';
import { listBoards } from '../engine';
import { GAME_META, LANDING_COPY, TREE_TIERS } from '../gameMeta';
import { isSoundMuted, playSound, setSoundMuted } from '../sound';
import BoardView from './BoardView';

interface HomePageProps {
  onPlay: (id: string) => void;
}

export default function HomePage({ onPlay }: HomePageProps) {
  const boards = listBoards();
  const boardById = new Map(boards.map((b) => [b.id, b]));
  const [muted, setMuted] = useState(isSoundMuted);

  const toggleMute = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
    if (!next) playSound('click');
  };

  return (
    <div className="home">
      <header className="hero">
        <button
          className="mute-btn hero-mute"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <div className="hero-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="56" height="56">
            <circle cx="32" cy="32" r="28" fill="#7c2d12" />
            <circle cx="32" cy="32" r="14" fill="#f5ead6" />
          </svg>
        </div>
        <h1 className="brand">Chaal-Kaata</h1>
        <p className="tagline">{LANDING_COPY.tagline}</p>
        <p className="intro">{LANDING_COPY.intro}</p>
      </header>

      <main>
        {TREE_TIERS.map((tier) => (
          <section key={tier.label} className="tier">
            <div className="tier-rail">
              <h2>{tier.label}</h2>
            </div>
            <div className="cards">
              {tier.ids.map((id) => {
                const board = boardById.get(id);
                const meta = GAME_META[id];
                if (!board || !meta) return null;
                const occupant: Record<string, null> = {};
                for (const p of board.points) occupant[p.id] = null;
                return (
                  <button key={id} className="card" onClick={() => { playSound('click'); onPlay(id); }}>
                    <div className="card-board">
                      <BoardView board={board} occupant={occupant} preview={true} />
                    </div>
                    <div className="card-body">
                      <h3>
                        {meta.title}
                        {id === 'sixteen-soldiers' && (
                          <img
                            src="/assets/crown.svg"
                            className="boss-crown"
                            alt=""
                            aria-hidden="true"
                            title="The boss game — 16 pieces a side"
                          />
                        )}
                      </h3>
                      <p className="card-sub">{meta.subtitle}</p>
                      <div className="card-badges">
                        <span className="badge">{board.region}</span>
                        <span className="badge">{board.piecesPerSide} pieces/side</span>
                        {board.confidence === 'medium' && (
                          <span className="badge badge-warn">board: medium confidence</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        <img
          src="/assets/divider-ornament.svg"
          className="divider-ornament"
          alt=""
          aria-hidden="true"
        />
        <p>{LANDING_COPY.footer}</p>
      </footer>
    </div>
  );
}
