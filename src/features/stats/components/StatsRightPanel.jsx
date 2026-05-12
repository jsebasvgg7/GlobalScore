import React from "react";
import "../../styles/StylesPanels/StatsRightPanel.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

export default function StatsRightPanel({ stats, currentUser }) {
  if (!stats) return null;

  const totalPts =
    (stats.pointsFromMatches || 0) +
    (stats.pointsFromLeagues || 0) +
    (stats.pointsFromAwards || 0);

  const pctMatches =
    totalPts > 0
      ? Math.round(((stats.pointsFromMatches || 0) / totalPts) * 100)
      : 0;
  const pctLeagues =
    totalPts > 0
      ? Math.round(((stats.pointsFromLeagues || 0) / totalPts) * 100)
      : 0;
  const pctAwards =
    totalPts > 0
      ? Math.round(((stats.pointsFromAwards || 0) / totalPts) * 100)
      : 0;

  return (
    <aside className="srp-root">

      {/* ── TOTALES ── */}
      <div className="srp-block">
        <div className="srp-block-label">Totales</div>

        <div className="srp-stat-row">
          <span className="srp-stat-lbl">Predicciones</span>
          <span className="srp-stat-val srp-stat-val--accent">
            {fmt(stats.totalPredictions + stats.pendingPredictions)}
          </span>
        </div>
        <div className="srp-stat-row">
          <span className="srp-stat-lbl">Finalizadas</span>
          <span className="srp-stat-val">{fmt(stats.totalPredictions)}</span>
        </div>
        <div className="srp-stat-row">
          <span className="srp-stat-lbl">Pendientes</span>
          <span className="srp-stat-val">{fmt(stats.pendingPredictions)}</span>
        </div>
        <div className="srp-stat-row">
          <span className="srp-stat-lbl">Exactos</span>
          <span className="srp-stat-val srp-stat-val--amber">
            {fmt(stats.exact)}
          </span>
        </div>
        <div className="srp-stat-row">
          <span className="srp-stat-lbl">Incorrectos</span>
          <span className="srp-stat-val srp-stat-val--red">
            {fmt(stats.wrong)}
          </span>
        </div>
      </div>

      {/* ── DISTRIBUCIÓN DE PUNTOS ── */}
      <div className="srp-block">
        <div className="srp-block-label">Distribución pts</div>

        <div className="srp-dist">
          <div className="srp-dist-row">
            <div className="srp-dist-top">
              <span className="srp-dist-name">Partidos</span>
              <span className="srp-dist-val">{fmt(stats.pointsFromMatches)}</span>
            </div>
            <div className="srp-dist-track">
              <div
                className="srp-dist-fill"
                style={{ width: `${pctMatches}%`, background: "#5b4fd8" }}
              />
            </div>
          </div>

          <div className="srp-dist-row">
            <div className="srp-dist-top">
              <span className="srp-dist-name">Ligas</span>
              <span className="srp-dist-val">{fmt(stats.pointsFromLeagues)}</span>
            </div>
            <div className="srp-dist-track">
              <div
                className="srp-dist-fill"
                style={{
                  width: `${Math.max(pctLeagues, pctLeagues > 0 ? 4 : 0)}%`,
                  background: "#1D9E75",
                }}
              />
            </div>
          </div>

          <div className="srp-dist-row">
            <div className="srp-dist-top">
              <span className="srp-dist-name">Premios</span>
              <span className="srp-dist-val">{fmt(stats.pointsFromAwards)}</span>
            </div>
            <div className="srp-dist-track">
              <div
                className="srp-dist-fill"
                style={{
                  width: `${Math.max(pctAwards, pctAwards > 0 ? 4 : 0)}%`,
                  background: "#c9a227",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── PRONÓSTICOS ── */}
      <div className="srp-block">
        <div className="srp-block-label">Pronósticos</div>

        <div className="srp-forecast-grid">
          <div className="srp-forecast-item">
            <div className="srp-forecast-val">{fmt(stats.leaguePredictions)}</div>
            <div className="srp-forecast-lbl">Ligas pred.</div>
          </div>
          <div className="srp-forecast-item">
            <div className="srp-forecast-val">{fmt(stats.awardPredictions)}</div>
            <div className="srp-forecast-lbl">Premios pred.</div>
          </div>
          <div className="srp-forecast-item">
            <div className="srp-forecast-val srp-forecast-val--green">
              {fmt(stats.pointsFromLeagues)}
            </div>
            <div className="srp-forecast-lbl">Pts ligas</div>
          </div>
          <div className="srp-forecast-item">
            <div className="srp-forecast-val srp-forecast-val--green">
              {fmt(stats.pointsFromAwards)}
            </div>
            <div className="srp-forecast-lbl">Pts premios</div>
          </div>
        </div>
      </div>

      {/* ── RACHA — al fondo ── */}
      <div className="srp-streak">
        <div className="srp-streak-label">Racha actual</div>
        <div className="srp-streak-num">{stats.currentStreak}</div>
        <div className="srp-streak-sub">predicciones seguidas correctas</div>
        <div className="srp-streak-divider" />
        <div className="srp-streak-best">
          <span className="srp-streak-best-lbl">Récord personal</span>
          <span className="srp-streak-best-val">{stats.bestStreak}</span>
        </div>
      </div>

    </aside>
  );
}