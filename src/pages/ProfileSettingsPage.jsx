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

// ─────────────────────────────────────────────
// VISTA MÓVIL — Pantalla principal (lista estilo imagen)
// ─────────────────────────────────────────────
// VISTA MÓVIL — Diseño compacto (banner pequeño + lista limpia)
// ─────────────────────────────────────────────
function MobileMainView({ userData, currentUser, preferences, onSectionClick, onTabClick, theme, toggleTheme }) {
  return (
    <div className="psp-mobile-main">

      {/* ── BANNER COMPACTO + AVATAR SOLAPADO ── */}
      <div className="psp-compact-header">
        {/* Banner estrecho */}
        <div className="psp-compact-banner">
          {userData.equipped_banner_url
            ? <img src={userData.equipped_banner_url} alt="banner" className="psp-hero-banner-img" />
            : <div className="psp-hero-banner-gradient" />
          }
          <div className="psp-compact-banner-overlay" />
          {/* Título "Settings" sobre el banner como en la imagen */}
          <h1 className="psp-compact-title">Settings</h1>
        </div>

        {/* Fila de usuario — solapada con el banner */}
        <div className="psp-compact-user-row" onClick={() => onTabClick('edit')}>
          <div className="psp-compact-avatar">
            {userData.avatar_url
              ? <img src={userData.avatar_url} alt={userData.name} />
              : <span>{userData.name?.charAt(0)?.toUpperCase()}</span>
            }

          </div>
          <div className="psp-compact-user-info">
            <span className="psp-compact-name">{userData.name}</span>
            <span className="psp-compact-sub">
              {userData.nationality || userData.email || 'Ver perfil'}
            </span>
          </div>
          <ChevronRight size={18} className="psp-chevron" />
        </div>
      </div>

      {/* ── LISTA ÚNICA LIMPIA (estilo imagen referencia) ── */}
      <div className="psp-clean-list">

        {/* Modo oscuro inline — igual que en la imagen */}
        <div className="psp-clean-row psp-clean-row--toggle">
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-purple-bg)', color: 'var(--psp-icon-purple)' }}>
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <span className="psp-clean-label">Dark Mode</span>
          <button className={`psp-toggle ${theme === 'dark' ? 'psp-toggle--on' : ''}`} onClick={toggleTheme}>
            <div className="psp-toggle-knob" />
          </button>
        </div>

        <div className="psp-clean-row psp-clean-row--toggle">
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-orange-bg)', color: 'var(--psp-icon-orange)' }}>
            <Bell size={18} />
          </div>
          <span className="psp-clean-label">Notificaciones</span>
          <button className={`psp-toggle ${preferences.push_enabled ? 'psp-toggle--on' : ''}`} onClick={() => onSectionClick('notifications')}>
            <div className="psp-toggle-knob" />
          </button>
        </div>

        <button className="psp-clean-row" onClick={() => onTabClick('overview')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-orange-bg)', color: 'var(--psp-icon-orange)' }}>
            <User size={18} />
          </div>
          <span className="psp-clean-label">Personal Data</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onTabClick('achievements')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-blue-bg)', color: 'var(--psp-icon-blue)' }}>
            <Award size={18} />
          </div>
          <span className="psp-clean-label">Logros y Títulos</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onTabClick('history')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-green-bg)', color: 'var(--psp-icon-green)' }}>
            <List size={18} />
          </div>
          <span className="psp-clean-label">Historial</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onTabClick('championships')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-yellow-bg)', color: 'var(--psp-icon-yellow)' }}>
            <Crown size={18} />
          </div>
          <span className="psp-clean-label">Campeonatos</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onSectionClick('privacy')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-teal-bg)', color: 'var(--psp-icon-teal)' }}>
            <Shield size={18} />
          </div>
          <span className="psp-clean-label">Privacidad</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onSectionClick('appearance')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-pink-bg)', color: 'var(--psp-icon-pink)' }}>
            <Settings size={18} />
          </div>
          <span className="psp-clean-label">Apariencia</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onSectionClick('data')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-blue-bg)', color: 'var(--psp-icon-blue)' }}>
            <Database size={18} />
          </div>
          <span className="psp-clean-label">Datos</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

        <button className="psp-clean-row" onClick={() => onSectionClick('info')}>
          <div className="psp-clean-icon" style={{ background: 'var(--psp-icon-green-bg)', color: 'var(--psp-icon-green)' }}>
            <Info size={18} />
          </div>
          <span className="psp-clean-label">Información</span>
          <ChevronRight size={17} className="psp-chevron" />
        </button>

      </div>

      {/* Edit profile */}
      <div className="psp-edit-btn-wrap">
        <button className="psp-edit-btn" onClick={() => onTabClick('edit')}>
          <Edit2 size={15} />
          Editar Perfil
        </button>
      </div>

      <div style={{ height: 80 }} />
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
    const SectionCard = ({ title, icon: Icon, children }) => (
      <div className="psp-ds-card">
        <div className="psp-ds-card-header">
          {Icon && <div className="psp-ds-card-icon"><Icon size={18} /></div>}
          <h3 className="psp-ds-card-title">{title}</h3>
        </div>
        <div className="psp-ds-card-body">{children}</div>
      </div>
    );

    switch (activeSection) {
      case 'account':
        return (
          <>
            <div className="psp-ds-page-title">
              <User size={22} />
              <span>Cuenta</span>
            </div>
            <SectionCard title="Información personal" icon={User}>
              <SettingItem icon={User} label="Nombre" description={currentUser?.name} />
              <SettingItem icon={User} label="Correo" description={currentUser?.email} />
            </SectionCard>
            <SectionCard title="Sesión" icon={LogOut}>
              <SettingItem icon={LogOut} label="Cerrar sesión" description="Salir de tu cuenta actual" danger>
                <button className="psp-btn-small psp-btn-danger" onClick={handleLogout}>Salir</button>
              </SettingItem>
            </SectionCard>
          </>
        );
      case 'appearance':
        return (
          <>
            <div className="psp-ds-page-title">
              {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              <span>Apariencia</span>
            </div>
            <SectionCard title="Tema" icon={theme === 'dark' ? Moon : Sun}>
              <SettingItem icon={theme === 'dark' ? Moon : Sun} label="Modo oscuro" description="Cambiar entre tema claro y oscuro">
                <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
              </SettingItem>
            </SectionCard>
            <SectionCard title="Texto" icon={Eye}>
              <SettingItem icon={Eye} label="Tamaño de fuente" description="Ajusta el tamaño del texto en la app">
                <select className="psp-select" value={preferences.font_size} onChange={(e) => handleSelect('font_size', e.target.value)}>
                  <option value="small">Pequeña</option>
                  <option value="medium">Mediana</option>
                  <option value="large">Grande</option>
                </select>
              </SettingItem>
            </SectionCard>
          </>
        );
      case 'notifications':
        return (
          <>
            <div className="psp-ds-page-title">
              <Bell size={22} />
              <span>Notificaciones</span>
            </div>
            <SectionCard title="Push" icon={Bell}>
              <SettingItem icon={Bell} label="Notificaciones push" description="Recibir alertas en tu dispositivo">
                <ToggleSwitch checked={preferences.push_enabled} onChange={() => handleToggle('push_enabled')} />
              </SettingItem>
            </SectionCard>
            <SectionCard title="Tipos de notificación" icon={Bell}>
              <SettingItem label="Nuevos partidos" description="Cuando se publiquen partidos disponibles">
                <ToggleSwitch checked={preferences.notif_new_matches} onChange={() => handleToggle('notif_new_matches')} disabled={!preferences.push_enabled} />
              </SettingItem>
              <SettingItem label="Resultados finalizados" description="Cuando terminen partidos con tus predicciones">
                <ToggleSwitch checked={preferences.notif_finished_matches} onChange={() => handleToggle('notif_finished_matches')} disabled={!preferences.push_enabled} />
              </SettingItem>
              <SettingItem label="Nuevas ligas / premios" description="Ligas y torneos disponibles">
                <ToggleSwitch checked={preferences.notif_new_leagues} onChange={() => handleToggle('notif_new_leagues')} disabled={!preferences.push_enabled} />
              </SettingItem>
              <SettingItem icon={preferences.notif_sound ? Volume2 : VolumeX} label="Sonido" description="Reproducir sonido al recibir notificaciones">
                <ToggleSwitch checked={preferences.notif_sound} onChange={() => handleToggle('notif_sound')} disabled={!preferences.push_enabled} />
              </SettingItem>
            </SectionCard>
          </>
        );
      case 'privacy':
        return (
          <>
            <div className="psp-ds-page-title">
              <Shield size={22} />
              <span>Privacidad</span>
            </div>
            <SectionCard title="Visibilidad" icon={Eye}>
              <SettingItem icon={Eye} label="Perfil público" description="Otros usuarios pueden ver tu perfil">
                <ToggleSwitch checked={preferences.profile_public} onChange={() => handleToggle('profile_public')} />
              </SettingItem>
              <SettingItem icon={Target} label="Estadísticas en ranking" description="Aparecer en rankings públicos">
                <ToggleSwitch checked={preferences.show_stats_in_ranking} onChange={() => handleToggle('show_stats_in_ranking')} />
              </SettingItem>
              <SettingItem icon={Bell} label="Compartir actividad" description="Mostrar tu actividad reciente a otros">
                <ToggleSwitch checked={preferences.share_activity} onChange={() => handleToggle('share_activity')} />
              </SettingItem>
              <SettingItem icon={preferences.predictions_public ? Eye : EyeOff} label="Predicciones públicas" description="Otros pueden ver tus predicciones">
                <ToggleSwitch checked={preferences.predictions_public} onChange={() => handleToggle('predictions_public')} />
              </SettingItem>
            </SectionCard>
          </>
        );
      case 'data':
        return (
          <>
            <div className="psp-ds-page-title">
              <Database size={22} />
              <span>Datos</span>
            </div>
            <SectionCard title="Exportar e importar" icon={Download}>
              <SettingItem icon={Download} label="Exportar mis datos" description="Descargar toda tu información en formato JSON">
                <button className="psp-btn-small psp-btn-primary" onClick={handleExport}>Exportar</button>
              </SettingItem>
              <SettingItem icon={RotateCcw} label="Restaurar configuración" description="Volver a los valores por defecto">
                <button className="psp-btn-small psp-btn-secondary" onClick={handleReset}>Restaurar</button>
              </SettingItem>
            </SectionCard>
            <SectionCard title="Zona de peligro" icon={Trash2}>
              <SettingItem icon={Trash2} label="Eliminar cuenta" description="Esta acción es irreversible y eliminará todos tus datos" danger>
                <button className="psp-btn-small psp-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Eliminar</button>
              </SettingItem>
            </SectionCard>
          </>
        );
      case 'info':
        return (
          <>
            <div className="psp-ds-page-title">
              <Info size={22} />
              <span>Información</span>
            </div>
            <SectionCard title="App" icon={Info}>
              <SettingItem icon={Info} label="Versión" description="GlobalScore v20.0.0" />
            </SectionCard>
            <SectionCard title="Legal" icon={Shield}>
              <SettingItem icon={Shield} label="Política de privacidad" description="Cómo manejamos tus datos" />
              <SettingItem icon={Info} label="Términos y condiciones" description="Reglas de uso de la plataforma" />
            </SectionCard>
          </>
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
          DESKTOP VIEW — 2 columnas
      ══════════════════════════════════ */}
      <div className="psp-desktop-wrapper">
        <div className="psp-desktop-layout">

          {/* COL 1 — Hero + Tabs (incluye Settings como pestaña) */}
          <div className="psp-desktop-col1">
            <ProfileHero userData={userData} currentUser={currentUser} />
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Pestaña Settings en el menú izquierdo */}
            <div className="psp-settings-tab-nav">
              <div className="psp-settings-tab-header">
                <Settings size={15} />
                <span>Ajustes</span>
              </div>
              {settingsSections.map(s => (
                <button
                  key={s.id}
                  className={`psp-stab-btn ${activeTab === 'settings' && activeSection === s.id ? 'psp-stab-btn--active' : ''}`}
                  onClick={() => { setActiveTab('settings'); setActiveSection(s.id); }}
                >
                  <s.icon size={15} />
                  <span>{s.label}</span>
                  <ChevronRight size={13} className="psp-chevron" />
                </button>
              ))}
            </div>
          </div>

          {/* COL 2 — Contenido (perfil o settings según pestaña activa) */}
          <div className="psp-desktop-col2">
            <div className="tab-content-wrapper">
              {activeTab === 'settings'
                ? <div className="psp-settings-full">{renderDesktopSettings()}</div>
                : renderTabContent(activeTab)
              }
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