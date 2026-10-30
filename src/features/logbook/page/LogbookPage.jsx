import { useEffect, useRef, useState } from 'react';
import { useLogbook } from '../hooks/useLogbook';
import { useIsMobile } from '../hooks/useIsMobile';
import { getTopScorer } from '../utils/logbook.utils';
import TeamSelector from '../components/TeamSelector';
import TeamForm from '../components/TeamForm';
import SeasonSummary from '../components/SeasonSummary';
import PlayerCard from '../components/PlayerCard';
import RivalCard from '../components/RivalCard';
import AddPlayerForm from '../components/AddPlayerForm';
import LogbookDesktop from './LogbookDesktop';
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

  const isMobile = useIsMobile();
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

  if (!isMobile) {
    return (
      <LogbookDesktop
        teams={teams}
        activeTeam={activeTeam}
        stats={stats}
        showEmpty={showEmpty}
        showLoading={showLoading}
        error={error}
        reload={reload}
        confirming={confirming}
        onSelect={selectTeam}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onUpdateTeam={updateTeamInfo}
        onAdjustTeam={adjustTeamCounter}
        onAdjustPlayer={adjustPlayerCounter}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
      />
    );
  }

  return (
    <main className="lg-page">
      <header className="lg-header">
        <h1 className="lg-header__title">Mi Libreta Fútbolera</h1>
        {activeTeam && (
          <p className="lg-header__subtitle">
            {activeTeam.name} · {activeTeam.game}
          </p>
        )}
      </header>

      {error && (
        <div className="lg-banner" role="alert">
          <span>{error}</span>
          <button type="button" className="lg-banner__retry" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {showLoading && <p className="lg-status">Cargando libreta…</p>}

      {showEmpty && (
        <section className="lg-card lg-empty">
          <h2 className="lg-section-title">Crea tu primer equipo</h2>
          <p className="lg-hint">Lleva tus partidos, goles y jugadores destacados en un solo lugar.</p>
          <button type="button" className="lg-btn lg-btn--primary" onClick={handleCreate}>
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
            <p className="lg-history">
              Incluye {activeTeam.archivedGoals}{' '}
              {activeTeam.archivedGoals === 1 ? 'gol' : 'goles'} de jugadores eliminados
            </p>
          )}

          <section className="lg-card lg-players" aria-label="Jugadores destacados">
            <h2 className="lg-section-title">Jugadores destacados</h2>
            <p className="lg-hint">
              Un gol aquí sube GA automáticamente.
              {topScorer && ` Máximo goleador: ${topScorer.name} (${topScorer.goals}).`}
            </p>
            <div className="lg-players__list">
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
            className={`lg-btn lg-delete${confirming ? ' lg-delete--confirm' : ''}`}
            onClick={handleDelete}
          >
            {confirming ? 'Toca otra vez para borrar' : 'Borrar este equipo'}
          </button>
        </>
      )}
    </main>
  );
}
