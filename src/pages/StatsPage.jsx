import React, { useState, useEffect, useMemo } from 'react';
import {
  Target, CheckCircle2, XCircle, Star,
  Trophy, Award, Calendar, Zap, Activity,
  Import
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import StatsRightPanel from '../components/ComOthers/StatsRightPanel';
import MobileStats from '../components/ComMobile/MobileStats';
import Footer from '../components/ComOthers/Footer';
import GlobalLoader from "../components/ComOthers/GlobalLoader";
import '../styles/StylesPages/StatsPage.css';

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
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    if (currentUser) loadStats();
  }, [currentUser, timeRange]);

  /* ────────────────────────────────────────────────────────────
     DATA LOADING
  ──────────────────────────────────────────────────────────── */
  const loadStats = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let dateLimit = null;
      if (timeRange === 'week') {
        dateLimit = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (timeRange === 'month') {
        dateLimit = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      }

      let matchQuery = supabase
        .from('predictions')
        .select('*, matches(id,league,home_team,away_team,result_home,result_away,status,date)')
        .eq('user_id', currentUser.id);
      if (dateLimit) matchQuery = matchQuery.gte('created_at', dateLimit);

      const [
        { data: predictions },
        { data: leaguePredictions },
        { data: awardPredictions },
      ] = await Promise.all([
        matchQuery,
        supabase.from('league_predictions').select('*, leagues(*)').eq('user_id', currentUser.id),
        supabase.from('award_predictions').select('*, awards(*)').eq('user_id', currentUser.id),
      ]);

      setStats(processStats(predictions || [], leaguePredictions || [], awardPredictions || []));
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────────
     PROCESS
  ──────────────────────────────────────────────────────────── */
  const processStats = (predictions, leaguePreds, awardPreds) => {
    const finished = predictions.filter(p => p.matches?.status === 'finished');

    let exact = 0, correctResult = 0, wrong = 0, totalPoints = 0;

    finished.forEach(pred => {
      const m = pred.matches;
      const pd = Math.sign(pred.home_score - pred.away_score);
      const rd = Math.sign(m.result_home - m.result_away);
      if (pred.home_score === m.result_home && pred.away_score === m.result_away) {
        exact++; totalPoints += 5;
      } else if (pd === rd) {
        correctResult++; totalPoints += 3;
      } else {
        wrong++;
      }
    });

    /* Estadísticas por liga */
    const leagueMap = {};
    finished.forEach(pred => {
      const league = pred.matches?.league;
      if (!league) return;
      if (!leagueMap[league]) leagueMap[league] = { total: 0, correct: 0, exact: 0, points: 0 };
      const m = pred.matches;
      const pd = Math.sign(pred.home_score - pred.away_score);
      const rd = Math.sign(m.result_home - m.result_away);
      leagueMap[league].total++;
      if (pred.home_score === m.result_home && pred.away_score === m.result_away) {
        leagueMap[league].exact++; leagueMap[league].correct++; leagueMap[league].points += 5;
      } else if (pd === rd) {
        leagueMap[league].correct++; leagueMap[league].points += 3;
      }
    });

    /* Rachas */
    const sorted = [...finished].sort((a, b) => new Date(b.matches.date) - new Date(a.matches.date));
    let currentStreak = 0, bestStreak = 0, tempStreak = 0;
    sorted.forEach((pred, i) => {
      const m = pred.matches;
      const pd = Math.sign(pred.home_score - pred.away_score);
      const rd = Math.sign(m.result_home - m.result_away);
      const ok = pd === rd || (pred.home_score === m.result_home && pred.away_score === m.result_away);
      if (ok) { tempStreak++; if (i === 0) currentStreak = tempStreak; bestStreak = Math.max(bestStreak, tempStreak); }
      else { tempStreak = 0; if (i === 0) currentStreak = 0; }
    });

    /* Por día */
    const dayStats = [0,1,2,3,4,5,6].map(d => ({ name: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d], correct: 0, total: 0 }));
    finished.forEach(pred => {
      const day = new Date(pred.matches.date).getDay();
      dayStats[day].total++;
      const m = pred.matches;
      const pd = Math.sign(pred.home_score - pred.away_score);
      const rd = Math.sign(m.result_home - m.result_away);
      if (pd === rd || (pred.home_score === m.result_home && pred.away_score === m.result_away)) dayStats[day].correct++;
    });
    /* Ordenar Lun→Dom */
    const orderedDays = [...dayStats.slice(1), dayStats[0]];

    const leaguePoints = (leaguePreds || []).reduce((s, lp) => s + (lp.points_earned || 0), 0);
    const awardPoints  = (awardPreds  || []).reduce((s, ap) => s + (ap.points_earned || 0), 0);

    return {
      totalPredictions: finished.length,
      pendingPredictions: predictions.length - finished.length,
      exact, correctResult, wrong, totalPoints,
      accuracy: finished.length > 0 ? Math.round(((exact + correctResult) / finished.length) * 100) : 0,
      exactAccuracy: finished.length > 0 ? Math.round((exact / finished.length) * 100) : 0,
      currentStreak, bestStreak,
      leagueStats: Object.entries(leagueMap)
        .map(([name, s]) => ({ name, ...s, accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 5),
      dayStats: orderedDays,
      leaguePredictions: (leaguePreds || []).length,
      awardPredictions: (awardPreds  || []).length,
      leaguePoints, awardPoints,
      pointsFromMatches: totalPoints,
      pointsFromLeagues: leaguePoints,
      pointsFromAwards: awardPoints,
    };
  };

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
            {[
              { key: 'all',   label: 'Todo'  },
              { key: 'month', label: 'Mes'   },
              { key: 'week',  label: 'Semana'},
            ].map(({ key, label }) => (
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
              <div className="sp-hero-num" style={{ color: '#c9a227' }}>{fmt(stats.totalPoints)}</div>
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

          <Footer />
        </div>
        {/* /sp-scroll */}
      </div>
      {/* /sp-main */}

      {/* ══ PANEL DERECHO ══ */}
      <StatsRightPanel stats={stats} currentUser={currentUser} />

      </div>
      {/* /sp-desktop */}
      </div>
      {/* /sp-shell */}
    </>
  );
}