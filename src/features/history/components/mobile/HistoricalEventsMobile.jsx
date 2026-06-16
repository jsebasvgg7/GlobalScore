import { useState, useMemo, useEffect, useRef } from "react";
import {
  Zap, Search, X, RefreshCw, AlertCircle,
  Users2, Shield, Trophy, ChevronRight,
  Calendar, Star, Globe, Filter, ArrowLeft, Shuffle,
  BarChart2, LayoutGrid, Swords, TrendingUp, Target,
  Clock, Crown, Flame, Award, User,
} from "lucide-react";
import {
  useHistoricalEvents,
  useHistoricalEventDetail,
  getHistoricalImageUrl,
} from "../../hooks/useHistoricalEvents";
import "../../styles/mobile/HistoricalEventsMobile.css";
import "../../styles/mobile/HistoricalEventsMobile.dark.css";

// ════════════════════════════════════════════════════════════
//  DICCIONARIOS
// ════════════════════════════════════════════════════════════

const EVENT_TYPE_LABEL = {
  Championship: "Campeonato",
  "Historic Match": "Partido Histórico",
  "Legendary Performance": "Actuación Legendaria",
  "Era Defining": "Definió una Era",
  Record: "Récord",
};

const CAT_LABEL = { player: "Jugador", team: "Equipo" };
const CAT_COLOR = { player: "#8b5cf6", team: "#3b82f6" };

const POSITION_ROLE_LABEL = {
  GK: "POR", CB: "DFC", LB: "LI", RB: "LD",
  CDM: "MCD", CM: "MC", CAM: "MCO",
  LM: "MI", RM: "MD", LW: "EI", RW: "ED",
  ST: "DC", SS: "SD",
};

const KNOCKOUT_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

const MOMENT_ICON_MAP = {
  goal: "⚽", assist: "🅰️", card_yellow: "🟨", card_red: "🟥",
  substitution: "🔄", save: "🧤", miss: "❌", penalty: "🎯",
  crown: "👑", trophy: "🏆", star: "⭐", fire: "🔥",
  default: "⚡",
};

const gd = (f, c) => {
  const d = (f || 0) - (c || 0);
  return d > 0 ? `+${d}` : `${d}`;
};

// ════════════════════════════════════════════════════════════
//  TABS POR CATEGORÍA
// ════════════════════════════════════════════════════════════

// Tabs para eventos de JUGADOR
const PLAYER_TABS = [
  { key: "info", label: "INFO", Icon: BarChart2 },
  { key: "duelo", label: "DUELO", Icon: Swords },
  { key: "plantel", label: "JUG", Icon: Users2 },
  { key: "momentos", label: "MOMENTOS", Icon: TrendingUp },
  { key: "protas", label: "PROTAS", Icon: Target },
];

// Tabs para eventos de EQUIPO
const TEAM_TABS = [
  { key: "info", label: "INFO", Icon: BarChart2 },
  { key: "plantel", label: "PLANTEL", Icon: Users2 },
  { key: "campana", label: "CAMPAÑA", Icon: Trophy },
  { key: "momentos", label: "MOMENTOS", Icon: TrendingUp },
  { key: "protas", label: "PROTAS", Icon: Target },
];

// ════════════════════════════════════════════════════════════
//  MICRO-HELPERS
// ════════════════════════════════════════════════════════════

function DotGrid({ cols = 5, rows = 4 }) {
  return (
    <svg className="hem-dot-grid" width={cols * 14} height={rows * 14} aria-hidden="true">
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle key={`${r}-${c}`} cx={c * 14 + 7} cy={r * 14 + 7} r={1.5} />
        ))
      )}
    </svg>
  );
}

