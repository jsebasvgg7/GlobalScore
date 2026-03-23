import React from "react";
import { Target, Star, CheckCircle2, Zap } from "lucide-react";
import "../../styles/StylesMobile/MobileStats.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

/* ── Icono hero cuadrado ── */
function HeroIcon({ color, children }) {
  return (
    <div className="mst-hero-icon" style={{ background: color, color: "#fff" }}>
      {children}
    </div>
  );
}

export default function MobileStats({ stats, loading, timeRange, onTimeRangeChange }) {

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="mst-root">
        <div className="mst-loading">
          <div className="mst-spinner" />
          CARGANDO
        </div>
      </div>
    );
  }

  /* ── EMPTY ── */
  if (!stats) {
    return (
      <div className="mst-root">
        <div className="mst-empty">
          <div className="mst-empty-icon">📊</div>
          <div className="mst-empty-title">Sin estadísticas</div>
          <div className="mst-empty-sub">Empieza a hacer predicciones para ver tus datos</div>
        </div>
      </div>
    );
  }

  const totalFinished = stats.totalPredictions || 0;

  const totalPts =
    (stats.pointsFromMatches || 0) +
    (stats.pointsFromLeagues || 0) +
    (stats.pointsFromAwards  || 0);

  const pctMatches = totalPts > 0 ? Math.round(((stats.pointsFromMatches || 0) / totalPts) * 100) : 0;
  const pctLeagues = totalPts > 0 ? Math.round(((stats.pointsFromLeagues || 0) / totalPts) * 100) : 0;
  const pctAwards  = totalPts > 0 ? Math.round(((stats.pointsFromAwards  || 0) / totalPts) * 100) : 0;

  /* ── Días ordenados Lun→Dom ── */
  const orderedDays = stats.dayStats
    ? [...stats.dayStats.slice(1), stats.dayStats[0]]
    : [];

  return (
    <div className="mst-root">

      {/* ══ TOPBAR: selector rango ══ */}
      <div className="mst-topbar">
        <div className="mst-topbar-label">
          <span className="mst-topbar-dot" />
          Estadísticas
        </div>
        <div className="mst-range-pills">
          {[
            { key: "all",   label: "Todo"   },
            { key: "month", label: "Mes"    },
            { key: "week",  label: "Semana" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`mst-range-pill${timeRange === key ? " active" : ""}`}
              onClick={() => onTimeRangeChange?.(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ HERO 2x2 ══ */}
      <div className="mst-hero">
        <div className="mst-hero-block">
          <HeroIcon color="#5b4fd8"><Target size={13} /></HeroIcon>
          <div className="mst-hero-lbl">Precisión</div>
          <div className="mst-hero-num mst-hero-num--accent">{stats.accuracy}%</div>
          <div className="mst-hero-sub">{fmt(totalFinished)} finalizadas</div>
        </div>

        <div className="mst-hero-block">
          <HeroIcon color="#1D9E75"><Star size={13} /></HeroIcon>
          <div className="mst-hero-lbl">Exactos</div>
          <div className="mst-hero-num mst-hero-num--green">{fmt(stats.exact)}</div>
          <div className="mst-hero-sub">{stats.exactAccuracy}% exactitud</div>
        </div>

        <div className="mst-hero-block">
          <HeroIcon color="#b45309"><CheckCircle2 size={13} /></HeroIcon>
          <div className="mst-hero-lbl">Correctos</div>
          <div className="mst-hero-num mst-hero-num--amber">{fmt(stats.correctResult)}</div>
          <div className="mst-hero-sub">+3 pts c/u</div>
        </div>

        <div className="mst-hero-block">
          <HeroIcon color="#c9a227"><Zap size={13} /></HeroIcon>
          <div className="mst-hero-lbl">Puntos</div>
          <div className="mst-hero-num" style={{ color: "#c9a227" }}>{fmt(stats.totalPoints)}</div>
          <div className="mst-hero-sub">de partidos</div>
        </div>
      </div>

      {/* ══ DESGLOSE ══ */}
      <div className="mst-section">
        <div className="mst-section-hdr">
          <span className="mst-section-dot" style={{ background: "#5b4fd8" }} />
          <span className="mst-section-title">Desglose de resultados</span>
        </div>
        <div className="mst-results">

          {/* Exactos */}
          <div className="mst-result-item">
            <div className="mst-result-top">
              <div className="mst-result-left">
                <div className="mst-result-num" style={{ color: "#c9a227" }}>{fmt(stats.exact)}</div>
                <div className="mst-result-pts">+{fmt(stats.exact * 5)} pts</div>
              </div>
              <div className="mst-result-pct">
                {totalFinished > 0 ? Math.round((stats.exact / totalFinished) * 100) : 0}%
              </div>
            </div>
            <div className="mst-result-name">Exactos</div>
            <div className="mst-result-bar-wrap">
              <div
                className="mst-result-bar"
                style={{
                  width: `${totalFinished > 0 ? Math.round((stats.exact / totalFinished) * 100) : 0}%`,
                  background: "#c9a227",
                }}
              />
            </div>
          </div>

          {/* Correctos */}
          <div className="mst-result-item">
            <div className="mst-result-top">
              <div className="mst-result-left">
                <div className="mst-result-num" style={{ color: "#1D9E75" }}>{fmt(stats.correctResult)}</div>
                <div className="mst-result-pts">+{fmt(stats.correctResult * 3)} pts</div>
              </div>
              <div className="mst-result-pct">
                {totalFinished > 0 ? Math.round((stats.correctResult / totalFinished) * 100) : 0}%
              </div>
            </div>
            <div className="mst-result-name">Correctos</div>
            <div className="mst-result-bar-wrap">
              <div
                className="mst-result-bar"
                style={{
                  width: `${totalFinished > 0 ? Math.round((stats.correctResult / totalFinished) * 100) : 0}%`,
                  background: "#1D9E75",
                }}
              />
            </div>
          </div>

          {/* Incorrectos */}
          <div className="mst-result-item">
            <div className="mst-result-top">
              <div className="mst-result-left">
                <div className="mst-result-num" style={{ color: "#c0392b" }}>{fmt(stats.wrong)}</div>
                <div className="mst-result-pts mst-result-pts--red">0 pts</div>
              </div>
              <div className="mst-result-pct">
                {totalFinished > 0 ? Math.round((stats.wrong / totalFinished) * 100) : 0}%
              </div>
            </div>
            <div className="mst-result-name">Incorrectos</div>
            <div className="mst-result-bar-wrap">
              <div
                className="mst-result-bar"
                style={{
                  width: `${totalFinished > 0 ? Math.round((stats.wrong / totalFinished) * 100) : 0}%`,
                  background: "#c0392b",
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ══ LIGAS ══ */}
      {stats.leagueStats?.length > 0 && (
        <div className="mst-section">
          <div className="mst-section-hdr">
            <span className="mst-section-dot" style={{ background: "#c9a227" }} />
            <span className="mst-section-title">Rendimiento por liga</span>
          </div>
          <div className="mst-leagues-scroll">
            {/* Thead */}
            <div className="mst-league-row thead">
              <div style={{ width: 24 }} />
              <div className="mst-lc" style={{ flex: 1, textAlign: "left" }}>Liga</div>
              <div className="mst-lc mst-lc--pts">Pts</div>
              <div className="mst-acc-inline" style={{ paddingRight: 4 }}>Precisión</div>
            </div>

            {stats.leagueStats.map((league, i) => {
              const badgeMod = i < 3 ? ` mst-rank-badge--${i + 1}` : "";
              return (
                <div className="mst-league-row" key={league.name}>
                  <div className={`mst-rank-badge${badgeMod}`}>{i + 1}</div>
                  <div className="mst-league-name">{league.name}</div>
                  <div className="mst-lc mst-lc--pts">{fmt(league.points)}</div>
                  <div className="mst-acc-inline">
                    <div className="mst-acc-bar">
                      <div className="mst-acc-fill" style={{ width: `${league.accuracy}%` }} />
                    </div>
                    <span className="mst-acc-pct">{league.accuracy}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ DÍAS ══ */}
      <div className="mst-section">
        <div className="mst-section-hdr">
          <span className="mst-section-dot" style={{ background: "#1D9E75" }} />
          <span className="mst-section-title">Rendimiento por día</span>
        </div>
        <div className="mst-days-scroll">
          <div className="mst-days">
            {orderedDays.map((day) => {
              const pct     = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
              const opacity = day.total > 0 ? 0.35 + (pct / 100) * 0.65 : 0.15;
              return (
                <div className="mst-day" key={day.name}>
                  <div className="mst-day-lbl">{day.name}</div>
                  <div className="mst-day-pct">{pct}%</div>
                  <div className="mst-day-bar-wrap">
                    <div
                      className="mst-day-fill"
                      style={{ height: `${pct}%`, opacity }}
                    />
                  </div>
                  <div className="mst-day-detail">{day.correct}/{day.total}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ DISTRIBUCIÓN PTS ══ */}
      <div className="mst-section">
        <div className="mst-section-hdr">
          <span className="mst-section-dot" style={{ background: "#5b4fd8" }} />
          <span className="mst-section-title">Distribución de puntos</span>
        </div>
        <div className="mst-dist">
          <div className="mst-dist-row">
            <div className="mst-dist-top">
              <span className="mst-dist-name">Partidos</span>
              <span className="mst-dist-val">{fmt(stats.pointsFromMatches)}</span>
            </div>
            <div className="mst-dist-track">
              <div className="mst-dist-fill" style={{ width: `${pctMatches}%`, background: "#5b4fd8" }} />
            </div>
          </div>
          <div className="mst-dist-row">
            <div className="mst-dist-top">
              <span className="mst-dist-name">Ligas</span>
              <span className="mst-dist-val">{fmt(stats.pointsFromLeagues)}</span>
            </div>
            <div className="mst-dist-track">
              <div className="mst-dist-fill" style={{ width: `${Math.max(pctLeagues, pctLeagues > 0 ? 4 : 0)}%`, background: "#1D9E75" }} />
            </div>
          </div>
          <div className="mst-dist-row">
            <div className="mst-dist-top">
              <span className="mst-dist-name">Premios</span>
              <span className="mst-dist-val">{fmt(stats.pointsFromAwards)}</span>
            </div>
            <div className="mst-dist-track">
              <div className="mst-dist-fill" style={{ width: `${Math.max(pctAwards, pctAwards > 0 ? 4 : 0)}%`, background: "#c9a227" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ PRONÓSTICOS ══ */}
      <div className="mst-section">
        <div className="mst-section-hdr">
          <span className="mst-section-dot" style={{ background: "#c9a227" }} />
          <span className="mst-section-title">Pronósticos especiales</span>
        </div>
        <div className="mst-forecast">
          <div className="mst-forecast-item">
            <div className="mst-forecast-val">{fmt(stats.leaguePredictions)}</div>
            <div className="mst-forecast-lbl">Ligas pred.</div>
          </div>
          <div className="mst-forecast-item">
            <div className="mst-forecast-val">{fmt(stats.awardPredictions)}</div>
            <div className="mst-forecast-lbl">Premios pred.</div>
          </div>
          <div className="mst-forecast-item">
            <div className="mst-forecast-val mst-forecast-val--green">{fmt(stats.pointsFromLeagues)}</div>
            <div className="mst-forecast-lbl">Pts ligas</div>
          </div>
          <div className="mst-forecast-item">
            <div className="mst-forecast-val mst-forecast-val--green">{fmt(stats.pointsFromAwards)}</div>
            <div className="mst-forecast-lbl">Pts premios</div>
          </div>
        </div>
      </div>

    </div>
  );
}