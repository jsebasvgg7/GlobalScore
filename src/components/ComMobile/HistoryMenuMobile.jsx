import { useState, useEffect } from "react";
import { Users2, Trophy, Shield, Zap, ArrowRight, ChevronRight } from "lucide-react";
import { useHistoricalPlayers, getHistoricalImageUrl } from "../../hooks/HooksHistory/useHistoricalPlayers";
import { useHistoricalCompetitions } from "../../hooks/HooksHistory/useHistoricalCompetitions";
import { useHistoricalTeams } from "../../hooks/HooksHistory/useHistoricalTeams";
import { useHistoricalEvents } from "../../hooks/HooksHistory/useHistoricalEvents";
import "../../styles/StylesMobile/HistoryMenuMobile.css";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 16, style = {} }) {
  return (
    <span
      className="hmm-skel"
      style={{ width: w, height: h, display: "block", ...style }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ÍTEM 1 — HEADER (no navega)
// ══════════════════════════════════════════════════════════════════════════════
function MenuHeader() {
  return (
    <div className="hmm-header">
      {/* Ruido de fondo tipo grid paper */}
      <div className="hmm-header-grid" aria-hidden="true" />

      {/* Eyebrow */}
      <div className="hmm-eyebrow">
        <span className="hmm-eyebrow-line" />
        <span className="hmm-eyebrow-text">Archivo Histórico</span>
        <span className="hmm-eyebrow-line" />
      </div>

      {/* Título estilo editorial asimétrico */}
      <div className="hmm-title-block">
        <div className="hmm-title-tag">BÓVEDA</div>
        <div className="hmm-title-main">
          <span className="hmm-title-h">Histó</span>
          <span className="hmm-title-h hmm-title-h--outline">rica</span>
        </div>
      </div>

      {/* Sticker decorativo */}
      <div className="hmm-header-sticker" aria-hidden="true">
        <span>⬡</span>
        <span className="hmm-sticker-text">ACCESO</span>
      </div>

      <p className="hmm-header-sub">
        Selecciona una sección del archivo para explorar las leyendas del fútbol mundial.
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ÍTEM 2 — JUGADOR HISTÓRICO (navega → players)
// ══════════════════════════════════════════════════════════════════════════════
function PlayerItem({ player, loading, onClick }) {
  const imgUrl = player ? getHistoricalImageUrl(player.image_path) : null;

  return (
    <button
      className="hmm-item hmm-item--player"
      onClick={onClick}
      disabled={loading || !player}
      aria-label="Ir a Jugadores Históricos"
    >
      {/* Ventana estilo browser (decorativa) */}
      <div className="hmm-browser-bar" aria-hidden="true">
        <span className="hmm-browser-dot hmm-browser-dot--r" />
        <span className="hmm-browser-dot hmm-browser-dot--y" />
        <span className="hmm-browser-dot hmm-browser-dot--g" />
        <span className="hmm-browser-url">jugadores/</span>
      </div>

      <div className="hmm-player-body">
        {/* Foto circular */}
        <div className="hmm-player-avatar-wrap">
          <div className="hmm-player-avatar">
            {loading ? (
              <Skel w={72} h={72} />
            ) : imgUrl ? (
              <img src={imgUrl} alt={player?.name} />
            ) : (
              <span>{player?.name?.slice(0, 2).toUpperCase() || "??"}</span>
            )}
          </div>
          {/* Badge "Live" estilo referencia */}
          <span className="hmm-live-badge">
            <span className="hmm-live-dot" />
            HIST
          </span>
        </div>

        {/* Info */}
        <div className="hmm-player-info">
          <span className="hmm-section-label">
            <Users2 size={10} /> Jugador Histórico
          </span>
          {loading ? (
            <>
              <Skel w="85%" h={20} style={{ marginBottom: 6 }} />
              <Skel w="60%" h={13} />
            </>
          ) : player ? (
            <>
              {player.legacy_type && (
                <span className="hmm-player-legacy">{player.legacy_type}</span>
              )}
              <h2 className="hmm-player-name">{player.name}</h2>
              <div className="hmm-player-meta">
                {player.country && <span>{player.country}</span>}
                {player.position && (
                  <><span className="hmm-sep">·</span><span>{player.position}</span></>
                )}
              </div>
              {player.ballon_dor_count > 0 && (
                <span className="hmm-ballon-chip">
                  {player.ballon_dor_count} Balón{player.ballon_dor_count > 1 ? "es" : ""} de Oro
                </span>
              )}
            </>
          ) : null}
        </div>

        <ChevronRight size={18} className="hmm-arrow" />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ÍTEM 3a — COMPETICIÓN VISUAL (solo visual, no navega)
// ══════════════════════════════════════════════════════════════════════════════
function CompVisual({ competition }) {
  if (!competition) return null;
  const imgUrl = getHistoricalImageUrl(competition.image_path);

  return (
    <div className="hmm-comp-visual" aria-hidden="true">
      <div className="hmm-comp-logo-wrap">
        {imgUrl
          ? <img src={imgUrl} alt={competition.name} />
          : <Trophy size={22} strokeWidth={1.2} />
        }
      </div>
      <div className="hmm-comp-visual-info">
        <span className="hmm-comp-visual-name">{competition.name}</span>
        <div className="hmm-comp-visual-meta">
          {competition.year && <span className="hmm-comp-year-tag">{competition.year}</span>}
          {competition.country && <span>{competition.country}</span>}
        </div>
      </div>
      {/* Decoración numérica */}
      <span className="hmm-comp-num-deco">01</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ÍTEM 3b — BOTÓN COMPETICIONES (navega → competitions)
// ══════════════════════════════════════════════════════════════════════════════
function CompButton({ competition, loading, onClick }) {
  const winner = competition?.historical_teams?.name || competition?.winner_text;

  return (
    <button
      className="hmm-item hmm-item--comp-btn"
      onClick={onClick}
      disabled={loading}
      aria-label="Ir a Competiciones Históricas"
    >
      <div className="hmm-comp-btn-body">
        <div className="hmm-comp-btn-left">
          <span className="hmm-section-label">
            <Trophy size={10} /> Competiciones
          </span>
          {loading ? (
            <>
              <Skel w="90%" h={18} style={{ marginBottom: 5 }} />
              <Skel w="55%" h={12} />
            </>
          ) : competition ? (
            <>
              <p className="hmm-comp-btn-name">{competition.name}</p>
              {winner && (
                <span className="hmm-comp-btn-winner">
                  <Trophy size={9} /> Campeón: {winner}
                </span>
              )}
              {competition.type && (
                <span className="hmm-comp-type-badge">{competition.type}</span>
              )}
            </>
          ) : null}
        </div>

        {/* Flecha CTA estilo referencia */}
        <div className="hmm-comp-cta">
          <span className="hmm-comp-cta-text">Ver torneos</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Sticker decorativo "Live at your Channel" equivalente */}
      <div className="hmm-comp-sticker" aria-hidden="true">
        <span>TOP</span>
        <span className="hmm-comp-sticker-sub">COMP</span>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ÍTEM 4 — EQUIPO (navega → teams)
// ══════════════════════════════════════════════════════════════════════════════
const LEGACY_COLOR = {
  Dynastic: "#f59e0b",
  Innovative: "#8b5cf6",
  Continental: "#3b82f6",
  National: "#10b981",
};

function TeamItem({ team, loading, onClick }) {
  const imgUrl = team ? getHistoricalImageUrl(team.image_path) : null;
  const legColor = team ? (LEGACY_COLOR[team.legacy_type] || "var(--accent)") : "var(--accent)";

  return (
    <button
      className="hmm-item hmm-item--team"
      onClick={onClick}
      disabled={loading || !team}
      style={{ "--tc": team?.primary_color || legColor }}
      aria-label="Ir a Equipos Históricos"
    >
      {/* Ventana browser */}
      <div className="hmm-browser-bar" aria-hidden="true">
        <span className="hmm-browser-dot hmm-browser-dot--r" />
        <span className="hmm-browser-dot hmm-browser-dot--y" />
        <span className="hmm-browser-dot hmm-browser-dot--g" />
        <span className="hmm-browser-url">equipos/</span>
      </div>

      {/* Franja de color del equipo */}
      <div className="hmm-team-stripe" />

      <div className="hmm-team-body">
        {/* Logo grande centrado */}
        <div className="hmm-team-logo-wrap">
          {loading ? (
            <Skel w={80} h={80} />
          ) : imgUrl ? (
            <img src={imgUrl} alt={team?.name} />
          ) : (
            <Shield size={32} strokeWidth={1.2} />
          )}
        </div>

        <div className="hmm-team-info">
          <span className="hmm-section-label">
            <Shield size={10} /> Equipo Histórico
          </span>
          {loading ? (
            <>
              <Skel w="80%" h={22} style={{ marginBottom: 6 }} />
              <Skel w="50%" h={13} />
            </>
          ) : team ? (
            <>
              <h2 className="hmm-team-name">{team.name}</h2>
              <div className="hmm-team-meta">
                {team.country && <span>{team.country}</span>}
                {team.era_dominance && (
                  <><span className="hmm-sep">·</span><span>{team.era_dominance}</span></>
                )}
              </div>
              {team.legacy_type && (
                <span
                  className="hmm-team-legacy"
                  style={{ "--lc": legColor }}
                >
                  {team.legacy_type}
                </span>
              )}
              {team.titles_count > 0 && (
                <span className="hmm-team-titles">
                  <Trophy size={10} /> {team.titles_count} título{team.titles_count !== 1 ? "s" : ""}
                </span>
              )}
            </>
          ) : null}
        </div>

        <ChevronRight size={18} className="hmm-arrow" />
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ÍTEM 5 — MOMENTO HISTÓRICO (navega → events)
// ══════════════════════════════════════════════════════════════════════════════
function EventItem({ event, loading, onClick }) {
  const bannerUrl = event
    ? getHistoricalImageUrl(event.banner_image_path || event.image_path)
    : null;
  const protagonist =
    event?.event_category === "player"
      ? event.historical_players
      : event?.historical_teams;
  const year = event?.event_date
    ? new Date(event.event_date).getFullYear()
    : null;

  return (
    <button
      className="hmm-item hmm-item--event"
      onClick={onClick}
      disabled={loading}
      aria-label="Ir a Momentos Históricos"
    >
      {/* Imagen a ancho completo */}
      <div className="hmm-event-img-wrap">
        {loading ? (
          <Skel w="100%" h={200} />
        ) : bannerUrl ? (
          <img src={bannerUrl} alt={event?.title} />
        ) : (
          <div className="hmm-event-img-ph">
            <Zap size={36} strokeWidth={1} />
          </div>
        )}
        <div className="hmm-event-img-overlay" />

        {/* Badges sobre imagen */}
        <div className="hmm-event-badges">
          <span className="hmm-event-badge hmm-event-badge--section">
            <Zap size={10} /> Momentos
          </span>
          {year && (
            <span className="hmm-event-badge hmm-event-badge--year">{year}</span>
          )}
        </div>

        {/* Sticker "Live" equivalente */}
        {!loading && event && (
          <div className="hmm-event-live-sticker">
            <span>HIST</span>
            <span className="hmm-event-live-sub">ÓRICO</span>
          </div>
        )}
      </div>

      {/* Info bajo la imagen */}
      <div className="hmm-event-body">
        {loading ? (
          <>
            <Skel w="85%" h={22} style={{ marginBottom: 8 }} />
            <Skel w="55%" h={14} />
          </>
        ) : event ? (
          <>
            <h2 className="hmm-event-title">{event.title}</h2>
            {protagonist && (
              <div className="hmm-event-protagonist">
                <div className="hmm-event-proto-avatar">
                  {getHistoricalImageUrl(protagonist.image_path) ? (
                    <img
                      src={getHistoricalImageUrl(protagonist.image_path)}
                      alt={protagonist.name}
                    />
                  ) : (
                    <span>{protagonist.name?.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="hmm-event-proto-name">{protagonist.name}</span>
              </div>
            )}
            {event.event_type && (
              <span className="hmm-event-type">{event.event_type}</span>
            )}
            {event.description && (
              <p className="hmm-event-desc">
                {event.description.slice(0, 90)}
                {event.description.length > 90 ? "…" : ""}
              </p>
            )}
          </>
        ) : (
          <p className="hmm-empty-note">Sin momentos históricos</p>
        )}

        {/* CTA */}
        <div className="hmm-event-cta">
          <span>Explorar todos los momentos</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoryMenuMobile({ onSectionChange }) {
  const { allPlayers, loading: loadingPlayers } = useHistoricalPlayers();
  const { competitions, loading: loadingComps } = useHistoricalCompetitions();
  const { teams, loading: loadingTeams } = useHistoricalTeams();
  const { events, loading: loadingEvents } = useHistoricalEvents();

  // Un jugador aleatorio, calculado una vez al montar
  const [featuredPlayer, setFeaturedPlayer] = useState(null);

  useEffect(() => {
    if (allPlayers.length > 0) {
      const idx = Math.floor(Math.random() * allPlayers.length);
      setFeaturedPlayer(allPlayers[idx]);
    }
  }, [allPlayers]);

  const nav = (key) => onSectionChange?.(key);

  const firstComp = competitions[0] || null;
  const firstTeam = teams[0] || null;
  const firstEvent = events[0] || null;

  return (
    <div className="hmm-root">
      {/* ── 1. Header ─────────────────────────────────────────── */}
      <MenuHeader />

      {/* ── 2. Jugador histórico ──────────────────────────────── */}
      <PlayerItem
        player={featuredPlayer}
        loading={loadingPlayers}
        onClick={() => nav("players")}
      />

      {/* ── 3a. Competición visual (decorativa) ───────────────── */}
      {!loadingComps && firstComp && (
        <CompVisual competition={firstComp} />
      )}
      {loadingComps && (
        <div className="hmm-comp-visual hmm-comp-visual--loading">
          <Skel w={52} h={52} />
          <div style={{ flex: 1 }}>
            <Skel w="75%" h={16} style={{ marginBottom: 6 }} />
            <Skel w="45%" h={12} />
          </div>
        </div>
      )}

      {/* ── 3b. Botón competiciones ───────────────────────────── */}
      <CompButton
        competition={firstComp}
        loading={loadingComps}
        onClick={() => nav("competitions")}
      />

      {/* ── 4. Equipo ─────────────────────────────────────────── */}
      <TeamItem
        team={firstTeam}
        loading={loadingTeams}
        onClick={() => nav("teams")}
      />

      {/* ── 5. Momento histórico ──────────────────────────────── */}
      <EventItem
        event={firstEvent}
        loading={loadingEvents}
        onClick={() => nav("events")}
      />

      {/* Separador final decorativo */}
      <div className="hmm-footer-deco" aria-hidden="true">
        <span className="hmm-footer-line" />
        <span className="hmm-footer-icon">⬡</span>
        <span className="hmm-footer-line" />
      </div>
    </div>
  );
}
