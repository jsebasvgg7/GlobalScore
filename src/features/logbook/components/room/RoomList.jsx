import { Link } from 'react-router-dom';
import { isRoomOngoing } from '../../utils/room.utils';
import RoomPinButton from './RoomPinButton';

const STATUS_LABEL = {
  waiting: 'Esperando rival',
  active: 'En juego',
  finished: 'Terminada',
  cancelled: 'Cancelada',
};

const resultOf = (room, userId) => {
  if (room.status !== 'finished') return null;
  if (!room.winnerUserId) return 'Empate';
  return room.winnerUserId === userId ? 'Ganaste' : 'Perdiste';
};

const scoreOf = (room) =>
  room.status === 'finished' && room.myPoints !== null && room.rivalPoints !== null
    ? `${room.myPoints} – ${room.rivalPoints}`
    : null;

function Item({ room, userId, pinnedId, busy, onPin }) {
  const ongoing = isRoomOngoing(room);
  const result = resultOf(room, userId);
  const score = scoreOf(room);
  return (
    <li className="lgr-row">
      <Link className="lgr-item" to={`/libreta/salas/${room.id}`}>
        <span className="lgr-item__main">
          <b>{room.myTeamName ?? 'Equipo eliminado'}</b>
          <span>vs {room.rivalName ?? 'Sin rival'}</span>
        </span>
        <span className="lgr-item__meta">
          <span className={`lgr-tag lgr-tag--${room.status}`}>
            {result ?? STATUS_LABEL[room.status]}
            {score && ` · ${score}`}
          </span>
          <span>{room.fromZero ? 'Desde 0' : 'Historial'}</span>
          <span>{room.code}</span>
        </span>
      </Link>
      {ongoing && (
        <RoomPinButton
          pinned={room.pinned}
          blocked={Boolean(pinnedId) && pinnedId !== room.id}
          disabled={busy}
          onToggle={() => onPin(room.id, !room.pinned)}
        />
      )}
    </li>
  );
}

export default function RoomList({ rooms, userId, pinnedId = null, busy = false, onPin }) {
  const ongoing = rooms.filter(isRoomOngoing);
  const history = rooms.filter((room) => !isRoomOngoing(room));

  return (
    <>
      <section className="lgr-card">
        <h2 className="lgr-card__title">En curso</h2>
        {ongoing.length === 0 && <p className="lgr-card__hint">No tienes salas en curso.</p>}
        <ul className="lgr-list">
          {ongoing.map((room) => (
            <Item
              key={room.id}
              room={room}
              userId={userId}
              pinnedId={pinnedId}
              busy={busy}
              onPin={onPin}
            />
          ))}
        </ul>
      </section>

      <section className="lgr-card">
        <h2 className="lgr-card__title">Historial</h2>
        {history.length === 0 && <p className="lgr-card__hint">Aún no hay salas terminadas.</p>}
        <ul className="lgr-list">
          {history.map((room) => (
            <Item key={room.id} room={room} userId={userId} />
          ))}
        </ul>
      </section>
    </>
  );
}
