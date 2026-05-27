import React from 'react';
import '../styles/AlbumsPageNav.css';

const TABS = [
    {
        id: 'resumen',
        label: 'Resumen',
        icon: (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
                <rect x="8.5" y="1.5" width="5" height="5" rx="1" />
                <rect x="1.5" y="8.5" width="5" height="5" rx="1" />
                <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
            </svg>
        ),
        coming: false,
    },
    {
        id: 'coleccion',
        label: 'Colección',
        icon: (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 2h9a1 1 0 0 1 1 1v10l-2-1.5L9 13l-1.5-1.5L6 13l-2-1.5L2 13V3a1 1 0 0 1 1-1z" />
                <line x1="5" y1="6" x2="10" y2="6" />
                <line x1="5" y1="9" x2="8" y2="9" />
            </svg>
        ),
        coming: false,
    },
    {
        id: 'sobres',
        label: 'Sobres',
        icon: (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1.5" y="3.5" width="12" height="9" rx="1.2" />
                <path d="M1.5 5.5l6 4 6-4" />
            </svg>
        ),
        coming: true,
    },
    {
        id: 'misiones',
        label: 'Misiones',
        icon: (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7.5 1.5l1.5 4h4.5l-3.5 2.5 1.3 4L7.5 9.5 4.2 12l1.3-4L2 5.5H6.5z" />
            </svg>
        ),
        coming: true,
    },
];

export default function AlbumsPageNav({ active, onChange }) {
    return (
        <nav className="apn-root" role="tablist" aria-label="Navegación principal de álbumes">
            <div className="apn-inner">
                <div className="apn-track">
                    {TABS.map((tab) => {
                        const isActive = active === tab.id && !tab.coming;
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={isActive}
                                aria-disabled={tab.coming}
                                className={`apn-tab${isActive ? ' apn-tab--active' : ''}${tab.coming ? ' apn-tab--coming' : ''}`}
                                onClick={() => !tab.coming && onChange(tab.id)}
                                title={tab.coming ? 'Próximamente' : undefined}
                            >
                                <span className="apn-tab-icon" aria-hidden="true">
                                    {tab.icon}
                                </span>
                                <span className="apn-tab-label">{tab.label}</span>
                                {tab.coming && (
                                    <span className="apn-soon-pill" aria-label="Próximamente">
                                        Pronto
                                    </span>
                                )}
                                {isActive && <span className="apn-underline" aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
