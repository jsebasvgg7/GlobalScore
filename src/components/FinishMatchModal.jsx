// src/components/FinishMatchModal.jsx

import React, { useState } from 'react';
// Asegúrate de importar cualquier componente Modal base que uses (e.g., <BaseModal>)
// import BaseModal from './BaseModal'; 

// Asumo que tu modal recibe el partido a finalizar y la función de acción
export default function FinishMatchModal({ match, onFinish, onClose }) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedHome = parseInt(homeScore, 10);
    const parsedAway = parseInt(awayScore, 10);

    if (isNaN(parsedHome) || isNaN(parsedAway)) {
      alert("Por favor, introduce puntuaciones válidas.");
      return;
    }

    // Llama a la función de finalización que está en el AdminPanel (y el hook)
    onFinish(match.id, parsedHome, parsedAway);
  };

  return (
    // Usa aquí tu componente de Modal principal para la envoltura
    <div className="modal-backdrop"> 
      <div className="modal-content admin-modal">
        <h2>Finalizar Partido</h2>
        <p>Introduce el resultado final para **{match.home_team} vs {match.away_team}**:</p>
        
        <form onSubmit={handleSubmit}>
          <div className="score-inputs">
            <label>
              {match.home_team}:
              <input 
                type="number" 
                value={homeScore} 
                onChange={(e) => setHomeScore(e.target.value)} 
                required 
                min="0"
              />
            </label>
            <label>
              {match.away_team}:
              <input 
                type="number" 
                value={awayScore} 
                onChange={(e) => setAwayScore(e.target.value)} 
                required 
                min="0"
              />
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Confirmar Resultado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Nota: Asegúrate de que el componente <BaseModal> (o la estructura de backdrop/content)
// y los estilos CSS (.modal-backdrop, .modal-content) sean correctos en tu proyecto.