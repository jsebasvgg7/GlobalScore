import { useEffect, useRef, useState } from 'react';
import { useLogbook } from '../hooks/useLogbook';
import { getTopScorer } from '../utils/logbook.utils';
import TeamSelector from '../components/TeamSelector';
import TeamForm from '../components/TeamForm';
import SeasonSummary from '../components/SeasonSummary';
import PlayerCard from '../components/PlayerCard';
import RivalCard from '../components/RivalCard';
import AddPlayerForm from '../components/AddPlayerForm';
import './LogbookPage.css';

const CONFIRM_WINDOW_MS = 3000;

export default function LogbookPage({ currentUser }) {
  const {
    teams,
    activeTeam,
    stats,
    loading,
    loaded,
    error,
    reload,
    selectTeam,
    createTeam,
    removeTeam,
    updateTeamInfo,
    adjustTeamCounter,
    adjustPlayerCounter,
    addPlayer,
    removePlayer,
  } = useLogbook(currentUser);

  const [confirming, setConfirming] = useState(false);
  const timer = useRef(null);
  const activeId = activeTeam?.id ?? null;

  useEffect(() => {
    setConfirming(false);
    clearTimeout(timer.current);
  }, [activeId]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCreate = () => createTeam();

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timer.current);
    setConfirming(false);
    const wasLast = teams.length === 1;
    const removed = await removeTeam(activeId);
    if (removed && wasLast) await createTeam();
  };

  const showEmpty = loaded && !loading && !activeTeam;
  const showLoading = loading && !activeTeam;
  const topScorer = activeTeam ? getTopScorer(activeTeam) : null;

  return (
    <main className="lb-page">
      <header className="lb-header">
        <h1 className="lb-header__title">Mi Libreta Fútbolera</h1>
        {activeTeam && (
          <p className="lb-header__subtitle">
            {activeTeam.name} · {activeTeam.game}
          </p>
        )}
      </header>

      {error && (
        <div className="lb-banner" role="alert">
          <span>{error}</span>
          <button type="button" className="lb-banner__retry" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {showLoading && <p className="lb-status">Cargando libreta…</p>}

      {showEmpty && (
        <section className="lb-card lb-empty">
          <h2 className="lb-section-title">Crea tu primer equipo</h2>
          <p className="lb-hint">Lleva tus partidos, goles y jugadores destacados en un solo lugar.</p>
          <button type="button" className="lb-btn lb-btn--primary" onClick={handleCreate}>
            Crear equipo
          </button>
        </section>
      )}

      {activeTeam && (
        <>
          <TeamSelector
            teams={teams}
            activeId={activeId}
            onSelect={selectTeam}
            onCreate={handleCreate}
          />
          <TeamForm team={activeTeam} onChange={updateTeamInfo} />
          <SeasonSummary team={activeTeam} stats={stats} onAdjust={adjustTeamCounter} />
          {activeTeam.archivedGoals > 0 && (
            <p className="lb-history">
              Incluye {activeTeam.archivedGoals}{' '}
              {activeTeam.archivedGoals === 1 ? 'gol' : 'goles'} de jugadores eliminados
            </p>
          )}

          <section className="lb-card lb-players" aria-label="Jugadores destacados">
            <h2 className="lb-section-title">Jugadores destacados</h2>
            <p className="lb-hint">
              Un gol aquí sube GA automáticamente.
              {topScorer && ` Máximo goleador: ${topScorer.name} (${topScorer.goals}).`}
            </p>
            <div className="lb-players__list">
              {activeTeam.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onAdjust={adjustPlayerCounter}
                  onRemove={removePlayer}
                />
              ))}
              <RivalCard
                value={activeTeam.opponentOwnGoals}
                onAdjust={(delta) => adjustTeamCounter('opponentOwnGoals', delta)}
              />
            </div>
            <AddPlayerForm onAdd={addPlayer} />
          </section>

          <button
            type="button"
            className={`lb-btn lb-delete${confirming ? ' lb-delete--confirm' : ''}`}
            onClick={handleDelete}
          >
            {confirming ? 'Toca otra vez para borrar' : 'Borrar este equipo'}
          </button>
        </>
      )}
    </main>
  );
}
