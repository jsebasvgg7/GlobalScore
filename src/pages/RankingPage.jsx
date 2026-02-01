// src/pages/RankingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Target, TrendingUp, Calendar, Globe, Zap,
  ChevronRight, Users, BarChart3, Crown, Trophy, Star, Award
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Footer from '../components/Footer';
import UserProfileModal from '../components/UserProfileModal';
import '../styles/pagesStyles/RankingPage.css';

export default function RankingPage({ currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankingType, setRankingType] = useState('global'); // 'global', 'monthly', 'halloffame'
  const [sortBy, setSortBy] = useState('points');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [champions, setChampions] = useState([]);

  useEffect(() => {
    checkAndResetMonthly();
    loadUsers();
    loadTopChampions();
  }, []);

  const checkAndResetMonthly = async () => {
    try {
      const now = new Date();
      const currentDay = now.getDate();
      
      const { data: config, error: configError } = await supabase
        .from('app_config')
        .select('last_monthly_reset')
        .eq('id', 1)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Error al obtener config:', configError);
        return;
      }

      const lastReset = config?.last_monthly_reset 
        ? new Date(config.last_monthly_reset) 
        : new Date(0);
      
      const lastResetMonth = lastReset.getMonth();
      const currentMonth = now.getMonth();
      const lastResetYear = lastReset.getFullYear();
      const currentYear = now.getFullYear();
      
      const monthChanged = (currentMonth !== lastResetMonth) || (currentYear !== lastResetYear);
      
      if (monthChanged && currentDay === 1) {
        const { error: resetError } = await supabase.rpc('reset_all_monthly_stats');
        
        if (resetError) {
          console.error('❌ Error en reset:', resetError);
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error en checkAndResetMonthly:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ FUNCIÓN ACTUALIZADA - Obtiene puntos del campeonato y fecha
  const loadTopChampions = async () => {
    try {
      console.log('🔍 Cargando campeones desde monthly_championship_history...');
      
      // PASO 1: Obtener TODOS los registros de historial con detalles
      const { data: historyData, error: historyError } = await supabase
        .from('monthly_championship_history')
        .select('user_id, points, month_year, awarded_at')
        .order('awarded_at', { ascending: false });
      
      console.log('📊 Registros de historial raw:', historyData?.length || 0);
      
      if (historyError) {
        console.error('❌ Error al cargar historial:', historyError);
        throw historyError;
      }

      if (!historyData || historyData.length === 0) {
        console.log('⚠️ No hay coronas en el historial');
        setChampions([]);
        return;
      }

      // PASO 2: Agrupar por usuario y guardar todos sus campeonatos
      const championData = {};
      
      historyData.forEach(record => {
        const userId = record.user_id;
        if (!championData[userId]) {
          championData[userId] = {
            count: 0,
            championships: []
          };
        }
        championData[userId].count++;
        championData[userId].championships.push({
          points: record.points,
          monthYear: record.month_year,
          awardedAt: record.awarded_at
        });
      });
      
      console.log('📈 Datos de campeones:', championData);

      // PASO 3: Obtener IDs únicos de usuarios
      const userIds = Object.keys(championData);
      console.log('👥 User IDs únicos:', userIds);

      // PASO 4: Obtener datos completos de esos usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .in('id', userIds);

      console.log('👤 Usuarios encontrados:', usersData?.length || 0);

      if (usersError) {
        console.error('❌ Error al cargar usuarios:', usersError);
        throw usersError;
      }

      if (!usersData || usersData.length === 0) {
        console.warn('⚠️ No se encontraron usuarios para los IDs');
        setChampions([]);
        return;
      }

      // PASO 5: Combinar datos de usuarios con información de campeonatos
      const championsArray = usersData
        .map(user => {
          const userData = championData[user.id];
          // Obtener el campeonato más reciente
          const latestChampionship = userData.championships[0]; // Ya está ordenado por fecha desc
          
          return {
            id: user.id,
            name: user.name,
            avatar_url: user.avatar_url,
            monthly_championships: userData.count,
            // Info del campeonato más reciente
            championship_points: latestChampionship.points,
            championship_month_year: latestChampionship.monthYear,
            championship_awarded_at: latestChampionship.awardedAt,
            // Todos los campeonatos para referencia
            all_championships: userData.championships
          };
        })
        .sort((a, b) => {
          // Primero por número de coronas (descendente)
          if (b.monthly_championships !== a.monthly_championships) {
            return b.monthly_championships - a.monthly_championships;
          }
          // Luego por puntos del último campeonato (descendente)
          return b.championship_points - a.championship_points;
        })
        .slice(0, 10); // Top 10

      console.log('🏆 Champions finales:', championsArray.length);
      console.log('👑 Detalle completo:', championsArray);

      setChampions(championsArray);
    } catch (err) {
      console.error('❌ Error loading champions:', err);
      setChampions([]);
    }
  };

  const getRankingData = () => {
    if (rankingType === 'monthly') {
      return users.map(u => ({
        ...u,
        rankPoints: u.monthly_points || 0,
        rankCorrect: u.monthly_correct || 0,
        rankPredictions: u.monthly_predictions || 0
      }));
    } else {
      return users.map(u => ({
        ...u,
        rankPoints: u.points || 0,
        rankCorrect: u.correct || 0,
        rankPredictions: u.predictions || 0
      }));
    }
  };

  const rankingUsers = getRankingData();

  const globalStats = {
    totalUsers: rankingUsers.length,
    totalPredictions: rankingUsers.reduce((sum, u) => sum + (u.rankPredictions || 0), 0),
    totalPoints: rankingUsers.reduce((sum, u) => sum + (u.rankPoints || 0), 0),
    avgAccuracy: rankingUsers.length > 0 
      ? Math.round(rankingUsers.reduce((sum, u) => {
          const acc = u.rankPredictions > 0 ? (u.rankCorrect / u.rankPredictions) * 100 : 0;
          return sum + acc;
        }, 0) / rankingUsers.length)
      : 0
  };

  const sortedByPoints = [...rankingUsers].sort((a, b) => b.rankPoints - a.rankPoints);
  const currentUserPosition = sortedByPoints.findIndex(u => u.id === currentUser?.id) + 1;
  const currentUserData = rankingUsers.find(u => u.id === currentUser?.id);

  const getFilteredUsers = () => {
    let filtered = [...rankingUsers];

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'accuracy') {
      filtered.sort((a, b) => {
        const accA = a.rankPredictions > 0 ? (a.rankCorrect / a.rankPredictions) : 0;
        const accB = b.rankPredictions > 0 ? (b.rankCorrect / b.rankPredictions) : 0;
        return accB - accA;
      });
    } else if (sortBy === 'predictions') {
      filtered.sort((a, b) => b.rankPredictions - a.rankPredictions);
    } else {
      filtered.sort((a, b) => b.rankPoints - a.rankPoints);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  const getCurrentMonthLabel = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="ranking-page-loading">
        <div className="loader-container">
          <div className="spinner-premium"></div>
        </div>
        <p className="loading-text">Cargando ranking...</p>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <div className="ranking-page-container">

        {/* Tabs - Ahora con 3 opciones */}
        <div className="ranking-tabs">
          <button 
            className={`tab-button ${rankingType === 'global' ? 'active' : ''}`}
            onClick={() => setRankingType('global')}
          >
            <Globe size={18} />
            <span>Global</span>
          </button>
          <button 
            className={`tab-button ${rankingType === 'monthly' ? 'active' : ''}`}
            onClick={() => setRankingType('monthly')}
          >
            <Calendar size={18} />
            <span>Mensual</span>
          </button>
          <button 
            className={`tab-button ${rankingType === 'halloffame' ? 'active' : ''}`}
            onClick={() => setRankingType('halloffame')}
          >
            <Crown size={18} />
            <span>Campeones</span>
          </button>
        </div>

        {/* Contenido según la pestaña seleccionada */}
        {rankingType === 'halloffame' ? (
          // SECCIÓN HALL OF FAME - FORMATO LISTA
          <div className="hall-of-fame-section">
            <div className="hall-header">
              <div className="hall-title-group">
                <h2 className="hall-title">Salon de la Fama</h2>
                <p className="hall-subtitle">Leyendas con más coronas mensuales ganadas</p>
              </div>

              {champions.length > 0 ? (
                <div className="hall-items">
                  {champions.map((champion, index) => {
                    const position = index + 1;

                    return (
                      <div 
                        key={champion.id}
                        className="hall-item"
                      >
                        <div className="hall-item-position">
                          {position < 10 ? `0${position}` : position}
                        </div>
                        
                        <div 
                          className="hall-item-avatar"
                          onClick={() => setSelectedUserId(champion.id)}
                        >
                          {champion.avatar_url ? (
                            <img src={champion.avatar_url} alt={champion.name} />
                          ) : (
                            <span>{champion.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        
                        <div className="hall-item-info">
                          <div className="hall-item-name">{champion.name}</div>
                          <div className="hall-item-detail">
                            {champion.championship_month_year}
                          </div>
                        </div>
                        
                        <div className="hall-item-crowns">
                          <Crown size={16} />
                          <span>{champion.monthly_championships}</span>
                        </div>
                        
                        <div className="hall-item-points">
                          {champion.championship_points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="hall-empty">
                  <Crown size={64} className="hall-empty-icon" />
                  <p className="hall-empty-text">Aún no hay campeones mensuales</p>
                  <p className="hall-empty-subtitle">
                    Sé el primero en ganar una corona mensual
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // SECCIÓN DE RANKINGS (Global o Mensual)
          <>
            {/* Podio Top 3 */}
            {filteredUsers.length >= 3 && (
              <div className="podium-container">
                <h2 className="podium-title">
                  {rankingType === 'global' ? 'Campeones De Temporada' : 'Campeones Del Mes'}
                </h2>
                <div className="podium-winners">
                  {/* 2do Lugar */}
                  <div className="winner-card second">
                    <div className="position-badge">2</div>
                    <div 
                      className="winner-avatar"
                      onClick={() => setSelectedUserId(filteredUsers[1].id)}
                    >
                      {filteredUsers[1].avatar_url ? (
                        <img src={filteredUsers[1].avatar_url} alt={filteredUsers[1].name} />
                      ) : (
                        <span>{filteredUsers[1].name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="winner-name">{filteredUsers[1].name}</div>
                    <div className="winner-stats">
                      <div className="stat-row points">
                        {filteredUsers[1].rankPoints}
                      </div>
                      <div className="stat-row">
                        {filteredUsers[1].rankPredictions > 0 
                          ? Math.round((filteredUsers[1].rankCorrect / filteredUsers[1].rankPredictions) * 100) 
                          : 0}%
                      </div>
                    </div>
                  </div>

                  {/* 1er Lugar */}
                  <div className="winner-card first">
                    <div className="position-badge">1</div>
                    <div 
                      className="winner-avatar"
                      onClick={() => setSelectedUserId(filteredUsers[0].id)}
                    >
                      {filteredUsers[0].avatar_url ? (
                        <img src={filteredUsers[0].avatar_url} alt={filteredUsers[0].name} />
                      ) : (
                        <span>{filteredUsers[0].name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="winner-name">{filteredUsers[0].name}</div>
                    <div className="winner-stats">
                      <div className="stat-row points">
                        {filteredUsers[0].rankPoints}
                      </div>
                      <div className="stat-row">
                        {filteredUsers[0].rankPredictions > 0 
                          ? Math.round((filteredUsers[0].rankCorrect / filteredUsers[0].rankPredictions) * 100) 
                          : 0}%
                      </div>
                    </div>
                  </div>

                  {/* 3er Lugar */}
                  <div className="winner-card third">
                    <div className="position-badge">3</div>
                    <div 
                      className="winner-avatar"
                      onClick={() => setSelectedUserId(filteredUsers[2].id)}
                    >
                      {filteredUsers[2].avatar_url ? (
                        <img src={filteredUsers[2].avatar_url} alt={filteredUsers[2].name} />
                      ) : (
                        <span>{filteredUsers[2].name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="winner-name">{filteredUsers[2].name}</div>
                    <div className="winner-stats">
                      <div className="stat-row points">
                        {filteredUsers[2].rankPoints}
                      </div>
                      <div className="stat-row">
                        {filteredUsers[2].rankPredictions > 0 
                          ? Math.round((filteredUsers[2].rankCorrect / filteredUsers[2].rankPredictions) * 100) 
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ranking List */}
            <div className="ranking-list-section">
              <div className="list-header">
                <div className="sort-controls">
                  <button 
                    className={`sort-btn ${sortBy === 'points' ? 'active' : ''}`}
                    onClick={() => setSortBy('points')}
                  >
                    <Zap size={14} />
                    <span>Puntos</span>
                  </button>
                  <button 
                    className={`sort-btn ${sortBy === 'accuracy' ? 'active' : ''}`}
                    onClick={() => setSortBy('accuracy')}
                  >
                    <Target size={14} />
                    <span>Precisión</span>
                  </button>
                  <button 
                    className={`sort-btn ${sortBy === 'predictions' ? 'active' : ''}`}
                    onClick={() => setSortBy('predictions')}
                  >
                    <BarChart3 size={14} />
                    <span>Actividad</span>
                  </button>
                </div>
              </div>

              <div className="ranking-list">
                {filteredUsers.map((user, index) => {
                  const accuracy = user.rankPredictions > 0 
                    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) 
                    : 0;
                  const isCurrentUser = user.id === currentUser?.id;
                  const position = index + 1;
                  const isTop3 = position <= 3;

                  return (
                    <div 
                      key={user.id} 
                      className={`ranking-item ${isCurrentUser ? 'is-current' : ''} ${isTop3 ? 'top-3' : ''}`}
                    >
                      <div className="item-position">
                        {position < 10 ? `0${position}` : position}
                      </div>
                      <div 
                        className="item-avatar"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} />
                        ) : (
                          <span>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="item-info">
                        <div className="item-name">
                          {user.name}
                          {isCurrentUser && <span className="you-badge">Tú</span>}
                        </div>
                        <div className="item-correct">
                          {user.rankCorrect} aciertos
                        </div>
                      </div>
                      <div className="item-points">
                        {user.rankPoints} pts
                      </div>
                      <ChevronRight size={20} className="item-arrow" />
                    </div>
                  );
                })}
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">
                  <TrendingUp size={64} />
                </div>
                <p className="no-results-text">No se encontraron usuarios</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
      
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}