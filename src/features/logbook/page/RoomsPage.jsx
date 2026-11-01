import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLogbook } from '../hooks/useLogbook';
import { useRoom } from '../hooks/useRoom';
import RoomCreateForm from '../components/room/RoomCreateForm';
import RoomJoinForm from '../components/room/RoomJoinForm';
import RoomList from '../components/room/RoomList';
import '../styles/RoomTable.css';
import '../styles/RoomPage.css';
import '../styles/RoomForms.css';

export default function RoomsPage({ currentUser }) {
  const navigate = useNavigate();
  const { teams } = useLogbook(currentUser);
  const { rooms, loading, error, loadList, create, join } = useRoom(currentUser);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleCreate = async (teamId, fromZero) => {
    const result = await create(teamId, fromZero);
    if (result) navigate(`/libreta/salas/${result.roomId}`);
  };

  const handleJoin = async (code, teamId) => {
    const result = await join(code, teamId);
    if (result) navigate(`/libreta/salas/${result.roomId}`);
  };

  return (
    <div className="lgr-page">
      <header className="lgr-page__bar">
        <button type="button" className="lgr-btn lgr-btn--ghost" onClick={() => navigate('/libreta')}>
          <ArrowLeft size={16} />
          Libreta
        </button>
        <h1 className="lgr-page__title">Salas 1 vs 1</h1>
      </header>

      {error && <p className="lgr-page__error">{error}</p>}

      <div className="lgr-forms">
        <RoomCreateForm teams={teams} loading={loading} onCreate={handleCreate} />
        <RoomJoinForm teams={teams} loading={loading} onJoin={handleJoin} />
      </div>

      <RoomList rooms={rooms} userId={currentUser?.id} />
    </div>
  );
}
