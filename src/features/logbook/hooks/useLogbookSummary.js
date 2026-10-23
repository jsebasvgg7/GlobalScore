import { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    service
      .fetchTeams(userId)
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return useMemo(() => {
    const team = pickActiveTeam(teams, readActiveTeamId());
    return {
      loading,
      error,
      reload,
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
  }, [teams, loading, error, reload]);
}
