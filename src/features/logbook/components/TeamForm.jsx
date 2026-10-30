import { FORMATIONS, GAMES } from '../utils/logbook.utils';
import '../styles/TeamForm.css';

export default function TeamForm({ team, onChange }) {
  const commitName = (event) => {
    const value = event.target.value.trim().slice(0, 30);
    if (value && value !== team.name) onChange({ name: value });
    else event.target.value = team.name;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <section className="lg-card lg-team-form" aria-label="Datos del equipo">
      <div className="lg-team-form__field">
        <label className="lg-label" htmlFor="lg-team-name">
          Nombre del equipo
        </label>
        <input
          key={team.id}
          id="lg-team-name"
          className="lg-input"
          type="text"
          maxLength={30}
          defaultValue={team.name}
          onBlur={commitName}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="lg-team-form__field">
        <label className="lg-label" htmlFor="lg-team-formation">
          Formación táctica
        </label>
        <select
          id="lg-team-formation"
          className="lg-input"
          value={team.formation}
          onChange={(event) => onChange({ formation: event.target.value })}
        >
          {FORMATIONS.map((formation) => (
            <option key={formation} value={formation}>
              {formation}
            </option>
          ))}
        </select>
      </div>
      <div className="lg-team-form__field lg-team-form__field--wide">
        <label className="lg-label" htmlFor="lg-team-game">
          Juego
        </label>
        <select
          id="lg-team-game"
          className="lg-input"
          value={team.game}
          onChange={(event) => onChange({ game: event.target.value })}
        >
          {GAMES.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
