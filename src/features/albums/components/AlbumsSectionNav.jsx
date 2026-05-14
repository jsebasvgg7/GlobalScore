import React from 'react';
import '../styles/AlbumsSectionNav.css';

const TABS = [
    { id: 'legendary', label: 'Legendarios', icon: '👑' },
    { id: 'stars', label: 'Estrellas', icon: '⭐' },
    { id: 'cult', label: 'Culto', icon: '📒' },
];

export default function AlbumsSectionNav({ active, onChange }) {
    return (
        <nav className="asn-root">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    className={`asn-tab${active === tab.id ? ' asn-tab--active' : ''}`}
                    onClick={() => onChange(tab.id)}
                >
                    <span className="asn-icon">{tab.icon}</span>
                    <span className="asn-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}