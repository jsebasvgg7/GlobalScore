export default function StatBlock({ value, label, tone, onIncrement, onDecrement, ariaName, children }) {
  const editable = Boolean(onIncrement);

  return (
    <div className="lgd-stat">
      <span className={`lgd-stat__num${tone ? ` lgd-stat__num--${tone}` : ''}`}>{value}</span>
      <span className="lgd-stat__label">{label}</span>
      {editable && (
        <div className="lgd-stat__ctl">
          <button type="button" onClick={onIncrement} aria-label={`Sumar ${ariaName}`}>
            +
          </button>
          <button
            type="button"
            onClick={onDecrement}
            disabled={Number(value) <= 0}
            aria-label={`Restar ${ariaName}`}
          >
            −
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
