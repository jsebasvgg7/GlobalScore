// src/components/profileComponents/OverviewTab.jsx
import React from 'react';
import { Trophy, Zap, Target, BarChart3 } from 'lucide-react';
import { calculateLevelProgress, calculateAccuracy } from '../../utils/profileUtils';

export default function OverviewTab({ userData, currentUser, userRanking }) {
  const accuracy = calculateAccuracy(currentUser);
  const { pointsInLevel, pointsToNextLevel, levelProgress } = calculateLevelProgress(userData, currentUser);

  return (
    <div className="tab-content-wrapper" data-tab="overview">
      {/* Ranking */}
      <div className="ranking-card-modern">
        <div className="ranking-card-header">
          <Trophy size={20} />
          <span>Ranking Global</span>
        </div>
        <div className="ranking-position-display">
          <div className="position-large">#{userRanking.position || '--'}</div>
          <div className="position-context">de {userRanking.totalUsers} jugadores</div>
        </div>
      </div>

      {/* Level Card */}
      <div className="level-card-modern">
        <div className="level-card-header">
          <div className="level-icon-wrapper">
            <Zap size={20} />
          </div>
          <div className="level-info">
            <div className="level-number">Nivel {userData.level}</div>
            <div className="level-subtitle">{pointsInLevel} de 20 puntos</div>
          </div>
          <div className="points-to-next">{pointsToNextLevel} pts</div>
        </div>
        <div className="level-progress-bar">
          <div className="level-progress-fill" style={{ width: `${levelProgress}%` }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-grid">
        <div className="stat-card-modern predictions">
          <div className="stat-card-icon">
            <Target size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{currentUser?.predictions || 0}</div>
            <div className="stat-card-label">Predicciones</div>
          </div>
        </div>

        <div className="stat-card-modern points">
          <div className="stat-card-icon">
            <Zap size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{currentUser?.points || 0}</div>
            <div className="stat-card-label">Puntos</div>
          </div>
        </div>

        <div className="stat-card-modern accuracy">
          <div className="stat-card-icon">
            <BarChart3 size={20} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{accuracy}%</div>
            <div className="stat-card-label">Precisión</div>
          </div>
        </div>
      </div>
    </div>
  );
}