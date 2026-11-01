import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { DEFAULT_POSITION, FORMATIONS, GAMES, POSITIONS, getTopScorer } from '../utils/logbook.utils';
import StatBlock from '../components/desktop/StatBlock';
import PlayerRow from '../components/desktop/PlayerRow';
import Stepper from '../components/desktop/Stepper';
import FormationPitch from '../components/desktop/FormationPitch';
import RoomSplitButton from '../components/room/RoomSplitButton';
import '../styles/LogbookDesktop.css';

function formatDiff(value) {
  return value > 0 ? `+${value}` : String(value);
}

function sortPlayers(players) {
  return [...players].sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists || a.name.localeCompare(b.name)
  );
}

export default function LogbookDesktop({
  teams,
  activeTeam,
  stats,
  showEmpty,
  showLoading,
  error,
  reload,
  confirming,
  onSelect,
  onCreate,
  onRooms,
  onNewRoom,
  onDelete,
  onUpdateTeam,
  onAdjustTeam,
  onAdjustPlayer,
  onAddPlayer,
  onRemovePlayer,
}) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [pending, setPending] = useState(false);

  const players = useMemo(() => (activeTeam ? sortPlayers(activeTeam.players) : []), [activeTeam]);
  const topScorer = activeTeam ? getTopScorer(activeTeam) : null;
  const winRate = stats && stats.played > 0 ? Math.round((activeTeam.wins / stats.played) * 100) : 0;

  const commitName = (event) => {
    const value = event.target.value.trim().slice(0, 30);
    if (value && value !== activeTeam.name) onUpdateTeam({ name: value });
    else event.target.value = activeTeam.name;
  };

  const handleNameKey = (event) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || pending) return;
    setPending(true);
    const player = await onAddPlayer({ name: clean, position });
    if (player) setName('');
    setPending(false);
  };

  return (
    <div className="lgd-shell">
      <main className="lgd-main">
        <div className="lgd-tabs">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              className={`lgd-tab${activeTeam?.id === team.id ? ' lgd-tab--active' : ''}`}
              onClick={() => onSelect(team.id)}
            >
              {team.name}
            </button>
          ))}
          <RoomSplitButton prefix="lgd" onRooms={onRooms} onNewRoom={onNewRoom} />
          <button type="button" className="lgd-tab lgd-tab--rooms-next" onClick={onCreate}>
            <Plus size={13} aria-hidden="true" />
            Equipo
          </button>
        </div>

        {error && (
          <div className="lgd-banner" role="alert">
            <span>{error}</span>
            <button type="button" onClick={reload}>
              Reintentar
            </button>
          </div>
        )}

        {showLoading && <p className="lgd-status">Cargando libreta…</p>}

        {showEmpty && (
          <section className="lgd-empty">
            <h2>Crea tu primer equipo</h2>
            <p>Lleva tus partidos, goles y jugadores destacados en un solo lugar.</p>
            <button type="button" className="lgd-btn" onClick={onCreate}>
              Crear equipo
            </button>
          </section>
        )}

        {activeTeam && stats && (
          <>
            <section className="lgd-stats lgd-stats--five" aria-label="Resumen de temporada">
              <StatBlock value={stats.played} label="Jugados" />
              <StatBlock
                value={activeTeam.wins}
                label="Ganados"
                tone="green"
                ariaName="partidos ganados"
                onIncrement={() => onAdjustTeam('wins', 1)}
                onDecrement={() => onAdjustTeam('wins', -1)}
              />
              <StatBlock
                value={activeTeam.draws}
                label="Empates"
                ariaName="partidos empatados"
                onIncrement={() => onAdjustTeam('draws', 1)}
                onDecrement={() => onAdjustTeam('draws', -1)}
              />
              <StatBlock
                value={activeTeam.losses}
                label="Perdidos"
                tone="red"
                ariaName="partidos perdidos"
                onIncrement={() => onAdjustTeam('losses', 1)}
                onDecrement={() => onAdjustTeam('losses', -1)}
              />
              <StatBlock value={`${winRate}%`} label="Victorias" tone="accent">
                <span className="lgd-bar">
                  <span style={{ width: `${winRate}%` }} />
                </span>
              </StatBlock>
            </section>

            <section className="lgd-stats lgd-stats--three" aria-label="Goles">
              <StatBlock value={stats.goalsFor} label="Goles a favor · auto" />
              <StatBlock
                value={activeTeam.goalsAgainst}
                label="Goles en contra"
                ariaName="goles en contra"
                onIncrement={() => onAdjustTeam('goalsAgainst', 1)}
                onDecrement={() => onAdjustTeam('goalsAgainst', -1)}
              />
              <StatBlock
                value={formatDiff(stats.goalDiff)}
                label="Diferencia"
                tone={stats.goalDiff < 0 ? 'red' : 'green'}
              />
            </section>

            <div className="lgd-section">
              <span>Jugadores destacados</span>
              <em>Ordenado por goles</em>
            </div>

            <form className="lgd-add" onSubmit={handleSubmit}>
              <label className="lgd-hidden" htmlFor="lgd-add-name">
                Nombre del jugador
              </label>
              <input
                id="lgd-add-name"
                className="lgd-input lgd-add__name"
                type="text"
                maxLength={24}
                placeholder="Nombre del jugador"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <label className="lgd-hidden" htmlFor="lgd-add-position">
                Posición
              </label>
              <select
                id="lgd-add-position"
                className="lgd-input lgd-add__position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              >
                {POSITIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button type="submit" className="lgd-btn" disabled={!name.trim() || pending}>
                Añadir
              </button>
            </form>

            <div className="lgd-head">
              <span>Rank</span>
              <span>Jugador</span>
              <span>Posición</span>
              <span>Goles</span>
              <span>Asist.</span>
              <span>MVP</span>
              <span />
            </div>

            {players.length === 0 && <p className="lgd-status">Aún no hay jugadores. Añade el primero abajo.</p>}

            {players.map((player, index) => (
              <PlayerRow
                key={player.id}
                rank={index + 1}
                player={player}
                onAdjust={onAdjustPlayer}
                onRemove={onRemovePlayer}
              />
            ))}

            {activeTeam.archivedGoals > 0 && (
              <p className="lgd-note">
                Incluye {activeTeam.archivedGoals} {activeTeam.archivedGoals === 1 ? 'gol' : 'goles'} de
                jugadores eliminados
              </p>
            )}
          </>
        )}
      </main>

      {activeTeam && stats && (
        <aside className="lgd-side" aria-label="Datos del equipo">
          <div className="lgd-side__title">· Equipo ·</div>

          <section className="lgd-block">
            <div className="lgd-field">
              <label htmlFor="lgd-team-name">Nombre</label>
              <input
                key={activeTeam.id}
                id="lgd-team-name"
                className="lgd-input"
                type="text"
                maxLength={30}
                defaultValue={activeTeam.name}
                onBlur={commitName}
                onKeyDown={handleNameKey}
              />
            </div>
            <div className="lgd-pair">
              <div className="lgd-field">
                <label htmlFor="lgd-team-formation">Formación</label>
                <select
                  id="lgd-team-formation"
                  className="lgd-input"
                  value={activeTeam.formation}
                  onChange={(event) => onUpdateTeam({ formation: event.target.value })}
                >
                  {FORMATIONS.map((formation) => (
                    <option key={formation} value={formation}>
                      {formation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lgd-field">
                <label htmlFor="lgd-team-game">Juego</label>
                <select
                  id="lgd-team-game"
                  className="lgd-input"
                  value={activeTeam.game}
                  onChange={(event) => onUpdateTeam({ game: event.target.value })}
                >
                  {GAMES.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="lgd-block">
            <span className="lgd-label">Formación {activeTeam.formation}</span>
            <FormationPitch formation={activeTeam.formation} />
          </section>

          <section className="lgd-block">
            <span className="lgd-label">Rival · autogol</span>
            <div className="lgd-rival">
              <span>Suma a goles a favor</span>
              <Stepper
                value={activeTeam.opponentOwnGoals}
                ariaName="autogoles del rival"
                onIncrement={() => onAdjustTeam('opponentOwnGoals', 1)}
                onDecrement={() => onAdjustTeam('opponentOwnGoals', -1)}
              />
            </div>
          </section>

          <button
            type="button"
            className={`lgd-delete${confirming ? ' lgd-delete--confirm' : ''}`}
            onClick={onDelete}
          >
            {confirming ? 'Toca otra vez para borrar' : 'Borrar este equipo'}
          </button>

          <section className="lgd-summary">
            <span className="lgd-summary__title">Resumen · {activeTeam.name}</span>
            <div className="lgd-summary__row">
              <span>Partidos jugados</span>
              <b>{stats.played}</b>
            </div>
            <div className="lgd-summary__row">
              <span>Máx. goleador</span>
              <b>{topScorer ? `${topScorer.name} · ${topScorer.goals}` : '—'}</b>
            </div>
          </section>
        </aside>
      )}
    </div>
  );
}
