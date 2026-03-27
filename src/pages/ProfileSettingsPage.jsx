import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Database, Info, ChevronRight,
  Trophy, Heart, Globe, Crown, Edit2, List,
  Grid3x3, Moon, Sun, Volume2, VolumeX, Eye, EyeOff,
  Download, Trash2, LogOut, AlertTriangle, Check,
  Save, X, Activity, RotateCcw, ArrowLeft, Settings,
  Lock, Layers, Award, Target, Zap, Flame, Star,
  TrendingUp, Calendar, CheckCircle2, XCircle, Clock,
  ArrowUpDown, Gamepad2, Image, Filter, NotebookPen
} from 'lucide-react';

import { ToastContainer, useToast } from '../components/ComFeedback/Toast';
import Footer from '../components/ComLayout/Footer';
import AdminAchievementsModal from '../components/ComAdmin/AdminAchievementsModal';
import AdminTitlesModal from '../components/ComAdmin/AdminTitlesModal';
import MobileNotes from "../components/ComMobile/MobileNotes";

import { useProfileData } from '../hooks/HooksProfile/useProfileData';
import { usePredictionHistory } from '../hooks/HooksProfile/usePredictionHistory';
import { useStreaks } from '../hooks/HooksProfile/useStreaks';
import { useAchievements } from '../hooks/HooksProfile/useAchievements';
import { useUserRanking } from '../hooks/HooksProfile/useUserRanking';
import { useMonthlyChampionships } from '../hooks/HooksProfile/useMonthlyChampionships';
import { useSettings } from '../hooks/HooksSettings/useSettings';
import MobileProfileMain from "../components/ComMobile/MobileProfileMain";
import { useTheme } from '../context/ThemeContext';

import AvatarUpload from '../components/ComProfile/AvatarUpload';
import ImageViewer from '../components/ComOthers/ImageViewer';

import { supabase } from '../utils/supabaseClient';
import { getPredictionResult, calculateAccuracy, calculateLevelProgress, getIconEmoji, getCategoryColor } from '../utils/profileUtils';

// ─── CSS unificado incrustado ────────────────────────────────
import '../styles/StylesPages/ProfileSettingsPage.css';

const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

