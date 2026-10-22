import { useState, useEffect, useCallback, useRef } from 'react';
import * as service from '../services';
import {
  DEFAULT_POSITION,
  getTeamStats,
  isMigrated,
  markMigrated,
  pickActiveTeam,
  readActiveTeamId,
  readLegacyLogbook,
  writeActiveTeamId,
} from '../utils/logbook.utils';

const TEAM_COUNTERS = ['wins', 'draws', 'losses', 'goalsAgainst', 'opponentOwnGoals'];
const PLAYER_COUNTERS = ['goals', 'assists', 'mvp'];

export function useLogbook(currentUser) {
  const userId = currentUser?.id;
  const [teams, setTeams] = useState([]);
  const [activeId, setActiveId] = useState(readActiveTeamId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const teamsRef = useRef([]);

  const commit = useCallback((next) => {
    teamsRef.current = next;
    setTeams(next);
  }, []);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      let data = await service.fetchTeams(userId);
      if (!isMigrated(userId)) {
        const legacy = data.length ? [] : readLegacyLogbook();
        if (legacy.length) {
          await service.importTeams(userId, legacy);
          data = await service.fetchTeams(userId);
        }
        markMigrated(userId);
      }
      commit(data);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los equipos');
    } finally {
      setLoading(false);
    }
  }, [userId, commit]);

  useEffect(() => {
    load();
  }, [load]);

  const activeTeam = pickActiveTeam(teams, activeId);
  const activeTeamId = activeTeam?.id ?? null;

  useEffect(() => {
    if (activeTeamId) writeActiveTeamId(activeTeamId);
  }, [activeTeamId]);

  const getActive = useCallback(
    () => pickActiveTeam(teamsRef.current, activeId),
    [activeId]
  );

  const run = useCallback(
    async (transform, request) => {
      const snapshot = teamsRef.current;
      commit(transform(snapshot));
      setError(null);
      try {
        await request();
      } catch (e) {
        console.error(e);
        commit(snapshot);
        setError('No se pudieron guardar los cambios');
      }
    },
    [commit]
  );

  const selectTeam = useCallback((teamId) => {
    setActiveId(teamId);
    writeActiveTeamId(teamId);
  }, []);

  const createTeam = useCallback(
    async (values = {}) => {
      if (!userId) return null;
      const count = teamsRef.current.length;
      const name = values.name ?? (count ? `Equipo ${count + 1}` : 'Mi equipo');
      setError(null);
      try {
        const team = await service.createTeam(userId, { ...values, name });
        commit([...teamsRef.current, team]);
        selectTeam(team.id);
        return team;
      } catch (e) {
        console.error(e);
        setError('No se pudo crear el equipo');
        return null;
      }
    },
    [userId, commit, selectTeam]
  );

  const removeTeam = useCallback(
    async (teamId) => {
      const id = teamId ?? getActive()?.id;
      if (!id) return;
      await run(
        (list) => list.filter((team) => team.id !== id),
        () => service.deleteTeam(id)
      );
    },
    [getActive, run]
  );

  const updateTeamInfo = useCallback(
    async (patch) => {
      const team = getActive();
      if (!team) return;
      const next = { ...patch };
      if ('name' in next) next.name = next.name.trim().slice(0, 30) || 'Mi equipo';
      await run(
        (list) => list.map((item) => (item.id === team.id ? { ...item, ...next } : item)),
        () => service.updateTeam(team.id, next)
      );
    },
    [getActive, run]
  );

  const adjustTeamCounter = useCallback(
    async (key, delta) => {
      if (!TEAM_COUNTERS.includes(key)) return;
      const team = getActive();
      if (!team) return;
      const value = Math.max(0, team[key] + delta);
      if (value === team[key]) return;
      await run(
        (list) => list.map((item) => (item.id === team.id ? { ...item, [key]: value } : item)),
        () => service.updateTeam(team.id, { [key]: value })
      );
    },
    [getActive, run]
  );

  const adjustPlayerCounter = useCallback(
    async (playerId, key, delta) => {
      if (!PLAYER_COUNTERS.includes(key)) return;
      const team = getActive();
      const player = team?.players.find((item) => item.id === playerId);
      if (!player) return;
      const value = Math.max(0, player[key] + delta);
      if (value === player[key]) return;
      await run(
        (list) =>
          list.map((item) =>
            item.id === team.id
              ? {
                  ...item,
                  players: item.players.map((p) => (p.id === playerId ? { ...p, [key]: value } : p)),
                }
              : item
          ),
        () => service.updatePlayer(playerId, { [key]: value })
      );
    },
    [getActive, run]
  );

  const addPlayer = useCallback(
    async ({ name, position = DEFAULT_POSITION }) => {
      const team = getActive();
      const cleanName = name?.trim().slice(0, 24);
      if (!team || !cleanName) return null;
      setError(null);
      try {
        const player = await service.addPlayer(team.id, { name: cleanName, position });
        commit(
          teamsRef.current.map((item) =>
            item.id === team.id ? { ...item, players: [...item.players, player] } : item
          )
        );
        return player;
      } catch (e) {
        console.error(e);
        setError('No se pudo añadir el jugador');
        return null;
      }
    },
    [getActive, commit]
  );

  const removePlayer = useCallback(
    async (playerId) => {
      const team = getActive();
      const player = team?.players.find((item) => item.id === playerId);
      if (!player) return;
      await run(
        (list) =>
          list.map((item) =>
            item.id === team.id
              ? {
                  ...item,
                  archivedGoals: item.archivedGoals + player.goals,
                  players: item.players.filter((p) => p.id !== playerId),
                }
              : item
          ),
        () => service.deletePlayer(playerId)
      );
    },
    [getActive, run]
  );

  return {
    teams,
    activeTeam,
    stats: activeTeam ? getTeamStats(activeTeam) : null,
    loading,
    error,
    reload: load,
    selectTeam,
    createTeam,
    removeTeam,
    updateTeamInfo,
    adjustTeamCounter,
    adjustPlayerCounter,
    addPlayer,
    removePlayer,
  };
}
