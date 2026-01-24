// src/components/profileComponents/HistoryTab.jsx
import React, { useState, useMemo } from 'react';
import { Activity, Gamepad2, CheckCircle2, XCircle, Clock, Trophy, Calendar } from 'lucide-react';
import { getPredictionResult } from '../../utils/profileUtils';

export default function HistoryTab({ predictionHistory, historyLoading }) {
  const [activeFilter, setActiveFilter] = useState('all');

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

  if (historyLoading) {
    return (
      <div className="tab-content-wrapper">
        <div className="loading-state">
          <Activity size={32} className="spinner" />
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      {/* Header con Filtros */}
      <div className="history-header-modern">
        <div className="history-title-section">
          <div className="history-icon-wrapper">
            <Gamepad2 size={20} />
          </div>
          <h3>Prediction History</h3>
          <span className="history-count-badge">{counts.all}</span>
        </div>

        {/* Filtros */}
        <div className="history-filters">
          <button
            className={`history-filter-chip touchable ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span className="filter-label">All</span>
            <span className="filter-count">{counts.all}</span>
          </button>

          <button
            className={`history-filter-chip touchable ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            <Clock size={14} />
            <span className="filter-label">Active</span>
            <span className="filter-count">{counts.active}</span>
          </button>

          <button
            className={`history-filter-chip touchable ${activeFilter === 'finished' ? 'active' : ''}`}
            onClick={() => setActiveFilter('finished')}
          >
            <CheckCircle2 size={14} />
            <span className="filter-label">Finished</span>
            <span className="filter-count">{counts.finished}</span>
          </button>

          <button
            className={`history-filter-chip touchable ${activeFilter === 'exact' ? 'active' : ''}`}
            onClick={() => setActiveFilter('exact')}
          >
            <Trophy size={14} />
            <span className="filter-label">Exact</span>
            <span className="filter-count">{counts.exact}</span>
          </button>

          <button
            className={`history-filter-chip touchable ${activeFilter === 'correct' ? 'active' : ''}`}
            onClick={() => setActiveFilter('correct')}
          >
            <CheckCircle2 size={14} />
            <span className="filter-label">Correct</span>
            <span className="filter-count">{counts.correct}</span>
          </button>

          <button
            className={`history-filter-chip touchable ${activeFilter === 'wrong' ? 'active' : ''}`}
            onClick={() => setActiveFilter('wrong')}
          >
            <XCircle size={14} />
            <span className="filter-label">Wrong</span>
            <span className="filter-count">{counts.wrong}</span>
          </button>
        </div>
      </div>

      {/* Lista de Predicciones */}
      {filteredHistory.length === 0 ? (
        <div className="empty-state">
          <Gamepad2 size={48} />
          <p>
            {activeFilter === 'all' && 'No predictions yet'}
            {activeFilter === 'active' && 'No active predictions'}
            {activeFilter === 'finished' && 'No finished predictions'}
            {activeFilter === 'exact' && 'No exact predictions'}
            {activeFilter === 'correct' && 'No correct predictions'}
            {activeFilter === 'wrong' && 'No wrong predictions'}
          </p>
          <span className="empty-subtitle">
            {activeFilter === 'all' && 'Start predicting results!'}
          </span>
        </div>
      ) : (
        <div className="history-grid-modern">
          {filteredHistory.map((pred) => {
            const result = getPredictionResult(pred);
            const match = pred.matches;

            return (
              <div key={pred.id} className={`history-card-simple ${result.status} touchable`}>
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