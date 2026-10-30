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
    <form className="lg-add" onSubmit={handleSubmit}>
      <label className="lg-visually-hidden" htmlFor="lg-add-name">
        Nombre del jugador
      </label>
      <input
        id="lg-add-name"
        className="lg-input lg-add__name"
        type="text"
        maxLength={24}
        placeholder="Nombre del jugador"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label className="lg-visually-hidden" htmlFor="lg-add-position">
        Posición
      </label>
      <select
        id="lg-add-position"
        className="lg-input lg-add__position"
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
        className="lg-btn lg-btn--primary lg-add__submit"
        disabled={!name.trim() || pending}
      >
        Añadir
      </button>
    </form>
  );
}
