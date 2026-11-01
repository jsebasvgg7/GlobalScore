import { Star } from 'lucide-react';

const BLOCKED_TITLE = 'Quita la estrella de tu otra sala para marcar esta';

export default function RoomPinButton({
  pinned,
  blocked = false,
  disabled = false,
  variant = 'item',
  onToggle,
}) {
  const locked = blocked && !pinned;
  const title = locked ? BLOCKED_TITLE : pinned ? 'Quitar estrella' : 'Marcar sala con estrella';
  const classes = [
    'lgr-star',
    `lgr-star--${variant}`,
    pinned ? 'lgr-star--on' : '',
    locked ? 'lgr-star--locked' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={locked ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={pinned}
      aria-disabled={locked || undefined}
      aria-label={title}
      title={title}
    >
      <Star size={18} aria-hidden="true" />
    </button>
  );
}
