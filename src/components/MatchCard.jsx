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
// Importar el nuevo estilo para el tema claro
import "../styles/MatchCard.css"; 

export default function MatchCard({ match, userPred, onPredict }) {
  // Inicializar con la predicción del usuario o 0
  const initialHomeScore = userPred?.home_score ?? 0;
  const initialAwayScore = userPred?.away_score ?? 0;

  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [isSaved, setIsSaved] = useState(userPred !== undefined);

  // Re-sincronizar el estado cuando la predicción del usuario (userPred) cambie
  useEffect(() => {
    setHomeScore(userPred?.home_score ?? 0);
    setAwayScore(userPred?.away_score ?? 0);
    setIsSaved(userPred !== undefined);
  }, [userPred]);
  
  // Handlers para incrementar/decrementar
  const incrementScore = (team) => {
    if (isDisabled) return;
    if (team === 'home') {
      setHomeScore(prev => Math.min(prev + 1, 20)); // Límite en 20
      setIsSaved(false); // Marcar como no guardado al cambiar
    } else {
      setAwayScore(prev => Math.min(prev + 1, 20)); // Límite en 20
      setIsSaved(false);
    }
  };

  const decrementScore = (team) => {
    if (isDisabled) return;
    if (team === 'home') {
      setHomeScore(prev => Math.max(prev - 1, 0)); // Límite en 0
      setIsSaved(false);
    } else {
      setAwayScore(prev => Math.max(prev - 1, 0)); // Límite en 0
      setIsSaved(false);
    }
  };

  // Handler de envío de predicción
  const handleSubmit = () => {
    // Si los scores son iguales a la predicción guardada, no hacer nada
    if (isSaved && homeScore === initialHomeScore && awayScore === initialAwayScore) {
      return; 
    }

    // El manejo de la validación se deja principalmente en VegaScorePage,
    // pero aquí se llama a la función principal.
    onPredict(match.id, homeScore, awayScore);
    setIsSaved(true); // Asumir éxito inmediatamente, el toast de VegaScorePage confirmará
  };

  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now > deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  const isPredictionChanged = (homeScore !== initialHomeScore || awayScore !== initialAwayScore);
  const showSaveButton = !isDisabled && (!isSaved || isPredictionChanged);

  return (
    // Usar la nueva clase de estilo
    <div className="match-card-light">
      
      {/* Header Compacto (Fecha de HOY, Liga, Hora) */}
      <div className="match-header-light">
        {/* Simulación del punto verde o fecha */}
        {match.date.toLowerCase().includes("hoy") ? (
          <div className="status-dot"></div>
        ) : null}
        
        {/* Información de la Liga y Hora */}
        <div className="match-league-info-light">
          <Zap size={14} className="league-icon" />
          <span className="league-name">{match.league}</span>
          <span className="match-datetime-separator">•</span>
          <span className="match-time">
            <Clock size={12} />
            {match.time}
          </span>
          <Edit2 size={16} className="edit-icon" /> {/* Icono de editar al final */}
        </div>
      </div>

      {/* Contenido Principal (Equipos y Controles) */}
      <div className="match-content-light">
        
        {/* Equipo Local */}
        <div className="team-box-light team-home">
          <span className="team-logo-light">{match.home_team_logo}</span>
          <span className="team-name-light">{match.home_team}</span>
          {/* Se elimina el porcentaje de victoria, si lo necesitas añádelo aquí */}
        </div>

        {/* Controles de Predicción Centrales */}
        <div className="prediction-controls">
          
          {/* Botones de incremento (HOME) */}
          <div className="score-button-set">
            <button 
              className="action-button-light" 
              onClick={() => incrementScore('home')}
              disabled={isDisabled}
            >
              <Plus size={14} />
            </button>
            <button 
              className="action-button-light" 
              onClick={() => incrementScore('away')}
              disabled={isDisabled}
            >
              <Plus size={14} />
            </button>
          </div>
          
          {/* Marcador */}
          <div className="score-display-light">
            <div className={`score-cell-light ${isSaved ? 'has-prediction' : ''}`}>
              {homeScore}
              {isSaved && <div className="prediction-check-light"><CheckCircle2 size={12} /></div>}
            </div>
            <div className={`score-cell-light ${isSaved ? 'has-prediction' : ''}`}>
              {awayScore}
              {isSaved && <div className="prediction-check-light"><CheckCircle2 size={12} /></div>}
            </div>
          </div>
          
          {/* Botones de decremento (MINUS) */}
          <div className="score-button-set">
            <button 
              className="action-button-light" 
              onClick={() => decrementScore('home')}
              disabled={isDisabled}
            >
              <Minus size={14} />
            </button>
            <button 
              className="action-button-light" 
              onClick={() => decrementScore('away')}
              disabled={isDisabled}
            >
              <Minus size={14} />
            </button>
          </div>
          
          {/* Botón de Guardar/Actualizar si se requiere */}
          {showSaveButton && (
            <button
              className="predict-button-light"
              onClick={handleSubmit}
              style={{ marginTop: '8px', width: '100%' }}
            >
              {isSaved ? "Actualizar" : "Guardar Predicción"}
            </button>
          )}

        </div>

        {/* Equipo Visitante */}
        <div className="team-box-light team-away">
          <span className="team-logo-light">{match.away_team_logo}</span>
          <span className="team-name-light">{match.away_team}</span>
        </div>
      </div>

      {/* Footer (Solo para mensaje de expiración o estado) */}
      <div className="match-footer-light">
        {isDisabled ? (
          <span className="prediction-status-light" style={{color: '#ef4444'}}>
             <Clock size={14} /> Plazo de predicción expirado
          </span>
        ) : !showSaveButton && isSaved ? (
          <span className="prediction-status-light">
            <CheckCircle2 size={14} style={{color: '#059669'}}/>
            Predicción guardada
          </span>
        ) : null}
      </div>

    </div>
  );
}