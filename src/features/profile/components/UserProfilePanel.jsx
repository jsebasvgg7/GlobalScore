import React, { useState, useEffect } from 'react';
import {
  X, Crown, Flame, Shield, Gem, Globe, Heart,
  Trophy, Calendar, Target, Zap, Users, TrendingUp, Award,
  Star, Lock, BookOpen, Package,
  Crosshair, Hash, BarChart2, Activity, BookOpen as BookOpenIcon,
  CheckCircle, Eye, Aperture, Navigation, CheckSquare, Compass, BadgeCheck,
  Repeat2, Cpu, Timer, Infinity, Rocket,
  Circle, CircleDot, Layers, Sparkles,
  Percent, LayoutDashboard, Medal,
} from 'lucide-react';
import { supabase } from '@/shared/services/supabase/client';
import { LoadingDots } from '@/shared/ui';
import { ImageViewer } from "@/shared/ui";
import '../styles/UserProfilePanel.css';

const fmt = (n) => Number(n || 0).toLocaleString();
const acc = (correct, predictions) =>
  predictions > 0 ? Math.round((correct / predictions) * 100) : 0;
const levelProgress = (points) => ((points % 20) / 20) * 100;
const pointsInLevel = (points) => points % 20;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

const ICON_MAP = {
  Crosshair, Target, Hash, TrendingUp, Star,
  BarChart2, Activity, Award, BookOpen: BookOpenIcon,
  CheckCircle, Eye, Aperture, Navigation, CheckSquare, Compass,
  ShieldCheck: BadgeCheck, BadgeCheck,
  Repeat2, Flame, Zap, Calendar, Cpu,
  Timer, Infinity, Rocket, Shield, Crown,
  Circle, CircleDot, Layers, Trophy, Gem,
  Sparkles, Percent, LayoutDashboard, Medal,
  Default: Star,
};

function LucideIcon({ name, size = 14, color }) {
  const Icon = ICON_MAP[name] ?? ICON_MAP.Default;
  return <Icon size={size} color={color} />;
}

const CATEGORY_COLORS = {
  predictions: '#8b7fc7',
  accuracy: '#34d399',
  streaks: '#ef4444',
  points: '#f59e0b',
  crowns: '#c9a227',
  special: '#fb923c',
};

const CATEGORY_LABELS = {
  predictions: 'Predicciones',
  accuracy: 'Aciertos',
  streaks: 'Rachas',
  points: 'Puntos',
  crowns: 'Coronas',
  special: 'Especiales',
};

function checkUnlocked(ach, user) {
  const val = ach.requirement_value ?? 0;
  switch (ach.requirement_type) {
    case 'points': return (user.points || 0) >= val;
    case 'predictions': return (user.predictions || 0) >= val;
    case 'correct': return (user.correct || 0) >= val;
    case 'streak': return (user.best_streak || 0) >= val;
    case 'monthly_championships': return (user.monthly_championships || 0) >= val;
    default: return false;
  }
}

function SectionDivider({ icon: Icon, label, color = '#5b4fd8' }) {
  return (
    <div className="upp-divider">
      <div className="upp-divider-line" />
      <div className="upp-divider-center" style={{ color }}>
        <Icon size={13} />
        {label && <span>{label}</span>}
      </div>
      <div className="upp-divider-line" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent = '#5b4fd8' }) {
  return (
    <div className="upp-stat-card" style={{ '--card-accent': accent }}>
      <div className="upp-stat-card-icon">
        <Icon size={16} />
      </div>
      <div className="upp-stat-card-body">
        <span className="upp-stat-card-val">{value}</span>
        <span className="upp-stat-card-lbl">{label}</span>
      </div>
    </div>
  );
}

function CrownEntry({ crown, index }) {
  return (
    <div className="upp-crown-entry" style={{ animationDelay: `${index * 70}ms` }}>
      <Crown size={14} fill="#c9a227" color="#b8920e" />
      <div className="upp-crown-info">
        <span className="upp-crown-month">{crown.month_year}</span>
        <span className="upp-crown-pts">{fmt(crown.points)} pts</span>
      </div>
      <div className="upp-crown-pos">#{index + 1}</div>
    </div>
  );
}

