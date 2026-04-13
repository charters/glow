import { useState, useEffect } from 'react';
import { seedIfEmpty } from './db';
import TodayView from './TodayView';
import CalendarView from './CalendarView';
import HabitsView from './HabitsView';
import './App.css';

type View = 'today' | 'calendar' | 'habits' | 'reflect';

const navItems: Array<[View, string, string]> = [
  ['today', '☀️', 'Today'],
  ['calendar', '📅', 'Calendar'],
  ['habits', '⚙️', 'Habits'],
  ['reflect', '💭', 'Reflect'],
];

export default function App() {
  const [view, setView] = useState<View>('today');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <div className="app">
      <div className="app-content">
        {view === 'today' && <TodayView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'habits' && <HabitsView />}
        {view === 'reflect' && (
          <div className="placeholder">
            <p>💭</p>
            <p>Reflection coming soon</p>
          </div>
        )}
      </div>
      <nav className="nav">
        {navItems.map(([id, icon, label]) => (
          <button
            key={id}
            className={`nav-item${view === id ? ' active' : ''}`}
            onClick={() => setView(id)}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
