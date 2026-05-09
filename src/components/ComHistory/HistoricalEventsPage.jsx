import { useState, useMemo } from "react";
import {
  Zap, Search, X, RefreshCw, AlertCircle,
  Users2, Shield, Trophy, ChevronRight,
  Calendar, Star, Globe, Filter, ArrowLeft,
} from "lucide-react";
import {
  useHistoricalEvents,
  useHistoricalEventDetail,
  getHistoricalImageUrl,
} from "../../hooks/HooksHistory/useHistoricalEvents";
import SectionHeaderMobile from "../ComMobile/SectionHeaderMobile";
import "../../styles/StylesHistory/HistoricalEventsPage.css";
import "../../styles/StylesMobile/HistoricalEventsPageMobile.css";

// ─── Mapas ────────────────────────────────────────────────────────────────────
const EVENT_TYPE_LABEL = {
  Championship: "Campeonato",
  "Historic Match": "Partido Histórico",
  "Legendary Performance": "Actuación Legendaria",
  "Era Defining": "Definió una Era",
  Record: "Récord",
};

const CAT_LABEL = { player: "Jugador", team: "Equipo" };
const CAT_ICON = { player: <Users2 size={10} />, team: <Shield size={10} /> };
const CAT_COLOR = { player: "#8b5cf6", team: "#3b82f6" };

const POSITION_ROLE_LABEL = {
  GK: "Portero", CB: "Defensa Central", LB: "Lateral Izq.",
  RB: "Lateral Der.", CDM: "Med. Def.", CM: "Centrocampista",
  CAM: "Med. Of.", LM: "Med. Izq.", RM: "Med. Der.",
  LW: "Ext. Izq.", RW: "Ext. Der.", ST: "Delantero", SS: "2º Del.",
};

const KNOCKOUT_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

// ─── Helper: diferencia de goles ──────────────────────────────────────────────
const gd = (f, c) => { const d = (f || 0) - (c || 0); return d > 0 ? `+${d}` : `${d}`; };

