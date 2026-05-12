import React from 'react';
import { Calendar, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminMatchesList({ matches, onFinish, onDelete }) {
  // Color accent por liga (fallback al purple)
  const leagueColors = {
    'Premier League': '#23c87a',
    'La Liga':        '#f5a623',
    'Serie A':        '#7c6ff7',
    'Bundesliga':     '#23c87a',
    'Ligue 1':        '#f25f5c',
    'Champions League': '#7c6ff7',
  };

  const getLeagueColor = (league) =>
    leagueColors[league] || 'var(--accent)';

  return (
    <div className="match-list-wrap">
      {/* Header columnas */}
      <div className="match-list-header">
        <span className="mlh-match">Partido</span>
        <span className="mlh-date">Fecha</span>
        <span className="mlh-status">Estado</span>
        <span className="mlh-actions">Acciones</span>
      </div>

      {/* Filas */}
      <div className="match-list-body">
        {matches.map((match) => (
          <div key={match.id} className="match-list-row">
            {/* Info */}
            <div className="mlr-info">
              <div
                className="mlr-league-bar"
                style={{ background: getLeagueColor(match.league) }}
              />
              <div className="mlr-names">
                <div className="mlr-teams">
                  <span>{match.home_team_logo}</span>
                  <span className="mlr-team-name">{match.home_team}</span>
                  <span className="mlr-vs">vs</span>
                  <span className="mlr-team-name">{match.away_team}</span>
                  <span>{match.away_team_logo}</span>
                </div>
                <div className="mlr-league-name">{match.league}</div>
              </div>
            </div>

            {/* Fecha */}
            <div className="mlr-date">
              <Calendar size={12} />
              <span>{match.date}</span>
            </div>

            {/* Estado */}
            <div className="mlr-status">
              <span className={`match-status-badge ${match.status}`}>
                <span className="msb-dot" />
                {match.status === 'pending' ? 'Pendiente' : 'Finalizado'}
              </span>
            </div>

            {/* Acciones */}
            <div className="mlr-actions">
              {match.status === 'pending' && (
                <button
                  className="mlr-btn finish"
                  onClick={() => onFinish(match)}
                >
                  <CheckCircle size={13} />
                  <span>Finalizar</span>
                </button>
              )}
              <button
                className="mlr-btn delete"
                onClick={() => onDelete(match.id)}
                aria-label="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer count */}
      {matches.length > 0 && (
        <div className="match-list-footer">
          <span>
            Mostrando <strong>{matches.length}</strong> partido
            {matches.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}