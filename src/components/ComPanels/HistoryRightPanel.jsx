import React, { useState } from "react";
import {
  Users2, Shield, Zap, Star, Trophy,
  TrendingUp, Clock, Globe, Filter
} from "lucide-react";
import { getHistoricalImageUrl } from "../../hooks/HooksHistory/useHistoricalPlayers";
import "../../styles/StylesPanels/HistoryRightPanel.css";

// ── Helpers ───────────────────────────────────────────────────
const LEGACY_COLOR = {
  "Goal Scorer": "#f59e0b",
  "Tactician":   "#3b82f6",
  "Innovator":   "#8b5cf6",
  "Leader":      "#10b981",
  "Goalkeeper":  "#ec4899",
};

const LEGACY_LABEL = {
  "Goal Scorer": "Goleador",
  "Tactician":   "Táctico",
  "Innovator":   "Innovador",
  "Leader":      "Líder",
  "Goalkeeper":  "Portero",
};

const POSITION_LABEL = {
  "Forward":    "Delantero",
  "Midfielder": "Centrocampista",
  "Defender":   "Defensor",
  "Goalkeeper": "Portero",
};

const POSITION_ICON = {
  "Forward":    "⚡",
  "Midfielder": "🎯",
  "Defender":   "🛡️",
  "Goalkeeper": "🧤",
};

const SIGNIFICANCE_LABEL = ["", "Histórico", "Notable", "Estrella", "Leyenda", "GOAT Status"];

// ── Sub-componentes ───────────────────────────────────────────
function MiniAvatar({ imagePath, name, size = 32 }) {
  const url = getHistoricalImageUrl(imagePath);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="hrp-mini-av" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt={name} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function SignificanceBar({ value }) {
  return (
    <div className="hrp-sig-bar-wrap">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`hrp-sig-segment ${n <= value ? "hrp-sig-segment--on" : ""}`}
        />
      ))}
    </div>
  );
}

