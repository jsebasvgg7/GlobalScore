import VerticalCounter from './VerticalCounter';
import '../styles/SeasonSummary.css';

function formatDiff(value) {
  return value > 0 ? `+${value}` : String(value);
}

export default function SeasonSummary({ team, stats, onAdjust }) {
  const adjust = (key, delta) => () => onAdjust(key, delta);

  return (
    <section className="lb-card lb-summary" aria-label="Resumen de temporada">
      <h2 className="lb-section-title">Resumen de temporada</h2>
      <p className="lb-hint">Los partidos se llevan a mano. JUG suma GAN, EMP y PER.</p>
      <div className="lb-summary__row">
        <VerticalCounter label="JUG" value={stats.played} readOnly ariaName="partidos jugados" />
        <VerticalCounter
          label="GAN"
          value={team.wins}
          onIncrement={adjust('wins', 1)}
          onDecrement={adjust('wins', -1)}
          ariaName="partidos ganados"
        />
        <VerticalCounter
          label="EMP"
          value={team.draws}
          onIncrement={adjust('draws', 1)}
          onDecrement={adjust('draws', -1)}
          ariaName="partidos empatados"
        />
        <VerticalCounter
          label="PER"
          value={team.losses}
          onIncrement={adjust('losses', 1)}
          onDecrement={adjust('losses', -1)}
          ariaName="partidos perdidos"
        />
      </div>
      <h2 className="lb-section-title lb-summary__goals-title">Goles</h2>
      <p className="lb-hint">GA se calcula con los goles de tus jugadores.</p>
      <div className="lb-summary__row">
        <VerticalCounter label="GA" value={stats.goalsFor} readOnly ariaName="goles a favor" />
        <VerticalCounter
          label="GC"
          value={team.goalsAgainst}
          onIncrement={adjust('goalsAgainst', 1)}
          onDecrement={adjust('goalsAgainst', -1)}
          ariaName="goles en contra"
        />
        <VerticalCounter
          label="+/-"
          value={formatDiff(stats.goalDiff)}
          readOnly
          ariaName="diferencia de goles"
        />
      </div>
    </section>
  );
}
