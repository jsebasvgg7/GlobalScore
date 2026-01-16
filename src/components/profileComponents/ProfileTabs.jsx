// src/components/profileComponents/ProfileTabs.jsx
import React from 'react';
import { Grid3x3, Trophy, List, Edit2 } from 'lucide-react';

const profileTabs = [
  { id: 'overview', label: 'Resumen', icon: Grid3x3 },
  { id: 'achievements', label: 'Logros', icon: Trophy },
  { id: 'history', label: 'Historial', icon: List },
  { id: 'edit', label: 'Editar', icon: Edit2 }
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
          >
            <IconComponent size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}