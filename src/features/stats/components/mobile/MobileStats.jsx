import React from "react";
import { Target, Star, CheckCircle2, Zap } from "lucide-react";
import { GlobalLoader } from "@/shared/ui";
import "./MobileStats.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

export default function MobileStats({ stats, loading, timeRange, onTimeRangeChange }) {

  if (loading) {
    return (
      <div className="mst-root">
        <GlobalLoader variant="inline" size="md" label="cargando" />
      </div>
    );
  }

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
    (stats.pointsFromAwards || 0);

  const pctMatches = totalPts > 0 ? Math.round(((stats.pointsFromMatches || 0) / totalPts) * 100) : 0;
  const pctLeagues = totalPts > 0 ? Math.round(((stats.pointsFromLeagues || 0) / totalPts) * 100) : 0;
  const pctAwards = totalPts > 0 ? Math.round(((stats.pointsFromAwards || 0) / totalPts) * 100) : 0;

  const orderedDays = stats.dayStats
    ? [...stats.dayStats.slice(1), stats.dayStats[0]]
    : [];

  return (
    <div className="mst-root">

      {/* ══ TOPBAR — Todo / Mes ══ */}
      <div className="mst-topbar">
        <div className="mst-topbar-label">
          <span className="mst-topbar-dot" />
          Estadísticas
        </div>
        <div className="mst-range-pills">
          {[
            { key: "all", label: "Todo" },
            { key: "month", label: "Últ. 30 días" },
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

      {/* ══ HERO BENTO — Precisión grande + Exactos/Correctos/Puntos ══ */}
      <div className="mst-hero">
        <div className="mst-hero-main">
          <div className="mst-hero-icon"><Target size={13} /></div>
          <div>
            <div className="mst-hero-lbl">Precisión</div>
            <div className="mst-hero-main-val">{stats.accuracy}%</div>
            <div className="mst-hero-sub">{fmt(totalFinished)} finalizadas</div>
          </div>
        </div>

        <div className="mst-hero-small mst-hero-small--gold" style={{ position: "relative" }}>
          <div className="mst-hero-icon"><Star size={12} /></div>
          <div className="mst-hero-lbl">Exactos</div>
          <div className="mst-hero-small-val">{fmt(stats.exact)}</div>
          <div className="mst-hero-sub">{stats.exactAccuracy}% exactitud</div>
        </div>

        <div className="mst-hero-small mst-hero-small--amber" style={{ position: "relative" }}>
          <div className="mst-hero-icon"><CheckCircle2 size={12} /></div>
          <div className="mst-hero-lbl">Correctos</div>
          <div className="mst-hero-small-val">{fmt(stats.correctResult)}</div>
          <div className="mst-hero-sub">+3 pts c/u</div>
        </div>

        <div className="mst-hero-small mst-hero-small--green" style={{ position: "relative" }}>
          <div className="mst-hero-icon"><Zap size={14} /></div>
          <div className="mst-hero-text">
            <div className="mst-hero-lbl">Puntos</div>
            <div className="mst-hero-small-val">{fmt(stats.pointsFromMatches)}</div>
          </div>
          <div className="mst-hero-sub">de partidos</div>
        </div>
      </div>

      {/* ══ DESGLOSE DE RESULTADOS ══ */}
      <div className="mst-sec-hdr">
        <span className="mst-sec-sq" />
        <span className="mst-sec-title">Desglose de resultados</span>
      </div>
      <div className="mst-results">

        <div className="mst-result-item">
          <div className="mst-result-top">
            <div className="mst-result-left">
              <div className="mst-result-num">{fmt(stats.exact)}</div>
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
                background: "var(--m-accent)",
              }}
            />
          </div>
        </div>

        <div className="mst-result-item">
          <div className="mst-result-top">
            <div className="mst-result-left">
              <div className="mst-result-num">{fmt(stats.correctResult)}</div>
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
                background: "var(--m-amber)",
              }}
            />
          </div>
        </div>

        <div className="mst-result-item">
          <div className="mst-result-top">
            <div className="mst-result-left">
              <div className="mst-result-num">{fmt(stats.wrong)}</div>
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
                background: "var(--m-muted)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ══ LIGAS ══ */}
      {stats.leagueStats?.length > 0 && (
        <>
          <div className="mst-sec-hdr">
            <span className="mst-sec-sq" />
            <span className="mst-sec-title">Rendimiento por liga</span>
          </div>
          <div className="mst-leagues">
            <div className="mst-league-thead">
              <span className="mst-lth-rank" />
              <span className="mst-lth-name">Liga</span>
              <span className="mst-lth-pts">Pts</span>
              <span className="mst-lth-acc">Precisión</span>
            </div>

            {stats.leagueStats.map((league, i) => {
              const badgeMod = i < 3 ? ` mst-rank-badge--${i + 1}` : "";
              return (
                <div className="mst-league-row" key={league.name}>
                  <div className={`mst-rank-badge${badgeMod}`}>{i + 1}</div>
                  <div className="mst-league-name">{league.name}</div>
                  <div className="mst-league-pts">{fmt(league.points)}</div>
                  <div className="mst-league-acc">
                    <div className="mst-league-acc-bar">
                      <div className="mst-league-acc-fill" style={{ width: `${league.accuracy}%` }} />
                    </div>
                    <span className="mst-league-acc-pct">{league.accuracy}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══ DÍAS ══ */}
      <div className="mst-sec-hdr">
        <span className="mst-sec-sq" />
        <span className="mst-sec-title">Rendimiento por día</span>
      </div>
      <div className="mst-days">
        {orderedDays.map((day) => {
          const pct = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
          const opacity = day.total > 0 ? 0.35 + (pct / 100) * 0.65 : 0.15;
          return (
            <div className="mst-day" key={day.name}>
              <div className="mst-day-lbl">{day.name}</div>
              <div className="mst-day-pct">{pct}%</div>
              <div className="mst-day-bar-wrap">
                <div className="mst-day-fill" style={{ height: `${pct}%`, opacity }} />
              </div>
              <div className="mst-day-detail">{day.correct}/{day.total}</div>
            </div>
          );
        })}
      </div>

      {/* ══ DISTRIBUCIÓN DE PUNTOS ══ */}
      <div className="mst-sec-hdr">
        <span className="mst-sec-sq" />
        <span className="mst-sec-title">Distribución de puntos</span>
      </div>
      <div className="mst-dist">
        <div className="mst-dist-row">
          <div className="mst-dist-top">
            <span className="mst-dist-name">Partidos</span>
            <span className="mst-dist-val">{fmt(stats.pointsFromMatches)}</span>
          </div>
          <div className="mst-dist-track">
            <div className="mst-dist-fill" style={{ width: `${pctMatches}%`, background: "var(--m-accent)" }} />
          </div>
        </div>
        <div className="mst-dist-row">
          <div className="mst-dist-top">
            <span className="mst-dist-name">Ligas</span>
            <span className="mst-dist-val">{fmt(stats.pointsFromLeagues)}</span>
          </div>
          <div className="mst-dist-track">
            <div
              className="mst-dist-fill"
              style={{ width: `${Math.max(pctLeagues, pctLeagues > 0 ? 4 : 0)}%`, background: "var(--m-green)" }}
            />
          </div>
        </div>
        <div className="mst-dist-row">
          <div className="mst-dist-top">
            <span className="mst-dist-name">Premios</span>
            <span className="mst-dist-val">{fmt(stats.pointsFromAwards)}</span>
          </div>
          <div className="mst-dist-track">
            <div
              className="mst-dist-fill"
              style={{ width: `${Math.max(pctAwards, pctAwards > 0 ? 4 : 0)}%`, background: "var(--m-gold)" }}
            />
          </div>
        </div>
      </div>

      {/* ══ PRONÓSTICOS ESPECIALES ══ */}
      <div className="mst-sec-hdr">
        <span className="mst-sec-sq" />
        <span className="mst-sec-title">Pronósticos especiales</span>
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
  );
}