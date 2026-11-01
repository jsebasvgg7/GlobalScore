import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import RoomTable from '../components/room/RoomTable';
import RoomWaiting from '../components/room/RoomWaiting';
import RoomResult from '../components/room/RoomResult';
import '../styles/RoomTable.css';
import '../styles/RoomPage.css';
import '../styles/RoomDesktop.css';

const CONFIRM_WINDOW_MS = 3000;

export default function RoomPage({ currentUser }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { room, me, rival, standings, comparison, loading, error, open, close, refresh, cancel, finish } =
    useRoom(currentUser);
  const [confirming, setConfirming] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    open(roomId);
    return () => {
      close();
      clearTimeout(timer.current);
    };
  }, [roomId, open, close]);

  const goBack = () => navigate('/libreta/salas');

  const confirmThen = async (action, run) => {
    if (confirming !== action) {
      clearTimeout(timer.current);
      setConfirming(action);
      timer.current = setTimeout(() => setConfirming(null), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timer.current);
    setConfirming(null);
    await run();
  };

  const status = room?.status;
  const isOpen = status === 'waiting' || status === 'active';
  const isFinished = status === 'finished';
  const teamRemoved = status === 'cancelled' && room.members.some((member) => !member.team);

  return (
    <div className="lgr-page">
      <div className="lgr-page__inner">
        <header className="lgr-page__bar">
          <button type="button" className="lgr-btn lgr-btn--ghost" onClick={goBack}>
            <ArrowLeft size={16} />
            Salas
          </button>
          {isOpen && (
            <button type="button" className="lgr-btn" onClick={refresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'lgr-spin' : ''} />
              Actualizar
            </button>
          )}
        </header>

        {error && <p className="lgr-page__error">{error}</p>}

        {!room && loading && <p className="lgr-page__msg">Cargando sala...</p>}

        {status === 'waiting' && <RoomWaiting code={room.code} fromZero={room.fromZero} />}

        {isFinished && <RoomResult room={room} userId={currentUser?.id} me={me} rival={rival} />}

        {comparison && <RoomTable code={room.code} standings={standings} comparison={comparison} />}

        {status === 'cancelled' && (
          <p className="lgr-page__msg">
            {teamRemoved
              ? 'La sala se canceló porque un equipo fue eliminado.'
              : 'La sala fue cancelada.'}
          </p>
        )}

        {isFinished && <p className="lgr-page__msg">Sala terminada · solo lectura</p>}

        {status === 'active' && (
          <button
            type="button"
            className={`lgr-btn lgr-btn--finish${confirming === 'finish' ? ' lgr-btn--armed-finish' : ''}`}
            onClick={() => confirmThen('finish', finish)}
            disabled={loading}
          >
            {confirming === 'finish' ? 'Toca de nuevo para finalizar' : 'Finalizar sala'}
          </button>
        )}

        {isOpen && (
          <button
            type="button"
            className={`lgr-btn lgr-btn--danger${confirming === 'cancel' ? ' lgr-btn--armed' : ''}`}
            onClick={() => confirmThen('cancel', cancel)}
            disabled={loading}
          >
            {confirming === 'cancel' ? 'Toca de nuevo para confirmar' : 'Cancelar sala'}
          </button>
        )}
      </div>
    </div>
  );
}
