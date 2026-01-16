// src/components/profileComponents/HistoryTab.jsx
import React from 'react';
import { Activity, Gamepad2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getPredictionResult } from '../../utils/profileUtils';

export default function HistoryTab({ predictionHistory, historyLoading }) {
  return (
    <div className="tab-content-wrapper">
      {historyLoading ? (
        <div className="loading-state large">
          <Activity size={32} className="spinner" />
          <p>Cargando historial...</p>
        </div>
      ) : predictionHistory.length === 0 ? (
        <div className="empty-state large">
          <Gamepad2 size={48} />
          <p>Aún no has hecho predicciones</p>
          <span className="empty-subtitle">¡Comienza a predecir resultados!</span>
        </div>
      ) : (
        <div className="history-list-modern">
          {predictionHistory.map((pred) => {
            const result = getPredictionResult(pred);
            const match = pred.matches;

            return (
              <div key={pred.id} className={`history-card-modern ${result.status}`}>
                <div className="history-card-header">
                  <span className="league-badge-modern">{match?.league}</span>
                  <span className="match-date-modern">{match?.date}</span>
                </div>
                
                <div className="teams-display">
                  <div className="team-display">
                    <span className="team-logo-modern">{match?.home_team_logo}</span>
                    <span className="team-name-modern">{match?.home_team}</span>
                  </div>
                  <div className="vs-divider">VS</div>
                  <div className="team-display">
                    <span className="team-name-modern">{match?.away_team}</span>
                    <span className="team-logo-modern">{match?.away_team_logo}</span>
                  </div>
                </div>

                <div className="scores-display">
                  <div className="score-section">
                    <span className="score-label-modern">Tu predicción</span>
                    <span className="score-value-modern">{pred.home_score} - {pred.away_score}</span>
                  </div>
                  
                  {match?.status === 'finished' && (
                    <div className="score-section">
                      <span className="score-label-modern">Resultado</span>
                      <span className="score-value-modern">{match.result_home} - {match.result_away}</span>
                    </div>
                  )}
                </div>

                <div className={`result-badge-modern ${result.status}`}>
                  {result.status === 'exact' && <CheckCircle2 size={16} />}
                  {result.status === 'correct' && <CheckCircle2 size={16} />}
                  {result.status === 'wrong' && <XCircle size={16} />}
                  {result.status === 'pending' && <Clock size={16} />}
                  <span>{result.label}</span>
                  {result.points > 0 && <span className="points-earned">+{result.points}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}