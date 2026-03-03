// src/components/profileComponents/MonthlyChampionshipsTab.jsx
import React from 'react';
import { Crown, Calendar, Trophy, TrendingUp, Activity } from 'lucide-react';

export default function MonthlyChampionshipsTab({ 
  userData, 
  crownHistory, 
  monthlyStats,
  championshipsLoading 
}) {
  return (
    <div className="tab-content-wrapper">
      {/* Stats Mensuales Actuales */}
      <div className="section-modern">
        <div className="section-header-modern">
          <Calendar size={18} />
          <h3>Mes Actual</h3>
        </div>
        
        <div className="monthly-stats-grid">
          <div className="monthly-stat-card">
            <div className="monthly-stat-icon">
              <TrendingUp size={20} />
            </div>
            <div className="monthly-stat-content">
              <div className="monthly-stat-value">{userData?.monthly_points || 0}</div>
              <div className="monthly-stat-label">Puntos</div>
            </div>
          </div>

          <div className="monthly-stat-card">
            <div className="monthly-stat-icon">
              <Trophy size={20} />
            </div>
            <div className="monthly-stat-content">
              <div className="monthly-stat-value">{userData?.monthly_predictions || 0}</div>
              <div className="monthly-stat-label">Predicciones</div>
            </div>
          </div>

          <div className="monthly-stat-card">
            <div className="monthly-stat-icon">
              <Activity size={20} />
            </div>
            <div className="monthly-stat-content">
              <div className="monthly-stat-value">{userData?.monthly_correct || 0}</div>
              <div className="monthly-stat-label">Acertadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Total de Campeonatos */}
      <div className="section-modern">
        <div className="section-header-modern">
          <Crown size={18} />
          <h3>Campeonatos Ganados</h3>
          <span className="count-badge-modern">{userData?.monthly_championships || 0}</span>
        </div>
        
        {userData?.monthly_championships > 0 ? (
          <div className="crowns-display-large">
            {Array.from({ length: userData.monthly_championships || 0 }).map((_, index) => (
              <div key={index} className="crown-showcase">
                <Crown size={48} className="crown-icon-large" />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Crown size={32} />
            <p>Aún no has ganado ningún campeonato mensual</p>
            <span className="empty-subtitle">¡Sigue acumulando puntos este mes!</span>
          </div>
        )}
      </div>

      {/* Historial de Campeonatos */}
      {crownHistory && crownHistory.length > 0 && (
        <div className="section-modern">
          <div className="section-header-modern">
            <Calendar size={18} />
            <h3>Historial de Victorias</h3>
          </div>
          
          {championshipsLoading ? (
            <div className="loading-state">
              <Activity size={24} className="spinner" />
            </div>
          ) : (
            <div className="championships-history-list">
              {crownHistory.map((championship, index) => (
                <div key={championship.id} className="championship-history-card">
                  <div className="championship-rank">
                    <Crown size={24} className="championship-crown" />
                    <span className="championship-position">#{index + 1}</span>
                  </div>
                  
                  <div className="championship-info">
                    <div className="championship-month">{championship.month_year}</div>
                    <div className="championship-details">
                      <span className="championship-points">{championship.points} puntos</span>
                      <span className="championship-date">
                        {new Date(championship.awarded_at).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}