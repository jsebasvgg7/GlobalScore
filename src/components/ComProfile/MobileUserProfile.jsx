import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Crown, Flame, Star, Shield, Gem, Globe,
  Heart, Trophy, Calendar, Target, Zap, TrendingUp, Users,
  ChevronRight, Lock
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { LoadingDots } from '../ComFeedback/LoadingSpinner';
import ImageViewer from '../ComOthers/ImageViewer';
import '../../styles/StylesProfile/MobileUserProfile.css';

/* ── helpers ─────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('es-ES');
const acc = (correct, predictions) =>
  predictions > 0 ? Math.round((correct / predictions) * 100) : 0;
const levelProgress = (points) => ((points % 20) / 20) * 100;
const pointsInLevel  = (points) => points % 20;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

/* ── sub-components ───────────────────────────────────── */

function SectionHeader({ label, color, extra }) {
  return (
    <div className="mup-sec-hdr">
      <div className="mup-sec-line" style={{ background: color || 'var(--mup-accent)' }} />
      <span className="mup-sec-lbl">{label}</span>
      {extra && <span className="mup-sec-extra">{extra}</span>}
    </div>
  );
}

function StatBlock({ label, value, accent, sub }) {
  return (
    <div className="mup-stat-block" style={{ '--sb-accent': accent || 'var(--mup-accent)' }}>
      <div className="mup-stat-block-val">{value}</div>
      {sub && <div className="mup-stat-block-sub">{sub}</div>}
      <div className="mup-stat-block-lbl">{label}</div>
    </div>
  );
}

function BadgeItem({ achievement, index }) {
  const palette = ['#5b4fd8','#3B82F6','#10B981','#EF4444','#F59E0B','#EC4899','#8B5CF6','#06B6D4'];
  const color = palette[index % palette.length];
  return (
    <div className="mup-badge" title={achievement.name}>
      <div className="mup-badge-hex" style={{ '--bh-color': color }}>
        <div className="mup-badge-hex-inner">
          <span className="mup-badge-emoji">{achievement.icon || '🏆'}</span>
        </div>
        <div className="mup-badge-glow" style={{ background: color }} />
      </div>
      <span className="mup-badge-name">{achievement.name?.split(' ')[0]}</span>
    </div>
  );
}

