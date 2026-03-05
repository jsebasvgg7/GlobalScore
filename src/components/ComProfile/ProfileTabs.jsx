// src/components/profileComponents/ProfileTabs.jsx
import React from 'react';
import { Grid3x3, Trophy, List, Edit2, Crown } from 'lucide-react';

const profileTabs = [
  { id: 'overview', icon: Grid3x3, label: 'Estadisticas' },
  { id: 'achievements', icon: Trophy, label: 'Logros' },
  { id: 'championships', icon: Crown, label: 'Campeonatos' },
  { id: 'history', icon: List, label: 'Historial' },
  { id: 'edit', icon: Edit2, label: 'Editar' },
];


export default function ProfileTabs({ activeTab, setActiveTab }) {
  return (
    <div className="profile-tabs-modern">
      {profileTabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            className={`tab-btn-modern ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
          >
            <IconComponent size={24} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}