// src/components/MatchCard.jsx
import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Minus,
  Edit2
} from "lucide-react";
import "../styles/MatchCard.css"; 

export default function MatchCard({ match, userPred, onPredict }) {
  // Inicializar con la predicción del usuario o cadena vacía para placeholder
  const initialHomeScore = userPred?.home_score ?? "";
  const initialAwayScore = userPred?.away_score ?? "";

  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [hasPrediction, setHasPrediction] = useState(userPred !== undefined);

  // Re-sincronizar el estado cuando la predicción del usuario (userPred) cambie
  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setHasPrediction(userPred !== undefined);
  }, [userPred]);
  
  // Handler de envío de predicción
  const handleSubmit = () => {
    // Validar que ambos campos tienen un valor numérico
    if (homeScore === "" || awayScore === "" || isNaN(homeScore) || isNaN(awayScore)) {
      alert("Por favor, ingresa un marcador válido en ambos campos.");
      return;
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    // Si los scores son iguales a la predicción guardada (y está guardada), no hacer nada
    if (hasPrediction && home === userPred.home_score && away === userPred.away_score) {
      return; 
    }

    // Llamar a la función principal para guardar
    onPredict(match.id, home, away);
    setHasPrediction(true); // Asumir éxito inmediatamente para actualizar el estado visual
  };

  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now > deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  const isPredictionChanged = (
    parseInt(homeScore) !== userPred?.home_score || 
    parseInt(awayScore) !== userPred?.away_score
  );
  
  // El botón debe mostrarse si NO está deshabilitado y (no hay predicción O la predicción ha cambiado)
  const showSaveButton = !isDisabled && (!hasPrediction || isPredictionChanged);
  
  // Clase condicional para el input
  const homeInputClass = `score-input-inline-light ${hasPrediction ? 'predicted' : ''}`;
  const awayInputClass = `score-input-inline-light ${hasPrediction ? 'predicted' : ''}`;

  return (
    // Usar la nueva clase de estilo
    <div className="match-card-input-light">
      
      {/* Header Compacto (Liga, Hora, Fecha) */}
      <div className="match-header-input-light">
        <div className="match-league-info-input-light">
          <Zap size={14} className="league-icon-input-light" />
          <span className="league-name-input-light">{match.league}</span>
        </div>
        <div className="match-datetime-info-input-light">
          <span className="match-date-input-light">
            <Calendar size={12} />
            {match.date}
          </span>
          <span className="match-time-input-light">
            <Clock size={12} />
            {match.time}
          </span>
        </div>
      </div>

      {/* Contenido Principal (Equipos y Inputs) */}
      <div className="match-teams-container-input-light">
        
        {/* Equipo Local */}
        <div className="team-box-input-light team-home-input-light">
          <div className="team-color-indicator-input-light home-color-input-light"></div>
          <div className="team-content-input-light">
            <span className="team-logo-input-light">{match.home_team_logo}</span>
            <div className="team-details-input-light">
              <span className="team-name-input-light">{match.home_team}</span>
              <span className="team-label-input-light">Local</span>
            </div>
          </div>
          <input
            type="number"
            min="0"
            max="20"
            className={homeInputClass}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="?"
            disabled={isDisabled}
          />
        </div>

        {/* Equipo Visitante */}
        <div className="team-box-input-light team-away-input-light">
          <div className="team-color-indicator-input-light away-color-input-light"></div>
          <div className="team-content-input-light">
            <span className="team-logo-input-light">{match.away_team_logo}</span>
            <div className="team-details-input-light">
              <span className="team-name-input-light">{match.away_team}</span>
              <span className="team-label-input-light">Visitante</span>
            </div>
          </div>
          <input
            type="number"
            min="0"
            max="20"
            className={awayInputClass}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="?"
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Footer con Estado y Botón */}
      <div className="match-footer-input-light">
        
        {isDisabled ? (
          <span className="prediction-status-input-light" style={{color: '#ef4444'}}>
             <Clock size={14} /> Plazo de predicción expirado
          </span>
        ) : hasPrediction && !isPredictionChanged && (
          <div className="prediction-status-input-light saved">
            <CheckCircle2 size={14} />
            <span>Predicción guardada</span>
          </div>
        )}
        
        {/* Muestra el botón solo si NO está deshabilitado */}
        {!isDisabled && (
          <button 
            className="predict-button-input-light" 
            onClick={handleSubmit}
            disabled={!showSaveButton && hasPrediction} // Deshabilitar si está guardado y no ha cambiado
          >
            <span>{hasPrediction && !isPredictionChanged ? "Actualizar" : "Guardar Predicción"}</span>
          </button>
        )}
        
      </div>

    </div>
  );
}
