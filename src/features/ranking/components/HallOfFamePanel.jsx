import React, { useState } from "react";
import { Crown, Trophy, Star, Zap } from "lucide-react";
import HistoryTriggerCard from "./HistoryTriggerCard";
import HistoryPanel from "./HistoryPanel";
import "../styles/HallOfFamePanel.css";
import "../styles/HistoryTriggerCard.css";
import "../styles/HistoryPanel.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

const META = [
  { label: "ORO", color: "#c9a227" },
  { label: "PLATA", color: "#8a8a8a" },
  { label: "BRONCE", color: "#a0652a" },
];

const TYPE_CONFIG = {
  monthly: { Icon: Crown, color: "#c9a227", unitLabel: "coronas", periodLabel: "Título" },
  global: { Icon: Trophy, color: "#0ea5a8", unitLabel: "trofeos", periodLabel: "Edición" },
};

function Avatar({ user }) {
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={user.name} className="hofp-av" />;
  }
  return (
    <div className="hofp-av hofp-av--ph">
      {(user?.name || "U")[0].toUpperCase()}
    </div>
  );
}

export default function HallOfFamePanel({ champions = [], type = "monthly" }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.monthly;
  const TypeIcon = cfg.Icon;

  const top3 = champions.slice(0, 3);
  const totalUnits = champions.reduce((acc, c) => acc + (c.championships || 0), 0);
  const maxUnits = champions[0]?.championships || 0;
  const totalChamps = champions.length;

  return (
    <aside className="hofp-root">

      {/* ── HISTORY TRIGGER ── */}
      <HistoryTriggerCard
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((v) => !v)}
      />

      {/* ── PANEL SWAP ── */}
      {isHistoryOpen ? (
        <div className="hofp-history-wrap">
          <HistoryPanel />
        </div>
      ) : (
        <>
          {/* ── TOP 3 ESCALERA ── */}
          <div className="hofp-podium">
            {top3.map((champ, i) => {
              const meta = META[i];
              const ml = i === 0 ? 0 : i === 1 ? 28 : 56;
              return (
                <div
                  key={champ.id}
                  className="hofp-step"
                  style={{ marginLeft: ml, borderLeftColor: meta.color }}
                >
                  <div className="hofp-step-rank" style={{ background: meta.color }}>
                    {i + 1}
                  </div>

                  <div className="hofp-step-body">
                    <span className="hofp-step-medal" style={{ color: meta.color }}>
                      {meta.label}
                    </span>

                    <div className="hofp-step-row">
                      <Avatar user={champ} />
                      <div className="hofp-step-info">
                        <span className="hofp-step-name">{champ.name}</span>
                        <span className="hofp-step-pts" style={{ color: meta.color }}>
                          {fmt(champ.points)} pts
                        </span>
                      </div>
                    </div>

                    <div className="hofp-step-stats">
                      <span className="hofp-step-stat">
                        <TypeIcon size={10} style={{ color: meta.color }} />
                        <span className="hofp-step-stat-val" style={{ color: meta.color }}>
                          {champ.championships}
                        </span>
                        <span className="hofp-step-stat-lbl">{cfg.unitLabel}</span>
                      </span>
                      <span className="hofp-step-stat">
                        <span className="hofp-step-stat-lbl">
                          {champ.period || "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── STATS GLOBALES ── */}
          <div className="hofp-global" style={{ background: cfg.color }}>
            <div className="hofp-global-title">ESTADÍSTICAS GENERALES</div>

            <div className="hofp-global-row">
              <span className="hofp-global-lbl">Campeones</span>
              <span className="hofp-global-val">{totalChamps}</span>
            </div>
            <div className="hofp-global-row">
              <span className="hofp-global-lbl">{cfg.unitLabel.charAt(0).toUpperCase() + cfg.unitLabel.slice(1)} totales</span>
              <span className="hofp-global-val hofp-global-val--gold">{totalUnits}</span>
            </div>
            <div className="hofp-global-row">
              <span className="hofp-global-lbl">Récord {cfg.unitLabel}</span>
              <span className="hofp-global-val hofp-global-val--gold">{maxUnits}</span>
            </div>
            {champions[0] && (
              <div className="hofp-global-row">
                <span className="hofp-global-lbl">Dominador</span>
                <span className="hofp-global-val hofp-global-val--leader">
                  {champions[0].name}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}