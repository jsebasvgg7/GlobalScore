export const ACTIVE_TEAM_KEY = 'libreta-active-team';

export const LEGACY_KEY = 'libreta-futbolera-v1';

export const MIGRATED_KEY_PREFIX = 'libreta-migrated:';

export const GAMES = ['FIFA', 'EA FC', 'PES', 'eFootball', 'Otro'];

export const FORMATIONS = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2', '4-1-4-1', '3-4-3', '4-5-1'];

export const POSITIONS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

export const DEFAULT_POSITION = 'Delantero';

export function readActiveTeamId() {
  try {
    return localStorage.getItem(ACTIVE_TEAM_KEY);
  } catch {
    return null;
  }
}

export function writeActiveTeamId(teamId) {
  try {
    localStorage.setItem(ACTIVE_TEAM_KEY, teamId);
  } catch {
    return;
  }
}

export function pickActiveTeam(teams, activeId) {
  return teams.find((team) => team.id === activeId) ?? teams[0] ?? null;
}

export function getTeamStats(team) {
  const goalsFor =
    team.players.reduce((sum, player) => sum + player.goals, 0) +
    team.opponentOwnGoals +
    team.archivedGoals;

  return {
    goalsFor,
    played: team.wins + team.draws + team.losses,
    goalDiff: goalsFor - team.goalsAgainst,
  };
}

export function getTopScorer(team) {
  const best = team.players.reduce(
    (top, player) => (player.goals > (top?.goals ?? 0) ? player : top),
    null
  );

  return best ? { name: best.name, goals: best.goals } : null;
}

function toCount(value) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function pickAllowed(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizePlayer(raw) {
  const name = String(raw?.name ?? '').trim().slice(0, 24);
  if (!name) return null;
  return {
    name,
    position: pickAllowed(raw.pos, POSITIONS, DEFAULT_POSITION),
    goals: toCount(raw.g),
    assists: toCount(raw.a),
    mvp: toCount(raw.mvp),
  };
}

function normalizeTeam(raw) {
  return {
    name: String(raw?.name ?? '').trim().slice(0, 30) || 'Mi equipo',
    game: pickAllowed(raw?.game, GAMES, 'Otro'),
    formation: pickAllowed(raw?.formation, FORMATIONS, FORMATIONS[0]),
    wins: toCount(raw?.gan),
    draws: toCount(raw?.emp),
    losses: toCount(raw?.per),
    goalsAgainst: toCount(raw?.gc),
    opponentOwnGoals: toCount(raw?.rival),
    archivedGoals: toCount(raw?.archived),
    players: (Array.isArray(raw?.players) ? raw.players : []).map(normalizePlayer).filter(Boolean),
  };
}

function isPristine(team) {
  return (
    team.name === 'Mi equipo' &&
    team.players.length === 0 &&
    [
      team.wins,
      team.draws,
      team.losses,
      team.goalsAgainst,
      team.opponentOwnGoals,
      team.archivedGoals,
    ].every((value) => value === 0)
  );
}

export function readLegacyLogbook() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.teams)) return [];
    return data.teams.map(normalizeTeam).filter((team) => !isPristine(team));
  } catch {
    return [];
  }
}

export function isMigrated(userId) {
  try {
    return localStorage.getItem(MIGRATED_KEY_PREFIX + userId) === '1';
  } catch {
    return false;
  }
}

export function markMigrated(userId) {
  try {
    localStorage.setItem(MIGRATED_KEY_PREFIX + userId, '1');
  } catch {
    return;
  }
}
