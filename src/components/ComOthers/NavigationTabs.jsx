import React from 'react';
import { Trophy, Target, Award, ArrowUpDown, Filter } from 'lucide-react';
import '../../styles/StylesOthers/NavigationTabs.css';

export default function NavigationTabs({ activeTab, onTabChange, onSortClick, onFilterClick, sortActive }) {
  return (
    <div className="navigation-tabs">

      <button
        className={`nav-tab ${activeTab === 'matches' ? 'active' : ''}`}
        onClick={() => onTabChange('matches')}
      >
        <Target size={20} />
        <span>Partidos</span>
        <div className="tab-indicator"></div>
      </button>

      <button
        className={`nav-tab ${activeTab === 'leagues' ? 'active' : ''}`}
        onClick={() => onTabChange('leagues')}
      >
        <Trophy size={20} />
        <span>Ligas</span>
        <div className="tab-indicator"></div>
      </button>

      <button
        className={`nav-tab ${activeTab === 'awards' ? 'active' : ''}`}
        onClick={() => onTabChange('awards')}
      >
        <Award size={20} />
        <span>Premios</span>
        <div className="tab-indicator"></div>
      </button>

      {/* Ordenar */}
      {onSortClick && (
        <button
          className={`nav-tab nav-tab-control ${sortActive ? 'active' : ''}`}
          onClick={onSortClick}
          title="Ordenar"
        >
          <ArrowUpDown size={18} />
          <div className="tab-indicator"></div>
        </button>
      )}

      {/* Filtrar */}
      {onFilterClick && (
        <button
          className="nav-tab nav-tab-control"
          onClick={onFilterClick}
          title="Filtrar"
        >
          <Filter size={18} />
          <div className="tab-indicator"></div>
        </button>
      )}

    </div>
  );
}