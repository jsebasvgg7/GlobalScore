import { useState, useCallback, useMemo, useRef } from 'react';
import * as service from '../services';
import { compareTeams } from '../utils/room.utils';

const COMPARABLE_STATUSES = ['active', 'finished'];

const messageOf = (e, fallback) => e?.message || fallback;

export function useRoom(currentUser) {
  const userId = currentUser?.id;
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);

  const fetchRoom = useCallback(async (id) => {
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await service.getRoom(id);
      if (request === requestRef.current) setRoom(data);
      return data;
    } catch (e) {
      console.error(e);
      if (request === requestRef.current) setError(messageOf(e, 'No se pudo cargar la sala'));
      return null;
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, []);

  const act = useCallback(async (request, fallback) => {
    setLoading(true);
    setError(null);
    try {
      return await request();
    } catch (e) {
      console.error(e);
      setError(messageOf(e, fallback));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const open = useCallback(
    (id) => {
      setRoomId(id);
      return fetchRoom(id);
    },
    [fetchRoom]
  );

  const close = useCallback(() => {
    requestRef.current += 1;
    setRoomId(null);
    setRoom(null);
    setError(null);
  }, []);

  const refresh = useCallback(
    () => (roomId ? fetchRoom(roomId) : Promise.resolve(null)),
    [roomId, fetchRoom]
  );

  const loadList = useCallback(async () => {
    const data = await act(() => service.listRooms(), 'No se pudieron cargar las salas');
    if (data) setRooms(data);
    return data;
  }, [act]);

  const create = useCallback(
    async (teamId, fromZero = false) => {
      const result = await act(
        () => service.createRoom(teamId, fromZero),
        'No se pudo crear la sala'
      );
      if (!result) return null;
      await open(result.roomId);
      return result;
    },
    [act, open]
  );

  const join = useCallback(
    async (code, teamId) => {
      const result = await act(() => service.joinRoom(code, teamId), 'No se pudo entrar a la sala');
      if (!result) return null;
      await open(result.roomId);
      return result;
    },
    [act, open]
  );

  const cancel = useCallback(async () => {
    if (!roomId) return false;
    const done = await act(async () => {
      await service.cancelRoom(roomId);
      return true;
    }, 'No se pudo cancelar la sala');
    if (!done) return false;
    await fetchRoom(roomId);
    return true;
  }, [roomId, act, fetchRoom]);

  const members = room?.members ?? [];
  const me = members.find((member) => member.userId === userId) ?? null;
  const rival = members.find((member) => member.userId !== userId) ?? null;

  const comparison = useMemo(() => {
    if (!room || !COMPARABLE_STATUSES.includes(room.status)) return null;
    const [first, second] = room.members;
    if (!first?.team || !second?.team) return null;
    return compareTeams(first.team, second.team);
  }, [room]);

  const standings = useMemo(() => {
    if (!comparison) return [];
    const entries = [
      { side: 'a', member: room.members[0], points: comparison.points.a },
      { side: 'b', member: room.members[1], points: comparison.points.b },
    ];
    return comparison.points.b > comparison.points.a ? [entries[1], entries[0]] : entries;
  }, [room, comparison]);

  return {
    room,
    rooms,
    me,
    rival,
    comparison,
    standings,
    loading,
    error,
    open,
    close,
    refresh,
    loadList,
    create,
    join,
    cancel,
    clearError: () => setError(null),
  };
}
