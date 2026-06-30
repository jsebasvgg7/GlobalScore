import React from 'react';
import { Calendar, RotateCcw, Trophy } from 'lucide-react';

export default function AdminTrophiesSection({ top10, history, onResetStats }) {
  return (
    <div className="admin-crowns-section">
      {/* Columna izquierda: Top 10 */}
      <div>
        <div className="section-header">
          <div>
            <h3>Ranking Global · Top 10</h3>
          </div>
          {onResetStats && (
            <button
              className="reset-stats-btn"
              onClick={onResetStats}
            >
              <RotateCcw size={11} />
              <span>Resetear</span>
            </button>
          )}
        </div>
        <div className="top10-list">
          {top10?.map((user, index) => (
            <div key={user.id} className={`top-user-card ${index === 0 ? 'top1' : ''}`}>
              <div className="position">{index + 1}</div>
              <div className="user-info">
                <span className="name">{user.name}</span>
                <span className="points">{user.points || 0} pts</span>
                <span className="championships">
                  <Trophy size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {user.global_championships || 0} trofeos
                </span>
              </div>
            </div>
          ))}
          {(!top10 || top10.length === 0) && (
            <p className="empty-history">Sin usuarios con puntos globales</p>
          )}
        </div>
      </div>

      {/* Columna derecha: Historial */}
      <div>
        <div className="section-header">
          <div>
            <h3>Historial de Trofeos</h3>
          </div>
        </div>
        <div className="history-list">
          {history?.map(historyItem => (
            <div key={historyItem.id} className="history-item">
              <div className="history-info">
                <span className="month">{historyItem.edition_label}</span>
                <span className="winner">{historyItem.users.name}</span>
                <span className="points">{historyItem.points} pts</span>
              </div>
              <div className="history-meta">
                <Calendar size={11} />
                <span>{new Date(historyItem.awarded_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {(!history || history.length === 0) && (
            <p className="empty-history">Sin trofeos otorgados aún</p>
          )}
        </div>
      </div>
    </div>
  );
}