// src/components/MainLayout.jsx (Actualizado)

import { Outlet } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./LoadingStates";

export default function MainLayout() {
  // Usamos useAuth para obtener el perfil y el estado de admin
  const { profile, loading, isAdmin } = useAuth(); 

  if (loading) return <PageLoader />;

  return (
    <div className="vega-root">
      {/* Pasamos isAdmin al Header */}
      <Header currentUser={profile} isAdmin={isAdmin} /> 
      
      <main className="container">
        <Outlet /> 
      </main>
    </div>
  );
}