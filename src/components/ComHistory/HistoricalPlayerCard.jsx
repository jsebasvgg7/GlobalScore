// src/components/ComHistory/HistoricalPlayerCard.jsx
import React from "react";
import { MapPin, Clock, Star } from "lucide-react";

const LEGACY_COLORS = {
  "Goal Scorer": "#E24B4A",
  "Tactician":   "#3b82f6",
  "Innovator":   "#1D9E75",
  "Leader":      "#c9a227",
  "Goalkeeper":  "#8b7fc7",
};

const SIGNIFICANCE_LABEL = ["", "Histórico", "Notable", "Estrella", "Leyenda", "GOAT"];

function SignificanceDots({ level }) {
  return (
    <div className="hpc-dots">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`hpc-dot ${n <= level ? "hpc-dot--on" : ""}`}
        />
      ))}
    </div>
  );
}

export default function HistoricalPlayerCard({ player, onClick }) {
  const accentColor = LEGACY_COLORS[player.legacy_type] || "#60519b";

  return (
    <button
      className="hpc-card"
      onClick={() => onClick(player)}
      style={{ "--hpc-accent": accentColor }}
    >
      {/* Image zone */}
      <div className="hpc-img-wrap">
        {player.image_url ? (
          <img src={player.image_url} alt={player.name} className="hpc-img" />
        ) : (
          <div className="hpc-img-ph">
            <span>{player.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        {/* significance overlay top-right */}
        {player.significance_level === 5 && (
          <div className="hpc-goat-badge">GOAT</div>
        )}
        <div className="hpc-img-gradient" />
      </div>

      {/* Body */}
      <div className="hpc-body">
        {/* Legacy pill */}
        <span className="hpc-legacy-pill" style={{ background: accentColor + "20", color: accentColor, borderColor: accentColor + "40" }}>
          {player.legacy_type}
        </span>

        <h3 className="hpc-name">{player.name}</h3>

        <div className="hpc-meta">
          {player.country && (
            <span className="hpc-meta-item">
              <MapPin size={10} />
              {player.country}
            </span>
          )}
          {player.era && (
            <span className="hpc-meta-item">
              <Clock size={10} />
              {player.era}
            </span>
          )}
        </div>

        {player.position && (
          <span className="hpc-position">{player.position}</span>
        )}

        {/* Significance */}
        <div className="hpc-significance">
          <SignificanceDots level={player.significance_level || 0} />
          <span className="hpc-sig-label">{SIGNIFICANCE_LABEL[player.significance_level] || ""}</span>
        </div>

        {player.impact_summary && (
          <p className="hpc-impact">{player.impact_summary}</p>
        )}
      </div>
    </button>
  );
}
