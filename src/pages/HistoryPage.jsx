import { useState } from "react";
import { Search, X, Star, ChevronRight, ArrowLeft, RefreshCw, AlertCircle, Shield, Zap, Filter, Users2 } from "lucide-react";
import {
  useHistoricalPlayers,
  useHistoricalPlayerDetail,
  getHistoricalImageUrl,
} from "../hooks/HooksHistory/useHistoricalPlayers";
import HistoryRightPanel from "../components/ComPanels/HistoryRightPanel";
import "../styles/StylesPages/HistoryPage.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LEGACY_COLOR = {
  "Goal Scorer": "#f59e0b",
  "Tactician":   "#3b82f6",
  "Innovator":   "#8b5cf6",
  "Leader":      "#10b981",
  "Goalkeeper":  "#ec4899",
};

// Mapas de traducción para valores almacenados en DB
const POSITION_LABEL = {
  "Forward":    "Delantero",
  "Midfielder": "Centrocampista",
  "Defender":   "Defensor",
  "Goalkeeper": "Portero",
};

const LEGACY_LABEL = {
  "Goal Scorer": "Goleador",
  "Tactician":   "Táctico",
  "Innovator":   "Innovador",
  "Leader":      "Líder",
  "Goalkeeper":  "Portero",
};

const EVENT_TYPE_LABEL = {
  "Championship":          "Campeonato",
  "Historic Match":        "Partido Histórico",
  "Legendary Performance": "Actuación Legendaria",
  "Era Defining":          "Definió una Era",
  "Record":                "Récord",
};

const SIGNIFICANCE_LABEL = ["", "Histórico", "Notable", "Estrella", "Leyenda", "GOAT Status"];

function SignificanceStars({ value }) {
  return (
    <span className="hp-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={10}
          fill={n <= value ? "#f59e0b" : "none"}
          stroke={n <= value ? "#f59e0b" : "var(--border)"}
        />
      ))}
    </span>
  );
}

function LegacyBadge({ type }) {
  if (!type) return null;
  const color = LEGACY_COLOR[type] || "var(--accent)";
  return (
    <span className="hp-badge" style={{ "--badge-color": color }}>
      {LEGACY_LABEL[type] || type}
    </span>
  );
}

function PlayerAvatar({ imagePath, name, size = "md" }) {
  const url = getHistoricalImageUrl(imagePath);
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className={`hp-avatar hp-avatar--${size}`}>
      {url ? (
        <img src={url} alt={name} className="hp-avatar-img" />
      ) : (
        <span className="hp-avatar-initials">{initials}</span>
      )}
    </div>
  );
}

