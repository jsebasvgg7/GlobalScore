// src/pages/DashboardPage.jsx - FLOATING LAYOUT + ICON-ONLY TABS
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Trophy, TrendingUp, Target, Filter, X, ArrowUpDown, ChevronRight } from "lucide-react";

// Components
import MatchCard from "../components/ComCards/MatchCard";
import LeagueCard from "../components/ComCards/LeagueCard";
import AwardCard from "../components/ComCards/AwardCard";
import NavigationTabs from "../components/ComOthers/NavigationTabs";
import ProfileSettings from "./ProfileSettingsPage"; 
import RankingPage from "./RankingPage";
import Footer from "../components/ComOthers/Footer";
import AdminPage from "./AdminPage";
import NotificationsPage from "./NotificationsPage";
import StatsPage from "./StatsPage";
import { PageLoader, LoadingOverlay } from "../components/ComOthers/LoadingStates";
import { ToastContainer, useToast } from "../components/ComOthers/Toast";

// Custom Hooks
import { useDataLoader } from "../hooks/useDataLoader";
import { useMatches } from "../hooks/HooksCards/useMatches";
import { useLeagues } from "../hooks/HooksCards/useLeagues";
import { useAwards } from "../hooks/HooksCards/useAwards";

// Styles
import "../styles/StylesPages/DashboardPage.css";

