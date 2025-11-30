import React from 'react';
import { Trophy, Target, Award } from 'lucide-react';
import '../styles/NavigationTabs.css';

export default function NavigationTabs({ activeTab, onTabChange }) {
  return (
    <div className="navigation-tabs">

      {/* TAB: PARTIDOS */}
      <button
        className={`nav-tab ${activeTab === 'matches' ? 'active' : ''}`}
        onClick={() => onTabChange('matches')}
      >
        <Target size={20} />
        <span>Partidos</span>
        <div className="tab-indicator"></div>
      </button>

      {/* TAB: LIGAS */}
      <button
        className={`nav-tab ${activeTab === 'leagues' ? 'active' : ''}`}
        onClick={() => onTabChange('leagues')}
      >
        <Trophy size={20} />
        <span>Ligas</span>
        <div className="tab-indicator"></div>
      </button>

      {/* TAB: PREMIOS */}
      <button
        className={`nav-tab ${activeTab === 'awards' ? 'active' : ''}`}
        onClick={() => onTabChange('awards')}
      >
        <Award size={20} />
        <span>Premios</span>
        <div className="tab-indicator"></div>
      </button>
    </div>
  );
}
