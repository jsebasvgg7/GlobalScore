import { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import VerticalCounter from './VerticalCounter';
import '../styles/PlayerCard.css';

const COUNTERS = [
  { key: 'goals', label: 'GOL', noun: 'goles' },
  { key: 'assists', label: 'ASI', noun: 'asistencias' },
  { key: 'mvp', label: 'MVP', noun: 'MVP' },
];

export default function PlayerCard({ player, onAdjust, onRemove }) {
  const [open, setOpen] = useState(false);
  const panelId = `lb-player-${player.id}`;

  return (
    <article className={`lb-player${open ? ' lb-player--open' : ''}`}>
      <div className="lb-player__head">
        <button
          type="button"
          className="lb-player__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="lb-player__chevron">
            <ChevronDown size={18} strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="lb-player__info">
            <span className="lb-player__name">{player.name}</span>
            <span className="lb-player__position">{player.position}</span>
          </span>
          {!open && (
            <span className="lb-player__stats">
              {COUNTERS.map(({ key, label }) => (
                <span key={key} className="lb-player__stat">
                  <span className="lb-player__stat-label">{label}</span>
                  <span className="lb-player__stat-value">{player[key]}</span>
                </span>
              ))}
            </span>
          )}
        </button>
        {open && (
          <button
            type="button"
            className="lb-player__remove"
            onClick={() => onRemove(player.id)}
            aria-label={`Eliminar a ${player.name}`}
          >
            <Trash2 size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
      </div>
      {open && (
        <div id={panelId} className="lb-player__panel">
          <div className="lb-player__counters">
            {COUNTERS.map(({ key, label, noun }) => (
              <VerticalCounter
                key={key}
                label={label}
                value={player[key]}
                size={54}
                ariaName={`${noun} de ${player.name}`}
                onIncrement={() => onAdjust(player.id, key, 1)}
                onDecrement={() => onAdjust(player.id, key, -1)}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
