// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { 
  Settings, User, Palette, Bell, Target, Lock, 
  Database, Info, Moon, Sun, Save, RotateCcw,
  Download, Trash2, LogOut, AlertTriangle, Check,
  ChevronRight, Volume2, VolumeX, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import { useSettings } from '../hooks/settingsHooks/useSettings';
import { useTheme } from '../context/ThemeContext';
import { ToastContainer, useToast } from '../components/Toast';
import { supabase } from '../utils/supabaseClient';
import Footer from '../components/Footer';
import '../styles/pagesStyles/SettingsPage.css';

export default function SettingsPage({ currentUser }) {
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  
  const { 
    preferences, 
    loading, 
    saving,
    updatePreference,
    resetToDefaults,
    exportUserData,
    deleteAccount
  } = useSettings(currentUser);

  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  // ============================================
  // MANEJADORES
  // ============================================

  const handleToggle = async (key) => {
    const result = await updatePreference(key, !preferences[key]);
    if (result.success) {
      toast.success('Preferencia actualizada');
    } else {
      toast.error('Error al guardar');
    }
  };

  const handleSelect = async (key, value) => {
    const result = await updatePreference(key, value);
    if (result.success) {
      toast.success('Preferencia actualizada');
    } else {
      toast.error('Error al guardar');
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Restaurar todas las configuraciones por defecto?')) return;
    
    const result = await resetToDefaults();
    if (result.success) {
      toast.success('Configuración restaurada');
    } else {
      toast.error('Error al restaurar');
    }
  };

  const handleExport = async () => {
    const result = await exportUserData();
    if (result.success) {
      toast.success('Datos exportados correctamente');
    } else {
      toast.error('Error al exportar datos');
    }
  };

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      toast.success('Cuenta eliminada');
      window.location.href = '/';
    } else {
      toast.error('Error al eliminar cuenta');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    // En móvil, mostrar vista de detalle
    if (window.innerWidth <= 768) {
      setIsMobileDetailView(true);
    }
  };

  const handleBackToMenu = () => {
    setIsMobileDetailView(false);
  };

  // ============================================
  // SECCIONES DE CONFIGURACIÓN
  // ============================================

  const sections = [
    { id: 'account', name: 'Cuenta', icon: User },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'predictions', name: 'Predicciones', icon: Target },
    { id: 'privacy', name: 'Privacidad', icon: Lock },
    { id: 'data', name: 'Datos', icon: Database },
    { id: 'info', name: 'Información', icon: Info }
  ];

  // ============================================
  // COMPONENTE: Toggle Switch
  // ============================================

  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button
      className={`toggle-switch ${checked ? 'active' : ''}`}
      onClick={onChange}
      disabled={disabled || saving}
    >
      <div className="toggle-slider" />
    </button>
  );

  // ============================================
  // COMPONENTE: Setting Item
  // ============================================

  const SettingItem = ({ icon: Icon, label, description, children, danger, onClick }) => (
    <div 
      className={`setting-item ${danger ? 'danger' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="setting-info">
        {Icon && (
          <div className={`setting-icon ${danger ? 'danger' : ''}`}>
            <Icon size={20} />
          </div>
        )}
        <div className="setting-text">
          <div className="setting-label">{label}</div>
          {description && <div className="setting-description">{description}</div>}
        </div>
      </div>
      <div className="setting-control">
        {children}
      </div>
    </div>
  );

  // ============================================
  // RENDERIZAR CONTENIDO POR SECCIÓN
  // ============================================

  const renderContent = () => {
    if (loading) {
      return (
        <div className="settings-loading">
          <div className="spinner-ring"></div>
          <p>Cargando configuración...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'account':
        return (
          <div className="settings-section">
            <h2 className="section-title">Información de la Cuenta</h2>
            
            <SettingItem
              icon={User}
              label="Nombre de usuario"
              description={currentUser?.name}
            >
              <ChevronRight size={20} className="icon-muted" />
            </SettingItem>

            <SettingItem
              icon={User}
              label="Correo electrónico"
              description={currentUser?.email}
            >
              <ChevronRight size={20} className="icon-muted" />
            </SettingItem>

            <SettingItem
              icon={LogOut}
              label="Cerrar sesión"
              description="Salir de tu cuenta"
              danger
            >
              <button className="btn-danger-small" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </SettingItem>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section">
            <h2 className="section-title">Apariencia</h2>
            
            <SettingItem
              icon={theme === 'dark' ? Moon : Sun}
              label="Modo oscuro"
              description="Cambiar entre tema claro y oscuro"
            >
              <ToggleSwitch
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
            </SettingItem>

            <SettingItem
              icon={Palette}
              label="Tamaño de fuente"
              description="Ajustar legibilidad del texto"
            >
              <select
                className="select-input"
                value={preferences.font_size}
                onChange={(e) => handleSelect('font_size', e.target.value)}
                disabled={saving}
              >
                <option value="small">Pequeña</option>
                <option value="medium">Mediana</option>
                <option value="large">Grande</option>
              </select>
            </SettingItem>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h2 className="section-title">Notificaciones</h2>
            
            <SettingItem
              icon={Bell}
              label="Notificaciones push"
              description="Recibir notificaciones en tu dispositivo"
            >
              <ToggleSwitch
                checked={preferences.push_enabled}
                onChange={() => handleToggle('push_enabled')}
              />
            </SettingItem>

            <div className="subsection">
              <h3 className="subsection-title">Tipos de notificaciones</h3>
              
              <SettingItem
                label="Nuevos partidos"
                description="Cuando se publiquen nuevos partidos"
              >
                <ToggleSwitch
                  checked={preferences.notif_new_matches}
                  onChange={() => handleToggle('notif_new_matches')}
                  disabled={!preferences.push_enabled}
                />
              </SettingItem>

              <SettingItem
                label="Resultados finalizados"
                description="Cuando se publiquen resultados de partidos"
              >
                <ToggleSwitch
                  checked={preferences.notif_finished_matches}
                  onChange={() => handleToggle('notif_finished_matches')}
                  disabled={!preferences.push_enabled}
                />
              </SettingItem>

              <SettingItem
                label="Nuevas ligas/premios"
                description="Cuando se agreguen nuevas competiciones"
              >
                <ToggleSwitch
                  checked={preferences.notif_new_leagues}
                  onChange={() => handleToggle('notif_new_leagues')}
                  disabled={!preferences.push_enabled}
                />
              </SettingItem>

              <SettingItem
                label="Recordatorios"
                description="Recordatorios de predicciones pendientes"
              >
                <ToggleSwitch
                  checked={preferences.notif_reminders}
                  onChange={() => handleToggle('notif_reminders')}
                  disabled={!preferences.push_enabled}
                />
              </SettingItem>

              <SettingItem
                icon={preferences.notif_sound ? Volume2 : VolumeX}
                label="Sonido"
                description="Reproducir sonido al recibir notificaciones"
              >
                <ToggleSwitch
                  checked={preferences.notif_sound}
                  onChange={() => handleToggle('notif_sound')}
                  disabled={!preferences.push_enabled}
                />
              </SettingItem>
            </div>
          </div>
        );

      case 'predictions':
        return (
          <div className="settings-section">
            <h2 className="section-title">Predicciones</h2>
            
            <SettingItem
              icon={Check}
              label="Confirmación antes de guardar"
              description="Pedir confirmación al guardar predicciones"
            >
              <ToggleSwitch
                checked={preferences.confirm_before_save}
                onChange={() => handleToggle('confirm_before_save')}
              />
            </SettingItem>

            <SettingItem
              icon={Save}
              label="Auto-guardar"
              description="Guardar automáticamente al completar"
            >
              <ToggleSwitch
                checked={preferences.auto_save}
                onChange={() => handleToggle('auto_save')}
              />
            </SettingItem>

            <SettingItem
              icon={Target}
              label="Mostrar probabilidades"
              description="Ver estadísticas de partidos (próximamente)"
            >
              <ToggleSwitch
                checked={preferences.show_probabilities}
                onChange={() => handleToggle('show_probabilities')}
                disabled
              />
            </SettingItem>

            <SettingItem
              icon={preferences.predictions_public ? Eye : EyeOff}
              label="Predicciones públicas"
              description="Otros usuarios pueden ver tus predicciones"
            >
              <ToggleSwitch
                checked={preferences.predictions_public}
                onChange={() => handleToggle('predictions_public')}
              />
            </SettingItem>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section">
            <h2 className="section-title">Privacidad</h2>
            
            <SettingItem
              icon={Eye}
              label="Perfil público"
              description="Otros usuarios pueden ver tu perfil"
            >
              <ToggleSwitch
                checked={preferences.profile_public}
                onChange={() => handleToggle('profile_public')}
              />
            </SettingItem>

            <SettingItem
              icon={Target}
              label="Mostrar estadísticas"
              description="Aparecer en rankings públicos"
            >
              <ToggleSwitch
                checked={preferences.show_stats_in_ranking}
                onChange={() => handleToggle('show_stats_in_ranking')}
              />
            </SettingItem>

            <SettingItem
              icon={Bell}
              label="Compartir actividad"
              description="Mostrar tu actividad reciente"
            >
              <ToggleSwitch
                checked={preferences.share_activity}
                onChange={() => handleToggle('share_activity')}
              />
            </SettingItem>
          </div>
        );

      case 'data':
        return (
          <div className="settings-section">
            <h2 className="section-title">Gestión de Datos</h2>
            
            <SettingItem
              icon={Download}
              label="Exportar mis datos"
              description="Descargar toda tu información en JSON"
            >
              <button 
                className="btn-primary-small"
                onClick={handleExport}
                disabled={saving}
              >
                Exportar
              </button>
            </SettingItem>

            <SettingItem
              icon={RotateCcw}
              label="Restaurar configuración"
              description="Volver a valores por defecto"
            >
              <button 
                className="btn-secondary-small"
                onClick={handleReset}
                disabled={saving}
              >
                Restaurar
              </button>
            </SettingItem>
          </div>
        );

      case 'info':
        return (
          <div className="settings-section">
            <h2 className="section-title">Información</h2>
            
            <SettingItem
              icon={Info}
              label="Versión"
              description="GlobalScore v1.0.0"
            />

            <SettingItem
              icon={Info}
              label="Términos y condiciones"
              description="Leer términos de uso"
            >
              <ChevronRight size={20} className="icon-muted" />
            </SettingItem>

            <SettingItem
              icon={Info}
              label="Política de privacidad"
              description="Cómo protegemos tus datos"
            >
              <ChevronRight size={20} className="icon-muted" />
            </SettingItem>

            <SettingItem
              icon={Info}
              label="Soporte"
              description="Contactar con el equipo"
            >
              <ChevronRight size={20} className="icon-muted" />
            </SettingItem>

            <div className="danger-zone">
              <h3 className="danger-title">
                <AlertTriangle size={20} />
                Zona Peligrosa
              </h3>
              
              <SettingItem
                icon={Trash2}
                label="Eliminar cuenta"
                description="Acción irreversible - se borrarán todos tus datos"
                danger
              >
                <button 
                  className="btn-danger-small"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Eliminar
                </button>
              </SettingItem>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // VISTA DE MENÚ MÓVIL
  // ============================================

  const renderMobileMenu = () => (
    <div className="mobile-menu-view">
      <div className="mobile-menu-header">
        <h1 className="mobile-menu-title">Settings</h1>
      </div>

      {/* Settings Groups */}
      <div className="mobile-settings-group">
        <h3 className="group-title">General</h3>
        <div className="mobile-settings-list">
          {sections.slice(0, 2).map(section => (
            <button
              key={section.id}
              className="mobile-setting-row"
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="mobile-setting-icon">
                <section.icon size={22} />
              </div>
              <span className="mobile-setting-label">{section.name}</span>
              <ChevronRight size={20} className="mobile-setting-chevron" />
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-settings-group">
        <h3 className="group-title">Preferences</h3>
        <div className="mobile-settings-list">
          {sections.slice(2, 5).map(section => (
            <button
              key={section.id}
              className="mobile-setting-row"
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="mobile-setting-icon">
                <section.icon size={22} />
              </div>
              <span className="mobile-setting-label">{section.name}</span>
              <ChevronRight size={20} className="mobile-setting-chevron" />
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-settings-group">
        <h3 className="group-title">About</h3>
        <div className="mobile-settings-list">
          {sections.slice(5).map(section => (
            <button
              key={section.id}
              className="mobile-setting-row"
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="mobile-setting-icon">
                <section.icon size={22} />
              </div>
              <span className="mobile-setting-label">{section.name}</span>
              <ChevronRight size={20} className="mobile-setting-chevron" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================
  // VISTA DE DETALLE MÓVIL
  // ============================================

  const renderMobileDetail = () => {
    const currentSection = sections.find(s => s.id === activeSection);
    
    return (
      <div className="mobile-detail-view">
        <div className="mobile-detail-header">
          <button className="back-button" onClick={handleBackToMenu}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="mobile-detail-title">{currentSection?.name}</h1>
        </div>
        <div className="mobile-detail-content">
          {renderContent()}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="settings-page">
      {/* Vista Desktop (sin cambios) */}
      <div className="desktop-view">
        <div className="settings-container">
          {/* Header */}
          <div className="settings-header">
            <div className="header-icon">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="page-title">Ajustes</h1>
              <p className="page-subtitle">Personaliza tu experiencia</p>
            </div>
          </div>

          <div className="settings-layout">
            {/* Sidebar */}
            <div className="settings-sidebar">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon size={20} />
                  <span>{section.name}</span>
                  <ChevronRight size={16} className="chevron" />
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="settings-content">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Vista Móvil (nueva estructura) */}
      <div className="mobile-view">
        {!isMobileDetailView ? renderMobileMenu() : renderMobileDetail()}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <>
          <div 
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="modal-danger">
            <div className="modal-header-danger">
              <AlertTriangle size={48} />
              <h3>¿Eliminar cuenta?</h3>
            </div>
            <div className="modal-body">
              <p>Esta acción <strong>NO se puede deshacer</strong>.</p>
              <p>Se eliminarán permanentemente:</p>
              <ul>
                <li>Tu perfil y estadísticas</li>
                <li>Todas tus predicciones</li>
                <li>Tu historial de actividad</li>
                <li>Tus logros y títulos</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteAccount}
              >
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
}