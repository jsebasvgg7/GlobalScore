import { useState, useEffect } from "react";
import { Users2, Trophy, Shield, Zap, ArrowRight } from "lucide-react";
import { useHistoricalPlayers, getHistoricalImageUrl } from "../hooks/useHistoricalPlayers";
import { useHistoricalCompetitions } from "../hooks/useHistoricalCompetitions";
import { useHistoricalTeams } from "../hooks/useHistoricalTeams";
import { useHistoricalEvents } from "../hooks/useHistoricalEvents";
import "../styles/HistoryMenuDesktop.css";

function Skeleton({ className = "" }) {
  return <div className={`hmd-skeleton ${className}`} />;
}

// ══════════════════════════════════════════════════════════════════════════════
//  FILA 1 IZQUIERDA — Eventos (rota automáticamente)
// ══════════════════════════════════════════════════════════════════════════════
function EventsCard({ events, loading, onClick }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (events.length < 2) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % events.length);
        setFade(true);
      }, 300);
    }, 9000);
    return () => clearInterval(t);
  }, [events.length]);

  const ev = events[idx] || null;
  const bannerUrl = ev ? getHistoricalImageUrl(ev.banner_image_path || ev.image_path) : null;
  const protagonist = ev?.event_category === "player" ? ev.historical_players : ev?.historical_teams;
  const year = ev?.event_date ? new Date(ev.event_date).getFullYear() : null;

  return (
    <button
      className="hmd-item hmd-item--events"
      onClick={onClick}
      disabled={loading}
      aria-label="Ir a Momentos Históricos"
    >
      <div className="hmd-frame" />

      <div className="hmd-player-bg">
        {bannerUrl
          ? <img src={bannerUrl} alt={ev?.title} className={`hmd-player-bg-img${fade ? "" : " hmd-player-bg-img--fade"}`} key={bannerUrl} />
          : <div className="hmd-player-bg-ph"><Zap size={52} strokeWidth={1} /></div>
        }
        <div className="hmd-player-overlay" />
      </div>

      <div className="hmd-item-badge">
        <Zap size={10} />
        <span>Momentos Históricos</span>
      </div>

      {events.length > 1 && (
        <div className="hmd-dots">
          {events.slice(0, 6).map((_, i) => (
            <span key={i} className={`hmd-dot${i === idx % 6 ? " hmd-dot--active" : ""}`} />
          ))}
        </div>
      )}

      <div className={`hmd-player-content${fade ? "" : " hmd-player-content--fade"}`}>
        {loading ? (
          <>
            <Skeleton className="hmd-skeleton--name" />
            <Skeleton className="hmd-skeleton--meta" />
          </>
        ) : ev ? (
          <>
            {year && <span className="hmd-player-legacy">{year}</span>}
            <h2 className="hmd-player-name">{ev.title}</h2>
            <div className="hmd-player-meta">
              {protagonist && <span>{protagonist.name}</span>}
              {ev.event_type && <><span className="hmd-sep">·</span><span>{ev.event_type}</span></>}
            </div>
          </>
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
//  FILA 1 DERECHA — Competiciones
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
      <div className="hmd-frame" />
      <div className="hmd-item-badge">
        <Trophy size={10} />
        <span>Competiciones</span>
      </div>

      <div className="hmd-comp-list">
        {loading
          ? [1, 2, 3].map(i => (
            <div key={i} className="hmd-comp-row hmd-comp-row--skeleton">
              <Skeleton className="hmd-skeleton--logo" />
              <div className="hmd-comp-row-info">
                <Skeleton className="hmd-skeleton--comp-name" />
                <Skeleton className="hmd-skeleton--comp-meta" />
              </div>
            </div>
          ))
          : top3.length > 0
            ? top3.map((comp, i) => {
              const imgUrl = getHistoricalImageUrl(comp.image_path);
              const winner = comp.historical_teams?.name || comp.winner_text;
              return (
                <div key={comp.id} className="hmd-comp-row" style={{ "--i": i }}>
                  <div className="hmd-comp-logo">
                    {imgUrl ? <img src={imgUrl} alt={comp.name} /> : <Trophy size={18} strokeWidth={1.2} />}
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
            : <p className="hmd-empty-note">Sin competiciones</p>
        }
      </div>

      <div className="hmd-item-cta">
        <span>Ver todas las competiciones</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  FILA 2 IZQUIERDA — Jugador/Leyenda
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
      <div className="hmd-frame" />
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
            {player.country && <span className="hmd-iconic-country">{player.country}</span>}
            {player.position && <span className="hmd-iconic-pos">{player.position}</span>}
            {player.significance_level === 5 && <span className="hmd-iconic-goat">GOAT</span>}
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
//  FILA 2 DERECHA — Equipos
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
      <div className="hmd-frame" />
      <div className="hmd-item-badge">
        <Shield size={10} />
        <span>Equipos</span>
      </div>

      <div className="hmd-teams-grid">
        {loading
          ? [1, 2, 3, 4].map(i => (
            <div key={i} className="hmd-team-cell hmd-team-cell--skeleton">
              <Skeleton className="hmd-skeleton--team-shield" />
              <Skeleton className="hmd-skeleton--team-name" />
            </div>
          ))
          : display.length > 0
            ? display.map((team, i) => {
              const imgUrl = getHistoricalImageUrl(team.image_path);
              const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";
              return (
                <div key={team.id} className="hmd-team-cell" style={{ "--tc": team.primary_color || legColor, "--i": i }}>
                  <div className="hmd-team-shield">
                    {imgUrl ? <img src={imgUrl} alt={team.name} /> : <Shield size={22} strokeWidth={1.2} />}
                  </div>
                  <span className="hmd-team-name">{team.name}</span>
                  {team.era_dominance && <span className="hmd-team-era">{team.era_dominance}</span>}
                </div>
              );
            })
            : <p className="hmd-empty-note">Sin equipos</p>
        }
      </div>

      <div className="hmd-item-cta">
        <span>Ver todos los equipos</span>
        <ArrowRight size={14} />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoryMenuDesktop({ onSectionChange }) {
  const { allPlayers, loading: loadingPlayers } = useHistoricalPlayers();
  const { competitions, loading: loadingComps } = useHistoricalCompetitions();
  const { teams, loading: loadingTeams } = useHistoricalTeams();
  const { events, loading: loadingEvents } = useHistoricalEvents();

  const [iconicPlayer, setIconicPlayer] = useState(null);

  useEffect(() => {
    if (allPlayers.length > 0) {
      const idx = Math.floor(Math.random() * allPlayers.length);
      setIconicPlayer(allPlayers[idx]);
    }
  }, [allPlayers]);

  const navigate = (key) => onSectionChange?.(key);

  return (
    <div className="hmd-root">
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
            <span className="hmd-count-chip"><Users2 size={11} />{allPlayers.length} leyendas</span>
          )}
          {!loadingComps && competitions.length > 0 && (
            <span className="hmd-count-chip"><Trophy size={11} />{competitions.length} torneos</span>
          )}
          {!loadingTeams && teams.length > 0 && (
            <span className="hmd-count-chip"><Shield size={11} />{teams.length} equipos</span>
          )}
        </div>
      </header>

      <div className="hmd-grid">
        <EventsCard events={events} loading={loadingEvents} onClick={() => navigate("events")} />
        <CompetitionsCard competitions={competitions} loading={loadingComps} onClick={() => navigate("competitions")} />
        <PlayerIconicCard player={iconicPlayer} loading={loadingPlayers} onClick={() => navigate("players")} />
        <TeamsCard teams={teams} loading={loadingTeams} onClick={() => navigate("teams")} />
      </div>
    </div>
  );
}