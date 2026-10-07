import React, { useState } from "react";
import { Target, Star, CheckCircle2, XCircle, Zap, Trophy, Award } from "lucide-react";
import { GlobalLoader } from "@/shared/ui";
import { STATS_RANGES, getRangeCaption } from "@/features/stats/services/stats.service";
import "./MobileStats.css";

const TOTAL_SUB = {
  season: "puntos del ranking global",
  month: "puntos del ranking mensual",
  all: "partidos, ligas y premios",
};

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");
const pct = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

/* ── Logo de liga con fallback a iniciales ── */
function LeagueLogo({ name, src }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="mst-logo" title={name}>
      {src && !failed ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/* ── Línea de aciertos por liga ──
   Escala dinámica (mín-máx con margen) para que la variación se lea;
   el valor exacto va bajo cada logo. */
function LeagueLine({ leagues }) {
  const W = 300, H = 112, TOP = 12, BOT = 100;
  const n = leagues.length;
  const accs = leagues.map((l) => l.accuracy);
  const lo = Math.max(0, Math.min(...accs) - 12);
  const hi = Math.min(100, Math.max(...accs) + 12);
  const span = Math.max(hi - lo, 1);
  const xAt = (i) => ((i + 0.5) * W) / n;
  const yAt = (v) => BOT - ((v - lo) / span) * (BOT - TOP);
  const best = accs.indexOf(Math.max(...accs));
  const path = leagues.map((l, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)} ${yAt(l.accuracy).toFixed(1)}`).join(" ");

  return (
    <>
      <svg className="mst-line" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label="Porcentaje de aciertos por competición">
        {[0, 1, 2, 3, 4].map((g) => (
          <line key={g} x1="0" x2={W} y1={TOP + (g * (BOT - TOP)) / 4} y2={TOP + (g * (BOT - TOP)) / 4}
            className="mst-line-grid" />
        ))}
        {n > 1 && <path d={path} className="mst-line-path" />}
        {leagues.map((l, i) => (
          <rect key={l.name} x={xAt(i) - (i === best ? 4 : 3)} y={yAt(l.accuracy) - (i === best ? 4 : 3)}
            width={i === best ? 8 : 6} height={i === best ? 8 : 6}
            className={i === best ? "mst-line-dot mst-line-dot--best" : "mst-line-dot"} />
        ))}
      </svg>
      <div className="mst-line-cols" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {leagues.map((l, i) => (
          <div className="mst-line-col" key={l.name}>
            <LeagueLogo name={l.name} src={l.logo} />
            <b className={i === best ? "mst-line-val mst-line-val--best" : "mst-line-val"}>{l.accuracy}%</b>
          </div>
        ))}
      </div>
    </>
  );
}

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

  const total = stats.totalPredictions || 0;
  const ptsAll = stats.totalPointsAll || 0;
  const hasMatches = total > 0;

  /* dayStats llega Lun→Dom; el diseño pide Dom→Sáb */
  const days = stats.dayStats ? [stats.dayStats[6], ...stats.dayStats.slice(0, 6)] : [];

  return (
    <div className="mst-root">

      {/* ── Título + rango ── */}
      <div className="mst-topbar">
        <h1 className="mst-title">Estadísticas</h1>
        <div className="mst-range" role="tablist">
          {STATS_RANGES.map(({ key, label }) => (
            <button key={key} role="tab" aria-selected={timeRange === key}
              className={`mst-range-pill${timeRange === key ? " active" : ""}`}
              onClick={() => onTimeRangeChange?.(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mst-caption">{getRangeCaption(timeRange, stats.windowFrom)}</p>

      {/* ── Puntos totales ── */}
      <div className="mst-total">
        <div className="mst-total-icon"><Zap size={30} strokeWidth={1.6} /></div>
        <div>
          <div className="mst-total-val">{fmt(ptsAll)} <span>puntos</span></div>
          <div className="mst-total-sub">{TOTAL_SUB[timeRange]}</div>
        </div>
      </div>

      {/* ── Precisión ── */}
      <h2 className="mst-h2">Porcentaje</h2>
      <div className="mst-card mst-acc">
        <div className="mst-tile"><Target size={22} strokeWidth={1.8} /></div>
        <div className="mst-acc-text">
          <div className="mst-acc-name">Precisión</div>
          <div className="mst-acc-sub">acierto en {fmt(total)} pred.</div>
        </div>
        <div className="mst-acc-box" style={{ "--fill": `${stats.accuracy}%` }}>
          <b>{stats.accuracy}</b><i>%</i>
        </div>
      </div>

      {/* ── Desglose ── */}
      <h2 className="mst-h2">Desglose de Puntos</h2>
      <div className="mst-trio">
        <div className="mst-card mst-stat">
          <div className="mst-tile"><Star size={20} strokeWidth={1.8} /></div>
          <div className="mst-stat-name">Exactos</div>
          <div className="mst-stat-val">{fmt(stats.exact)}</div>
          <div className="mst-stat-sub">{stats.exactAccuracy}% exactitud</div>
        </div>
        <div className="mst-card mst-stat">
          <div className="mst-tile"><CheckCircle2 size={20} strokeWidth={1.8} /></div>
          <div className="mst-stat-name">Correctos</div>
          <div className="mst-stat-val">{fmt(stats.correctResult)}</div>
          <div className="mst-stat-sub">+3 pts c/u</div>
        </div>
        <div className="mst-card mst-stat">
          <div className="mst-tile"><XCircle size={20} strokeWidth={1.8} /></div>
          <div className="mst-stat-name">Incorrectos</div>
          <div className="mst-stat-val">{fmt(stats.wrong)}</div>
          <div className="mst-stat-sub">+0 pts c/u</div>
        </div>
      </div>

      {/* ── Rendimiento por liga ── */}
      <h2 className="mst-h2">Rendimiento Por Liga</h2>
      <div className="mst-card mst-league">
        <div className="mst-league-hdr">
          <span>Competición</span>
          <span>% de aciertos</span>
        </div>
        {stats.leagueChart?.length > 0
          ? <LeagueLine leagues={stats.leagueChart} />
          : <div className="mst-none">Sin partidos finalizados en este rango</div>}
      </div>

      {/* ── Rendimiento por día ── */}
      <h2 className="mst-h2">Rendimiento Por Día</h2>
      <div className="mst-days">
        {days.map((d) => {
          const p = pct(d.correct, d.total);
          return (
            <div className="mst-day" key={d.name} title={`${d.correct} de ${d.total} con puntos`}>
              <b className="mst-day-pct">{d.total > 0 ? `${p}%` : "–"}</b>
              <div className="mst-day-bar"><div className="mst-day-fill" style={{ height: `${p}%` }} /></div>
              <span className="mst-day-name">{d.name}</span>
            </div>
          );
        })}
      </div>

      {/* ── Distribución ── */}
      <h2 className="mst-h2">Distribución de Puntos</h2>
      <div className="mst-card mst-dist">
        {[
          { name: "Partidos", val: stats.pointsFromMatches },
          { name: "Ligas", val: stats.pointsFromLeagues },
          { name: "Premios", val: stats.pointsFromAwards },
        ].map((r) => (
          <div className="mst-dist-row" key={r.name}>
            <div className="mst-dist-top"><span>{r.name}</span><b>{fmt(r.val)}</b></div>
            <div className="mst-dist-track">
              <div className="mst-dist-fill" style={{ width: `${r.val > 0 ? Math.max(pct(r.val, ptsAll), 3) : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      {timeRange === "season" && (
        <p className="mst-note">Los puntos de ligas y premios no suman al ranking global.</p>
      )}

      {/* ── Pronósticos especiales ── */}
      <h2 className="mst-h2">Pronósticos Especiales</h2>
      <div className="mst-duo">
        <div className="mst-card mst-fc">
          <div className="mst-tile"><Trophy size={22} strokeWidth={1.8} /></div>
          <div><b>{fmt(stats.leaguePredictions)}</b><span>ligas pred.</span></div>
        </div>
        <div className="mst-card mst-fc">
          <div className="mst-tile"><Award size={22} strokeWidth={1.8} /></div>
          <div><b>{fmt(stats.awardPredictions)}</b><span>premios pred.</span></div>
        </div>
      </div>
      {!hasMatches && <p className="mst-caption mst-caption--foot">Aún no hay partidos finalizados en este rango.</p>}
    </div>
  );
}