function AchievementRow({ ach, unlocked }) {
  const color = unlocked
    ? (CATEGORY_COLORS[ach.category] || '#5b4fd8')
    : 'transparent';

  return (
    <div
      className={`upp-ach-row${unlocked ? ' upp-ach-row--on' : ' upp-ach-row--off'}`}
      style={{ '--ach-color': CATEGORY_COLORS[ach.category] || '#5b4fd8' }}
    >
      <div
        className="upp-ach-icon"
        style={{ background: unlocked ? (CATEGORY_COLORS[ach.category] || '#5b4fd8') : undefined }}
      >
        {unlocked
          ? <LucideIcon name={ach.icon} size={13} color="#fff" />
          : <Lock size={11} />
        }
      </div>
      <div className="upp-ach-text">
        <span className="upp-ach-name">{ach.name}</span>
        <span className="upp-ach-desc">{ach.description}</span>
      </div>
      {unlocked && (
        <span
          className="upp-ach-cat"
          style={{
            color: CATEGORY_COLORS[ach.category] || '#5b4fd8',
            borderColor: CATEGORY_COLORS[ach.category] || '#5b4fd8',
            background: `${CATEGORY_COLORS[ach.category] || '#5b4fd8'}14`,
          }}
        >
          {CATEGORY_LABELS[ach.category] || ach.category}
        </span>
      )}
    </div>
  );
}

/* ── ÁLBUMES TAB ── */
const LEGENDARY_ALBUM_IDS = ['legendary_1', 'legendary_2', 'legendary_3', 'legendary_4'];
const LEGENDARY_LABELS = {
  legendary_1: 'Legendarios I',
  legendary_2: 'Legendarios II',
  legendary_3: 'Legendarios III',
  legendary_4: 'Álbum Dorado',
};
const LEGENDARY_COLORS = ['#5b4fd8', '#8b7fc7', '#c9a227', '#ef9f27'];

const STAR_ALBUMS = [
  { id: 'stars_1', label: '⭐ 1 Estrella', color: '#888' },
  { id: 'stars_2', label: '⭐⭐ 2 Estrellas', color: '#8b7fc7' },
  { id: 'stars_3', label: '⭐⭐⭐ 3 Estrellas', color: '#34d399' },
  { id: 'stars_4', label: '⭐⭐⭐⭐ 4 Estrellas', color: '#c9a227' },
  { id: 'stars_5', label: '⭐⭐⭐⭐⭐ GOAT', color: '#ef4444' },
];

