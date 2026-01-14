// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Trophy, TrendingUp, Target, Flame, 
  Star, Award, Edit2, Save, X, ArrowLeft, Activity, Percent,
  CheckCircle2, XCircle, Clock, Medal, Globe, Heart, Zap,
  Crown, Shield, Rocket, Sparkles, BarChart3,
  Gamepad2, Users, MapPin, Map, Flag, Layers, BadgeCheck, Gem,
  CheckCircle, TrendingDown, ChevronRight, Grid3x3, List
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';
import AdminAchievementsModal from '../components/adminComponents/AdminAchievementsModal';
import AdminTitlesModal from '../components/adminComponents/AdminTitlesModal';
import { ToastContainer, useToast } from '../components/Toast';
import Footer from '../components/Footer';
import '../styles/pagesStyles/ProfilePage.css';

export default function ProfilePage({ currentUser, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const toast = useToast();
  
  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    favorite_team: currentUser?.favorite_team || '',
    favorite_player: currentUser?.favorite_player || '',
    gender: currentUser?.gender || '',
    nationality: currentUser?.nationality || '',
    avatar_url: currentUser?.avatar_url || null,
    level: currentUser?.level || 1,
    joined_date: currentUser?.created_at || new Date().toISOString(),
    monthly_championships: currentUser?.monthly_championships || 0 // Nuevo
  });
  
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    best_streak: 0,
    last_prediction_date: null
  });

  const [userAchievements, setUserAchievements] = useState([]);
  const [userTitles, setUserTitles] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [availableTitles, setAvailableTitles] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [showAdminAchievementsModal, setShowAdminAchievementsModal] = useState(false);
  const [showAdminTitlesModal, setShowAdminTitlesModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [userRanking, setUserRanking] = useState({
    position: 0,
    totalUsers: 0,
    pointsToNext: 0,
    pointsToLeader: 0,
    pointsFromPrev: 0
  });

  const [crownHistory, setCrownHistory] = useState([]); // Nuevo: historial de coronas para el usuario

  const profileTabs = [
    { id: 'overview', label: 'Resumen', icon: Grid3x3 },
    { id: 'achievements', label: 'Logros', icon: Trophy },
    { id: 'history', label: 'Historial', icon: List },
    { id: 'edit', label: 'Editar', icon: Edit2 }
  ];

  useEffect(() => {
    loadUserData();
    loadPredictionHistory();
    calculateStreaks();
    loadCrownHistory(); // Nuevo
  }, [currentUser]);

  useEffect(() => {
    const loadAchievementsAndTitles = async () => {
      if (!currentUser) return;
      
      try {
        setAchievementsLoading(true);
        
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('available_achievements')
          .select('*')
          .order('requirement_value', { ascending: true });

        if (achievementsError) throw achievementsError;
        setAvailableAchievements(achievementsData || []);

        const { data: titlesData, error: titlesError } = await supabase
          .from('available_titles')
          .select('*');

        if (titlesError) throw titlesError;
        setAvailableTitles(titlesData || []);

        const calculatedAchievements = calculateAchievements(
          achievementsData || [],
          {
            points: currentUser?.points || 0,
            predictions: currentUser?.predictions || 0,
            correct: currentUser?.correct || 0,
            current_streak: streakData.current_streak
          }
        );
        setUserAchievements(calculatedAchievements);

        const calculatedTitles = calculateTitles(
          titlesData || [],
          calculatedAchievements
        );
        setUserTitles(calculatedTitles);

      } catch (err) {
        console.error('Error loading achievements:', err);
      } finally {
        setAchievementsLoading(false);
      }
    };

    if (currentUser) {
      loadAchievementsAndTitles();
    }
  }, [currentUser, streakData]);

  useEffect(() => {
    const loadUserRanking = async () => {
      try {
        const { data: allUsers, error } = await supabase
          .from('users')
          .select('id, points')
          .order('points', { ascending: false });

        if (error) throw error;
        if (!allUsers || allUsers.length === 0) return;

        const userIndex = allUsers.findIndex(user => user.id === currentUser?.id);
        const userPosition = userIndex !== -1 ? userIndex + 1 : 0;

        const leaderPoints = allUsers[0]?.points || 0;
        const userPoints = currentUser?.points || 0;
        const nextUser = userIndex > 0 ? allUsers[userIndex - 1] : null;
        const prevUser = userIndex < allUsers.length - 1 ? allUsers[userIndex + 1] : null;

        setUserRanking({
          position: userPosition,
          totalUsers: allUsers.length,
          pointsToLeader: leaderPoints - userPoints,
          pointsToNext: nextUser ? userPoints - nextUser.points : 0,
          pointsFromPrev: prevUser ? prevUser.points - userPoints : 0
        });

      } catch (err) {
        console.error('Error loading ranking:', err);
      }
    };

    if (currentUser?.id) {
      loadUserRanking();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setUserData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          favorite_team: data.favorite_team || '',
          favorite_player: data.favorite_player || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          avatar_url: data.avatar_url || null,
          level: data.level || 1,
          joined_date: data.created_at,
          monthly_championships: data.monthly_championships || 0 // Nuevo
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadCrownHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_championship_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      setCrownHistory(data || []);
    } catch (err) {
      console.error('Error loading crown history:', err);
    }
  };

  const loadPredictionHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            id,
            league,
            home_team,
            away_team,
            home_team_logo,
            away_team_logo,
            result_home,
            result_away,
            status,
            date,
            time
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictionHistory(data || []);
    } catch (err) {
      console.error('Error loading prediction history:', err);
      toast.error('Error al cargar el historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  const calculateStreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            result_home,
            result_away,
            status,
            date
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('matches.status', 'finished')
        .order('matches.date', { ascending: false });

      if (error) throw error;

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      const finishedPredictions = data
        .filter(p => p.matches?.status === 'finished')
        .sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));

      finishedPredictions.forEach((pred, index) => {
        const match = pred.matches;
        const isCorrect = checkPredictionCorrect(pred, match);

        if (isCorrect) {
          tempStreak++;
          if (index === 0) currentStreak = tempStreak;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
          if (index === 0) currentStreak = 0;
        }
      });

      setStreakData({ 
        current_streak: currentStreak, 
        best_streak: bestStreak,
        last_prediction_date: finishedPredictions[0]?.matches?.date || null
      });

    } catch (err) {
      console.error('Error calculating streaks:', err);
    }
  };

  const checkPredictionCorrect = (prediction, match) => {
    if (match.result_home === null || match.result_away === null) return false;
    
    const predDiff = Math.sign(prediction.home_score - prediction.away_score);
    const resultDiff = Math.sign(match.result_home - match.result_away);
    
    return predDiff === resultDiff || 
           (prediction.home_score === match.result_home && prediction.away_score === match.result_away);
  };

  const calculateAchievements = (availableAchievements, userStats) => {
    if (!availableAchievements || !userStats) return [];

    return availableAchievements.filter(achievement => {
      switch (achievement.requirement_type) {
        case 'points':
          return userStats.points >= achievement.requirement_value;
        case 'predictions':
          return userStats.predictions >= achievement.requirement_value;
        case 'correct':
          return userStats.correct >= achievement.requirement_value;
        case 'streak':
          return userStats.current_streak >= achievement.requirement_value;
        default:
          return false;
      }
    });
  };

  const calculateTitles = (availableTitles, userAchievements) => {
    if (!availableTitles || !userAchievements) return [];
    
    return availableTitles.filter(title => {
      const requiredAchievementId = title.requirement_achievement_id;
      return userAchievements.some(achievement => achievement.id === requiredAchievementId);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          bio: userData.bio,
          favorite_team: userData.favorite_team,
          favorite_player: userData.favorite_player,
          gender: userData.gender,
          nationality: userData.nationality
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      toast.success('✅ Perfil actualizado correctamente', 3000);
      setActiveTab('overview');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('❌ Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl) => {
    setUserData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
    await loadUserData();
  };

  const handleSaveAchievement = async (achievement) => {
    try {
      if (achievement.id) {
        const { error } = await supabase
          .from('available_achievements')
          .update(achievement)
          .eq('id', achievement.id);
        if (error) throw error;
        toast.success('Logro actualizado');
      } else {
        const { error } = await supabase
          .from('available_achievements')
          .insert(achievement);
        if (error) throw error;
        toast.success('Logro creado');
      }
      // Recargar datos
      const { data } = await supabase
        .from('available_achievements')
        .select('*');
      setAvailableAchievements(data || []);
    } catch (err) {
      console.error('Error saving achievement:', err);
      toast.error('Error al guardar logro');
    }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Logro eliminado');
      const { data } = await supabase
        .from('available_achievements')
        .select('*');
      setAvailableAchievements(data || []);
    } catch (err) {
      console.error('Error deleting achievement:', err);
      toast.error('Error al eliminar logro');
    }
  };

  const handleSaveTitle = async (title) => {
    try {
      if (title.id) {
        const { error } = await supabase
          .from('available_titles')
          .update(title)
          .eq('id', title.id);
        if (error) throw error;
        toast.success('Título actualizado');
      } else {
        const { error } = await supabase
          .from('available_titles')
          .insert(title);
        if (error) throw error;
        toast.success('Título creado');
      }
      // Recargar datos
      const { data } = await supabase
        .from('available_titles')
        .select('*');
      setAvailableTitles(data || []);
    } catch (err) {
      console.error('Error saving title:', err);
      toast.error('Error al guardar título');
    }
  };

  const handleDeleteTitle = async (id) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Título eliminado');
      const { data } = await supabase
        .from('available_titles')
        .select('*');
      setAvailableTitles(data || []);
    } catch (err) {
      console.error('Error deleting title:', err);
      toast.error('Error al eliminar título');
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Inicio': return '#8B5CF6';
      case 'Progreso': return '#3B82F6';
      case 'Precisión': return '#10B981';
      case 'Racha': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const getIconEmoji = (iconText) => {
    const emojiMap = {
      '🎯': '🎯',
      '🌟': '🌟',
      '⭐': '⭐',
      '✨': '✨',
      '💫': '💫',
      '🎪': '🎪',
      '🎭': '🎭',
      '🎨': '🎨',
      '🔥': '🔥',
      '🌋': '🌋',
      '☄️': '☄️'
    };
    return emojiMap[iconText] || '';
  };

  const accuracy = currentUser?.predictions > 0 
    ? Math.round((currentUser.correct / currentUser.predictions) * 100)
    : 0;

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="tab-content-wrapper">
            {/* Coronas Premium - Nueva sección */}
            <div className="crowns-section">
              <div className="section-header-modern">
                <Crown size={24} className="section-icon" />
                <h3 className="section-title-modern">Coronas Mensuales</h3>
                <div className="section-badge">{userData.monthly_championships}</div>
              </div>
              
              <div className="crowns-card">
                <div className="crowns-display">
                  {Array.from({ length: userData.monthly_championships }).map((_, index) => (
                    <Crown key={index} size={32} className="crown-icon" />
                  ))}
                  {userData.monthly_championships === 0 && (
                    <p className="no-crowns">Aún no has ganado coronas mensuales</p>
                  )}
                </div>
                
                {crownHistory.length > 0 && (
                  <div className="crowns-history">
                    <h4>Historial de Coronas</h4>
                    <div className="history-list">
                      {crownHistory.map((crown) => (
                        <div key={crown.id} className="history-item">
                          <div className="history-date">{crown.month_year}</div>
                          <div className="history-points">{crown.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Generales */}
            <div className="stats-grid-modern">
              <div className="stat-card-modern primary">
                <div className="stat-card-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-label">Puntos Totales</div>
                  <div className="stat-card-value">{currentUser?.points || 0}</div>
                </div>
              </div>

              <div className="stat-card-modern success">
                <div className="stat-card-icon">
                  <Target size={24} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-label">Precisión</div>
                  <div className="stat-card-value">{accuracy}%</div>
                </div>
              </div>

              <div className="stat-card-modern warning">
                <div className="stat-card-icon">
                  <Flame size={24} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-label">Racha Actual</div>
                  <div className="stat-card-value">{streakData.current_streak}</div>
                </div>
              </div>

              <div className="stat-card-modern accent">
                <div className="stat-card-icon">
                  <Trophy size={24} />
                </div>
                <div className="stat-card-content">
                  <div className="stat-card-label">Ranking</div>
                  <div className="stat-card-value">#{userRanking.position}</div>
                </div>
              </div>
            </div>

            {/* Nivel y Progreso */}
            <div className="level-card-modern">
              <div className="level-header-modern">
                <div className="level-title-section">
                  <Shield size={24} />
                  <div>
                    <h3>Nivel {userData.level}</h3>
                    <p>Progreso al siguiente nivel</p>
                  </div>
                </div>
                <div className="level-points">
                  <span className="current-points">{currentUser.points % 20} pts</span>
                  <span className="next-level-points">Siguiente: {20 - (currentUser.points % 20)} pts</span>
                </div>
              </div>
              
              <div className="progress-container-modern">
                <div className="progress-bar-modern">
                  <div 
                    className="progress-fill-modern"
                    style={{ width: `${(currentUser.points % 20 / 20) * 100}%` }}
                  >
                    <div className="progress-glow-modern"></div>
                  </div>
                </div>
                <div className="progress-label-modern">
                  <span>{currentUser.points % 20}/20 puntos</span>
                  <span>{20 - (currentUser.points % 20)} pts restantes</span>
                </div>
              </div>
            </div>

            {/* Rachas */}
            <div className="streaks-section-modern">
              <div className="streak-card current">
                <div className="streak-icon">
                  <Flame size={32} />
                </div>
                <div className="streak-info">
                  <div className="streak-label">Racha Actual</div>
                  <div className="streak-value">{streakData.current_streak}</div>
                </div>
                {streakData.current_streak > 0 && (
                  <div className="streak-badge">
                    <Sparkles size={16} />
                    <span>Activa</span>
                  </div>
                )}
              </div>

              <div className="streak-card best">
                <div className="streak-icon">
                  <Rocket size={32} />
                </div>
                <div className="streak-info">
                  <div className="streak-label">Mejor Racha</div>
                  <div className="streak-value">{streakData.best_streak}</div>
                </div>
              </div>
            </div>

            {/* Títulos */}
            <div className="titles-section-modern">
              <div className="section-header-modern">
                <Gem size={24} className="section-icon" />
                <h3 className="section-title-modern">Títulos Desbloqueados</h3>
                <div className="section-badge">{userTitles.length}</div>
              </div>

              {userTitles.length === 0 ? (
                <div className="empty-state-modern">
                  <Layers size={48} />
                  <p>Aún no has desbloqueado títulos</p>
                </div>
              ) : (
                <div className="titles-grid-modern">
                  {userTitles.map((title) => (
                    <div 
                      key={title.id} 
                      className="title-card-modern"
                      style={{ borderColor: title.color }}
                    >
                      <div className="title-icon" style={{ color: title.color }}>
                        <BadgeCheck size={24} />
                      </div>
                      <div className="title-info">
                        <h4 style={{ color: title.color }}>{title.name}</h4>
                        <p>{title.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="tab-content-wrapper">
            <div className="section-header-modern">
              <Award size={24} className="section-icon" />
              <h3 className="section-title-modern">Logros Desbloqueados</h3>
              <div className="section-badge">{userAchievements.length}</div>
            </div>

            {achievementsLoading ? (
              <div className="loading-state-modern">
                <Activity size={32} className="spinner" />
                <p>Cargando logros...</p>
              </div>
            ) : userAchievements.length === 0 ? (
              <div className="empty-state-modern">
                <Star size={48} />
                <p>Aún no has desbloqueado logros</p>
              </div>
            ) : (
              <div className="achievements-grid-modern">
                {userAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="achievement-card-modern"
                    style={{ 
                      borderColor: getCategoryColor(achievement.category),
                      background: `linear-gradient(135deg, ${getCategoryColor(achievement.category)}10, transparent)`
                    }}
                  >
                    <div className="achievement-emoji">{getIconEmoji(achievement.icon)}</div>
                    <div className="achievement-info">
                      <h4>{achievement.name}</h4>
                      <p>{achievement.description}</p>
                      <div className="achievement-meta">
                        <span 
                          className="category-badge" 
                          style={{ background: `${getCategoryColor(achievement.category)}20`, color: getCategoryColor(achievement.category) }}
                        >
                          {achievement.category}
                        </span>
                        <span className="requirement">
                          {achievement.requirement_value} {achievement.requirement_type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="tab-content-wrapper">
            <div className="section-header-modern">
              <Clock size={24} className="section-icon" />
              <h3 className="section-title-modern">Historial de Predicciones</h3>
              <div className="section-badge">{predictionHistory.length}</div>
            </div>

            {historyLoading ? (
              <div className="loading-state-modern">
                <Activity size={32} className="spinner" />
                <p>Cargando historial...</p>
              </div>
            ) : predictionHistory.length === 0 ? (
              <div className="empty-state-modern">
                <Calendar size={48} />
                <p>No hay predicciones en el historial</p>
              </div>
            ) : (
              <div className="history-list-modern">
                {predictionHistory.map((pred) => {
                  const match = pred.matches;
                  const isFinished = match?.status === 'finished';
                  const isCorrect = isFinished ? checkPredictionCorrect(pred, match) : null;

                  return (
                    <div key={pred.id} className="history-card-modern">
                      <div className="history-header">
                        <span className="history-league">{match.league}</span>
                        <span className="history-date">
                          {new Date(match.date).toLocaleDateString()} {match.time}
                        </span>
                      </div>

                      <div className="history-match">
                        <div className="team home">
                          <img src={match.home_team_logo} alt={match.home_team} className="team-logo" />
                          <span>{match.home_team}</span>
                        </div>

                        <div className="score-section">
                          {isFinished ? (
                            <div className="actual-score">
                              <span className="score">{match.result_home} - {match.result_away}</span>
                              <span className="label">Resultado</span>
                            </div>
                          ) : (
                            <div className="pending-score">
                              <Clock size={16} />
                              <span>Pendiente</span>
                            </div>
                          )}

                          <div className="prediction-score">
                            <span className="score">{pred.home_score} - {pred.away_score}</span>
                            <span className="label">Tu Predicción</span>
                          </div>
                        </div>

                        <div className="team away">
                          <span>{match.away_team}</span>
                          <img src={match.away_team_logo} alt={match.away_team} className="team-logo" />
                        </div>
                      </div>

                      <div className="history-status">
                        {isFinished ? (
                          isCorrect ? (
                            <div className="status success">
                              <CheckCircle2 size={16} />
                              <span>Correcta (+{pred.points_earned || 3} pts)</span>
                            </div>
                          ) : (
                            <div className="status error">
                              <XCircle size={16} />
                              <span>Incorrecta</span>
                            </div>
                          )
                        ) : (
                          <div className="status pending">
                            <Clock size={16} />
                            <span>En curso</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'edit':
        return (
          <div className="tab-content-wrapper">
            <div className="edit-profile-form">
              {/* Avatar Upload */}
              <div className="avatar-upload-horizontal-group">
                <div className="avatar-preview-wrapper">
                  {userData.avatar_url ? (
                    <img src={userData.avatar_url} alt={userData.name} className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder-preview">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="level-badge-floating">
                    <Crown size={14} />
                    <span>{userData.level}</span>
                  </div>
                </div>

                <div className="avatar-actions-side">
                  <AvatarUpload 
                    currentUser={currentUser} 
                    onAvatarUpdate={handleAvatarUpdate} 
                  />
                  <button 
                    className="avatar-btn remove"
                    onClick={async () => {
                      try {
                        await supabase
                          .from('users')
                          .update({ avatar_url: null })
                          .eq('id', currentUser.id);
                        handleAvatarUpdate(null);
                        toast.success('Avatar eliminado');
                      } catch (err) {
                        toast.error('Error al eliminar avatar');
                      }
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <User size={16} />
                  <span>Nombre</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <Trophy size={16} />
                  <span>Equipo Favorito</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.favorite_team}
                  onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
                  placeholder="Ej: Real Madrid"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <Heart size={16} />
                  <span>Jugador Favorito</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.favorite_player}
                  onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
                  placeholder="Ej: Lionel Messi"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <User size={16} />
                  <span>Género</span>
                </label>
                <select
                  className="form-select-modern"
                  value={userData.gender}
                  onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <Flag size={16} />
                  <span>Nacionalidad</span>
                </label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={userData.nationality}
                  onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
                  placeholder="Ej: Colombia"
                />
              </div>

              <div className="form-group-modern full-width">
                <label className="form-label-modern">
                  <Star size={16} />
                  <span>Biografía</span>
                </label>
                <textarea
                  className="form-textarea-modern"
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>

              <div className="form-actions-modern">
                <button 
                  className="save-button-modern"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Activity size={16} className="spinner" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
                <button 
                  className="cancel-button-modern"
                  onClick={() => {
                    loadUserData();
                    setActiveTab('overview');
                  }}
                >
                  <X size={16} />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page-modern">
      <div className="profile-container-modern">
        {/* Avatar y Info Principal */}
        <div className="profile-hero">
          <div className="avatar-section">
            <div className="avatar-circle">
              {userData.avatar_url ? (
                <img src={userData.avatar_url} alt={userData.name} />
              ) : (
                <div className="avatar-placeholder-modern">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="level-badge-modern">
              <Crown size={12} />
              <span>{userData.level}</span>
            </div>
          </div>

          <div className="user-info-section">
            <h2 className="user-name-display">{userData.name}</h2>
            <p className="user-email-display">{userData.email}</p>
            {userData.bio && <p className="user-bio-display">{userData.bio}</p>}
            
            {(userData.favorite_team || userData.favorite_player || userData.nationality) && (
              <div className="user-tags">
                {userData.favorite_team && (
                  <span className="user-tag">
                    <Trophy size={12} /> {userData.favorite_team}
                  </span>
                )}
                {userData.favorite_player && (
                  <span className="user-tag">
                    <Heart size={12} /> {userData.favorite_player}
                  </span>
                )}
                {userData.nationality && (
                  <span className="user-tag">
                    <Globe size={12} /> {userData.nationality}
                  </span>
                )}
              </div>
            )}

            {/* Stats Mini */}
            <div className="stats-mini-row">
              <div className="stat-mini">
                <div className="stat-mini-value">{currentUser?.predictions || 0}</div>
                <div className="stat-mini-label">Predicts</div>
              </div>
              <div className="stat-mini-divider"></div>
              <div className="stat-mini">
                <div className="stat-mini-value">{currentUser?.points || 0}</div>
                <div className="stat-mini-label">Puntos</div>
              </div>
              <div className="stat-mini-divider"></div>
              <div className="stat-mini">
                <div className="stat-mini-value">{accuracy}%</div>
                <div className="stat-mini-label">Precisión</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Minimalistas */}
        <div className="profile-tabs-modern">
          {profileTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-btn-modern ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="profile-content-area">
          {renderTabContent()}
        </div>
      </div>

      <Footer />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {showAdminAchievementsModal && (
        <AdminAchievementsModal
          onClose={() => {
            setShowAdminAchievementsModal(false);
            setEditingAchievement(null);
          }}
          onSave={handleSaveAchievement}
          onDelete={handleDeleteAchievement}
          existingAchievement={editingAchievement}
        />
      )}

      {showAdminTitlesModal && (
        <AdminTitlesModal
          onClose={() => {
            setShowAdminTitlesModal(false);
            setEditingTitle(null);
          }}
          onSave={handleSaveTitle}
          onDelete={handleDeleteTitle}
          existingTitle={editingTitle}
        />
      )}
    </div>
  );
}