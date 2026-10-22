import '../styles/TeamSelector.css';

export default function TeamSelector({ teams, activeId, onSelect, onCreate }) {
  return (
    <section className="lb-card lb-team-selector" aria-label="Equipos">
      <div className="lb-team-selector__field">
        <label className="lb-label" htmlFor="lb-team-select">
          Equipo
        </label>
        <select
          id="lb-team-select"
          className="lb-input"
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
      <button type="button" className="lb-btn lb-team-selector__add" onClick={onCreate}>
        + Equipo
      </button>
    </section>
  );
}
