import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// Hooks
import { useAdminData }         from '../hooks/HooksAdmin/useAdminData';
import { useAdminMatches }      from '../hooks/HooksAdmin/useAdminMatches';
import { useAdminLeagues }      from '../hooks/HooksAdmin/useAdminLeagues';
import { useAdminAwards }       from '../hooks/HooksAdmin/useAdminAwards';
import { useAdminAchievements } from '../hooks/HooksAdmin/useAdminAchievements';
import { useAdminCrowns }       from '../hooks/HooksAdmin/useAdminCrowns';
import { useAdminBanners }      from '../hooks/HooksAdmin/useAdminBanners';

// Utils
import { getFilteredItems, calculateStats } from '../utils/adminFilters';

// Componentes
import AdminStatsOverview    from '../components/ComAdmin/AdminStatsOverview';
import AdminNavigationTabs   from '../components/ComAdmin/AdminNavigationTabs';
import AdminControls         from '../components/ComAdmin/AdminControls';
import AdminMatchesList      from '../components/ComAdmin/AdminMatchesList';
import AdminLeaguesList      from '../components/ComAdmin/AdminLeaguesList';
import AdminAwardsList       from '../components/ComAdmin/AdminAwardsList';
import AdminAchievementsList from '../components/ComAdmin/AdminAchievementsList';
import AdminTitlesList       from '../components/ComAdmin/AdminTitlesList';
import AdminCrownsSection    from '../components/ComAdmin/AdminCrownsSection';
import AdminBannersList      from '../components/ComAdmin/AdminBannersList';
import AdminRightPanel       from '../components/ComAdmin/AdminRightPanel';
import Footer                from '../components/ComLayout/Footer';
import { ToastContainer, useToast } from '../components/ComFeedback/Toast';

import '../styles/StylesAdmin/AdminPage.css';
import '../styles/StylesAdmin/AdminRightPanel.css';
import '../styles/StylesAdmin/AdminBanners.css';

export default function AdminPage({ currentUser }) {
  // ── UI state ──────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('matches');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');

  // ── Panel derecho: mode + item ────────────────────────────────
  // mode: 'add' | 'finish' | 'edit' | 'assign'
  const [panelMode, setPanelMode] = useState('add');
  const [panelItem, setPanelItem] = useState(null);

  const resetPanel = () => { setPanelMode('add'); setPanelItem(null); };

  const toast = useToast();

  // ── Data ──────────────────────────────────────────────────────
  const {
    matches, leagues, awards, achievements, titles,
    users, crownHistory, banners,
    loading, loadData,
  } = useAdminData();

  // ── Hooks de acciones ─────────────────────────────────────────
  const { handleAddMatch, handleFinishMatch, handleDeleteMatch }
    = useAdminMatches(currentUser, loadData, toast);

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

  // ── Handlers para el panel ────────────────────────────────────

  // Finalizar: carga el item en el panel
  const handleFinishClick = (item) => {
    setPanelItem(item);
    setPanelMode('finish');
  };

  // Editar (logros/títulos)
  const handleEditClick = (item) => {
    setPanelItem(item);
    setPanelMode('edit');
  };

  // Asignar banner
  const handleAssignClick = () => {
    setPanelMode('assign');
    setPanelItem(null);
  };

  // ── Wrappers que cierran el panel tras acción ─────────────────
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

  // Handler unificado para el panel según sección
  const handlePanelAdd = async (data) => {
    switch (activeSection) {
      case 'matches':      await handleAddMatch(data);           break;
      case 'leagues':      await handleAddLeague(data);          break;
      case 'awards':       await handleAddAward(data);           break;
      case 'achievements': await handleSaveAchievement(data);    break;
      case 'titles':       await handleSaveTitle(data);          break;
      case 'crowns':       await handleAwardCrown(
                              users?.[0]?.id, data, currentUser?.id); break;
      case 'banners':      await handleCreateBanner(
                              { name: data.name, description: data.description }, data.file); break;
      default: break;
    }
    loadData();
  };

  const handlePanelFinish = async (...args) => {
    switch (activeSection) {
      case 'matches': await handleFinishMatchPanel(...args); break;
      case 'leagues': await handleFinishLeaguePanel(...args); break;
      case 'awards':  await handleFinishAwardPanel(...args); break;
      default: break;
    }
  };

  const handlePanelSave = async (data) => {
    switch (activeSection) {
      case 'achievements': await handleSaveAchievement(data); break;
      case 'titles':       await handleSaveTitle(data);       break;
      default: break;
    }
    loadData();
    resetPanel();
  };

  const handlePanelDelete = async (id) => {
    switch (activeSection) {
      case 'achievements': await handleDeleteAchievement(id); break;
      case 'titles':       await handleDeleteTitle(id);       break;
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
  const currentMonth = new Date().toISOString().slice(0, 7);

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
      {/* Shell principal: fila horizontal que ocupa toda la altura */}
      <div className="admin-page page-root">
        <div className="admin-shell-row">

          {/* ── Columna izquierda: stats + tabs + controles + lista ── */}
          <div className="admin-left-col">
            <AdminStatsOverview stats={stats} />

            <AdminNavigationTabs
              activeSection={activeSection}
              setActiveSection={handleSetSection}
              stats={stats}
            />

            <AdminControls
              activeSection={activeSection}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onAddNew={resetPanel}
            />

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
          </div>

          {/* ── Panel derecho: altura completa desde el tope ── */}
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

        </div>
      </div>

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}