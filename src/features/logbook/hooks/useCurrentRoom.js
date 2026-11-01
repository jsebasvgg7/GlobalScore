import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as service from '../services';
import { isRoomOngoing, pickCurrentRoom } from '../utils/room.utils';

const ROOMS_PATH = '/libreta/salas';

export function useCurrentRoom() {
  const [rooms, setRooms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const aliveRef = useRef(true);

  const reload = useCallback(async () => {
    try {
      const data = await service.listRooms();
      if (aliveRef.current) setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (aliveRef.current) setLoaded(true);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    reload();
    return () => {
      aliveRef.current = false;
    };
  }, [reload]);

  const room = useMemo(() => pickCurrentRoom(rooms), [rooms]);
  const pinnedId = useMemo(
    () => rooms.find((item) => item.pinned && isRoomOngoing(item))?.id ?? null,
    [rooms]
  );

  return {
    room,
    path: room ? `${ROOMS_PATH}/${room.id}` : ROOMS_PATH,
    loading: !loaded,
    pinnedId,
    reload,
  };
}
