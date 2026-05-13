import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Search, X, Star, ChevronRight, ArrowLeft, RefreshCw, AlertCircle,
  Shield, Zap, Filter, Users2, Flag, Award, Trophy, TrendingUp,
} from "lucide-react";
import {
  useHistoricalPlayers,
  useHistoricalPlayerDetail,
  getHistoricalImageUrl,
  useHistoricalEvents,

  HistoryRightPanel,
  TeamsRightPanel,
  EventsRightPanel,

  HistoryMenuDesktop,
  HistoryMenuMobile,

  HistoricalEventsPage,
  HistoricalEventsMobile,

  HistoricalTeamsPage,
  HistoricalTeamsMobile,

  HistoricalCompetitionsPage,
  HistoricalCompetitionsMobile,

  HistoryWelcomeScreen,
  SectionHeaderMobile,
} from '@/features/history';

import "./HistoryPage.css";
import "../styles/mobile/HistoryPageMobile.css";
// ─── Helpers ──────────────────────────────────────────────────
const LEGACY_COLOR = {
  "Goal Scorer": "#f59e0b", "Tactician": "#3b82f6",
  "Innovator": "#8b5cf6", "Leader": "#10b981", "Goalkeeper": "#ec4899",
};
const POSITION_LABEL = {
  "Forward": "Delantero", "Midfielder": "Centrocampista", "All-rounder": "Todocampista", "Play-maker": "Media Punta",
  "Defender": "Defensor", "Goalkeeper": "Portero",
};
const LEGACY_LABEL = {
  "Goal Scorer": "Goleador", "Tactician": "Táctico",
  "Innovator": "Genio", "Leader": "Líder", "Goalkeeper": "Portero", "Technician": "Técnico",
};
const EVENT_TYPE_LABEL = {
  "Championship": "Campeonato", "Historic Match": "Partido Histórico",
  "Legendary Performance": "Actuación Legendaria",
  "Era Defining": "Definió una Era", "Record": "Récord",
};
const TITLE_CAT_LABEL = {
  "club": "Club", "national": "Selección", "individual": "Individual",
};
const TITLE_CAT_COLOR = {
  "club": "var(--accent)", "national": "#1D9E75", "individual": "#f59e0b",
};
const SIGNIFICANCE_LABEL = ["", "Activo", "Notable", "Iconico", "Leyenda", "GOAT"];

// ─── Badge jugador activo (significance_level === 1) ──────────
function ActiveBadge() {
  return (
    <span className="hp-active-badge">
      <span className="hp-active-badge-star">★</span>
      <span className="hp-active-badge-text">Activo</span>
    </span>
  );
}

// ─── Estrellas (historical levels 2-5) ───────────────────────
function SignificanceStars({ value }) {
  if (value === 1) return <ActiveBadge />;

  return (
    <span className="hp-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={10}
          fill={n <= value ? "#f59e0b" : "none"}
          stroke={n <= value ? "#f59e0b" : "var(--border)"}
        />
      ))}
    </span>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

function LegacyBadge({ type }) {
  if (!type) return null;
  const color = LEGACY_COLOR[type] || "var(--accent)";
  return <span className="hp-badge" style={{ "--badge-color": color }}>{LEGACY_LABEL[type] || type}</span>;
}

