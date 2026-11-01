import { ChevronRight, Star } from 'lucide-react';
import { useCurrentRoom } from '../../hooks/useCurrentRoom';

const STATUS_LABEL = {
  waiting: 'Esperando rival',
  active: 'En juego',
};

export default function RoomPanelCard({ onOpen }) {
  const { room, path, loading } = useCurrentRoom();

  if (loading) return null;

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
          {room && (
            <span className="lg-panel__room-code">
              {room.pinned && <Star size={11} className="lg-panel__room-star" aria-label="Sala con estrella" />}
              Código {room.code}
            </span>
          )}
        </span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
