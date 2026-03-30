import React from "react";
import { Bell, Trophy, CheckCircle2, BellRing, BellOff } from "lucide-react";
import "../../styles/StylesMobile/MobileNotifications.css";

// ── Pill de tipo ─────────────────────────────────────────────────
function TypeBadge({ type }) {
  return (
    <span className={`mnv-badge mnv-badge--${type}`}>
      {type === "new" ? "Nuevo" : "Final"}
    </span>
  );
}

// ── Icono de tarjeta ─────────────────────────────────────────────
function CardIcon({ type }) {
  return (
    <div className={`mnv-card-icon mnv-card-icon--${type}`}>
      {type === "new"
        ? <Trophy size={15} />
        : <CheckCircle2 size={15} />}
    </div>
  );
}

// ── Filtro individual ────────────────────────────────────────────
function FilterBtn({ label, count, active, onClick }) {
  return (
    <button
      className={`mnv-filter${active ? " mnv-filter--active" : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className="mnv-filter-count">{count}</span>
    </button>
  );
}

// ── Tarjeta de notificación ──────────────────────────────────────
function NotifCard({ notif }) {
  return (
    <div className={`mnv-card mnv-card--${notif.type}`}>
      <CardIcon type={notif.type} />
      <div className="mnv-card-body">
        <div className="mnv-card-title">{notif.description}</div>
        <div className="mnv-card-meta">
          <span>{notif.league}</span>
          <span className="mnv-meta-sep">·</span>
          <span>{notif.date}</span>
          {notif.time && (
            <>
              <span className="mnv-meta-sep">·</span>
              <span>{notif.time}</span>
            </>
          )}
        </div>
        {notif.result && (
          <div className="mnv-card-result">{notif.result}</div>
        )}
      </div>
      <TypeBadge type={notif.type} />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="mnv-empty">
      <Bell size={36} className="mnv-empty-icon" />
      <div className="mnv-empty-title">Sin notificaciones</div>
      <div className="mnv-empty-sub">Aquí aparecerán las novedades</div>
    </div>
  );
}

// ── Loading state ────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="mnv-loading">
      <div className="mnv-spinner" />
      <span>Cargando...</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function MobileNotifications({
  notifications   = [],
  loading         = false,
  filter          = "all",
  onFilterChange,
  pushEnabled     = false,
  pushLoading     = false,
  onTogglePush,
}) {
  const newCount      = notifications.filter(n => n.type === "new").length;
  const finishedCount = notifications.filter(n => n.type === "finished").length;

  const filtered = notifications.filter(n =>
    filter === "all" ? true : n.type === filter
  );

  const FILTERS = [
    { key: "all",      label: "Todas",  count: notifications.length },
    { key: "new",      label: "Nuevas", count: newCount },
    { key: "finished", label: "Final.", count: finishedCount },
  ];

  return (
    <div className="mnv-root">

      {/* ── TOPBAR ── */}
      <div className="mnv-topbar">
        <div className="mnv-topbar-left">
          <div className="mnv-dot" />
          <span className="mnv-title">Notificaciones</span>
        </div>
        {!pushLoading && (
          <button
            className={`mnv-push-btn${pushEnabled ? " mnv-push-btn--on" : ""}`}
            onClick={onTogglePush}
          >
            {pushEnabled ? <BellRing size={13} /> : <BellOff size={13} />}
            <span>{pushEnabled ? "Activas" : "Activar"}</span>
          </button>
        )}
      </div>

      {/* ── BANNER PUSH ── */}
      {!pushEnabled && !pushLoading && (
        <div className="mnv-banner">
          <div className="mnv-banner-icon"><BellRing size={16} /></div>
          <div className="mnv-banner-text">
            <div className="mnv-banner-title">Activa las notificaciones</div>
            <div className="mnv-banner-sub">Recibe alertas de nuevos partidos</div>
          </div>
          <button className="mnv-banner-btn" onClick={onTogglePush}>
            Activar
          </button>
        </div>
      )}

      {/* ── FILTROS ── */}
      <div className="mnv-filters">
        {FILTERS.map(f => (
          <FilterBtn
            key={f.key}
            label={f.label}
            count={f.count}
            active={filter === f.key}
            onClick={() => onFilterChange?.(f.key)}
          />
        ))}
      </div>

      {/* ── LISTA ── */}
      <div className="mnv-list">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map(notif => (
            <NotifCard key={notif.id} notif={notif} />
          ))
        )}
      </div>

    </div>
  );
}