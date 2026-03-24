import React from "react";
import { Crown, Star, Zap, Trophy } from "lucide-react";
import "../../styles/StylesPanels/HallOfFamePanel.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

const META = [
  { label: "ORO",    color: "#c9a227" },
  { label: "PLATA",  color: "#8a8a8a" },
  { label: "BRONCE", color: "#a0652a" },
];

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

export default function HallOfFamePanel({ champions = [] }) {
  const top3      = champions.slice(0, 3);
  const totalCrowns = champions.reduce((acc, c) => acc + (c.monthly_championships || 0), 0);
  const maxCrowns   = champions[0]?.monthly_championships || 0;
  const totalChamps = champions.length;

  return (
    <aside className="hofp-root">

      {/* ── LABEL ── */}
      <div className="hofp-label">
        <span className="hofp-label-dot" />
        SALÓN DE LA FAMA
        <span className="hofp-label-dot" />
      </div>

      {/* ── TOP 3 ESCALERA ── */}
      <div className="hofp-podium">
        {top3.map((champ, i) => {
          const meta = META[i];
          const ml   = i === 0 ? 0 : i === 1 ? 28 : 56;
          return (
            <div
              key={champ.id}
              className="hofp-step"
              style={{ marginLeft: ml, borderLeftColor: meta.color }}
            >
              {/* Barra lateral con número */}
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
                      {fmt(champ.championship_points)} pts
                    </span>
                  </div>
                </div>

                <div className="hofp-step-stats">
                  <span className="hofp-step-stat">
                    <Crown size={10} style={{ color: meta.color }} />
                    <span className="hofp-step-stat-val" style={{ color: meta.color }}>
                      {champ.monthly_championships}
                    </span>
                    <span className="hofp-step-stat-lbl">coronas</span>
                  </span>
                  <span className="hofp-step-stat">
                    <span className="hofp-step-stat-lbl">
                      {champ.championship_month_year || "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STATS GLOBALES ── */}
      <div className="hofp-global">
        <div className="hofp-global-title">ESTADÍSTICAS GENERALES</div>

        <div className="hofp-global-row">
          <span className="hofp-global-lbl">Campeones</span>
          <span className="hofp-global-val">{totalChamps}</span>
        </div>
        <div className="hofp-global-row">
          <span className="hofp-global-lbl">Coronas totales</span>
          <span className="hofp-global-val hofp-global-val--gold">{totalCrowns}</span>
        </div>
        <div className="hofp-global-row">
          <span className="hofp-global-lbl">Récord coronas</span>
          <span className="hofp-global-val hofp-global-val--gold">{maxCrowns}</span>
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

    </aside>
  );
}