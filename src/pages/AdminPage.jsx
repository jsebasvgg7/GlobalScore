import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

// Hooks
import { useAdminData } from '../hooks/HooksAdmin/useAdminData';
import { useAdminMatches } from '../hooks/HooksAdmin/useAdminMatches';
import { useAdminLeagues } from '../hooks/HooksAdmin/useAdminLeagues';
import { useAdminAwards } from '../hooks/HooksAdmin/useAdminAwards';
import { useAdminAchievements } from '../hooks/HooksAdmin/useAdminAchievements';
import { useAdminCrowns } from '../hooks/HooksAdmin/useAdminCrowns';
import { useAdminBanners } from '../hooks/HooksAdmin/useAdminBanners';   // ← NUEVO

// Utils
import { getFilteredItems, calculateStats } from '../utils/adminFilters';

// Componentes
import AdminStatsOverview from '../components/ComAdmin/AdminStatsOverview';
import AdminNavigationTabs from '../components/ComAdmin/AdminNavigationTabs';
import AdminControls from '../components/ComAdmin/AdminControls';
import AdminMatchesList from '../components/ComAdmin/AdminMatchesList';
import AdminLeaguesList from '../components/ComAdmin/AdminLeaguesList';
import AdminAwardsList from '../components/ComAdmin/AdminAwardsList';
import AdminAchievementsList from '../components/ComAdmin/AdminAchievementsList';
import AdminTitlesList from '../components/ComAdmin/AdminTitlesList';
import AdminCrownsSection from '../components/ComAdmin/AdminCrownsSection';
import AdminBannersList from '../components/ComAdmin/AdminBannersList';           // ← NUEVO
import AdminBannerModal from '../components/ComAdmin/AdminBannerModal';           // ← NUEVO
import AdminAssignBannerModal from '../components/ComAdmin/AdminAssignBannerModal'; // ← NUEVO
import AdminModalsContainer from '../components/ComAdmin/AdminModalsContainer';
import Footer from '../components/ComOthers/Footer';
import { ToastContainer, useToast } from '../components/ComOthers/Toast';

import '../styles/StylesAdmin/AdminPage.css';
import '../styles/StylesAdmin/AdminBanners.css';  // ← NUEVO

