import React from 'react';
import { Target, Trophy, Award, ArrowUpDown, Filter } from 'lucide-react';
import '../../styles/StylesNavigation/NavigationTabs.css';

export default function NavigationTabs({
  activeTab,
  onTabChange,
  onSortClick,
  onFilterClick,
  sortActive,
  matchCount   = 0,
  leagueCount  = 0,
  awardCount   = 0,
}) {
  return (
    <div className="nt-bar">

      {/* Grupo principal */}
      <div className="nt-group">
        <button
          className={`nt-tab${activeTab === 'matches' ? ' nt-tab--active' : ''}`}
          onClick={() => onTabChange('matches')}
        >
          <Target size={13} />
          <span>Partidos</span>
          {matchCount > 0 && (
            <span className={`nt-count${activeTab === 'matches' ? ' nt-count--active' : ''}`}>
              {matchCount}
            </span>
          )}
        </button>

        <button
          className={`nt-tab${activeTab === 'leagues' ? ' nt-tab--active' : ''}`}
          onClick={() => onTabChange('leagues')}
        >
          <Trophy size={13} />
          <span>Ligas</span>
          {leagueCount > 0 && (
            <span className={`nt-count${activeTab === 'leagues' ? ' nt-count--active' : ''}`}>
              {leagueCount}
            </span>
          )}
        </button>

        <button
          className={`nt-tab${activeTab === 'awards' ? ' nt-tab--active' : ''}`}
          onClick={() => onTabChange('awards')}
        >
          <Award size={13} />
          <span>Premios</span>
          {awardCount > 0 && (
            <span className={`nt-count${activeTab === 'awards' ? ' nt-count--active' : ''}`}>
              {awardCount}
            </span>
          )}
        </button>
      </div>

      {/* Controles */}
      {(onSortClick || onFilterClick) && (
        <div className="nt-controls">
          {onSortClick && (
            <button
              className={`nt-ctrl-btn${sortActive ? ' nt-ctrl-btn--active' : ''}`}
              onClick={onSortClick}
              title="Ordenar"
            >
              <ArrowUpDown size={12} />
            </button>
          )}
          {onFilterClick && (
            <button
              className="nt-ctrl-btn"
              onClick={onFilterClick}
              title="Filtrar"
            >
              <Filter size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}