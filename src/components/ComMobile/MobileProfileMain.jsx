import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Moon, Sun,
  BarChart2, Award, Crown, FileText, NotebookPen,
  Edit2, User, Bell, Lock,
} from "lucide-react";
import StyleSwitcher from "./StyleSwitcher";
import "../../styles/StylesMobile/MobileProfileMain.css";
import "../../styles/StylesMobile/StyleSwitcher.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

/* ── Avatar ── */
function Avatar({ user, size = 64 }) {
  const s = { width: size, height: size, fontSize: size * 0.38 };
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={user.name} className="mpm-avatar-img" style={s} />;
  }
  return (
    <div className="mpm-avatar-ph" style={s}>
      {(user?.name || "U")[0].toUpperCase()}
    </div>
  );
}

/* ── Stat chip ── */
function StatChip({ value, label }) {
  return (
    <div className="mpm-stat">
      <span className="mpm-stat-val">{value}</span>
      <span className="mpm-stat-lbl">{label}</span>
    </div>
  );
}

/* ── Nav row ── */
function NavRow({ icon: Icon, label, desc, color, onClick, right }) {
  return (
    <button className="mpm-row" onClick={onClick}>
      <div className="mpm-row-icon" style={{ background: color }}>
        <Icon size={17} color="#fff" />
      </div>
      <div className="mpm-row-body">
        <span className="mpm-row-lbl">{label}</span>
        {desc && <span className="mpm-row-desc">{desc}</span>}
      </div>
      {right || <ChevronRight size={15} className="mpm-row-arrow" />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function MobileProfileMain({
  currentUser,
  isDark,
  onToggleDark,
  onNavigate,
  onLogout,
  onAvatarClick,
}) {
  const navigate = useNavigate();
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const go = (section) => { if (onNavigate) onNavigate(section); };

  const accuracy =
    currentUser?.predictions > 0
      ? Math.round((currentUser.correct / currentUser.predictions) * 100)
      : 0;

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.email === "tian@admin.com";

  /* Grupos de navegación */
  const NAV_GROUPS = [
    {
      label: "Mi actividad",
      items: [
        { id: "overview",      icon: BarChart2,    label: "Estadísticas",  desc: "Ver tu rendimiento",          color: "#1d9e75" },
        { id: "achievements",  icon: Award,        label: "Logros",         desc: `${currentUser?.achievements?.length || 0} desbloqueados`, color: "#f59e0b" },
        { id: "championships", icon: Crown,        label: "Campeonatos",    desc: `${currentUser?.monthly_championships || 0} coronas`,       color: "#8b7fc7" },
        { id: "history",       icon: FileText,     label: "Historial",      desc: "Todas tus predicciones",      color: "#60a5fa" },
        { id: "notes",         icon: NotebookPen,  label: "Mis Notas",      desc: "Bloc de notas cifrado",       color: "#5b4fd8" },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { id: "edit",             icon: Edit2, label: "Editar Perfil",  desc: null,                    color: "#6b7280" },
        { id: "settings-account", icon: User,  label: "Cuenta",         desc: null,                    color: "#60519b" },
        { id: "notifications",    icon: Bell,  label: "Notificaciones", desc: null,                    color: "#f97316",
          action: () => navigate("/notifications") },
        ...(isAdmin ? [{ id: "admin", icon: Lock, label: "Admin", desc: "Panel de administración", color: "#e11d48",
          action: () => navigate("/admin") }] : []),
      ],
    },
  ];

  return (
    <div className="mpm-root">

      {/* ── BANNER ── */}
      <div className="mpm-banner">
        {(currentUser?.equipped_banner_url || currentUser?.banner_url) ? (
          <img
            src={currentUser.equipped_banner_url || currentUser.banner_url}
            alt=""
            className="mpm-banner-img"
          />
        ) : (
          <div className="mpm-banner-gradient" />
        )}
        <div className="mpm-banner-overlay" />
        <span className="mpm-banner-tag">PERFIL · GlobalScore</span>
      </div>

      {/* ── USER ROW ── */}
      <div className="mpm-user-row" onClick={() => go("edit")}>
        <div className="mpm-avatar-wrap" onClick={(e) => { e.stopPropagation(); onAvatarClick?.(); }}>
          <Avatar user={currentUser} size={56} />
        </div>
        <div className="mpm-user-info">
          <span className="mpm-user-name">{currentUser?.name || "Usuario"}</span>
          <span className="mpm-user-sub">
            {currentUser?.country || "Global"} · Niv.{currentUser?.level || 1}
          </span>
        </div>
        <ChevronRight size={16} className="mpm-user-arrow" />
      </div>

      {/* ── STATS ── */}
      <div className="mpm-stats-row">
        <StatChip value={fmt(currentUser?.points)} label="Puntos" />
        <div className="mpm-stats-sep" />
        <StatChip value={fmt(currentUser?.correct)} label="Aciertos" />
        <div className="mpm-stats-sep" />
        <StatChip value={`${accuracy}%`} label="Precisión" />
      </div>

      {/* ── PREFERENCIAS ── */}
      <div className="mpm-section-label">Preferencias</div>
      <div className="mpm-group">

        {/* Dark mode toggle */}
        <div className="mpm-row mpm-row--toggle">
          <div className="mpm-row-icon" style={{ background: "#6366f1" }}>
            {isDark ? <Moon size={17} color="#fff" /> : <Sun size={17} color="#fff" />}
          </div>
          <div className="mpm-row-body">
            <span className="mpm-row-lbl">Dark Mode</span>
          </div>
          <button
            className={`mpm-toggle${isDark ? " mpm-toggle--on" : ""}`}
            onClick={onToggleDark}
          >
            <div className="mpm-toggle-knob" />
          </button>
        </div>

        {/* Apariencia */}
        <div>
          <button
            className="mpm-row"
            onClick={() => setAppearanceOpen(o => !o)}
          >
            <div className="mpm-row-icon" style={{ background: "#eab308" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </div>
            <div className="mpm-row-body">
              <span className="mpm-row-lbl">Apariencia</span>
              <span className="mpm-row-desc">Tema y estilo visual</span>
            </div>
            {appearanceOpen
              ? <ChevronDown size={14} className="mpm-row-arrow" />
              : <ChevronRight size={14} className="mpm-row-arrow" />}
          </button>

          {appearanceOpen && (
            <div className="mpm-appearance-panel">
              <StyleSwitcher />
            </div>
          )}
        </div>
      </div>

      {/* ── GRUPOS DE NAV ── */}
      {NAV_GROUPS.map(group => (
        <React.Fragment key={group.label}>
          <div className="mpm-section-label">{group.label}</div>
          <div className="mpm-group">
            {group.items.map(item => (
              <NavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                color={item.color}
                onClick={item.action || (() => go(item.id))}
              />
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* ── LOGOUT ── */}
      <div className="mpm-section-label">Salir</div>
      <div className="mpm-logout-wrap">
        <button className="mpm-logout" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="mpm-logout-lbl">Cerrar sesión</span>
          <ChevronRight size={14} className="mpm-logout-arrow" />
        </button>
      </div>

    </div>
  );
}