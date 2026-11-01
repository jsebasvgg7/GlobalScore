import { useEffect, useState } from 'react';
import { isTeamEmpty } from '../../utils/room.utils';

export default function RoomCreateForm({ teams, loading, onCreate }) {
  const [fromZero, setFromZero] = useState(false);
  const [teamId, setTeamId] = useState('');

  const isDisabled = (team) => fromZero && !isTeamEmpty(team);
  const selected = teams.find((team) => team.id === teamId);
  const hasEmptyTeam = teams.some(isTeamEmpty);

  useEffect(() => {
    if (selected && isDisabled(selected)) setTeamId('');
  }, [fromZero]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!teamId || loading) return;
    onCreate(teamId, fromZero);
  };

  return (
    <form className="lgr-card" onSubmit={handleSubmit}>
      <h2 className="lgr-card__title">Crear sala</h2>

      <div className="lgr-toggle" role="group" aria-label="Modo de la sala">
        <button
          type="button"
          className={`lgr-toggle__option${!fromZero ? ' lgr-toggle__option--on' : ''}`}
          onClick={() => setFromZero(false)}
        >
          Historial
        </button>
        <button
          type="button"
          className={`lgr-toggle__option${fromZero ? ' lgr-toggle__option--on' : ''}`}
          onClick={() => setFromZero(true)}
        >
          Desde 0
        </button>
      </div>

      <label className="lgr-field">
        <span>Tu equipo</span>
        <select
          className="lgr-input"
          value={teamId}
          onChange={(event) => setTeamId(event.target.value)}
        >
          <option value="">Elige un equipo</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id} disabled={isDisabled(team)}>
              {team.name} · {team.game}
            </option>
          ))}
        </select>
      </label>

      {fromZero && !hasEmptyTeam && (
        <p className="lgr-card__hint">
          Ningún equipo está en 0. Crea uno nuevo con "+ Equipo" en la Libreta.
        </p>
      )}

      <button type="submit" className="lgr-btn" disabled={!teamId || loading}>
        Crear sala
      </button>
    </form>
  );
}
