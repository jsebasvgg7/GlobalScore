import { getTeamStats } from './logbook.utils';

const TEAM_COUNT_KEYS = ['wins', 'draws', 'losses', 'goalsAgainst', 'opponentOwnGoals', 'archivedGoals'];

const NUMERIC_RULES = [
  ['wins', true],
  ['losses', false],
  ['winRate', true],
  ['goalsFor', true],
  ['goalsAgainst', false],
  ['goalDiff', true],
];

const PLAYER_RULES = {
  scorer: { value: 'goals', tiebreak: 'assists' },
  assister: { value: 'assists', tiebreak: 'goals' },
  mvp: { value: 'mvp', tiebreak: 'goals' },
};

export function isTeamEmpty(team) {
  if (!team) return false;
  const players = team.players ?? [];
  return (
    TEAM_COUNT_KEYS.every((key) => !team[key]) &&
    players.every((player) => !player.goals && !player.assists && !player.mvp)
  );
}

function getMetrics(team) {
  const { goalsFor, played, goalDiff } = getTeamStats(team);
  return {
    played,
    draws: team.draws,
    wins: team.wins,
    losses: team.losses,
    winRate: played > 0 ? Math.round((team.wins / played) * 100) : 0,
    goalsFor,
    goalsAgainst: team.goalsAgainst,
    goalDiff,
  };
}

function duel(a, b, higherWins = true) {
  if (a === b) return 'tie';
  return a > b === higherWins ? 'a' : 'b';
}

function bestPlayer(players, { value, tiebreak }) {
  const [best] = [...(players ?? [])].sort(
    (x, y) => y[value] - x[value] || y[tiebreak] - x[tiebreak] || x.name.localeCompare(y.name)
  );
  return best ? { name: best.name, value: best[value] } : { name: null, value: 0 };
}

export function compareTeams(a, b) {
  const metricsA = getMetrics(a);
  const metricsB = getMetrics(b);
  const stats = {};

  NUMERIC_RULES.forEach(([key, higherWins]) => {
    stats[key] = {
      a: metricsA[key],
      b: metricsB[key],
      winner: duel(metricsA[key], metricsB[key], higherWins),
    };
  });

  Object.entries(PLAYER_RULES).forEach(([key, rule]) => {
    const playerA = bestPlayer(a.players, rule);
    const playerB = bestPlayer(b.players, rule);
    stats[key] = { a: playerA, b: playerB, winner: duel(playerA.value, playerB.value) };
  });

  const winners = Object.values(stats).map((stat) => stat.winner);
  const points = {
    a: winners.filter((side) => side === 'a').length,
    b: winners.filter((side) => side === 'b').length,
  };

  return {
    points,
    winner: duel(points.a, points.b),
    info: {
      played: { a: metricsA.played, b: metricsB.played },
      draws: { a: metricsA.draws, b: metricsB.draws },
    },
    stats,
  };
}
