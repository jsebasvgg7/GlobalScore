import React, { useState, useEffect } from "react";
import { Trophy, Home, Crown, BarChart3, History, Target, Flame, Hash } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DesktopTopbar.css";

// ── Iconos de features (sin texto, solo icono) ──────────────
// Agrega aquí más features conforme se vayan registrando en
// APP_REGISTRY del WindowManager.
const NAV_ICONS = [
  { path: "/app", icon: Home, label: "Inicio" },
  { path: "/ranking", icon: Crown, label: "Ranking" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/history", icon: History, label: "Histórico" },
];

export default function DesktopTopbar({ currentUser, users = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [clock, setClock] = useState("");

  // Reloj en vivo — misma lógica que Header.jsx, sin la fecha larga
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

  // Posición en el ranking: usuarios ordenados por puntos,
  // buscando el índice del usuario actual.
  const position = React.useMemo(() => {
    if (!currentUser || !users.length) return null;
    const sorted = [...users].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    const idx = sorted.findIndex((u) => u.id === currentUser.id);
    return idx === -1 ? null : idx + 1;
  }, [currentUser, users]);

  const isActive = (path) => location.pathname === path;
  const initials = (currentUser?.name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="dt-wrap">
      <div className="dt-bar">

        <button className="dt-logo" onClick={() => navigate("/app")} aria-label="Inicio">
          <Trophy size={13} />
        </button>

        <div className="dt-divider" />

        <nav className="dt-nav">
          {NAV_ICONS.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`dt-nav-btn${isActive(path) ? " dt-nav-btn--active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
              title={label}
            >
              <Icon size={19} />
            </button>
          ))}
        </nav>

        <div className="dt-spacer" />

        <div className="dt-clock">{clock}</div>

        <div className="dt-spacer" />

        <div className="dt-stats">
          <span className="dt-stat" title="Predicciones realizadas">
            <Target size={16} />
            {currentUser?.predictions ?? 0}
          </span>
          <span className="dt-stat" title="Racha actual">
            <Flame size={16} />
            {currentUser?.current_streak ?? 0}
          </span>
          <span className="dt-stat" title="Posición en el ranking">
            <Hash size={16} />
            {position ?? "—"}
          </span>
        </div>

        <div className="dt-divider" />

        <button
          className="dt-avatar"
          onClick={() => navigate("/profile")}
          aria-label="Perfil"
          title={currentUser?.name || "Perfil"}
        >
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser?.name} />
          ) : (
            <span>{initials}</span>
          )}
        </button>

      </div>
    </div>
  );
}