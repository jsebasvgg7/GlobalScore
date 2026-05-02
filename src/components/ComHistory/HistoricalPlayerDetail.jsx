// src/components/ComHistory/HistoricalPlayerDetail.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Users, Zap, Calendar, X } from "lucide-react";

const LEGACY_COLORS = {
  "Goal Scorer": "#E24B4A",
  "Tactician":   "#3b82f6",
  "Innovator":   "#1D9E75",
  "Leader":      "#c9a227",
  "Goalkeeper":  "#8b7fc7",
};

export default function HistoricalPlayerDetail({ playerId, getPlayer, onBack, onEventClick }) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    getPlayer(playerId)
      .then(setPlayer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [playerId]);

  if (loading) {
    return (
      <div className="hpd-loading">
        <div className="hpd-loading-bar" />
        <p>Cargando perfil histórico...</p>
      </div>
    );
  }

  if (!player) return null;

  const accentColor = LEGACY_COLORS[player.legacy_type] || "#60519b";
  const teams  = player.historical_player_teams  || [];
  const events = player.historical_player_events || [];

  return (
    <div className="hpd-root">
      {/* ── Header / Hero ── */}
      <div className="hpd-hero" style={{ "--hpd-accent": accentColor }}>
        <button className="hpd-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Jugadores</span>
        </button>

        <div className="hpd-hero-inner">
          <div className="hpd-avatar-wrap">
            {player.image_url ? (
              <img src={player.image_url} alt={player.name} className="hpd-avatar" />
            ) : (
              <div className="hpd-avatar-ph">
                {player.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {player.significance_level === 5 && (
              <div className="hpd-goat-ring">GOAT</div>
            )}
          </div>

          <div className="hpd-hero-info">
            <span className="hpd-legacy-tag" style={{ background: accentColor + "25", color: accentColor, border: `1px solid ${accentColor}50` }}>
              {player.legacy_type}
            </span>
            <h1 className="hpd-name">{player.name}</h1>
            <div className="hpd-meta-row">
              {player.country  && <span className="hpd-meta"><MapPin size={12} />{player.country}</span>}
              {player.position && <span className="hpd-meta"><Zap size={12} />{player.position}</span>}
              {player.era      && <span className="hpd-meta"><Clock size={12} />{player.era}</span>}
              {player.birth_year && (
                <span className="hpd-meta">
                  <Calendar size={12} />
                  {player.birth_year}{player.death_year ? ` – ${player.death_year}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="hpd-content">

        {/* Impact summary */}
        {player.impact_summary && (
          <div className="hpd-impact-block" style={{ borderLeftColor: accentColor }}>
            <span className="hpd-block-label">IMPACTO HISTÓRICO</span>
            <p className="hpd-impact-text">{player.impact_summary}</p>
          </div>
        )}

        {/* Description */}
        {player.description && (
          <div className="hpd-section">
            <div className="hpd-section-hdr">
              <div className="hpd-section-line" style={{ background: accentColor }} />
              <span className="hpd-section-lbl">BIOGRAFÍA</span>
            </div>
            <p className="hpd-description">{player.description}</p>
          </div>
        )}

        {/* Teams */}
        {teams.length > 0 && (
          <div className="hpd-section">
            <div className="hpd-section-hdr">
              <div className="hpd-section-line" style={{ background: accentColor }} />
              <span className="hpd-section-lbl">EQUIPOS</span>
              <span className="hpd-section-count">{teams.length}</span>
            </div>
            <div className="hpd-teams-list">
              {teams.map((pt, i) => {
                const team = pt.historical_teams;
                if (!team) return null;
                return (
                  <div key={i} className="hpd-team-row">
                    <div className="hpd-team-dot" style={{ background: accentColor }} />
                    <div className="hpd-team-info">
                      <span className="hpd-team-name">{team.name}</span>
                      <span className="hpd-team-meta">
                        {team.country && `${team.country} · `}
                        {pt.start_year || "?"} – {pt.end_year || "act."}
                        {pt.roles && ` · ${pt.roles}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events */}
        {events.length > 0 && (
          <div className="hpd-section">
            <div className="hpd-section-hdr">
              <div className="hpd-section-line" style={{ background: accentColor }} />
              <span className="hpd-section-lbl">MOMENTOS HISTÓRICOS</span>
              <span className="hpd-section-count">{events.length}</span>
            </div>
            <div className="hpd-events-list">
              {events.map((pe, i) => {
                const ev = pe.historical_events;
                if (!ev) return null;
                return (
                  <button
                    key={i}
                    className="hpd-event-chip"
                    onClick={() => onEventClick && onEventClick(ev.id)}
                  >
                    <span className="hpd-event-type">{ev.event_type}</span>
                    <span className="hpd-event-title">{ev.title}</span>
                    {pe.role_note && <span className="hpd-event-role">{pe.role_note}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
