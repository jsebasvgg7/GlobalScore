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
const SAVE_DELAY_MS = 350;
const SAVE_ERROR = 'No se pudieron guardar los cambios';

const patchTeam = (list, teamId, patch) =>
  list.map((team) => (team.id === teamId ? { ...team, ...patch } : team));

const patchPlayer = (list, teamId, playerId, patch) =>
  list.map((team) =>
    team.id === teamId
      ? {
          ...team,
          players: team.players.map((player) =>
            player.id === playerId ? { ...player, ...patch } : player
          ),
        }
      : team
  );

export function useLogbook(currentUser) {
  const userId = currentUser?.id;
  const [teams, setTeams] = useState([]);
  const [activeId, setActiveId] = useState(readActiveTeamId);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const teamsRef = useRef([]);
  const queueRef = useRef(new Map());

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
          await service.importTeams(legacy);
          data = await service.fetchTeams(userId);
        }
        markMigrated(userId);
      }
      queueRef.current.clear();
      commit(data);
      setLoaded(true);
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
        return true;
      } catch (e) {
        console.error(e);
        commit(snapshot);
        setError(SAVE_ERROR);
        return false;
      }
    },
    [commit]
  );

  const flushEntry = useCallback(
    (entry) => {
      clearTimeout(entry.timer);
      const job = entry.pending;
      if (!job) return;
      entry.pending = null;
      entry.chain = entry.chain.then(async () => {
        try {
          await job.request(job.value);
          entry.confirmed = job.value;
        } catch (e) {
          console.error(e);
          commit(job.apply(teamsRef.current, entry.confirmed));
          setError(SAVE_ERROR);
        }
      });
    },
    [commit]
  );

  const settle = useCallback(
    async (prefix) => {
      const entries = [...queueRef.current.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([, entry]) => entry);
      entries.forEach(flushEntry);
      await Promise.all(entries.map((entry) => entry.chain));
    },
    [flushEntry]
  );

  const queueChange = useCallback(
    (key, current, value, apply, request) => {
      let entry = queueRef.current.get(key);
      if (!entry) {
        entry = { confirmed: current, timer: null, chain: Promise.resolve(), pending: null };
        queueRef.current.set(key, entry);
      }
      setError(null);
      commit(apply(teamsRef.current, value));
      entry.pending = { value, apply, request };
      clearTimeout(entry.timer);
      entry.timer = setTimeout(() => flushEntry(entry), SAVE_DELAY_MS);
    },
    [commit, flushEntry]
  );

  useEffect(() => {
    const queue = queueRef.current;
    const flushAll = () => queue.forEach(flushEntry);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushAll();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flushAll);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flushAll);
      flushAll();
    };
  }, [flushEntry]);

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
      if (!id) return false;
      return run(
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
        (list) => patchTeam(list, team.id, next),
        () => service.updateTeam(team.id, next)
      );
    },
    [getActive, run]
  );

  const adjustTeamCounter = useCallback(
    (key, delta) => {
      if (!TEAM_COUNTERS.includes(key)) return;
      const team = getActive();
      if (!team) return;
      const current = team[key];
      const value = Math.max(0, current + delta);
      if (value === current) return;
      queueChange(
        `team:${team.id}:${key}`,
        current,
        value,
        (list, next) => patchTeam(list, team.id, { [key]: next }),
        (next) => service.updateTeam(team.id, { [key]: next })
      );
    },
    [getActive, queueChange]
  );

  const adjustPlayerCounter = useCallback(
    (playerId, key, delta) => {
      if (!PLAYER_COUNTERS.includes(key)) return;
      const team = getActive();
      const player = team?.players.find((item) => item.id === playerId);
      if (!player) return;
      const current = player[key];
      const value = Math.max(0, current + delta);
      if (value === current) return;
      queueChange(
        `player:${playerId}:${key}`,
        current,
        value,
        (list, next) => patchPlayer(list, team.id, playerId, { [key]: next }),
        (next) => service.updatePlayer(playerId, { [key]: next })
      );
    },
    [getActive, queueChange]
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
      await settle(`player:${playerId}:`);
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
    [getActive, run, settle]
  );

  return {
    teams,
    activeTeam,
    stats: activeTeam ? getTeamStats(activeTeam) : null,
    loading,
    loaded,
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
