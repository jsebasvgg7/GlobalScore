// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VegaScorePage from "./pages/VegaScorePage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";

// Wrapper para pasar navigate a los componentes
function AppRoutes() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data?.session || null);
      
      // Si hay sesión, cargar datos del usuario
      if (data?.session) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", data.session.user.id)
          .single();
        
        setCurrentUser(userData);
      }
      
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", session.user.id)
            .single();
          
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Limpiar el listener al desmontar
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <p style={{ color: "#fff" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Si está logueado → redirigir a /app */}
      <Route
        path="/"
        element={session ? <Navigate to="/app" /> : <LoginPage />}
      />

      {/* Si está logueado → no mostrar registro */}
      <Route
        path="/register"
        element={session ? <Navigate to="/app" /> : <RegisterPage />}
      />

      {/* Página principal protegida */}
      <Route
        path="/app"
        element={session ? <VegaScorePage /> : <Navigate to="/" />}
      />

      {/* Página de Ranking */}
      <Route
        path="/ranking"
        element={
          session ? (
            <RankingPage 
              currentUser={currentUser} 
              onBack={() => navigate('/app')} 
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Página de Admin - Solo para administradores */}
      <Route
        path="/admin"
        element={
          session && currentUser?.is_admin ? (
            <AdminPage 
              currentUser={currentUser} 
              onBack={() => navigate('/app')} 
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}