function AlbumsTab({ userId }) {
  const [progress, setProgress] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const [{ data: prog }, { data: col }] = await Promise.all([
        supabase.from('album_progress').select('*').eq('user_id', userId),
        supabase.from('album_collection')
          .select('*, card:card_id(*)')
          .eq('user_id', userId),
      ]);
      setProgress(prog || []);
      setCollection(col || []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="upp-tab-panel">
        <div className="upp-loading">
          <BookOpen size={28} opacity={0.3} />
          <LoadingDots />
        </div>
      </div>
    );
  }

  const getProgress = (albumId) => progress.find(p => p.album_id === albumId);

  const totalCards = collection.length;
  const uniquePlayers = collection.filter(c => c.card?.card_type === 'player').length;
  const legendaryDone = LEGENDARY_ALBUM_IDS.filter(id => getProgress(id)?.is_completed).length;
  const packsOpened = collection.reduce((acc, c) => acc + (c.copies || 0), 0) - collection.length;

  return (
    <div className="upp-tab-panel">

      {/* Resumen */}
      <SectionDivider icon={BookOpen} label="Colección" color="#5b4fd8" />
      <div className="upp-stats-grid">
        <StatCard icon={Package} label="Cartas totales" value={totalCards} accent="#5b4fd8" />
        <StatCard icon={Star} label="Jugadores únicos" value={uniquePlayers} accent="#c9a227" />
        <StatCard icon={Trophy} label="Álbumes leg." value={`${legendaryDone}/4`} accent="#ef9f27" />
        <StatCard icon={BookOpen} label="Duplicados" value={packsOpened > 0 ? packsOpened : '—'} accent="#34d399" />
      </div>

      {/* Legendarios */}
      <SectionDivider icon={Trophy} label="Álbumes Legendarios" color="#ef9f27" />
      <div className="upp-albums-legendary">
        {LEGENDARY_ALBUM_IDS.map((id, i) => {
          const prog = getProgress(id);
          const done = prog?.is_completed ?? false;
          const cards = prog?.unique_cards ?? 0;
          const total = 30;
          const pct = Math.min(100, Math.round((cards / total) * 100));
          const color = LEGENDARY_COLORS[i];

          return (
            <div
              key={id}
              className={`upp-leg-album${done ? ' upp-leg-album--done' : ''}`}
              style={{ '--leg-color': color }}
            >
              <div className="upp-leg-album-left">
                <div className="upp-leg-album-icon">
                  {done ? <Trophy size={14} /> : <BookOpen size={14} />}
                </div>
                <div className="upp-leg-album-info">
                  <span className="upp-leg-album-name">{LEGENDARY_LABELS[id]}</span>
                  <span className="upp-leg-album-sub">{cards}/{total} jugadores</span>
                </div>
              </div>
              <div className="upp-leg-album-right">
                {done
                  ? <span className="upp-leg-album-badge">✓ Completo</span>
                  : <span className="upp-leg-album-pct">{pct}%</span>
                }
              </div>
              <div className="upp-leg-album-bar">
                <div className="upp-leg-album-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Colección de estrellas */}
      <SectionDivider icon={Star} label="Colección de Estrellas" color="#c9a227" />
      <div className="upp-albums-stars">
        {STAR_ALBUMS.map(({ id, label, color }) => {
          const prog = getProgress(id);
          const cards = prog?.unique_cards ?? 0;
          return (
            <div key={id} className="upp-star-row" style={{ '--star-color': color }}>
              <span className="upp-star-label">{label}</span>
              <span className="upp-star-count">{cards}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function UserProfilePanel({ userId, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showImage, setShowImage] = useState(false);
  const [userRanking, setUserRanking] = useState({ position: 0, totalUsers: 0 });
  const [crowns, setCrowns] = useState([]);
  const [streakData, setStreakData] = useState({ current_streak: 0, best_streak: 0 });
  const [allAch, setAllAch] = useState([]);
  const [titles, setTitles] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { loadData(); }, [userId]);
  useEffect(() => {
    if (!loading) setTimeout(() => setMounted(true), 30);
  }, [loading]);

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

      if (availTitles && available && user) {
        const unlocked = available.filter(a => checkUnlocked(a, user));
        setTitles(availTitles.filter(t =>
          unlocked.some(a => a.id === t.requirement_achievement_id)
        ));
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

  if (loading) {
    return (
      <div className="upp-backdrop" onClick={onClose}>
        <div className="upp-panel" onClick={e => e.stopPropagation()}>
          <div className="upp-loading">
            <Users size={36} opacity={0.3} />
            <p>Cargando perfil</p>
            <LoadingDots />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const accuracy = acc(userData.correct, userData.predictions);
  const lvlProg = levelProgress(userData.points || 0);
  const lvlPts = pointsInLevel(userData.points || 0);
  const activeTitle = getActiveTitle();
  const totalCrowns = userData.monthly_championships || 0;
  const firstName = userData.name?.split(' ')[0] || 'Jugador';
  const initials = (userData.name || 'U').slice(0, 2).toUpperCase();

  const unlocked = allAch.filter(a => checkUnlocked(a, userData));
  const locked = allAch.filter(a => !checkUnlocked(a, userData));

  const grouped = unlocked.reduce((acc, a) => {
    const cat = a.category || 'special';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const tabs = [
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'albums', label: 'Álbumes', icon: BookOpen },
    { id: 'logros', label: 'Logros', icon: Star },
    { id: 'coronas', label: 'Coronas', icon: Crown },
  ];

  return (
    <>
      <div
        className={`upp-backdrop${mounted ? ' upp-backdrop--in' : ''}`}
        onClick={onClose}
      />

      <div
        className={`upp-panel${mounted ? ' upp-panel--in' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Perfil de ${userData.name}`}
      >
        <button className="upp-close" onClick={onClose} aria-label="Cerrar">
          <X size={14} />
        </button>

        {/* HEADER */}
        <div className="upp-header">
          <div className="upp-banner">
            {userData.equipped_banner_url ? (
              <>
                <img src={userData.equipped_banner_url} alt="Banner" className="upp-banner-img" />
                <div className="upp-banner-overlay" />
              </>
            ) : (
              <>
                <div className="upp-banner-grid" />
                <div className="upp-banner-orb upp-banner-orb--1" />
                <div className="upp-banner-orb upp-banner-orb--2" />
              </>
            )}
          </div>

          <div className="upp-avatar-row">
            <div
              className={`upp-av${userData.avatar_url ? ' upp-av--clickable' : ''}`}
              onClick={() => userData.avatar_url && setShowImage(true)}
            >
              {userData.avatar_url
                ? <img src={userData.avatar_url} alt={firstName} />
                : <span>{initials}</span>
              }
              <div className="upp-lv-ring">
                <Shield size={9} />
                <span>{userData.level || 1}</span>
              </div>
            </div>

            <div className="upp-name-block">
              <h2 className="upp-name">{userData.name || 'Usuario'}</h2>
              {activeTitle && (
                <div className="upp-title-badge" style={{ '--title-color': activeTitle.color || '#5b4fd8' }}>
                  <Gem size={10} />
                  {activeTitle.name}
                </div>
              )}
              <div className="upp-rank-pill">
                <Trophy size={10} fill="#c9a227" color="#b8920e" />
                <span>#{userRanking.position}</span>
                <span className="upp-rank-of">de {userRanking.totalUsers}</span>
              </div>
            </div>
          </div>

          {(userData.nationality || userData.favorite_team || userData.favorite_player || userData.created_at) && (
            <div className="upp-info-tags">
              {userData.nationality && <span className="upp-tag"><Globe size={10} />{userData.nationality}</span>}
              {userData.favorite_team && <span className="upp-tag upp-tag--red"><Trophy size={10} />{userData.favorite_team}</span>}
              {userData.favorite_player && <span className="upp-tag upp-tag--green"><Heart size={10} />{userData.favorite_player}</span>}
              {userData.created_at && <span className="upp-tag upp-tag--gold"><Calendar size={10} />Desde {fmtDate(userData.created_at)}</span>}
            </div>
          )}

          {userData.bio && <p className="upp-bio">{userData.bio}</p>}
        </div>

        {/* TABS */}
        <div className="upp-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`upp-tab${activeTab === tab.id ? ' upp-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENIDO */}
        <div className="upp-content">

          {activeTab === 'stats' && (
            <div className="upp-tab-panel">
              <SectionDivider icon={Zap} label={`Nivel ${userData.level}`} color="#c9a227" />
              <div className="upp-lvl-block">
                <div className="upp-lvl-bar-wrap">
                  <div className="upp-lvl-bar">
                    <div className="upp-lvl-fill" style={{ width: `${lvlProg}%` }} />
                  </div>
                  <span className="upp-lvl-pts">{lvlPts}/20 pts</span>
                </div>
              </div>

              <SectionDivider icon={TrendingUp} label="Estadísticas globales" color="#5b4fd8" />
              <div className="upp-stats-grid">
                <StatCard icon={Zap} label="Puntos" value={fmt(userData.points)} accent="#5b4fd8" />
                <StatCard icon={Target} label="Predicciones" value={fmt(userData.predictions)} accent="#3B82F6" />
                <StatCard icon={Star} label="Precisión" value={`${accuracy}%`} accent="#10B981" />
                <StatCard icon={Trophy} label="Correctas" value={fmt(userData.correct)} accent="#F59E0B" />
                <StatCard icon={Crown} label="Coronas" value={totalCrowns} accent="#c9a227" />
                <StatCard icon={Award} label="Posición" value={`#${userRanking.position}`} accent="#EC4899" />
              </div>

              <SectionDivider icon={Flame} label="Rachas" color="#EF4444" />
              <div className="upp-streaks-row">
                <div className="upp-streak upp-streak--fire">
                  <Flame size={26} fill="#EF4444" color="#DC2626" />
                  <span className="upp-streak-val">{streakData.current_streak}</span>
                  <span className="upp-streak-lbl">Racha actual</span>
                </div>
                <div className="upp-streak-sep" />
                <div className="upp-streak upp-streak--gold">
                  <Star size={26} fill="#c9a227" color="#b8920e" />
                  <span className="upp-streak-val">{streakData.best_streak}</span>
                  <span className="upp-streak-lbl">Mejor racha</span>
                </div>
              </div>

              <SectionDivider icon={TrendingUp} label="Este mes" color="#8b7fc7" />
              <div className="upp-stats-grid">
                <StatCard icon={Zap} label="Pts mes" value={fmt(userData.monthly_points)} accent="#8b7fc7" />
                <StatCard icon={Target} label="Preds mes" value={fmt(userData.monthly_predictions)} accent="#6366F1" />
                <StatCard icon={Star} label="Correctas" value={fmt(userData.monthly_correct)} accent="#10B981" />
              </div>
            </div>
          )}

          {activeTab === 'albums' && (
            <AlbumsTab userId={userId} />
          )}

          {activeTab === 'logros' && (
            <div className="upp-tab-panel">
              {activeTitle && (
                <>
                  <SectionDivider icon={Gem} label="Título activo" color={activeTitle.color || '#5b4fd8'} />
                  <div className="upp-active-title" style={{ '--title-color': activeTitle.color || '#5b4fd8' }}>
                    <div className="upp-active-title-icon"><Gem size={22} /></div>
                    <div className="upp-active-title-info">
                      <strong style={{ color: activeTitle.color || '#5b4fd8' }}>{activeTitle.name}</strong>
                      <p>{activeTitle.description}</p>
                    </div>
                    <div className="upp-equipped-tag"><Star size={9} />Equipado</div>
                  </div>
                </>
              )}

              <div className="upp-ach-summary">
                <span className="upp-ach-summary-nums">
                  <strong>{unlocked.length}</strong>/{allAch.length}
                </span>
                <span className="upp-ach-summary-lbl">logros desbloqueados</span>
                <div className="upp-ach-summary-bar">
                  <div
                    className="upp-ach-summary-fill"
                    style={{ width: `${allAch.length > 0 ? Math.round((unlocked.length / allAch.length) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {unlocked.length === 0 ? (
                <div className="upp-empty">
                  <Star size={36} opacity={0.25} />
                  <p>Haz predicciones para desbloquear logros</p>
                </div>
              ) : (
                Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
                  const items = grouped[catKey];
                  if (!items || items.length === 0) return null;
                  const color = CATEGORY_COLORS[catKey];
                  return (
                    <React.Fragment key={catKey}>
                      <div className="upp-ach-cat-hdr">
                        <div className="upp-ach-cat-line" style={{ background: color }} />
                        <span className="upp-ach-cat-lbl">{catLabel}</span>
                        <span className="upp-ach-cat-count" style={{ color }}>{items.length}</span>
                      </div>
                      <div className="upp-ach-list">
                        {items.map(a => <AchievementRow key={a.id} ach={a} unlocked />)}
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {locked.length > 0 && (
                <>
                  <div className="upp-ach-cat-hdr">
                    <div className="upp-ach-cat-line" style={{ background: 'var(--sb-border-light, #d4cfc8)', opacity: 0.5 }} />
                    <span className="upp-ach-cat-lbl" style={{ opacity: 0.45 }}>Bloqueados</span>
                    <span className="upp-ach-cat-count" style={{ opacity: 0.35 }}>{locked.length}</span>
                  </div>
                  <div className="upp-ach-list">
                    {locked.map(a => <AchievementRow key={a.id} ach={a} unlocked={false} />)}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'coronas' && (
            <div className="upp-tab-panel">
              <SectionDivider icon={Crown} label="Campeonatos" color="#c9a227" />

              {totalCrowns === 0 ? (
                <div className="upp-empty">
                  <Crown size={40} opacity={0.2} />
                  <p>¡Aún no ha ganado ningún campeonato!</p>
                  <span>Acumula puntos este mes para ganar</span>
                </div>
              ) : (
                <div className="upp-crowns-showcase">
                  <Crown size={40} fill="#c9a227" color="#b8920e" />
                  <div>
                    <span className="upp-crowns-num">{totalCrowns}</span>
                    <span className="upp-crowns-lbl">
                      {totalCrowns === 1 ? 'Corona' : 'Coronas'} ganadas
                    </span>
                  </div>
                  <div className="upp-crowns-icons">
                    {Array.from({ length: Math.min(totalCrowns, 6) }).map((_, i) => (
                      <Crown
                        key={i}
                        size={20}
                        fill="#c9a227"
                        color="#b8920e"
                        style={{ opacity: 1 - i * 0.06, transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 5}deg)` }}
                      />
                    ))}
                    {totalCrowns > 6 && <span className="upp-crowns-more">+{totalCrowns - 6}</span>}
                  </div>
                </div>
              )}

              <SectionDivider icon={TrendingUp} label="Este mes" color="#10B981" />
              <div className="upp-stats-grid">
                <StatCard icon={Zap} label="Pts mes" value={fmt(userData.monthly_points)} accent="#8b7fc7" />
                <StatCard icon={Target} label="Preds mes" value={fmt(userData.monthly_predictions)} accent="#3B82F6" />
                <StatCard icon={Star} label="Correctas" value={fmt(userData.monthly_correct)} accent="#10B981" />
                <StatCard icon={Crown} label="Coronas" value={totalCrowns} accent="#c9a227" />
              </div>

              {crowns.length > 0 && (
                <>
                  <SectionDivider icon={Calendar} label="Historial" color="#5b4fd8" />
                  <div className="upp-crown-history">
                    {crowns.map((c, i) => <CrownEntry key={c.id} crown={c} index={i} />)}
                  </div>
                </>
              )}
            </div>
          )}

          <div style={{ height: 20 }} />
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