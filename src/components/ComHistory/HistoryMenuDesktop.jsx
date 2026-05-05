import { useState, useEffect } from "react";
import { Users2, Trophy, Shield, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { useHistoricalPlayers, getHistoricalImageUrl } from "../../hooks/HooksHistory/useHistoricalPlayers";
import { useHistoricalCompetitions } from "../../hooks/HooksHistory/useHistoricalCompetitions";
import { useHistoricalTeams } from "../../hooks/HooksHistory/useHistoricalTeams";
import { useHistoricalEvents } from "../../hooks/HooksHistory/useHistoricalEvents";
import "../../styles/StylesHistory/HistoryMenuDesktop.css";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`hmd-skeleton ${className}`} />;
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTENEDOR 1 — Jugador histórico principal (grande, superior izquierdo)
// ══════════════════════════════════════════════════════════════════════════════
function PlayerMainCard({ player, loading, onClick }) {
  const imgUrl = player ? getHistoricalImageUrl(player.image_path) : null;

  return (
    <button
      className="hmd-item hmd-item--player-main"
      onClick={onClick}
      disabled={loading || !player}
      aria-label="Ir a Jugadores Históricos"
    >
      {/* Fondo imagen con overlay */}
      <div className="hmd-player-bg">
        {imgUrl ? (
          <img src={imgUrl} alt={player?.name} className="hmd-player-bg-img" />
        ) : (
          <div className="hmd-player-bg-ph">
            <Users2 size={52} strokeWidth={1} />
          </div>
        )}
        <div className="hmd-player-overlay" />
      </div>

      {/* Badge superior */}
      <div className="hmd-item-badge hmd-item-badge--top">
        <Users2 size={10} />
        <span>Jugadores</span>
      </div>

      {/* Contenido inferior */}
      <div className="hmd-player-content">
        {loading ? (
          <>
            <Skeleton className="hmd-skeleton--name" />
            <Skeleton className="hmd-skeleton--meta" />
          </>
        ) : player ? (
          <>
            {player.legacy_type && (
              <span className="hmd-player-legacy">{player.legacy_type}</span>
            )}
            <h2 className="hmd-player-name">{player.name}</h2>
            <div className="hmd-player-meta">
              {player.country && <span>{player.country}</span>}
              {player.position && (
                <>
                  <span className="hmd-sep">·</span>
                  <span>{player.position}</span>
                </>
              )}
              {player.ballon_dor_count > 0 && (
                <>
                  <span className="hmd-sep">·</span>
                  <span className="hmd-gold">{player.ballon_dor_count} Balón{player.ballon_dor_count > 1 ? "es" : ""} de Oro</span>
                </>
              )}
            </div>
            {player.impact_summary && (
              <p className="hmd-player-impact">
                {player.impact_summary.slice(0, 100)}
                {player.impact_summary.length > 100 ? "…" : ""}
              </p>
            )}
          </>
        ) : (
          <p className="hmd-empty-note">Sin datos</p>
        )}
      </div>

      {/* CTA */}
      <div className="hmd-item-cta">
        <span>Ver todos los jugadores</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTENEDOR 2 — Top 3 competiciones (superior derecho)
// ══════════════════════════════════════════════════════════════════════════════
function CompetitionsCard({ competitions, loading, onClick }) {
  const top3 = competitions.slice(0, 3);

  return (
    <button
      className="hmd-item hmd-item--competitions"
      onClick={onClick}
      disabled={loading}
      aria-label="Ir a Competiciones Históricas"
    >
      {/* Badge */}
      <div className="hmd-item-badge">
        <Trophy size={10} />
        <span>Competiciones</span>
      </div>

      <div className="hmd-comp-list">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="hmd-comp-row hmd-comp-row--skeleton">
              <Skeleton className="hmd-skeleton--logo" />
              <div className="hmd-comp-row-info">
                <Skeleton className="hmd-skeleton--comp-name" />
                <Skeleton className="hmd-skeleton--comp-meta" />
              </div>
            </div>
          ))
        ) : top3.length > 0 ? (
          top3.map((comp, i) => {
            const imgUrl = getHistoricalImageUrl(comp.image_path);
            const winner = comp.historical_teams?.name || comp.winner_text;
            return (
              <div key={comp.id} className="hmd-comp-row" style={{ "--i": i }}>
                <div className="hmd-comp-logo">
                  {imgUrl
                    ? <img src={imgUrl} alt={comp.name} />
                    : <Trophy size={18} strokeWidth={1.2} />
                  }
                </div>
                <div className="hmd-comp-row-info">
                  <span className="hmd-comp-name">{comp.name}</span>
                  <div className="hmd-comp-meta">
                    {comp.year && <span className="hmd-comp-year">{comp.year}</span>}
                    {comp.country && <><span className="hmd-sep">·</span><span>{comp.country}</span></>}
                  </div>
                  {winner && (
                    <span className="hmd-comp-winner">
                      <Trophy size={8} />{winner}
                    </span>
                  )}
                </div>
                <span className="hmd-comp-num">0{i + 1}</span>
              </div>
            );
          })
        ) : (
          <p className="hmd-empty-note">Sin competiciones</p>
        )}
      </div>

      {/* CTA */}
      <div className="hmd-item-cta">
        <span>Ver todas las competiciones</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTENEDOR 3 — Jugador icónico (columna estrecha, izquierdo medio)
