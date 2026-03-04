// src/pages/ProfileSettingsPage.jsx
import React, { useState } from 'react';
import {
  User, Bell, Shield, Database, Info, ChevronRight,
  Target, Trophy, Heart, Globe, Crown, Edit2, List,
  Grid3x3, Moon, Sun, Volume2, VolumeX, Eye, EyeOff,
  Download, Trash2, LogOut, AlertTriangle, Check,
  Save, X, Activity, RotateCcw, ArrowLeft, Settings,
  Phone, Lock, Layers, Award
} from 'lucide-react';

import { ToastContainer, useToast } from '../components/ComOthers/Toast';
import Footer from '../components/ComOthers/Footer';
import AdminAchievementsModal from '../components/ComAdmin/AdminAchievementsModal';
import AdminTitlesModal from '../components/ComAdmin/AdminTitlesModal';

// Hooks Profile
import { useProfileData } from '../hooks/HooksProfile/useProfileData';
import { usePredictionHistory } from '../hooks/HooksProfile/usePredictionHistory';
import { useStreaks } from '../hooks/HooksProfile/useStreaks';
import { useAchievements } from '../hooks/HooksProfile/useAchievements';
import { useUserRanking } from '../hooks/HooksProfile/useUserRanking';
import { useMonthlyChampionships } from '../hooks/HooksProfile/useMonthlyChampionships';

// Hooks Settings
import { useSettings } from '../hooks/HooksSettings/useSettings';
import { useTheme } from '../context/ThemeContext';

// Componentes Profile
import ProfileHero from '../components/ComProfile/ProfileHero';
import ProfileTabs from '../components/ComProfile/ProfileTabs';
import OverviewTab from '../components/ComProfile/OverviewTab';
import AchievementsTab from '../components/ComProfile/AchievementsTab';
import MonthlyChampionshipsTab from '../components/ComProfile/MonthlyChampionshipsTab';
import HistoryTab from '../components/ComProfile/HistoryTab';
import EditTab from '../components/ComProfile/EditTab';

import { supabase } from '../utils/supabaseClient';
import '../styles/StylesPages/ProfileSettingsPage.css';
import '../styles/StylesPages/ProfilePageNew.css';
import '../styles/StylesPages/ProfileSettingsPage.css';

