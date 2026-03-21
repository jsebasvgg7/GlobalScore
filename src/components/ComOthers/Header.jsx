import React, { useState } from "react";
import {
  Trophy, LogOut, User2, Award, Shield, Bell,
  Home, BarChart3, Moon, Sun, Globe
} from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/StylesOthers/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [tooltipVisible, setTooltipVisible] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/app",     icon: Home,      label: "Inicio"  },
    { path: "/ranking", icon: Award,     label: "Ranking" },
    { path: "/stats",   icon: BarChart3, label: "Stats"   },
    { path: "/world",   icon: Globe,     label: "Mundo"   },
    { path: "/profile", icon: User2,     label: "Perfil"  },
    ...(currentUser?.is_admin
      ? [{ path: "/admin", icon: Shield, label: "Admin" }]
      : []),
  ];

  const firstName =
    currentUser?.name?.split(" ")[0] ||
    currentUser?.username ||
    currentUser?.email?.split("@")[0] ||
    "Jugador";

  const initials = firstName.slice(0, 2).toUpperCase();

  // ── Puntos y nivel del usuario ──
  const userPoints   = currentUser?.points || 0;
  const userLevel    = currentUser?.level || 1;
  const levelPct     = Math.round(((userPoints % 20) / 20) * 100);

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP — Sidebar solo iconos
      ══════════════════════════════════════ */}
      <aside className="gs-sidebar">

        {/* Logo */}
        <button
          className="gs-logo"
          onClick={() => navigate("/app")}
          aria-label="GlobalScore home"
        >
          <Trophy size={22} />
        </button>

        {/* Nav items — solo iconos */}
        <nav className="gs-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`gs-nav-btn ${isActive(path) ? "active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
              onMouseEnter={() => setTooltipVisible(path)}
              onMouseLeave={() => setTooltipVisible(null)}
            >
              <Icon size={20} />
              {tooltipVisible === path && (
                <span className="gs-tooltip">{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom: tema + logout */}
        <div className="gs-sidebar-bottom">
          <button
            className="gs-nav-btn"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            onMouseEnter={() => setTooltipVisible("theme")}
            onMouseLeave={() => setTooltipVisible(null)}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            {tooltipVisible === "theme" && (
              <span className="gs-tooltip">
                {theme === "light" ? "Modo oscuro" : "Modo claro"}
              </span>
            )}
          </button>

          <button
            className="gs-nav-btn gs-logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            onMouseEnter={() => setTooltipVisible("logout")}
            onMouseLeave={() => setTooltipVisible(null)}
          >
            <LogOut size={20} />
            {tooltipVisible === "logout" && (
              <span className="gs-tooltip">Cerrar sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          DESKTOP — Topbar sin search
      ══════════════════════════════════════ */}
      <header className="gs-topbar">

        {/* Título de página activa */}
        <div className="gs-topbar-title">
          <span>{navItems.find(n => isActive(n.path))?.label || "GlobalScore"}</span>
          <span className="gs-topbar-sub">Bienvenido, {firstName}</span>
        </div>

        {/* Acciones — derecha */}
        <div className="gs-topbar-actions">

          {/* Bell */}
          <button
            className="gs-topbar-btn gs-topbar-bell"
            onClick={() => navigate("/notifications")}
            aria-label="Notificaciones"
          >
            <Bell size={16} />
            <span className="gs-bell-dot" />
          </button>

          {/* User pill */}
          <div
            className="gs-topbar-user"
            onClick={() => navigate("/profile")}
            role="button"
            tabIndex={0}
          >
            <div className="gs-topbar-avatar">
              {currentUser?.avatar_url
                ? <img src={currentUser.avatar_url} alt={firstName} />
                : <span>{initials}</span>
              }
            </div>
            <div className="gs-topbar-user-info">
              <span className="gs-topbar-user-name">{firstName}</span>
              <span className="gs-topbar-user-role">
                {currentUser?.is_admin ? "Admin" : "Jugador"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE — Top Header (sin cambios)
      ══════════════════════════════════════ */}
      <header className="gs-mobile-header">
        <div className="gs-mobile-user">
          <button
            className="gs-avatar"
            onClick={() => navigate("/profile")}
            aria-label="Ver perfil"
          >
            {currentUser?.avatar_url
              ? <img src={currentUser.avatar_url} alt={firstName} />
              : <span>{initials}</span>
            }
          </button>
          <div className="gs-greeting">
            <span className="gs-greeting-hey">Hey,</span>
            <span className="gs-greeting-name">{firstName}</span>
          </div>
        </div>

        <div className="gs-mobile-actions">
          <button className="gs-mobile-btn" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            className="gs-mobile-btn"
            onClick={() => navigate("/notifications")}
            aria-label="Notificaciones"
          >
            <Bell size={18} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE — Bottom Nav pill (sin cambios)
      ══════════════════════════════════════ */}
      <nav className="gs-bottom-nav" aria-label="Navegación principal">
        <div className="gs-bottom-pill">
          {navItems.slice(0, 7).map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`gs-bottom-btn ${isActive(path) ? "active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
            >
              <Icon size={22} />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}