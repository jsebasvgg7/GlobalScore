// src/components/ComProfile/ProfileTabs.jsx
import React from 'react';
import { Grid3x3, Trophy, List, Edit2, Crown, User, Moon, Bell, Shield, Database, Info } from 'lucide-react';

const profileTabs = [
  { id: 'overview',                icon: Grid3x3,  label: 'Estadísticas',    group: 'profile' },
  { id: 'achievements',            icon: Trophy,   label: 'Logros',           group: 'profile' },
  { id: 'championships',           icon: Crown,    label: 'Campeonatos',      group: 'profile' },
  { id: 'history',                 icon: List,     label: 'Historial',        group: 'profile' },
  { id: 'edit',                    icon: Edit2,    label: 'Editar',           group: 'profile' },
  { id: 'settings-account',        icon: User,     label: 'Cuenta',           group: 'settings' },
  { id: 'settings-appearance',     icon: Moon,     label: 'Apariencia',       group: 'settings' },
  { id: 'settings-notifications',  icon: Bell,     label: 'Notificaciones',   group: 'settings' },
  { id: 'settings-privacy',        icon: Shield,   label: 'Privacidad',       group: 'settings' },
  { id: 'settings-data',           icon: Database, label: 'Datos',            group: 'settings' },
  { id: 'settings-info',           icon: Info,     label: 'Información',      group: 'settings' },
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