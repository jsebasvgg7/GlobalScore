import React from 'react';
import { Trophy, Target, Award, Shield, Package, Crown, Image } from 'lucide-react';

export default function AdminNavigationTabs({ activeSection, setActiveSection, stats }) {
  const tabs = [
    { id: 'matches',      icon: Target,  badge: stats.matches.pending },
    { id: 'leagues',      icon: Trophy,  badge: stats.leagues.active },
    { id: 'awards',       icon: Award,   badge: stats.awards.active },
    { id: 'achievements', icon: Shield,  badge: 0 },
    { id: 'titles',       icon: Package, badge: 0 },
    { id: 'crowns',       icon: Crown,   badge: stats.crowns.thisMonth === 0 ? 1 : 0 },
    { id: 'banners',      icon: Image,   badge: 0 },
  ];

  return (
    <div className="admin-nav-tabs">
      {tabs.map(({ id, icon: Icon, badge }) => (
        <button
          key={id}
          className={`admin-nav-tab ${activeSection === id ? 'active' : ''}`}
          onClick={() => setActiveSection(id)}
          aria-label={id}
        >
          <Icon size={20} />
          {badge > 0 && <span className="tab-badge">{badge}</span>}
        </button>
      ))}
    </div>
  );
}