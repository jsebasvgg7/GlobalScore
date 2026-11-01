import '../../styles/RoomTable.css';

const formatDiff = (value) => (value > 0 ? `+${value}` : `${value}`);

const toneOf = (stat, side) => {
  if (!stat || stat.winner === 'tie') return 'tie';
  return stat.winner === side ? 'win' : 'lose';
};

function Cell({ label, value, tone = 'tie', wide = false, sub = null }) {
  return (
    <div className={`lgr-cell lgr-cell--${tone}${wide ? ' lgr-cell--wide' : ''}`}>
      <span className="lgr-cell__value">{value}</span>
      <span className="lgr-cell__label">{label}</span>
      {sub !== null && <span className="lgr-cell__sub">{sub}</span>}
    </div>
  );
}

function PlayerCell({ title, stat, side }) {
  const player = stat[side];
  return (
    <div className={`lgr-player lgr-cell--${toneOf(stat, side)}`}>
      <span className="lgr-player__title">{title}</span>
      <span className="lgr-cell__value">{player.value}</span>
      <span className="lgr-player__name">{player.name ?? '—'}</span>
    </div>
  );
}

function Column({ position, entry, comparison }) {
  const { side, member, points } = entry;
  const { stats, info } = comparison;
  const pointsTone = comparison.winner === 'tie' ? 'tie' : comparison.winner === side ? 'win' : 'lose';

  return (
    <section className="lgr-col">
      <h3 className="lgr-col__rank">N°{position}</h3>
      <p className="lgr-col__team" title={member.team.name}>
        {member.team.name}
      </p>
      <p className="lgr-col__user">{member.userName}</p>

      <div className={`lgr-block lgr-block--points lgr-cell--${pointsTone}`}>
        <span className="lgr-block__title">Puntos</span>
        <span className="lgr-block__big">{points}</span>
      </div>

      <div className="lgr-block lgr-cell--tie">
        <span className="lgr-block__title">Partidos</span>
        <span className="lgr-block__big">{info.played[side]}</span>
      </div>

      <h4 className="lgr-section">Datos</h4>
      <div className="lgr-grid">
        <Cell label="PG" value={stats.wins[side]} tone={toneOf(stats.wins, side)} />
        <Cell label="PP" value={stats.losses[side]} tone={toneOf(stats.losses, side)} />
        <Cell label="PE" value={info.draws[side]} />
        <Cell label="%V" value={stats.winRate[side]} tone={toneOf(stats.winRate, side)} />
      </div>

      <h4 className="lgr-section">Goles</h4>
      <div className="lgr-stack">
        <Cell wide label="GOL A FAVOR" value={stats.goalsFor[side]} tone={toneOf(stats.goalsFor, side)} />
        <Cell
          wide
          label="GOL EN CONTRA"
          value={stats.goalsAgainst[side]}
          tone={toneOf(stats.goalsAgainst, side)}
        />
        <Cell
          wide
          label="DIFERENCIA"
          value={formatDiff(stats.goalDiff[side])}
          tone={toneOf(stats.goalDiff, side)}
        />
      </div>

      <h4 className="lgr-section">Stats Jug.</h4>
      <div className="lgr-stack">
        <PlayerCell title="Goleador" stat={stats.scorer} side={side} />
        <PlayerCell title="Asistidor" stat={stats.assister} side={side} />
        <PlayerCell title="MVP" stat={stats.mvp} side={side} />
      </div>
    </section>
  );
}

export default function RoomTable({ code, standings, comparison }) {
  if (!comparison || standings.length < 2) return null;

  return (
    <div className="lgr-table">
      <h2 className="lgr-table__title">Tabla de posiciones</h2>
      <p className="lgr-table__code">CÓDIGO: {code}</p>
      <div className="lgr-table__cols">
        {standings.map((entry, index) => (
          <Column
            key={entry.member.userId}
            position={index + 1}
            entry={entry}
            comparison={comparison}
          />
        ))}
      </div>
    </div>
  );
}
