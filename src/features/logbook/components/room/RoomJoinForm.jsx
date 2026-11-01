import { useState } from 'react';

const CODE_LENGTH = 8;

export default function RoomJoinForm({ teams, loading, onJoin }) {
  const [code, setCode] = useState('');
  const [teamId, setTeamId] = useState('');

  const cleanCode = code.trim().toUpperCase();
  const canSubmit = cleanCode.length >= 6 && teamId && !loading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onJoin(cleanCode, teamId);
  };

  return (
    <form className="lgr-card" onSubmit={handleSubmit}>
      <h2 className="lgr-card__title">Unirme con código</h2>

      <label className="lgr-field">
        <span>Código</span>
        <input
          className="lgr-input lgr-input--code"
          type="text"
          maxLength={CODE_LENGTH}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="XXXXXX"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
      </label>

      <label className="lgr-field">
        <span>Tu equipo</span>
        <select
          className="lgr-input"
          value={teamId}
          onChange={(event) => setTeamId(event.target.value)}
        >
          <option value="">Elige un equipo</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} · {team.game}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="lgr-btn" disabled={!canSubmit}>
        Unirme
      </button>
    </form>
  );
}
