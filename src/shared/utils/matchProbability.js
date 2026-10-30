export const hasMatchProbability = (match) =>
  match.status !== 'finished' &&
  [match.prob_home, match.prob_draw, match.prob_away].every(Number.isFinite);

export const getProbabilityTrend = (match) => {
  const homeLeads = match.prob_home >= match.prob_away;
  return {
    home: homeLeads ? 'up' : 'down',
    away: homeLeads ? 'down' : 'up',
  };
};
