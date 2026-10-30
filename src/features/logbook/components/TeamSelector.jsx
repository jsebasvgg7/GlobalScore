import '../styles/TeamSelector.css';

export default function TeamSelector({ teams, activeId, onSelect, onCreate }) {
  return (
    <section className="lg-card lg-team-selector" aria-label="Equipos">
      <div className="lg-team-selector__field">
        <label className="lg-label" htmlFor="lg-team-select">
          Equipo
        </label>
        <select
          id="lg-team-select"
          className="lg-input"
          value={activeId ?? ''}
          onChange={(event) => onSelect(event.target.value)}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className="lg-btn lg-team-selector__add" onClick={onCreate}>
        + Equipo
      </button>
    </section>
  );
}
