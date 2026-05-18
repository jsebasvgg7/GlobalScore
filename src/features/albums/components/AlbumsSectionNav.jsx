import React from 'react';
import '../styles/AlbumsSectionNav.css';

const TABS = [
    {
        id: 'legendary',
        label: 'Legendarios',
        sublabel: 'Álbumes',
        icon: (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 1L8.5 5h4l-3.2 2.3 1.2 3.7L7 8.8l-3.5 2.2 1.2-3.7L1.5 5h4z" />
            </svg>
        ),
    },
    {
        id: 'stars',
        label: 'Estrellas',
        sublabel: 'Colección',
        icon: (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" />
                <circle cx="7" cy="7" r="2.5" />
                <line x1="7" y1="1" x2="7" y2="1.5" strokeWidth="1.8" />
                <line x1="7" y1="12.5" x2="7" y2="13" strokeWidth="1.8" />
                <line x1="1" y1="7" x2="1.5" y2="7" strokeWidth="1.8" />
                <line x1="12.5" y1="7" x2="13" y2="7" strokeWidth="1.8" />
            </svg>
        ),
    },
    {
        id: 'cult',
        label: 'Culto',
        sublabel: 'Especiales',
        icon: (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 11V4.5C2 4.5 4 3.5 7 4.5 10 3.5 12 4.5 12 4.5V11" />
                <path d="M7 4.5V11" />
                <line x1="3.5" y1="6.5" x2="5.5" y2="6.1" />
                <line x1="3.5" y1="8.5" x2="5.5" y2="8.1" />
                <line x1="10.5" y1="6.5" x2="8.5" y2="6.1" />
                <line x1="10.5" y1="8.5" x2="8.5" y2="8.1" />
            </svg>
        ),
    },
];

export default function AlbumsSectionNav({ active, onChange }) {
    return (
        <nav className="asn-root" role="tablist" aria-label="Secciones del álbum">
            <div className="asn-track">
                {TABS.map((tab) => {
                    const isActive = active === tab.id;
                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            className={`asn-tab${isActive ? ' asn-tab--active' : ''}`}
                            onClick={() => onChange(tab.id)}
                        >
                            <span className="asn-tab-inner">
                                <span className="asn-icon-box" aria-hidden="true">
                                    {tab.icon}
                                </span>
                                <span className="asn-text-block">
                                    <span className="asn-sublabel">{tab.sublabel}</span>
                                    <span className="asn-label">{tab.label}</span>
                                </span>
                            </span>
                            {isActive && <span className="asn-active-bar" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}