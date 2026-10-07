import React, { useState, useEffect, useMemo } from 'react';
import {
  Target, CheckCircle2, XCircle, Star,
  Trophy, Award, Calendar, Zap, Activity,
} from 'lucide-react';
import {
  fetchAllPredictions, fetchSpecialPredictions, fetchUserCounters, processStats, STATS_RANGES,
} from '@/features/stats/services/stats.service';
import StatsRightPanel from '@/features/stats/components/StatsRightPanel';
import MobileStats from '@/features/stats/components/mobile/MobileStats';
import { GlobalLoader } from "@/shared/ui";
import './StatsPage.css';

const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

/* ── Icono cuadrado de hero ── */
function HeroIcon({ color, children }) {
  return (
    <div
      className="sp-hero-icon"
      style={{ background: color, color: '#fff' }}
    >
      {children}
    </div>
  );
}

export default function StatsPage({ currentUser }) {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('season');

  /* Se descarga todo una sola vez; el cambio de rango se calcula en memoria. */
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [predictions, special, counters] = await Promise.all([
          fetchAllPredictions(currentUser.id),
          fetchSpecialPredictions(currentUser.id),
          fetchUserCounters(currentUser.id),
        ]);
        if (!cancelled) setRaw({ predictions, counters, ...special });
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser]);

  const stats = useMemo(
    () => (raw ? processStats(raw.predictions, raw.leaguePreds, raw.awardPreds, timeRange, raw.counters) : null),
    [raw, timeRange]
  );

  /* ────────────────────────────────────────────────────────────
     RENDER — LOADING
  ──────────────────────────────────────────────────────────── */
  if (loading) {
    return <GlobalLoader variant="page" />;
  }

  if (!stats) {
    return (
      <>
        <MobileStats stats={null} loading={false} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div className="sp-shell">
          <div className="sp-empty">
            <div className="sp-empty-icon">📊</div>
            <div className="sp-empty-title">Sin estadísticas</div>
            <div className="sp-empty-sub">Empieza a hacer predicciones para ver tus datos</div>
          </div>
        </div>
      </>
    );
  }

  /* ────────────────────────────────────────────────────────────
     RENDER — MAIN
  ──────────────────────────────────────────────────────────── */
  const totalFinished = stats.totalPredictions;

  return (
    <>
      {/* ══ VISTA MOBILE (solo ≤768px) ══ */}
      <MobileStats
        stats={stats}
        loading={false}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {/* ══ VISTA DESKTOP (solo >768px) ══ */}
      <div className="sp-shell">
        <div className="sp-desktop">

          {/* ── MAIN ── */}
          <div className="sp-main">

            {/* Topbar interno: título + selector de rango */}
            <div className="sp-topbar">
              <div className="sp-topbar-title">
                <span className="sp-topbar-dot" />
                Estadísticas
              </div>
              <div className="sp-range-pills">
                {STATS_RANGES.map(({ key, label }) => (
                  <button
                    key={key}
                    className={`sp-range-pill${timeRange === key ? ' active' : ''}`}
                    onClick={() => setTimeRange(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Área scrollable */}
            <div className="sp-scroll">

              {/* ── HERO 4 MÉTRICAS ── */}
              <div className="sp-hero">
                <div className="sp-hero-block">
                  <HeroIcon color="#5b4fd8"><Target size={15} /></HeroIcon>
                  <div className="sp-hero-lbl">Precisión</div>
                  <div className="sp-hero-num sp-hero-num--accent">{stats.accuracy}%</div>
                  <div className="sp-hero-sub">{fmt(totalFinished)} pred. finalizadas</div>
                </div>

                <div className="sp-hero-block">
                  <HeroIcon color="#1D9E75"><Star size={15} /></HeroIcon>
                  <div className="sp-hero-lbl">Exactos</div>
                  <div className="sp-hero-num sp-hero-num--green">{fmt(stats.exact)}</div>
                  <div className="sp-hero-sub">{stats.exactAccuracy}% exactitud</div>
                </div>

                <div className="sp-hero-block">
                  <HeroIcon color="#b45309"><CheckCircle2 size={15} /></HeroIcon>
                  <div className="sp-hero-lbl">Correctos</div>
                  <div className="sp-hero-num sp-hero-num--amber">{fmt(stats.correctResult)}</div>
                  <div className="sp-hero-sub">+3 pts c/u</div>
                </div>

                <div className="sp-hero-block">
                  <HeroIcon color="#c9a227"><Zap size={15} /></HeroIcon>
                  <div className="sp-hero-lbl">Puntos ganados</div>
                  <div className="sp-hero-num" style={{ color: '#c9a227' }}>{fmt(stats.pointsFromMatches)}</div>
                  <div className="sp-hero-sub">de partidos</div>
                </div>
              </div>

              {/* ── DESGLOSE ── */}
              <div className="sp-section">
                <div className="sp-section-hdr">
                  <span className="sp-section-dot" style={{ background: '#5b4fd8' }} />
                  <span className="sp-section-title">Desglose de resultados</span>
                </div>
                <div className="sp-results">

                  {/* Exactos */}
                  <div className="sp-result-item">
                    <div className="sp-result-top">
                      <div className="sp-result-num" style={{ color: '#c9a227' }}>{fmt(stats.exact)}</div>
                      <div className="sp-result-pts">+{fmt(stats.exact * 5)} pts</div>
                    </div>
                    <div className="sp-result-name">Exactos</div>
                    <div className="sp-result-bar-wrap">
                      <div
                        className="sp-result-bar"
                        style={{
                          width: `${totalFinished > 0 ? Math.round((stats.exact / totalFinished) * 100) : 0}%`,
                          background: '#c9a227',
                        }}
                      />
                    </div>
                  </div>

                  {/* Correctos */}
                  <div className="sp-result-item">
                    <div className="sp-result-top">
                      <div className="sp-result-num" style={{ color: '#1D9E75' }}>{fmt(stats.correctResult)}</div>
                      <div className="sp-result-pts">+{fmt(stats.correctResult * 3)} pts</div>
                    </div>
                    <div className="sp-result-name">Correctos</div>
                    <div className="sp-result-bar-wrap">
                      <div
                        className="sp-result-bar"
                        style={{
                          width: `${totalFinished > 0 ? Math.round((stats.correctResult / totalFinished) * 100) : 0}%`,
                          background: '#1D9E75',
                        }}
                      />
                    </div>
                  </div>

                  {/* Incorrectos */}
                  <div className="sp-result-item">
                    <div className="sp-result-top">
                      <div className="sp-result-num" style={{ color: '#c0392b' }}>{fmt(stats.wrong)}</div>
                      <div className="sp-result-pts sp-result-pts--red">0 pts</div>
                    </div>
                    <div className="sp-result-name">Incorrectos</div>
                    <div className="sp-result-bar-wrap">
                      <div
                        className="sp-result-bar"
                        style={{
                          width: `${totalFinished > 0 ? Math.round((stats.wrong / totalFinished) * 100) : 0}%`,
                          background: '#c0392b',
                        }}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* ── RENDIMIENTO POR LIGA ── */}
              {stats.leagueStats.length > 0 && (
                <div className="sp-section">
                  <div className="sp-section-hdr">
                    <span className="sp-section-dot" style={{ background: '#c9a227' }} />
                    <span className="sp-section-title">Rendimiento por liga</span>
                  </div>

                  {/* Thead */}
                  <div className="sp-league-thead">
                    <div />
                    <div className="sp-lc" style={{ textAlign: 'left' }}>Liga</div>
                    <div className="sp-lc">Pts</div>
                    <div className="sp-lc">Precisión</div>
                    <div className="sp-lc sp-lc--exact-col">Exactos</div>
                  </div>

                  {/* Rows */}
                  {stats.leagueStats.map((league, i) => {
                    const badgeMod = i < 3 ? ` sp-rank-badge--${i + 1}` : '';
                    return (
                      <div className="sp-league-row" key={league.name}>
                        <div className={`sp-rank-badge${badgeMod}`}>{i + 1}</div>
                        <div className="sp-league-name">{league.name}</div>
                        <div className="sp-lc sp-lc--pts">{fmt(league.points)}</div>
                        <div className="sp-lc">
                          <div className="sp-acc-inline">
                            <div className="sp-acc-bar">
                              <div className="sp-acc-fill" style={{ width: `${league.accuracy}%` }} />
                            </div>
                            <span className="sp-acc-pct">{league.accuracy}%</span>
                          </div>
                        </div>
                        <div className="sp-lc sp-lc--exact sp-lc--exact-col">{fmt(league.exact)}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── RENDIMIENTO POR DÍA ── */}
              <div className="sp-section">
                <div className="sp-section-hdr">
                  <span className="sp-section-dot" style={{ background: '#1D9E75' }} />
                  <span className="sp-section-title">Rendimiento por día</span>
                </div>
                <div className="sp-days">
                  {stats.dayStats.map((day) => {
                    const pct = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
                    /* Opacidad basada en porcentaje para efecto visual */
                    const opacity = day.total > 0 ? 0.35 + (pct / 100) * 0.65 : 0.15;
                    return (
                      <div className="sp-day" key={day.name}>
                        <div className="sp-day-lbl">{day.name}</div>
                        <div className="sp-day-pct">{pct}%</div>
                        <div className="sp-day-bar-wrap">
                          <div
                            className="sp-day-fill"
                            style={{ height: `${pct}%`, opacity }}
                          />
                        </div>
                        <div className="sp-day-detail">{day.correct}/{day.total}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ══ PANEL DERECHO ══ */}
          <StatsRightPanel stats={stats} currentUser={currentUser} />
        </div>
      </div>
    </>
  );
}