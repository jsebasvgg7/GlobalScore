export const ACTIVE_TEAM_KEY = 'libreta-active-team';

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
