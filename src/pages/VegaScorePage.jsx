import React, { useEffect, useState } from "react";
import { Trophy, TrendingUp, Target, Percent, Plus, CheckCircle, Shield, Settings, Zap } from "lucide-react";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import RankingSidebar from "../components/RankingSidebar";
import NavigationTabs from "../components/NavigationTabs";
import AdminModal from "../components/AdminModal";
import AdminLeagueModal from "../components/AdminLeagueModal";
import FinishLeagueModal from "../components/FinishLeagueModal";
import ProfilePage from "./ProfilePage";
import { PageLoader, MatchListSkeleton, StatCardSkeleton, LoadingOverlay } from "../components/LoadingStates";
import { ToastContainer, useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";
import "../styles/VegaScorePage.css";
import "../styles/AdminPanel.css";

export default function VegaScorePage() {
  const [matches, setMatches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminLeagueModal, setShowAdminLeagueModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [leagueToFinish, setLeagueToFinish] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' o 'leagues'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  // --- CARGA INICIAL DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ Obtener usuario autenticado
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!authUser?.user) {
          window.location.href = "/";
          return;
        }

        console.log("Auth User ID:", authUser.user.id);

        // 2️⃣ Perfil del usuario autenticado
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authUser.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error al cargar perfil:", profileError);
          toast.error("Error al cargar tu perfil");
          return;
        }

        // Si no existe el perfil, crearlo automáticamente
        if (!profile) {
          console.log("Perfil no encontrado, creando uno nuevo...");
          
          const { data: newProfile, error: createError } = await supabase
            .from("users")
            .insert({
              auth_id: authUser.user.id,
              name: authUser.user.email?.split('@')[0] || "Usuario",
              email: authUser.user.email,
              points: 0,
              predictions: 0,
              correct: 0
            })
            .select()
            .single();

          if (createError) {
            console.error("Error al crear perfil:", createError);
            toast.error("No se pudo crear tu perfil");
            return;
          }

          console.log("Perfil creado:", newProfile);
          setCurrentUser(newProfile);
          toast.success("¡Bienvenido! Tu perfil ha sido creado");
        } else {
          console.log("Perfil encontrado:", profile);
          setCurrentUser(profile);
        }

        // 3️⃣ Listado de todos los usuarios
        const { data: userList } = await supabase
          .from("users")
          .select("*")
          .order("points", { ascending: false });
        setUsers(userList || []);

        // 4️⃣ Cargar partidos con sus predicciones
        const { data: matchList } = await supabase
          .from("matches")
          .select("*, predictions(*)");
        setMatches(matchList || []);

        // 5️⃣ Cargar ligas con sus predicciones
        const { data: leagueList } = await supabase
          .from("leagues")
          .select("*, league_predictions(*)");
        setLeagues(leagueList || []);

      } catch (err) {
        console.error("Error en loadData:", err);
        toast.error(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- FUNCIONES DE PARTIDOS ---
  const makePrediction = async (matchId, homeScore, awayScore) => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from("predictions").upsert({
        match_id: matchId,
        user_id: currentUser.id,
        home_score: homeScore,
        away_score: awayScore,
      }, {
        onConflict: 'match_id,user_id'
      });

      if (error) throw error;

      const { data: matchList } = await supabase
        .from("matches")
        .select("*, predictions(*)");
      setMatches(matchList);

      toast.success("¡Predicción guardada exitosamente! 🎯");
    } catch (err) {
      console.error("Error al guardar predicción:", err);
      toast.error(`Error al guardar: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const addMatch = async (match) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("matches").insert(match);
      if (error) throw error;

      const { data } = await supabase.from("matches").select("*, predictions(*)");
      setMatches(data);
      toast.success("¡Partido agregado correctamente! ⚽");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const setMatchResult = async (matchId, homeScore, awayScore) => {
    setActionLoading(true);
    try {
      console.log(`🎯 Finalizando partido ${matchId}: ${homeScore}-${awayScore}`);

      // 1️⃣ Actualizar el resultado del partido
      const { error: updateError } = await supabase
        .from("matches")
        .update({ 
          result_home: homeScore, 
          result_away: awayScore, 
          status: "finished" 
        })
        .eq("id", matchId);

      if (updateError) throw updateError;

      // 2️⃣ Obtener el partido actualizado con todas sus predicciones
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*, predictions(*)")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      console.log(`📊 Partido encontrado con ${match.predictions.length} predicciones`);

      // 3️⃣ Calcular puntos para cada predicción
      const resultDiff = Math.sign(homeScore - awayScore);
      let exactPredictions = 0;
      let correctResults = 0;

      for (const prediction of match.predictions) {
        const predDiff = Math.sign(prediction.home_score - prediction.away_score);
        let pointsEarned = 0;

        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
          exactPredictions++;
          console.log(`✅ Usuario ${prediction.user_id}: Resultado exacto (+5 pts)`);
        } else if (resultDiff === predDiff) {
          pointsEarned = 3;
          correctResults++;
          console.log(`✅ Usuario ${prediction.user_id}: Acertó resultado (+3 pts)`);
        } else {
          console.log(`❌ Usuario ${prediction.user_id}: No acertó (0 pts)`);
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points, predictions, correct")
          .eq("id", prediction.user_id)
          .single();

        if (userError) {
          console.error(`Error al obtener usuario ${prediction.user_id}:`, userError);
          continue;
        }

        const newPoints = (userData.points || 0) + pointsEarned;
        const newPredictions = (userData.predictions || 0) + 1;
        const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

        const { error: updateUserError } = await supabase
          .from("users")
          .update({
            points: newPoints,
            predictions: newPredictions,
            correct: newCorrect
          })
          .eq("id", prediction.user_id);

        if (updateUserError) {
          console.error(`Error al actualizar usuario ${prediction.user_id}:`, updateUserError);
        }
      }

      // 4️⃣ Recargar datos
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedMatches } = await supabase
        .from("matches")
        .select("*, predictions(*)");

      setUsers(updatedUsers || []);
      setMatches(updatedMatches || []);
      
      const updatedCurrentUser = updatedUsers?.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
      }

      console.log("✅ Partido finalizado");
      
      if (exactPredictions > 0 || correctResults > 0) {
        toast.success(`¡Partido finalizado! ${exactPredictions} exactas, ${correctResults} acertadas 🎉`);
      } else {
        toast.info("Partido finalizado. No hubo predicciones correctas.");
      }

    } catch (err) {
      console.error("Error al finalizar partido:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // --- FUNCIONES DE LIGAS ---
  const makeLeaguePrediction = async (leagueId, champion, topScorer, topAssist, mvp) => {
    if (!currentUser) return;

    setActionLoading(true);
    try {
      const { error } = await supabase.from("league_predictions").upsert({
        league_id: leagueId,
        user_id: currentUser.id,
        predicted_champion: champion,
        predicted_top_scorer: topScorer,
        predicted_top_assist: topAssist,
        predicted_mvp: mvp,
      }, {
        onConflict: 'league_id,user_id'
      });

      if (error) throw error;

      const { data: leagueList } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)");
      setLeagues(leagueList);

      toast.success("¡Predicción de liga guardada exitosamente! 🏆");
    } catch (err) {
      console.error("Error al guardar predicción de liga:", err);
      toast.error(`Error al guardar: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const addLeague = async (league) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from("leagues").insert(league);
      if (error) throw error;

      const { data } = await supabase.from("leagues").select("*, league_predictions(*)");
      setLeagues(data);
      toast.success("¡Liga agregada correctamente! 🏆");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const finishLeague = async (leagueId, results) => {
    setActionLoading(true);
    try {
      console.log(`🏆 Finalizando liga ${leagueId}`);

      // 1️⃣ Actualizar la liga con los resultados
      const { error: updateError } = await supabase
        .from("leagues")
        .update({ 
          status: "finished",
          champion: results.champion,
          top_scorer: results.top_scorer,
          top_scorer_goals: results.top_scorer_goals,
          top_assist: results.top_assist,
          top_assist_count: results.top_assist_count,
          mvp_player: results.mvp_player
        })
        .eq("id", leagueId);

      if (updateError) throw updateError;

      // 2️⃣ Obtener la liga con todas sus predicciones
      const { data: league, error: leagueError } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)")
        .eq("id", leagueId)
        .single();

      if (leagueError) throw leagueError;

      console.log(`📊 Liga encontrada con ${league.league_predictions.length} predicciones`);

      // 3️⃣ Calcular puntos para cada predicción (5 puntos por cada predicción correcta)
      for (const prediction of league.league_predictions) {
        let pointsEarned = 0;

        // Verificar cada predicción
        if (prediction.predicted_champion?.toLowerCase() === results.champion.toLowerCase()) {
          pointsEarned += 5;
        }
        if (prediction.predicted_top_scorer?.toLowerCase() === results.top_scorer.toLowerCase()) {
          pointsEarned += 5;
        }
        if (prediction.predicted_top_assist?.toLowerCase() === results.top_assist.toLowerCase()) {
          pointsEarned += 5;
        }
        if (prediction.predicted_mvp?.toLowerCase() === results.mvp_player.toLowerCase()) {
          pointsEarned += 5;
        }

        console.log(`Usuario ${prediction.user_id}: ${pointsEarned} puntos`);

        // Actualizar points_earned en la predicción de liga
        const { error: updatePredError } = await supabase
          .from("league_predictions")
          .update({ points_earned: pointsEarned })
          .eq("id", prediction.id);

        if (updatePredError) {
          console.error(`Error al actualizar predicción:`, updatePredError);
        }

        // Actualizar puntos del usuario
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points")
          .eq("id", prediction.user_id)
          .single();

        if (userError) {
          console.error(`Error al obtener usuario ${prediction.user_id}:`, userError);
          continue;
        }

        const newPoints = (userData.points || 0) + pointsEarned;

        const { error: updateUserError } = await supabase
          .from("users")
          .update({ points: newPoints })
          .eq("id", prediction.user_id);

        if (updateUserError) {
          console.error(`Error al actualizar usuario:`, updateUserError);
        }
      }

      // 4️⃣ Recargar datos
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedLeagues } = await supabase
        .from("leagues")
        .select("*, league_predictions(*)");

      setUsers(updatedUsers || []);
      setLeagues(updatedLeagues || []);
      
      const updatedCurrentUser = updatedUsers?.find(u => u.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
      }

      toast.success("¡Liga finalizada! Puntos distribuidos 🏆");
      setShowFinishLeagueModal(false);
      setLeagueToFinish(null);

    } catch (err) {
      console.error("Error al finalizar liga:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDER ---
  if (loading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return (
      <div className="centered">
        <div>Error: No se pudo cargar el usuario</div>
      </div>
    );
  }

  // Mostrar perfil si está activo
  if (showProfile) {
    return (
      <>
        <ProfilePage 
          currentUser={currentUser} 
          onBack={() => {
            setShowProfile(false);
            const loadData = async () => {
              const { data: updatedUser } = await supabase
                .from("users")
                .select("*")
                .eq("id", currentUser.id)
                .single();
              if (updatedUser) setCurrentUser(updatedUser);
            };
            loadData();
          }}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    );
  }

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const pendingMatches = matches.filter((m) => m.status === "pending");
  const activeLeagues = leagues.filter((l) => l.status === "active");

  return (
    <>
      <div className="vega-root">
        <Header
          currentUser={currentUser}
          users={sortedUsers}
          onProfileClick={() => setShowProfile(true)}
        />

        <main className="container">
          {/* --- Stats --- */}
          <section className="stats-row">
            <div className="stat-card">
              <Trophy className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Posición</div>
              <div className="stat-value">
                #{sortedUsers.findIndex((u) => u.id === currentUser?.id) + 1}
              </div>
            </div>

            <div className="stat-card">
              <TrendingUp className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Puntos</div>
              <div className="stat-value">{currentUser?.points ?? 0}</div>
            </div>

            <div className="stat-card">
              <Target className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Aciertos</div>
              <div className="stat-value">
                {currentUser?.correct ?? 0}/{currentUser?.predictions ?? 0}
              </div>
            </div>

            <div className="stat-card">
              <Percent className="stat-icon" size={24} color="#ff8a00" />
              <div className="stat-label">Precisión</div>
              <div className="stat-value">
                {currentUser?.predictions > 0
                  ? Math.round((currentUser.correct / currentUser.predictions) * 100) + "%"
                  : "0%"}
              </div>
            </div>
          </section>

          {/* --- Main Grid --- */}
          <section className="main-grid">
            <div className="left-col">
              {/* Tabs de navegación */}
              <NavigationTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />

              {/* Contenido según tab activo */}
              {activeTab === 'matches' ? (
                <div className="matches-section-premium">
                  <div className="matches-header-premium">
                    <div className="matches-title-section">
                      <div className="matches-icon-wrapper">
                        <Trophy size={22} />
                      </div>
                      <div>
                        <h2 className="matches-title-premium">Próximos Partidos</h2>
                        <p className="matches-subtitle-premium">Haz tus predicciones y gana puntos</p>
                      </div>
                    </div>
                    <div className="matches-badge">
                      <Target size={14} />
                      <span>{pendingMatches.length} disponibles</span>
                    </div>
                  </div>

                  <div className="matches-container">
                    {pendingMatches.length === 0 ? (
                      <div className="matches-empty-state">
                        <div className="matches-empty-icon">⚽</div>
                        <div className="matches-empty-text">No hay partidos disponibles</div>
                        <div className="matches-empty-subtext">Los nuevos partidos aparecerán aquí</div>
                      </div>
                    ) : (
                      pendingMatches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          userPred={m.predictions?.find(
                            (p) => p.user_id === currentUser?.id
                          )}
                          onPredict={makePrediction}
                        />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="matches-section-premium">
                  <div className="matches-header-premium">
                    <div className="matches-title-section">
                      <div className="matches-icon-wrapper">
                        <Trophy size={22} />
                      </div>
                      <div>
                        <h2 className="matches-title-premium">Competiciones</h2>
                        <p className="matches-subtitle-premium">Predice campeones y goleadores</p>
                      </div>
                    </div>
                    <div className="matches-badge">
                      <Trophy size={14} />
                      <span>{activeLeagues.length} activas</span>
                    </div>
                  </div>

                  <div className="matches-container">
                    {leagues.length === 0 ? (
                      <div className="matches-empty-state">
                        <div className="matches-empty-icon">🏆</div>
                        <div className="matches-empty-text">No hay ligas disponibles</div>
                        <div className="matches-empty-subtext">Las nuevas ligas aparecerán aquí</div>
                      </div>
                    ) : (
                      leagues.map((league) => (
                        <LeagueCard
                          key={league.id}
                          league={league}
                          userPrediction={league.league_predictions?.find(
                            (p) => p.user_id === currentUser?.id
                          )}
                          onPredict={makeLeaguePrediction}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside className="right-col">
              <RankingSidebar users={sortedUsers} />
              
              {/* Panel de administración */}
              {currentUser?.is_admin && (
                <div className="admin-panel-premium">
                  <div className="admin-header">
                    <div className="admin-title-section">
                      <div className="admin-icon-wrapper">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h3 className="admin-title">Panel Admin</h3>
                        <p className="admin-subtitle">Gestión completa</p>
                      </div>
                    </div>
                    <div className="admin-badge-active">
                      <Zap size={14} />
                      <span>Activo</span>
                    </div>
                  </div>

                  <div className="admin-stats-grid">
                    <div className="admin-stat-item">
                      <div className="admin-stat-icon pending">
                        <Settings size={16} />
                      </div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Partidos</span>
                        <span className="admin-stat-value">
                          {matches.filter(m => m.status === 'pending').length}
                        </span>
                      </div>
                    </div>

                    <div className="admin-stat-item">
                      <div className="admin-stat-icon finished">
                        <CheckCircle size={16} />
                      </div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Ligas</span>
                        <span className="admin-stat-value">
                          {leagues.filter(l => l.status === 'active').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-actions">
                    <button 
                      className="admin-btn primary"
                      onClick={() => setShowAdminModal(true)}
                    >
                      <Plus size={18} />
                      <span>Agregar Partido</span>
                      <div className="btn-shine"></div>
                    </button>

                    <button 
                      className="admin-btn primary"
                      onClick={() => setShowAdminLeagueModal(true)}
                    >
                      <Plus size={18} />
                      <span>Agregar Liga</span>
                      <div className="btn-shine"></div>
                    </button>

                    <button
                      className="admin-btn secondary"
                      onClick={() => {
                        const id = prompt("ID del partido a finalizar:");
                        if (!id) return;
                        
                        const h = prompt("Goles equipo local:");
                        if (h === null) return;
                        
                        const a = prompt("Goles equipo visitante:");
                        if (a === null) return;
                        
                        const homeScore = parseInt(h);
                        const awayScore = parseInt(a);
                        
                        if (isNaN(homeScore) || isNaN(awayScore)) {
                          toast.warning("Por favor ingresa números válidos");
                          return;
                        }
                        
                        setMatchResult(id, homeScore, awayScore);
                      }}
                    >
                      <CheckCircle size={18} />
                      <span>Finalizar Partido</span>
                    </button>
                  </div>

                  <div className="admin-quick-matches">
                    <div className="admin-section-title">
                      <span>Ligas Activas</span>
                    </div>
                    {leagues.filter(l => l.status === 'active').slice(0, 3).map(league => (
                      <div key={league.id} className="admin-match-quick">
                        <div className="admin-match-info">
                          <span className="admin-match-teams">
                            {league.logo} {league.name}
                          </span>
                          <span className="admin-match-id">{league.season}</span>
                        </div>
                        <button
                          className="admin-quick-btn"
                          onClick={() => {
                            setLeagueToFinish(league);
                            setShowFinishLeagueModal(true);
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    ))}

                    {leagues.filter(l => l.status === 'active').length === 0 && (
                      <div className="admin-empty-state">
                        <span>No hay ligas activas</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </section>
        </main>

        {showAdminModal && (
          <AdminModal onAdd={addMatch} onClose={() => setShowAdminModal(false)} />
        )}

        {showAdminLeagueModal && (
          <AdminLeagueModal 
            onAdd={addLeague} 
            onClose={() => setShowAdminLeagueModal(false)} 
          />
        )}

        {showFinishLeagueModal && leagueToFinish && (
          <FinishLeagueModal 
            league={leagueToFinish}
            onFinish={finishLeague}
            onClose={() => {
              setShowFinishLeagueModal(false);
              setLeagueToFinish(null);
            }}
          />
        )}

        {actionLoading && <LoadingOverlay message="Procesando..." />}
      </div>
      
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}