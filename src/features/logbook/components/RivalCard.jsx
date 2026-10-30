import '../styles/RivalCard.css';

export default function RivalCard({ value, onAdjust }) {
  return (
    <article className="lg-rival">
      <div className="lg-rival__info">
        <h3 className="lg-rival__name">Rival (autogol)</h3>
        <span className="lg-rival__hint">Suma a GA sin asignar a un jugador</span>
      </div>
      <div className="lg-rival__control">
        <span className="lg-rival__label">GOL</span>
        <div className="lg-rival__box">
          <button
            type="button"
            className="lg-rival__btn"
            onClick={() => onAdjust(1)}
            aria-label="Sumar autogoles del rival"
          >
            +
          </button>
          <span className="lg-rival__value" aria-live="polite" aria-atomic="true">
            {value}
          </span>
          <button
            type="button"
            className="lg-rival__btn"
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