// ─────────────────────────────────────────────
// VISTA MÓVIL — Pantalla principal (lista estilo imagen)
// ─────────────────────────────────────────────
function MobileMainView({ userData, currentUser, preferences, onSectionClick, onTabClick, theme, toggleTheme }) {
  const accuracy = currentUser?.predictions > 0
    ? Math.round((currentUser.correct / currentUser.predictions) * 100)
    : 0;

  return (
    <div className="psp-mobile-main">
      {/* ── HERO BANNER ── */}
      <div className="psp-hero-banner">
        {userData.equipped_banner_url
          ? <img src={userData.equipped_banner_url} alt="banner" className="psp-hero-banner-img" />
          : <div className="psp-hero-banner-gradient" />
        }
        <div className="psp-hero-overlay" />

        {/* Avatar */}
        <div className="psp-hero-content">
          <div className="psp-avatar-wrap">
            <div className="psp-avatar" onClick={() => onTabClick('edit')}>
              {userData.avatar_url
                ? <img src={userData.avatar_url} alt={userData.name} />
                : <span>{userData.name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className="psp-level-badge">
              <Crown size={11} fill="currentColor" />
              <span>Lvl {userData.level || 1}</span>
            </div>
          </div>

          <h2 className="psp-hero-name">{userData.name}</h2>
          {userData.nationality && (
            <p className="psp-hero-location">
              <Globe size={12} />
              {userData.nationality}
            </p>
          )}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="psp-stats-strip">
        <div className="psp-stat">
          <span className="psp-stat-val">{currentUser?.predictions || 0}</span>
          <span className="psp-stat-lbl">Predicciones</span>
        </div>
        <div className="psp-stat-divider" />
        <div className="psp-stat">
          <span className="psp-stat-val">{currentUser?.points || 0}</span>
          <span className="psp-stat-lbl">Puntos</span>
        </div>
        <div className="psp-stat-divider" />
        <div className="psp-stat">
          <span className="psp-stat-val">{accuracy}%</span>
          <span className="psp-stat-lbl">Precisión</span>
        </div>
      </div>

      {/* ── SECCIÓN ACCOUNT ── */}
      <div className="psp-section-label">Account</div>
      <div className="psp-card-list">
        <button className="psp-list-row" onClick={() => onTabClick('overview')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-orange-bg)', color: 'var(--psp-icon-orange)' }}>
            <User size={20} />
          </div>
          <span className="psp-row-label">Personal Data</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>

        <button className="psp-list-row" onClick={() => onTabClick('achievements')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-blue-bg)', color: 'var(--psp-icon-blue)' }}>
            <Award size={20} />
          </div>
          <span className="psp-row-label">Logros y Títulos</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>

        <button className="psp-list-row" onClick={() => onTabClick('history')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-green-bg)', color: 'var(--psp-icon-green)' }}>
            <List size={20} />
          </div>
          <span className="psp-row-label">Historial</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>

        <button className="psp-list-row" onClick={() => onTabClick('championships')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-yellow-bg)', color: 'var(--psp-icon-yellow)' }}>
            <Crown size={20} />
          </div>
          <span className="psp-row-label">Campeonatos</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>
      </div>

      {/* ── SECCIÓN NOTIFICATION ── */}
      <div className="psp-section-label">Notification</div>
      <div className="psp-card-list">
        <div className="psp-list-row psp-row-toggle">
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-orange-bg)', color: 'var(--psp-icon-orange)' }}>
            <Bell size={20} />
          </div>
          <span className="psp-row-label">Pop-up Notification</span>
          <button
            className={`psp-toggle ${preferences.push_enabled ? 'psp-toggle--on' : ''}`}
            onClick={() => onSectionClick('notifications')}
          >
            <div className="psp-toggle-knob" />
          </button>
        </div>
      </div>

      {/* ── SECCIÓN SETTINGS ── */}
      <div className="psp-section-label">Settings</div>
      <div className="psp-card-list">
        <button className="psp-list-row" onClick={() => onSectionClick('appearance')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-purple-bg)', color: 'var(--psp-icon-purple)' }}>
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <span className="psp-row-label">Apariencia</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>

        <button className="psp-list-row" onClick={() => onSectionClick('privacy')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-teal-bg)', color: 'var(--psp-icon-teal)' }}>
            <Shield size={20} />
          </div>
          <span className="psp-row-label">Privacidad</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>

        <button className="psp-list-row" onClick={() => onSectionClick('data')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-pink-bg)', color: 'var(--psp-icon-pink)' }}>
            <Database size={20} />
          </div>
          <span className="psp-row-label">Datos</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>

        <button className="psp-list-row" onClick={() => onSectionClick('info')}>
          <div className="psp-row-icon" style={{ background: 'var(--psp-icon-blue-bg)', color: 'var(--psp-icon-blue)' }}>
            <Info size={20} />
          </div>
          <span className="psp-row-label">Información</span>
          <ChevronRight size={18} className="psp-chevron" />
        </button>
      </div>

      {/* ── EDIT PROFILE BUTTON ── */}
      <div className="psp-edit-btn-wrap">
        <button className="psp-edit-btn" onClick={() => onTabClick('edit')}>
          <Edit2 size={16} />
          Editar Perfil
        </button>
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// VISTA MÓVIL — Sub-pantalla de ajuste (settings detail)
// ─────────────────────────────────────────────
function MobileSettingDetail({ section, preferences, theme, toggleTheme, onBack, onToggle, onSelect, onExport, onReset, onLogout, onDeleteAccount, saving, currentUser }) {
  const sectionTitles = {
    notifications: 'Notificaciones',
    appearance: 'Apariencia',
    privacy: 'Privacidad',
    data: 'Datos',
    info: 'Información',
    predictions: 'Predicciones',
  };

  const ToggleRow = ({ icon: Icon, label, desc, prefKey, disabled }) => (
    <div className="psp-setting-row">
      <div className="psp-setting-info">
        {Icon && <div className="psp-setting-icon"><Icon size={18} /></div>}
        <div>
          <div className="psp-setting-label">{label}</div>
          {desc && <div className="psp-setting-desc">{desc}</div>}
        </div>
      </div>
      <button
        className={`psp-toggle ${preferences[prefKey] ? 'psp-toggle--on' : ''}`}
        onClick={() => onToggle(prefKey)}
        disabled={disabled || saving}
      >
        <div className="psp-toggle-knob" />
      </button>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'notifications':
        return (
          <>
            <ToggleRow icon={Bell} label="Notificaciones push" desc="Recibir alertas en tu dispositivo" prefKey="push_enabled" />
            <div className="psp-subsection-label">Tipos</div>
            <ToggleRow label="Nuevos partidos" prefKey="notif_new_matches" disabled={!preferences.push_enabled} />
            <ToggleRow label="Resultados finalizados" prefKey="notif_finished_matches" disabled={!preferences.push_enabled} />
            <ToggleRow label="Nuevas ligas/premios" prefKey="notif_new_leagues" disabled={!preferences.push_enabled} />
            <ToggleRow label="Recordatorios" prefKey="notif_reminders" disabled={!preferences.push_enabled} />
            <ToggleRow icon={preferences.notif_sound ? Volume2 : VolumeX} label="Sonido" prefKey="notif_sound" disabled={!preferences.push_enabled} />
          </>
        );
      case 'appearance':
        return (
          <>
            <div className="psp-setting-row">
              <div className="psp-setting-info">
                <div className="psp-setting-icon">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</div>
                <div>
                  <div className="psp-setting-label">Modo oscuro</div>
                  <div className="psp-setting-desc">Cambiar entre tema claro y oscuro</div>
                </div>
              </div>
              <button className={`psp-toggle ${theme === 'dark' ? 'psp-toggle--on' : ''}`} onClick={toggleTheme}>
                <div className="psp-toggle-knob" />
              </button>
            </div>
            <div className="psp-setting-row">
              <div className="psp-setting-info">
                <div className="psp-setting-icon"><Eye size={18} /></div>
                <div><div className="psp-setting-label">Tamaño de fuente</div></div>
              </div>
              <select
                className="psp-select"
                value={preferences.font_size}
                onChange={(e) => onSelect('font_size', e.target.value)}
              >
                <option value="small">Pequeña</option>
                <option value="medium">Mediana</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </>
        );
      case 'privacy':
        return (
          <>
            <ToggleRow icon={Eye} label="Perfil público" desc="Otros usuarios pueden ver tu perfil" prefKey="profile_public" />
            <ToggleRow icon={Target} label="Mostrar estadísticas" desc="Aparecer en rankings públicos" prefKey="show_stats_in_ranking" />
            <ToggleRow icon={Bell} label="Compartir actividad" desc="Mostrar tu actividad reciente" prefKey="share_activity" />
            <ToggleRow icon={preferences.predictions_public ? Eye : EyeOff} label="Predicciones públicas" desc="Otros pueden ver tus predicciones" prefKey="predictions_public" />
          </>
        );
      case 'data':
        return (
          <>
            <div className="psp-setting-row">
              <div className="psp-setting-info">
                <div className="psp-setting-icon"><Download size={18} /></div>
                <div>
                  <div className="psp-setting-label">Exportar mis datos</div>
                  <div className="psp-setting-desc">Descargar tu información en JSON</div>
                </div>
              </div>
              <button className="psp-btn-small psp-btn-primary" onClick={onExport}>Exportar</button>
            </div>
            <div className="psp-setting-row">
              <div className="psp-setting-info">
                <div className="psp-setting-icon"><RotateCcw size={18} /></div>
                <div>
                  <div className="psp-setting-label">Restaurar configuración</div>
                  <div className="psp-setting-desc">Volver a valores por defecto</div>
                </div>
              </div>
              <button className="psp-btn-small psp-btn-secondary" onClick={onReset}>Restaurar</button>
            </div>
            <div className="psp-setting-row">
              <div className="psp-setting-info">
                <div className="psp-setting-icon psp-icon-danger"><LogOut size={18} /></div>
                <div>
                  <div className="psp-setting-label">Cerrar sesión</div>
                </div>
              </div>
              <button className="psp-btn-small psp-btn-danger" onClick={onLogout}>Salir</button>
            </div>
            <div className="psp-setting-row psp-row-danger">
              <div className="psp-setting-info">
                <div className="psp-setting-icon psp-icon-danger"><Trash2 size={18} /></div>
                <div>
                  <div className="psp-setting-label psp-text-danger">Eliminar cuenta</div>
                  <div className="psp-setting-desc">Acción irreversible</div>
                </div>
              </div>
              <button className="psp-btn-small psp-btn-danger" onClick={onDeleteAccount}>Eliminar</button>
            </div>
          </>
        );
      case 'info':
        return (
          <>
            <div className="psp-setting-row">
              <div className="psp-setting-info">
                <div className="psp-setting-icon"><Info size={18} /></div>
                <div>
                  <div className="psp-setting-label">Versión</div>
                  <div className="psp-setting-desc">GlobalScore v20.0.0</div>
                </div>
              </div>
            </div>
            <div className="psp-setting-row psp-row-clickable">
              <div className="psp-setting-info">
                <div className="psp-setting-icon"><Shield size={18} /></div>
                <div><div className="psp-setting-label">Política de privacidad</div></div>
              </div>
              <ChevronRight size={18} className="psp-chevron" />
            </div>
            <div className="psp-setting-row psp-row-clickable">
              <div className="psp-setting-info">
                <div className="psp-setting-icon"><Info size={18} /></div>
                <div><div className="psp-setting-label">Términos y condiciones</div></div>
              </div>
              <ChevronRight size={18} className="psp-chevron" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="psp-mobile-detail">
      {/* Header */}
      <div className="psp-detail-header">
        <button className="psp-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="psp-detail-title">{sectionTitles[section] || section}</h2>
        <div style={{ width: 36 }} />
      </div>

      <div className="psp-detail-content">
        <div className="psp-settings-card">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VISTA MÓVIL — Sub-pantalla de pestaña de perfil
// ─────────────────────────────────────────────
function MobileTabView({ activeTab, onBack, children, tabTitle }) {
  return (
    <div className="psp-mobile-detail">
      <div className="psp-detail-header">
        <button className="psp-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="psp-detail-title">{tabTitle}</h2>
        <div style={{ width: 36 }} />
      </div>
      <div className="psp-detail-content">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function ProfileSettingsPage({ currentUser, onBack }) {
  // Mobile navigation state
  const [mobileView, setMobileView] = useState('main'); // 'main' | 'setting:{section}' | 'tab:{tabId}'
  
  // Desktop tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Admin modals
  const [showAdminAchievementsModal, setShowAdminAchievementsModal] = useState(false);
  const [showAdminTitlesModal, setShowAdminTitlesModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);

  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  // ── Profile hooks ──
  const { userData, setUserData, loading, loadUserData, saveUserData } = useProfileData(currentUser);
  const { predictionHistory, historyLoading } = usePredictionHistory(currentUser);
  const { streakData } = useStreaks(currentUser);
  const { userRanking } = useUserRanking(currentUser);
  const { crownHistory, monthlyStats, championshipsLoading } = useMonthlyChampionships(currentUser);
  const {
    userAchievements, userTitles, availableAchievements, availableTitles,
    achievementsLoading, getActiveTitle, handleSaveAchievement,
    handleDeleteAchievement, handleSaveTitle, handleDeleteTitle
  } = useAchievements(currentUser, streakData);

  // ── Settings hooks ──
  const {
    preferences, saving, updatePreference, savePreferences,
    resetToDefaults, exportUserData, deleteAccount
  } = useSettings(currentUser);

  const activeTitle = getActiveTitle();

  // ── Handlers ──
  const handleSave = () => {
    saveUserData(toast, () => {
      setActiveTab('overview');
      setMobileView('main');
      setTimeout(() => { if (onBack) onBack(); }, 1500);
    });
  };

  const handleAvatarUpload = (newUrl) => {
    setUserData({ ...userData, avatar_url: newUrl });
    toast.success('Avatar actualizado!');
  };

  const handleToggle = async (key) => {
    const result = await updatePreference(key, !preferences[key]);
    if (!result.success) toast.error('Error al guardar');
  };

  const handleSelect = async (key, value) => {
    await updatePreference(key, value);
  };

  const handleReset = async () => {
    if (!confirm('¿Restaurar todas las configuraciones por defecto?')) return;
    const result = await resetToDefaults();
    if (result.success) toast.success('Configuración restaurada');
    else toast.error('Error al restaurar');
  };

  const handleExport = async () => {
    const result = await exportUserData();
    if (result.success) toast.success('Datos exportados');
    else toast.error('Error al exportar');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) { toast.success('Cuenta eliminada'); window.location.href = '/'; }
    else toast.error('Error al eliminar cuenta');
  };

  // ── Tab labels for mobile header ──
  const tabTitles = {
    overview: 'Estadísticas',
    achievements: 'Logros',
    championships: 'Campeonatos',
    history: 'Historial',
    edit: 'Editar Perfil',
  };

  // ── Render profile tab content ──
  const renderTabContent = (tab) => {
    switch (tab) {
      case 'overview':
        return <OverviewTab userData={userData} currentUser={currentUser} userRanking={userRanking} />;
      case 'achievements':
        return (
          <AchievementsTab
            activeTitle={activeTitle} userTitles={userTitles}
            userAchievements={userAchievements} availableAchievements={availableAchievements}
            achievementsLoading={achievementsLoading}
          />
        );
      case 'championships':
        return (
          <MonthlyChampionshipsTab
            userData={{ ...userData, ...monthlyStats }} crownHistory={crownHistory}
            monthlyStats={monthlyStats} championshipsLoading={championshipsLoading}
          />
        );
      case 'history':
        return <HistoryTab predictionHistory={predictionHistory} historyLoading={historyLoading} />;
      case 'edit':
        return (
          <EditTab
            userData={userData} setUserData={setUserData}
            currentUser={currentUser} loading={loading}
            handleSave={handleSave} handleAvatarUpload={handleAvatarUpload}
            loadUserData={loadUserData} setActiveTab={(t) => { setActiveTab(t); setMobileView('main'); }}
          />
        );
      default:
        return null;
    }
  };

  // ── Desktop settings content ──
  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button className={`psp-toggle ${checked ? 'psp-toggle--on' : ''}`} onClick={onChange} disabled={disabled || saving}>
      <div className="psp-toggle-knob" />
    </button>
  );

  const SettingItem = ({ icon: Icon, label, description, children, danger }) => (
    <div className={`psp-setting-row ${danger ? 'psp-row-danger' : ''}`}>
      <div className="psp-setting-info">
        {Icon && <div className={`psp-setting-icon ${danger ? 'psp-icon-danger' : ''}`}><Icon size={18} /></div>}
        <div>
          <div className={`psp-setting-label ${danger ? 'psp-text-danger' : ''}`}>{label}</div>
          {description && <div className="psp-setting-desc">{description}</div>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );

  const renderDesktopSettings = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="psp-settings-section">
            <h3 className="psp-settings-section-title">Información de la Cuenta</h3>
            <SettingItem icon={User} label="Nombre" description={currentUser?.name} />
            <SettingItem icon={User} label="Correo" description={currentUser?.email} />
            <SettingItem icon={LogOut} label="Cerrar sesión" danger>
              <button className="psp-btn-small psp-btn-danger" onClick={handleLogout}>Salir</button>
            </SettingItem>
          </div>
        );
      case 'appearance':
        return (
          <div className="psp-settings-section">
            <h3 className="psp-settings-section-title">Apariencia</h3>
            <SettingItem icon={theme === 'dark' ? Moon : Sun} label="Modo oscuro" description="Cambiar entre tema claro y oscuro">
              <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
            </SettingItem>
            <SettingItem icon={Eye} label="Tamaño de fuente">
              <select className="psp-select" value={preferences.font_size} onChange={(e) => handleSelect('font_size', e.target.value)}>
                <option value="small">Pequeña</option>
                <option value="medium">Mediana</option>
                <option value="large">Grande</option>
              </select>
            </SettingItem>
          </div>
        );
      case 'notifications':
        return (
          <div className="psp-settings-section">
            <h3 className="psp-settings-section-title">Notificaciones</h3>
            <SettingItem icon={Bell} label="Push" description="Recibir notificaciones en tu dispositivo">
              <ToggleSwitch checked={preferences.push_enabled} onChange={() => handleToggle('push_enabled')} />
            </SettingItem>
            <SettingItem label="Nuevos partidos">
              <ToggleSwitch checked={preferences.notif_new_matches} onChange={() => handleToggle('notif_new_matches')} disabled={!preferences.push_enabled} />
            </SettingItem>
            <SettingItem label="Resultados">
              <ToggleSwitch checked={preferences.notif_finished_matches} onChange={() => handleToggle('notif_finished_matches')} disabled={!preferences.push_enabled} />
            </SettingItem>
            <SettingItem label="Nuevas ligas">
              <ToggleSwitch checked={preferences.notif_new_leagues} onChange={() => handleToggle('notif_new_leagues')} disabled={!preferences.push_enabled} />
            </SettingItem>
            <SettingItem icon={preferences.notif_sound ? Volume2 : VolumeX} label="Sonido">
              <ToggleSwitch checked={preferences.notif_sound} onChange={() => handleToggle('notif_sound')} disabled={!preferences.push_enabled} />
            </SettingItem>
          </div>
        );
      case 'privacy':
        return (
          <div className="psp-settings-section">
            <h3 className="psp-settings-section-title">Privacidad</h3>
            <SettingItem icon={Eye} label="Perfil público">
              <ToggleSwitch checked={preferences.profile_public} onChange={() => handleToggle('profile_public')} />
            </SettingItem>
            <SettingItem icon={Target} label="Estadísticas en ranking">
              <ToggleSwitch checked={preferences.show_stats_in_ranking} onChange={() => handleToggle('show_stats_in_ranking')} />
            </SettingItem>
            <SettingItem icon={Bell} label="Compartir actividad">
              <ToggleSwitch checked={preferences.share_activity} onChange={() => handleToggle('share_activity')} />
            </SettingItem>
          </div>
        );
      case 'data':
        return (
          <div className="psp-settings-section">
            <h3 className="psp-settings-section-title">Gestión de Datos</h3>
            <SettingItem icon={Download} label="Exportar mis datos" description="Descargar en JSON">
              <button className="psp-btn-small psp-btn-primary" onClick={handleExport}>Exportar</button>
            </SettingItem>
            <SettingItem icon={RotateCcw} label="Restaurar configuración">
              <button className="psp-btn-small psp-btn-secondary" onClick={handleReset}>Restaurar</button>
            </SettingItem>
            <SettingItem icon={Trash2} label="Eliminar cuenta" description="Acción irreversible" danger>
              <button className="psp-btn-small psp-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Eliminar</button>
            </SettingItem>
          </div>
        );
      case 'info':
        return (
          <div className="psp-settings-section">
            <h3 className="psp-settings-section-title">Información</h3>
            <SettingItem icon={Info} label="Versión" description="GlobalScore v20.0.0" />
            <SettingItem icon={Shield} label="Política de privacidad" />
            <SettingItem icon={Info} label="Términos y condiciones" />
          </div>
        );
      default:
        return null;
    }
  };

  // ── Desktop sidebar sections ──
  const settingsSections = [
    { id: 'account', label: 'Cuenta', icon: User },
    { id: 'appearance', label: 'Apariencia', icon: theme === 'dark' ? Moon : Sun },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'data', label: 'Datos', icon: Database },
    { id: 'info', label: 'Información', icon: Info },
  ];

  // ── Parse mobile view ──
  const isMobileSettingView = mobileView.startsWith('setting:');
  const isMobileTabView = mobileView.startsWith('tab:');
  const currentMobileSetting = isMobileSettingView ? mobileView.replace('setting:', '') : null;
  const currentMobileTab = isMobileTabView ? mobileView.replace('tab:', '') : null;

  return (
    <div className="psp-page">

      {/* ══════════════════════════════════
          MOBILE VIEW
      ══════════════════════════════════ */}
      <div className="psp-mobile-wrapper">
        {mobileView === 'main' && (
          <MobileMainView
            userData={userData}
            currentUser={currentUser}
            preferences={preferences}
            theme={theme}
            toggleTheme={toggleTheme}
            onSectionClick={(section) => setMobileView(`setting:${section}`)}
            onTabClick={(tab) => setMobileView(`tab:${tab}`)}
          />
        )}

        {isMobileSettingView && (
          <MobileSettingDetail
            section={currentMobileSetting}
            preferences={preferences}
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => setMobileView('main')}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onExport={handleExport}
            onReset={handleReset}
            onLogout={handleLogout}
            onDeleteAccount={() => setShowDeleteConfirm(true)}
            saving={saving}
            currentUser={currentUser}
          />
        )}

        {isMobileTabView && (
          <MobileTabView
            activeTab={currentMobileTab}
            onBack={() => setMobileView('main')}
            tabTitle={tabTitles[currentMobileTab] || ''}
          >
            {renderTabContent(currentMobileTab)}
          </MobileTabView>
        )}
      </div>

      {/* ══════════════════════════════════
          DESKTOP VIEW
      ══════════════════════════════════ */}
      <div className="psp-desktop-wrapper">
        <div className="psp-desktop-layout">

          {/* COL 1 — Hero + Profile Tabs */}
          <div className="psp-desktop-col1">
            <ProfileHero userData={userData} currentUser={currentUser} />
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* COL 2 — Tab Content */}
          <div className="psp-desktop-col2">
            <div className="tab-content-wrapper">
              {renderTabContent(activeTab)}
            </div>
          </div>

          {/* COL 3 — Settings */}
          <div className="psp-desktop-col3">
            <div className="psp-settings-panel">
              <div className="psp-settings-panel-header">
                <Settings size={20} />
                <span>Ajustes</span>
              </div>
              <div className="psp-settings-sidebar">
                {settingsSections.map(s => (
                  <button
                    key={s.id}
                    className={`psp-sidebar-btn ${activeSection === s.id ? 'psp-sidebar-btn--active' : ''}`}
                    onClick={() => setActiveSection(s.id)}
                  >
                    <s.icon size={16} />
                    <span>{s.label}</span>
                    <ChevronRight size={14} className="psp-chevron" />
                  </button>
                ))}
              </div>
              <div className="psp-settings-content">
                {renderDesktopSettings()}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <>
          <div className="psp-modal-backdrop" onClick={() => setShowDeleteConfirm(false)} />
          <div className="psp-modal-danger">
            <AlertTriangle size={40} style={{ color: '#EF4444', marginBottom: 12 }} />
            <h3>¿Eliminar cuenta?</h3>
            <p>Esta acción <strong>NO se puede deshacer</strong>. Se eliminarán todos tus datos permanentemente.</p>
            <div className="psp-modal-actions">
              <button className="psp-btn psp-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="psp-btn psp-btn-danger-full" onClick={handleDeleteAccount}>Eliminar mi cuenta</button>
            </div>
          </div>
        </>
      )}

      {/* Footer solo en desktop */}
      <div className="psp-footer-desktop">
        <Footer />
      </div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {showAdminAchievementsModal && (
        <AdminAchievementsModal
          onClose={() => { setShowAdminAchievementsModal(false); setEditingAchievement(null); }}
          onSave={(d) => handleSaveAchievement(d, toast)}
          onDelete={(id) => handleDeleteAchievement(id, toast)}
          existingAchievement={editingAchievement}
        />
      )}
      {showAdminTitlesModal && (
        <AdminTitlesModal
          onClose={() => { setShowAdminTitlesModal(false); setEditingTitle(null); }}
          onSave={(d) => handleSaveTitle(d, toast)}
          onDelete={(id) => handleDeleteTitle(id, toast)}
          existingTitle={editingTitle}
        />
      )}
    </div>
  );
}