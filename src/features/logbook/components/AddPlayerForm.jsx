import { useState } from 'react';
import { DEFAULT_POSITION, POSITIONS } from '../utils/logbook.utils';
import '../styles/AddPlayerForm.css';

export default function AddPlayerForm({ onAdd }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean || pending) return;
    setPending(true);
    const player = await onAdd({ name: clean, position });
    if (player) setName('');
    setPending(false);
  };

  return (
    <form className="lb-add" onSubmit={handleSubmit}>
      <label className="lb-visually-hidden" htmlFor="lb-add-name">
        Nombre del jugador
      </label>
      <input
        id="lb-add-name"
        className="lb-input lb-add__name"
        type="text"
        maxLength={24}
        placeholder="Nombre del jugador"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label className="lb-visually-hidden" htmlFor="lb-add-position">
        Posición
      </label>
      <select
        id="lb-add-position"
        className="lb-input lb-add__position"
        value={position}
        onChange={(event) => setPosition(event.target.value)}
      >
        {POSITIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="lb-btn lb-btn--primary lb-add__submit"
        disabled={!name.trim() || pending}
      >
        Añadir
      </button>
    </form>
  );
}
