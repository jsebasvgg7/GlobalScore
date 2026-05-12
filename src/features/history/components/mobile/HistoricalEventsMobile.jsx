import { useState, useMemo, useEffect, useRef } from "react";
import {
  Zap, Search, X, RefreshCw, AlertCircle,
  Users2, Shield, Trophy, ChevronRight,
  Calendar, Star, Globe, Filter, ArrowLeft, Shuffle,
} from "lucide-react";
import {
  useHistoricalEvents,
  useHistoricalEventDetail,
  getHistoricalImageUrl,
} from "../../../../hooks/HooksHistory/useHistoricalEvents";
import "../../styles/StylesMobile/MobHistory/HistoricalEventsMobile.css";

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
  GK: "Portero", CB: "Defensa Central", LB: "Lateral Izq.",
  RB: "Lateral Der.", CDM: "Med. Def.", CM: "Centrocampista",
  CAM: "Med. Of.", LM: "Med. Izq.", RM: "Med. Der.",
  LW: "Ext. Izq.", RW: "Ext. Der.", ST: "Delantero", SS: "2º Del.",
};

const KNOCKOUT_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

const gd = (f, c) => { const d = (f || 0) - (c || 0); return d > 0 ? `+${d}` : `${d}`; };

function ContextSection({ text }) {
  if (!text) return null;
  return (
    <section className="hem-detail-section">
      <div className="hem-section-header">
        <span className="hem-section-label">Contexto</span>
      </div>
      <div className="hem-narrative-text">
        {text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

function ImpactSection({ text }) {
  if (!text) return null;
  return (
    <section className="hem-detail-section hem-detail-section--impact">
      <div className="hem-section-header">
        <span className="hem-section-label">Impacto y Legado</span>
      </div>
      <div className="hem-narrative-text hem-narrative-text--impact">
        {text.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

function LineupColumn({ players, teamName, right }) {
  return (
    <div className={`hem-lineup-col ${right ? "hem-lineup-col--right" : ""}`}>
      <div className="hem-lineup-team-name">{teamName}</div>
      <div className="hem-lineup-list">
        {players.map((p, i) => (
          <div key={p.id || i} className={`hem-lineup-row ${p.is_protagonist ? "hem-lineup-row--proto" : ""}`}>
            {p.is_protagonist && <Star size={9} className="hem-lineup-star" />}
            <span className="hem-lineup-num">{p.shirt_number || (i + 1)}</span>
            <span className="hem-lineup-name">{p.player_name}</span>
            {p.position_role && (
              <span className="hem-lineup-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerEventDetail({ event, lineups }) {
  const protagonist = event.historical_players;
  const protoImg = getHistoricalImageUrl(protagonist?.image_path);
  const teamAName = event.team_a_name || lineups.team_a[0]?.team_name || "Equipo A";
  const teamBName = event.team_b_name || lineups.team_b[0]?.team_name || "Equipo B";
  const hasScore = event.score_a !== "" && event.score_a != null
    && event.score_b !== "" && event.score_b != null;

  return (
    <>
      {protagonist && (
        <section className="hem-detail-section">
          <div className="hem-section-header">
            <span className="hem-section-label"><Users2 size={9} /> Protagonista</span>
          </div>
          <div className="hem-protagonist-card">
            <div className="hem-proto-img-wrap">
              {protoImg
                ? <img src={protoImg} alt={protagonist.name} />
                : <div className="hem-proto-img-ph">{protagonist.name?.slice(0, 2).toUpperCase()}</div>
              }
            </div>
            <div className="hem-proto-info">
              <h2 className="hem-proto-name">{protagonist.name}</h2>
              <div className="hem-proto-meta">
                {protagonist.country && <span>{protagonist.country}</span>}
                {protagonist.position && <><span className="hem-meta-sep">·</span><span>{protagonist.position}</span></>}
              </div>
              {protagonist.impact_summary && (
                <p className="hem-proto-impact">"{protagonist.impact_summary.slice(0, 140)}{protagonist.impact_summary.length > 140 ? "…" : ""}"</p>
              )}
            </div>
          </div>
        </section>
      )}

      {(lineups.team_a.length > 0 || lineups.team_b.length > 0) && (
        <section className="hem-detail-section">
          <div className="hem-section-header">
            <span className="hem-section-label"><Shield size={9} /> El Enfrentamiento</span>
          </div>
          {hasScore && (
            <div className="hem-match-score">
              <span className="hem-match-score-team">{teamAName}</span>
              <div className="hem-match-score-box">
                <span className="hem-match-score-num">{event.score_a}</span>
                <span className="hem-match-score-sep">–</span>
                <span className="hem-match-score-num">{event.score_b}</span>
              </div>
              <span className="hem-match-score-team">{teamBName}</span>
            </div>
          )}
          <div className="hem-duel-layout">
            <LineupColumn players={lineups.team_a} teamName={teamAName} />
            <LineupColumn players={lineups.team_b} teamName={teamBName} right />
          </div>
        </section>
      )}
    </>
  );
}

function SquadRow({ player, highlight }) {
  return (
    <div className={`hem-squad-row ${highlight ? "hem-squad-row--key" : ""}`}>
      {highlight && <Star size={10} className="hem-squad-star" />}
      {player.shirt_number && <span className="hem-squad-num">{player.shirt_number}</span>}
      <span className="hem-squad-name">{player.player_name}</span>
      {player.position_role && (
        <span className="hem-squad-role">{POSITION_ROLE_LABEL[player.position_role] || player.position_role}</span>
      )}
    </div>
  );
}

function TeamEventDetail({ event, squad, standings, knockout }) {
  const teamProtag = event.historical_teams;
  const teamImg = getHistoricalImageUrl(teamProtag?.image_path);
  const keyPlayers = squad.filter((p) => p.is_key_player);
  const restPlayers = squad.filter((p) => !p.is_key_player);

  const byRound = useMemo(() => knockout.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {}), [knockout]);
  const rounds = KNOCKOUT_ORDER.filter((r) => byRound[r]);

  return (
    <>
      {teamProtag && (
        <section className="hem-detail-section">
          <div className="hem-section-header">
            <span className="hem-section-label"><Shield size={9} /> El Equipo Legendario</span>
          </div>
          <div className="hem-team-proto-card">
            <div className="hem-team-proto-shield" style={{ borderColor: teamProtag.primary_color || "var(--accent)" }}>
              {teamImg
                ? <img src={teamImg} alt={teamProtag.name} />
                : <Shield size={24} strokeWidth={1} />
              }
            </div>
            <div className="hem-team-proto-info">
              <h2 className="hem-team-proto-name">{teamProtag.name}</h2>
              <div className="hem-team-proto-meta">
                {teamProtag.country && <span>{teamProtag.country}</span>}
                {teamProtag.manager && <><span className="hem-meta-sep">·</span><span>DT: {teamProtag.manager}</span></>}
                {teamProtag.formation && <><span className="hem-meta-sep">·</span><span className="hem-team-formation">{teamProtag.formation}</span></>}
              </div>
            </div>
          </div>
        </section>
      )}

      {squad.length > 0 && (
        <section className="hem-detail-section">
          <div className="hem-section-header">
            <span className="hem-section-label"><Users2 size={9} /> Plantel Estelar</span>
          </div>
          {keyPlayers.length > 0 && (
            <div className="hem-squad-key">
              <div className="hem-squad-sublabel">Jugadores Clave</div>
              {keyPlayers.map((p, i) => <SquadRow key={p.id || i} player={p} highlight />)}
            </div>
          )}
          {restPlayers.length > 0 && (
            <div className="hem-squad-rest">
              {keyPlayers.length > 0 && <div className="hem-squad-sublabel">Resto del Plantel</div>}
              {restPlayers.map((p, i) => <SquadRow key={p.id || i} player={p} />)}
            </div>
          )}
        </section>
      )}

      {standings.length > 0 && (
        <section className="hem-detail-section">
          <div className="hem-section-header">
            <span className="hem-section-label"><Trophy size={9} /> La Campaña Perfecta</span>
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
                          ? <Trophy size={10} className="hem-champion-icon" />
                          : <span className="hem-pos-num">{row.position}</span>
                        }
                      </td>
                      <td className="hem-td hem-td--team">
                        {row.team_name}
                        {row.is_champion && <span className="hem-champion-tag">Campeón</span>}
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
        </section>
      )}

      {rounds.length > 0 && (
        <section className="hem-detail-section">
          <div className="hem-section-header">
            <span className="hem-section-label"><Zap size={9} /> Partidos Decisivos</span>
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
                      {m.is_decisive && <span className="hem-ko-decisive-chip">Decisivo</span>}
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

function EventDetail({ eventId, onBack }) {
  const { event, lineups, squad, standings, knockout, loading, error, reload } =
    useHistoricalEventDetail(eventId);

  if (loading) return (
    <div className="hem-state hem-state--loading">
      <RefreshCw size={15} className="hem-spin" /><span>Cargando evento...</span>
    </div>
  );

  if (error || !event) return (
    <div className="hem-state hem-state--error">
      <AlertCircle size={16} /><p>{error || "No encontrado"}</p>
      <button className="hem-retry-btn" onClick={reload}><RefreshCw size={10} /> Reintentar</button>
    </div>
  );

  const bannerUrl = getHistoricalImageUrl(event.banner_image_path);
  const imageUrl = getHistoricalImageUrl(event.image_path);
  const heroUrl = bannerUrl || imageUrl;
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;
  const catColor = CAT_COLOR[event.event_category] || "var(--accent)";

  return (
    <div className="hem-detail">
      <button className="hem-back-btn" onClick={onBack}>
        <ArrowLeft size={13} /><span>Momentos</span>
      </button>

      <div className="hem-hero" style={{ "--cat-c": catColor }}>
        <div className="hem-hero-img-wrap">
          {heroUrl
            ? <img src={heroUrl} alt={event.title} className="hem-hero-img" />
            : <div className="hem-hero-img-ph"><Zap size={38} strokeWidth={1} /></div>
          }
          <div className="hem-hero-gradient" />
        </div>
        <div className="hem-hero-content">
          <div className="hem-hero-badges">
            {event.event_category && (
              <span className="hem-hero-badge" style={{ "--bc": catColor }}>
                {CAT_LABEL[event.event_category]}
              </span>
            )}
            {event.event_type && (
              <span className="hem-hero-badge hem-hero-badge--type">
                {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
              </span>
            )}
          </div>
          <h1 className="hem-hero-title">{event.title}</h1>
          {(year || event.event_date) && (
            <div className="hem-hero-date">
              <Calendar size={11} />
              <span>
                {event.event_date
                  ? new Date(event.event_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                  : year}
              </span>
            </div>
          )}
        </div>
      </div>

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

function EventCard({ event, onClick }) {
  const bannerUrl = getHistoricalImageUrl(event.banner_image_path);
  const imageUrl = getHistoricalImageUrl(event.image_path);
  const protagonist = event.event_category === "player"
    ? event.historical_players
    : event.historical_teams;
  const catColor = CAT_COLOR[event.event_category] || "var(--accent)";
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;

  return (
    <button className="hem-card" onClick={() => onClick(event)}>
      <div className="hem-card-banner">
        {bannerUrl
          ? <img src={bannerUrl} alt={event.title} className="hem-card-banner-img" />
          : imageUrl
            ? <img src={imageUrl} alt={event.title} className="hem-card-banner-img hem-card-banner-img--fallback" />
            : <div className="hem-card-banner-ph"><Zap size={24} strokeWidth={1} /></div>
        }
        <div className="hem-card-banner-overlay" />
        <div className="hem-card-badges">
          {event.event_category && (
            <span className="hem-badge" style={{ "--bc": catColor }}>
              {CAT_LABEL[event.event_category]}
            </span>
          )}
          {event.event_type && (
            <span className="hem-badge hem-badge--type">
              {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
            </span>
          )}
        </div>
        {year && <span className="hem-card-year">{year}</span>}
      </div>

      <div className="hem-card-body">
        <h3 className="hem-card-title">{event.title}</h3>
        {event.description && (
          <p className="hem-card-desc">{event.description.slice(0, 80)}{event.description.length > 80 ? "…" : ""}</p>
        )}
        {protagonist && (
          <div className="hem-card-protagonist">
            <div className="hem-card-proto-av">
              {getHistoricalImageUrl(protagonist.image_path)
                ? <img src={getHistoricalImageUrl(protagonist.image_path)} alt={protagonist.name} />
                : <span>{protagonist.name?.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <span className="hem-card-proto-name">{protagonist.name}</span>
            <ChevronRight size={12} className="hem-card-chevron" />
          </div>
        )}
      </div>
    </button>
  );
}

export default function HistoricalEventsMobile({ onBack, initialSelectedEvent }) {
  const {
    events, allEvents, loading, error, reload,
    search, setSearch,
    filterCategory, setFilterCategory,
    filterType, setFilterType,
    types,
  } = useHistoricalEvents();

  const [selectedId, setSelectedId] = useState(initialSelectedEvent?.id || null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinItem, setSpinItem] = useState(null);
  const spinRef = useRef(null);
  const spinTimeout = useRef(null);
  const hasFilters = filterCategory || filterType;

  useEffect(() => {
    setSelectedId(initialSelectedEvent?.id || null);
  }, [initialSelectedEvent]);

  useEffect(() => () => {
    clearInterval(spinRef.current);
    clearTimeout(spinTimeout.current);
  }, []);

  const handleSpin = () => {
    if (spinning || allEvents.length === 0) return;
    const picked = allEvents[Math.floor(Math.random() * allEvents.length)];
    let i = 0;
    setSpinning(true);
    setSpinItem(allEvents[0]);
    spinRef.current = setInterval(() => {
      setSpinItem(allEvents[i % allEvents.length]);
      i++;
    }, 80);
    spinTimeout.current = setTimeout(() => {
      clearInterval(spinRef.current);
      setSpinItem(picked);
      setSpinning(false);
      setTimeout(() => setSelectedId(picked.id), 350);
    }, 2400);
  };

  const selectedEvent = selectedId
    ? allEvents.find(e => e.id === selectedId) || null
    : null;

  if (selectedId) {
    return (
      <div className="hem-root">
        <EventDetail eventId={selectedId} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="hem-root">
      <div className="hem-header">
        <div className="hem-header-bg" aria-hidden="true" />
        <button className="hem-header-back" onClick={onBack}>
          <ArrowLeft size={14} />
        </button>
        <div className="hem-header-inner">
          <div className="hem-eyebrow">
            <span className="hem-eyebrow-line" />
            <span className="hem-eyebrow-text">Archivo Histórico</span>
            <span className="hem-eyebrow-line" />
          </div>
          <h1 className="hem-title">
            <span className="hem-title-solid">MOM</span>
            <span className="hem-title-outline">ENTOS</span>
          </h1>
          <p className="hem-subtitle">{allEvents.length} momentos registrados</p>

          <div className="hem-spin-zone">
            {!spinning && !spinItem && (
              <button
                className={`hem-spin-btn ${allEvents.length === 0 ? "hem-spin-btn--off" : ""}`}
                onClick={handleSpin}
                disabled={allEvents.length === 0}
              >
                <Shuffle size={12} />
                <span>Momento aleatorio</span>
              </button>
            )}
            {(spinning || spinItem) && (
              <div className={`hem-slot-wrap ${spinning ? "hem-slot-wrap--spin" : "hem-slot-wrap--done"}`}>
                {spinItem && (
                  <div className="hem-slot-item">
                    <div className="hem-slot-banner">
                      {getHistoricalImageUrl(spinItem.banner_image_path || spinItem.image_path)
                        ? <img src={getHistoricalImageUrl(spinItem.banner_image_path || spinItem.image_path)} alt={spinItem.title} />
                        : <Zap size={14} />
                      }
                    </div>
                    <div className="hem-slot-info">
                      <span className="hem-slot-name">{spinItem.title}</span>
                      <span className="hem-slot-meta">
                        {CAT_LABEL[spinItem.event_category] || ""}
                        {spinItem.event_date ? ` · ${new Date(spinItem.event_date).getFullYear()}` : ""}
                      </span>
                    </div>
                    {!spinning && <ChevronRight size={14} className="hem-slot-chevron" />}
                  </div>
                )}
                {!spinning && (
                  <button className="hem-slot-clear" onClick={() => setSpinItem(null)}>
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hem-toolbar">
        <div className={`hem-search-box ${search ? "hem-search-box--active" : ""}`}>
          <Search size={13} className="hem-search-ico" />
          <input
            className="hem-search-input"
            placeholder="Buscar momento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="hem-search-clear" onClick={() => setSearch("")}>
              <X size={11} />
            </button>
          )}
        </div>
        <button
          className={`hem-filter-toggle ${filterOpen ? "hem-filter-toggle--active" : ""} ${hasFilters ? "hem-filter-toggle--has" : ""}`}
          onClick={() => setFilterOpen(v => !v)}
        >
          <Filter size={14} />
          {hasFilters && <span className="hem-filter-dot" />}
        </button>
      </div>

      {filterOpen && (
        <div className="hem-filter-panel">
          <div className="hem-filter-group">
            <span className="hem-filter-label">Categoría</span>
            <div className="hem-filter-chips">
              <button
                className={`hem-chip ${filterCategory === "player" ? "hem-chip--active" : ""}`}
                onClick={() => setFilterCategory(filterCategory === "player" ? "" : "player")}
              >Jugador</button>
              <button
                className={`hem-chip ${filterCategory === "team" ? "hem-chip--active" : ""}`}
                onClick={() => setFilterCategory(filterCategory === "team" ? "" : "team")}
              >Equipo</button>
            </div>
          </div>
          <div className="hem-filter-group">
            <span className="hem-filter-label">Tipo</span>
            <div className="hem-filter-chips">
              {types.map(t => (
                <button
                  key={t}
                  className={`hem-chip ${filterType === t ? "hem-chip--active" : ""}`}
                  onClick={() => setFilterType(filterType === t ? "" : t)}
                >
                  {EVENT_TYPE_LABEL[t] || t}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button className="hem-filter-clear" onClick={() => { setFilterCategory(""); setFilterType(""); }}>
              <X size={10} /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      <div className="hem-results-bar">
        <span className="hem-results-count">{events.length} resultado{events.length !== 1 ? "s" : ""}</span>
      </div>

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
          <p>Sin momentos</p>
          <span>{search || hasFilters ? "Intenta con otros filtros." : "Aún no hay datos."}</span>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="hem-list">
          {events.map(ev => (
            <EventCard key={ev.id} event={ev} onClick={e => setSelectedId(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