export default function AdminPage({ currentUser }) {
  // UI
  const [activeSection, setActiveSection] = useState('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modales existentes
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showLeagueModal, setShowLeagueModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [showCrownModal, setShowCrownModal] = useState(false);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [itemToFinish, setItemToFinish] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Modales banners ← NUEVOS
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAssignBannerModal, setShowAssignBannerModal] = useState(false);

  const toast = useToast();

  // Data
  const {
    matches, leagues, awards, achievements, titles,
    users, crownHistory, banners,                      // ← banners incluido
    loading, loadData
  } = useAdminData();

  // Hooks funcionalidad
  const { handleAddMatch, handleFinishMatch, handleDeleteMatch } = useAdminMatches(currentUser, loadData, toast);
  const { handleAddLeague, handleFinishLeague, handleDeleteLeague } = useAdminLeagues(loadData, toast);
  const { handleAddAward, handleFinishAward, handleDeleteAward } = useAdminAwards(loadData, toast);
  const { handleSaveAchievement, handleDeleteAchievement, handleSaveTitle, handleDeleteTitle } = useAdminAchievements(loadData, toast);
  const { handleAwardCrown, handleResetMonthlyStats } = useAdminCrowns(loadData, toast);
  const { handleCreateBanner, handleDeleteBanner, handleAssignBanner, handleRevokeBanner } = useAdminBanners(loadData, toast); // ← NUEVO

  // Handler "Agregar Nuevo"
  const handleAddNew = () => {
    if (activeSection === 'matches') setShowMatchModal(true);
    if (activeSection === 'leagues') setShowLeagueModal(true);
    if (activeSection === 'awards') setShowAwardModal(true);
    if (activeSection === 'achievements') setShowAchievementModal(true);
    if (activeSection === 'titles') setShowTitleModal(true);
    if (activeSection === 'crowns') setShowCrownModal(true);
    if (activeSection === 'banners') setShowBannerModal(true);   // ← NUEVO
  };

  const filteredItems = getFilteredItems(
    activeSection,
    searchTerm,
    filterStatus,
    { matches, leagues, awards, achievements, titles, users, crownHistory, banners }
  );

  const stats = calculateStats({ matches, leagues, awards, achievements, titles, crownHistory, banners }); // ← banners

  const currentMonth = new Date().toISOString().slice(0, 7);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner-large" />
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-page-container">
          <AdminStatsOverview stats={stats} />
          <AdminNavigationTabs
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            stats={stats}
          />
          <AdminControls
            activeSection={activeSection}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onAddNew={handleAddNew}
          />

          <div className="admin-content-area">
            {activeSection === 'matches' && (
              <AdminMatchesList
                matches={Array.isArray(filteredItems) ? filteredItems : []}
                onFinish={(match) => { setItemToFinish(match); setShowFinishMatchModal(true); }}
                onDelete={handleDeleteMatch}
              />
            )}
            {activeSection === 'leagues' && (
              <AdminLeaguesList
                leagues={Array.isArray(filteredItems) ? filteredItems : []}
                onFinish={(league) => { setItemToFinish(league); setShowFinishLeagueModal(true); }}
                onDelete={handleDeleteLeague}
              />
            )}
            {activeSection === 'awards' && (
              <AdminAwardsList
                awards={Array.isArray(filteredItems) ? filteredItems : []}
                onFinish={(award) => { setItemToFinish(award); setShowFinishAwardModal(true); }}
                onDelete={handleDeleteAward}
              />
            )}
            {activeSection === 'achievements' && (
              <AdminAchievementsList
                achievements={Array.isArray(filteredItems) ? filteredItems : []}
                onEdit={(a) => { setEditingItem(a); setShowAchievementModal(true); }}
                onDelete={handleDeleteAchievement}
              />
            )}
            {activeSection === 'titles' && (
              <AdminTitlesList
                titles={Array.isArray(filteredItems) ? filteredItems : []}
                onEdit={(t) => { setEditingItem(t); setShowTitleModal(true); }}
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

            {/* ── NUEVA SECCIÓN BANNERS ── */}
            {activeSection === 'banners' && (
              <AdminBannersList
                banners={Array.isArray(filteredItems) ? filteredItems : banners}
                onDelete={handleDeleteBanner}
                onAssign={() => setShowAssignBannerModal(true)}
              />
            )}

            {((Array.isArray(filteredItems) && filteredItems.length === 0) ||
              (!Array.isArray(filteredItems) && activeSection !== 'crowns' && activeSection !== 'banners')) && (
              <div className="admin-empty-state">
                <AlertCircle size={48} />
                <p>No hay {activeSection} para mostrar</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      {/* Modales existentes */}
      <AdminModalsContainer
        showMatchModal={showMatchModal} setShowMatchModal={setShowMatchModal} handleAddMatch={handleAddMatch}
        showFinishMatchModal={showFinishMatchModal} setShowFinishMatchModal={setShowFinishMatchModal} handleFinishMatch={handleFinishMatch}
        showLeagueModal={showLeagueModal} setShowLeagueModal={setShowLeagueModal} handleAddLeague={handleAddLeague}
        showFinishLeagueModal={showFinishLeagueModal} setShowFinishLeagueModal={setShowFinishLeagueModal} handleFinishLeague={handleFinishLeague}
        showAwardModal={showAwardModal} setShowAwardModal={setShowAwardModal} handleAddAward={handleAddAward}
        showFinishAwardModal={showFinishAwardModal} setShowFinishAwardModal={setShowFinishAwardModal} handleFinishAward={handleFinishAward}
        showAchievementModal={showAchievementModal} setShowAchievementModal={setShowAchievementModal}
        handleSaveAchievement={handleSaveAchievement} handleDeleteAchievement={handleDeleteAchievement}
        showTitleModal={showTitleModal} setShowTitleModal={setShowTitleModal}
        handleSaveTitle={handleSaveTitle} handleDeleteTitle={handleDeleteTitle}
        showCrownModal={showCrownModal} setShowCrownModal={setShowCrownModal} handleAwardCrown={handleAwardCrown}
        itemToFinish={itemToFinish} setItemToFinish={setItemToFinish}
        editingItem={editingItem} setEditingItem={setEditingItem}
        users={users} currentMonth={currentMonth} currentUser={currentUser}
      />

      {/* ── NUEVOS MODALES BANNERS ── */}
      {showBannerModal && (
        <AdminBannerModal
          onClose={() => setShowBannerModal(false)}
          onCreate={handleCreateBanner}
        />
      )}

      {showAssignBannerModal && (
        <AdminAssignBannerModal
          onClose={() => setShowAssignBannerModal(false)}
          banners={banners}
          users={users}
          onAssign={handleAssignBanner}
          onRevoke={handleRevokeBanner}
        />
      )}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}