// ── Sección: jugador seleccionado ─────────────────────────────
function SelectedPlayerBlock({ player }) {
  if (!player) {
    return (
      <div className="hrp-selected-empty">
        <Users2 size={24} strokeWidth={1.2} />
        <span>Selecciona un jugador</span>
      </div>
    );
  }

  const color = LEGACY_COLOR[player.legacy_type] || "var(--accent)";
  const sigLabel = SIGNIFICANCE_LABEL[player.significance_level || 0];

  return (
    <div className="hrp-selected-card">
      <div className="hrp-selected-accent" style={{ background: color }} />
      <div className="hrp-selected-body">
        <div className="hrp-selected-top">
          <MiniAvatar imagePath={player.image_path} name={player.name} size={48} />
          <div className="hrp-selected-info">
            <span className="hrp-selected-name">{player.name}</span>
            <span className="hrp-selected-meta">
              {[player.country, POSITION_LABEL[player.position] || player.position].filter(Boolean).join(" · ")}
            </span>
            {player.era && (
              <span className="hrp-selected-era">{player.era}</span>
            )}
          </div>
        </div>

        <div className="hrp-selected-sig">
          <SignificanceBar value={player.significance_level || 0} />
          <span className="hrp-selected-sig-lbl">{sigLabel}</span>
        </div>

        {player.legacy_type && (
          <span
            className="hrp-selected-badge"
            style={{ "--badge-c": color }}
          >
            {LEGACY_LABEL[player.legacy_type] || player.legacy_type}
          </span>
        )}

        {player.impact_summary && (
          <p className="hrp-selected-impact">
            "{player.impact_summary.slice(0, 120)}
            {player.impact_summary.length > 120 ? "…" : ""}"
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sección: stats del catálogo ───────────────────────────────
function CatalogStats({ allPlayers }) {
  const total = allPlayers.length;

  const byPosition = allPlayers.reduce((acc, p) => {
    if (p.position) acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});

  const byLegacy = allPlayers.reduce((acc, p) => {
    if (p.legacy_type) acc[p.legacy_type] = (acc[p.legacy_type] || 0) + 1;
    return acc;
  }, {});

  const goats     = allPlayers.filter((p) => p.significance_level === 5).length;
  const published = allPlayers.filter((p) => p.is_published !== false).length;

  const topPositions = Object.entries(byPosition)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topLegacies = Object.entries(byLegacy)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <>
      {/* Totales */}
      <div className="hrp-block">
        <div className="hrp-block-label">
          <Trophy size={9} />
          Catálogo
        </div>

        <div className="hrp-stat-row">
          <span className="hrp-stat-lbl">Total leyendas</span>
          <span className="hrp-stat-val hrp-val--accent">{total}</span>
        </div>
        <div className="hrp-stat-row">
          <span className="hrp-stat-lbl">Estado GOAT</span>
          <span className="hrp-stat-val hrp-val--gold">{goats}</span>
        </div>
        <div className="hrp-stat-row">
          <span className="hrp-stat-lbl">Publicados</span>
          <span className="hrp-stat-val">{published}</span>
        </div>
      </div>

      {/* Por posición */}
      {topPositions.length > 0 && (
        <div className="hrp-block">
          <div className="hrp-block-label">
            <Shield size={9} />
            Por posición
          </div>
          <div className="hrp-pos-list">
            {topPositions.map(([pos, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={pos} className="hrp-pos-row">
                  <span className="hrp-pos-icon">{POSITION_ICON[pos] || "•"}</span>
                  <span className="hrp-pos-name">{POSITION_LABEL[pos] || pos}</span>
                  <div className="hrp-pos-track">
                    <div
                      className="hrp-pos-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="hrp-pos-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Por legado */}
      {topLegacies.length > 0 && (
        <div className="hrp-block">
          <div className="hrp-block-label">
            <Star size={9} />
            Tipos de legado
          </div>
          <div className="hrp-legacy-list">
            {topLegacies.map(([legacy, count]) => {
              const color = LEGACY_COLOR[legacy] || "var(--accent)";
              return (
                <div key={legacy} className="hrp-legacy-row">
                  <div
                    className="hrp-legacy-dot"
                    style={{ background: color }}
                  />
                  <span className="hrp-legacy-name">{LEGACY_LABEL[legacy] || legacy}</span>
                  <span
                    className="hrp-legacy-count"
                    style={{ color }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ── Sección: top jugadores por significancia ──────────────────
function TopPlayersBlock({ allPlayers, onSelect }) {
  const top = [...allPlayers]
    .sort((a, b) => (b.significance_level || 0) - (a.significance_level || 0))
    .slice(0, 5);

  if (top.length === 0) return null;

  return (
    <div className="hrp-block hrp-block--top">
      <div className="hrp-block-label">
        <TrendingUp size={9} />
        Top leyendas
      </div>
      <div className="hrp-top-list">
        {top.map((p, i) => {
          const color = LEGACY_COLOR[p.legacy_type] || "var(--accent)";
          return (
            <button
              key={p.id}
              className="hrp-top-row"
              onClick={() => onSelect && onSelect(p)}
            >
              <span className="hrp-top-rank">{i + 1}</span>
              <MiniAvatar imagePath={p.image_path} name={p.name} size={30} />
              <div className="hrp-top-info">
                <span className="hrp-top-name">{p.name}</span>
                <span className="hrp-top-meta">
                  {[p.country, POSITION_LABEL[p.position] || p.position].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div className="hrp-top-sig">
                {[1,2,3,4,5].map((n) => (
                  <div
                    key={n}
                    className="hrp-top-dot"
                    style={{
                      background: n <= (p.significance_level || 0) ? color : "var(--border)",
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Pie del panel: GOAT ───────────────────────────────────────
function GoatFooter({ allPlayers }) {
  const goat = allPlayers.find((p) => p.significance_level === 5);
  if (!goat) return null;

  return (
    <div className="hrp-goat">
      <div className="hrp-goat-label">ESTADO GOAT</div>
      <div className="hrp-goat-row">
        <MiniAvatar imagePath={goat.image_path} name={goat.name} size={40} />
        <div className="hrp-goat-info">
          <span className="hrp-goat-name">{goat.name}</span>
          <span className="hrp-goat-meta">
            {[goat.country, goat.era].filter(Boolean).join(" · ")}
          </span>
        </div>
        <span className="hrp-goat-chip">★</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function HistoryRightPanel({
  allPlayers = [],
  selectedPlayer = null,
  onSelectPlayer,
}) {
  return (
    <aside className="hrp-root">

      {/* Etiqueta superior */}
      <div className="hrp-label">
        <span className="hrp-label-dot" />
        HISTÓRICO
        <span className="hrp-label-dot" />
      </div>

      {/* Jugador seleccionado */}
      <div className="hrp-section hrp-section--selected">
        <div className="hrp-block-label" style={{ marginBottom: 10 }}>
          <Clock size={9} />
          Jugador activo
        </div>
        <SelectedPlayerBlock player={selectedPlayer} />
      </div>

      {/* Top leyendas */}
      <TopPlayersBlock allPlayers={allPlayers} onSelect={onSelectPlayer} />

      {/* Stats del catálogo */}
      <CatalogStats allPlayers={allPlayers} />

      {/* Pie GOAT */}
      <GoatFooter allPlayers={allPlayers} />

    </aside>
  );
}