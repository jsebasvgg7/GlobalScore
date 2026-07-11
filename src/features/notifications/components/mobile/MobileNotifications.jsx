import React, { useMemo } from "react";
import { Bell, Trophy, CheckCircle2, BellRing, BellOff } from "lucide-react";
import "./MobileNotifications.css";

const MAX_BENTO_ITEMS = 5;

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

// ── Hero — próxima notificación nueva ────────────────────────────
function NotifHero({ notif, onOpen }) {
  if (!notif) {
    return (
      <div className="mnv-hero-wrap">
        <div className="mnv-hero mnv-hero--empty">
          <div className="mnv-hero-empty-row">
            <div className="mnv-hero-empty-icon">
              <BellOff size={20} strokeWidth={1.5} />
            </div>
            <div className="mnv-hero-empty-center">
              <span className="mnv-hero-empty-title">Estás al día</span>
              <span className="mnv-hero-empty-sub">Sin notificaciones nuevas por ahora</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mnv-hero-wrap">
      <button className="mnv-hero" onClick={() => onOpen?.(notif)}>
        <div className="mnv-hero-body">
          <div className="mnv-hero-top">
            <span className="mnv-hero-chip">Nueva</span>
            <div className="mnv-hero-icon">
              <Trophy size={13} />
            </div>
          </div>
          <span className="mnv-hero-title">{notif.description}</span>
          <div className="mnv-hero-meta">
            <span>{notif.league}</span>
            <span className="mnv-hero-meta-sep">·</span>
            <span>{notif.date}</span>
            {notif.time && (
              <>
                <span className="mnv-hero-meta-sep">·</span>
                <span>{notif.time}</span>
              </>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

// ── Celda del bento (alta o chica) ───────────────────────────────
function BentoCell({ notif, tall }) {
  const isNew = notif.type === "new";

  return (
    <div className={`mnv-cell mnv-cell--${tall ? "tall" : "small"} mnv-cell--${notif.type}`}>
      <div className="mnv-cell-body">
        <div className="mnv-cell-head">
          <div className={`mnv-cell-icon mnv-cell-icon--${notif.type}`}>
            {isNew ? <Trophy size={tall ? 15 : 12} /> : <CheckCircle2 size={tall ? 15 : 12} />}
          </div>
          <span className={`mnv-cell-badge mnv-cell-badge--${notif.type}`}>
            {isNew ? "Nuevo" : "Final"}
          </span>
        </div>

        <div>
          <div className="mnv-cell-title">{notif.description}</div>
          <div className="mnv-cell-meta">
            {notif.league} · {notif.date}{notif.time ? ` · ${notif.time}` : ""}
          </div>
          {notif.result && (
            <div className="mnv-cell-result">{notif.result}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Celda fantasma — rellena huecos del bento ────────────────────
function GhostCell({ tall }) {
  return (
    <div className={`mnv-cell mnv-cell--ghost mnv-cell--${tall ? "tall" : "small"}`}>
      <div className="mnv-cell-body">
        <span className="mnv-cell-ghost-eyebrow">// Próximamente</span>
        <span className="mnv-cell-ghost-title">Sin más novedades</span>
      </div>
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

// ── Empty state (filtro sin resultados) ──────────────────────────
function EmptyState() {
  return (
    <div className="mnv-empty">
      <Bell size={32} className="mnv-empty-icon" strokeWidth={1.5} />
      <div className="mnv-empty-title">Sin notificaciones</div>
      <div className="mnv-empty-sub">Aquí aparecerán las novedades</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════
export default function MobileNotifications({
  notifications = [],
  loading = false,
  filter = "all",
  onFilterChange,
  onOpenNotif,
  pushEnabled = false,
  pushLoading = false,
  onTogglePush,
}) {
  const newCount = notifications.filter(n => n.type === "new").length;
  const finishedCount = notifications.filter(n => n.type === "finished").length;

  const filtered = notifications.filter(n =>
    filter === "all" ? true : n.type === filter
  );

  // Notificación destacada del hero: la próxima "nueva" (independiente del filtro)
  const heroNotif = useMemo(() => {
    return notifications.filter(n => n.type === "new")[0] || null;
  }, [notifications]);

  // Bento: hasta MAX_BENTO_ITEMS del filtro activo.
  // La celda alta siempre es la más reciente del filtro activo (nueva o final).
  const bentoItems = filtered.slice(0, MAX_BENTO_ITEMS);
  const ghostsNeeded = Math.max(0, MAX_BENTO_ITEMS - bentoItems.length);

  const FILTERS = [
    { key: "all", label: "Todas", count: notifications.length },
    { key: "new", label: "Nuevas", count: newCount },
    { key: "finished", label: "Final.", count: finishedCount },
  ];

  return (
    <div className="mnv-root">

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

      {/* ── HERO ── */}
      <NotifHero notif={heroNotif} onOpen={onOpenNotif} />

      {/* ── BENTO ── */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mnv-bento">
          {bentoItems.map((notif, i) => (
            <BentoCell key={notif.id} notif={notif} tall={i === 0} />
          ))}
          {Array.from({ length: ghostsNeeded }, (_, i) => (
            <GhostCell key={`ghost-${i}`} tall={bentoItems.length === 0 && i === 0} />
          ))}
        </div>
      )}

    </div>
  );
}