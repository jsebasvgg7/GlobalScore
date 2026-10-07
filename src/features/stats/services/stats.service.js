import { supabase } from '@/shared/services/supabase/client';

/* ════════════════════════════════════════════════════════════
   STATS SERVICE
   Fuente de verdad: tabla predictions (result_type, points_earned,
   advancing_points ya calculados por el admin al finalizar).
   ════════════════════════════════════════════════════════════ */

/* Solo es respaldo si no se pueden leer los contadores del usuario. Normalmente
   la ventana de Global/Mes se deduce de season_predictions / monthly_predictions
   (los mismos contadores que usa el ranking). */
export const SEASON_START = '2026-10-04';

export const STATS_RANGES = [
  { key: 'season', label: 'Global' },
  { key: 'month', label: 'Mes' },
  { key: 'all', label: 'Histórico' },
];

const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/* ── Fetch paginado ──
   PostgREST corta en silencio a 1000 filas; se pagina con .range(). */
export const fetchAllPredictions = async (userId) => {
  const pageSize = 1000;
  let from = 0;
  let all = [];

  while (true) {
    const { data, error } = await supabase
      .from('predictions')
      .select('*, matches(id,league,league_logo_url,home_team,away_team,result_home,result_away,status,date)')
      .eq('user_id', userId)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;

    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
};

/* Contadores que usa el ranking (tabla users) */
export const fetchUserCounters = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('season_points, season_predictions, season_correct, monthly_points, monthly_predictions, monthly_correct')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
};

export const fetchSpecialPredictions = async (userId) => {
  const [lp, ap] = await Promise.all([
    supabase.from('league_predictions').select('*, leagues(*)').eq('user_id', userId),
    supabase.from('award_predictions').select('*, awards(*)').eq('user_id', userId),
  ]);
  return { leaguePreds: lp.data || [], awardPreds: ap.data || [] };
};

