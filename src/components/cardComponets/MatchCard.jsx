// src/components/cardComponets/MatchCard.jsx
import React, { useState, useEffect, useRef } from "react";
import {  
  Clock, 
  CheckCircle2,
  Calendar,
  Trophy,
  AlertCircle
} from "lucide-react";
import "../../styles/cardStyles/MatchCard.css"; 

export default function MatchCard({ match, userPred, onPredict }) {
  // Estados
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");
  const [advancingTeam, setAdvancingTeam] = useState(userPred?.predicted_advancing_team ?? null);
  const [isSaved, setIsSaved] = useState(userPred !== undefined);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Sincronizar con cambios en userPred
  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setAdvancingTeam(userPred?.predicted_advancing_team ?? null);
    setIsSaved(userPred !== undefined);
  }, [userPred]);

  // Cálculos de estado del partido
  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const isDisabled = isPastDeadline || match.status !== "pending";

  // Auto-save cuando ambos campos tienen valores válidos
  useEffect(() => {
    if (isDisabled) return;

    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    // Solo guardar si ambos valores son válidos y diferentes a la predicción actual
    const isValidPrediction = !isNaN(home) && !isNaN(away) && homeScore !== "" && awayScore !== "";
    const isDifferent = 
      home !== userPred?.home_score || 
      away !== userPred?.away_score ||
      advancingTeam !== userPred?.predicted_advancing_team;

    if (isValidPrediction && isDifferent) {
      // Esperar 1 segundo después del último cambio para guardar
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true);
        onPredict(match.id, home, away, advancingTeam);
        setTimeout(() => {
          setIsSaved(true);
          setIsSaving(false);
        }, 300);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [homeScore, awayScore, advancingTeam, isDisabled, match.id, onPredict, userPred]);

  // Manejadores
  const handleScoreChange = (team, value) => {
    if (isDisabled) return;
    
    const numericValue = parseInt(value, 10);
    const score = isNaN(numericValue) || numericValue < 0 ? value : Math.min(numericValue, 20);

    if (team === 'home') {
      setHomeScore(score);
    } else {
      setAwayScore(score);
    }
    setIsSaved(false);
  };

  const handleAdvancingTeamClick = (team) => {
    if (isDisabled || !match.is_knockout) return;
    
    // Toggle: si ya está seleccionado, deseleccionar
    setAdvancingTeam(prevTeam => prevTeam === team ? null : team);
    setIsSaved(false);
  };

  // Funciones auxiliares
  const formatMatchDate = (dateString) => {
    if (dateString && typeof dateString === 'string' && !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const matchDate = new Date(year, month - 1, day);
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const normalizeDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      };

      const normalizedMatch = normalizeDate(matchDate);
      const normalizedToday = normalizeDate(today);
      const normalizedTomorrow = normalizeDate(tomorrow);

      if (normalizedMatch.getTime() === normalizedToday.getTime()) {
        return 'Hoy';
      } else if (normalizedMatch.getTime() === normalizedTomorrow.getTime()) {
        return 'Mañana';
      } else {
        return matchDate.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    } catch (e) {
      return dateString;
    }
  };

  const renderLeagueLogo = () => {
    if (match.league_logo_url) {
      return (
        <img 
          src={match.league_logo_url} 
          alt={`${match.league} logo`}
          className="league-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallbackIcon = e.target.nextElementSibling;
            if (fallbackIcon) fallbackIcon.style.display = 'flex';
          }}
        />
      );
    }
    return null;
  };

  const renderTeamLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="Team logo" 
          className="team-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="match-card">
      
      {/* HEADER: Liga y Fecha */}
      <div className="match-header">
        <div className="league-info">
          {renderLeagueLogo()}
          <Trophy size={16} className="league-icon-fallback" style={{ display: match.league_logo_url ? 'none' : 'flex' }} />
          <span className="league-name">{match.league}</span>
          {match.is_knockout && (
            <span className="knockout-badge">⚡</span>
          )}
        </div>
        
        <div className="match-date">
          <Calendar size={12} />
          <span>{formatMatchDate(match.date)}</span>
        </div>
      </div>

      {/* CONTENT: Equipos y Predicción */}
      <div className="match-content">
        
        {/* Equipo Local */}
        <div className="team-section">
          <div 
            className={`team-logo-wrapper ${match.is_knockout && !isDisabled ? 'clickable' : ''} ${advancingTeam === 'home' ? 'advancing' : ''}`}
            onClick={() => handleAdvancingTeamClick('home')}
          >
            {renderTeamLogo(match.home_team_logo_url, match.home_team_logo)}
            <span className="team-emoji" style={{ display: match.home_team_logo_url ? 'none' : 'flex' }}>
              {match.home_team_logo || '⚽'}
            </span>
            {advancingTeam === 'home' && (
              <div className="advancing-indicator">
                <CheckCircle2 size={20} />
              </div>
            )}
          </div>
          <span className="team-name">{match.home_team}</span>
        </div>

        {/* Predicción Central */}
        <div className="prediction-section">
          <div className="score-inputs">
            <div className={`score-box ${isSaved ? 'saved' : ''} ${isDisabled ? 'disabled' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input"
                value={homeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
                placeholder="—"
                disabled={isDisabled}
              />
              {isSaved && !isDisabled && (
                <div className="saved-indicator">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
            
            <div className={`score-box ${isSaved ? 'saved' : ''} ${isDisabled ? 'disabled' : ''}`}>
              <input
                type="number"
                min="0"
                max="20"
                className="score-input"
                value={awayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
                placeholder="—"
                disabled={isDisabled}
              />
              {isSaved && !isDisabled && (
                <div className="saved-indicator">
                  <CheckCircle2 size={12} />
                </div>
              )}
            </div>
          </div>
          
          <div className="match-time">
            <Clock size={12} />
            <span>{match.time}</span>
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="team-section">
          <div 
            className={`team-logo-wrapper ${match.is_knockout && !isDisabled ? 'clickable' : ''} ${advancingTeam === 'away' ? 'advancing' : ''}`}
            onClick={() => handleAdvancingTeamClick('away')}
          >
            {renderTeamLogo(match.away_team_logo_url, match.away_team_logo)}
            <span className="team-emoji" style={{ display: match.away_team_logo_url ? 'none' : 'flex' }}>
              {match.away_team_logo || '⚽'}
            </span>
            {advancingTeam === 'away' && (
              <div className="advancing-indicator">
                <CheckCircle2 size={20} />
              </div>
            )}
          </div>
          <span className="team-name">{match.away_team}</span>
        </div>
      </div>

      {/* FOOTER: Estado - SIEMPRE VISIBLE */}
      <div className="match-footer">
        {isPastDeadline ? (
          <div className="status-message expired">
            <Clock size={14} />
            <span>Predicción cerrada</span>
          </div>
        ) : isSaving ? (
          <div className="status-message saving">
            <div className="spinner-small" />
            <span>Guardando...</span>
          </div>
        ) : isSaved ? (
          <div className="status-message saved">
            <CheckCircle2 size={14} />
            <span>Predicción guardada</span>
          </div>
        ) : (
          <div className="status-message pending">
            <AlertCircle size={14} />
            <span>Predicción pendiente</span>
          </div>
        )}
        
        {match.is_knockout && !isDisabled && (
          <div className="knockout-hint">
            <Trophy size={12} />
            <span>Toca el escudo del equipo que pasa (+2 pts)</span>
          </div>
        )}
      </div>

    </div>
  );
}