import '../styles/RivalCard.css';

export default function RivalCard({ value, onAdjust }) {
  return (
    <article className="lb-rival">
      <div className="lb-rival__info">
        <h3 className="lb-rival__name">Rival (autogol)</h3>
        <span className="lb-rival__hint">Suma a GA sin asignar a un jugador</span>
      </div>
      <div className="lb-rival__control">
        <span className="lb-rival__label">GOL</span>
        <div className="lb-rival__box">
          <button
            type="button"
            className="lb-rival__btn"
            onClick={() => onAdjust(1)}
            aria-label="Sumar autogoles del rival"
          >
            +
          </button>
          <span className="lb-rival__value" aria-live="polite" aria-atomic="true">
            {value}
          </span>
          <button
            type="button"
            className="lb-rival__btn"
            onClick={() => onAdjust(-1)}
            disabled={value <= 0}
            aria-label="Restar autogoles del rival"
          >
            −
          </button>
        </div>
      </div>
    </article>
  );
}