// ══════════════════════════════════════════════════════════════════════════════
//  CARD DEL GRID
// ══════════════════════════════════════════════════════════════════════════════
function EventCard({ event, onClick }) {
  const bannerUrl = getHistoricalImageUrl(event.banner_image_path);
  const imageUrl = getHistoricalImageUrl(event.image_path);
  const protagonist = event.event_category === "player"
    ? event.historical_players
    : event.historical_teams;
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;
  const catColor = CAT_COLOR[event.event_category] || "var(--accent)";

  return (
    <button className="hep-card" onClick={() => onClick(event)}>
      {/* Banner */}
      <div className="hep-card-banner">
        {bannerUrl
          ? <img src={bannerUrl} alt={event.title} className="hep-card-banner-img" />
          : imageUrl
            ? <img src={imageUrl} alt={event.title} className="hep-card-banner-img hep-card-banner-img--fallback" />
            : <div className="hep-card-banner-ph"><Zap size={28} strokeWidth={1} /></div>
        }
        <div className="hep-card-banner-overlay" />
        {/* Badges sobre banner */}
        <div className="hep-card-badges">
          {event.event_category && (
            <span className="hep-badge" style={{ "--bc": catColor }}>
              {CAT_ICON[event.event_category]}
              {CAT_LABEL[event.event_category]}
            </span>
          )}
          {event.event_type && (
            <span className="hep-badge hep-badge--type">
              {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="hep-card-body">
        <div className="hep-card-title-row">
          <h3 className="hep-card-title">{event.title}</h3>
        </div>

        {event.description && (
          <p className="hep-card-desc">
            {event.description.slice(0, 90)}{event.description.length > 110 ? "…" : ""}
          </p>
        )}

        {protagonist && (
          <div className="hep-card-protagonist">
            <div className="hep-card-proto-av">
              {getHistoricalImageUrl(protagonist.image_path)
                ? <img src={getHistoricalImageUrl(protagonist.image_path)} alt={protagonist.name} />
                : <span>{protagonist.name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <span className="hep-card-proto-name">{protagonist.name}</span>
            <ChevronRight size={13} className="hep-card-chevron" />
          </div>
        )}
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN: CONTEXTO
// ══════════════════════════════════════════════════════════════════════════════
function ContextSection({ text }) {
  if (!text) return null;
  return (
    <section className="hep-detail-section">
      <div className="hep-section-header">
        <span className="hep-section-label">Contexto</span>
      </div>
      <div className="hep-narrative-text">
        {text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SECCIÓN: IMPACTO
// ══════════════════════════════════════════════════════════════════════════════
function ImpactSection({ text }) {
  if (!text) return null;
  return (
    <section className="hep-detail-section hep-detail-section--impact">
      <div className="hep-section-header">
        <span className="hep-section-label">Impacto y Legado</span>
      </div>
      <div className="hep-narrative-text hep-narrative-text--impact">
        {text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DETALLE TIPO JUGADOR
// ══════════════════════════════════════════════════════════════════════════════
function PlayerEventDetail({ event, lineups }) {
  const protagonist = event.historical_players;
  const protoImg = getHistoricalImageUrl(protagonist?.image_path);

  // Priorizar nombres y marcador guardados en el evento
  const teamAName = event.team_a_name || lineups.team_a[0]?.team_name || "Equipo A";
  const teamBName = event.team_b_name || lineups.team_b[0]?.team_name || "Equipo B";
  const hasScore = event.score_a !== "" && event.score_a != null
    && event.score_b !== "" && event.score_b != null;

  return (
    <>
      {/* Protagonista */}
      {protagonist && (
        <section className="hep-detail-section">
          <div className="hep-section-header">
            <span className="hep-section-label"><Users2 size={10} /> Protagonista</span>
          </div>
          <div className="hep-protagonist-card">
            <div className="hep-proto-img-wrap">
              {protoImg
                ? <img src={protoImg} alt={protagonist.name} />
                : <div className="hep-proto-img-ph">{protagonist.name?.slice(0, 2).toUpperCase()}</div>
              }
            </div>
            <div className="hep-proto-info">
              <h2 className="hep-proto-name">{protagonist.name}</h2>
              <div className="hep-proto-meta">
                {protagonist.country && <span>{protagonist.country}</span>}
                {protagonist.position && <span className="hep-meta-sep">·</span>}
                {protagonist.position && <span>{protagonist.position}</span>}
              </div>
              {protagonist.impact_summary && (
                <p className="hep-proto-impact">"{protagonist.impact_summary.slice(0, 160)}{protagonist.impact_summary.length > 160 ? "…" : ""}"</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Alineaciones enfrentadas */}
      {(lineups.team_a.length > 0 || lineups.team_b.length > 0) && (
        <section className="hep-detail-section">
          <div className="hep-section-header">
            <span className="hep-section-label"><Shield size={10} /> El Enfrentamiento</span>
          </div>

          {/* Marcador del partido */}
          {hasScore && (
            <div className="hep-match-score">
              <span className="hep-match-score-team hep-match-score-team--a">{teamAName}</span>
              <div className="hep-match-score-box">
                <span className="hep-match-score-num">{event.score_a}</span>
                <span className="hep-match-score-sep">–</span>
                <span className="hep-match-score-num">{event.score_b}</span>
              </div>
              <span className="hep-match-score-team hep-match-score-team--b">{teamBName}</span>
            </div>
          )}

          <div className="hep-duel-layout">
            <LineupColumn players={lineups.team_a} teamName={teamAName} />
            <div className="hep-duel-vs">{hasScore ? "" : "VS"}</div>
            <LineupColumn players={lineups.team_b} teamName={teamBName} right />
          </div>
        </section>
      )}
    </>
  );
}

function LineupColumn({ players, teamName, right }) {
  return (
    <div className={`hep-lineup-col ${right ? "hep-lineup-col--right" : ""}`}>
      <div className="hep-lineup-team-name">{teamName}</div>
      <div className="hep-lineup-list">
        {players.map((p, i) => (
          <div key={p.id || i} className={`hep-lineup-row ${p.is_protagonist ? "hep-lineup-row--proto" : ""}`}>
            {p.is_protagonist && <Star size={10} className="hep-lineup-star" />}
            <span className="hep-lineup-num">{p.shirt_number || (i + 1)}</span>
            <span className="hep-lineup-name">{p.player_name}</span>
            {p.position_role && (
              <span className="hep-lineup-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DETALLE TIPO EQUIPO
// ══════════════════════════════════════════════════════════════════════════════
function TeamEventDetail({ event, squad, standings, knockout }) {
  const teamProtag = event.historical_teams;
  const teamImg = getHistoricalImageUrl(teamProtag?.image_path);

  const keyPlayers = squad.filter((p) => p.is_key_player);
  const restPlayers = squad.filter((p) => !p.is_key_player);

  // Separar knockout por rondas
  const byRound = useMemo(() => {
    return knockout.reduce((acc, m) => {
      if (!acc[m.round]) acc[m.round] = [];
      acc[m.round].push(m);
      return acc;
    }, {});
  }, [knockout]);
  const rounds = KNOCKOUT_ORDER.filter((r) => byRound[r]);

  return (
    <>
      {/* Equipo protagonista */}
      {teamProtag && (
        <section className="hep-detail-section">
          <div className="hep-section-header">
            <span className="hep-section-label"><Shield size={10} /> El Equipo Legendario</span>
          </div>
          <div className="hep-team-proto-card">
            <div className="hep-team-proto-shield"
              style={{ borderColor: teamProtag.primary_color || "var(--accent)" }}>
              {teamImg
                ? <img src={teamImg} alt={teamProtag.name} />
                : <Shield size={28} strokeWidth={1} />
              }
            </div>
            <div className="hep-team-proto-info">
              <h2 className="hep-team-proto-name">{teamProtag.name}</h2>
              <div className="hep-team-proto-meta">
                {teamProtag.country && <span>{teamProtag.country}</span>}
                {teamProtag.manager && <><span className="hep-meta-sep">·</span><span>DT: {teamProtag.manager}</span></>}
                {teamProtag.formation && <><span className="hep-meta-sep">·</span><span className="hep-team-formation">{teamProtag.formation}</span></>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Plantel */}
      {squad.length > 0 && (
        <section className="hep-detail-section">
          <div className="hep-section-header">
            <span className="hep-section-label"><Users2 size={10} /> Plantel Estelar</span>
          </div>

          {keyPlayers.length > 0 && (
            <div className="hep-squad-key">
              <div className="hep-squad-sublabel">Jugadores Clave</div>
              {keyPlayers.map((p, i) => (
                <SquadRow key={p.id || i} player={p} highlight />
              ))}
            </div>
          )}

          {restPlayers.length > 0 && (
            <div className="hep-squad-rest">
              {keyPlayers.length > 0 && <div className="hep-squad-sublabel">Resto del Plantel</div>}
              {restPlayers.map((p, i) => (
                <SquadRow key={p.id || i} player={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Clasificación */}
      {standings.length > 0 && (
        <section className="hep-detail-section">
          <div className="hep-section-header">
            <span className="hep-section-label"><Trophy size={10} /> La Campaña Perfecta</span>
          </div>
          <div className="hep-table-wrap">
            <table className="hep-table">
              <thead>
                <tr>
                  <th className="hep-th hep-th--pos">#</th>
                  <th className="hep-th hep-th--team">Equipo</th>
                  <th className="hep-th hep-th--num">PJ</th>
                  <th className="hep-th hep-th--num">G</th>
                  <th className="hep-th hep-th--num">E</th>
                  <th className="hep-th hep-th--num">P</th>
                  <th className="hep-th hep-th--num">GF</th>
                  <th className="hep-th hep-th--num">GC</th>
                  <th className="hep-th hep-th--num">DG</th>
                  <th className="hep-th hep-th--pts">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const pj = (row.wins || 0) + (row.draws || 0) + (row.losses || 0);
                  return (
                    <tr key={row.id || i} className={`hep-tr ${row.is_champion ? "hep-tr--champion" : ""}`}>
                      <td className="hep-td hep-td--pos">
                        {row.is_champion
                          ? <Trophy size={11} className="hep-champion-icon" />
                          : <span className="hep-pos-num">{row.position}</span>
                        }
                      </td>
                      <td className="hep-td hep-td--team">
                        {row.team_name}
                        {row.is_champion && <span className="hep-champion-tag">Campeón</span>}
                      </td>
                      <td className="hep-td hep-td--num">{pj || "–"}</td>
                      <td className="hep-td hep-td--num">{row.wins ?? "–"}</td>
                      <td className="hep-td hep-td--num">{row.draws ?? "–"}</td>
                      <td className="hep-td hep-td--num">{row.losses ?? "–"}</td>
                      <td className="hep-td hep-td--num">{row.goals_for ?? "–"}</td>
                      <td className="hep-td hep-td--num">{row.goals_against ?? "–"}</td>
                      <td className="hep-td hep-td--num hep-td--gd">{gd(row.goals_for, row.goals_against)}</td>
                      <td className="hep-td hep-td--pts">{row.points ?? "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Eliminatorias */}
      {rounds.length > 0 && (
        <section className="hep-detail-section">
          <div className="hep-section-header">
            <span className="hep-section-label"><Zap size={10} /> Partidos Decisivos</span>
          </div>
          <div className="hep-ko-list">
            {rounds.map((round) => (
              <div key={round} className="hep-ko-round-block">
                <div className="hep-ko-round-label">{round}</div>
                {byRound[round].map((m, i) => {
                  const winA = m.winner === "team_a";
                  const winB = m.winner === "team_b";
                  return (
                    <div key={i} className={`hep-ko-match ${m.is_decisive ? "hep-ko-match--decisive" : ""}`}>
                      <span className={`hep-ko-team ${winA ? "hep-ko-team--win" : ""}`}>{m.team_a}</span>
                      <span className="hep-ko-score">
                        {m.score_a ?? "–"} – {m.score_b ?? "–"}
                      </span>
                      <span className={`hep-ko-team hep-ko-team--right ${winB ? "hep-ko-team--win" : ""}`}>{m.team_b}</span>
                      {m.is_decisive && <span className="hep-ko-decisive-chip">Decisivo</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SquadRow({ player, highlight }) {
  return (
    <div className={`hep-squad-row ${highlight ? "hep-squad-row--key" : ""}`}>
      {highlight && <Star size={11} className="hep-squad-star" />}
      {player.shirt_number && (
        <span className="hep-squad-num">{player.shirt_number}</span>
      )}
      <span className="hep-squad-name">{player.player_name}</span>
      {player.position_role && (
        <span className="hep-squad-role">
          {POSITION_ROLE_LABEL[player.position_role] || player.position_role}
        </span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VISTA DETALLE (router entre tipos)
// ══════════════════════════════════════════════════════════════════════════════
function EventDetail({ eventId, onBack }) {
  const { event, lineups, squad, standings, knockout, loading, error, reload } =
    useHistoricalEventDetail(eventId);

  if (loading) return (
    <div className="hep-state hep-state--loading">
      <RefreshCw size={16} className="hep-spin" /><span>Cargando evento...</span>
    </div>
  );

  if (error || !event) return (
    <div className="hep-state hep-state--error">
      <AlertCircle size={18} /><p>{error || "No encontrado"}</p>
      <button className="hep-retry-btn" onClick={reload}><RefreshCw size={11} /> Reintentar</button>
    </div>
  );

  const bannerUrl = getHistoricalImageUrl(event.banner_image_path);
  const imageUrl = getHistoricalImageUrl(event.image_path);
  const heroUrl = bannerUrl || imageUrl;
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;
  const catColor = CAT_COLOR[event.event_category] || "var(--accent)";

  return (
    <div className="hep-detail">
      <button className="hep-back-section-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Momentos
      </button>
      {/* ── HERO BANNER ── */}
      <div className="hep-hero" style={{ "--cat-c": catColor }}>
        <div className="hep-hero-img-wrap">
          {heroUrl
            ? <img src={heroUrl} alt={event.title} className="hep-hero-img" />
            : <div className="hep-hero-img-ph"><Zap size={42} strokeWidth={1} /></div>
          }
          <div className="hep-hero-gradient" />
        </div>
        <div className="hep-hero-content">
          <div className="hep-hero-badges">
            {event.event_category && (
              <span className="hep-hero-badge" style={{ "--bc": catColor }}>
                {CAT_ICON[event.event_category]} {CAT_LABEL[event.event_category]}
              </span>
            )}
            {event.event_type && (
              <span className="hep-hero-badge hep-hero-badge--type">
                {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
              </span>
            )}
          </div>
          <h1 className="hep-hero-title">{event.title}</h1>
          {(year || event.event_date) && (
            <div className="hep-hero-date">
              <Calendar size={12} />
              <span>{event.event_date
                ? new Date(event.event_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                : year}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── CUERPO NARRATIVO ── */}
      <ContextSection text={event.context_text || event.description} />

      {event.event_category === "player"
        ? <PlayerEventDetail event={event} lineups={lineups} />
        : event.event_category === "team"
          ? <TeamEventDetail event={event} squad={squad} standings={standings} knockout={knockout} />
          : null
      }

      <ImpactSection text={event.impact_text} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoricalEventsPage({ selectedEvent, onEventSelect, onBack }) {
  const {
    events, allEvents, loading, error, reload,
    search, setSearch,
    filterCategory, setFilterCategory,
    filterType, setFilterType,
    types,
  } = useHistoricalEvents();

  const [showFilters, setShowFilters] = useState(false);
  const selectedId = selectedEvent?.id;

  const hasFilters = filterCategory || filterType;

  if (selectedId) {
    return (
      <div className="hep-root hep-root--detail">
        <EventDetail
          eventId={selectedId}
          onBack={() => onEventSelect(null)}
        />
      </div>
    );
  }

  return (
    <div className="hep-root">

      {/* Header mobile */}
      <div className="hep-mobile-header-wrap">
        <SectionHeaderMobile
          section="events"
          items={allEvents}
          onRandomSelect={(ev) => onEventSelect && onEventSelect(ev)}
          onBack={onBack}
        />
      </div>

      {/* Header desktop */}
      <header className="hep-header hep-header--desktop">
        <div className="hep-header-left">
          <div className="hep-header-icon"><Zap size={22} strokeWidth={1.5} /></div>
          <div>
            <h1 className="hep-header-title">MOMENTOS HISTÓRICOS</h1>
            <p className="hep-header-sub">Eventos que definieron el fútbol</p>
          </div>
        </div>
        <div className="hep-search-wrap">
          <div className="hep-search">
            <Search size={13} className="hep-search-ico" />
            <input
              className="hep-search-input"
              placeholder="Buscar evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="hep-search-clear" onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>
          <button
            className={`hep-filter-btn ${showFilters ? "hep-filter-btn--active" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter size={12} />
            {hasFilters && <span className="hep-filter-dot" />}
          </button>
          <button className="hep-back-btn-vault" onClick={onBack}>
            <ArrowLeft size={12} />
          </button>
        </div>
      </header>

      {/* Filtros */}
      {showFilters && (
        <div className="hep-filters-panel">
          <div className="hep-filters-row">
            <div className="hep-filter-group">
              <label className="hep-filter-label">Categoría</label>
              <select className="hep-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">Todas</option>
                <option value="player">Jugador</option>
                <option value="team">Equipo</option>
              </select>
            </div>
            <div className="hep-filter-group">
              <label className="hep-filter-label">Tipo</label>
              <select className="hep-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Todos</option>
                {types.map((t) => <option key={t} value={t}>{EVENT_TYPE_LABEL[t] || t}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button className="hep-clear-filters" onClick={() => { setFilterCategory(""); setFilterType(""); }}>
                <X size={11} /> Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barra resultados */}
      <div className="hep-results-bar">
        <span className="hep-results-count">
          {events.length} momento{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Estados */}
      {loading && (
        <div className="hep-state hep-state--loading">
          <RefreshCw size={15} className="hep-spin" /><span>Cargando eventos...</span>
        </div>
      )}
      {!loading && error && (
        <div className="hep-state hep-state--error">
          <AlertCircle size={18} /><p>{error}</p>
          <button className="hep-retry-btn" onClick={reload}><RefreshCw size={11} /> Reintentar</button>
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="hep-state hep-state--empty">
          <Zap size={32} strokeWidth={1} />
          <p className="hep-empty-title">Sin eventos</p>
          <p className="hep-empty-sub">
            {search || hasFilters ? "Prueba con otros filtros." : "Aún no hay momentos históricos publicados."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && events.length > 0 && (
        <div className="hep-grid">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={(e) => onEventSelect && onEventSelect(e)} />
          ))}
        </div>
      )}
    </div>
  );
}
