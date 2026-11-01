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

export default function RoomList({ rooms, userId }) {
  return (
    <section className="lgr-card">
      <h2 className="lgr-card__title">Mis salas</h2>

      {rooms.length === 0 && <p className="lgr-card__hint">Aún no tienes salas.</p>}

      <ul className="lgr-list">
        {rooms.map((room) => {
          const result = resultOf(room, userId);
          return (
            <li key={room.id}>
              <Link className="lgr-item" to={`/libreta/salas/${room.id}`}>
                <span className="lgr-item__main">
                  <b>{room.myTeamName ?? 'Equipo eliminado'}</b>
                  <span>vs {room.rivalName ?? 'Sin rival'}</span>
                </span>
                <span className="lgr-item__meta">
                  <span className={`lgr-tag lgr-tag--${room.status}`}>
                    {result ?? STATUS_LABEL[room.status]}
                  </span>
                  <span>{room.fromZero ? 'Desde 0' : 'Historial'}</span>
                  <span>{room.code}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
