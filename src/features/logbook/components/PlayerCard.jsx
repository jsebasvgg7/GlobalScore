import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import VerticalCounter from './VerticalCounter';
import '../styles/PlayerCard.css';

const COUNTERS = [
  { key: 'goals', label: 'GOL', noun: 'goles' },
  { key: 'assists', label: 'ASI', noun: 'asistencias' },
  { key: 'mvp', label: 'MVP', noun: 'MVP' },
];

const CONFIRM_WINDOW_MS = 3000;

export default function PlayerCard({ player, onAdjust, onRemove }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef(null);
  const panelId = `lg-player-${player.id}`;

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleRemove = () => {
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timer.current);
    setConfirming(false);
    onRemove(player.id);
  };

  return (
    <article className={`lg-player${open ? ' lg-player--open' : ''}`}>
      <div className="lg-player__head">
        <button
          type="button"
          className="lg-player__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="lg-player__chevron">
            <ChevronDown size={18} strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="lg-player__info">
            <span className="lg-player__name">{player.name}</span>
            <span className="lg-player__position">{player.position}</span>
          </span>
          {!open && (
            <span className="lg-player__stats">
              {COUNTERS.map(({ key, label }) => (
                <span key={key} className="lg-player__stat">
                  <span className="lg-player__stat-label">{label}</span>
                  <span className="lg-player__stat-value">{player[key]}</span>
                </span>
              ))}
            </span>
          )}
        </button>
        {open && (
          <button
            type="button"
            className={`lg-player__remove${confirming ? ' lg-player__remove--confirm' : ''}`}
            onClick={handleRemove}
            aria-label={confirming ? `Confirmar eliminar a ${player.name}` : `Eliminar a ${player.name}`}
          >
            {confirming ? (
              <span>¿Borrar?</span>
            ) : (
              <Trash2 size={20} strokeWidth={2.5} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {open && (
        <div id={panelId} className="lg-player__panel">
          <div className="lg-player__counters">
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
