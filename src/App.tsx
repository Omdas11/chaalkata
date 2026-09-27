import { useState } from 'react';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import './styles.css';

export type View = { page: 'home' } | { page: 'game'; id: string };

export default function App() {
  const [view, setView] = useState<View>({ page: 'home' });

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
