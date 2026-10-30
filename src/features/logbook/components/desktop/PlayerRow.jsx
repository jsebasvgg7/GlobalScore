import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Stepper from './Stepper';

const CONFIRM_WINDOW_MS = 3000;

export default function PlayerRow({ rank, player, onAdjust, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef(null);

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
    <div className={`lgd-row${rank === 1 && player.goals > 0 ? ' lgd-row--top' : ''}`}>
      <span className="lgd-rank">{rank}</span>
      <span className="lgd-player-name">{player.name}</span>
      <span className="lgd-player-pos">{player.position}</span>
      <Stepper
        value={player.goals}
        ariaName={`goles de ${player.name}`}
        onIncrement={() => onAdjust(player.id, 'goals', 1)}
        onDecrement={() => onAdjust(player.id, 'goals', -1)}
      />
      <Stepper
        value={player.assists}
        ariaName={`asistencias de ${player.name}`}
        onIncrement={() => onAdjust(player.id, 'assists', 1)}
        onDecrement={() => onAdjust(player.id, 'assists', -1)}
      />
      <Stepper
        value={player.mvp}
        ariaName={`MVP de ${player.name}`}
        onIncrement={() => onAdjust(player.id, 'mvp', 1)}
        onDecrement={() => onAdjust(player.id, 'mvp', -1)}
      />
      <button
        type="button"
        className={`lgd-remove${confirming ? ' lgd-remove--confirm' : ''}`}
        onClick={handleRemove}
        aria-label={confirming ? `Confirmar eliminar a ${player.name}` : `Eliminar a ${player.name}`}
      >
        {confirming ? '¿Borrar?' : <X size={14} aria-hidden="true" />}
      </button>
    </div>
  );
}
