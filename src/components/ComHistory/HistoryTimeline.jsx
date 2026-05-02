// src/components/ComHistory/HistoryTimeline.jsx
import React from "react";
import { Calendar, ChevronRight } from "lucide-react";

const EVENT_COLORS = {
  "Championship":          "#c9a227",
  "Historic Match":        "#3b82f6",
  "Legendary Performance": "#E24B4A",
  "Era Defining":          "#8b7fc7",
  "Record":                "#1D9E75",
};

function formatYear(dateStr) {
  if (!dateStr) return "?";
  return new Date(dateStr + "T00:00:00").getFullYear();
}

export default function HistoryTimeline({ events = {}, loading, onEventClick }) {
  if (loading) {
    return (
      <div className="htl-loading">
        <div className="htl-loading-bar" />
        <p>Construyendo línea del tiempo...</p>
      </div>
    );
  }

  const grouped = events.grouped || {};
  const decades = Object.keys(grouped).sort();

  if (decades.length === 0) {
    return (
      <div className="htl-empty">
        <Calendar size={36} opacity={0.3} />
        <p>No hay eventos en la línea del tiempo</p>
      </div>
    );
  }

  return (
    <div className="htl-root">
      <div className="htl-spine" />

      {decades.map(decade => (
        <div key={decade} className="htl-decade-group">
          {/* Decade marker */}
          <div className="htl-decade-marker">
            <div className="htl-decade-diamond" />
            <span className="htl-decade-label">{decade}</span>
          </div>

          {/* Events in this decade */}
          <div className="htl-decade-events">
            {grouped[decade].map((ev, i) => {
              const color = EVENT_COLORS[ev.event_type] || "#60519b";
              const players = ev.historical_player_events || [];

              return (
                <button
                  key={ev.id}
                  className={`htl-event ${i % 2 === 0 ? "htl-event--left" : "htl-event--right"}`}
                  onClick={() => onEventClick(ev)}
                  style={{ "--htl-color": color }}
                >
                  {/* Connector dot */}
                  <div className="htl-event-dot" style={{ background: color }} />

                  <div className="htl-event-card">
                    {/* Year badge */}
                    <div className="htl-event-year" style={{ background: color + "20", color }}>
                      {formatYear(ev.event_date)}
                    </div>

                    <span
                      className="htl-event-type"
                      style={{ color, borderColor: color + "40", background: color + "10" }}
                    >
                      {ev.event_type}
                    </span>

                    <h3 className="htl-event-title">{ev.title}</h3>

                    {ev.description && (
                      <p className="htl-event-desc">{ev.description.slice(0, 90)}…</p>
                    )}

                    {/* Players involved */}
                    {players.length > 0 && (
                      <div className="htl-event-players">
                        {players.slice(0, 3).map((pe, j) => {
                          const p = pe.historical_players;
                          if (!p) return null;
                          return (
                            <span key={j} className="htl-event-player-chip">
                              {p.name}
                            </span>
                          );
                        })}
                        {players.length > 3 && (
                          <span className="htl-event-player-more">+{players.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="htl-event-cta" style={{ color }}>
                      Ver detalle <ChevronRight size={11} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
