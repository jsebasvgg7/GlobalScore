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
      {/* Header con Sort */}
      <div className="history-header-modern">
        <div className="history-title-section">
          <div className="history-icon-wrapper">
            <Gamepad2 size={20} />
          </div>
          <h3>Historial de Predicciones</h3>
          <span className="history-count-badge">{counts.all}</span>
        </div>

        {/* Sort Button */}
        <div style={{ position: 'relative' }} ref={sortRef}>
          <button 
            className={`sort-btn ${showSort ? 'active' : ''}`}
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
              <div key={pred.id} className={`history-card-simple ${result.status}`}>
                {/* Header */}
                <div className="history-card-header-simple">
                  <div className="league-info-simple">
                    <Trophy size={14} />
                    <span className="league-name-simple">{match?.league}</span>
                  </div>
                  <div className="match-date-simple">
                    <Calendar size={12} />
                    <span>{match?.date}</span>
                  </div>
                </div>

                {/* Content - Equipos */}
                <div className="history-card-content-simple">
                  <div className="team-row-simple">
                    <div className="team-info-simple">
                      <span className="team-logo-simple">{match?.home_team_logo}</span>
                      <span className="team-name-simple">{match?.home_team}</span>
                    </div>
                    <div className="score-display-simple">
                      <span className="score-value-simple">{pred.home_score}</span>
                      {match?.status === 'finished' && (
                        <span className="real-score-simple">({match.result_home})</span>
                      )}
                    </div>
                  </div>

                  <div className="vs-separator-simple">VS</div>

                  <div className="team-row-simple">
                    <div className="team-info-simple">
                      <span className="team-logo-simple">{match?.away_team_logo}</span>
                      <span className="team-name-simple">{match?.away_team}</span>
                    </div>
                    <div className="score-display-simple">
                      <span className="score-value-simple">{pred.away_score}</span>
                      {match?.status === 'finished' && (
                        <span className="real-score-simple">({match.result_away})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer - Resultado */}
                <div className="history-card-footer-simple">
                  <div className={`result-indicator-simple ${result.status}`}>
                    {result.status === 'exact' && <CheckCircle2 size={16} />}
                    {result.status === 'correct' && <CheckCircle2 size={16} />}
                    {result.status === 'wrong' && <XCircle size={16} />}
                    {result.status === 'pending' && <Clock size={16} />}
                    <span className="result-label-simple">{result.label}</span>
                  </div>
                  {result.points > 0 && (
                    <div className="points-badge-simple">+{result.points} pts</div>
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