import React, { useState, useEffect } from "react";
import { Trophy, LogOut, User2, Award, Shield, Bell, Home, BarChart3, Moon, Sun, Globe, NotebookPen, BookMarked } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import MobileHeader from "../ComLayout/MobileHeader";
import "../../styles/StylesLayout/Header.css";

export default function Header({ currentUser, users = [], onProfileClick }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [clock, setClock] = useState("");
  const [tooltip, setTooltip] = useState(null);

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

  /* ── Sidebar / Desktop nav ── */
  const sidebarItems = [
    { path: "/app",     icon: Home,        label: "Inicio"  },
    { path: "/ranking", icon: Award,       label: "Ranking" },
    { path: "/stats",   icon: BarChart3,   label: "Stats"   },
    { path: "/world",   icon: Globe,       label: "Mundo"   },
    { path: "/profile", icon: User2,       label: "Perfil"  },
    { path: "/notes",   icon: NotebookPen, label: "Notas"   },
    { path: "/history", icon: BookMarked,  label: "Historia" },
    ...(currentUser?.is_admin ? [{ path: "/admin", icon: Shield, label: "Admin" }] : []),
  ];

  const firstName = currentUser?.name?.split(" ")[0] || "Jugador";
  const initials  = (currentUser?.name || "U").slice(0, 2).toUpperCase();
  const pageName  = sidebarItems.find((n) => isActive(n.path))?.label || "GlobalScore";

  return (
    <>
      {/* ══════════════════════════════════════
          MOBILE HEADER — delegado a MobileHeader
      ══════════════════════════════════════ */}
      <MobileHeader currentUser={currentUser} />

      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR — Brutalista Japonés
      ══════════════════════════════════════ */}
      <aside className="gs-sidebar">

        {/* Logo */}
        <div className="gs-logo-wrap">
          <button className="gs-logo-btn" onClick={() => navigate("/app")} aria-label="Inicio">
            <Trophy size={18} />
          </button>
        </div>

        {/* Separador decorativo */}
        <div className="gs-sidebar-divider">
          <span>NAV</span>
        </div>

        {/* Navegación — centrada verticalmente */}
        <nav className="gs-nav">
          {sidebarItems.map(({ path, icon: Icon, label }, index) => (
            <button
              key={path}
              className={`gs-nav-btn${isActive(path) ? " gs-nav-btn--active" : ""}`}
              data-index={String(index + 1).padStart(2, "0")}
              onClick={() => navigate(path)}
              onMouseEnter={() => setTooltip(path)}
              onMouseLeave={() => setTooltip(null)}
              aria-label={label}
            >
              <Icon size={16} />
              {tooltip === path && <span className="gs-tooltip">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Zona inferior — tema + season info + logout */}
        <div className="gs-sidebar-bottom">

          {/* Bloque temporada */}
          <div className="gs-season-block">
            <span className="gs-season-label">TEMP</span>
            <span className="gs-season-year">25/26</span>
          </div>

          {/* Botón tema */}
          <button
            className="gs-nav-btn"
            onClick={toggleTheme}
            onMouseEnter={() => setTooltip("theme")}
            onMouseLeave={() => setTooltip(null)}
            aria-label="Tema"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            {tooltip === "theme" && (
              <span className="gs-tooltip">{theme === "light" ? "Oscuro" : "Claro"}</span>
            )}
          </button>

          {/* Logout */}
          <button
            className="gs-nav-btn gs-nav-btn--logout"
            onClick={handleLogout}
            onMouseEnter={() => setTooltip("logout")}
            onMouseLeave={() => setTooltip(null)}
            aria-label="Cerrar sesión"
          >
            <LogOut size={15} />
            {tooltip === "logout" && <span className="gs-tooltip">Salir</span>}
          </button>

        </div>
      </aside>

      {/* ══════════════════════════════════════
          DESKTOP TOPBAR
      ══════════════════════════════════════ */}
      <header className="gs-topbar">
        <div className="gs-topbar-left">
          <div className="gs-topbar-logo-zone"></div>
          <div className="gs-breadcrumb">
            <span className="gs-breadcrumb-app">GlobalScore</span>
            <span className="gs-breadcrumb-sep">/</span>
            <span className="gs-breadcrumb-page">{pageName.toLowerCase()}</span>
          </div>
        </div>
        <div className="gs-topbar-right">
          <span className="gs-clock">{clock}</span>
          <button
            className="gs-topbar-icon-btn"
            onClick={() => navigate("/notifications")}
            aria-label="Notificaciones"
          >
            <Bell size={15} />
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
    </>
  );
}