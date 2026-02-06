import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import { ThemeProvider } from "./context/ThemeContext";

import Header from "./components/Header";
import InstallPWAButton from './components/InstallPWAButton';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import RankingPage from "./pages/RankingPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import { PageLoader } from "./components/LoadingStates";

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // ============================================
  // 🌐 DETECCIÓN OFFLINE / ONLINE
  // ============================================
  useEffect(() => {
    const goOffline = () => {
      console.log("📴 Offline mode activated");
      setIsOffline(true);

      const cachedUser = localStorage.getItem("cachedUser");
      if (cachedUser) {
        setCurrentUser(JSON.parse(cachedUser));
        setSession({ offline: true });
      }

      setLoading(false);
      setInitialLoad(false);
    };

    const goOnline = () => {
      console.log("🌐 Back online");
      setIsOffline(false);
      window.location.reload(); // refresca sesión real
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  // ============================================
  // 🔐 AUTH SUPABASE (SOLO ONLINE)
  // ============================================
  useEffect(() => {
    if (isOffline) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      setSession(data?.session || null);

      if (data?.session) {
        loadUserData(data.session.user.id);
      } else {
        setLoading(false);
        setInitialLoad(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSession(session);

        if (session) {
          loadUserData(session.user.id);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isOffline]);

  // ============================================
  // 👤 CARGAR PERFIL USUARIO
  // ============================================
  const loadUserData = async (authId) => {
    if (!navigator.onLine) {
      console.log("📴 Skipping user fetch (offline)");
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();

      if (error) {
        console.error("Profile error:", error);
        return;
      }

      if (profile) {
        setCurrentUser(profile);

        // 👉 GUARDAR EN CACHE LOCAL
        localStorage.setItem("cachedUser", JSON.stringify(profile));
      }

      const { data: userList } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      setUsers(userList || []);

    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  if (loading && initialLoad) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {session && currentUser && (
          <Header currentUser={currentUser} users={users} />
        )}

        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={session ? <Navigate to="/app" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={session ? <Navigate to="/app" replace /> : <RegisterPage />}
          />
          <Route
            path="/forgot-password"
            element={session ? <Navigate to="/app" replace /> : <ForgotPasswordPage />}
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/app"
            element={session ? <DashboardPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/notifications"
            element={session ? <NotificationsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/ranking"
            element={session ? <RankingPage currentUser={currentUser} users={users} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin"
            element={session ? <AdminPage currentUser={currentUser} users={users} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={session ? <ProfilePage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/stats"
            element={session ? <StatsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/settings"
            element={session ? <SettingsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
        </Routes>

        <InstallPWAButton />

        {/* Banner offline opcional */}
        {isOffline && (
          <div style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            background: "#ff9800",
            color: "#fff",
            textAlign: "center",
            padding: "6px",
            fontSize: "14px",
            zIndex: 9999
          }}>
            📡 Estás en modo offline
          </div>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}
