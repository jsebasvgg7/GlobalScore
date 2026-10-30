import React from 'react';
import { Info, Percent } from 'lucide-react';
import { useProbabilityToggle } from '../hooks/useProbabilityPreference';
import './ProbabilityBar.css';

export default function ProbabilityBar({ currentUser }) {
  const { show, toggle } = useProbabilityToggle(currentUser);

  return (
    <div className="pb-bar">
      <div className="pb-text">
        <Info size={12} className="pb-icon" aria-hidden="true" />
        <span>
          {show
            ? 'Los porcentajes son estadísticos: una guía, no una certeza. En el fútbol todo puede pasar.'
            : 'Pronósticos ocultos'}
        </span>
      </div>

      <div className="pb-control">
        <Percent size={12} className="pb-icon" aria-hidden="true" />
        <button
          type="button"
          role="switch"
          aria-checked={show}
          aria-label="Mostrar pronósticos"
          className={`pb-switch${show ? ' pb-switch--on' : ''}`}
          onClick={toggle}
        >
          <span className="pb-knob" />
        </button>
      </div>
    </div>
  );
}