/* ── Rango de fechas (YYYY-MM-DD, inclusivo) ── */
export const getRangeBounds = (range, now = new Date()) => {
  if (range === 'season') return { from: SEASON_START, to: null };
  if (range === 'month') {
    const y = now.getFullYear();
    const m = now.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(last)}` };
  }
  return { from: null, to: null };
};

const longDate = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
};

export const getRangeCaption = (range, windowFrom, now = new Date()) => {
  if (range === 'month') return `${MONTHS[now.getMonth()]} ${now.getFullYear()} · ranking mensual`;
  if (range === 'season') return windowFrom ? `temporada actual · desde el ${longDate(windowFrom)}` : 'temporada actual · ranking global';
  return 'todas las temporadas';
};

const inRange = (dateStr, { from, to }) => {
  if (!dateStr) return false;
  const d = String(dateStr).slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
};

/* matches.date es texto 'YYYY-MM-DD'. new Date('YYYY-MM-DD') lo toma como UTC
   y en zonas UTC-5 cae el día anterior; se construye la fecha en local. */
const localDay = (dateStr) => {
  const [y, m, d] = String(dateStr).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

/* Normaliza nombres de liga: "Club friendly\n", "FA cup", "Champions League FINAL"… */
const normalizeLeagueName = (raw) => {
  let name = String(raw || '').replace(/\s+/g, ' ').trim();
  name = name.replace(/\s*[-–—]?\s*\(?\s*final\s*\)?\s*$/i, '').trim();
  if (/^elf cup$/i.test(name)) name = 'EFL Cup';
  return name;
};

/* ── Proceso principal ──
   Global (season) y Mes usan los mismos contadores que el ranking
   (users.season_* / users.monthly_*) para puntos, predicciones y aciertos.
   El detalle (exactos, ligas, días) sale de las predicciones: se toman las
   N más recientes ya puntuadas, con N = contador de predicciones del ranking.
   Histórico se calcula solo con las predicciones. */
export const processStats = (predictions, leaguePreds, awardPreds, range = 'season', counters = null) => {
  const byRecent = (a, b) =>
    String(b.matches.date).localeCompare(String(a.matches.date)) ||
    String(b.created_at).localeCompare(String(a.created_at));

  const finishedAll = predictions
    .filter((p) => p.matches?.status === 'finished' && p.result_type != null)
    .sort(byRecent);

  const useCounters = range !== 'all' && counters != null;
  const prefix = range === 'month' ? 'monthly' : 'season';
  const cPreds = useCounters ? counters[`${prefix}_predictions`] || 0 : 0;
  const cCorrect = useCounters ? counters[`${prefix}_correct`] || 0 : 0;
  const cPoints = useCounters ? counters[`${prefix}_points`] || 0 : 0;

  let finished;
  if (range === 'all') {
    finished = finishedAll;
  } else if (useCounters) {
    finished = finishedAll.slice(0, cPreds);
    if (range === 'month') {
      const { from } = getRangeBounds('month');
      finished = finished.filter((p) => inRange(p.matches.date, { from, to: null }));
    }
  } else {
    const bounds = getRangeBounds(range);
    finished = finishedAll.filter((p) => inRange(p.matches?.date, bounds));
  }

  const windowFrom = finished.length ? finished[finished.length - 1].matches.date.slice(0, 10) : null;

  const inCreated = (row) => range === 'all' || (windowFrom ? String(row.created_at).slice(0, 10) >= windowFrom : false);
  const leagueScoped = (leaguePreds || []).filter(inCreated);
  const awardScoped = (awardPreds || []).filter(inCreated);

  let exact = 0, correctResult = 0, wrong = 0, totalPoints = 0, advancingPoints = 0, correctAdvancing = 0;

  finished.forEach((pred) => {
    if (pred.result_type === 'exact') exact++;
    else if (pred.result_type === 'result') correctResult++;
    else wrong++;

    totalPoints += pred.points_earned || 0;
    if (pred.advancing_points > 0) {
      advancingPoints += pred.advancing_points;
      correctAdvancing++;
    }
  });

  /* Por liga (nombres normalizados) */
  const leagueMap = {};
  finished.forEach((pred) => {
    const raw = pred.matches?.league;
    if (!raw) return;
    const name = normalizeLeagueName(raw);
    const key = name.toLowerCase();
    if (!leagueMap[key]) leagueMap[key] = { names: {}, logo: null, total: 0, correct: 0, exact: 0, points: 0 };
    const l = leagueMap[key];
    l.names[name] = (l.names[name] || 0) + 1;
    if (!l.logo && pred.matches?.league_logo_url) l.logo = pred.matches.league_logo_url;
    l.total++;
    if (pred.result_type === 'exact') { l.exact++; l.correct++; }
    else if (pred.result_type === 'result') l.correct++;
    l.points += (pred.points_earned || 0) + (pred.advancing_points || 0);
  });

  const leagueList = Object.values(leagueMap).map((l) => ({
    name: Object.entries(l.names).sort((a, b) => b[1] - a[1])[0][0],
    logo: l.logo,
    total: l.total,
    correct: l.correct,
    exact: l.exact,
    points: l.points,
    accuracy: l.total > 0 ? Math.round((l.correct / l.total) * 100) : 0,
  }));

  /* Rachas */
  const sorted = [...finished].sort((a, b) =>
    String(b.matches.date).localeCompare(String(a.matches.date)) ||
    String(b.created_at).localeCompare(String(a.created_at)));
  let currentStreak = 0, bestStreak = 0, tempStreak = 0;
  sorted.forEach((pred, i) => {
    const ok = (pred.points_earned || 0) > 0;
    if (ok) { tempStreak++; if (i === 0) currentStreak = tempStreak; bestStreak = Math.max(bestStreak, tempStreak); }
    else { tempStreak = 0; if (i === 0) currentStreak = 0; }
  });

  /* Por día (índice 0 = domingo) */
  const dayStats = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((name) => ({ name, correct: 0, total: 0 }));
  finished.forEach((pred) => {
    const day = localDay(pred.matches.date);
    dayStats[day].total++;
    if ((pred.points_earned || 0) > 0) dayStats[day].correct++;
  });

  const leaguePoints = leagueScoped.reduce((s, lp) => s + (lp.points_earned || 0), 0);
  const awardPoints = awardScoped.reduce((s, ap) => s + (ap.points_earned || 0), 0);
  const rowsMatchPoints = totalPoints + advancingPoints;

  /* Cifras principales: contadores del ranking cuando existen */
  let headPreds = finished.length;
  let headCorrect = exact + correctResult;
  let headPoints = rowsMatchPoints + leaguePoints + awardPoints;
  let pointsFromMatches = rowsMatchPoints;
  if (useCounters) {
    headPreds = cPreds;
    headCorrect = cCorrect;
    headPoints = cPoints;
    /* season_points solo suma partidos; monthly_points también ligas y premios */
    pointsFromMatches = range === 'month' ? Math.max(cPoints - leaguePoints - awardPoints, 0) : cPoints;
    exact = Math.min(exact, headCorrect);
    correctResult = headCorrect - exact;
    wrong = Math.max(headPreds - headCorrect, 0);
  }

  return {
    range,
    totalPredictions: headPreds,
    pendingPredictions: predictions.length - finishedAll.length,
    windowFrom,
    fromRanking: useCounters,
    exact, correctResult, wrong, totalPoints,
    advancingPoints, correctAdvancing,
    accuracy: headPreds > 0 ? Math.round((headCorrect / headPreds) * 100) : 0,
    exactAccuracy: headPreds > 0 ? Math.round((exact / headPreds) * 100) : 0,
    currentStreak, bestStreak,
    /* desktop: top 5 por puntos */
    leagueStats: [...leagueList].sort((a, b) => b.points - a.points).slice(0, 5),
    /* mobile: top 6 por volumen de predicciones (línea de aciertos) */
    leagueChart: [...leagueList].sort((a, b) => b.total - a.total).slice(0, 6),
    /* Lun→Dom (desktop). Mobile lo reordena a Dom→Sáb */
    dayStats: [...dayStats.slice(1), dayStats[0]],
    leaguePredictions: leagueScoped.length,
    awardPredictions: awardScoped.length,
    leaguePoints, awardPoints,
    pointsFromMatches,
    pointsFromLeagues: leaguePoints,
    pointsFromAwards: awardPoints,
    totalPointsAll: headPoints,
  };
};
