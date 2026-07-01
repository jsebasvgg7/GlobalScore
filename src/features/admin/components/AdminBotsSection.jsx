import React from 'react';
import { Bot } from 'lucide-react';

export default function AdminBotsSection({ bots = [], onEdit }) {
  return (
    <div className="admin-bots-section">
      <div className="section-header">
        <div>
          <h3>Bots de Relleno · {bots.length}</h3>
        </div>
      </div>

      <div className="top10-list admin-bots-list">
        {bots.map((bot) => (
          <button
            key={bot.id}
            type="button"
            className="top-user-card admin-bot-card"
            onClick={() => onEdit(bot)}
          >
            <div className="adm-user-av admin-bot-av">
              {bot.avatar_url ? (
                <img src={bot.avatar_url} alt={bot.name} />
              ) : (
                <Bot size={14} />
              )}
            </div>
            <div className="user-info">
              <span className="name">{bot.name}</span>
              <span className="points">
                {bot.points || 0} pts global · {bot.monthly_points || 0} pts mensual
              </span>
            </div>
          </button>
        ))}
        {bots.length === 0 && (
          <p className="empty-history">
            No hay bots creados todavía. Corre el script SQL del Paso 0.
          </p>
        )}
      </div>
    </div>
  );
}