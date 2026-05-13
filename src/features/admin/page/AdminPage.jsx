import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// Hooks
import {
  useAdminData,
  useAdminMatches,
  useAdminLeagues,
  useAdminAwards,
  useAdminAchievements,
  useAdminCrowns,
  useAdminBanners
} from '@/features/admin';

// Utils
import { getFilteredItems, calculateStats } from '@/shared/utils/adminFilters';

// Componentes
import {
  MobileAdmin,
  MobileAdminFAB,
  useIsMobile
} from '@/features/admin';

import {
  AdminStatsOverview,
  AdminNavigationTabs,
  AdminControls,
  AdminMatchesList,
  AdminLeaguesList,
  AdminAwardsList,
  AdminAchievementsList,
  AdminTitlesList,
  AdminCrownsSection,
  AdminBannersList,
  AdminRightPanel,
  AdminHistorical,

} from '@/features/admin';

import {
  ToastContainer,
  useToast
} from '@/shared/ui/Toast';

import '../styles/AdminRightPanel.css';
import '../styles/AdminBanners.css';
import '../styles/AdminHistorical.css';
import '../styles/MobileAdmin.css';
import '../styles/AdminModal.css';
import './AdminPage.css';

export default function AdminPage({ currentUser }) {
  // ── UI state ──────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── Panel derecho ─────────────────────────────────────────────
  const [panelMode, setPanelMode] = useState('add');
  const [panelItem, setPanelItem] = useState(null);

  const resetPanel = () => { setPanelMode('add'); setPanelItem(null); };
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const toast = useToast();

  // ── Data ──────────────────────────────────────────────────────
  const {
    matches, leagues, awards, achievements, titles,
    users, crownHistory, banners,
    loading, loadData,
  } = useAdminData();

  // ── Hooks de acciones ─────────────────────────────────────────
  const { handleAddMatch, handleFinishMatch, handleDeleteMatch }
    = useAdminMatches(loadData, toast);

  const { handleAddLeague, handleFinishLeague, handleDeleteLeague }
    = useAdminLeagues(loadData, toast);

  const { handleAddAward, handleFinishAward, handleDeleteAward }
    = useAdminAwards(loadData, toast);

  const { handleSaveAchievement, handleDeleteAchievement, handleSaveTitle, handleDeleteTitle }
    = useAdminAchievements(loadData, toast);

  const { handleAwardCrown, handleResetMonthlyStats }
    = useAdminCrowns(loadData, toast);

  const { handleCreateBanner, handleDeleteBanner, handleAssignBanner, handleRevokeBanner }
    = useAdminBanners(loadData, toast);

  // ── Cambiar tab → resetear panel ─────────────────────────────
  const handleSetSection = (section) => {
    setActiveSection(section);
    resetPanel();
  };

  // ── Handlers panel ────────────────────────────────────────────
  const handleFinishClick = (item) => {
    setPanelItem(item);
    setPanelMode('finish');
    if (isMobile) setMobileSheetOpen(true);
  };

  const handleEditClick = (item) => {
    setPanelItem(item);
    setPanelMode('edit');
    if (isMobile) setMobileSheetOpen(true);
  };

  const handleAssignClick = () => {
    setPanelMode('assign');
    setPanelItem(null);
  };

  // ── Wrappers con reset ────────────────────────────────────────
  const handleFinishMatchPanel = async (id, home, away, advancing) => {
    await handleFinishMatch(id, home, away, advancing);
    resetPanel();
  };

  const handleFinishLeaguePanel = async (id, data) => {
    await handleFinishLeague(id, data);
    resetPanel();
  };

  const handleFinishAwardPanel = async (id, winner) => {
    await handleFinishAward(id, winner);
    resetPanel();
  };

  const handlePanelAdd = async (data) => {
    switch (activeSection) {
      case 'matches': await handleAddMatch(data); break;
      case 'leagues': await handleAddLeague(data); break;
      case 'awards': await handleAddAward(data); break;
      case 'achievements': await handleSaveAchievement(data); break;
      case 'titles': await handleSaveTitle(data); break;
      case 'crowns': await handleAwardCrown(
        users?.[0]?.id, data, currentUser?.id); break;
      case 'banners': await handleCreateBanner(
        { name: data.name, description: data.description }, data.file); break;
      default: break;
    }
    loadData();
  };

  const handlePanelFinish = async (...args) => {
    switch (activeSection) {
      case 'matches': await handleFinishMatchPanel(...args); break;
      case 'leagues': await handleFinishLeaguePanel(...args); break;
      case 'awards': await handleFinishAwardPanel(...args); break;
      default: break;
    }
  };

  const handlePanelSave = async (data) => {
    switch (activeSection) {
      case 'achievements': await handleSaveAchievement(data); break;
      case 'titles': await handleSaveTitle(data); break;
      default: break;
    }
    loadData();
    resetPanel();
  };

  const handlePanelDelete = async (id) => {
    switch (activeSection) {
      case 'achievements': await handleDeleteAchievement(id); break;
      case 'titles': await handleDeleteTitle(id); break;
      default: break;
    }
    loadData();
    resetPanel();
  };

  // ── Filtered items ────────────────────────────────────────────
  const filteredItems = getFilteredItems(
    activeSection, searchTerm, filterStatus,
    { matches, leagues, awards, achievements, titles, users, crownHistory, banners }
  );

  const stats = calculateStats({ matches, leagues, awards, achievements, titles, crownHistory, banners });

  // ── La sección histórica tiene su propio layout completo ──────
  // No necesita el panel derecho ni los controles normales
  const isHistorical = activeSection === 'historical';

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner-large" />
        <p>Cargando panel...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page page-root">

        {/* ── Tabs de navegación — siempre visibles ── */}
        {/* Pasamos la sección histórica a AdminNavigationTabs */}
        <div className={isHistorical ? 'admin-shell-historical' : 'admin-shell-row'}>

          {/* ── Columna izquierda (solo en secciones normales) ── */}
          <div className={isHistorical ? 'admin-hist-left' : 'admin-left-col'}>

            {/* Stats: ocultar en histórico para no confundir */}
            {!isHistorical && <AdminStatsOverview stats={stats} />}

            <AdminNavigationTabs
              activeSection={activeSection}
              setActiveSection={handleSetSection}
              stats={stats}
            />

            {/* Controles de búsqueda/filtro: solo en secciones normales */}
            {!isHistorical && (
              <AdminControls
                activeSection={activeSection}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onAddNew={isMobile ? () => { resetPanel(); setMobileSheetOpen(true); } : resetPanel}
              />
            )}

            {/* ── Contenido principal ── */}
            {isHistorical ? (
              // La sección histórica maneja todo su estado internamente
              <AdminHistorical />
            ) : (
              <div className="admin-content-area">
                {activeSection === 'matches' && (
                  <AdminMatchesList
                    matches={Array.isArray(filteredItems) ? filteredItems : []}
                    onFinish={handleFinishClick}
                    onDelete={handleDeleteMatch}
                  />
                )}
                {activeSection === 'leagues' && (
                  <AdminLeaguesList
                    leagues={Array.isArray(filteredItems) ? filteredItems : []}
                    onFinish={handleFinishClick}
                    onDelete={handleDeleteLeague}
                  />
                )}
                {activeSection === 'awards' && (
                  <AdminAwardsList
                    awards={Array.isArray(filteredItems) ? filteredItems : []}
                    onFinish={handleFinishClick}
                    onDelete={handleDeleteAward}
                  />
                )}
                {activeSection === 'achievements' && (
                  <AdminAchievementsList
                    achievements={Array.isArray(filteredItems) ? filteredItems : []}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteAchievement}
                  />
                )}
                {activeSection === 'titles' && (
                  <AdminTitlesList
                    titles={Array.isArray(filteredItems) ? filteredItems : []}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTitle}
                  />
                )}
                {activeSection === 'crowns' && (
                  <AdminCrownsSection
                    top10={filteredItems.top10}
                    history={filteredItems.history}
                    onResetStats={handleResetMonthlyStats}
                  />
                )}
                {activeSection === 'banners' && (
                  <AdminBannersList
                    banners={Array.isArray(filteredItems) ? filteredItems : banners}
                    onDelete={handleDeleteBanner}
                    onAssign={handleAssignClick}
                  />
                )}

                {Array.isArray(filteredItems) && filteredItems.length === 0 &&
                  activeSection !== 'crowns' && (
                    <div className="admin-empty-state">
                      <AlertCircle size={40} />
                      <p>No hay {activeSection} para mostrar</p>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* ── Panel derecho: solo en secciones normales ── */}
          {!isHistorical && (
            <AdminRightPanel
              activeSection={activeSection}
              panelMode={panelMode}
              panelItem={panelItem}
              onAdd={handlePanelAdd}
              onFinish={handlePanelFinish}
              onSave={handlePanelSave}
              onDelete={handlePanelDelete}
              onResetPanel={resetPanel}
              users={users}
              banners={banners}
              onAssignBanner={handleAssignBanner}
              onRevokeBanner={handleRevokeBanner}
            />
          )}
        </div>

        {/* ── FAB + BottomSheet mobile (solo en secciones normales) ── */}
        {isMobile && !isHistorical && (
          <>
            <MobileAdminFAB
              activeSection={activeSection}
              onOpen={() => { resetPanel(); setMobileSheetOpen(true); }}
            />
            <MobileAdmin
              isOpen={mobileSheetOpen}
              onClose={() => setMobileSheetOpen(false)}
              activeSection={activeSection}
              panelMode={panelMode}
              panelItem={panelItem}
              onAdd={handlePanelAdd}
              onFinish={handlePanelFinish}
              onSave={handlePanelSave}
              onDelete={handlePanelDelete}
              users={users}
              banners={banners}
              onAssignBanner={handleAssignBanner}
              onRevokeBanner={handleRevokeBanner}
            />
          </>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}