// src/components/ComHistory/HistorySidebar.jsx
import React from "react";
import { Users, Zap, Trophy, Clock } from "lucide-react";

export default function HistorySidebar({ players = [], events = [], competitions = [] }) {
  const eras = [...new Set(players.map(p => p.era).filter(Boolean))].sort();

  const stats = [
    { label: "Jugadores",    value: players.length,      Icon: Users,  color: "#60519b" },
    { label: "Eventos",      value: events.length,        Icon: Zap,    color: "#c9a227" },
    { label: "Competencias", value: competitions.length,  Icon: Trophy, color: "#1D9E75" },
    { label: "Eras",         value: eras.length,          Icon: Clock,  color: "#3b82f6" },
  ];

  const legacyCount = players.reduce((acc, p) => {
    if (!p.legacy_type) return acc;
    acc[p.legacy_type] = (acc[p.legacy_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="hsb-root">
      {/* Stats grid */}
      <div className="hsb-card">
        <div className="hsb-card-hdr">
          <span className="hsb-card-title">CATÁLOGO HISTÓRICO</span>
        </div>
        <div className="hsb-stats-grid">
          {stats.map(({ label, value, Icon, color }) => (
            <div key={label} className="hsb-stat">
              <div className="hsb-stat-icon" style={{ background: color + "20", color }}>
                <Icon size={13} />
              </div>
              <span className="hsb-stat-val">{value}</span>
              <span className="hsb-stat-lbl">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy breakdown */}
      {Object.keys(legacyCount).length > 0 && (
        <div className="hsb-card">
          <div className="hsb-card-hdr">
            <span className="hsb-card-title">POR TIPO DE LEGADO</span>
          </div>
          <div className="hsb-legacy-list">
            {Object.entries(legacyCount)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="hsb-legacy-row">
                  <span className="hsb-legacy-name">{type}</span>
                  <div className="hsb-legacy-bar-wrap">
                    <div
                      className="hsb-legacy-bar"
                      style={{ width: `${(count / players.length) * 100}%` }}
                    />
                  </div>
                  <span className="hsb-legacy-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Eras */}
      {eras.length > 0 && (
        <div className="hsb-card">
          <div className="hsb-card-hdr">
            <span className="hsb-card-title">ERAS REPRESENTADAS</span>
          </div>
          <div className="hsb-eras-list">
            {eras.map(era => (
              <span key={era} className="hsb-era-chip">{era}</span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