function PlayerAvatar({ imagePath, name, size = "md" }) {
  const url = getHistoricalImageUrl(imagePath);
  const initials = name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div className={`hp-avatar hp-avatar--${size}`}>
      {url
        ? <img src={url} alt={name} className="hp-avatar-img" />
        : <span className="hp-avatar-initials">{initials}</span>
      }
    </div>
  );
}

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
          {player.country && <span className="hp-card-country">{player.country}</span>}
          {player.position && <><span className="hp-card-sep">·</span><span className="hp-card-position">{POSITION_LABEL[player.position] || player.position}</span></>}
          {player.ballon_dor_count > 0 && (
            <>
              <span className="hp-card-sep">·</span>
            </>
          )}
        </div>
        {player.impact_summary && <p className="hp-card-summary">{player.impact_summary}</p>}
        <div className="hp-card-footer">
          <LegacyBadge type={player.legacy_type} />
          <ChevronRight size={14} className="hp-card-chevron" />
        </div>
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════
//  DETALLE DE JUGADOR
// ══════════════════════════════════════════════════════════════
function PlayerDetail({ playerId, onBack }) {
  const { player, teams, events, career, national, titles, loading, error, reload } =
    useHistoricalPlayerDetail(playerId);

  if (loading) return (
    <div className="hp-detail-loading">
      <RefreshCw size={20} className="hp-spin" /><span>Cargando jugador...</span>
    </div>
  );
  if (error || !player) return (
    <div className="hp-detail-error">
      <AlertCircle size={20} /><p>{error || "Jugador no encontrado"}</p>
      <button className="hp-retry-btn" onClick={reload}><RefreshCw size={12} /> Reintentar</button>
    </div>
  );

  const imageUrl = getHistoricalImageUrl(player.image_path);
  const lifespan = player.birth_year
    ? `${player.birth_year}${player.death_year ? ` – ${player.death_year}` : " – presente"}`
    : null;

  const titlesByCategory = (titles || []).reduce((acc, t) => {
    const cat = t.title_category || "club";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const careerTotals = (career || []).reduce(
    (acc, r) => ({
      apps: acc.apps + (parseInt(r.appearances) || 0),
      goals: acc.goals + (parseInt(r.goals) || 0),
      assists: acc.assists + (parseInt(r.assists) || 0),
      clubs: acc.clubs + 1,
    }),
    { apps: 0, goals: 0, assists: 0, clubs: 0 }
  );

  const nationalTotals = (national || []).reduce(
    (acc, r) => ({
      caps: acc.caps + (parseInt(r.caps) || 0),
      goals: acc.goals + (parseInt(r.goals) || 0),
      assists: acc.assists + (parseInt(r.assists) || 0),
    }),
    { caps: 0, goals: 0, assists: 0 }
  );

  const isActive = player.significance_level === 1;

  return (
    <div className="hp-detail">
      <button className="hp-back-section-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Jugadores
      </button>
      <div className="hp-detail-hero">
        <div className="hp-detail-hero-img-wrap">
          {imageUrl
            ? <img src={imageUrl} alt={player.name} className="hp-detail-hero-img" />
            : <div className="hp-detail-hero-placeholder">
              {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
          }
          {player.significance_level === 5 && <span className="hp-goat-chip">GOAT</span>}
          {isActive && <span className="hp-active-hero-chip">EN ACTIVO</span>}
        </div>
        <div className="hp-detail-hero-info">
          <h1 className="hp-detail-name">{player.name}</h1>

          <div className="hp-detail-chips">
            {player.country && (
              <span className="hp-detail-chip hp-chip--country">{player.country}</span>
            )}
            {player.position && (
              <span className="hp-detail-chip hp-chip--pos">
                {POSITION_LABEL[player.position] || player.position}
              </span>
            )}
            {player.ballon_dor_count > 0 ? (
              <span className="hp-detail-chip hp-chip--era">
                {player.ballon_dor_count} Balón{player.ballon_dor_count > 1 ? "es" : ""} de Oro
              </span>
            ) : (
              player.legacy_type && (
                <span
                  className="hp-detail-chip"
                  style={{ color: LEGACY_COLOR[player.legacy_type] || "var(--accent)", borderColor: `color-mix(in srgb, ${LEGACY_COLOR[player.legacy_type] || "var(--accent)"} 35%, transparent)`, background: `color-mix(in srgb, ${LEGACY_COLOR[player.legacy_type] || "var(--accent)"} 7%, transparent)` }}
                >
                  {LEGACY_LABEL[player.legacy_type] || player.legacy_type}
                </span>
              )
            )}
            {lifespan && (
              <span className="hp-detail-chip hp-chip--life">{lifespan}</span>
            )}
          </div>

          {/* Fila de estrellas — siempre visible */}
          <div className="hp-detail-sig-row">
            <SignificanceStars value={player.significance_level || 0} />
            <span className={`hp-detail-sig-label${isActive ? " hp-detail-sig-label--active" : ""}`}>
              {SIGNIFICANCE_LABEL[player.significance_level || 0]}
            </span>
          </div>

          {/* LegacyBadge solo cuando tiene Balón de Oro (para no duplicar) */}
          {player.legacy_type && player.ballon_dor_count > 0 && (
            <LegacyBadge type={player.legacy_type} />
          )}
        </div>
      </div>

      {(careerTotals.clubs > 0 || nationalTotals.caps > 0 || (titles || []).length > 0) && (
        <div className="hp-stats-strip">
          {careerTotals.clubs > 0 && (
            <>
              <div className="hp-stat-cell"><span className="hp-stat-n">{careerTotals.clubs}</span><span className="hp-stat-lbl">Clubes</span></div>
              <div className="hp-stat-cell"><span className="hp-stat-n">{careerTotals.goals}</span><span className="hp-stat-lbl">Goles</span></div>
              {careerTotals.assists > 0 && <div className="hp-stat-cell"><span className="hp-stat-n">{careerTotals.assists}</span><span className="hp-stat-lbl">Asist.</span></div>}
            </>
          )}
          {nationalTotals.caps > 0 && (
            <>
              <div className="hp-stat-cell hp-stat-cell--national"><span className="hp-stat-n">{nationalTotals.caps}</span><span className="hp-stat-lbl">Int'l Part.</span></div>
              <div className="hp-stat-cell hp-stat-cell--national"><span className="hp-stat-n">{nationalTotals.goals}</span><span className="hp-stat-lbl">Int'l Goles</span></div>
            </>
          )}
          {(titles || []).filter(t => t.title_category !== "individual").length > 0 && (
            <div className="hp-stat-cell hp-stat-cell--gold">
              <span className="hp-stat-n">
                {(titles || [])
                  .filter(t => t.title_category !== "individual")
                  .reduce((sum, t) => sum + (parseInt(t.quantity) || 1), 0)}
              </span>
              <span className="hp-stat-lbl">Títulos</span>
            </div>
          )}
        </div>
      )}

      {player.impact_summary && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep">Trasendecia</span>
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

      {(career || []).length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep"><Shield size={11} /> Trayectoria en Clubes</span>
          <div className="hp-career-table-wrap">
            <table className="hp-career-table">
              <thead><tr><th>Club</th><th>País</th><th>Período</th><th className="hp-th-num">PJ</th><th className="hp-th-num">Goles</th><th className="hp-th-num">Asist.</th><th>Nota</th></tr></thead>
              <tbody>
                {career.map((row, i) => (
                  <tr key={i}>
                    <td className="hp-td-club">{row.team_name || "—"}</td>
                    <td className="hp-td-country">{row.team_country || "—"}</td>
                    <td className="hp-td-period">{row.start_year || "?"}{" – "}{row.end_year || "?"}</td>
                    <td className="hp-td-num">{row.appearances || "—"}</td>
                    <td className="hp-td-num">{row.goals || "—"}</td>
                    <td className="hp-td-num">{row.assists || "—"}</td>
                    <td className="hp-td-note">{row.role_note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(national || []).length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep"><Flag size={11} /> Selección Nacional</span>
          <div className="hp-career-table-wrap">
            <table className="hp-career-table">
              <thead><tr><th>Selección</th><th>Período</th><th className="hp-th-num">Partidos</th><th className="hp-th-num">Goles</th><th className="hp-th-num">Asist.</th><th>Nota</th></tr></thead>
              <tbody>
                {national.map((row, i) => (
                  <tr key={i}>
                    <td className="hp-td-club">{row.country || "—"}</td>
                    <td className="hp-td-period">{row.start_year || "?"}{" – "}{row.end_year || "?"}</td>
                    <td className="hp-td-num">{row.caps || "—"}</td>
                    <td className="hp-td-num">{row.goals || "—"}</td>
                    <td className="hp-td-num">{row.assists || "—"}</td>
                    <td className="hp-td-note">{row.role_note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep"><Shield size={11} /> Equipos</span>
          <div className="hp-detail-teams">
            {teams.map((row, i) => {
              const team = row.historical_teams;
              const teamImg = getHistoricalImageUrl(team?.image_path);
              return (
                <div key={i} className="hp-team-row">
                  <div className="hp-team-logo-wrap">
                    {teamImg ? <img src={teamImg} alt={team?.name} className="hp-team-logo" /> : <div className="hp-team-logo-ph"><Shield size={14} /></div>}
                  </div>
                  <div className="hp-team-info">
                    <span className="hp-team-name">{team?.name}</span>
                    {team?.country && <span className="hp-team-country">{team.country}</span>}
                  </div>
                  <div className="hp-team-years">{row.start_year || "?"} – {row.end_year || "?"}</div>
                  {row.roles && <span className="hp-team-role">{row.roles}</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep"><Zap size={11} /> Momentos históricos</span>
          <div className="hp-detail-events">
            {events.map((row, i) => {
              const ev = row.historical_events;
              const evImg = getHistoricalImageUrl(ev?.image_path);
              const year = ev?.event_date ? new Date(ev.event_date).getFullYear() : null;
              return (
                <div key={i} className="hp-event-row">
                  {evImg && <img src={evImg} alt={ev?.title} className="hp-event-img" />}
                  <div className="hp-event-info">
                    <span className="hp-event-title">{ev?.title}</span>
                    <div className="hp-event-meta">
                      {ev?.event_type && <span className="hp-event-type">{EVENT_TYPE_LABEL[ev.event_type] || ev.event_type}</span>}
                      {year && <span className="hp-event-year">{year}</span>}
                    </div>
                    {row.role_note && <span className="hp-event-role">{row.role_note}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(titles || []).length > 0 && (
        <section className="hp-detail-section">
          <span className="hp-detail-sep"><Award size={11} /> Palmarés</span>
          <div className="hp-titles-wrap">
            {["club", "national", "individual"].map((cat) => {
              const catTitles = titlesByCategory[cat];
              if (!catTitles || catTitles.length === 0) return null;
              return (
                <div key={cat} className="hp-titles-group">
                  <span className="hp-titles-cat-label" style={{ "--cat-color": TITLE_CAT_COLOR[cat] }}>{TITLE_CAT_LABEL[cat]}</span>
                  <div className="hp-titles-list">
                    {catTitles.map((t, i) => (
                      <div key={i} className="hp-title-row" style={{ "--cat-color": TITLE_CAT_COLOR[cat] }}>
                        <Trophy size={10} className="hp-title-icon" />
                        <span className="hp-title-name">{t.title_name}</span>
                        {t.team_name && <span className="hp-title-team">{t.team_name}</span>}
                        {t.year && <span className="hp-title-year">{t.year}</span>}
                        {t.quantity > 1 && <span className="hp-title-qty">×{t.quantity}</span>}
                      </div>
                    ))}
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

// ══════════════════════════════════════════════════════════════
//  WRAPPER DE EVENTOS
// ══════════════════════════════════════════════════════════════
function EventsSectionWrapper({ onBack, initialEvent }) {
  const { allEvents } = useHistoricalEvents();
  const [selectedEvent, setSelectedEvent] = useState(initialEvent || null);

  return (
    <div className="hp-shell">
      <div className="hp-root">
        <HistoricalEventsPage
          selectedEvent={selectedEvent}
          onEventSelect={(ev) => setSelectedEvent(ev)}
          onBack={onBack}
        />
      </div>
      <EventsRightPanel
        allEvents={allEvents}
        selectedEvent={selectedEvent}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function HistoryPage() {
  const [activeSection, setActiveSection] = useState("players");
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [preselectedTeamId, setPreselectedTeamId] = useState(null);
  const [preselectedEvent, setPreselectedEvent] = useState(null);
  const [preselectedCompId, setPreselectedCompId] = useState(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showWelcome, setShowWelcome] = useState(
    () => !sessionStorage.getItem("vault_visited")
  );
  const [showMenu, setShowMenu] = useState(true);
  const isMobile = useIsMobile();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.reset) {
      setShowMenu(true);
      setActiveSection("players");
      setSelectedPlayerId(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.state?.reset]);

  const {
    players, allPlayers, loading, error, reload,
    search, setSearch,
    filterPosition, setFilterPosition,
    filterBallonDor, setFilterBallonDor,
    filterLegacy, setFilterLegacy,
    filterSignificance, setFilterSignificance,
    positions, legacies,
  } = useHistoricalPlayers();

  const hasActiveFilters = filterPosition || filterBallonDor || filterLegacy || filterSignificance;
  const clearFilters = () => { setFilterPosition(""); setFilterBallonDor(""); setFilterLegacy(""); setFilterSignificance(""); };
  const panelPlayer = hoveredPlayer || (selectedPlayerId ? allPlayers.find((p) => p.id === selectedPlayerId) || null : null);

  const handleBackToMenu = () => {
    setShowMenu(true);
    setSelectedPlayerId(null);
    setPreselectedTeamId(null);
    setPreselectedEvent(null);
    setPreselectedCompId(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleSectionChange = (section, item = null) => {
    setActiveSection(section);
    setSelectedPlayerId(null);

    if (item) {
      if (section === "players") setSelectedPlayerId(item.id);
      if (section === "teams") setPreselectedTeamId(item.id);
      if (section === "events") setPreselectedEvent(item);
      if (section === "competitions") setPreselectedCompId(item.id);
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // ── Pantalla de bienvenida ────────────────────────────────────
  if (showWelcome) {
    return (
      <HistoryWelcomeScreen
        onEnter={() => {
          sessionStorage.setItem("vault_visited", "true");
          setShowWelcome(false);
        }}
      />
    );
  }

  // ── Menú principal (desktop y mobile) ────────────────────────
  if (showMenu) {
    return isMobile
      ? (
        <HistoryMenuMobile
          onSectionChange={(key, item) => {
            setShowMenu(false);
            handleSectionChange(key, item);
          }}
        />
      )
      : (
        <HistoryMenuDesktop
          onSectionChange={(key) => {
            setShowMenu(false);
            handleSectionChange(key);
          }}
        />
      );
  }

  if (activeSection === "players" && selectedPlayerId) {
    // Mobile: sin panel lateral, onBack → menú mobile
    if (isMobile) {
      return (
        <div className="hp-root hp-root--detail">
          <PlayerDetail playerId={selectedPlayerId} onBack={handleBackToMenu} />
        </div>
      );
    }
    // Desktop: con panel lateral, onBack → vuelve al listado
    return (
      <div className="hp-shell">
        <div className="hp-root hp-root--detail">
          <PlayerDetail playerId={selectedPlayerId} onBack={() => setSelectedPlayerId(null)} />
        </div>
        <HistoryRightPanel
          allPlayers={allPlayers}
          selectedPlayer={panelPlayer}
          onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
        />
      </div>
    );
  }

  if (activeSection === "teams") {

    // ── MOBILE ─────────────────────────────
    if (isMobile) {
      return (
        <HistoricalTeamsMobile
          initialSelectedId={preselectedTeamId}
          onBack={handleBackToMenu}
        />
      );
    }

    // ── DESKTOP ────────────────────────────
    return (
      <div className="hp-shell">
        <div className="hp-root">
          <HistoricalTeamsPage
            initialSelectedId={preselectedTeamId}
            onBack={handleBackToMenu}
          />
        </div>

        <TeamsRightPanel />
      </div>
    );
  }

  if (activeSection === "events") {

    // Mobile con detalle directo
    if (isMobile && preselectedEvent) {
      return (
        <HistoricalEventsMobile
          initialSelectedEvent={preselectedEvent}
          onBack={handleBackToMenu}
        />
      );
    }

    // Mobile sin detalle
    if (isMobile) {
      return (
        <HistoricalEventsMobile
          onBack={handleBackToMenu}
        />
      );
    }

    // Desktop
    return (
      <EventsSectionWrapper
        onBack={handleBackToMenu}
        initialEvent={preselectedEvent}
      />
    );
  }

  if (activeSection === "competitions") {
    // Mobile con detalle
    if (isMobile && preselectedCompId) {
      return (
        <HistoricalCompetitionsMobile
          initialSelectedId={preselectedCompId}
          onBack={() => {
            setPreselectedCompId(null);
            setShowMenu(true);
          }}
        />
      );
    }

    // Mobile sin detalle
    if (isMobile) {
      return (
        <HistoricalCompetitionsMobile
          onBack={() => setShowMenu(true)}
        />
      );
    }

    return (
      <div className="hp-shell">
        <div className="hp-root">
          <HistoricalCompetitionsPage
            initialSelectedId={preselectedCompId}
            onBack={handleBackToMenu}
          />
        </div>
      </div>
    );
  }

  // ── Vista jugadores — mobile: todo via HistoryMenuMobile ─────
  if (isMobile) {
    return (
      <HistoryMenuMobile
        initialSection="players"
        onSectionChange={(key, item) => handleSectionChange(key, item)}
      />
    );
  }

  return (
    <div className="hp-shell">
      <div className="hp-root">

        <div className="hp-mobile-header-wrap">
          <SectionHeaderMobile
            section="players"
            items={allPlayers}
            onRandomSelect={(p) => {
              setSelectedPlayerId(p.id);
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            onBack={handleBackToMenu}
          />
        </div>

        <header className="hp-header hp-header--desktop">
          <div className="hp-header-left">
            <div className="hp-header-icon"><Users2 size={18} strokeWidth={1.5} /></div>
            <div>
              <h1 className="hp-header-title">JUGADORES HISTORICOS</h1>
              <p className="hp-header-sub">{allPlayers.length} leyenda{allPlayers.length !== 1 ? "s" : ""} del fútbol mundial</p>
            </div>
          </div>
          <div className="hp-search-wrap">
            <div className="hp-search">
              <Search size={13} className="hp-search-ico" />
              <input
                className="hp-search-input"
                placeholder="Buscar jugador, país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="hp-search-clear" onClick={() => setSearch("")}><X size={11} /></button>}
            </div>
            <button
              className={`hp-filter-btn ${hasActiveFilters ? "hp-filter-btn--active" : ""}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={12} /> {hasActiveFilters && <span className="hp-filter-dot" />}
            </button>
            <button className="hp-back-vault-btn" onClick={handleBackToMenu}>
              <ArrowLeft size={12} />
            </button>
          </div>
        </header>

        {showFilters && (
          <div className="hp-filters-panel">
            <div className="hp-filters-row">
              <div className="hp-filter-group">
                <label className="hp-filter-label">Posición</label>
                <select className="hp-filter-select" value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)}>
                  <option value="">Todas</option>
                  {positions.map((p) => <option key={p} value={p}>{POSITION_LABEL[p] || p}</option>)}
                </select>
              </div>
              <div className="hp-filter-group">
                <label className="hp-filter-label">Balón de Oro</label>
                <select className="hp-filter-select" value={filterBallonDor} onChange={(e) => setFilterBallonDor(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="yes">Con Balón de Oro</option>
                </select>
              </div>
              <div className="hp-filter-group">
                <label className="hp-filter-label">Tipo de legado</label>
                <select className="hp-filter-select" value={filterLegacy} onChange={(e) => setFilterLegacy(e.target.value)}>
                  <option value="">Todos</option>
                  {legacies.map((l) => <option key={l} value={l}>{LEGACY_LABEL[l] || l}</option>)}
                </select>
              </div>
              <div className="hp-filter-group">
                <label className="hp-filter-label">Nivel</label>
                <select
                  className="hp-filter-select"
                  value={filterSignificance}
                  onChange={(e) => setFilterSignificance(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="5">GOAT</option>
                  <option value="4">Leyenda</option>
                  <option value="3">Icónico</option>
                  <option value="2">Notable</option>
                  <option value="1">Activo</option>
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

        {loading && <div className="hp-state-msg"><RefreshCw size={18} className="hp-spin" /><span>Cargando leyendas...</span></div>}
        {error && !loading && (
          <div className="hp-state-error">
            <AlertCircle size={18} /><p>{error}</p>
            <button className="hp-retry-btn" onClick={reload}><RefreshCw size={12} /> Reintentar</button>
          </div>
        )}
        {!loading && !error && players.length === 0 && (
          <div className="hp-state-empty">
            <Users2 size={28} strokeWidth={1} />
            <p className="hp-empty-title">{allPlayers.length === 0 ? "Aún no hay jugadores históricos" : "Sin coincidencias"}</p>
            <p className="hp-empty-sub">{allPlayers.length === 0 ? "El administrador publicará las leyendas pronto." : "Prueba con otro nombre o ajusta los filtros."}</p>
            {hasActiveFilters && <button className="hp-retry-btn" onClick={clearFilters}><X size={11} /> Limpiar filtros</button>}
          </div>
        )}

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
                  onClick={(p) => { setSelectedPlayerId(p.id); window.scrollTo({ top: 0, behavior: "instant" }); }}
                  onMouseEnter={() => setHoveredPlayer(player)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <HistoryRightPanel
        allPlayers={allPlayers}
        selectedPlayer={panelPlayer}
        onSelectPlayer={(p) => setSelectedPlayerId(p.id)}
      />
    </div>
  );
}