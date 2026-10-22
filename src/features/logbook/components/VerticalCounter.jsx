import '../styles/VerticalCounter.css';

export default function VerticalCounter({
  label,
  value,
  onIncrement,
  onDecrement,
  readOnly = false,
  size = 68,
  ariaName,
}) {
  const name = ariaName ?? label;
  const className = [
    'lb-counter',
    size === 54 ? 'lb-counter--sm' : '',
    readOnly ? 'lb-counter--readonly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <span className="lb-counter__label">{label}</span>
      <div className="lb-counter__body">
        {!readOnly && (
          <button
            type="button"
            className="lb-counter__btn"
            onClick={onIncrement}
            aria-label={`Sumar ${name}`}
          >
            +
          </button>
        )}
        <span className="lb-counter__value" aria-live="polite" aria-atomic="true">
          {value}
        </span>
        {!readOnly && (
          <button
            type="button"
            className="lb-counter__btn"
            onClick={onDecrement}
            disabled={Number(value) <= 0}
            aria-label={`Restar ${name}`}
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}
