// src/components/ComOthers/UserProfileModal.jsx
// ACTUALIZADO — hero banner dinámico
import React, { useState, useEffect } from 'react';
import { X, Crown, Flame, Star, Shield, Gem, Globe, Heart, Trophy, Calendar, Target, Zap, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { LoadingDots } from './LoadingSpinner';
import ImageViewer from './ImageViewer';
import '../../styles/StylesProfile/UserProfileModal.css';

/* ─── tiny helpers ─────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString();
const accuracy = (correct, predictions) =>
  predictions > 0 ? Math.round((correct / predictions) * 100) : 0;
const levelProgress = (points) => ((points % 20) / 20) * 100;
const pointsInLevel = (points) => points % 20;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

function SectionDivider({ icon: Icon, label, color = '#8B5CF6' }) {
  return (
    <div className="upm-divider">
      <div className="upm-divider-line" />
      <div className="upm-divider-center" style={{ color }}>
        <Icon size={16} />
        {label && <span>{label}</span>}
      </div>
      <div className="upm-divider-line" />
    </div>
  );
}

function StatPill({ icon: Icon, label, value, accent = '#8B5CF6', glow }) {
  return (
    <div className="upm-stat-pill" style={{ '--pill-accent': accent }}>
      <div className="upm-stat-pill-icon">
        <Icon size={18} />
      </div>
      <div className="upm-stat-pill-body">
        <span className="upm-stat-pill-value">{value}</span>
        <span className="upm-stat-pill-label">{label}</span>
      </div>
      {glow && <div className="upm-stat-pill-glow" style={{ background: accent }} />}
    </div>
  );
}

function AchievementBadge({ achievement, index }) {
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#EC4899'];
  const color = colors[index % colors.length];
  const emoji = achievement.icon || '🏆';
  return (
    <div className="upm-badge" title={achievement.name}>
      <div className="upm-badge-hex" style={{ '--badge-color': color }}>
        <span className="upm-badge-emoji">{emoji}</span>
        <div className="upm-badge-ring" />
      </div>
      <span className="upm-badge-name">{achievement.name?.split(' ')[0]}</span>
    </div>
  );
}

function CrownEntry({ crown, index }) {
  return (
    <div className="upm-crown-entry" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="upm-crown-icon">
        <Crown size={16} fill="#F59E0B" color="#D97706" />
      </div>
      <div className="upm-crown-info">
        <span className="upm-crown-month">{crown.month_year}</span>
        <span className="upm-crown-pts">{fmt(crown.points)} pts</span>
      </div>
      <div className="upm-crown-badge">#{index + 1}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function UserProfileModal({ userId, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [userRanking, setUserRanking] = useState({ position: 0, totalUsers: 0 });
  const [crownHistory, setCrownHistory] = useState([]);
  const [streakData, setStreakData] = useState({ current_streak: 0, best_streak: 0 });
  const [userAchievements, setUserAchievements] = useState([]);
  const [userTitles, setUserTitles] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { loadUserData(); }, [userId]);
  useEffect(() => { if (!loading) setTimeout(() => setMounted(true), 50); }, [loading]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const [
        { data: user },
        { data: allUsers },
        { data: history },
        { data: achievements },
        { data: titles },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('users').select('id, points').order('points', { ascending: false }),
        supabase.from('monthly_championship_history').select('*').eq('user_id', userId).order('awarded_at', { ascending: false }),
        supabase.from('available_achievements').select('*').order('requirement_value', { ascending: true }),
        supabase.from('available_titles').select('*'),
      ]);

      setUserData(user);
      setStreakData({ current_streak: user?.current_streak || 0, best_streak: user?.best_streak || 0 });
      setCrownHistory(history || []);
      setAvailableAchievements(achievements || []);

      if (allUsers) {
        const idx = allUsers.findIndex(u => u.id === userId);
        setUserRanking({ position: idx + 1, totalUsers: allUsers.length });
      }

      if (achievements && user) {
        const unlocked = achievements.filter(a => {
          switch (a.requirement_type) {
            case 'points': return (user.points || 0) >= a.requirement_value;
            case 'predictions': return (user.predictions || 0) >= a.requirement_value;
            case 'correct': return (user.correct || 0) >= a.requirement_value;
            case 'streak': return (user.current_streak || 0) >= a.requirement_value;
            default: return false;
          }
        });
        setUserAchievements(unlocked);

        if (titles) {
          const unlockedTitles = titles.filter(t =>
            unlocked.some(a => a.id === t.requirement_achievement_id)
          );
          setUserTitles(unlockedTitles);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveTitle = () => {
    if (!userTitles.length) return null;
    return [...userTitles].sort((a, b) => {
      const ra = availableAchievements.find(x => x.id === a.requirement_achievement_id);
      const rb = availableAchievements.find(x => x.id === b.requirement_achievement_id);
      return (rb?.requirement_value || 0) - (ra?.requirement_value || 0);
    })[0];
  };

  if (loading) {
    return (
      <div className="upm-overlay" onClick={onClose}>
        <div className="upm-modal" onClick={e => e.stopPropagation()}>
          <div className="upm-modal-crown-top">
            <Crown size={32} fill="#F59E0B" color="#D97706" />
          </div>
          <div className="upm-loading">
            <Users size={40} className="upm-loading-icon" />
            <p>Cargando perfil</p>
            <LoadingDots />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const acc = accuracy(userData.correct, userData.predictions);
  const lvlProg = levelProgress(userData.points || 0);
  const lvlPts = pointsInLevel(userData.points || 0);
  const activeTitle = getActiveTitle();
  const totalCrowns = userData.monthly_championships || 0;

  // ── Banner del usuario ──────────────────────────────
  const hasBanner = !!userData.equipped_banner_url;

  const tabs = [
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'logros', label: 'Logros', icon: Star },
    { id: 'coronas', label: 'Coronas', icon: Crown },
  ];

  return (
    <>
      <div className="upm-overlay" onClick={onClose}>
        <div
          className={`upm-modal ${mounted ? 'upm-modal--in' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          <button className="upm-close" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>

          {/* ════ HERO SECTION ════ */}
          <div className="upm-hero">

            {/* ── Banner: imagen real o gradiente por defecto ── */}
            <div className="upm-hero-banner">
              {hasBanner ? (
                <>
                  {/* Imagen del banner */}
                  <img
                    src={userData.equipped_banner_url}
                    alt="Banner"
                    className="upm-hero-banner-img"
                  />
                  {/* Overlay sutil para que el avatar destaque */}
                  <div className="upm-hero-banner-overlay" />
                </>
              ) : (
                <>
                  {/* Gradiente por defecto */}
                  <div className="upm-hero-banner-orb upm-hero-banner-orb--1" />
                  <div className="upm-hero-banner-orb upm-hero-banner-orb--2" />
                </>
              )}
            </div>

            {/* Avatar */}
            <div className="upm-hero-avatar-wrap">
              <div
                className={`upm-avatar ${userData.avatar_url ? 'upm-avatar--clickable' : ''}`}
                onClick={() => userData.avatar_url && setShowImageViewer(true)}
              >
                {userData.avatar_url
                  ? <img src={userData.avatar_url} alt={userData.name} />
                  : <span>{(userData.name || 'U')[0].toUpperCase()}</span>
                }
              </div>
              <div className="upm-level-ring">
                <Shield size={10} />
                <span>{userData.level || 1}</span>
              </div>
            </div>

            {/* Nombre + info */}
            <div className="upm-hero-body">
              <h2 className="upm-name">{userData.name || 'Usuario'}</h2>

              {(userData.nationality || userData.favorite_team || userData.favorite_player || userData.created_at) && (
                <div className="upm-info-tags">
                  {userData.nationality && (
                    <span className="upm-tag"><Globe size={11} />{userData.nationality}</span>
                  )}
                  {userData.favorite_team && (
                    <span className="upm-tag upm-tag--red"><Trophy size={11} />{userData.favorite_team}</span>
                  )}
                  {userData.favorite_player && (
                    <span className="upm-tag upm-tag--green"><Heart size={11} />{userData.favorite_player}</span>
                  )}
                  {userData.created_at && (
                    <span className="upm-tag upm-tag--gold"><Calendar size={11} />Desde {fmtDate(userData.created_at)}</span>
                  )}
                </div>
              )}

              {userData.bio && <p className="upm-bio">{userData.bio}</p>}
            </div>
          </div>

          {/* ════ TABS ════ */}
          <div className="upm-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`upm-tab ${activeTab === tab.id ? 'upm-tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ════ TAB CONTENT ════ */}
          <div className="upm-content">

            {activeTab === 'stats' && (
              <div className="upm-tab-panel">
                <SectionDivider icon={Zap} label={`Nivel ${userData.level}`} color="#F59E0B" />
                <div className="upm-level-block">
                  <div className="upm-level-bar-wrap">
                    <div className="upm-level-bar">
                      <div className="upm-level-fill" style={{ width: `${lvlProg}%` }}>
                        <div className="upm-level-fill-glow" />
                      </div>
                    </div>
                    <span className="upm-level-pts">{lvlPts}/20 pts</span>
                  </div>
                </div>

                <SectionDivider icon={TrendingUp} label="Estadísticas" color="#8B5CF6" />
                <div className="upm-stats-grid">
                  <StatPill icon={Zap} label="Puntos" value={fmt(userData.points)} accent="#8B5CF6" glow />
                  <StatPill icon={Target} label="Predicciones" value={fmt(userData.predictions)} accent="#3B82F6" />
                  <StatPill icon={Star} label="Precisión" value={`${acc}%`} accent="#10B981" glow />
                  <StatPill icon={Flame} label="Racha actual" value={streakData.current_streak} accent="#EF4444" />
                </div>

                <div className="upm-stats-grid upm-stats-grid--secondary">
                  <StatPill icon={Trophy} label="Correctas" value={fmt(userData.correct)} accent="#F59E0B" />
                  <StatPill icon={Shield} label="Mejor racha" value={streakData.best_streak} accent="#EC4899" />
                  <StatPill icon={Crown} label="Coronas" value={totalCrowns} accent="#D97706" glow />
                  <StatPill icon={TrendingUp} label="Pts mes" value={fmt(userData.monthly_points)} accent="#6366F1" />
                </div>

                <SectionDivider icon={Flame} label="Rachas" color="#EF4444" />
                <div className="upm-streaks-row">
                  <div className="upm-streak-card upm-streak-card--fire">
                    <Flame size={28} fill="#EF4444" color="#DC2626" />
                    <span className="upm-streak-val">{streakData.current_streak}</span>
                    <span className="upm-streak-lbl">Racha actual</span>
                  </div>
                  <div className="upm-streak-sep" />
                  <div className="upm-streak-card upm-streak-card--gold">
                    <Star size={28} fill="#F59E0B" color="#D97706" />
                    <span className="upm-streak-val">{streakData.best_streak}</span>
                    <span className="upm-streak-lbl">Mejor racha</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logros' && (
              <div className="upm-tab-panel">
                {activeTitle && (
                  <>
                    <SectionDivider icon={Gem} label="Título activo" color={activeTitle.color || '#8B5CF6'} />
                    <div className="upm-active-title" style={{ '--title-color': activeTitle.color || '#8B5CF6' }}>
                      <div className="upm-active-title-icon">
                        <Gem size={24} />
                      </div>
                      <div className="upm-active-title-info">
                        <strong style={{ color: activeTitle.color || '#8B5CF6' }}>{activeTitle.name}</strong>
                        <p>{activeTitle.description}</p>
                      </div>
                      <div className="upm-equipped-tag">
                        <Star size={10} />Equipado
                      </div>
                    </div>
                  </>
                )}

                <SectionDivider icon={Star} label={`Insignias ${userAchievements.length}/${availableAchievements.length}`} color="#F59E0B" />
                {userAchievements.length === 0 ? (
                  <div className="upm-empty">
                    <Star size={36} opacity={0.3} />
                    <p>Haz predicciones para desbloquear insignias</p>
                  </div>
                ) : (
                  <div className="upm-badges-grid">
                    {userAchievements.map((ach, i) => (
                      <AchievementBadge key={ach.id} achievement={ach} index={i} />
                    ))}
                  </div>
                )}

                {availableAchievements.length > userAchievements.length && (
                  <div className="upm-locked-count">
                    <Shield size={14} opacity={0.5} />
                    <span>{availableAchievements.length - userAchievements.length} insignias por desbloquear</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'coronas' && (
              <div className="upm-tab-panel">
                <SectionDivider icon={Crown} label="Campeonatos" color="#F59E0B" />
                <div className="upm-crowns-showcase">
                  {totalCrowns === 0 ? (
                    <div className="upm-empty">
                      <Crown size={40} opacity={0.25} />
                      <p>¡Aún no has ganado ningún campeonato!</p>
                      <span>Acumula puntos este mes para ganar</span>
                    </div>
                  ) : (
                    <>
                      <div className="upm-crowns-total">
                        <div className="upm-crowns-total-icon">
                          <Crown size={40} fill="#F59E0B" color="#D97706" />
                        </div>
                        <div>
                          <span className="upm-crowns-num">{totalCrowns}</span>
                          <span className="upm-crowns-lbl">{totalCrowns === 1 ? 'Corona' : 'Coronas'} ganadas</span>
                        </div>
                      </div>
                      <div className="upm-crowns-icons-row">
                        {Array.from({ length: Math.min(totalCrowns, 7) }).map((_, i) => (
                          <Crown
                            key={i}
                            size={22}
                            fill="#F59E0B"
                            color="#D97706"
                            style={{ opacity: 1 - i * 0.05, transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 6}deg)` }}
                          />
                        ))}
                        {totalCrowns > 7 && <span className="upm-crowns-more">+{totalCrowns - 7}</span>}
                      </div>
                    </>
                  )}
                </div>

                <SectionDivider icon={TrendingUp} label="Este mes" color="#10B981" />
                <div className="upm-stats-grid">
                  <StatPill icon={Zap} label="Pts mes" value={fmt(userData.monthly_points)} accent="#8B5CF6" glow />
                  <StatPill icon={Target} label="Preds mes" value={fmt(userData.monthly_predictions)} accent="#3B82F6" />
                  <StatPill icon={Star} label="Correctas" value={fmt(userData.monthly_correct)} accent="#10B981" />
                  <StatPill icon={Crown} label="Coronas" value={totalCrowns} accent="#F59E0B" glow />
                </div>

                {crownHistory.length > 0 && (
                  <>
                    <SectionDivider icon={Calendar} label="Historial" color="#8B5CF6" />
                    <div className="upm-crown-history">
                      {crownHistory.map((c, i) => (
                        <CrownEntry key={c.id} crown={c} index={i} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>

      {showImageViewer && userData.avatar_url && (
        <ImageViewer
          imageUrl={userData.avatar_url}
          userName={userData.name || 'Usuario'}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </>
  );
}