// ══════════════════════════════════════════════════════════════════════════════
function PlayerIconicCard({ player, loading, onClick }) {
  const imgUrl = player ? getHistoricalImageUrl(player.image_path) : null;

  return (
    <button
      className="hmd-item hmd-item--iconic"
      onClick={onClick}
      disabled={loading || !player}
      aria-label="Ir a Jugadores Históricos"
    >
      <div className="hmd-item-badge">
        <Users2 size={10} />
        <span>Leyenda</span>
      </div>

      <div className="hmd-iconic-body">
        {loading ? (
          <>
            <Skeleton className="hmd-skeleton--avatar" />
            <Skeleton className="hmd-skeleton--iconic-name" />
            <Skeleton className="hmd-skeleton--iconic-pos" />
          </>
        ) : player ? (
          <>
            <div className="hmd-iconic-avatar">
              {imgUrl
                ? <img src={imgUrl} alt={player.name} />
                : <span>{player.name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <h3 className="hmd-iconic-name">{player.name}</h3>
            {player.country && (
              <span className="hmd-iconic-country">{player.country}</span>
            )}
            {player.position && (
              <span className="hmd-iconic-pos">{player.position}</span>
            )}
            {player.significance_level === 5 && (
              <span className="hmd-iconic-goat">GOAT</span>
            )}
          </>
        ) : null}
      </div>

      <div className="hmd-item-cta hmd-item-cta--sm">
        <ArrowRight size={12} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTENEDOR 4 — Equipos (derecho medio, ancho)
// ══════════════════════════════════════════════════════════════════════════════

const LEGACY_COLOR = {
  Dynastic: "#f59e0b",
  Innovative: "#8b5cf6",
  Continental: "#3b82f6",
  National: "#10b981",
};

function TeamsCard({ teams, loading, onClick }) {
  const display = teams.slice(0, 4);

  return (
    <button
      className="hmd-item hmd-item--teams"
      onClick={onClick}
      disabled={loading}
      aria-label="Ir a Equipos Históricos"
    >
      <div className="hmd-item-badge">
        <Shield size={10} />
        <span>Equipos</span>
      </div>

      <div className="hmd-teams-grid">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="hmd-team-cell hmd-team-cell--skeleton">
              <Skeleton className="hmd-skeleton--team-shield" />
              <Skeleton className="hmd-skeleton--team-name" />
            </div>
          ))
        ) : display.length > 0 ? (
          display.map((team, i) => {
            const imgUrl = getHistoricalImageUrl(team.image_path);
            const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";
            return (
              <div
                key={team.id}
                className="hmd-team-cell"
                style={{ "--tc": team.primary_color || legColor, "--i": i }}
              >
                <div className="hmd-team-shield">
                  {imgUrl
                    ? <img src={imgUrl} alt={team.name} />
                    : <Shield size={22} strokeWidth={1.2} />
                  }
                </div>
                <span className="hmd-team-name">{team.name}</span>
                {team.era_dominance && (
                  <span className="hmd-team-era">{team.era_dominance}</span>
                )}
              </div>
            );
          })
        ) : (
          <p className="hmd-empty-note">Sin equipos</p>
        )}
      </div>

      <div className="hmd-item-cta">
        <span>Ver todos los equipos</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTENEDOR 5 — Momentos históricos (fila inferior, span completo)
// ══════════════════════════════════════════════════════════════════════════════
function EventsCard({ events, loading, onClick }) {
  const display = events.slice(0, 2);

  return (
    <button
      className="hmd-item hmd-item--events"
      onClick={onClick}
      disabled={loading}
      aria-label="Ir a Momentos Históricos"
    >
      <div className="hmd-item-badge">
        <Zap size={10} />
        <span>Momentos Históricos</span>
      </div>

      <div className="hmd-events-row">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="hmd-event-cell hmd-event-cell--skeleton">
              <Skeleton className="hmd-skeleton--event-img" />
              <Skeleton className="hmd-skeleton--event-title" />
            </div>
          ))
        ) : display.length > 0 ? (
          display.map((ev, i) => {
            const bannerUrl = getHistoricalImageUrl(ev.banner_image_path || ev.image_path);
            const protagonist = ev.event_category === "player"
              ? ev.historical_players
              : ev.historical_teams;
            const year = ev.event_date ? new Date(ev.event_date).getFullYear() : null;
            return (
              <div key={ev.id} className="hmd-event-cell" style={{ "--i": i }}>
                <div className="hmd-event-img-wrap">
                  {bannerUrl
                    ? <img src={bannerUrl} alt={ev.title} />
                    : <div className="hmd-event-img-ph"><Zap size={24} strokeWidth={1} /></div>
                  }
                  <div className="hmd-event-img-overlay" />
                  {year && <span className="hmd-event-year">{year}</span>}
                </div>
                <div className="hmd-event-info">
                  <h3 className="hmd-event-title">{ev.title}</h3>
                  {protagonist && (
                    <span className="hmd-event-protagonist">{protagonist.name}</span>
                  )}
                  {ev.event_type && (
                    <span className="hmd-event-type">{ev.event_type}</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="hmd-empty-note">Sin momentos históricos</p>
        )}
      </div>

      <div className="hmd-item-cta">
        <span>Explorar momentos históricos</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoryMenuDesktop({ onSectionChange }) {
  const { allPlayers, loading: loadingPlayers } = useHistoricalPlayers();
  const { competitions, loading: loadingComps } = useHistoricalCompetitions();
  const { teams, loading: loadingTeams } = useHistoricalTeams();
  const { events, loading: loadingEvents } = useHistoricalEvents();

  // Dos jugadores aleatorios distintos, calculados una vez al montar
  const [randomPlayers, setRandomPlayers] = useState([null, null]);

  useEffect(() => {
    if (allPlayers.length >= 2) {
      const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
      setRandomPlayers([shuffled[0], shuffled[1]]);
    } else if (allPlayers.length === 1) {
      setRandomPlayers([allPlayers[0], null]);
    }
  }, [allPlayers]);

  const [featuredPlayer, iconicPlayer] = randomPlayers;

  const navigate = (key) => onSectionChange?.(key);

  return (
    <div className="hmd-root">
      {/* ── Header ── */}
      <header className="hmd-header">
        <div className="hmd-header-left">
          <div className="hmd-header-vault-icon" aria-hidden="true">⬡</div>
          <div>
            <h1 className="hmd-header-title">BÓVEDA HISTÓRICA</h1>
            <p className="hmd-header-sub">Selecciona una sección del archivo</p>
          </div>
        </div>
        <div className="hmd-header-counts">
          {!loadingPlayers && allPlayers.length > 0 && (
            <span className="hmd-count-chip">
              <Users2 size={11} />{allPlayers.length} leyendas
            </span>
          )}
          {!loadingComps && competitions.length > 0 && (
            <span className="hmd-count-chip">
              <Trophy size={11} />{competitions.length} torneos
            </span>
          )}
          {!loadingTeams && teams.length > 0 && (
            <span className="hmd-count-chip">
              <Shield size={11} />{teams.length} equipos
            </span>
          )}
        </div>
      </header>

      {/* ── Bento Grid ── */}
      <div className="hmd-grid">
        {/* Row 1 */}
        <PlayerMainCard
          player={featuredPlayer}
          loading={loadingPlayers}
          onClick={() => navigate("players")}
        />
        <CompetitionsCard
          competitions={competitions}
          loading={loadingComps}
          onClick={() => navigate("competitions")}
        />

        {/* Row 2 */}
        <PlayerIconicCard
          player={iconicPlayer}
          loading={loadingPlayers}
          onClick={() => navigate("players")}
        />
        <TeamsCard
          teams={teams}
          loading={loadingTeams}
          onClick={() => navigate("teams")}
        />

        {/* Row 3 — span completo */}
        <EventsCard
          events={events}
          loading={loadingEvents}
          onClick={() => navigate("events")}
        />
      </div>
    </div>
  );
}
