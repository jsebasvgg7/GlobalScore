import { Zap, Users2, Shield, Trophy, Calendar, Star, TrendingUp } from "lucide-react";
import { getHistoricalImageUrl } from "../hooks/useHistoricalPlayers";
import "../styles/EventsRightPanel.css";

// ── Helpers ───────────────────────────────────────────────────
const CAT_COLOR = { player: "#8b5cf6", team: "#3b82f6" };
const CAT_LABEL = { player: "Jugador", team: "Equipo" };
const CAT_ICON = { player: <Users2 size={10} />, team: <Shield size={10} /> };

const EVENT_TYPE_LABEL = {
  Championship: "Campeonato",
  "Historic Match": "Partido Histórico",
  "Legendary Performance": "Actuación Legendaria",
  "Era Defining": "Definió una Era",
  Record: "Récord",
};

const EVENT_TYPE_COLOR = {
  Championship: "#f59e0b",
  "Historic Match": "#3b82f6",
  "Legendary Performance": "#8b5cf6",
  "Era Defining": "#ef4444",
  Record: "#10b981",
};

// ── Sub-componentes ───────────────────────────────────────────
function MiniProtagonist({ event }) {
  const isPlayer = event.event_category === "player";
  const entity = isPlayer ? event.historical_players : event.historical_teams;
  if (!entity) return null;
  const imgUrl = getHistoricalImageUrl(entity.image_path);
  const initials = (entity.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const color = CAT_COLOR[event.event_category] || "var(--accent)";

  return (
    <div className="erp-mini-proto">
      <div className="erp-mini-av" style={{ borderColor: `${color}44`, background: `${color}12` }}>
        {imgUrl
          ? <img src={imgUrl} alt={entity.name} />
          : <span style={{ color }}>{initials}</span>
        }
      </div>
      <div className="erp-mini-info">
        <span className="erp-mini-name">{entity.name}</span>
        {entity.country && <span className="erp-mini-meta">{entity.country}</span>}
      </div>
    </div>
  );
}

// ── Evento seleccionado ───────────────────────────────────────
function SelectedEventBlock({ event }) {
  if (!event) {
    return (
      <div className="erp-selected-empty">
        <Zap size={24} strokeWidth={1.2} />
        <span>Selecciona un evento</span>
      </div>
    );
  }

  const catColor = CAT_COLOR[event.event_category] || "var(--accent)";
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;

  return (
    <div className="erp-selected-card">
      <div className="erp-selected-accent" style={{ background: catColor }} />
      <div className="erp-selected-body">
        <div className="erp-selected-badges">
          {event.event_category && (
            <span className="erp-badge" style={{ "--bc": catColor }}>
              {CAT_ICON[event.event_category]} {CAT_LABEL[event.event_category]}
            </span>
          )}
          {event.event_type && (
            <span
              className="erp-badge"
              style={{ "--bc": EVENT_TYPE_COLOR[event.event_type] || "var(--accent)" }}
            >
              {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
            </span>
          )}
        </div>

        <span className="erp-selected-title">{event.title}</span>

        {year && (
          <span className="erp-selected-year">
            <Calendar size={9} /> {year}
          </span>
        )}

        {event.description && (
          <p className="erp-selected-desc">
            {event.description.slice(0, 110)}{event.description.length > 110 ? "…" : ""}
          </p>
        )}

        <MiniProtagonist event={event} />
      </div>
    </div>
  );
}

// ── Stats del catálogo ────────────────────────────────────────
function CatalogStats({ allEvents }) {
  const total = allEvents.length;

  const byCategory = allEvents.reduce((acc, e) => {
    if (e.event_category) acc[e.event_category] = (acc[e.event_category] || 0) + 1;
    return acc;
  }, {});

  const byType = allEvents.reduce((acc, e) => {
    if (e.event_type) acc[e.event_type] = (acc[e.event_type] || 0) + 1;
    return acc;
  }, {});

  const topTypes = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <>
      {/* Totales */}
      <div className="erp-block">
        <div className="erp-block-label">
          <Trophy size={9} /> Catálogo
        </div>
        <div className="erp-stat-row">
          <span className="erp-stat-lbl">Total momentos</span>
          <span className="erp-stat-val erp-val--accent">{total}</span>
        </div>
        {byCategory.player != null && (
          <div className="erp-stat-row">
            <span className="erp-stat-lbl">De jugadores</span>
            <span className="erp-stat-val" style={{ color: CAT_COLOR.player }}>{byCategory.player}</span>
          </div>
        )}
        {byCategory.team != null && (
          <div className="erp-stat-row">
            <span className="erp-stat-lbl">De equipos</span>
            <span className="erp-stat-val" style={{ color: CAT_COLOR.team }}>{byCategory.team}</span>
          </div>
        )}
      </div>

      {/* Por categoría: barras */}
      {Object.keys(byCategory).length > 0 && (
        <div className="erp-block">
          <div className="erp-block-label">
            <Users2 size={9} /> Por categoría
          </div>
          <div className="erp-cat-bars">
            {Object.entries(byCategory).map(([cat, count]) => {
              const color = CAT_COLOR[cat] || "var(--accent)";
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="erp-cat-row">
                  <span className="erp-cat-icon">{CAT_ICON[cat]}</span>
                  <span className="erp-cat-name">{CAT_LABEL[cat] || cat}</span>
                  <div className="erp-cat-track">
                    <div className="erp-cat-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="erp-cat-count" style={{ color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Por tipo */}
      {topTypes.length > 0 && (
        <div className="erp-block">
          <div className="erp-block-label">
            <Star size={9} /> Tipos de evento
          </div>
          <div className="erp-type-list">
            {topTypes.map(([type, count]) => {
              const color = EVENT_TYPE_COLOR[type] || "var(--accent)";
              return (
                <div key={type} className="erp-type-row">
                  <div className="erp-type-dot" style={{ background: color }} />
                  <span className="erp-type-name">{EVENT_TYPE_LABEL[type] || type}</span>
                  <span className="erp-type-count" style={{ color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ── Top eventos recientes ─────────────────────────────────────
function RecentEventsBlock({ allEvents, onSelect }) {
  const sorted = [...allEvents]
    .filter(e => e.event_date)
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
    .slice(0, 5);

  if (sorted.length === 0) return null;

  return (
    <div className="erp-block erp-block--recent">
      <div className="erp-block-label">
        <TrendingUp size={9} /> Más recientes
      </div>
      <div className="erp-recent-list">
        {sorted.map((e, i) => {
          const year = new Date(e.event_date + "T12:00:00").getFullYear();
          const catColor = CAT_COLOR[e.event_category] || "var(--accent)";
          return (
            <button
              key={e.id}
              className="erp-recent-row"
              onClick={() => onSelect && onSelect(e)}
            >
              <span className="erp-recent-rank">{i + 1}</span>
              <div className="erp-recent-info">
                <span className="erp-recent-title">{e.title}</span>
                <span className="erp-recent-meta">
                  {year}
                  {e.event_category && (
                    <span className="erp-recent-cat" style={{ color: catColor }}>
                      {" · "}{CAT_LABEL[e.event_category]}
                    </span>
                  )}
                </span>
              </div>
              <div
                className="erp-recent-dot"
                style={{ background: catColor }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Footer: evento más impactante ─────────────────────────────
function FeaturedFooter({ allEvents }) {
  // Busca el primero de tipo Championship o Era Defining como "destaque"
  const featured = allEvents.find(e =>
    e.event_type === "Championship" || e.event_type === "Era Defining"
  ) || allEvents[0];

  if (!featured) return null;

  const entity =
    featured.event_category === "player"
      ? featured.historical_players
      : featured.historical_teams;

  const year = featured.event_date ? new Date(featured.event_date).getFullYear() : null;

  return (
    <div className="erp-footer">
      <div className="erp-footer-label">MOMENTO DESTACADO</div>
      <div className="erp-footer-content">
        <div className="erp-footer-icon">
          <Zap size={16} />
        </div>
        <div className="erp-footer-info">
          <span className="erp-footer-title">{featured.title}</span>
          {(entity || year) && (
            <span className="erp-footer-meta">
              {[entity?.name, year].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function EventsRightPanel({
  allEvents = [],
  selectedEvent = null,
  onSelectEvent,
}) {
  return (
    <aside className="erp-root">

      {/* Etiqueta superior */}
      <div className="erp-label">
        <span className="erp-label-dot" />
        MOMENTOS
        <span className="erp-label-dot" />
      </div>

      {/* Evento seleccionado */}
      <div className="erp-section erp-section--selected">
        <div className="erp-block-label" style={{ marginBottom: 10 }}>
          <Zap size={9} /> Evento activo
        </div>
        <SelectedEventBlock event={selectedEvent} />
      </div>

      {/* Más recientes */}
      <RecentEventsBlock allEvents={allEvents} onSelect={onSelectEvent} />

      {/* Stats */}
      <CatalogStats allEvents={allEvents} />

      {/* Footer destacado */}
      <FeaturedFooter allEvents={allEvents} />

    </aside>
  );
}
