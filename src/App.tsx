import { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import { unlockSound } from './sound';
import './styles.css';

export type View = { page: 'home' } | { page: 'game'; id: string };

export default function App() {
  const [view, setView] = useState<View>({ page: 'home' });

  // Warm up the SFX elements on the first user gesture so mobile
  // autoplay policies never block the first real game sound.
  useEffect(() => {
    const unlock = () => unlockSound();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <div className="app">
      {view.page === 'home' ? (
        <HomePage onPlay={(id) => setView({ page: 'game', id })} />
      ) : (
        <GamePage key={view.id} id={view.id} onBack={() => setView({ page: 'home' })} />
      )}
    </div>
  );
}
