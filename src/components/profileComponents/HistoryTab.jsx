// src/components/profileComponents/HistoryTab.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Activity, Gamepad2, CheckCircle2, XCircle, Clock, Trophy, Calendar, ArrowUpDown } from 'lucide-react';
import { getPredictionResult } from '../../utils/profileUtils';

export default function HistoryTab({ predictionHistory, historyLoading }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  // Filtrar predicciones según el estado activo
  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return predictionHistory;
    
    return predictionHistory.filter(pred => {
      const match = pred.matches;
      const result = getPredictionResult(pred);
      
      // Filtros por estado del partido
      if (activeFilter === 'active') return match?.status === 'pending';
      if (activeFilter === 'finished') return match?.status === 'finished';
      
      // Filtros por resultado de la predicción
      if (activeFilter === 'exact') return result.status === 'exact';
      if (activeFilter === 'correct') return result.status === 'correct';
      if (activeFilter === 'wrong') return result.status === 'wrong';
      
      return true;
    });
  }, [predictionHistory, activeFilter]);

  // Contadores para los filtros
  const counts = useMemo(() => {
    const finished = predictionHistory.filter(p => p.matches?.status === 'finished');
    
    return {
      all: predictionHistory.length,
      active: predictionHistory.filter(p => p.matches?.status === 'pending').length,
      finished: finished.length,
      exact: finished.filter(p => getPredictionResult(p).status === 'exact').length,
      correct: finished.filter(p => getPredictionResult(p).status === 'correct').length,
      wrong: finished.filter(p => getPredictionResult(p).status === 'wrong').length,
    };
  }, [predictionHistory]);

  // Cerrar Sort al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    if (showSort) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSort]);

  // Obtener el nombre del filtro activo
  const getActiveFilterName = () => {
    const filterNames = {
      all: 'Todas',
      active: 'Activas',
      finished: 'Terminadas',
      exact: 'Exactas',
      correct: 'Acertadas',
      wrong: 'Falladas'
    };
    return filterNames[activeFilter] || 'Todas';
  };

  // Renderizar logo de equipo (igual que MatchCard)
  const renderTeamLogo = (logoUrl, fallbackEmoji) => {
    if (logoUrl && logoUrl.startsWith('http')) {
      return (
        <img 
          src={logoUrl} 
          alt="Team logo" 
          className="history-team-logo"
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

  // Renderizar logo de liga
  const renderLeagueLogo = (logoUrl) => {
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt="League logo"
          className="history-league-logo"
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

  if (historyLoading) {
    return (
      <div className="tab-content-wrapper">
        <div className="loading-state large">
          <Activity size={32} className="spinner" />
          <p>Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper" data-tab="history">
      {/* Header Compacto */}
      <div className="history-header-compact">
        <div className="history-title-compact">
          <Gamepad2 size={20} />
          <span>Historial</span>
        </div>

        <div className="history-header-divider"></div>

        {/* Sort Button */}
        <div className="history-sort-wrapper" ref={sortRef}>
          <button 
            className={`history-sort-compact ${showSort ? 'active' : ''}`}
            onClick={() => setShowSort(!showSort)}
          >
            <ArrowUpDown size={16} />
            <span>{getActiveFilterName()}</span>
          </button>

          {showSort && (
            <>
              <div 
                className="sort-modal-backdrop" 
                onClick={() => setShowSort(false)}
              />
              <div className="sort-modal">
                <div className="sort-modal-header">
                  <ArrowUpDown size={18} />
                  <h4>Filtrar por</h4>
                </div>
                <div className="sort-options">
                  {/* Todas */}
                  <button
                    className={`sort-option ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter('all');
                      setShowSort(false);
                    }}
                  >
                    <div className="sort-option-icon">
                      <Gamepad2 size={14} />
                    </div>
                    <span className="sort-option-text">Todas</span>
                    <span className="sort-option-count">{counts.all}</span>
                  </button>

                  {/* Activas */}
                  <button
                    className={`sort-option ${activeFilter === 'active' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter('active');
                      setShowSort(false);
                    }}
                  >
                    <div className="sort-option-icon">
                      <Clock size={14} />
                    </div>
                    <span className="sort-option-text">Activas</span>
                    <span className="sort-option-count">{counts.active}</span>
                  </button>

                  {/* Terminadas */}
                  <button
                    className={`sort-option ${activeFilter === 'finished' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter('finished');
                      setShowSort(false);
                    }}
                  >
                    <div className="sort-option-icon">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="sort-option-text">Terminadas</span>
                    <span className="sort-option-count">{counts.finished}</span>
                  </button>

                  {/* Divisor visual */}
                  <div className="sort-divider"></div>

                  {/* Exactas */}
                  <button
                    className={`sort-option ${activeFilter === 'exact' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter('exact');
                      setShowSort(false);
                    }}
                  >
                    <div className="sort-option-icon sort-icon-exact">
                      <Trophy size={14} />
                    </div>
                    <span className="sort-option-text">Exactas</span>
                    <span className="sort-option-count">{counts.exact}</span>
                  </button>

                  {/* Acertadas */}
                  <button
                    className={`sort-option ${activeFilter === 'correct' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter('correct');
                      setShowSort(false);
                    }}
                  >
                    <div className="sort-option-icon sort-icon-correct">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="sort-option-text">Acertadas</span>
                    <span className="sort-option-count">{counts.correct}</span>
                  </button>

                  {/* Falladas */}
                  <button
                    className={`sort-option ${activeFilter === 'wrong' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter('wrong');
                      setShowSort(false);
                    }}
                  >
                    <div className="sort-option-icon sort-icon-wrong">
                      <XCircle size={14} />
                    </div>
                    <span className="sort-option-text">Falladas</span>
                    <span className="sort-option-count">{counts.wrong}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="history-header-divider"></div>

        {/* Count Badge */}
        <div className="history-count-compact">{counts.all}</div>
      </div>

      {/* Lista de Predicciones */}
      {filteredHistory.length === 0 ? (
        <div className="empty-state large">
          <Gamepad2 size={48} />
          <p>
            {activeFilter === 'all' && 'Aún no has hecho predicciones'}
            {activeFilter === 'active' && 'No tienes predicciones activas'}
            {activeFilter === 'finished' && 'No tienes predicciones finalizadas'}
            {activeFilter === 'exact' && 'No tienes predicciones exactas'}
            {activeFilter === 'correct' && 'No tienes predicciones acertadas'}
            {activeFilter === 'wrong' && 'No tienes predicciones falladas'}
          </p>
          <span className="empty-subtitle">
            {activeFilter === 'all' && '¡Comienza a predecir resultados!'}
            {activeFilter === 'active' && 'Todas tus predicciones han sido finalizadas'}
            {activeFilter === 'finished' && 'Tus predicciones finalizadas aparecerán aquí'}
            {activeFilter === 'exact' && '¡Sigue intentando acertar el resultado exacto!'}
            {activeFilter === 'correct' && 'Las predicciones donde aciertes el ganador aparecerán aquí'}
            {activeFilter === 'wrong' && 'Las predicciones incorrectas aparecerán aquí'}
          </span>
        </div>
      ) : (
        <div className="history-grid-modern">
          {filteredHistory.map((pred) => {
            const result = getPredictionResult(pred);
            const match = pred.matches;

            return (
              <div key={pred.id} className={`history-match-card ${result.status}`}>
                
                {/* HEADER: Liga y Fecha */}
                <div className="history-match-header">
                  <div className="history-league-info">
                    {renderLeagueLogo(match?.league_logo_url)}
                    <Trophy size={16} className="history-league-icon-fallback" style={{ display: match?.league_logo_url ? 'none' : 'flex' }} />
                    <span className="history-league-name">{match?.league}</span>
                  </div>
                  
                  <div className="history-match-date">
                    <Calendar size={12} />
                    <span>{match?.date}</span>
                  </div>
                </div>

                {/* CONTENT: Equipos y Predicción */}
                <div className="history-match-content">
                  
                  {/* Equipo Local */}
                  <div className="history-team-section">
                    <div className="history-team-logo-wrapper">
                      {renderTeamLogo(match?.home_team_logo_url, match?.home_team_logo)}
                      <span className="history-team-emoji" style={{ display: match?.home_team_logo_url ? 'none' : 'flex' }}>
                        {match?.home_team_logo || '⚽'}
                      </span>
                    </div>
                    <span className="history-team-name">{match?.home_team}</span>
                  </div>

                  {/* Predicción Central */}
                  <div className="history-prediction-section">
                    <div className="history-score-display">
                      <div className="history-score-box">
                        <span className="history-score-value">{pred.home_score}</span>
                      </div>
                      
                      <div className="history-score-box">
                        <span className="history-score-value">{pred.away_score}</span>
                      </div>
                    </div>
                    
                    {/* Resultado Real - Solo si el partido terminó */}
                    {match?.status === 'finished' && (
                      <div className="history-real-result">
                        <div className="history-real-scores">
                          <span className="history-real-score">{match.result_home}</span>
                          <span className="history-score-separator">-</span>
                          <span className="history-real-score">{match.result_away}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Equipo Visitante */}
                  <div className="history-team-section">
                    <div className="history-team-logo-wrapper">
                      {renderTeamLogo(match?.away_team_logo_url, match?.away_team_logo)}
                      <span className="history-team-emoji" style={{ display: match?.away_team_logo_url ? 'none' : 'flex' }}>
                        {match?.away_team_logo || '⚽'}
                      </span>
                    </div>
                    <span className="history-team-name">{match?.away_team}</span>
                  </div>
                </div>

                {/* FOOTER: Resultado */}
                <div className="history-match-footer">
                  <div className={`history-result-indicator ${result.status}`}>
                    {result.status === 'exact' && <Trophy size={16} />}
                    {result.status === 'correct' && <CheckCircle2 size={16} />}
                    {result.status === 'wrong' && <XCircle size={16} />}
                    {result.status === 'pending' && <Clock size={16} />}
                    <span className="history-result-label">{result.label}</span>
                  </div>
                  {result.points > 0 && (
                    <div className="history-points-badge">+{result.points} pts</div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}