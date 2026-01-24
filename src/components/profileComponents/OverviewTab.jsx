// src/components/profileComponents/OverviewTab.jsx
import React from 'react';
import { 
  Trophy, 
  Zap, 
  Target, 
  BarChart3, 
  Heart
} from 'lucide-react';
import { calculateLevelProgress, calculateAccuracy } from '../../utils/profileUtils';

export default function OverviewTab({ userData, currentUser, userRanking }) {
  const accuracy = calculateAccuracy(currentUser);
  const { pointsInLevel, pointsToNextLevel, levelProgress } = calculateLevelProgress(userData, currentUser);

  const statsSections = [
    {
      id: 'stats',
      title: 'Predictions',
      icon: Target,
      color: 'yellow',
      count: currentUser?.predictions || 0,
    },
    {
      id: 'points',
      title: 'Total Points',
      icon: Zap,
      color: 'pink',
      count: currentUser?.points || 0,
    },
    {
      id: 'accuracy',
      title: 'Accuracy Rate',
      icon: BarChart3,
      color: 'green',
      count: null,
      subtitle: `${accuracy}% success rate`,
    },
    {
      id: 'ranking',
      title: 'Global Ranking',
      icon: Trophy,
      color: 'teal',
      count: userRanking.position || '--',
      subtitle: `of ${userRanking.totalUsers} players`,
    },
    {
      id: 'championships',
      title: 'Championships',
      icon: Heart,
      color: 'blue',
      count: userData.monthly_championships || 0,
    },
  ];

  return (
    <div className="tab-content-wrapper">
      {/* Level Progress Card - Ahora primero */}
      <div className="level-card-modern">
        <div className="level-card-header">
          <div className="level-icon-wrapper">
            <Zap size={20} />
          </div>
          <div className="level-info">
            <div className="level-number">Level {userData.level}</div>
            <div className="level-subtitle">{pointsInLevel} of 20 points</div>
          </div>
          <div className="points-to-next">{pointsToNextLevel} pts</div>
        </div>
        <div className="level-progress-bar">
          <div className="level-progress-fill" style={{ width: `${levelProgress}%` }}></div>
        </div>
      </div>

      {/* Stats List */}
      <div className="stats-list">
        {statsSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <div key={section.id} className="stat-item">
              <div className={`icon-wrapper ${section.color}`}>
                <IconComponent />
              </div>
              <div className="item-content">
                <div className="item-info">
                  <div className="item-title">{section.title}</div>
                  {section.subtitle && (
                    <div className="item-subtitle">{section.subtitle}</div>
                  )}
                </div>
                {section.count !== null && (
                  <div className="item-count">{section.count}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}