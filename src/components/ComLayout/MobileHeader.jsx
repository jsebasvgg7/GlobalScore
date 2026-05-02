import React, { useState, useEffect } from "react";
import { Bell, Moon, Sun, Trophy, Award, BarChart3, Globe, User2, NotebookPen, Shield, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/StylesLayout/MobileHeader.css";

export default function MobileHeader({ currentUser }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [clock, setClock] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const t = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      setClock(t);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const firstName = currentUser?.name?.split(" ")[0] || "Jugador";
  const initials  = (currentUser?.name || "U").slice(0, 2).toUpperCase();

  /* ── Bottom nav items ── */
  const leftItems = currentUser?.is_admin
    ? [{ path: "/admin",   icon: Shield,  label: "Admin"    }]
    : [{ path: "/history", icon: History, label: "Historia" }];

  const mobileBottomItems = [
    ...leftItems,
    { path: "/ranking", icon: Award,     label: "Ranking" },
    { path: "/stats",   icon: BarChart3, label: "Stats"   },
    { path: "/profile", icon: User2,     label: "Perfil"  },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════
          TOP HEADER
      ══════════════════════════════════════════════ */}
      <header className={`mhd-header${scrolled ? " mhd-header--scrolled" : ""}`}>

        {/* Left: greeting */}
        <div className="mhd-left">
          <span className="mhd-name">{firstName}</span>
        </div>

        {/* Right: actions */}
        <div className="mhd-actions">

          {/* Theme toggle */}
          <button
            className="mhd-btn"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {theme === "light"
              ? <Moon size={15} strokeWidth={2} />
              : <Sun  size={15} strokeWidth={2} />
            }
          </button>

          {/* Notifications */}
          <button
            className="mhd-btn mhd-btn--notif"
            onClick={() => navigate("/notifications")}
            aria-label="Notificaciones"
          >
            <Bell size={15} strokeWidth={2} />
            <span className="mhd-notif-dot" aria-hidden="true" />
          </button>

          {/* Avatar */}
          <button
            className="mhd-avatar"
            onClick={() => navigate("/profile")}
            aria-label="Perfil"
          >
            {currentUser?.avatar_url
              ? <img src={currentUser.avatar_url} alt={firstName} />
              : <span>{initials}</span>
            }
          </button>

        </div>
      </header>

      {/* ══════════════════════════════════════════════
          BOTTOM NAV
      ══════════════════════════════════════════════ */}
      <nav className="mhd-bottom-nav" role="navigation" aria-label="Navegación principal">

        {/* Left two items */}
        {mobileBottomItems.slice(0, 2).map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`mhd-nav-btn${isActive(path) ? " mhd-nav-btn--active" : ""}`}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive(path) ? "page" : undefined}
          >
            <div className="mhd-nav-icon-wrap">
              <Icon size={19} strokeWidth={isActive(path) ? 2.2 : 1.8} />
            </div>
            <span className="mhd-nav-label">{label}</span>
          </button>
        ))}

        {/* Center trophy button */}
        <div className="mhd-nav-center">
          <button
            className={`mhd-trophy-btn${isActive("/app") ? " mhd-trophy-btn--active" : ""}`}
            onClick={() => navigate("/app")}
            aria-label="Inicio"
            aria-current={isActive("/app") ? "page" : undefined}
          >
            <Trophy size={22} strokeWidth={2} />
          </button>
          <span className="mhd-nav-label mhd-nav-label--center">Inicio</span>
        </div>

        {/* Right two items */}
        {mobileBottomItems.slice(2).map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`mhd-nav-btn${isActive(path) ? " mhd-nav-btn--active" : ""}`}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive(path) ? "page" : undefined}
          >
            <div className="mhd-nav-icon-wrap">
              <Icon size={19} strokeWidth={isActive(path) ? 2.2 : 1.8} />
            </div>
            <span className="mhd-nav-label">{label}</span>
          </button>
        ))}

      </nav>
    </>
  );
}