/* ═══════════════════════════════════════════════════════════════
   NAV ITEMS — panel izquierdo en desktop / lista en mobile
═══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: 'overview',      icon: Grid3x3, label: 'Estadísticas',  group: 'perfil' },
  { id: 'achievements',  icon: Award,   label: 'Logros',         group: 'perfil' },
  { id: 'championships', icon: Crown,   label: 'Campeonatos',    group: 'perfil' },
  { id: 'history',       icon: List,    label: 'Historial',      group: 'perfil' },
  { id: 'edit',          icon: Edit2,   label: 'Editar Perfil',  group: 'perfil' },
  { id: 'notes',         icon: NotebookPen, label: 'Mis Notas',     group: 'perfil'   },
  { id: 'settings-account',       icon: User,     label: 'Cuenta',         group: 'ajustes' },
  { id: 'settings-appearance',    icon: Moon,     label: 'Apariencia',     group: 'ajustes' },
  { id: 'settings-notifications', icon: Bell,     label: 'Notificaciones', group: 'ajustes' },
  { id: 'settings-privacy',       icon: Shield,   label: 'Privacidad',     group: 'ajustes' },
  { id: 'settings-data',          icon: Database, label: 'Datos',          group: 'ajustes' },
  { id: 'settings-info',          icon: Info,     label: 'Información',    group: 'ajustes' },
];

const TAB_LABELS = Object.fromEntries(NAV_ITEMS.map(n => [n.id, n.label]));

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════════════════════════ */
function OverviewTab({ userData, currentUser, userRanking }) {
  const accuracy = calculateAccuracy(currentUser);
  const { pointsInLevel, pointsToNextLevel, levelProgress } = calculateLevelProgress(userData, currentUser);

  const items = [
    { label: 'Predicciones', value: fmt(currentUser?.predictions || 0), icon: Target,    color: '#c9a227' },
    { label: 'Puntos',       value: fmt(currentUser?.points || 0),      icon: Zap,       color: '#5b4fd8' },
    { label: 'Precisión',    value: `${accuracy}%`,                     icon: TrendingUp,color: '#1D9E75' },
    { label: 'Nivel',        value: userData.level || 1,                icon: Star,      color: '#a0652a' },
    { label: 'Ranking',      value: `#${userRanking.position || '—'}`,  icon: Trophy,    color: '#8a8a8a' },
    { label: 'Campeonatos',  value: userData.monthly_championships || 0,icon: Crown,     color: '#c9a227' },
  ];

  return (
    <div className="pnew-tab-content">
      {/* Nivel */}
      <div className="pnew-level-block">
        <div className="pnew-level-row">
          <span className="pnew-level-lbl">NIVEL {userData.level || 1}</span>
          <span className="pnew-level-pts">{pointsInLevel}/20 XP</span>
          <span className="pnew-level-next">—{pointsToNextLevel} pts</span>
        </div>
        <div className="pnew-level-track">
          <div className="pnew-level-fill" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>

      {/* Grid de stats */}
      <div className="pnew-stats-grid">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div className="pnew-stat-cell" key={item.label}>
              <div className="pnew-stat-icon" style={{ background: item.color }}>
                <Icon size={13} color="#fff" />
              </div>
              <div className="pnew-stat-val">{item.value}</div>
              <div className="pnew-stat-lbl">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ACHIEVEMENTS TAB
═══════════════════════════════════════════════════════════════ */
function AchievementsTab({ activeTitle, userTitles, userAchievements, availableAchievements, achievementsLoading }) {
  return (
    <div className="pnew-tab-content">
      {activeTitle && (
        <div className="pnew-active-title" style={{ borderColor: activeTitle.color }}>
          <Star size={14} style={{ color: activeTitle.color }} />
          <div>
            <div className="pnew-title-name" style={{ color: activeTitle.color }}>{activeTitle.name}</div>
            <div className="pnew-title-desc">{activeTitle.description}</div>
          </div>
          <span className="pnew-equipped-tag">EQUIPADO</span>
        </div>
      )}

      <div className="pnew-section-hdr">
        <span>TÍTULOS</span><span className="pnew-count-badge">{userTitles.length}</span>
      </div>
      {achievementsLoading ? (
        <div className="pnew-empty"><Activity size={24} className="spinner" /></div>
      ) : userTitles.length === 0 ? (
        <div className="pnew-empty"><Shield size={28} /><p>Sin títulos aún</p></div>
      ) : (
        <div className="pnew-titles-list">
          {userTitles.map(t => (
            <div key={t.id} className="pnew-title-row" style={{ borderLeftColor: t.color }}>
              <Crown size={13} style={{ color: t.color }} />
              <div>
                <div className="pnew-title-name" style={{ color: t.color }}>{t.name}</div>
                <div className="pnew-title-desc">{t.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pnew-section-hdr" style={{ marginTop: 16 }}>
        <span>LOGROS</span>
        <span className="pnew-count-badge">{userAchievements.length}/{availableAchievements.length}</span>
      </div>
      {achievementsLoading ? (
        <div className="pnew-empty"><Activity size={24} className="spinner" /></div>
      ) : userAchievements.length === 0 ? (
        <div className="pnew-empty"><Target size={28} /><p>Haz predicciones para desbloquear logros</p></div>
      ) : (
        <div className="pnew-achievements-grid">
          {userAchievements.map((ach, i) => (
            <div key={ach.id} className="pnew-ach-card">
              <div className="pnew-ach-emoji">{getIconEmoji(ach.icon)}</div>
              <div className="pnew-ach-name">{ach.name}</div>
              <div className="pnew-ach-desc">{ach.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAMPIONSHIPS TAB
═══════════════════════════════════════════════════════════════ */
function ChampionshipsTab({ userData, crownHistory, monthlyStats, championshipsLoading }) {
  const total = userData?.monthly_championships || 0;
  return (
    <div className="pnew-tab-content">
      <div className="pnew-crowns-hero">
        <Crown size={40} style={{ color: '#c9a227' }} />
        <div className="pnew-crowns-num" style={{ color: '#c9a227' }}>{total}</div>
        <div className="pnew-crowns-lbl">CAMPEONATOS GANADOS</div>
      </div>

      <div className="pnew-month-grid">
        <div className="pnew-month-cell">
          <div className="pnew-month-val">{userData?.monthly_points || 0}</div>
          <div className="pnew-month-lbl">PTS MES</div>
        </div>
        <div className="pnew-month-cell">
          <div className="pnew-month-val">{userData?.monthly_predictions || 0}</div>
          <div className="pnew-month-lbl">PREDS</div>
        </div>
        <div className="pnew-month-cell">
          <div className="pnew-month-val">{userData?.monthly_correct || 0}</div>
          <div className="pnew-month-lbl">ACIERTOS</div>
        </div>
      </div>

      {crownHistory?.length > 0 && (
        <>
          <div className="pnew-section-hdr" style={{ marginTop: 16 }}>
            <span>HISTORIAL</span>
          </div>
          <div className="pnew-crown-list">
            {crownHistory.map((c, i) => (
              <div key={c.id} className="pnew-crown-row">
                <div className="pnew-crown-rank" style={{ background: i === 0 ? '#c9a227' : i === 1 ? '#8a8a8a' : '#a0652a' }}>
                  #{i + 1}
                </div>
                <div>
                  <div className="pnew-crown-month">{c.month_year}</div>
                  <div className="pnew-crown-pts">{fmt(c.points)} pts</div>
                </div>
                <Crown size={14} style={{ color: '#c9a227', marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HISTORY TAB
═══════════════════════════════════════════════════════════════ */
function HistoryTab({ predictionHistory, historyLoading }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSort, setShowSort] = useState(false);

  const filtered = predictionHistory.filter(pred => {
    if (activeFilter === 'all') return true;
    const result = getPredictionResult(pred);
    if (activeFilter === 'active') return pred.matches?.status === 'pending';
    if (activeFilter === 'finished') return pred.matches?.status === 'finished';
    return result.status === activeFilter;
  });

  const counts = {
    all: predictionHistory.length,
    active: predictionHistory.filter(p => p.matches?.status === 'pending').length,
    finished: predictionHistory.filter(p => p.matches?.status === 'finished').length,
    exact: predictionHistory.filter(p => getPredictionResult(p).status === 'exact').length,
    correct: predictionHistory.filter(p => getPredictionResult(p).status === 'correct').length,
    wrong: predictionHistory.filter(p => getPredictionResult(p).status === 'wrong').length,
  };

  const filterLabel = { all: 'Todas', active: 'Activas', finished: 'Terminadas', exact: 'Exactas', correct: 'Acertadas', wrong: 'Falladas' };

  if (historyLoading) return (
    <div className="pnew-tab-content pnew-empty">
      <Activity size={28} className="spinner" /><p>Cargando historial...</p>
    </div>
  );

  return (
    <div className="pnew-tab-content">
      {/* Header historial */}
      <div className="pnew-hist-hdr">
        <div className="pnew-hist-title">
          <Gamepad2 size={16} />
          <span>Historial</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button className={`pnew-sort-btn${showSort ? ' active' : ''}`} onClick={() => setShowSort(v => !v)}>
            <ArrowUpDown size={13} />
            <span>{filterLabel[activeFilter]}</span>
          </button>
          {showSort && (
            <>
              <div className="pnew-sort-backdrop" onClick={() => setShowSort(false)} />
              <div className="pnew-sort-modal">
                {Object.entries(filterLabel).map(([key, lbl]) => (
                  <button
                    key={key}
                    className={`pnew-sort-opt${activeFilter === key ? ' active' : ''}`}
                    onClick={() => { setActiveFilter(key); setShowSort(false); }}
                  >
                    <span>{lbl}</span>
                    <span className="pnew-sort-count">{counts[key]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="pnew-count-badge">{counts.all}</div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="pnew-empty" style={{ marginTop: 24 }}>
          <Gamepad2 size={36} /><p>Sin predicciones</p>
        </div>
      ) : (
        <div className="pnew-hist-list">
          {filtered.map(pred => {
            const result = getPredictionResult(pred);
            const match = pred.matches;
            return (
              <div key={pred.id} className={`pnew-hist-card pnew-hist-card--${result.status}`}>
                {/* Header */}
                <div className="pnew-hist-card-hdr">
                  <span className="pnew-hist-league">{match?.league}</span>
                  <span className="pnew-hist-date">
                    <Calendar size={10} />{match?.date}
                  </span>
                </div>
                {/* Body */}
                <div className="pnew-hist-body">
                  <div className="pnew-hist-team">
                    <div className="pnew-hist-logo">
                      {match?.home_team_logo_url
                        ? <img src={match.home_team_logo_url} alt="" onError={e => (e.target.style.display='none')} />
                        : <span>{match?.home_team_logo || '⚽'}</span>}
                    </div>
                    <span className="pnew-hist-tname">{match?.home_team}</span>
                  </div>

                  <div className="pnew-hist-scores">
                    <div className="pnew-hist-score-wrap">
                      <div className="pnew-hist-score">{pred.home_score}</div>
                      <div className="pnew-hist-score">{pred.away_score}</div>
                    </div>
                    {match?.status === 'finished' && (
                      <div className="pnew-hist-real">
                        <span>{match.result_home}</span>
                        <span className="pnew-hist-sep">-</span>
                        <span>{match.result_away}</span>
                      </div>
                    )}
                  </div>

                  <div className="pnew-hist-team pnew-hist-team--right">
                    <span className="pnew-hist-tname">{match?.away_team}</span>
                    <div className="pnew-hist-logo">
                      {match?.away_team_logo_url
                        ? <img src={match.away_team_logo_url} alt="" onError={e => (e.target.style.display='none')} />
                        : <span>{match?.away_team_logo || '⚽'}</span>}
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="pnew-hist-card-ftr">
                  <div className={`pnew-hist-result pnew-hist-result--${result.status}`}>
                    {result.status === 'exact'   && <Trophy size={12} />}
                    {result.status === 'correct' && <CheckCircle2 size={12} />}
                    {result.status === 'wrong'   && <XCircle size={12} />}
                    {result.status === 'pending' && <Clock size={12} />}
                    <span>{result.label}</span>
                  </div>
                  {result.points > 0 && (
                    <div className="pnew-hist-pts">+{result.points} pts</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EDIT TAB
═══════════════════════════════════════════════════════════════ */
function EditTab({ userData, setUserData, currentUser, loading, handleSave, handleAvatarUpload, loadUserData, setActiveTab }) {
  const [userBanners, setUserBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) loadUserBanners();
  }, [currentUser?.id]);

  const loadUserBanners = async () => {
    setBannersLoading(true);
    try {
      const { data } = await supabase
        .from('user_banners')
        .select('*, available_banners(*)')
        .eq('user_id', currentUser.id);
      setUserBanners((data || []).map(r => r.available_banners).filter(Boolean));
    } catch (err) { console.error(err); }
    finally { setBannersLoading(false); }
  };

  const fields = [
    { key: 'name',            label: 'Nombre',          icon: User,    placeholder: 'Tu nombre' },
    { key: 'favorite_team',   label: 'Equipo favorito', icon: Trophy,  placeholder: 'Ej: Real Madrid' },
    { key: 'favorite_player', label: 'Jugador favorito',icon: Heart,   placeholder: 'Ej: Messi' },
    { key: 'nationality',     label: 'Nacionalidad',    icon: Globe,   placeholder: 'Ej: Colombia' },
  ];

  return (
    <div className="pnew-tab-content">
      {/* Avatar */}
      <div className="pnew-edit-avatar">
        <AvatarUpload
          currentUrl={userData.avatar_url}
          userId={currentUser.id}
          onUploadComplete={handleAvatarUpload}
          userLevel={userData.level}
        />
      </div>

      {/* Banner */}
      <div className="pnew-form-group">
        <label className="pnew-form-label"><Image size={13} /> Banner de Perfil</label>
        {bannersLoading ? (
          <p className="pnew-form-note">Cargando banners...</p>
        ) : (
          <div className="pnew-banner-list">
            <button
              className={`pnew-banner-opt${!userData.equipped_banner_url ? ' active' : ''}`}
              onClick={() => setUserData({ ...userData, equipped_banner_url: null })}
            >
              <div className="pnew-banner-preview pnew-banner-base" />
              <span>Banner Base</span>
              {!userData.equipped_banner_url && <Check size={12} className="pnew-banner-check" />}
            </button>
            {userBanners.map(b => (
              <button
                key={b.id}
                className={`pnew-banner-opt${userData.equipped_banner_url === b.image_url ? ' active' : ''}`}
                onClick={() => setUserData({ ...userData, equipped_banner_url: b.image_url === userData.equipped_banner_url ? null : b.image_url })}
              >
                <img src={b.image_url} alt={b.name} className="pnew-banner-preview" />
                <span>{b.name}</span>
                {userData.equipped_banner_url === b.image_url && <Check size={12} className="pnew-banner-check" />}
              </button>
            ))}
            {userBanners.length === 0 && <p className="pnew-form-note">No tienes banners desbloqueados.</p>}
          </div>
        )}
      </div>

      {/* Campos */}
      {fields.map(f => {
        const Icon = f.icon;
        return (
          <div key={f.key} className="pnew-form-group">
            <label className="pnew-form-label"><Icon size={13} /> {f.label}</label>
            <input
              type="text"
              className="pnew-form-input"
              value={userData[f.key] || ''}
              onChange={e => setUserData({ ...userData, [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          </div>
        );
      })}

      {/* Género */}
      <div className="pnew-form-group">
        <label className="pnew-form-label"><User size={13} /> Género</label>
        <select
          className="pnew-form-input"
          value={userData.gender || ''}
          onChange={e => setUserData({ ...userData, gender: e.target.value })}
        >
          <option value="">Seleccionar...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
          <option value="Prefiero no decir">Prefiero no decir</option>
        </select>
      </div>

      {/* Bio */}
      <div className="pnew-form-group">
        <label className="pnew-form-label"><Star size={13} /> Biografía</label>
        <textarea
          className="pnew-form-input pnew-form-textarea"
          rows={3}
          value={userData.bio || ''}
          onChange={e => setUserData({ ...userData, bio: e.target.value })}
          placeholder="Cuéntanos sobre ti..."
        />
      </div>

      {/* Acciones */}
      <div className="pnew-form-actions">
        <button className="pnew-save-btn" onClick={handleSave} disabled={loading}>
          {loading ? <Activity size={14} className="spinner" /> : <Save size={14} />}
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button className="pnew-cancel-btn" onClick={() => { loadUserData(); setActiveTab('overview'); }}>
          <X size={14} />Cancelar
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS SECTIONS
═══════════════════════════════════════════════════════════════ */
function SettingsSection({ section, preferences, saving, handleToggle, handleSelect, handleLogout,
  handleReset, handleExport, setShowDeleteConfirm, currentUser, theme, toggleTheme }) {

  const Toggle = ({ checked, onChange, disabled }) => (
    <button
      className={`pnew-toggle${checked ? ' pnew-toggle--on' : ''}`}
      onClick={onChange}
      disabled={disabled || saving}
    >
      <div className="pnew-toggle-knob" />
    </button>
  );

  const Row = ({ label, desc, danger, children }) => (
    <div className={`pnew-setting-row${danger ? ' pnew-setting-row--danger' : ''}`}>
      <div className="pnew-setting-info">
        <div className={`pnew-setting-lbl${danger ? ' pnew-text-danger' : ''}`}>{label}</div>
        {desc && <div className="pnew-setting-desc">{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const Card = ({ title, children }) => (
    <div className="pnew-settings-card">
      <div className="pnew-settings-card-hdr">{title}</div>
      <div className="pnew-settings-card-body">{children}</div>
    </div>
  );

  switch (section) {
    case 'account':
      return (
        <div className="pnew-tab-content">
          <div className="pnew-section-hdr"><span>CUENTA</span></div>
          <Card title="Información personal">
            <Row label="Nombre" desc={currentUser?.name} />
            <Row label="Correo" desc={currentUser?.email} />
          </Card>
          <Card title="Sesión">
            <Row label="Cerrar sesión" desc="Salir de tu cuenta actual" danger>
              <button className="pnew-btn-danger" onClick={handleLogout}>Salir</button>
            </Row>
          </Card>
        </div>
      );

    case 'appearance':
      return (
        <div className="pnew-tab-content">
          <div className="pnew-section-hdr"><span>APARIENCIA</span></div>
          <Card title="Tema">
            <Row label="Modo oscuro" desc="Cambiar entre tema claro y oscuro">
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
            </Row>
          </Card>
          <Card title="Texto">
            <Row label="Tamaño de fuente" desc="Ajusta el tamaño del texto">
              <select
                className="pnew-select"
                value={preferences.font_size}
                onChange={e => handleSelect('font_size', e.target.value)}
              >
                <option value="small">Pequeña</option>
                <option value="medium">Mediana</option>
                <option value="large">Grande</option>
              </select>
            </Row>
          </Card>
        </div>
      );

    case 'notifications':
      return (
        <div className="pnew-tab-content">
          <div className="pnew-section-hdr"><span>NOTIFICACIONES</span></div>
          <Card title="Push">
            <Row label="Notificaciones push" desc="Recibir alertas en tu dispositivo">
              <Toggle checked={preferences.push_enabled} onChange={() => handleToggle('push_enabled')} />
            </Row>
          </Card>
          <Card title="Tipos">
            <Row label="Nuevos partidos" desc="Cuando se publiquen partidos">
              <Toggle checked={preferences.notif_new_matches} onChange={() => handleToggle('notif_new_matches')} disabled={!preferences.push_enabled} />
            </Row>
            <Row label="Resultados" desc="Cuando terminen tus partidos">
              <Toggle checked={preferences.notif_finished_matches} onChange={() => handleToggle('notif_finished_matches')} disabled={!preferences.push_enabled} />
            </Row>
            <Row label="Nuevas ligas" desc="Ligas y torneos disponibles">
              <Toggle checked={preferences.notif_new_leagues} onChange={() => handleToggle('notif_new_leagues')} disabled={!preferences.push_enabled} />
            </Row>
            <Row label="Sonido" desc="Reproducir sonido en notificaciones">
              <Toggle checked={preferences.notif_sound} onChange={() => handleToggle('notif_sound')} disabled={!preferences.push_enabled} />
            </Row>
          </Card>
        </div>
      );

    case 'privacy':
      return (
        <div className="pnew-tab-content">
          <div className="pnew-section-hdr"><span>PRIVACIDAD</span></div>
          <Card title="Visibilidad">
            <Row label="Perfil público" desc="Otros usuarios pueden ver tu perfil">
              <Toggle checked={preferences.profile_public} onChange={() => handleToggle('profile_public')} />
            </Row>
            <Row label="Estadísticas en ranking" desc="Aparecer en rankings públicos">
              <Toggle checked={preferences.show_stats_in_ranking} onChange={() => handleToggle('show_stats_in_ranking')} />
            </Row>
            <Row label="Compartir actividad" desc="Mostrar tu actividad reciente">
              <Toggle checked={preferences.share_activity} onChange={() => handleToggle('share_activity')} />
            </Row>
            <Row label="Predicciones públicas" desc="Otros pueden ver tus predicciones">
              <Toggle checked={preferences.predictions_public} onChange={() => handleToggle('predictions_public')} />
            </Row>
          </Card>
        </div>
      );

    case 'data':
      return (
        <div className="pnew-tab-content">
          <div className="pnew-section-hdr"><span>DATOS</span></div>
          <Card title="Exportar">
            <Row label="Exportar mis datos" desc="Descargar toda tu información en JSON">
              <button className="pnew-btn-primary" onClick={handleExport}>Exportar</button>
            </Row>
            <Row label="Restaurar configuración" desc="Volver a los valores por defecto">
              <button className="pnew-btn-secondary" onClick={handleReset}>Restaurar</button>
            </Row>
          </Card>
          <Card title="Zona de peligro">
            <Row label="Cerrar sesión" desc="Salir de tu cuenta" danger>
              <button className="pnew-btn-danger" onClick={handleLogout}>Salir</button>
            </Row>
            <Row label="Eliminar cuenta" desc="Acción irreversible, elimina todos tus datos" danger>
              <button className="pnew-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Eliminar</button>
            </Row>
          </Card>
        </div>
      );

    case 'info':
      return (
        <div className="pnew-tab-content">
          <div className="pnew-section-hdr"><span>INFORMACIÓN</span></div>
          <Card title="App">
            <Row label="Versión" desc="GlobalScore v21.0.0" />
          </Card>
          <Card title="Legal">
            <Row label="Política de privacidad" desc="Cómo manejamos tus datos" />
            <Row label="Términos y condiciones" desc="Reglas de uso de la plataforma" />
          </Card>
        </div>
      );

    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   HERO DESKTOP (banner + avatar + info)
═══════════════════════════════════════════════════════════════ */
function ProfileHeroDesktop({ userData, currentUser }) {
  const [showViewer, setShowViewer] = useState(false);
  const accuracy = calculateAccuracy(currentUser);

  return (
    <div className="pnew-hero">
      {/* Banner */}
      <div className="pnew-hero-banner">
        {userData.equipped_banner_url
          ? <img src={userData.equipped_banner_url} alt="banner" className="pnew-hero-banner-img" />
          : <div className="pnew-hero-banner-gradient" />
        }
        <div className="pnew-hero-banner-overlay" />
      </div>

      {/* Avatar */}
      <div className="pnew-hero-avatar-wrap">
        <div
          className={`pnew-hero-avatar${userData.avatar_url ? ' clickable' : ''}`}
          onClick={() => userData.avatar_url && setShowViewer(true)}
        >
          {userData.avatar_url
            ? <img src={userData.avatar_url} alt={userData.name} />
            : <span>{(userData.name || 'U')[0].toUpperCase()}</span>
          }
        </div>
        <div className="pnew-hero-level">
          <Crown size={10} />
          <span>Lvl {userData.level || 1}</span>
        </div>
      </div>

      {/* Info */}
      <div className="pnew-hero-body">
        <h2 className="pnew-hero-name">{userData.name || 'Usuario'}</h2>
        <p className="pnew-hero-email">{userData.email}</p>
        {userData.bio && <p className="pnew-hero-bio">{userData.bio}</p>}

        <div className="pnew-hero-tags">
          {userData.favorite_team && <span className="pnew-hero-tag"><Trophy size={10} />{userData.favorite_team}</span>}
          {userData.favorite_player && <span className="pnew-hero-tag"><Heart size={10} />{userData.favorite_player}</span>}
          {userData.nationality && <span className="pnew-hero-tag"><Globe size={10} />{userData.nationality}</span>}
        </div>

        <div className="pnew-hero-stats">
          <div className="pnew-hero-stat">
            <span className="pnew-hero-stat-val" style={{ color: '#5b4fd8' }}>{fmt(currentUser?.points || 0)}</span>
            <span className="pnew-hero-stat-lbl">PUNTOS</span>
          </div>
          <div className="pnew-hero-stat-sep" />
          <div className="pnew-hero-stat">
            <span className="pnew-hero-stat-val" style={{ color: '#1D9E75' }}>{accuracy}%</span>
            <span className="pnew-hero-stat-lbl">PRECISIÓN</span>
          </div>
          <div className="pnew-hero-stat-sep" />
          <div className="pnew-hero-stat">
            <span className="pnew-hero-stat-val" style={{ color: '#c9a227' }}>{currentUser?.monthly_championships || 0}</span>
            <span className="pnew-hero-stat-lbl">CORONAS</span>
          </div>
        </div>
      </div>

      {showViewer && userData.avatar_url && (
        <ImageViewer imageUrl={userData.avatar_url} userName={userData.name} onClose={() => setShowViewer(false)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MAIN VIEW
═══════════════════════════════════════════════════════════════ */
function MobileMainView({ userData, currentUser, preferences, onTabClick, theme, toggleTheme, onLogout }) {
  return (
    <div className="pnew-mob-main">
 
      {/* ── HEADER: banner + avatar superpuesto ── */}
      <div className="pnew-mob-header">
        {/* Banner */}
        <div className="pnew-mob-banner">
          {userData.equipped_banner_url
            ? <img src={userData.equipped_banner_url} alt="banner" className="pnew-mob-banner-img" />
            : <div className="pnew-mob-banner-grad" />
          }
          <div className="pnew-mob-banner-overlay" />
        </div>
 
        {/* Avatar flotante — FUERA del user-row, posición absoluta */}
        <div className="pnew-mob-avatar-wrap">
          <div className="pnew-mob-avatar" onClick={() => onTabClick('edit')}>
            {userData.avatar_url
              ? <img src={userData.avatar_url} alt={userData.name} />
              : <span>{userData.name?.charAt(0)?.toUpperCase()}</span>
            }
          </div>
        </div>
 
        {/* User info row — sin avatar adentro */}
        <div className="pnew-mob-user-row" onClick={() => onTabClick('edit')}>
          <div className="pnew-mob-user-info">
            <span className="pnew-mob-name">{userData.name}</span>
            <span className="pnew-mob-sub">
              {userData.nationality && userData.nationality !== 'null'
                ? userData.nationality
                : userData.email || 'Ver perfil'}
            </span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        </div>
      </div>
 
      {/* ── Lista de opciones ── */}
      <div className="pnew-mob-list">
        {/* Dark mode toggle */}
        <div className="pnew-mob-row pnew-mob-row--toggle">
          <div className="pnew-mob-row-icon" style={{ background: '#5b4fd8' }}>
            {theme === 'dark' ? <Moon size={16} color="#fff" /> : <Sun size={16} color="#fff" />}
          </div>
          <span className="pnew-mob-row-lbl">Dark Mode</span>
          <button className={`pnew-toggle${theme === 'dark' ? ' pnew-toggle--on' : ''}`} onClick={toggleTheme}>
            <div className="pnew-toggle-knob" />
          </button>
        </div>
 
        {/* Nav items */}
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const colors = {
            overview: '#5b4fd8', achievements: '#c9a227', championships: '#a0652a',
            history: '#1D9E75', edit: '#8a8a8a',
            'settings-account': '#5b4fd8', 'settings-appearance': '#c9a227',
            'settings-notifications': '#a0652a', 'settings-privacy': '#1D9E75',
            'settings-data': '#8a8a8a', 'settings-info': '#5b4fd8'
          };
          return (
            <button key={item.id} className="pnew-mob-row" onClick={() => onTabClick(item.id)}>
              <div className="pnew-mob-row-icon" style={{ background: colors[item.id] || '#5b4fd8' }}>
                <Icon size={16} color="#fff" />
              </div>
              <span className="pnew-mob-row-lbl">{item.label}</span>
              <ChevronRight size={15} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
            </button>
          );
        })}
      </div>
 
      {/* Logout */}
      <div className="pnew-mob-logout-wrap">
        <button className="pnew-mob-logout" onClick={onLogout}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
 

/* ═══════════════════════════════════════════════════════════════
   MOBILE SUB-VIEW (header con back + contenido)
═══════════════════════════════════════════════════════════════ */
function MobileSubView({ tabId, onBack, children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const header = document.querySelector('.gs-mobile-header');
    if (header) header.style.display = 'none';
    return () => { if (header) header.style.display = ''; };
  }, []);

  return (
    <div className="pnew-mob-sub">
      <div className="pnew-mob-sub-hdr">
        <button className="pnew-mob-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="pnew-mob-sub-title">{TAB_LABELS[tabId] || ''}</h2>
      </div>
      <div className="pnew-mob-sub-body">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════ */
export default function ProfileSettingsPage({ currentUser, onBack }) {
  const [mobileView, setMobileView]   = useState('main');
  const [showMobileNotes, setShowMobileNotes] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdminAchievementsModal, setShowAdminAchievementsModal] = useState(false);
  const [showAdminTitlesModal, setShowAdminTitlesModal] = useState(false);

  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const { userData, setUserData, loading, loadUserData, saveUserData } = useProfileData(currentUser);
  const { predictionHistory, historyLoading } = usePredictionHistory(currentUser);
  const { streakData } = useStreaks(currentUser);
  const { userRanking } = useUserRanking(currentUser);
  const { crownHistory, monthlyStats, championshipsLoading } = useMonthlyChampionships(currentUser);
  const {
    userAchievements, userTitles, availableAchievements,
    achievementsLoading, getActiveTitle,
    handleSaveAchievement, handleDeleteAchievement,
    handleSaveTitle, handleDeleteTitle
  } = useAchievements(currentUser, streakData);

  const { preferences, saving, updatePreference, savePreferences, resetToDefaults, exportUserData, deleteAccount } = useSettings(currentUser);
  const activeTitle = getActiveTitle();

  const handleSave = () => {
    saveUserData(toast, () => {
      setActiveTab('overview');
      setMobileView('main');
    });
  };
  const handleMobileNavigate = (section) => {
    if (section === 'notes') {
      setShowMobileNotes(true);
      return;
    }
    setMobileView(`tab:${section}`);
  };

  const handleAvatarUpload = (url) => {
    setUserData({ ...userData, avatar_url: url });
    toast.success('Avatar actualizado!');
  };

  const handleToggle = async (key) => {
    const res = await updatePreference(key, !preferences[key]);
    if (!res.success) toast.error('Error al guardar');
  };

  const handleSelect = async (key, val) => { await updatePreference(key, val); };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleReset = async () => {
    if (!confirm('¿Restaurar configuraciones por defecto?')) return;
    const res = await resetToDefaults();
    if (res.success) toast.success('Configuración restaurada');
    else toast.error('Error al restaurar');
  };

  const handleExport = async () => {
    const res = await exportUserData();
    if (res.success) toast.success('Datos exportados');
    else toast.error('Error al exportar');
  };

  const handleDeleteAccount = async () => {
    const res = await deleteAccount();
    if (res.success) { toast.success('Cuenta eliminada'); window.location.href = '/'; }
    else toast.error('Error al eliminar cuenta');
  };

  /* Render del contenido del tab activo */
  const renderContent = (tab) => {
    const settingsProps = {
      preferences, saving, handleToggle, handleSelect,
      handleLogout, handleReset, handleExport, setShowDeleteConfirm,
      currentUser, theme, toggleTheme
    };

    if (tab.startsWith('settings-')) {
      const section = tab.replace('settings-', '');
      return <SettingsSection section={section} {...settingsProps} />;
    }

    switch (tab) {
      case 'overview':
        return <OverviewTab userData={userData} currentUser={currentUser} userRanking={userRanking} />;
      case 'achievements':
        return <AchievementsTab
          activeTitle={activeTitle} userTitles={userTitles}
          userAchievements={userAchievements} availableAchievements={availableAchievements}
          achievementsLoading={achievementsLoading}
        />;
      case 'championships':
        return <ChampionshipsTab
          userData={{ ...userData, ...monthlyStats }}
          crownHistory={crownHistory} monthlyStats={monthlyStats}
          championshipsLoading={championshipsLoading}
        />;
      case 'history':
        return <HistoryTab predictionHistory={predictionHistory} historyLoading={historyLoading} />;
      case 'edit':
        return <EditTab
          userData={userData} setUserData={setUserData}
          currentUser={currentUser} loading={loading}
          handleSave={handleSave} handleAvatarUpload={handleAvatarUpload}
          loadUserData={loadUserData}
          setActiveTab={t => { setActiveTab(t); setMobileView('main'); }}
        />;
        case 'notes':
          return null;
      default: return null;
    }
  };

  const isMobileSub = mobileView.startsWith('tab:');
  const currentMobileTab = isMobileSub ? mobileView.replace('tab:', '') : null;

  return (
    <div className="pnew-page page-root">

      {/* ─── MOBILE ─── */}
      <div className="pnew-mobile-wrapper">
        {mobileView === 'main' && (
          <MobileProfileMain
            currentUser={{ ...currentUser, ...userData }}
            isDark={theme === 'dark'}
            onToggleDark={toggleTheme}
            onNavigate={handleMobileNavigate}
            onLogout={handleLogout}
            onAvatarClick={() => setMobileView('tab:edit')}
          />
        )}
        {isMobileSub && (
          <MobileSubView tabId={currentMobileTab} onBack={() => setMobileView('main')}>
            {renderContent(currentMobileTab)}
          </MobileSubView>
        )}
        {/* ── MOBILE: Vista notas (overlay completo) ── */}
        {showMobileNotes && (
          <MobileNotes
            currentUser={currentUser}
            onBack={() => { setShowMobileNotes(false); setMobileView('main'); }}
          />
        )}
      </div>

      {/* ─── DESKTOP 2 columnas ─── */}
      <div className="pnew-desktop-wrapper">
        <div className="pnew-desktop-layout">

          {/* COL IZQUIERDA — Hero + Nav */}
          <div className="pnew-desktop-left">
            <ProfileHeroDesktop userData={userData} currentUser={currentUser} />

            {/* Panel nav */}
            <nav className="pnew-nav">
              {['perfil', 'ajustes'].map(group => (
                <div key={group} className="pnew-nav-group">
                  <div className="pnew-nav-group-lbl">{group.toUpperCase()}</div>
                  {NAV_ITEMS.filter(n => n.group === group).map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`pnew-nav-item${isActive ? ' pnew-nav-item--active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                        {isActive && <div className="pnew-nav-item-indicator" />}
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="pnew-nav-logout">
                <button className="pnew-nav-logout-btn" onClick={handleLogout}>
                  <LogOut size={15} /> Cerrar sesión
                </button>
              </div>
            </nav>
          </div>

          {/* COL DERECHA — Contenido */}
          <div className="pnew-desktop-right">
            {renderContent(activeTab)}
          </div>

        </div>
      </div>

      {/* Footer desktop */}
      <div className="pnew-footer-desktop"><Footer /></div>

      {/* Modal eliminar cuenta */}
      {showDeleteConfirm && (
        <>
          <div className="pnew-modal-backdrop" onClick={() => setShowDeleteConfirm(false)} />
          <div className="pnew-modal-danger">
            <AlertTriangle size={36} style={{ color: '#ef4444' }} />
            <h3>¿Eliminar cuenta?</h3>
            <p>Esta acción <strong>NO se puede deshacer</strong>. Se eliminarán todos tus datos permanentemente.</p>
            <div className="pnew-modal-actions">
              <button className="pnew-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="pnew-btn-danger" onClick={handleDeleteAccount}>Eliminar mi cuenta</button>
            </div>
          </div>
        </>
      )}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {showAdminAchievementsModal && (
        <AdminAchievementsModal
          onClose={() => setShowAdminAchievementsModal(false)}
          onSave={d => handleSaveAchievement(d, toast)}
          onDelete={id => handleDeleteAchievement(id, toast)}
        />
      )}
      {showAdminTitlesModal && (
        <AdminTitlesModal
          onClose={() => setShowAdminTitlesModal(false)}
          onSave={d => handleSaveTitle(d, toast)}
          onDelete={id => handleDeleteTitle(id, toast)}
        />
      )}
    </div>
  );
}