export default function VegaScorePage() {
  // ========== STATE MANAGEMENT ==========
  const [showProfile, setShowProfile] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState('date-asc');
  
  const sortRef = useRef(null);
  const toast = useToast();

  // ========== CUSTOM HOOKS ==========
  const {
    currentUser,
    users,
    matches,
    leagues,
    awards,
    loading,
    error,
    updateUsers,
    updateMatches,
    updateLeagues,
    updateAwards
  } = useDataLoader();

  const {
    loading: matchesLoading,
    makePrediction,
    addMatch,
    finishMatch
  } = useMatches(currentUser);

  const {
    loading: leaguesLoading,
    makeLeaguePrediction,
    addLeague,
    finishLeague: finishLeagueHook
  } = useLeagues(currentUser);

  const {
    loading: awardsLoading,
    makeAwardPrediction,
    addAward,
    finishAward: finishAwardHook
  } = useAwards(currentUser);

  // ========== LEAGUE CATEGORIES ==========
  const leagueCategories = [
    { id: 'all', name: 'Todos', icon: '🌍', leagues: [] },
    { id: 'europe', name: 'Europa', icon: '🏆', leagues: ['Champions League', 'Europa League', 'Conference League'] },
    { id: 'england', name: 'Inglaterra', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagues: ['Premier League', 'Championship', 'FA Cup', 'EFL Cup'] },
    { id: 'spain', name: 'España', icon: '🇪🇸', leagues: ['La Liga', 'Copa del Rey', 'Supercopa'] },
    { id: 'italy', name: 'Italia', icon: '🇮🇹', leagues: ['Serie A', 'Coppa Italia', 'Supercoppa'] },
    { id: 'germany', name: 'Alemania', icon: '🇩🇪', leagues: ['Bundesliga', 'DFB Pokal'] },
    { id: 'france', name: 'Francia', icon: '🇫🇷', leagues: ['Ligue 1', 'Coupe de France', 'Coupe de la Ligue'] },
    { id: 'southamerica', name: 'Sudamérica', icon: '🌎', leagues: ['Copa Libertadores', 'Copa Sudamericana'] },
  ];

  // ========== CLOSE SORT ON OUTSIDE CLICK ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    if (showSort) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSort]);

  // ========== HANDLERS ==========
  const handleBackToHome = () => {
    setShowProfile(false);
    setShowRanking(false);
    setShowAdmin(false);
    setShowNotifications(false);
    setShowStats(false);
  };

  const handleMakePrediction = async (matchId, homeScore, awayScore, advancingTeam = null) => {
    const match = matches.find(m => m.id === matchId);
    if (match?.deadline) {
      const now = new Date();
      const deadline = new Date(match.deadline);
      if (now > deadline) {
        toast.warning("Plazo expirado");
        return;
      }
    }

    await makePrediction(
      matchId,
      homeScore,
      awayScore,
      advancingTeam,
      (matchList) => {
        updateMatches(matchList);
        toast.success("Guardado 🎯");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleMakeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    await makeLeaguePrediction(
      leagueId,
      champion,
      topScorer,
      topAssist,
      mvp,
      (leagueList) => {
        updateLeagues(leagueList);
        toast.success("Guardado 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  const handleMakeAwardPrediction = async (awardId, predictedWinner) => {
    await makeAwardPrediction(
      awardId,
      predictedWinner,
      (awardList) => {
        updateAwards(awardList);
        toast.success("Guardado 🏆");
      },
      (error) => toast.error(`Error: ${error}`)
    );
  };

  // ========== FILTERED & SORTED MATCHES ==========
  const filteredMatches = useMemo(() => {
    let pending = matches.filter((m) => m.status === "pending");

    if (leagueFilter !== 'all') {
      const category = leagueCategories.find(c => c.id === leagueFilter);
      if (category) {
        pending = pending.filter(match => 
          category.leagues.some(league => 
            match.league.toLowerCase().includes(league.toLowerCase())
          )
        );
      }
    }

    return pending.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      
      switch (sortOption) {
        case 'date-asc':  return dateA - dateB;
        case 'date-desc': return dateB - dateA;
        case 'league-asc':  return a.league.localeCompare(b.league);
        case 'league-desc': return b.league.localeCompare(a.league);
        default: return dateA - dateB;
      }
    });
  }, [matches, leagueFilter, sortOption]);

  // ========== RENDER ==========
  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="centered">
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="centered">
        <div>Error: Usuario no encontrado</div>
      </div>
    );
  }

  if (showProfile) {
    return (
      <>
        <ProfileSettings currentUser={currentUser} onBack={() => setShowProfile(false)} />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showRanking) {
    return (
      <>
        <RankingPage
          currentUser={currentUser}
          users={users.sort((a, b) => b.points - a.points)}
          onBack={() => setShowRanking(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showAdmin) {
    return (
      <>
        <AdminPage
          currentUser={currentUser}
          users={users.sort((a, b) => b.points - a.points)}
          onBack={() => setShowAdmin(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showNotifications) {
    return (
      <>
        <NotificationsPage currentUser={currentUser} onBack={() => setShowNotifications(false)} />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  if (showStats) {
    return (
      <>
        <StatsPage currentUser={currentUser} onBack={() => setShowStats(false)} />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const activeLeagues = leagues.filter((l) => l.status === "active");
  const activeAwards = awards.filter((a) => a.status === "active");
  const isLoading = matchesLoading || leaguesLoading || awardsLoading;

  return (
    <>
      <div className="vega-root">
        <main className="container">
          <section className="main-content-full">

            {/* ── Tabs + controles en la misma fila ── */}
            <NavigationTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSortClick={activeTab === 'matches' ? () => setShowSort(!showSort) : null}
              onFilterClick={activeTab === 'matches' ? () => setShowFilters(true) : null}
              sortActive={showSort}
            />

            {/* ══════════ PARTIDOS ══════════ */}
            {activeTab === 'matches' && (
              <div className="matches-section-premium">

                {/* Sort dropdown — anclado al botón del tab */}
                <div style={{ position: 'relative' }} ref={sortRef}>
                  {showSort && (
                    <>
                      <div className="sort-modal-backdrop" onClick={() => setShowSort(false)} />
                      <div className="sort-modal sort-modal-top">
                        <div className="sort-modal-header">
                          <ArrowUpDown size={18} />
                          <h4>Ordenar por</h4>
                        </div>
                        <div className="sort-options">
                          {[
                            { key: 'date-asc',    label: 'Fecha: Más próximos', icon: <TrendingUp size={14} /> },
                            { key: 'date-desc',   label: 'Fecha: Más lejanos',  icon: <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> },
                            { key: 'league-asc',  label: 'Liga: A-Z',           icon: <Trophy size={14} /> },
                            { key: 'league-desc', label: 'Liga: Z-A',           icon: <Trophy size={14} /> },
                          ].map(({ key, label, icon }) => (
                            <button
                              key={key}
                              className={`sort-option ${sortOption === key ? 'active' : ''}`}
                              onClick={() => { setSortOption(key); setShowSort(false); }}
                            >
                              <div className="sort-option-icon">{icon}</div>
                              <span className="sort-option-text">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>



                {/* Panel lateral de filtros */}
                {showFilters && (
                  <>
                    <div className="filters-modal-backdrop" onClick={() => setShowFilters(false)} />
                    <div className="filters-modal">
                      <div className="filters-modal-header">
                        <div className="filters-modal-title">
                          <Filter size={22} />
                          <h3>Filtrar</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="filters-reset-btn" onClick={() => setLeagueFilter('all')}>
                            Reset
                          </button>
                          <button className="filters-close-btn" onClick={() => setShowFilters(false)}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="filters-modal-body">
                        <div className="filter-category">
                          <div className="filter-category-header">
                            <span className="filter-category-title">Categoría</span>
                            <button className="view-all-link">
                              Ver todas <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                            </button>
                          </div>
                          <div className="filter-pills">
                            {leagueCategories.slice(0, 7).map((category) => (
                              <button
                                key={category.id}
                                className={`filter-pill ${leagueFilter === category.id ? 'active' : ''}`}
                                onClick={() => { setLeagueFilter(category.id); setShowFilters(false); }}
                              >
                                <span className="filter-pill-icon">{category.icon}</span>
                                <span>{category.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="filter-category">
                          <div className="filter-category-header">
                            <span className="filter-category-title">Más regiones</span>
                          </div>
                          <div className="filter-pills">
                            {leagueCategories.slice(7).map((category) => (
                              <button
                                key={category.id}
                                className={`filter-pill ${leagueFilter === category.id ? 'active' : ''}`}
                                onClick={() => { setLeagueFilter(category.id); setShowFilters(false); }}
                              >
                                <span className="filter-pill-icon">{category.icon}</span>
                                <span>{category.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Chip de filtro activo */}
                {leagueFilter !== 'all' && (
                  <div className="active-filter-bar">
                    <div className="active-filter-chip">
                      <span className="filter-icon">
                        {leagueCategories.find(c => c.id === leagueFilter)?.icon}
                      </span>
                      <span>{leagueCategories.find(c => c.id === leagueFilter)?.name}</span>
                      <button className="clear-filter-btn" onClick={() => setLeagueFilter('all')}>
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de partidos flotando */}
                <div className="matches-container">
                  {filteredMatches.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">⚽</div>
                      <div className="matches-empty-text">
                        {leagueFilter === 'all'
                          ? 'Sin partidos'
                          : `Sin partidos de ${leagueCategories.find(c => c.id === leagueFilter)?.name}`
                        }
                      </div>
                      {leagueFilter !== 'all' && (
                        <button className="show-all-btn" onClick={() => setLeagueFilter('all')}>
                          Ver todos
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        userPred={m.predictions?.find((p) => p.user_id === currentUser?.id)}
                        onPredict={handleMakePrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ══════════ LIGAS ══════════ */}
            {activeTab === 'leagues' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-badge">
                    <Trophy size={14} />
                    <span className="matches-badge-count">{activeLeagues.length}</span>
                    <span className="matches-badge-text"> disponibles</span>
                  </div>
                </div>

                <div className="matches-container">
                  {leagues.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🏆</div>
                      <div className="matches-empty-text">Sin ligas</div>
                    </div>
                  ) : (
                    leagues.map((league) => (
                      <LeagueCard
                        key={league.id}
                        league={league}
                        userPrediction={league.league_predictions?.find((p) => p.user_id === currentUser?.id)}
                        onPredict={handleMakeLeaguePrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ══════════ PREMIOS ══════════ */}
            {activeTab === 'awards' && (
              <div className="matches-section-premium">
                <div className="matches-header-premium">
                  <div className="matches-badge">
                    <Trophy size={14} />
                    <span className="matches-badge-count">{activeAwards.length}</span>
                    <span className="matches-badge-text"> disponibles</span>
                  </div>
                </div>

                <div className="matches-container">
                  {awards.length === 0 ? (
                    <div className="matches-empty-state">
                      <div className="matches-empty-icon">🥇</div>
                      <div className="matches-empty-text">Sin premios</div>
                    </div>
                  ) : (
                    awards.map((award) => (
                      <AwardCard
                        key={award.id}
                        award={award}
                        userPrediction={award.award_predictions?.find((p) => p.user_id === currentUser?.id)}
                        onPredict={handleMakeAwardPrediction}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

          </section>
        </main>
        <Footer />

        {isLoading && <LoadingOverlay message="Procesando..." />}
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </div>
    </>
  );
}