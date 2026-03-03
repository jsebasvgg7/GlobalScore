// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { ToastContainer, useToast } from '../components/ComOthers/Toast';
import Footer from '../components/ComOthers/Footer';
import AdminAchievementsModal from '../components/ComAdmin/AdminAchievementsModal';
import AdminTitlesModal from '../components/ComAdmin/AdminTitlesModal';

// Hooks personalizados
import { useProfileData } from '../hooks/HooksProfile/useProfileData';
import { usePredictionHistory } from '../hooks/HooksProfile/usePredictionHistory';
import { useStreaks } from '../hooks/HooksProfile/useStreaks';
import { useAchievements } from '../hooks/HooksProfile/useAchievements';
import { useUserRanking } from '../hooks/HooksProfile/useUserRanking';
import { useMonthlyChampionships } from '../hooks/HooksProfile/useMonthlyChampionships';

// Componentes de UI
import ProfileHero from '../components/ComProfile/ProfileHero';
import ProfileTabs from '../components/ComProfile/ProfileTabs';
import OverviewTab from '../components/ComProfile/OverviewTab';
import AchievementsTab from '../components/ComProfile/AchievementsTab';
import MonthlyChampionshipsTab from '../components/ComProfile/MonthlyChampionshipsTab';
import HistoryTab from '../components/ComProfile/HistoryTab';
import EditTab from '../components/ComProfile/EditTab';

// Importar el nuevo archivo CSS modular
import '../styles/StylesPages/ProfilePageNew.css';

export default function ProfilePage({ currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdminAchievementsModal, setShowAdminAchievementsModal] = useState(false);
  const [showAdminTitlesModal, setShowAdminTitlesModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const toast = useToast();

  // Custom Hooks
  const { userData, setUserData, loading, loadUserData, saveUserData } = useProfileData(currentUser);
  const { predictionHistory, historyLoading } = usePredictionHistory(currentUser);
  const { streakData } = useStreaks(currentUser);
  const { userRanking } = useUserRanking(currentUser);
  const { crownHistory, monthlyStats, championshipsLoading } = useMonthlyChampionships(currentUser);
  
  const {
    userAchievements,
    userTitles,
    availableAchievements,
    availableTitles,
    achievementsLoading,
    getActiveTitle,
    handleSaveAchievement,
    handleDeleteAchievement,
    handleSaveTitle,
    handleDeleteTitle
  } = useAchievements(currentUser, streakData);

  const activeTitle = getActiveTitle();

  const handleSave = () => {
    saveUserData(toast, () => {
      setActiveTab('overview');
      setTimeout(() => {
        onBack();
      }, 1500);
    });
  };

  const handleAvatarUpload = (newUrl) => {
    setUserData({ ...userData, avatar_url: newUrl });
    toast.success('Avatar updated successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            userData={userData}
            currentUser={currentUser}
            userRanking={userRanking}
          />
        );

      case 'achievements':
        return (
          <AchievementsTab
            activeTitle={activeTitle}
            userTitles={userTitles}
            userAchievements={userAchievements}
            availableAchievements={availableAchievements}
            achievementsLoading={achievementsLoading}
          />
        );

      case 'championships':
        return (
          <MonthlyChampionshipsTab
            userData={{ ...userData, ...monthlyStats }}
            crownHistory={crownHistory}
            monthlyStats={monthlyStats}
            championshipsLoading={championshipsLoading}
          />
        );

      case 'history':
        return (
          <HistoryTab
            predictionHistory={predictionHistory}
            historyLoading={historyLoading}
          />
        );

      case 'edit':
        return (
          <EditTab
            userData={userData}
            setUserData={setUserData}
            currentUser={currentUser}
            loading={loading}
            handleSave={handleSave}
            handleAvatarUpload={handleAvatarUpload}
            loadUserData={loadUserData}
            setActiveTab={setActiveTab}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page-modern">
      <div className="profile-container-modern">
        {/* COLUMNA IZQUIERDA - Hero + Tabs (Desktop) */}
        <div className="profile-left-column">
          <ProfileHero 
            userData={userData}
            currentUser={currentUser}
          />

          <ProfileTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* COLUMNA DERECHA - Contenido (Desktop) */}
        <div className="profile-right-column">
          {renderTabContent()}
        </div>
      </div>

      <Footer />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {showAdminAchievementsModal && (
        <AdminAchievementsModal
          onClose={() => {
            setShowAdminAchievementsModal(false);
            setEditingAchievement(null);
          }}
          onSave={(data) => handleSaveAchievement(data, toast)}
          onDelete={(id) => handleDeleteAchievement(id, toast)}
          existingAchievement={editingAchievement}
        />
      )}

      {showAdminTitlesModal && (
        <AdminTitlesModal
          onClose={() => {
            setShowAdminTitlesModal(false);
            setEditingTitle(null);
          }}
          onSave={(data) => handleSaveTitle(data, toast)}
          onDelete={(id) => handleDeleteTitle(id, toast)}
          existingTitle={editingTitle}
        />
      )}
    </div>
  );
}