// src/components/UserProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Trophy, Target, Flame, Star, Award, Calendar, 
  TrendingUp, Crown, Shield, Sparkles, Zap, Users,
  Globe, Heart, Flag, Gem, Layers, Activity
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { LoadingDots } from './LoadingSpinner';
import '../styles/UserProfileModal.css';

export default function UserProfileModal({ userId, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    best_streak: 0
  });
  const [userAchievements, setUserAchievements] = useState([]);
  const [userTitles, setUserTitles] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]); 
  const [userRanking, setUserRanking] = useState({
    position: 0,
    totalUsers: 0
  });
  const [crownHistory, setCrownHistory] = useState([]);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUserData(user);

      const { data: allUsers } = await supabase
        .from('users')
        .select('id, points')
        .order('points', { ascending: false });

      if (allUsers) {
        const userIndex = allUsers.findIndex(u => u.id === userId);
        setUserRanking({
          position: userIndex + 1,
          totalUsers: allUsers.length
        });
      }

      const { data: predictions } = await supabase
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
        .eq('user_id', userId)
        .eq('matches.status', 'finished')
        .order('matches.date', { ascending: false });

      if (predictions) {
        calculateStreaks(predictions);
      }

      const { data: achievements } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achievements) {
        setAvailableAchievements(achievements); 
        const calculatedAchievements = calculateAchievements(achievements, {
          points: user.points || 0,
          predictions: user.predictions || 0,
          correct: user.correct || 0,
          current_streak: streakData.current_streak
        });
        setUserAchievements(calculatedAchievements);
      }

      const { data: titles } = await supabase
        .from('available_titles')
        .select('*');

      if (titles && achievements) {
        const calculatedTitles = calculateTitles(
          titles,
          calculateAchievements(achievements, {
            points: user.points || 0,
            predictions: user.predictions || 0,
            correct: user.correct || 0,
            current_streak: streakData.current_streak
          })
        );
        setUserTitles(calculatedTitles);
      }

      const { data: history } = await supabase
        .from('monthly_championship_history')
        .select('*')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (history) {
        setCrownHistory(history);
      }

    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreaks = (predictions) => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const finishedPredictions = predictions
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

    setStreakData({ current_streak: currentStreak, best_streak: bestStreak });
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

  const getActiveTitle = () => {
    if (userTitles.length === 0) return null;
    
    const sortedTitles = [...userTitles].sort((a, b) => {
      const achievementA = availableAchievements.find(ach => ach.id === a.requirement_achievement_id);
      const achievementB = availableAchievements.find(ach => ach.id === b.requirement_achievement_id);
      
      if (!achievementA) return 1;
      if (!achievementB) return -1;
      
      return (achievementB.requirement_value || 0) - (achievementA.requirement_value || 0);
    });
    
    return sortedTitles[0];
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
      '🎯': '🎯', '🌟': '🌟', '⭐': '⭐', '✨': '✨',
      '💫': '💫', '🎪': '🎪', '🎭': '🎭', '🎨': '🎨',
      '🔥': '🔥', '🌋': '🌋', '☄️': '☄️'
    };
    return emojiMap[iconText] || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="user-modal-overlay" onClick={onClose}>
        <div className="user-modal-container" onClick={e => e.stopPropagation()}>
          <div className="user-modal-header">
            <div className="user-modal-title-section">
              <Users size={20} />
              <h2>Cargando Perfil</h2>
            </div>
            <button className="user-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className="user-modal-body">
            <div className="loading-spinner">
              <div className="loading-content">
                <Users size={48} className="loading-icon" />
                <p className="loading-text">Cargando perfil</p>
                <LoadingDots />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const accuracy = userData.predictions > 0 
    ? Math.round((userData.correct / userData.predictions) * 100)
    : 0;

  const activeTitle = getActiveTitle();

  const currentPoints = userData.points || 0;
  const pointsInLevel = currentPoints % 20;
  const nextLevelPoints = 20;
  const levelProgress = (pointsInLevel / nextLevelPoints) * 100;

  const totalCrowns = userData.monthly_championships || 0;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal-container" onClick={e => e.stopPropagation()}>
        {/* ========== HEADER ========== */}
        <div className="user-modal-header">
          <div className="user-modal-title-section">
            <Users size={20} />
            <h2>{userData.name || 'Usuario'}</h2>
          </div>
          <button className="user-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="user-modal-body">
          {/* ========== 1. AVATAR Y NOMBRE ========== */}
          <div className="user-modal-avatar-section">
            <div className="user-modal-banner">
              <div className="banner-pattern"></div>
            </div>
            <div className="user-modal-avatar-wrapper">
              <div className="user-modal-avatar">
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt={userData.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {userData.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="user-modal-level-badge">
                <Shield size={14} />
                <span>{userData.level || 1}</span>
              </div>
            </div>
          </div>

          <div className="user-modal-name-section">
            <h3 className="user-modal-name">{userData.name || 'Usuario Anónimo'}</h3>
            {activeTitle && (
              <div className="user-modal-title-badge" style={{ color: activeTitle.color }}>
                <Gem size={14} />
                <span>{activeTitle.name}</span>
              </div>
            )}
          </div>
          
          {/* ========== 7. TÍTULO ACTIVO ========== */}
          {activeTitle && (
            <div className="user-modal-active-title">
              <div className="title-header">
                <Crown size={20} />
                <h4>Título Activo</h4>
                <div className="title-active-badge">
                  <Sparkles size={12} />
                  <span>Equipado</span>
                </div>
              </div>
              
              <div className="current-title-display" style={{ borderColor: activeTitle.color }}>
                <div className="title-icon-large" style={{ color: activeTitle.color }}>
                  <Gem size={28} />
                </div>
                <div className="title-details">
                  <h5 style={{ color: activeTitle.color }}>{activeTitle.name}</h5>
                  <p>{activeTitle.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========== 3. PROGRESO DE NIVEL ========== */}
          <div className="user-modal-level-card">
            <div className="level-header">
              <div className="level-title-section">
                <Zap size={20} />
                <div>
                  <h4>Nivel {userData.level}</h4>
                  <p>Progreso hacia el siguiente nivel</p>
                </div>
              </div>
              <div className="level-points">
                <span className="current-points">{pointsInLevel}/20</span>
              </div>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${levelProgress}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 6. BADGES DE INFORMACIÓN ========== */}
          {(userData.favorite_team || userData.favorite_player || userData.nationality || userData.created_at) && (
            <div className="user-modal-badges-grid">
              {userData.favorite_team && (
                <div className="user-modal-badge team">
                  <div className="badge-icon"><Trophy size={14} /></div>
                  <div className="badge-text">
                    <span className="badge-label">Equipo</span>
                    <span className="badge-value">{userData.favorite_team}</span>
                  </div>
                </div>
              )}

              {userData.favorite_player && (
                <div className="user-modal-badge player">
                  <div className="badge-icon"><Heart size={14} /></div>
                  <div className="badge-text">
                    <span className="badge-label">Jugador</span>
                    <span className="badge-value">{userData.favorite_player}</span>
                  </div>
                </div>
              )}

              {userData.nationality && (
                <div className="user-modal-badge nation">
                  <div className="badge-icon"><Globe size={14} /></div>
                  <div className="badge-text">
                    <span className="badge-label">País</span>
                    <span className="badge-value">{userData.nationality}</span>
                  </div>
                </div>
              )}

              <div className="user-modal-badge joined">
                <div className="badge-icon"><Calendar size={14} /></div>
                <div className="badge-text">
                  <span className="badge-label">Miembro</span>
                  <span className="badge-value">{formatDate(userData.created_at)}</span>
                </div>
              </div>
            </div>
          )} 
          {/* ========== 5. CORONAS MENSUALES ========== */}
          {(totalCrowns > 0 || crownHistory.length > 0) && (
            <div className="user-modal-crowns">
              {/* Header: mismo patrón que level-card y active-title */}
              <div className="crowns-header">
                <div className="crowns-header-icon">
                  <Crown size={18} />
                </div>
                <h4>Coronas Mensuales</h4>
              </div>

              {/* Stat principal: mismo patrón que .user-modal-stat-item */}
              <div className="crowns-stat-row">
                <div className="crowns-stat-visual">
                  {/* Coronas individuales dentro de la fila estructurada */}
                  <div className="crowns-icons-group">
                    {Array.from({ length: Math.min(totalCrowns, 5) }).map((_, i) => (
                      <span key={i} className="crowns-single-icon">
                        <Crown size={20} />
                      </span>
                    ))}
                    {totalCrowns > 5 && (
                      <span className="crowns-overflow">+{totalCrowns - 5}</span>
                    )}
                  </div>
                </div>
                <div className="crowns-stat-info">
                  <span className="crowns-stat-value">{totalCrowns}</span>
                  <span className="crowns-stat-label">
                    {totalCrowns === 1 ? 'Corona ganada' : 'Coronas ganadas'}
                  </span>
                </div>
              </div>

              {/* Historial: cada item es una fila tipo badge con borde izquierdo */}
              {crownHistory.length > 0 && (
                <div className="crowns-history">
                  <h5>Historial reciente</h5>
                  {crownHistory.slice(0, 3).map((crown, index) => (
                    <div key={crown.id} className="crowns-history-item">
                      <div className="crowns-history-icon">
                        <Crown size={14} />
                      </div>
                      <div className="crowns-history-content">
                        <span className="crowns-history-month">{crown.month_year}</span>
                        <span className="crowns-history-points">{crown.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}