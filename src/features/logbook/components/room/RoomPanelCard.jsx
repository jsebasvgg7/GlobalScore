import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { listRooms } from '../../services';

const STATUS_LABEL = {
  waiting: 'Esperando rival',
  active: 'En juego',
};

export default function RoomPanelCard({ onOpen }) {
  const [room, setRoom] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    listRooms()
      .then((rooms) => {
        if (!alive) return;
        setRoom(rooms.find((item) => item.status === 'waiting' || item.status === 'active') ?? null);
        setReady(true);
      })
      .catch((e) => {
        console.error(e);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return null;

  const path = room ? `/libreta/salas/${room.id}` : '/libreta/salas';

  return (
    <div className="mob2-fw-card mob2-bento-wide">
      <button type="button" className="lg-panel__room" onClick={() => onOpen(path)}>
        <span className="lg-panel__room-body">
          <span className="mob2-sm-tag">
            {room ? `SALA 1 VS 1 · ${STATUS_LABEL[room.status].toUpperCase()}` : 'SALAS 1 VS 1'}
          </span>
          <span className="mob2-sm-title lg-panel__room-title">
            {room
              ? `${room.myTeamName ?? 'Tu equipo'} vs ${room.rivalName ?? 'por definir'}`
              : 'Crear o unirme a una sala'}
          </span>
          {room && <span className="lg-panel__room-code">Código {room.code}</span>}
        </span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
