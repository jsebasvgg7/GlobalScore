// src/components/profileComponents/HistoryTab.jsx
import React, { useState, useMemo } from 'react';
import { Activity, Gamepad2, CheckCircle2, XCircle, Clock, Filter, Trophy, Calendar } from 'lucide-react';
import { getPredictionResult } from '../../utils/profileUtils';

export default function HistoryTab({ predictionHistory, historyLoading }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Filtrar predicciones según el estado activo
  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return predictionHistory;
    
    return predictionHistory.filter(pred => {
      const match = pred.matches;
      if (activeFilter === 'active') return match?.status === 'pending';
      if (activeFilter === 'finished') return match?.status === 'finished';
      return true;
    });
  }, [predictionHistory, activeFilter]);

  // Contadores para los filtros
  const counts = useMemo(() => ({
    all: predictionHistory.length,
    active: predictionHistory.filter(p => p.matches?.status === 'pending').length,
    finished: predictionHistory.filter(p => p.matches?.status === 'finished').length,
  }), [predictionHistory]);

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
      {/* Header con Filtros */}
      <div className="history-header-modern">
        <div className="history-title-section">
          <div className="history-icon-wrapper">
            <Gamepad2 size={20} />
          </div>
          <h3>Historial de Predicciones</h3>
          <span className="history-count-badge">{counts.all}</span>
        </div>

        {/* Filtros */}
        <div className="history-filters">
          <button
            className={`history-filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span className="filter-label">Todas</span>
            <span className="filter-count">{counts.all}</span>
          </button>

          <button
            className={`history-filter-chip ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            <Clock size={14} />
            <span className="filter-label">Activas</span>
            <span className="filter-count">{counts.active}</span>
          </button>

          <button
            className={`history-filter-chip ${activeFilter === 'finished' ? 'active' : ''}`}
            onClick={() => setActiveFilter('finished')}
          >
            <CheckCircle2 size={14} />
            <span className="filter-label">Terminadas</span>
            <span className="filter-count">{counts.finished}</span>
          </button>
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
          </p>
          <span className="empty-subtitle">
            {activeFilter === 'all' && '¡Comienza a predecir resultados!'}
            {activeFilter === 'active' && 'Todas tus predicciones han sido finalizadas'}
            {activeFilter === 'finished' && 'Tus predicciones finalizadas aparecerán aquí'}
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