function CategoryBadge({ category, type }) {
  const catColor = CAT_COLOR[category] || "var(--hem-accent)";
  return (
    <div className="hem-badges-row">
      {category && (
        <span className="hem-badge" style={{ "--bc": catColor }}>
          {CAT_LABEL[category]}
        </span>
      )}
      {type && (
        <span className="hem-badge hem-badge--type">
          {EVENT_TYPE_LABEL[type] || type}
        </span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  EVENT CARD — listado principal
// ════════════════════════════════════════════════════════════

function EventCard({ event, onClick }) {
  const bannerUrl = getHistoricalImageUrl(event.banner_image_path);
  const imageUrl = getHistoricalImageUrl(event.image_path);
  const protagonist = event.event_category === "player"
    ? event.historical_players
    : event.historical_teams;
  const catColor = CAT_COLOR[event.event_category] || "var(--hem-accent)";
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;

  return (
    <button className="hem-card" onClick={() => onClick(event)}>
      {/* Banner imagen */}
      <div className="hem-card-banner">
        {bannerUrl
          ? <img src={bannerUrl} alt={event.title} className="hem-card-banner-img" />
          : imageUrl
            ? <img src={imageUrl} alt={event.title} className="hem-card-banner-img hem-card-banner-img--fallback" />
            : <div className="hem-card-banner-ph"><Zap size={28} strokeWidth={1} /></div>
        }
        <div className="hem-card-banner-overlay" />
        {/* Año prominente */}
        {year && (
          <div className="hem-card-year-wrap">
            <span className="hem-card-year">{year}</span>
            {event.event_type && (
              <span className="hem-card-type-label">
                {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
              </span>
            )}
          </div>
        )}
        {/* Badge categoría */}
        {event.event_category && (
          <span className="hem-card-cat-badge" style={{ "--bc": catColor }}>
            {CAT_LABEL[event.event_category].toUpperCase()}
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="hem-card-body">
        <h3 className="hem-card-title">{event.title}</h3>

        {/* Protagonista */}
        {protagonist && (
          <div className="hem-card-protagonist">
            <div className="hem-card-proto-av">
              {getHistoricalImageUrl(protagonist.image_path)
                ? <img src={getHistoricalImageUrl(protagonist.image_path)} alt={protagonist.name} />
                : <span>{protagonist.name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <div className="hem-card-proto-info">
              <span className="hem-card-proto-name">{protagonist.name}</span>
              {protagonist.country && (
                <span className="hem-card-proto-country">{protagonist.country}</span>
              )}
            </div>
            <ChevronRight size={14} className="hem-card-chevron" />
          </div>
        )}
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════
//  TABS COMPARTIDOS: MOMENTOS
// ════════════════════════════════════════════════════════════

function TabMomentos({ moments }) {
  if (!moments || moments.length === 0) {
    return (
      <div className="hem-empty-tab">
        <Zap size={28} strokeWidth={1} />
        <p>Sin momentos registrados</p>
      </div>
    );
  }

  return (
    <div className="hem-tab-scroll">
      <div className="hem-tab-header">
        <div className="hem-tab-icon-box"><TrendingUp size={16} /></div>
        <div>
          <p className="hem-tab-title">MOMENTOS</p>
          <p className="hem-tab-sub">{moments.length} momento{moments.length !== 1 ? "s" : ""} clave</p>
        </div>
      </div>

      <div className="hem-moments-timeline">
        {moments.map((m, i) => {
          const icon = m.icon ? (MOMENT_ICON_MAP[m.icon] || m.icon) : MOMENT_ICON_MAP.default;
          const isLast = i === moments.length - 1;
          return (
            <div key={m.id || i} className="hem-moment-row">
              {/* Columna izquierda — minuto + línea */}
              <div className="hem-moment-left">
                <div className="hem-moment-min">
                  {m.minute !== null && m.minute !== undefined
                    ? <><span className="hem-moment-min-num">{m.minute}</span><span className="hem-moment-min-ap">'</span></>
                    : <span className="hem-moment-min-num">—</span>
                  }
                </div>
                {!isLast && <span className="hem-moment-line" />}
              </div>
              {/* Icono */}
              <div className="hem-moment-icon-wrap">
                <span className="hem-moment-icon">{icon}</span>
              </div>
              {/* Contenido */}
              <div className="hem-moment-card">
                <p className="hem-moment-title">{m.title}</p>
                {m.description && (
                  <p className="hem-moment-desc">{m.description}</p>
                )}
                {m.moment_date && (
                  <p className="hem-moment-date">
                    <Calendar size={9} />
                    {new Date(m.moment_date + "T12:00:00").toLocaleDateString("es-ES", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TABS COMPARTIDOS: PROTAGONISTAS
// ════════════════════════════════════════════════════════════

function TabProtagonistas({ protagonists }) {
  if (!protagonists || protagonists.length === 0) {
    return (
      <div className="hem-empty-tab">
        <Users2 size={28} strokeWidth={1} />
        <p>Sin protagonistas registrados</p>
      </div>
    );
  }

  return (
    <div className="hem-tab-scroll">
      <div className="hem-tab-header">
        <div className="hem-tab-icon-box"><Target size={16} /></div>
        <div>
          <p className="hem-tab-title">PROTAGONISTAS</p>
          <p className="hem-tab-sub">{protagonists.length} protagonista{protagonists.length !== 1 ? "s" : ""} del evento</p>
        </div>
      </div>

      <div className="hem-protas-list">
        {protagonists.map((p, i) => {
          const isPlayer = !!p.historical_players;
          const entity = isPlayer ? p.historical_players : p.historical_teams;
          const img = entity ? getHistoricalImageUrl(entity.image_path) : null;
          const displayName = p.name_override || entity?.name || "—";
          const icon = p.icon ? (MOMENT_ICON_MAP[p.icon] || p.icon) : null;

          return (
            <div key={p.id || i} className="hem-prota-card">
              {/* Avatar */}
              <div className="hem-prota-avatar">
                {img
                  ? <img src={img} alt={displayName} />
                  : <span>{displayName.slice(0, 2).toUpperCase()}</span>
                }
              </div>
              {/* Info */}
              <div className="hem-prota-info">
                <p className="hem-prota-name">{displayName.toUpperCase()}</p>
                {entity?.country && (
                  <p className="hem-prota-country">
                    {isPlayer
                      ? entity.position
                        ? `${entity.position} · ${entity.country}`
                        : entity.country
                      : entity.country
                    }
                  </p>
                )}
                {p.role_label && (
                  <span className="hem-prota-role">{p.role_label.toUpperCase()}</span>
                )}
              </div>
              {icon && <span className="hem-prota-icon">{icon}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TAB INFO — compartido (contexto + impacto + hero data)
// ════════════════════════════════════════════════════════════

function TabInfo({ event }) {
  const year = event.event_date
    ? new Date(event.event_date + "T12:00:00").toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric"
    })
    : null;

  return (
    <div className="hem-tab-scroll">
      {/* Hero mini */}
      <div className="hem-info-hero">
        <DotGrid cols={5} rows={3} />
        <div className="hem-info-hero-inner">
          <CategoryBadge category={event.event_category} type={event.event_type} />
          <h2 className="hem-info-title">{event.title}</h2>
          {year && (
            <p className="hem-info-date"><Calendar size={10} />{year}</p>
          )}
        </div>
      </div>

      {/* Contexto */}
      {(event.context_text || event.description) && (
        <div className="hem-info-section">
          <div className="hem-info-section-label">
            <span className="hem-info-bar" />
            <span>CONTEXTO</span>
          </div>
          <div className="hem-info-text">
            {(event.context_text || event.description).split("\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      {/* Impacto */}
      {event.impact_text && (
        <div className="hem-info-section hem-info-section--impact">
          <div className="hem-info-section-label">
            <span className="hem-info-bar hem-info-bar--impact" />
            <span>IMPACTO Y LEGADO</span>
          </div>
          <div className="hem-info-text hem-info-text--impact">
            {event.impact_text.split("\n").filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TABS PARA EVENTO TIPO JUGADOR
// ════════════════════════════════════════════════════════════

// DUELO — alineaciones enfrentadas (referencia: Lamine Yamal img3)
function TabDuelo({ event, lineups }) {
  const teamAName = event.team_a_name || lineups.team_a[0]?.team_name || "Equipo A";
  const teamBName = event.team_b_name || lineups.team_b[0]?.team_name || "Equipo B";
  const hasScore = event.score_a !== "" && event.score_a != null
    && event.score_b !== "" && event.score_b != null;
  const hasLineups = lineups.team_a.length > 0 || lineups.team_b.length > 0;

  if (!hasScore && !hasLineups) {
    return (
      <div className="hem-empty-tab">
        <Swords size={28} strokeWidth={1} />
        <p>Sin datos del enfrentamiento</p>
      </div>
    );
  }

  return (
    <div className="hem-tab-scroll">
      <div className="hem-tab-header">
        <div className="hem-tab-icon-box"><Swords size={16} /></div>
        <div>
          <p className="hem-tab-title">DUELO</p>
          <p className="hem-tab-sub">Jugadores del enfrentamiento</p>
        </div>
      </div>

      {/* Marcador */}
      {hasScore && (
        <div className="hem-score-board">
          <div className="hem-score-team hem-score-team--left">
            <span className="hem-score-team-name">{teamAName}</span>
          </div>
          <div className="hem-score-center">
            <span className="hem-score-num">{event.score_a}</span>
            <span className="hem-score-sep">–</span>
            <span className="hem-score-num">{event.score_b}</span>
          </div>
          <div className="hem-score-team hem-score-team--right">
            <span className="hem-score-team-name">{teamBName}</span>
          </div>
        </div>
      )}

      {/* Alineaciones lado a lado */}
      {hasLineups && (
        <div className="hem-duelo-section">
          <div className="hem-duelo-header-row">
            <span className="hem-duelo-team-label">{teamAName}</span>
            <span className="hem-duelo-vs">VS</span>
            <span className="hem-duelo-team-label hem-duelo-team-label--right">{teamBName}</span>
          </div>
          <div className="hem-duelo-grid">
            {/* Columna A */}
            <div className="hem-duelo-col">
              {lineups.team_a.map((p, i) => (
                <div key={p.id || i} className={`hem-duelo-player ${p.is_protagonist ? "hem-duelo-player--proto" : ""}`}>
                  {p.is_protagonist && <Star size={8} className="hem-duelo-star" />}
                  <span className="hem-duelo-num">{p.shirt_number || (i + 1)}</span>
                  <span className="hem-duelo-name">{p.player_name}</span>
                  {p.position_role && (
                    <span className="hem-duelo-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Divisor */}
            <div className="hem-duelo-divider" />
            {/* Columna B */}
            <div className="hem-duelo-col hem-duelo-col--right">
              {lineups.team_b.map((p, i) => (
                <div key={p.id || i} className={`hem-duelo-player hem-duelo-player--r ${p.is_protagonist ? "hem-duelo-player--proto" : ""}`}>
                  {p.position_role && (
                    <span className="hem-duelo-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
                  )}
                  <span className="hem-duelo-name">{p.player_name}</span>
                  <span className="hem-duelo-num">{p.shirt_number || (i + 1)}</span>
                  {p.is_protagonist && <Star size={8} className="hem-duelo-star" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PLANTEL (para evento jugador) — el plantel del equipo del protagonista
function TabPlantelJugador({ event, squad }) {
  const protagonist = event.historical_players;
  const protoImg = getHistoricalImageUrl(protagonist?.image_path);

  return (
    <div className="hem-tab-scroll">
      <div className="hem-tab-header">
        <div className="hem-tab-icon-box"><Users2 size={16} /></div>
        <div>
          <p className="hem-tab-title">PLANTEL</p>
          <p className="hem-tab-sub">Equipo protagonista</p>
        </div>
      </div>

      {/* Protagonista del evento */}
      {protagonist && (
        <div className="hem-plantel-proto">
          <div className="hem-plantel-proto-av">
            {protoImg
              ? <img src={protoImg} alt={protagonist.name} />
              : <span>{protagonist.name?.slice(0, 2).toUpperCase()}</span>
            }
          </div>
          <div className="hem-plantel-proto-info">
            <p className="hem-plantel-proto-name">{protagonist.name}</p>
            <div className="hem-plantel-proto-meta">
              {protagonist.country && <span>{protagonist.country}</span>}
              {protagonist.position && <><span className="hem-meta-sep">·</span><span>{protagonist.position}</span></>}
            </div>
            {protagonist.impact_summary && (
              <p className="hem-plantel-proto-quote">
                "{protagonist.impact_summary.slice(0, 120)}{protagonist.impact_summary.length > 120 ? "…" : ""}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Plantel */}
      {squad.length > 0 && (
        <div className="hem-squad-section">
          <div className="hem-squad-section-label">
            <Shield size={10} /> EQUIPO
          </div>
          {squad.map((p, i) => (
            <div key={p.id || i} className={`hem-squad-row ${p.is_key_player ? "hem-squad-row--key" : ""}`}>
              {p.is_key_player && <Star size={9} className="hem-squad-star" />}
              {p.shirt_number && <span className="hem-squad-num">{p.shirt_number}</span>}
              <span className="hem-squad-name">{p.player_name}</span>
              {p.position_role && (
                <span className="hem-squad-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {squad.length === 0 && !protagonist && (
        <div className="hem-empty-tab">
          <Users2 size={28} strokeWidth={1} />
          <p>Sin datos del plantel</p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TABS PARA EVENTO TIPO EQUIPO
// ════════════════════════════════════════════════════════════

// PLANTEL (para evento equipo) — squad con jugadores clave
function TabPlantelEquipo({ event, squad }) {
  const teamProtag = event.historical_teams;
  const teamImg = getHistoricalImageUrl(teamProtag?.image_path);
  const keyPlayers = squad.filter((p) => p.is_key_player);
  const restPlayers = squad.filter((p) => !p.is_key_player);

  return (
    <div className="hem-tab-scroll">
      <div className="hem-tab-header">
        <div className="hem-tab-icon-box"><Users2 size={16} /></div>
        <div>
          <p className="hem-tab-title">PLANTEL</p>
          <p className="hem-tab-sub">Equipo protagonista</p>
        </div>
      </div>

      {/* Equipo protagonista */}
      {teamProtag && (
        <div className="hem-team-hero-card">
          <div className="hem-team-hero-shield" style={{ borderColor: teamProtag.primary_color || "var(--hem-accent)" }}>
            {teamImg
              ? <img src={teamImg} alt={teamProtag.name} />
              : <Shield size={22} strokeWidth={1} />
            }
          </div>
          <div className="hem-team-hero-info">
            <p className="hem-team-hero-name">{teamProtag.name?.toUpperCase()}</p>
            <div className="hem-team-hero-meta">
              {teamProtag.country && <span>{teamProtag.country}</span>}
              {teamProtag.manager && <><span className="hem-meta-sep">·</span><span>DT: {teamProtag.manager}</span></>}
            </div>
            {teamProtag.formation && (
              <span className="hem-team-formation">{teamProtag.formation}</span>
            )}
          </div>
        </div>
      )}

      {/* Jugadores clave */}
      {keyPlayers.length > 0 && (
        <div className="hem-squad-section">
          <div className="hem-squad-section-label">
            <Star size={10} /> JUGADORES CLAVE
          </div>
          {keyPlayers.map((p, i) => (
            <div key={p.id || i} className="hem-squad-row hem-squad-row--key">
              <Star size={9} className="hem-squad-star" />
              {p.shirt_number && <span className="hem-squad-num">{p.shirt_number}</span>}
              <span className="hem-squad-name">{p.player_name}</span>
              {p.position_role && (
                <span className="hem-squad-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resto plantel */}
      {restPlayers.length > 0 && (
        <div className="hem-squad-section">
          <div className="hem-squad-section-label">
            <Users2 size={10} /> RESTO DEL PLANTEL
          </div>
          {restPlayers.map((p, i) => (
            <div key={p.id || i} className="hem-squad-row">
              {p.shirt_number && <span className="hem-squad-num">{p.shirt_number}</span>}
              <span className="hem-squad-name">{p.player_name}</span>
              {p.position_role && (
                <span className="hem-squad-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {squad.length === 0 && !teamProtag && (
        <div className="hem-empty-tab"><Users2 size={28} strokeWidth={1} /><p>Sin datos del plantel</p></div>
      )}
    </div>
  );
}

// CAMPAÑA — standings + knockout
function TabCampana({ standings, knockout }) {
  const byRound = useMemo(() => knockout.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {}), [knockout]);
  const rounds = KNOCKOUT_ORDER.filter((r) => byRound[r]);

  const hasData = standings.length > 0 || rounds.length > 0;

  if (!hasData) {
    return (
      <div className="hem-empty-tab">
        <Trophy size={28} strokeWidth={1} />
        <p>Sin datos de campaña</p>
      </div>
    );
  }

  return (
    <div className="hem-tab-scroll">
      <div className="hem-tab-header">
        <div className="hem-tab-icon-box"><Trophy size={16} /></div>
        <div>
          <p className="hem-tab-title">LA CAMPAÑA</p>
          <p className="hem-tab-sub">Recorrido del equipo protagonista</p>
        </div>
      </div>

      {/* Tabla de posiciones */}
      {standings.length > 0 && (
        <div className="hem-campana-section">
          <div className="hem-campana-section-label">
            <LayoutGrid size={10} /> TABLA DE POSICIONES
          </div>
          <div className="hem-table-wrap">
            <table className="hem-table">
              <thead>
                <tr>
                  <th className="hem-th hem-th--pos">#</th>
                  <th className="hem-th hem-th--team">Equipo</th>
                  <th className="hem-th hem-th--num">PJ</th>
                  <th className="hem-th hem-th--num">G</th>
                  <th className="hem-th hem-th--num">E</th>
                  <th className="hem-th hem-th--num">P</th>
                  <th className="hem-th hem-th--num">GF</th>
                  <th className="hem-th hem-th--num">GC</th>
                  <th className="hem-th hem-th--num">DG</th>
                  <th className="hem-th hem-th--pts">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const pj = (row.wins || 0) + (row.draws || 0) + (row.losses || 0);
                  return (
                    <tr key={row.id || i} className={`hem-tr ${row.is_champion ? "hem-tr--champion" : ""}`}>
                      <td className="hem-td hem-td--pos">
                        {row.is_champion
                          ? <Trophy size={9} className="hem-champion-icon" />
                          : <span className="hem-pos-num">{row.position}</span>
                        }
                      </td>
                      <td className="hem-td hem-td--team">
                        {row.team_name}
                        {row.is_champion && <span className="hem-champion-tag">★</span>}
                      </td>
                      <td className="hem-td hem-td--num">{pj || "–"}</td>
                      <td className="hem-td hem-td--num">{row.wins ?? "–"}</td>
                      <td className="hem-td hem-td--num">{row.draws ?? "–"}</td>
                      <td className="hem-td hem-td--num">{row.losses ?? "–"}</td>
                      <td className="hem-td hem-td--num">{row.goals_for ?? "–"}</td>
                      <td className="hem-td hem-td--num">{row.goals_against ?? "–"}</td>
                      <td className="hem-td hem-td--num hem-td--gd">{gd(row.goals_for, row.goals_against)}</td>
                      <td className="hem-td hem-td--pts">{row.points ?? "–"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Partidos decisivos */}
      {rounds.length > 0 && (
        <div className="hem-campana-section">
          <div className="hem-campana-section-label">
            <Zap size={10} /> PARTIDOS DECISIVOS
          </div>
          <div className="hem-ko-list">
            {rounds.map((round) => (
              <div key={round} className="hem-ko-round-block">
                <div className="hem-ko-round-label">{round}</div>
                {byRound[round].map((m, i) => {
                  const winA = m.winner === "team_a";
                  const winB = m.winner === "team_b";
                  return (
                    <div key={i} className={`hem-ko-match ${m.is_decisive ? "hem-ko-match--decisive" : ""}`}>
                      <span className={`hem-ko-team ${winA ? "hem-ko-team--win" : ""}`}>{m.team_a}</span>
                      <span className="hem-ko-score">{m.score_a ?? "–"} – {m.score_b ?? "–"}</span>
                      <span className={`hem-ko-team hem-ko-team--right ${winB ? "hem-ko-team--win" : ""}`}>{m.team_b}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  EVENT DETAIL — con bottom nav propio
// ════════════════════════════════════════════════════════════

function EventDetail({ eventId, onBack }) {
  const { event, lineups, squad, standings, knockout, moments, protagonists, loading, error, reload } =
    useHistoricalEventDetail(eventId);

  const isPlayer = event?.event_category === "player";
  const isTeam = event?.event_category === "team";
  const TABS = isPlayer ? PLAYER_TABS : TEAM_TABS;

  const [tab, setTab] = useState(TABS[0].key);

  // Reset tab cuando cambia el evento
  useEffect(() => {
    if (event) setTab(TABS[0].key);
  }, [eventId]);

  // Ocultar bottom nav global
  useEffect(() => {
    document.body.classList.add("hem-hide-bottom-nav");
    return () => document.body.classList.remove("hem-hide-bottom-nav");
  }, []);

  if (loading) return (
    <div className="hem-detail-root">
      <div className="hem-state hem-state--loading">
        <RefreshCw size={15} className="hem-spin" /><span>Cargando evento...</span>
      </div>
    </div>
  );

  if (error || !event) return (
    <div className="hem-detail-root">
      <div className="hem-state hem-state--error">
        <AlertCircle size={16} /><p>{error || "No encontrado"}</p>
        <button className="hem-retry-btn" onClick={reload}><RefreshCw size={10} /> Reintentar</button>
      </div>
    </div>
  );

  const bannerUrl = getHistoricalImageUrl(event.banner_image_path);
  const imageUrl = getHistoricalImageUrl(event.image_path);
  const heroUrl = bannerUrl || imageUrl;
  const catColor = CAT_COLOR[event.event_category] || "var(--hem-accent)";
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;

  return (
    <div className="hem-detail-root">
      {/* Top bar */}
      <header className="hem-detail-topbar" style={{ "--cat-c": catColor }}>
        <button className="hem-detail-back" onClick={onBack}>
          <ArrowLeft size={14} />
        </button>
        <div className="hem-detail-topbar-info">
          {year && <span className="hem-detail-topbar-year" style={{ background: catColor }}>{year}</span>}
          <span className="hem-detail-topbar-title">{event.title}</span>
        </div>
        {event.event_category && (
          <span className="hem-detail-topbar-badge" style={{ "--bc": catColor }}>
            {CAT_LABEL[event.event_category]}
          </span>
        )}
      </header>

      {/* Hero banner */}
      <div className="hem-detail-hero" style={{ "--cat-c": catColor }}>
        <div className="hem-detail-hero-img-wrap">
          {heroUrl
            ? <img src={heroUrl} alt={event.title} className="hem-detail-hero-img" />
            : <div className="hem-detail-hero-ph"><Zap size={36} strokeWidth={1} /></div>
          }
          <div className="hem-detail-hero-gradient" />
        </div>
        <div className="hem-detail-hero-content">
          <CategoryBadge category={event.event_category} type={event.event_type} />
          <h1 className="hem-detail-hero-title">{event.title}</h1>
          {event.event_date && (
            <p className="hem-detail-hero-date">
              <Calendar size={10} />
              {new Date(event.event_date + "T12:00:00").toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="hem-detail-content">
        {/* TABS JUGADOR */}
        {isPlayer && tab === "info" && <TabInfo event={event} />}
        {isPlayer && tab === "duelo" && <TabDuelo event={event} lineups={lineups} />}
        {isPlayer && tab === "plantel" && <TabPlantelJugador event={event} squad={squad} />}
        {isPlayer && tab === "momentos" && <TabMomentos moments={moments} />}
        {isPlayer && tab === "protas" && <TabProtagonistas protagonists={protagonists} />}

        {/* TABS EQUIPO */}
        {isTeam && tab === "info" && <TabInfo event={event} />}
        {isTeam && tab === "plantel" && <TabPlantelEquipo event={event} squad={squad} />}
        {isTeam && tab === "campana" && <TabCampana standings={standings} knockout={knockout} />}
        {isTeam && tab === "momentos" && <TabMomentos moments={moments} />}
        {isTeam && tab === "protas" && <TabProtagonistas protagonists={protagonists} />}

        {/* Fallback si no hay categoría definida */}
        {!isPlayer && !isTeam && <TabInfo event={event} />}
      </div>

      {/* Bottom tab nav — fixed, igual que bottom nav nativo */}
      <nav className="hem-detail-tab-bar">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`hem-detail-tab-btn ${tab === key ? "hem-detail-tab-btn--active" : ""}`}
            onClick={() => setTab(key)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  RANDOM EVENT MODAL
// ════════════════════════════════════════════════════════════

function RandomEventModal({ events, onClose, onSelect }) {
  const [displayed, setDisplayed] = useState(null);
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const spinRef = useRef(null);
  const spinTimeout = useRef(null);

  const spin = () => {
    if (events.length === 0) return;
    const picked = events[Math.floor(Math.random() * events.length)];
    setWinner(picked);
    setSpinning(true);
    setRevealed(false);
    setDisplayed(null);
    let i = 0;
    clearInterval(spinRef.current);
    spinRef.current = setInterval(() => {
      setDisplayed(events[i % events.length]);
      i++;
      if (i >= 35) {
        clearInterval(spinRef.current);
        setDisplayed(picked);
        setSpinning(false);
        setRevealed(true);
      }
    }, 90);
  };

  useEffect(() => {
    spin();
    return () => {
      clearInterval(spinRef.current);
      clearTimeout(spinTimeout.current);
    };
  }, []);

  const year = displayed?.event_date ? new Date(displayed.event_date).getFullYear() : null;
  const imgUrl = displayed
    ? getHistoricalImageUrl(displayed.banner_image_path || displayed.image_path)
    : null;
  const catColor = displayed ? (CAT_COLOR[displayed.event_category] || "var(--hem-accent)") : "var(--hem-accent)";

  return (
    <div className="hem-modal-backdrop" onClick={onClose}>
      <div className="hem-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hem-modal-header">
          <Shuffle size={14} />
          <span className="hem-modal-header-title">MODO ALEATORIO</span>
          <button className="hem-modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Body */}
        <div className="hem-modal-body">
          {/* Slot display */}
          <div className={`hem-modal-slot ${revealed ? "hem-modal-slot--revealed" : ""}`}>
            {displayed ? (
              <>
                <div className="hem-modal-slot-img">
                  {imgUrl
                    ? <img src={imgUrl} alt={displayed.title} />
                    : <Zap size={20} strokeWidth={1} />
                  }
                </div>
                <div className="hem-modal-slot-info">
                  <span className="hem-modal-slot-title">{displayed.title}</span>
                  <div className="hem-modal-slot-meta-row">
                    {year && <span className="hem-modal-slot-year">{year}</span>}
                    {displayed.event_category && (
                      <span className="hem-modal-slot-badge" style={{ background: catColor }}>
                        {CAT_LABEL[displayed.event_category].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="hem-modal-slot-empty"><Zap size={28} strokeWidth={1} /></div>
            )}
          </div>

          {/* Status / actions */}
          {spinning && (
            <div className="hem-modal-searching">
              <span className="hem-modal-searching-dot" />
              BUSCANDO...
              <span className="hem-modal-searching-dot" />
            </div>
          )}

          {revealed && winner && (
            <>
              <button
                className="hem-modal-btn hem-modal-btn--primary"
                onClick={() => onSelect(winner)}
              >
                VER EVENTO →
              </button>
              <button
                className="hem-modal-btn hem-modal-btn--secondary"
                onClick={spin}
              >
                OTRO →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  LISTADO PRINCIPAL — HistoricalEventsMobile
// ════════════════════════════════════════════════════════════

export default function HistoricalEventsMobile({ onBack, initialSelectedEvent }) {
  const {
    events, allEvents, loading, error, reload,
    search, setSearch,
    filterCategory, setFilterCategory,
    filterType, setFilterType,
    types,
  } = useHistoricalEvents();

  const [selectedId, setSelectedId] = useState(initialSelectedEvent?.id || null);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const hasFilters = filterCategory || filterType;

  // Contar por categoría para el stats strip
  const countPlayers = allEvents.filter((e) => e.event_category === "player").length;
  const countTeams = allEvents.filter((e) => e.event_category === "team").length;

  useEffect(() => {
    setSelectedId(initialSelectedEvent?.id || null);
  }, [initialSelectedEvent]);

  const handleSpin = () => {
    if (allEvents.length === 0) return;
    setShowRandomModal(true);
  };

  // Vista detalle
  if (selectedId) {
    return <EventDetail eventId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="hem-root">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="hem-header">
        <DotGrid cols={6} rows={4} />
        <button className="hem-header-back" onClick={onBack}><ArrowLeft size={14} /></button>

        <div className="hem-header-inner">
          {/* Breadcrumb */}
          <div className="hem-breadcrumb">
            <button className="hem-breadcrumb-prev" onClick={onBack}>
              <ArrowLeft size={10} />
              HISTÓRICO
            </button>
            <span className="hem-breadcrumb-sep">›</span>
            <span className="hem-breadcrumb-cur">EVENTOS</span>
          </div>

          {/* Título */}
          <div className="hem-title-row">
            <div className="hem-title-bar" />
            <div>
              <h1 className="hem-title">EVENTOS</h1>
              <p className="hem-subtitle">Momentos históricos del fútbol.</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="hem-stats-strip">
            <div className="hem-stat-cell hem-stat-cell--accent">
              <div className="hem-stat-icon"><Zap size={14} /></div>
              <div className="hem-stat-info">
                <span className="hem-stat-num">{allEvents.length}</span>
                <span className="hem-stat-lbl">EVENTOS</span>
              </div>
            </div>
            <div className="hem-stat-cell hem-stat-cell--purple">
              <div className="hem-stat-icon"><User size={14} /></div>
              <div className="hem-stat-info">
                <span className="hem-stat-num">{countPlayers}</span>
                <span className="hem-stat-lbl">JUGADORES</span>
              </div>
            </div>
            <div className="hem-stat-cell hem-stat-cell--blue">
              <div className="hem-stat-icon"><Shield size={14} /></div>
              <div className="hem-stat-info">
                <span className="hem-stat-num">{countTeams}</span>
                <span className="hem-stat-lbl">EQUIPOS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── SEARCH + FILTROS ────────────────────────────────── */}
      <div className="hem-search-row">
        <div className="hem-search-wrap">
          <Search size={13} className="hem-search-ico" />
          <input
            className="hem-search-input"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="hem-search-clear" onClick={() => setSearch("")}><X size={11} /></button>
          )}
        </div>
        <button
          className="hem-icon-btn hem-icon-btn--dark"
          onClick={handleSpin}
          disabled={allEvents.length === 0}
          title="Evento aleatorio"
        >
          <Shuffle size={15} />
        </button>
      </div>

      {/* ── FILTROS DE CATEGORÍA ────────────────────────────── */}
      <div className="hem-cat-tabs">
        <button
          className={`hem-cat-tab ${!filterCategory ? "hem-cat-tab--active" : ""}`}
          onClick={() => setFilterCategory("")}
        >
          <LayoutGrid size={13} />
          <span>TODOS</span>
        </button>
        <button
          className={`hem-cat-tab ${filterCategory === "player" ? "hem-cat-tab--active" : ""}`}
          onClick={() => setFilterCategory(filterCategory === "player" ? "" : "player")}
        >
          <User size={13} />
          <span>JUGADORES</span>
        </button>
        <button
          className={`hem-cat-tab ${filterCategory === "team" ? "hem-cat-tab--active" : ""}`}
          onClick={() => setFilterCategory(filterCategory === "team" ? "" : "team")}
        >
          <Shield size={13} />
          <span>EQUIPOS</span>
        </button>
      </div>

      {/* Modal aleatorio */}
      {showRandomModal && (
        <RandomEventModal
          events={allEvents}
          onClose={() => setShowRandomModal(false)}
          onSelect={(ev) => {
            setShowRandomModal(false);
            setTimeout(() => setSelectedId(ev.id), 100);
          }}
        />
      )}

      {/* ── COUNTER ─────────────────────────────────────────── */}
      <div className="hem-counter-row">
        <div className="hem-counter-left">
          <span className="hem-counter-bar" />
          <span className="hem-counter-label">EVENTOS</span>
        </div>
        <span className="hem-counter-badge">{events.length} ENCONTRADOS</span>
      </div>

      {/* ── ESTADOS ─────────────────────────────────────────── */}
      {loading && (
        <div className="hem-state hem-state--loading">
          <RefreshCw size={14} className="hem-spin" /><span>Cargando...</span>
        </div>
      )}
      {!loading && error && (
        <div className="hem-state hem-state--error">
          <AlertCircle size={16} /><p>{error}</p>
          <button className="hem-retry-btn" onClick={reload}><RefreshCw size={10} /> Reintentar</button>
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="hem-state hem-state--empty">
          <Zap size={28} strokeWidth={1} />
          <p>Sin eventos</p>
          <span>{search || hasFilters ? "Prueba con otros filtros." : "Aún no hay datos."}</span>
        </div>
      )}

      {/* ── LISTA ───────────────────────────────────────────── */}
      {!loading && !error && events.length > 0 && (
        <div className="hem-list">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onClick={(e) => setSelectedId(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}