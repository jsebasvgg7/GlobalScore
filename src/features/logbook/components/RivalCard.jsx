import VerticalCounter from './VerticalCounter';
import '../styles/RivalCard.css';

export default function RivalCard({ value, onAdjust }) {
  return (
    <article className="lb-rival">
      <div className="lb-rival__info">
        <h3 className="lb-rival__name">Rival (autogol)</h3>
        <span className="lb-rival__hint">Suma a GA sin asignar a un jugador</span>
      </div>
      <VerticalCounter
        label="GOL"
        value={value}
        size={54}
        ariaName="autogoles del rival"
        onIncrement={() => onAdjust(1)}
        onDecrement={() => onAdjust(-1)}
      />
    </article>
  );
}
