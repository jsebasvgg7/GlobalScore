import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import RoomTable from '../components/room/RoomTable';
import RoomWaiting from '../components/room/RoomWaiting';
import '../styles/RoomTable.css';
import '../styles/RoomPage.css';

const CONFIRM_WINDOW_MS = 3000;

const STATUS_TEXT = {
  cancelled: 'La sala fue cancelada.',
  finished: 'La sala terminó.',
};

export default function RoomPage({ currentUser }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { room, standings, comparison, loading, error, open, close, refresh, cancel } =
    useRoom(currentUser);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    open(roomId);
    return () => {
      close();
      clearTimeout(timer.current);
    };
  }, [roomId, open, close]);

  const goBack = () => navigate('/libreta/salas');

  const handleCancel = async () => {
    if (!confirming) {
      setConfirming(true);
      timer.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timer.current);
    setConfirming(false);
    await cancel();
  };

  const isOpen = room && (room.status === 'waiting' || room.status === 'active');
  const isWinner = room?.winnerUserId && room.winnerUserId === currentUser?.id;

  return (
    <div className="lgr-page">
      <header className="lgr-page__bar">
        <button type="button" className="lgr-btn lgr-btn--ghost" onClick={goBack}>
          <ArrowLeft size={16} />
          Salas
        </button>
        <button
          type="button"
          className="lgr-btn"
          onClick={refresh}
          disabled={loading || !room}
        >
          <RefreshCw size={16} className={loading ? 'lgr-spin' : ''} />
          Actualizar
        </button>
      </header>

      {error && <p className="lgr-page__error">{error}</p>}

      {!room && loading && <p className="lgr-page__msg">Cargando sala...</p>}

      {room?.status === 'waiting' && <RoomWaiting code={room.code} fromZero={room.fromZero} />}

      {comparison && <RoomTable code={room.code} standings={standings} comparison={comparison} />}

      {room && STATUS_TEXT[room.status] && <p className="lgr-page__msg">{STATUS_TEXT[room.status]}</p>}

      {room?.status === 'finished' && room.winnerUserId && (
        <p className="lgr-page__msg">{isWinner ? 'Ganaste la sala' : 'Ganó tu rival'}</p>
      )}

      {isOpen && (
        <button
          type="button"
          className={`lgr-btn lgr-btn--danger${confirming ? ' lgr-btn--armed' : ''}`}
          onClick={handleCancel}
          disabled={loading}
        >
          {confirming ? 'Toca de nuevo para confirmar' : 'Cancelar sala'}
        </button>
      )}
    </div>
  );
}
