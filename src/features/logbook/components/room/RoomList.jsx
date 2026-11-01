import { Link } from 'react-router-dom';

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

const isOngoing = (room) => room.status === 'waiting' || room.status === 'active';

function Item({ room, userId }) {
  const result = resultOf(room, userId);
  const score = scoreOf(room);
  return (
    <li>
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
    </li>
  );
}

export default function RoomList({ rooms, userId }) {
  const ongoing = rooms.filter(isOngoing);
  const history = rooms.filter((room) => !isOngoing(room));

  return (
    <>
      <section className="lgr-card">
        <h2 className="lgr-card__title">En curso</h2>
        {ongoing.length === 0 && <p className="lgr-card__hint">No tienes salas en curso.</p>}
        <ul className="lgr-list">
          {ongoing.map((room) => (
            <Item key={room.id} room={room} userId={userId} />
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
