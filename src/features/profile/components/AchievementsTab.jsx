import React from 'react';
import {
  Layers, Crown, Shield, Award, Target, Activity, Gem, Lock, Star,
  // Predicciones
  Crosshair, Hash, TrendingUp, BarChart2, BookOpen,
  // Aciertos
  CheckCircle, Eye, Aperture, Navigation, CheckSquare, Compass, BadgeCheck,
  // Rachas
  Repeat2, Flame, Zap, Calendar, Cpu, Timer, Infinity, Rocket,
  // Puntos
  Circle, CircleDot, Trophy, Sparkles,
  // Especiales
  Percent, LayoutDashboard, Medal,
} from 'lucide-react';
import { getCategoryColor } from '../../utils/profileUtils';

/* ── Mapa icon-string → componente Lucide (igual que UserProfilePanel) ── */
const ICON_MAP = {
  Crosshair, Target, Hash, TrendingUp, Star,
  BarChart2, Activity, Award, BookOpen,
  CheckCircle, Eye, Aperture, Navigation, CheckSquare, Compass,
  ShieldCheck: BadgeCheck, BadgeCheck,
  Repeat2, Flame, Zap, Calendar, Cpu,
  Timer, Infinity, Rocket, Shield, Crown,
  Circle, CircleDot, Layers, Trophy, Gem,
  Sparkles, Percent, LayoutDashboard, Medal,
  Default: Star,
};

function LucideIcon({ name, size = 14, color }) {
  const Icon = ICON_MAP[name] ?? ICON_MAP.Default;
  return <Icon size={size} color={color} />;
}

/* ── Colores y labels por categoría ── */
const CATEGORY_COLORS = {
  predictions: '#8b7fc7',
  accuracy:    '#34d399',
  streaks:     '#ef4444',
  points:      '#f59e0b',
  crowns:      '#c9a227',
  special:     '#fb923c',
};

const CATEGORY_LABELS = {
  predictions: 'Predicciones',
  accuracy:    'Aciertos',
  streaks:     'Rachas',
  points:      'Puntos',
  crowns:      'Coronas',
  special:     'Especiales',
};

export default function AchievementsTab({ 
  activeTitle,
  userTitles,
  userAchievements,
  availableAchievements,
  achievementsLoading
}) {
  /* Separar desbloqueados / bloqueados */
  const unlockedIds = new Set(userAchievements.map(a => a.id));
  const locked = availableAchievements.filter(a => !unlockedIds.has(a.id));

  /* Agrupar desbloqueados por categoría */
  const grouped = userAchievements.reduce((acc, a) => {
    const cat = a.category || 'special';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="tab-content-wrapper">

      {/* ── Título activo ── */}
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

      {/* ── Títulos ── */}
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

      {/* ── Logros ── */}
      <div className="section-modern">
        <div className="section-header-modern">
          <Award size={18} />
          <h3>Logros</h3>
          <span className="count-badge-modern">
            {userAchievements.length}/{availableAchievements.length}
          </span>
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
          <>
            {/* Barra de progreso */}
            <div className="ach-progress-bar-wrap">
              <div
                className="ach-progress-bar-fill"
                style={{
                  width: `${availableAchievements.length > 0
                    ? Math.round((userAchievements.length / availableAchievements.length) * 100)
                    : 0}%`
                }}
              />
            </div>

            {/* Desbloqueados agrupados por categoría */}
            {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
              const items = grouped[catKey];
              if (!items || items.length === 0) return null;
              const color = CATEGORY_COLORS[catKey] || '#8b5cf6';
              return (
                <React.Fragment key={catKey}>
                  <div className="ach-cat-header">
                    <div className="ach-cat-line" style={{ background: color }} />
                    <span className="ach-cat-label">{catLabel}</span>
                    <span className="ach-cat-count" style={{ color }}>{items.length}</span>
                  </div>
                  <div className="achievements-grid-modern">
                    {items.map((achievement) => {
                      const color = CATEGORY_COLORS[achievement.category] || '#8b5cf6';
                      return (
                        <div key={achievement.id} className="achievement-card-modern achievement-card-modern--on">
                          {/* Icono Lucide en cuadrado de color */}
                          <div
                            className="achievement-icon-wrap"
                            style={{ background: color }}
                          >
                            <LucideIcon name={achievement.icon} size={15} color="#fff" />
                          </div>
                          <div className="achievement-card-content">
                            <div className="achievement-card-name">{achievement.name}</div>
                            <div className="achievement-card-desc">{achievement.description}</div>
                            <div
                              className="achievement-category-badge"
                              style={{
                                background: `${color}15`,
                                color,
                                borderColor: color,
                              }}
                            >
                              {catLabel}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Bloqueados */}
            {locked.length > 0 && (
              <>
                <div className="ach-cat-header">
                  <div className="ach-cat-line" style={{ background: '#ccc', opacity: 0.5 }} />
                  <span className="ach-cat-label" style={{ opacity: 0.45 }}>Bloqueados</span>
                  <span className="ach-cat-count" style={{ opacity: 0.35 }}>{locked.length}</span>
                </div>
                <div className="achievements-grid-modern">
                  {locked.map((achievement) => (
                    <div key={achievement.id} className="achievement-card-modern achievement-card-modern--off">
                      <div className="achievement-icon-wrap achievement-icon-wrap--locked">
                        <Lock size={13} style={{ opacity: 0.35 }} />
                      </div>
                      <div className="achievement-card-content">
                        <div className="achievement-card-name" style={{ opacity: 0.35 }}>
                          {achievement.name}
                        </div>
                        <div className="achievement-card-desc" style={{ opacity: 0.3 }}>
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}