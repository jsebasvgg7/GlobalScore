import React, { useState, useEffect } from "react";
import { Trophy, LogOut, User2, Award, Shield, Bell, Home, BarChart3, Moon, Sun, Globe } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/StylesOthers/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [clock, setClock] = useState("");
  const [tooltip, setTooltip] = useState(null);

  // Reloj en vivo
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const d = now.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).toUpperCase();
      const t = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      setClock(`${d} · ${t}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
    ...(currentUser?.is_admin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  const firstName = currentUser?.name?.split(" ")[0] || "Jugador";
  const initials  = (currentUser?.name || "U").slice(0, 2).toUpperCase();
  const pageName  = navItems.find((n) => isActive(n.path))?.label || "GlobalScore";

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR — wireframe 52px
      ══════════════════════════════════════ */}
      <aside className="gs-sidebar">

        {/* Logo */}
        <div className="gs-logo-wrap">
          <button className="gs-logo-btn" onClick={() => navigate("/app")} aria-label="Inicio">
            <Trophy size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="gs-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`gs-nav-btn${isActive(path) ? " gs-nav-btn--active" : ""}`}
              onClick={() => navigate(path)}
              onMouseEnter={() => setTooltip(path)}
              onMouseLeave={() => setTooltip(null)}
              aria-label={label}
            >
              <Icon size={18} />
              {tooltip === path && <span className="gs-tooltip">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="gs-sidebar-bottom">
          <button
            className="gs-nav-btn"
            onClick={toggleTheme}
            onMouseEnter={() => setTooltip("theme")}
            onMouseLeave={() => setTooltip(null)}
            aria-label="Tema"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            {tooltip === "theme" && (
              <span className="gs-tooltip">{theme === "light" ? "Oscuro" : "Claro"}</span>
            )}
          </button>
          <button
            className="gs-nav-btn gs-nav-btn--logout"
            onClick={handleLogout}
            onMouseEnter={() => setTooltip("logout")}
            onMouseLeave={() => setTooltip(null)}
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
            {tooltip === "logout" && <span className="gs-tooltip">Salir</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          DESKTOP TOPBAR — wireframe delgado
      ══════════════════════════════════════ */}
      <header className="gs-topbar">

        {/* Logo zone + breadcrumb */}
        <div className="gs-topbar-left">
          <div className="gs-topbar-logo-zone">
            <div className="gs-topbar-logo-icon">
              <Trophy size={14} />
            </div>
          </div>
          <div className="gs-breadcrumb">
            <span className="gs-breadcrumb-app">GlobalScore</span>
            <span className="gs-breadcrumb-sep">/</span>
            <span className="gs-breadcrumb-page">{pageName.toLowerCase()}</span>
          </div>
        </div>

        {/* Derecha: reloj + notif + usuario */}
        <div className="gs-topbar-right">
          <span className="gs-clock">{clock}</span>

          <button
            className="gs-topbar-icon-btn"
            onClick={() => navigate("/notifications")}
            aria-label="Notificaciones"
          >
            <Bell size={16} />
            <span className="gs-bell-dot" />
          </button>

          <div
            className="gs-user-chip"
            onClick={() => navigate("/profile")}
            role="button"
            tabIndex={0}
          >
            <div className="gs-user-avatar">
              {currentUser?.avatar_url
                ? <img src={currentUser.avatar_url} alt={firstName} />
                : <span>{initials}</span>
              }
            </div>
            <div className="gs-user-info">
              <span className="gs-user-name">{firstName}</span>
              <span className="gs-user-role">{currentUser?.is_admin ? "Admin" : "Jugador"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE — Top Header
      ══════════════════════════════════════ */}
      <header className="gs-mobile-header">
        <div className="gs-mobile-left">
          <button className="gs-mobile-avatar" onClick={() => navigate("/profile")}>
            {currentUser?.avatar_url
              ? <img src={currentUser.avatar_url} alt={firstName} />
              : <span>{initials}</span>
            }
          </button>
          <div className="gs-mobile-greeting">
            <span className="gs-mobile-hey">Hey,</span>
            <span className="gs-mobile-name">{firstName}</span>
          </div>
        </div>
        <div className="gs-mobile-actions">
          <button className="gs-mobile-btn" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="gs-mobile-btn" onClick={() => navigate("/notifications")}>
            <Bell size={16} />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE — Bottom Nav
      ══════════════════════════════════════ */}
      <nav className="gs-bottom-nav">
        <div className="gs-bottom-pill">
          {navItems.slice(0, 6).map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`gs-bottom-btn${isActive(path) ? " gs-bottom-btn--active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}