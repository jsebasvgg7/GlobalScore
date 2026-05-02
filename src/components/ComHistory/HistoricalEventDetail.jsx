// src/components/ComHistory/HistoricalEventDetail.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Users, Trophy, Zap } from "lucide-react";

const EVENT_COLORS = {
  "Championship":          "#c9a227",
  "Historic Match":        "#3b82f6",
  "Legendary Performance": "#E24B4A",
  "Era Defining":          "#8b7fc7",
  "Record":                "#1D9E75",
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

export default function HistoricalEventDetail({ eventId, getEvent, onBack, onPlayerClick }) {
  const [event, setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    getEvent(eventId)
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="hed-loading">
        <div className="hed-loading-bar" />
        <p>Cargando evento histórico...</p>
      </div>
    );
  }

  if (!event) return null;

  const accentColor  = EVENT_COLORS[event.event_type] || "#60519b";
  const players      = event.historical_player_events || [];
  const teams        = event.historical_event_teams   || [];
  const competitions = event.historical_event_competitions || [];

  return (
    <div className="hed-root">
      {/* Hero */}
      <div className="hed-hero" style={{ "--hed-accent": accentColor }}>
        <button className="hed-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Eventos</span>
        </button>

        <div className="hed-hero-img-wrap">
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="hed-hero-img" />
          ) : (
            <div className="hed-hero-img-ph" style={{ background: accentColor + "30" }}>
              <Zap size={48} style={{ color: accentColor, opacity: 0.5 }} />
            </div>
          )}
          <div className="hed-hero-overlay" style={{ background: `linear-gradient(to top, ${accentColor}40 0%, transparent 60%)` }} />
        </div>

        <div className="hed-hero-info">
          <span
            className="hed-type-tag"
            style={{ background: accentColor + "25", color: accentColor, border: `1px solid ${accentColor}50` }}
          >
            {event.event_type}
          </span>
          <h1 className="hed-title">{event.title}</h1>
          {event.event_date && (
            <div className="hed-date">
              <Calendar size={13} />
              <span>{formatDate(event.event_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="hed-content">

        {/* Description */}
        {event.description && (
          <div className="hed-section">
            <div className="hed-section-hdr">
              <div className="hed-section-line" style={{ background: accentColor }} />
              <span className="hed-section-lbl">NARRATIVA</span>
            </div>
            <p className="hed-description">{event.description}</p>
          </div>
        )}

        {/* Players */}
        {players.length > 0 && (
          <div className="hed-section">
            <div className="hed-section-hdr">
              <div className="hed-section-line" style={{ background: accentColor }} />
              <span className="hed-section-lbl">JUGADORES</span>
              <span className="hed-section-count">{players.length}</span>
            </div>
            <div className="hed-players-grid">
              {players.map((pe, i) => {
                const p = pe.historical_players;
                if (!p) return null;
                return (
                  <button
                    key={i}
                    className="hed-player-chip"
                    onClick={() => onPlayerClick && onPlayerClick(p.id)}
                  >
                    {p.image_path ? (
                      <img
                        src={`/storage/v1/object/public/historical/${p.image_path}`}
                        alt={p.name}
                        className="hed-player-avatar"
                      />
                    ) : (
                      <div className="hed-player-avatar hed-player-avatar-ph">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="hed-player-info">
                      <span className="hed-player-name">{p.name}</span>
                      {pe.role_note && <span className="hed-player-role">{pe.role_note}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Teams */}
        {teams.length > 0 && (
          <div className="hed-section">
            <div className="hed-section-hdr">
              <div className="hed-section-line" style={{ background: accentColor }} />
              <span className="hed-section-lbl">EQUIPOS</span>
              <span className="hed-section-count">{teams.length}</span>
            </div>
            <div className="hed-items-list">
              {teams.map((et, i) => {
                const t = et.historical_teams;
                if (!t) return null;
                return (
                  <div key={i} className="hed-item-row">
                    <div className="hed-item-dot" style={{ background: accentColor }} />
                    <div>
                      <span className="hed-item-name">{t.name}</span>
                      {et.role_note && <span className="hed-item-role">{et.role_note}</span>}
                      {t.country && <span className="hed-item-sub">{t.country}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Competitions */}
        {competitions.length > 0 && (
          <div className="hed-section">
            <div className="hed-section-hdr">
              <div className="hed-section-line" style={{ background: accentColor }} />
              <span className="hed-section-lbl">COMPETENCIA</span>
            </div>
            <div className="hed-items-list">
              {competitions.map((ec, i) => {
                const c = ec.historical_competitions;
                if (!c) return null;
                return (
                  <div key={i} className="hed-item-row">
                    <Trophy size={14} style={{ color: accentColor, flexShrink: 0 }} />
                    <div>
                      <span className="hed-item-name">{c.name}</span>
                      {c.year && <span className="hed-item-sub">{c.type} · {c.year}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
