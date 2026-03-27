import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "../../styles/StylesMobile/MobileProfileMain.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

export default function MobileProfileMain({
  currentUser,
  isDark,
  onToggleDark,
  onNavigate,
  onLogout,
  onAvatarClick,
}) {
  const navigate = useNavigate();

  const go = (section) => {
    if (onNavigate) onNavigate(section);
  };

  const accuracy =
    currentUser?.predictions > 0
      ? Math.round((currentUser.correct / currentUser.predictions) * 100)
      : 0;

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.email === "tian@admin.com";

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
        <div className="mpm-banner-grid" />
        <span className="mpm-banner-tag">PERFIL · GlobalScore</span>
      </div>

      {/* ── USER ROW ── */}
      <div className="mpm-user-row" onClick={() => go("edit")}>
        <div className="mpm-avatar" onClick={(e) => { e.stopPropagation(); onAvatarClick?.(); }}>
          {currentUser?.avatar_url
            ? <img src={currentUser.avatar_url} alt="" className="mpm-avatar-img" />
            : <span>{(currentUser?.name || "U")[0].toUpperCase()}</span>}
        </div>
        <div className="mpm-user-info">
          <div className="mpm-name">{currentUser?.name || "Usuario"}</div>
          <div className="mpm-sub">
            {currentUser?.country || "Global"} · Niv.{currentUser?.level || 1}
          </div>
        </div>
        <ChevronRight size={16} className="mpm-user-arrow" />
      </div>

      {/* ── STATS ── */}
      <div className="mpm-stats">
        <div className="mpm-stat">
          <div className="mpm-stat-val">{fmt(currentUser?.points)}<span>pts</span></div>
          <div className="mpm-stat-lbl">Puntos</div>
        </div>
        <div className="mpm-stat-sep" />
        <div className="mpm-stat">
          <div className="mpm-stat-val">{fmt(currentUser?.correct)}</div>
          <div className="mpm-stat-lbl">Aciertos</div>
        </div>
        <div className="mpm-stat-sep" />
        <div className="mpm-stat">
          <div className="mpm-stat-val">{accuracy}<span>%</span></div>
          <div className="mpm-stat-lbl">Precisión</div>
        </div>
      </div>

      {/* ══ SECCIÓN: PREFERENCIAS ══ */}
      <div className="mpm-sec-hdr">
        <div className="mpm-sec-dot" />
        <span className="mpm-sec-lbl">Preferencias</span>
      </div>
      <div className="mpm-group">
        <div className="mpm-row mpm-row--toggle">
          <div className="mpm-row-accent" style={{ background: "#6366f1" }} />
          <div className="mpm-icon" style={{ borderColor: "#6366f1", background: "rgba(99,102,241,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Dark Mode</div>
          </div>
          <button className={`mpm-toggle${isDark ? " mpm-toggle--on" : ""}`} onClick={onToggleDark}>
            <div className="mpm-toggle-knob" />
          </button>
        </div>

        <div className="mpm-row" onClick={() => go("settings-appearance")}>
          <div className="mpm-row-accent" style={{ background: "#eab308" }} />
          <div className="mpm-icon" style={{ borderColor: "#eab308", background: "rgba(234,179,8,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Apariencia</div>
            <div className="mpm-row-desc">Tema y colores</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>
      </div>

      {/* ══ SECCIÓN: MI ACTIVIDAD ══ */}
      <div className="mpm-sec-hdr">
        <div className="mpm-sec-dot" />
        <span className="mpm-sec-lbl">Mi actividad</span>
      </div>
      <div className="mpm-group">
        <div className="mpm-row" onClick={() => go("overview")}>
          <div className="mpm-row-accent" style={{ background: "#1d9e75" }} />
          <div className="mpm-icon" style={{ borderColor: "#1d9e75", background: "rgba(29,158,117,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Estadísticas</div>
            <div className="mpm-row-desc">Ver tu rendimiento</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>

        <div className="mpm-row" onClick={() => go("achievements")}>
          <div className="mpm-row-accent" style={{ background: "#f59e0b" }} />
          <div className="mpm-icon" style={{ borderColor: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Logros</div>
            <div className="mpm-row-desc">{currentUser?.achievements?.length || 0} desbloqueados</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>

        <div className="mpm-row" onClick={() => go("championships")}>
          <div className="mpm-row-accent" style={{ background: "#8b7fc7" }} />
          <div className="mpm-icon" style={{ borderColor: "#8b7fc7", background: "rgba(139,127,199,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b7fc7" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Campeonatos</div>
            <div className="mpm-row-desc">{currentUser?.monthly_championships || 0} coronas</div>
          </div>
          <span className="mpm-badge">{String(currentUser?.monthly_championships || 0).padStart(2, "0")}</span>
        </div>

        <div className="mpm-row" onClick={() => go("history")}>
          <div className="mpm-row-accent" style={{ background: "#60a5fa" }} />
          <div className="mpm-icon" style={{ borderColor: "#60a5fa", background: "rgba(96,165,250,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Historial</div>
            <div className="mpm-row-desc">Todas tus predicciones</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>
        {/* NUEVA FILA: Mis Notas */}
        <div className="mpm-row" onClick={() => go("notes")}>
          <div className="mpm-row-accent" style={{ background: "#5b4fd8" }} />
          <div className="mpm-icon" style={{ borderColor: "#5b4fd8", background: "rgba(91,79,216,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b4fd8" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              <line x1="16" y1="4" x2="20" y2="8"/>
            </svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Mis Notas</div>
            <div className="mpm-row-desc">Bloc de notas cifrado</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>
      </div>

      {/* ══ SECCIÓN: CUENTA ══ */}
      <div className="mpm-sec-hdr">
        <div className="mpm-sec-dot" />
        <span className="mpm-sec-lbl">Cuenta</span>
      </div>
      <div className="mpm-group">
        <div className="mpm-row" onClick={() => go("edit")}>
          <div className="mpm-row-accent" style={{ background: "#6b7280" }} />
          <div className="mpm-icon" style={{ borderColor: "#6b7280", background: "rgba(107,114,128,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Editar Perfil</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>

        <div className="mpm-row" onClick={() => go("settings-account")}>
          <div className="mpm-row-accent" style={{ background: "#60519b" }} />
          <div className="mpm-icon" style={{ borderColor: "#60519b", background: "rgba(96,81,155,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60519b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Cuenta</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>

        <div className="mpm-row" onClick={() => navigate("/notifications")}>
          <div className="mpm-row-accent" style={{ background: "#f97316" }} />
          <div className="mpm-icon" style={{ borderColor: "#f97316", background: "rgba(249,115,22,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div className="mpm-row-body">
            <div className="mpm-row-lbl">Notificaciones</div>
          </div>
          <ChevronRight size={14} className="mpm-chevron" />
        </div>

        {isAdmin && (
          <div className="mpm-row" onClick={() => navigate("/admin")}>
            <div className="mpm-row-accent" style={{ background: "#e11d48" }} />
            <div className="mpm-icon" style={{ borderColor: "#e11d48", background: "rgba(225,29,72,0.1)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="mpm-row-body">
              <div className="mpm-row-lbl">Admin</div>
              <div className="mpm-row-desc">Panel de administración</div>
            </div>
            <ChevronRight size={14} className="mpm-chevron" />
          </div>
        )}
      </div>

      {/* ── LOGOUT ── */}
      <div className="mpm-sec-hdr">
        <div className="mpm-sec-dot" />
        <span className="mpm-sec-lbl">Salir</span>
      </div>
      <div className="mpm-logout" onClick={onLogout}>
        <div className="mpm-logout-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <div className="mpm-logout-lbl">Cerrar sesión</div>
        <ChevronRight size={14} className="mpm-logout-arrow" />
      </div>

    </div>
  );
}