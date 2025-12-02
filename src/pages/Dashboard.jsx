// src/pages/Dashboard.jsx (Código Corregido)

import React, { useState } from "react"; 
import { Trophy, TrendingUp, Target, Percent, Plus, CheckCircle, Shield, Settings, Zap, Star, Award as AwardIcon } from "lucide-react";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import LeagueCard from "../components/LeagueCard";
import AwardCard from "../components/AwardCard";
import RankingSidebar from "../components/RankingSidebar";
import NavigationTabs from "../components/NavigationTabs";
import NavigationTabsTwo from "../components/NavigationTabsTwo";
import AdminModal from "../components/AdminModal";
import AdminLeagueModal from "../components/AdminLeagueModal";
import AdminAwardModal from "../components/AdminAwardModal";
import FinishLeagueModal from "../components/FinishLeagueModal";
import FinishAwardModal from "../components/FinishAwardModal";
import ProfilePage from "./ProfilePage";
import { PageLoader, MatchListSkeleton, StatCardSkeleton, LoadingOverlay } from "../components/LoadingStates";
import { ToastContainer, useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";

// 💡 Importar los hooks necesarios
import { useAuth } from "../context/AuthContext"; 
import { useDashboardData } from "../hooks/useDashboardData";

import "../styles/VegaScorePage.css"; // Mantén el nombre CSS si no lo has renombrado
import "../styles/AdminPanel.css";


export default function Dashboard() { // Renombrado a Dashboard
  
  // 1. OBTENER EL USUARIO AUTENTICADO
  const { profile: currentUser, isAdmin } = useAuth(); 

  // 2. OBTENER TODOS LOS DATOS Y ESTADOS DEL HOOK
  const { 
    matches, 
    leagues, 
    awards, 
    users, 
    loading: dataLoading, 
    refreshData 
  } = useDashboardData(); 


  // Estados locales para UI/Admin (Mantenemos estos)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminLeagueModal, setShowAdminLeagueModal] = useState(false);
  const [showAdminAwardModal, setShowAdminAwardModal] = useState(false);
  const [showFinishLeagueModal, setShowFinishLeagueModal] = useState(false);
  const [leagueToFinish, setLeagueToFinish] = useState(null);
  const [showFinishAwardModal, setShowFinishAwardModal] = useState(false);
  const [awardToFinish, setAwardToFinish] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); 
  const [activeTabTwo, setActiveTabTwo] = useState('match'); 
  const [showProfile, setShowProfile] = useState(false); 
  
  const toast = useToast();
  
  // ----------------------------------------------------
  // LOGICA DE ADMINISTRACIÓN (Ejemplo de uso de refreshData)
  // ----------------------------------------------------
  
  // ADAPTACIÓN: Asegúrate de que TODAS las funciones que modifican la base de datos
  // (addMatch, addLeague, finishLeague, etc.) llamen a refreshData() al finalizar con éxito.
  
  const addMatch = async (newMatch) => {
    setActionLoading(true);
    // ... Lógica para insertar en Supabase ...
    const { error } = await supabase.from('matches').insert([newMatch]);

    if (error) {
        toast.addToast(`Error al añadir partido: ${error.message}`, 'error');
    } else {
        toast.addToast('Partido añadido correctamente!', 'success');
        refreshData(); // 💡 ¡CLAVE! RECARGAR LOS DATOS DEL HOOK
    }
    setShowAdminModal(false);
    setActionLoading(false);
  };
  
  const finishLeague = async (leagueId, winners) => {
    setActionLoading(true);
    // ... Lógica para finalizar la liga en Supabase ...
    // Aquí es donde calcularías los puntos
    // Por simplicidad, solo actualizaremos el estado y recargaremos
    
    // Simulación de actualización
    const { error } = await supabase.from('leagues').update({ status: 'finished' }).eq('id', leagueId);
    
    if (error) {
        toast.addToast(`Error al finalizar liga: ${error.message}`, 'error');
    } else {
        toast.addToast('Liga finalizada y puntos calculados!', 'success');
        refreshData(); // 💡 ¡CLAVE! RECARGAR LA DATA
    }
    
    setShowFinishLeagueModal(false);
    setLeagueToFinish(null);
    setActionLoading(false);
  };


  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------

  // 🛑 Bloquea la renderización si aún estamos cargando los datos del hook
  if (dataLoading) {
    return <PageLoader />;
  }
  
  // Filtrado y Stats
  const totalMatches = matches.length;
  // Usamos match.prediction para saber si el usuario hizo una predicción
  const predictedMatches = matches.filter(m => m.prediction).length; 
  const accuracy = totalMatches > 0 ? ((predictedMatches / totalMatches) * 100).toFixed(1) : 0;
  
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const finishedMatches = matches.filter(m => m.status === 'finished');
  const liveMatches = matches.filter(m => m.status === 'live');
  
  // Función de filtro para MatchCard
  const displayMatches = activeTab === 'upcoming' 
    ? upcomingMatches 
    : activeTab === 'finished' 
    ? finishedMatches 
    : liveMatches;

  
  return (
    <>
      <div className="app-container">
        
        {/* HEADER: Pasa el usuario y el estado de administración */}
        <Header 
          currentUser={currentUser} 
          isAdmin={isAdmin}
          users={users} 
          // Si usas el Header con Link, no necesitas onProfileClick,
          // pero si lo usas para cambiar el estado local (showProfile), úsalo:
          // onProfileClick={() => setShowProfile(true)}
        />

        <main className="main-content">
          <section className="dashboard-content">
            
            {/* --------------------------------------
               A. STATS
               -------------------------------------- */}
            <div className="stat-cards">
              <div className="stat-card">
                <Trophy size={20} className="icon gold" />
                {/* Ahora currentUser viene del useAuth/useDashboardData */}
                <p>Puntos: <strong>{currentUser?.points || 0}</strong></p> 
                <span className="stat-label">Tu Puntuación</span>
              </div>
              <div className="stat-card">
                <Target size={20} className="icon secondary" />
                <p>Predichos: <strong>{predictedMatches} / {totalMatches}</strong></p>
                <span className="stat-label">Predicciones Hechas</span>
              </div>
              <div className="stat-card">
                <Percent size={20} className="icon primary" />
                <p>Precisión: <strong>{accuracy}%</strong></p>
                <span className="stat-label">Acertividad</span>
              </div>
              <div className="stat-card admin-card" onClick={() => isAdmin && setShowAdminModal(true)}>
                <Shield size={20} className="icon red" />
                <p>Admin: <strong>{isAdmin ? 'Activo' : 'Inactivo'}</strong></p>
                <span className="stat-label">Panel de Control</span>
              </div>
            </div>

            {/* --------------------------------------
               B. NAVEGACIÓN PRINCIPAL
               -------------------------------------- */}
            <NavigationTabs 
              activeTab={activeTabTwo}
              setActiveTab={setActiveTabTwo}
              tabs={[
                { id: 'match', label: 'Partidos' },
                { id: 'league', label: 'Ligas' },
                { id: 'award', label: 'Premios Individuales' }
              ]}
            />


            {/* --------------------------------------
               C. VISTAS DE PREDICCIONES
               -------------------------------------- */}
            
            {/* 1. VISTA DE PARTIDOS */}
            {activeTabTwo === 'match' && (
              <>
                <NavigationTabsTwo 
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabs={[
                    { id: 'upcoming', label: 'Pendientes' },
                    { id: 'live', label: 'En Vivo' },
                    { id: 'finished', label: 'Terminados' }
                  ]}
                />
                
                <div className="match-list">
                  {displayMatches.length === 0 ? (
                    <p>No hay partidos en esta categoría.</p>
                  ) : (
                    displayMatches.map(match => (
                      <MatchCard 
                        key={match.id} 
                        match={match} 
                        currentUser={currentUser} 
                        refreshData={refreshData} // Permite a la tarjeta actualizar la data después de una predicción
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {/* 2. VISTA DE LIGAS */}
            {activeTabTwo === 'league' && (
              <div className="league-list">
                {leagues.length === 0 ? (
                  <p>No hay ligas activas.</p>
                ) : (
                  leagues.map(league => (
                    <LeagueCard 
                      key={league.id} 
                      league={league} 
                      currentUser={currentUser}
                      refreshData={refreshData}
                    />
                  ))
                )}
              </div>
            )}

            {/* 3. VISTA DE PREMIOS */}
            {activeTabTwo === 'award' && (
              <div className="award-list">
                {awards.length === 0 ? (
                  <p>No hay premios individuales activos.</p>
                ) : (
                  awards.map(award => (
                    <AwardCard 
                      key={award.id} 
                      award={award} 
                      currentUser={currentUser}
                      refreshData={refreshData}
                    />
                  ))
                )}
              </div>
            )}
            
          </section>

          {/* --------------------------------------
             D. SIDEBAR (Ranking)
             -------------------------------------- */}
          <aside className="ranking-sidebar">
            {/* Pasamos la lista de 'users' */}
            <RankingSidebar users={users} currentUser={currentUser} />
          </aside>
        </main>
        
        {/* Modales Admin (Asegúrate de que tus funciones de modales usen refreshData) */}
        {showAdminModal && (
          <AdminModal onAdd={addMatch} onClose={() => setShowAdminModal(false)} />
        )}

        {showFinishLeagueModal && leagueToFinish && (
          <FinishLeagueModal 
            league={leagueToFinish}
            onFinish={finishLeague}
            onClose={() => {
              setShowFinishLeagueModal(false);
              setLeagueToFinish(null);
            }}
          />
        )}
        
        {/* ... Otros Modales ... */}
        
        {actionLoading && <LoadingOverlay message="Procesando..." />}
      </div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}