// ─── Card de jugador ──────────────────────────────────────────────────────────
function PlayerCard({ player, onClick, isActive, onMouseEnter, onMouseLeave }) {
  return (
    <article
      className={`hp-player-card${isActive ? " hp-player-card--active" : ""}`}
      onClick={() => onClick(player)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="hp-card-sig-bar" style={{ "--sig": player.significance_level || 1 }} />

      <PlayerAvatar imagePath={player.image_path} name={player.name} size="lg" />

      <div className="hp-card-body">
        <div className="hp-card-top">
          <h3 className="hp-card-name">{player.name}</h3>
          <SignificanceStars value={player.significance_level || 0} />
        </div>

        <div className="hp-card-meta">
          {player.country && (
            <span className="hp-card-country">{player.country}</span>
          )}
          {player.position && (
            <span className="hp-card-sep">·</span>
          )}
          {player.position && (
            <span className="hp-card-position">{POSITION_LABEL[player.position] || player.position}</span>
          )}
          {player.era && (
            <>
              <span className="hp-card-sep">·</span>
              <span className="hp-card-era">{player.era}</span>
            </>
          )}
        </div>

        {player.impact_summary && (
          <p className="hp-card-summary">{player.impact_summary}</p>
        )}

        <div className="hp-card-footer">
          <LegacyBadge type={player.legacy_type} />
          <ChevronRight size={14} className="hp-card-chevron" />
        </div>
      </div>
    </article>
  );
}

// ─── Panel de detalle ─────────────────────────────────────────────────────────
function PlayerDetail({ playerId, onBack }) {
  const { player, teams, events, loading, error, reload } = useHistoricalPlayerDetail(playerId);

  if (loading) {
    return (
      <div className="hp-detail-loading">
        <RefreshCw size={20} className="hp-spin" />
        <span>Cargando jugador...</span>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="hp-detail-error">
        <AlertCircle size={20} />
        <p>{error || "Jugador no encontrado"}</p>
        <button className="hp-retry-btn" onClick={reload}>
          <RefreshCw size={12} /> Reintentar
        </button>
      </div>
    );
  }

  const imageUrl = getHistoricalImageUrl(player.image_path);
  const lifespan = player.birth_year
    ? `${player.birth_year}${player.death_year ? ` – ${player.death_year}` : " – presente"}`
    : null;

  return (
    <div className="hp-detail">
      {/* Botón volver */}
      <button className="hp-detail-back" onClick={onBack}>
        <ArrowLeft size={14} />
        <span>Volver a jugadores</span>
      </button>

      {/* Hero */}
      <div className="hp-detail-hero">
        <div className="hp-detail-hero-img-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt={player.name} className="hp-detail-hero-img" />
          ) : (
            <div className="hp-detail-hero-placeholder">
              {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
          )}
          {player.significance_level === 5 && (
            <span className="hp-goat-chip">GOAT</span>
          )}
        </div>

        <div className="hp-detail-hero-info">
          <h1 className="hp-detail-name">{player.name}</h1>

          <div className="hp-detail-chips">
            {player.country  && <span className="hp-detail-chip hp-chip--country">{player.country}</span>}
            {player.position && <span className="hp-detail-chip hp-chip--pos">{POSITION_LABEL[player.position] || player.position}</span>}
            {player.era      && <span className="hp-detail-chip hp-chip--era">{player.era}</span>}
            {lifespan        && <span className="hp-detail-chip hp-chip--life">{lifespan}</span>}
          </div>

          <div className="hp-detail-sig-row">
            <SignificanceStars value={player.significance_level || 0} />
            <span className="hp-detail-sig-label">
              {SIGNIFICANCE_LABEL[player.significance_level || 0]}
            </span>
          </div>

          {player.legacy_type && (
            <LegacyBadge type={player.legacy_type} />
          )}
        </div>
      </div>

      {/* Narrativa */}
      {player.impact_summary && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep">Por qué importa</span>
          <p className="hp-detail-impact">{player.impact_summary}</p>
        </section>
      )}

      {player.description && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep">Historia</span>
          <div className="hp-detail-desc">
            {player.description.split("\n").map((para, i) =>
              para.trim() ? <p key={i}>{para.trim()}</p> : null
            )}
          </div>
        </section>
      )}

      {/* Equipos */}
      {teams.length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep">
            <Shield size={11} /> Equipos
          </span>
          <div className="hp-detail-teams">
            {teams.map((row, i) => {
              const team = row.historical_teams;
              const teamImg = getHistoricalImageUrl(team?.image_path);
              return (
                <div key={i} className="hp-team-row">
                  <div className="hp-team-logo-wrap">
                    {teamImg ? (
                      <img src={teamImg} alt={team?.name} className="hp-team-logo" />
                    ) : (
                      <div className="hp-team-logo-ph">
                        <Shield size={14} />
                      </div>
                    )}
                  </div>
                  <div className="hp-team-info">
                    <span className="hp-team-name">{team?.name}</span>
                    {team?.country && (
                      <span className="hp-team-country">{team.country}</span>
                    )}
                  </div>
                  <div className="hp-team-years">
                    {row.start_year || "?"} – {row.end_year || "?"}
                  </div>
                  {row.roles && (
                    <span className="hp-team-role">{row.roles}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Eventos */}
      {events.length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep">
            <Zap size={11} /> Momentos históricos
          </span>
          <div className="hp-detail-events">
            {events.map((row, i) => {
              const ev = row.historical_events;
              const evImg = getHistoricalImageUrl(ev?.image_path);
              const year = ev?.event_date
                ? new Date(ev.event_date).getFullYear()
                : null;
              return (
                <div key={i} className="hp-event-row">
                  {evImg && (
                    <img src={evImg} alt={ev?.title} className="hp-event-img" />
                  )}
                  <div className="hp-event-info">
                    <span className="hp-event-title">{ev?.title}</span>
                    <div className="hp-event-meta">
                      {ev?.event_type && (
                        <span className="hp-event-type">
                          {EVENT_TYPE_LABEL[ev.event_type] || ev.event_type}
                        </span>
                      )}
                      {year && <span className="hp-event-year">{year}</span>}
                    </div>
                    {row.role_note && (
                      <span className="hp-event-role">{row.role_note}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [hoveredPlayer, setHoveredPlayer]       = useState(null);
  const [showFilters, setShowFilters]           = useState(false);

  const {
    players, allPlayers, loading, error, reload,
    search, setSearch,
    filterPosition, setFilterPosition,
    filterEra, setFilterEra,
    filterLegacy, setFilterLegacy,
    positions, eras, legacies,
  } = useHistoricalPlayers();

  const hasActiveFilters = filterPosition || filterEra || filterLegacy;

  const clearFilters = () => {
    setFilterPosition("");
    setFilterEra("");
    setFilterLegacy("");
  };

  const panelPlayer = hoveredPlayer || (selectedPlayerId
    ? allPlayers.find((p) => p.id === selectedPlayerId) || null
    : null);

  // ── Vista detalle ──
  if (selectedPlayerId) {
    return (
      <div className="hp-shell">
        <div className="hp-root hp-root--detail">
          <PlayerDetail
            playerId={selectedPlayerId}
            onBack={() => setSelectedPlayerId(null)}
          />
        </div>
        <HistoryRightPanel
          allPlayers={allPlayers}
          selectedPlayer={panelPlayer}
          onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
        />
      </div>
    );
  }

  // ── Vista listado ──
  return (
    <div className="hp-shell">

      {/* ── COLUMNA PRINCIPAL ── */}
      <div className="hp-root">

        {/* Encabezado de sección */}
        <header className="hp-header">
          <div className="hp-header-left">
            <div className="hp-header-icon">
              <Users2 size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="hp-header-title">Sección Histórica</h1>
              <p className="hp-header-sub">
                {allPlayers.length} leyenda{allPlayers.length !== 1 ? "s" : ""} del fútbol mundial
              </p>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="hp-search-wrap">
            <div className="hp-search">
              <Search size={13} className="hp-search-ico" />
              <input
                className="hp-search-input"
                placeholder="Buscar jugador, país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="hp-search-clear" onClick={() => setSearch("")}>
                  <X size={11} />
                </button>
              )}
            </div>

            <button
              className={`hp-filter-btn ${hasActiveFilters ? "hp-filter-btn--active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={12} />
              Filtros
              {hasActiveFilters && <span className="hp-filter-dot" />}
            </button>
          </div>
        </header>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="hp-filters-panel">
            <div className="hp-filters-row">
              <div className="hp-filter-group">
                <label className="hp-filter-label">Posición</label>
                <select
                  className="hp-filter-select"
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                >
                  <option value="">Todas</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>{POSITION_LABEL[p] || p}</option>
                  ))}
                </select>
              </div>

              <div className="hp-filter-group">
                <label className="hp-filter-label">Era</label>
                <select
                  className="hp-filter-select"
                  value={filterEra}
                  onChange={(e) => setFilterEra(e.target.value)}
                >
                  <option value="">Todas</option>
                  {eras.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>

              <div className="hp-filter-group">
                <label className="hp-filter-label">Tipo de legado</label>
                <select
                  className="hp-filter-select"
                  value={filterLegacy}
                  onChange={(e) => setFilterLegacy(e.target.value)}
                >
                  <option value="">Todos</option>
                  {legacies.map((l) => (
                    <option key={l} value={l}>{LEGACY_LABEL[l] || l}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button className="hp-clear-filters" onClick={clearFilters}>
                  <X size={11} /> Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Estado: cargando */}
        {loading && (
          <div className="hp-state-msg">
            <RefreshCw size={18} className="hp-spin" />
            <span>Cargando leyendas...</span>
          </div>
        )}

        {/* Estado: error */}
        {error && !loading && (
          <div className="hp-state-error">
            <AlertCircle size={18} />
            <p>{error}</p>
            <button className="hp-retry-btn" onClick={reload}>
              <RefreshCw size={12} /> Reintentar
            </button>
          </div>
        )}

        {/* Estado: sin resultados */}
        {!loading && !error && players.length === 0 && (
          <div className="hp-state-empty">
            <Users2 size={28} strokeWidth={1} />
            <p className="hp-empty-title">
              {allPlayers.length === 0
                ? "Aún no hay jugadores históricos"
                : "Sin coincidencias"}
            </p>
            <p className="hp-empty-sub">
              {allPlayers.length === 0
                ? "El administrador publicará las leyendas pronto."
                : "Prueba con otro nombre o ajusta los filtros."}
            </p>
            {hasActiveFilters && (
              <button className="hp-retry-btn" onClick={clearFilters}>
                <X size={11} /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Grilla de jugadores */}
        {!loading && !error && players.length > 0 && (
          <>
            <div className="hp-results-bar">
              <span className="hp-results-count">
                {players.length} jugador{players.length !== 1 ? "es" : ""}
                {hasActiveFilters || search ? " encontrado" + (players.length !== 1 ? "s" : "") : ""}
              </span>
            </div>

            <div className="hp-grid">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isActive={player.id === selectedPlayerId}
                  onClick={(p) => setSelectedPlayerId(p.id)}
                  onMouseEnter={() => setHoveredPlayer(player)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── PANEL DERECHO ── */}
      <HistoryRightPanel
        allPlayers={allPlayers}
        selectedPlayer={panelPlayer}
        onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
      />

    </div>
  );
}