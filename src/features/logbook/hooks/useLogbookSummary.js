import { useState, useEffect, useMemo } from 'react';
import * as service from '../services';
import {
  getTeamStats,
  getTopScorer,
  pickActiveTeam,
  readActiveTeamId,
} from '../utils/logbook.utils';

export function useLogbookSummary(currentUser) {
  const userId = currentUser?.id;
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    setLoading(true);
    service
      .fetchTeams(userId)
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return useMemo(() => {
    const team = pickActiveTeam(teams, readActiveTeamId());
    return {
      loading,
      teamsCount: teams.length,
      team: team
        ? {
            id: team.id,
            name: team.name,
            game: team.game,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            ...getTeamStats(team),
          }
        : null,
      topScorer: team ? getTopScorer(team) : null,
    };
  }, [teams, loading]);
}
