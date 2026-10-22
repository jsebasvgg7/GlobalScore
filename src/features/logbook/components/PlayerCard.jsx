import VerticalCounter from './VerticalCounter';
import '../styles/PlayerCard.css';

const COUNTERS = [
  { key: 'goals', label: 'GOL', noun: 'goles' },
  { key: 'assists', label: 'ASI', noun: 'asistencias' },
  { key: 'mvp', label: 'MVP', noun: 'MVP' },
];

export default function PlayerCard({ player, onAdjust, onRemove }) {
  return (
    <article className="lb-player">
      <div className="lb-player__info">
        <h3 className="lb-player__name">{player.name}</h3>
        <span className="lb-player__position">{player.position}</span>
        <button
          type="button"
          className="lb-player__remove"
          onClick={() => onRemove(player.id)}
          aria-label={`Eliminar a ${player.name}`}
        >
          ✕
        </button>
      </div>
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
    </article>
  );
}
