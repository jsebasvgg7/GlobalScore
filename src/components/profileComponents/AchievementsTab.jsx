// src/components/profileComponents/AchievementsTab.jsx
import React from 'react';
import { Layers, Crown, Shield, Award, Target, Activity, Gem } from 'lucide-react';
import { getIconEmoji, getCategoryColor } from '../../utils/profileUtils';

export default function AchievementsTab({ 
  activeTitle,
  userTitles,
  userAchievements,
  availableAchievements,
  achievementsLoading
}) {
  return (
    <div className="tab-content-wrapper">
      {/* Active Title */}
      {activeTitle && (
        <div className="active-title-card" style={{ borderColor: activeTitle.color }}>
          <div className="title-icon-large" style={{ background: `${activeTitle.color}15` }}>
            <Gem size={24} style={{ color: activeTitle.color }} />
          </div>
          <div className="title-card-info">
            <div className="title-card-name" style={{ color: activeTitle.color }}>{activeTitle.name}</div>
            <div className="title-card-desc">{activeTitle.description}</div>
          </div>
        </div>
      )}

      {/* Titles Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <Layers size={18} />
          <h3>Títulos</h3>
          <span className="count-badge-modern">{userTitles.length}</span>
        </div>
        
        {achievementsLoading ? (
          <div className="loading-state">
            <Activity size={24} className="spinner" />
          </div>
        ) : userTitles.length === 0 ? (
          <div className="empty-state">
            <Shield size={32} />
            <p>Aún no has obtenido títulos</p>
          </div>
        ) : (
          <div className="titles-list">
            {userTitles.map((title) => (
              <div key={title.id} className="title-list-item" style={{ borderLeftColor: title.color }}>
                <div className="title-item-icon" style={{ color: title.color }}>
                  <Crown size={18} />
                </div>
                <div className="title-item-content">
                  <div className="title-item-name" style={{ color: title.color }}>{title.name}</div>
                  <div className="title-item-desc">{title.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div className="section-modern">
        <div className="section-header-modern">
          <Award size={18} />
          <h3>Logros</h3>
          <span className="count-badge-modern">{userAchievements.length}/{availableAchievements.length}</span>
        </div>
        
        {achievementsLoading ? (
          <div className="loading-state">
            <Activity size={24} className="spinner" />
          </div>
        ) : userAchievements.length === 0 ? (
          <div className="empty-state">
            <Target size={32} />
            <p>Comienza a hacer predicciones para desbloquear logros</p>
          </div>
        ) : (
          <div className="achievements-grid-modern">
            {userAchievements.map((achievement) => (
              <div key={achievement.id} className="achievement-card-modern">
                <div className="achievement-emoji-icon">{getIconEmoji(achievement.icon)}</div>
                <div className="achievement-card-content">
                  <div className="achievement-card-name">{achievement.name}</div>
                  <div className="achievement-card-desc">{achievement.description}</div>
                  <div className="achievement-category-badge" style={{ background: `${getCategoryColor(achievement.category)}15`, color: getCategoryColor(achievement.category) }}>
                    {achievement.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}