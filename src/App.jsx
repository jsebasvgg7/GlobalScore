import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from '@/shared/services/supabase/client';
import { ThemeProvider } from './context/ThemeContext';
import { resetWelcome } from "@/features/auth/page/LoginPage";

import { Header } from "@/shared/layout";
import LoginPage from "@/features/auth/page/LoginPage";
import RegisterPage from "@/features/auth/page/RegisterPage";
import ForgotPasswordPage from "@/features/auth/page/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/page/ResetPasswordPage";
import DashboardPage from "@/features/dashboard/page/DashboardPage";
import RankingPage from "@/features/ranking/page/RankingPage";
import HistoryPage from "@/features/history/page/HistoryPage";
import AdminPage from "@/features/admin/page/AdminPage";
import ProfileSettingsPage from "@/features/profile/page/ProfileSettingsPage";
import NotificationsPage from "@/features/notifications/page/NotificationsPage";
import StatsPage from "@/features/stats/page/StatsPage";
import WorldCupPage from "@/features/worldcup/page/WorldCupPage";
import AlbumsPage from "@/features/albums/page/AlbumsPage";
import NotesPage from "@/features/notes/page/NotesPage";
import { PageLoader } from "@/shared/ui";
import "./styles/layout.css";

export default function App() {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (loading && initialLoad) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }

    return () => {
      document.body.classList.remove('loading');
    };
  }, [loading, initialLoad]);

  useEffect(() => {
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

        // Resetear el welcome screen cuando el usuario cierra sesión,
        // ANTES de que React monte LoginPage de nuevo.
        if (_event === "SIGNED_OUT") {
          resetWelcome();
        }

        setSession(session);
        if (session) {
          loadUserData(session.user.id);
        } else {
          setLoading(false);
          setCurrentUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (authId) => {
    try {
      console.log("🔍 Loading user data for auth_id:", authId);

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Profile error:", profileError);

        if (profileError.message.includes('permission')) {
          console.log("🚪 Signing out due to permission error");
          await supabase.auth.signOut();
          setSession(null);
          setCurrentUser(null);
          setLoading(false);
          setInitialLoad(false);
          return;
        }
      }

      if (!profile) {
        console.log("📝 Perfil no encontrado, creando uno nuevo...");

        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          console.error("❌ No se pudo obtener usuario de Auth");
          await supabase.auth.signOut();
          setSession(null);
          setCurrentUser(null);
          setLoading(false);
          setInitialLoad(false);
          return;
        }

        const userName = authUser.user_metadata?.name ||
          authUser.user_metadata?.display_name ||
          authUser.email?.split('@')[0] ||
          "Usuario";

        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: authUser.id,
            name: userName,
            email: authUser.email,
            points: 0,
            predictions: 0,
            correct: 0,
            monthly_points: 0,
            monthly_predictions: 0,
            monthly_correct: 0,
            current_streak: 0,
            best_streak: 0,
            level: 1,
            monthly_championships: 0
          })
          .select()
          .single();

        if (createError) {
          console.error("❌ Error al crear perfil:", createError);

          if (createError.code === '23505') {
            const { data: existingProfile } = await supabase
              .from("users")
              .select("*")
              .eq("auth_id", authId)
              .single();

            if (existingProfile) {
              console.log("✅ Perfil duplicado encontrado:", existingProfile);
              setCurrentUser(existingProfile);
            } else {
              await supabase.auth.signOut();
              setSession(null);
              setCurrentUser(null);
              setLoading(false);
              setInitialLoad(false);
              return;
            }
          } else {
            await supabase.auth.signOut();
            setSession(null);
            setCurrentUser(null);
            setLoading(false);
            setInitialLoad(false);
            return;
          }
        } else {
          console.log("✅ Perfil creado exitosamente:", newProfile);
          setCurrentUser(newProfile);
        }
      } else {
        console.log("✅ Profile loaded:", profile);
        setCurrentUser(profile);
      }

      const { data: userList, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      if (usersError) {
        console.error("⚠️ Error loading users list:", usersError);
      } else {
        setUsers(userList || []);
      }

    } catch (err) {
      console.error("💥 Unexpected error loading user data:", err);
      console.error("Error manteniendo sesión activa");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setInitialLoad(false);
      }, 300);
    }
  };

  if (loading && initialLoad) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {session && currentUser && (
          <Header
            currentUser={currentUser}
            users={users}
            onProfileClick={() => setShowProfile(!showProfile)}
          />
        )}

        <Routes>
          {/* ── Rutas públicas ── */}
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
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          {/* ── Rutas protegidas ── */}
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
            path="/history"
            element={session ? <HistoryPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/stats"
            element={session ? <StatsPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/world"
            element={session ? <WorldCupPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/notes"
            element={session ? <NotesPage currentUser={currentUser} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/albums"
            element={session ? <AlbumsPage /> : <Navigate to="/" replace />}
          />

          <Route
            path="/profile"
            element={
              session
                ? <ProfileSettingsPage currentUser={currentUser} onBack={() => window.history.back()} />
                : <Navigate to="/" replace />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}