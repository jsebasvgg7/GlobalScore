import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

import AvatarUpload from "../components/AvatarUpload";
import AchievementsSection from "../components/AchievementsSection";

import useUserData from "../hooks/useUserData";
import useAchievements from "../hooks/useAchievements";

import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const { user, loading } = useUserData();
  const { achievements } = useAchievements();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.user_metadata?.username || "");
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <p className="profile-loading">Cargando perfil...</p>;
  }

  return (
    <div className="profile-wrapper">

      {/* AVATAR + NOMBRE */}
      <section className="profile-header">
        <AvatarUpload user={user} />

        <div className="profile-info">
          <h2>{username}</h2>
          <p>{email}</p>
        </div>
      </section>

      {/* ESTADÍSTICAS BÁSICAS */}
      <section className="profile-stats">
        <h3>Estadísticas</h3>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-value">{user?.points || 0}</span>
            <span className="stat-label">Puntos</span>
          </div>

          <div className="stat-box">
            <span className="stat-value">{user?.wins || 0}</span>
            <span className="stat-label">Victorias</span>
          </div>

          <div className="stat-box">
            <span className="stat-value">{user?.awards_count || 0}</span>
            <span className="stat-label">Premios</span>
          </div>

          <div className="stat-box">
            <span className="stat-value">{user?.leagues_count || 0}</span>
            <span className="stat-label">Ligas</span>
          </div>
        </div>
      </section>

      {/* LOGROS */}
      <section className="profile-achievements">
        <h3>Logros</h3>
        <AchievementsSection achievements={achievements} />
      </section>

      {/* ACCIONES */}
      <section className="profile-actions">
        <button className="action-btn">Editar Perfil</button>
        <button className="action-btn">Cambiar Contraseña</button>

        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </section>
    </div>
  );
}
