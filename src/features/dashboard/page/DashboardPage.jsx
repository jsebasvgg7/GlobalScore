import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Filter, X, ArrowUpDown
} from "lucide-react";
import {
  MatchCard,
  LeagueCard,
  AwardCard,
  RightPanel,
  MobileDashboard,
  useMatches,
  useLeagues,
  useAwards
} from "@/features/dashboard";
import AlbumBookEntry from '@/features/albums/components/AlbumBookEntry';
import { NavigationTabs } from "@/shared/layout";
import { PageLoader, LoadingOverlay } from "@/shared/ui/LoadingStates";
import { ToastContainer, useToast } from "@/shared/ui/Toast";
import { useDataLoader } from "@/shared/hooks";

import "./DashboardPage.css";

/* ── Empty state brutalista ── */
function MatchesEmpty({ leagueFilter, leagueCategories, onClear }) {
  const activeCategory = leagueCategories.find((c) => c.id === leagueFilter);
  const isFiltered = leagueFilter !== "all";

  return (
    <div className="matches-empty-state">

      {/* Cuadrado brutalista con ícono de balón SVG */}
      <div className="matches-empty-icon-wrap">
        <div className="matches-empty-icon-inner">
          {/* Balón minimalista en SVG puro — sin emoji */}
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="13" />
            <polygon points="16,6 20,10 18,15 14,15 12,10" />
            <line x1="16" y1="6" x2="16" y2="3" />
            <line x1="20" y1="10" x2="23" y2="8" />
            <line x1="18" y1="15" x2="21" y2="17" />
            <line x1="14" y1="15" x2="11" y2="17" />
            <line x1="12" y1="10" x2="9" y2="8" />
          </svg>
        </div>
      </div>

      {/* Decoración lineal */}
      <div className="matches-empty-deco">
        <div className="matches-empty-deco-line" />
        <div className="matches-empty-deco-dot" />
        <div className="matches-empty-deco-line" />
      </div>

      {/* Texto */}
      <div className="matches-empty-title">
        {isFiltered
          ? `Sin partidos · ${activeCategory?.name}`
          : "Sin partidos pendientes"}
      </div>
      <div className="matches-empty-sub">
        {isFiltered
          ? "No hay partidos disponibles en esta categoría"
          : "Todos los partidos están al día"}
      </div>

      {/* Chip para limpiar filtro */}
      {isFiltered && (
        <button className="matches-empty-filter-chip" onClick={onClear}>
          <X size={11} />
          Ver todos los partidos
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("matches");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState("date-asc");

  const sortRef = useRef(null);
  const toast = useToast();

  const {
    currentUser, users, matches, leagues, awards,
    loading, error,
    updateMatches, updateLeagues, updateAwards,
  } = useDataLoader();

  const { loading: matchesLoading, makePrediction } = useMatches(currentUser);
  const { loading: leaguesLoading, makeLeaguePrediction } = useLeagues(currentUser);
  const { loading: awardsLoading, makeAwardPrediction } = useAwards(currentUser);

  const handleNavigate = (section) => {
    switch (section) {
      case "profile": navigate("/profile"); break;
      case "ranking": navigate("/ranking"); break;
      case "stats": navigate("/stats"); break;
      case "world": navigate("/world"); break;
      case "notifications": navigate("/notifications"); break;
      default: break;
    }
  };

  const leagueCategories = [
    { id: "all", name: "Todos", icon: "🌍", leagues: [] },
    { id: "europe", name: "Europa", icon: "🏆", leagues: ["Champions League", "Europa League", "Conference League"] },
    { id: "england", name: "Inglaterra", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", leagues: ["Premier League", "Championship", "FA Cup", "EFL Cup"] },
    { id: "spain", name: "España", icon: "🇪🇸", leagues: ["La Liga", "Copa del Rey", "Supercopa"] },
    { id: "italy", name: "Italia", icon: "🇮🇹", leagues: ["Serie A", "Coppa Italia", "Supercoppa"] },
    { id: "germany", name: "Alemania", icon: "🇩🇪", leagues: ["Bundesliga", "DFB Pokal"] },
    { id: "france", name: "Francia", icon: "🇫🇷", leagues: ["Ligue 1", "Coupe de France", "Coupe de la Ligue"] },
    { id: "southamerica", name: "Sudamérica", icon: "🌎", leagues: ["Copa Libertadores", "Copa Sudamericana"] },
  ];

  useEffect(() => {
    if (!showSort) return;
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSort]);

  const handleMakePrediction = async (matchId, homeScore, awayScore, advancingTeam = null) => {
    const match = matches.find((m) => m.id === matchId);
    if (match?.deadline && new Date() > new Date(match.deadline)) {
      toast.warning("Plazo expirado");
      return;
    }
    await makePrediction(matchId, homeScore, awayScore, advancingTeam,
      (list) => { updateMatches(list); },
      (err) => toast.error(`Error: ${err}`)
    );
  };

  const handleMakeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    await makeLeaguePrediction(leagueId, champion, topScorer, topAssist, mvp,
      (list) => { updateLeagues(list); },
      (err) => toast.error(`Error: ${err}`)
    );
  };

  const handleMakeAwardPrediction = async (awardId, winner) => {
    await makeAwardPrediction(awardId, winner,
      (list) => { updateAwards(list); },
      (err) => toast.error(`Error: ${err}`)
    );
  };

  const filteredMatches = useMemo(() => {
    let pending = matches.filter((m) => m.status === "pending");
    if (leagueFilter !== "all") {
      const cat = leagueCategories.find((c) => c.id === leagueFilter);
      if (cat) {
        pending = pending.filter((m) =>
          cat.leagues.some((l) => m.league?.toLowerCase().includes(l.toLowerCase()))
        );
      }
    }
    return pending.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`);
      const db = new Date(`${b.date}T${b.time}`);
      switch (sortOption) {
        case "date-desc": return db - da;
        case "league-asc": return (a.league || "").localeCompare(b.league || "");
        case "league-desc": return (b.league || "").localeCompare(a.league || "");
        default: return da - db;
      }
    });
  }, [matches, leagueFilter, sortOption]);

  const groupedMatches = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const groups = {};
    filteredMatches.forEach((m) => {
      const d = new Date(m.date + "T00:00:00");
      let label =
        d.getTime() === today.getTime() ? "Hoy" :
          d.getTime() === tomorrow.getTime() ? "Mañana" :
            d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
      if (!groups[label]) groups[label] = [];
      groups[label].push(m);
    });
    return groups;
  }, [filteredMatches]);

  const activeLeagues = leagues.filter((l) => l.status === "active");
  const activeAwards = awards.filter((a) => a.status === "active");
  const isLoading = matchesLoading || leaguesLoading || awardsLoading;

  if (loading) return <PageLoader />;
  if (error) return <div className="centered">Error: {error}</div>;
  if (!currentUser) return <div className="centered">Usuario no encontrado</div>;

  return (
    <>
      <MobileDashboard
        currentUser={currentUser}
        users={users}
        matches={matches}
        leagues={leagues}
        awards={awards}
        onPredict={handleMakePrediction}
        onLeaguePredict={handleMakeLeaguePrediction}
        onAwardPredict={handleMakeAwardPrediction}
        onNavigate={handleNavigate}
        activeNav="home"
      />

      <div className="db-root page-root">
        <div className="db-body">

          <main className="db-main">

            <NavigationTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSortClick={activeTab === "matches" ? () => setShowSort(!showSort) : null}
              onFilterClick={activeTab === "matches" ? () => setShowFilters(true) : null}
              sortActive={showSort}
              matchCount={filteredMatches.length}
              leagueCount={activeLeagues.length}
              awardCount={activeAwards.length}
            />

            {/* ════ PARTIDOS ════ */}
            {activeTab === "matches" && (
              <div className="db-content">

                {/* Album entry */}
                <AlbumBookEntry currentUser={currentUser} />

                {/* Sort dropdown */}
                <div style={{ position: "relative" }} ref={sortRef}>
                  {showSort && (
                    <>
                      <div className="sort-modal-backdrop" onClick={() => setShowSort(false)} />
                      <div className="sort-modal sort-modal-top">
                        <div className="sort-modal-header">
                          <ArrowUpDown size={14} />
                          <span>Ordenar por</span>
                        </div>
                        <div className="sort-options">
                          {[
                            { key: "date-asc", label: "Fecha: más próximos" },
                            { key: "date-desc", label: "Fecha: más lejanos" },
                            { key: "league-asc", label: "Liga: A-Z" },
                            { key: "league-desc", label: "Liga: Z-A" },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              className={`sort-option${sortOption === key ? " active" : ""}`}
                              onClick={() => { setSortOption(key); setShowSort(false); }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Panel de filtros */}
                {showFilters && (
                  <>
                    <div className="filters-modal-backdrop" onClick={() => setShowFilters(false)} />
                    <div className="filters-modal">
                      <div className="filters-modal-header">
                        <div className="filters-modal-title">
                          <Filter size={18} />
                          <span>Filtrar</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="filters-reset-btn" onClick={() => setLeagueFilter("all")}>Reset</button>
                          <button className="filters-close-btn" onClick={() => setShowFilters(false)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="filters-modal-body">
                        <div className="filter-category">
                          <div className="filter-category-header">
                            <span className="filter-category-title">Categoría</span>
                          </div>
                          <div className="filter-pills">
                            {leagueCategories.map((cat) => (
                              <button
                                key={cat.id}
                                className={`filter-pill${leagueFilter === cat.id ? " active" : ""}`}
                                onClick={() => { setLeagueFilter(cat.id); setShowFilters(false); }}
                              >
                                <span className="filter-pill-icon">{cat.icon}</span>
                                <span>{cat.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Chip filtro activo */}
                {leagueFilter !== "all" && (
                  <div className="active-filter-bar">
                    <div className="active-filter-chip">
                      <span>{leagueCategories.find((c) => c.id === leagueFilter)?.icon}</span>
                      <span>{leagueCategories.find((c) => c.id === leagueFilter)?.name}</span>
                      <button className="clear-filter-btn" onClick={() => setLeagueFilter("all")}>
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de partidos o empty state */}
                {Object.keys(groupedMatches).length === 0 ? (
                  <div className="matches-container">
                    <MatchesEmpty
                      leagueFilter={leagueFilter}
                      leagueCategories={leagueCategories}
                      onClear={() => setLeagueFilter("all")}
                    />
                  </div>
                ) : (
                  Object.entries(groupedMatches).map(([label, group]) => (
                    <div key={label} className="matches-date-group">
                      <div className="matches-date-label"><span>{label}</span></div>
                      <div className="matches-container">
                        {group.map((m) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            userPred={m.predictions?.find((p) => p.user_id === currentUser.id)}
                            onPredict={handleMakePrediction}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ════ LIGAS ════ */}
            {activeTab === "leagues" && (
              <div className="db-content db-content--leagues">
                <div className="matches-date-group">
                  <div className="matches-date-label">
                    <span>Temporada 2025 · 2026</span>
                  </div>
                  {leagues.length === 0 ? (
                    <div className="matches-container">
                      <MatchesEmpty
                        leagueFilter="all"
                        leagueCategories={leagueCategories}
                        onClear={() => { }}
                      />
                    </div>
                  ) : (
                    <div className="leagues-grid">
                      {leagues.map((league) => (
                        <LeagueCard
                          key={league.id}
                          league={league}
                          userPrediction={league.league_predictions?.find((p) => p.user_id === currentUser.id)}
                          onPredict={handleMakeLeaguePrediction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ PREMIOS ════ */}
            {activeTab === "awards" && (
              <div className="db-content db-content--awards">
                <div className="matches-date-group">
                  <div className="matches-date-label">
                    <span>Temporada 2025 · 2026</span>
                  </div>
                  {awards.length === 0 ? (
                    <div className="matches-container">
                      <MatchesEmpty
                        leagueFilter="all"
                        leagueCategories={leagueCategories}
                        onClear={() => { }}
                      />
                    </div>
                  ) : (
                    <div className="awards-grid">
                      {awards.map((award) => (
                        <AwardCard
                          key={award.id}
                          award={award}
                          userPrediction={award.award_predictions?.find((p) => p.user_id === currentUser.id)}
                          onPredict={handleMakeAwardPrediction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>

          <RightPanel
            currentUser={currentUser}
            users={users}
            matches={matches}
          />

        </div>

        {isLoading && <LoadingOverlay message="Procesando..." />}
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </div>
    </>
  );
}