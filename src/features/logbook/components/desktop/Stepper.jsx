export default function Stepper({ value, onIncrement, onDecrement, ariaName }) {
  return (
    <span className="lgd-stepper">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= 0}
        aria-label={`Restar ${ariaName}`}
      >
        −
      </button>
      <span aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button type="button" onClick={onIncrement} aria-label={`Sumar ${ariaName}`}>
        +
      </button>
    </span>
  );
}