function CrownRow({ crown, index }) {
  return (
    <div className="mup-crown-row" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="mup-crown-rank">
        <Crown size={13} fill="#c9a227" color="#b8920e" />
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="mup-crown-info">
        <span className="mup-crown-month">{crown.month_year}</span>
        <span className="mup-crown-pts">{fmt(crown.points)} pts</span>
      </div>
      <div className="mup-crown-badge">CAMPEÓN</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function MobileUserProfile({ userId, onClose }) {
  const [userData,      setUserData]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('stats');
  const [showImage,     setShowImage]     = useState(false);
  const [userRanking,   setUserRanking]   = useState({ position: 0, totalUsers: 0 });
  const [crowns,        setCrowns]        = useState([]);
  const [streakData,    setStreakData]    = useState({ current_streak: 0, best_streak: 0 });
  const [achievements,  setAchievements]  = useState([]);
  const [titles,        setTitles]        = useState([]);
  const [allAch,        setAllAch]        = useState([]);

  useEffect(() => { loadData(); }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        { data: user },
        { data: allUsers },
        { data: history },
        { data: available },
        { data: availTitles },
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('users').select('id, points').order('points', { ascending: false }),
        supabase.from('monthly_championship_history').select('*').eq('user_id', userId).order('awarded_at', { ascending: false }),
        supabase.from('available_achievements').select('*').order('requirement_value', { ascending: true }),
        supabase.from('available_titles').select('*'),
      ]);

      setUserData(user);
      setStreakData({ current_streak: user?.current_streak || 0, best_streak: user?.best_streak || 0 });
      setCrowns(history || []);
      setAllAch(available || []);

      if (allUsers) {
        const idx = allUsers.findIndex(u => u.id === userId);
        setUserRanking({ position: idx + 1, totalUsers: allUsers.length });
      }

      if (available && user) {
        const unlocked = available.filter(a => {
          switch (a.requirement_type) {
            case 'points':      return (user.points         || 0) >= a.requirement_value;
            case 'predictions': return (user.predictions    || 0) >= a.requirement_value;
            case 'correct':     return (user.correct        || 0) >= a.requirement_value;
            case 'streak':      return (user.current_streak || 0) >= a.requirement_value;
            default:            return false;
          }
        });
        setAchievements(unlocked);
        if (availTitles) {
          setTitles(availTitles.filter(t =>
            unlocked.some(a => a.id === t.requirement_achievement_id)
          ));
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveTitle = () => {
    if (!titles.length) return null;
    return [...titles].sort((a, b) => {
      const ra = allAch.find(x => x.id === a.requirement_achievement_id);
      const rb = allAch.find(x => x.id === b.requirement_achievement_id);
      return (rb?.requirement_value || 0) - (ra?.requirement_value || 0);
    })[0];
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="mup-page">
        <div className="mup-topbar">
          <button className="mup-back-btn" onClick={onClose}>
            <ArrowLeft size={15} />
          </button>
          <span className="mup-topbar-title">PERFIL</span>
          <div style={{ width: 36 }} />
        </div>
        <div className="mup-loading-state">
          <div className="mup-loading-icon">
            <Users size={28} />
          </div>
          <span>Cargando perfil</span>
          <LoadingDots />
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const accuracy    = acc(userData.correct, userData.predictions);
  const lvlProg     = levelProgress(userData.points || 0);
  const lvlPts      = pointsInLevel(userData.points || 0);
  const activeTitle = getActiveTitle();
  const totalCrowns = userData.monthly_championships || 0;
  const firstName   = userData.name?.split(' ')[0] || 'Jugador';
  const initials    = (userData.name || 'U').slice(0, 2).toUpperCase();

  const tabs = [
    { id: 'stats',   label: 'STATS',   icon: TrendingUp },
    { id: 'logros',  label: 'LOGROS',  icon: Star        },
    { id: 'coronas', label: 'CORONAS', icon: Crown       },
  ];

  const topPct = userRanking.totalUsers > 0
    ? Math.round((userRanking.position / userRanking.totalUsers) * 100)
    : 0;

  return (
    <>
      <div className="mup-page">

        {/* ── Topbar ── */}
        <div className="mup-topbar">
          <button className="mup-back-btn" onClick={onClose}>
            <ArrowLeft size={15} />
          </button>
          <div className="mup-topbar-center">
            <span className="mup-topbar-title">PERFIL</span>
            <span className="mup-topbar-sub">GlobalScore</span>
          </div>
          <div className="mup-topbar-rank">
            <span className="mup-topbar-rank-num">#{userRanking.position}</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="mup-body">

          {/* ── Banner ── */}
          <div className="mup-banner">
            {userData.equipped_banner_url ? (
              <>
                <img src={userData.equipped_banner_url} alt="" className="mup-banner-img" />
                <div className="mup-banner-overlay" />
              </>
            ) : (
              <div className="mup-banner-default">
                <div className="mup-banner-grid-bg" />
                <div className="mup-banner-gradient-bg" />
              </div>
            )}
            <div className="mup-banner-corner-tag">TEMP 25/26</div>
          </div>

          {/* ── Hero ── */}
          <div className="mup-hero">
            <div className="mup-hero-left">
              <button
                className="mup-avatar-wrap"
                onClick={() => userData.avatar_url && setShowImage(true)}
              >
                <div className={`mup-avatar${userData.avatar_url ? ' --clickable' : ''}`}>
                  {userData.avatar_url
                    ? <img src={userData.avatar_url} alt={firstName} />
                    : <span>{initials}</span>
                  }
                </div>
                <div className="mup-level-tag">
                  <Shield size={7} />
                  <span>NIV.{userData.level || 1}</span>
                </div>
              </button>
            </div>

            <div className="mup-hero-info">
              <div className="mup-hero-name-row">
                <h2 className="mup-name">{userData.name || 'Usuario'}</h2>
              </div>
              {activeTitle && (
                <div
                  className="mup-title-pill"
                  style={{ '--tp-color': activeTitle.color || 'var(--mup-accent)' }}
                >
                  <Gem size={8} />
                  {activeTitle.name}
                </div>
              )}
              <div className="mup-hero-meta">
                {userData.nationality && (
                  <span className="mup-meta-chip">
                    <Globe size={8} />
                    {userData.nationality}
                  </span>
                )}
                {userData.created_at && (
                  <span className="mup-meta-chip">
                    <Calendar size={8} />
                    {fmtDate(userData.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats header — mismo estilo que mpm-stats ── */}
          <div className="mup-stats-header">
            <div className="mup-stat-col">
              <div className="mup-stat-col-val">{fmt(userData.points)}<span>pts</span></div>
              <div className="mup-stat-col-lbl">Puntos</div>
            </div>
            <div className="mup-stat-div" />
            <div className="mup-stat-col">
              <div className="mup-stat-col-val">{accuracy}<span>%</span></div>
              <div className="mup-stat-col-lbl">Precisión</div>
            </div>
            <div className="mup-stat-div" />
            <div className="mup-stat-col">
              <div className="mup-stat-col-val">{totalCrowns}</div>
              <div className="mup-stat-col-lbl">Coronas</div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mup-tabs">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`mup-tab${activeTab === id ? ' --active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={11} />
                {label}
              </button>
            ))}
          </div>

          {/* ══ TAB: STATS ══ */}
          {activeTab === 'stats' && (
            <div className="mup-panel">

              {/* Bio */}
              {userData.bio && (
                <div className="mup-bio">
                  <div className="mup-bio-bar" />
                  <p>{userData.bio}</p>
                </div>
              )}

              {/* Ranking global */}
              <SectionHeader label="RANKING GLOBAL" color="#5b4fd8" />
              <div className="mup-ranking-block">
                <div className="mup-ranking-main">
                  <span className="mup-ranking-pos">#{userRanking.position}</span>
                  <span className="mup-ranking-of">de {fmt(userRanking.totalUsers)}</span>
                </div>
                <div className="mup-ranking-bar-wrap">
                  <div className="mup-ranking-bar">
                    <div className="mup-ranking-fill" style={{ width: `${100 - topPct}%` }} />
                  </div>
                  <span className="mup-ranking-pct">Top {topPct}%</span>
                </div>
              </div>

              {/* Nivel */}
              <SectionHeader label={`NIVEL ${userData.level || 1}`} color="#8B5CF6" />
              <div className="mup-level-block">
                <div className="mup-level-track">
                  <div className="mup-level-fill" style={{ width: `${lvlProg}%` }} />
                  <div className="mup-level-glow" style={{ left: `${lvlProg}%` }} />
                </div>
                <div className="mup-level-meta">
                  <span>{lvlPts} / 20 pts</span>
                  <span>NV.{(userData.level || 1) + 1} →</span>
                </div>
              </div>

              {/* Estadísticas */}
              <SectionHeader label="ESTADÍSTICAS" color="#3B82F6" />
              <div className="mup-stats-grid">
                <StatBlock label="PUNTOS TOTALES"   value={fmt(userData.points)}      accent="#5b4fd8" />
                <StatBlock label="PREDICCIONES"     value={fmt(userData.predictions)} accent="#3B82F6" />
                <StatBlock label="PRECISIÓN"        value={`${accuracy}%`}            accent="#10B981" />
                <StatBlock label="CORRECTAS"        value={fmt(userData.correct)}     accent="#F59E0B" />
              </div>

              {/* Rachas */}
              <SectionHeader label="RACHAS" color="#EF4444" />
              <div className="mup-streaks">
                <div className="mup-streak --fire">
                  <div className="mup-streak-icon-wrap">
                    <Flame size={24} fill="#EF4444" color="#DC2626" />
                  </div>
                  <div className="mup-streak-data">
                    <span className="mup-streak-num">{streakData.current_streak}</span>
                    <span className="mup-streak-tag">RACHA ACTUAL</span>
                  </div>
                </div>
                <div className="mup-streak-sep" />
                <div className="mup-streak --gold">
                  <div className="mup-streak-icon-wrap">
                    <Star size={24} fill="#c9a227" color="#b8920e" />
                  </div>
                  <div className="mup-streak-data">
                    <span className="mup-streak-num">{streakData.best_streak}</span>
                    <span className="mup-streak-tag">MEJOR RACHA</span>
                  </div>
                </div>
              </div>

              {/* Este mes */}
              <SectionHeader label="ESTE MES" color="#10B981" />
              <div className="mup-month-row">
                <div className="mup-month-cell" style={{ '--mc-color': '#8b7fc7' }}>
                  <span className="mup-month-val">{fmt(userData.monthly_points)}</span>
                  <span className="mup-month-lbl">PTS MES</span>
                </div>
                <div className="mup-month-cell" style={{ '--mc-color': '#6366F1' }}>
                  <span className="mup-month-val">{fmt(userData.monthly_predictions)}</span>
                  <span className="mup-month-lbl">PREDS MES</span>
                </div>
              </div>

            </div>
          )}

          {/* ══ TAB: LOGROS ══ */}
          {activeTab === 'logros' && (
            <div className="mup-panel">

              {activeTitle && (
                <>
                  <SectionHeader label="TÍTULO ACTIVO" color={activeTitle.color || 'var(--mup-accent)'} />
                  <div
                    className="mup-active-title-card"
                    style={{ '--atc-color': activeTitle.color || 'var(--mup-accent)' }}
                  >
                    <div className="mup-atc-gem">
                      <Gem size={22} color={activeTitle.color || 'var(--mup-accent)'} />
                    </div>
                    <div className="mup-atc-body">
                      <strong>{activeTitle.name}</strong>
                      <p>{activeTitle.description}</p>
                    </div>
                    <div className="mup-equipped-badge">
                      <Star size={7} />
                      EQUIPADO
                    </div>
                  </div>
                </>
              )}

              <SectionHeader
                label="INSIGNIAS"
                color="#F59E0B"
                extra={`${achievements.length}/${allAch.length}`}
              />

              {achievements.length === 0 ? (
                <div className="mup-empty">
                  <div className="mup-empty-icon"><Star size={30} /></div>
                  <span>Haz predicciones para desbloquear insignias</span>
                </div>
              ) : (
                <div className="mup-badges-grid">
                  {achievements.map((ach, i) => (
                    <BadgeItem key={ach.id} achievement={ach} index={i} />
                  ))}
                </div>
              )}

              {allAch.length > achievements.length && (
                <div className="mup-locked-row">
                  <Lock size={11} />
                  <span>{allAch.length - achievements.length} insignias por desbloquear</span>
                </div>
              )}

            </div>
          )}

          {/* ══ TAB: CORONAS ══ */}
          {activeTab === 'coronas' && (
            <div className="mup-panel">

              <SectionHeader label="CAMPEONATOS" color="#c9a227" />

              {totalCrowns === 0 ? (
                <div className="mup-empty">
                  <div className="mup-empty-icon"><Crown size={30} /></div>
                  <span>¡Aún no has ganado ningún campeonato!</span>
                </div>
              ) : (
                <div className="mup-crowns-hero">
                  <div className="mup-crowns-hero-left">
                    <Crown size={40} fill="#c9a227" color="#b8920e" />
                    <div>
                      <span className="mup-crowns-big">{totalCrowns}</span>
                      <span className="mup-crowns-sub">
                        {totalCrowns === 1 ? 'corona ganada' : 'coronas ganadas'}
                      </span>
                    </div>
                  </div>
                  <div className="mup-crowns-row-icons">
                    {Array.from({ length: Math.min(totalCrowns, 5) }).map((_, i) => (
                      <Crown
                        key={i}
                        size={16}
                        fill="#c9a227"
                        color="#b8920e"
                        style={{ opacity: 1 - i * 0.12, transform: `rotate(${(i % 2 === 0 ? -6 : 6)}deg)` }}
                      />
                    ))}
                    {totalCrowns > 5 && <span className="mup-crowns-plus">+{totalCrowns - 5}</span>}
                  </div>
                </div>
              )}

              <SectionHeader label="ESTE MES" color="#8b7fc7" />
              <div className="mup-month-row">
                <div className="mup-month-cell" style={{ '--mc-color': '#8b7fc7' }}>
                  <span className="mup-month-val">{fmt(userData.monthly_points)}</span>
                  <span className="mup-month-lbl">PTS MES</span>
                </div>
                <div className="mup-month-cell" style={{ '--mc-color': '#10B981' }}>
                  <span className="mup-month-val">{fmt(userData.monthly_correct)}</span>
                  <span className="mup-month-lbl">CORRECTAS</span>
                </div>
              </div>

              {crowns.length > 0 && (
                <>
                  <SectionHeader label="HISTORIAL" color="#c9a227" />
                  <div className="mup-crown-list">
                    {crowns.map((c, i) => (
                      <CrownRow key={c.id} crown={c} index={i} />
                    ))}
                  </div>
                </>
              )}

            </div>
          )}

          <div style={{ height: 32 }} />
        </div>
      </div>

      {showImage && userData.avatar_url && (
        <ImageViewer
          imageUrl={userData.avatar_url}
          userName={userData.name || 'Usuario'}
          onClose={() => setShowImage(false)}
        />
      )}
    </>
  );
}