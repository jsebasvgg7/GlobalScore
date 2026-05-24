import React from 'react';
import { Trophy, Target, Award, Shield, Package, Crown, Image, BookOpen } from 'lucide-react';

const TAB_LABELS = {
  historical: 'His',
  matches: 'Par',
  leagues: 'Lig',
  awards: 'Pre',
  achievements: 'Log',
  titles: 'Tít',
  crowns: 'Cor',
  banners: 'Ban',
};

export default function AdminNavigationTabs({ activeSection, setActiveSection, stats }) {
  const tabs = [
    { id: 'historical', icon: BookOpen, badge: 0 },
    { id: 'matches', icon: Target, badge: stats.matches.pending },
    { id: 'leagues', icon: Trophy, badge: stats.leagues.active },
    { id: 'awards', icon: Award, badge: stats.awards.active },
    { id: 'achievements', icon: Shield, badge: 0 },
    { id: 'titles', icon: Package, badge: 0 },
    { id: 'crowns', icon: Crown, badge: stats.crowns?.thisMonth === 0 ? '!' : 0 },
    { id: 'banners', icon: Image, badge: 0 },
  ];

  return (
    <div className="admin-nav-tabs">
      {tabs.map(({ id, icon: Icon, badge }) => (
        <button
          key={id}
          className={`admin-nav-tab ${activeSection === id ? 'active' : ''}`}
          onClick={() => setActiveSection(id)}
        >
          <Icon size={14} />
          <span>{TAB_LABELS[id]}</span>
          {badge !== 0 && (
            <span className={`tab-badge ${badge === '!' ? 'tab-badge--alert' : ''}`}>
              {badge === '!' ? '' : badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}