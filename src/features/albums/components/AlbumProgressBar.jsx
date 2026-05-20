import React from 'react';
import '../styles/AlbumProgressBar.css';
import '../styles/mobile/AlbumProgressBar.mobile.css';

function PackIcon({ filled }) {
    return (
        <svg
            className={`apb-pack-icon${filled ? ' apb-pack-icon--filled' : ''}`}
            viewBox="0 0 20 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect x="1" y="5" width="18" height="20" rx="1.5" className="apb-pack-body" />
            <rect x="1" y="5" width="18" height="5" rx="1.5" className="apb-pack-tab" />
            <line x1="5" y1="5" x2="5" y2="25" className="apb-pack-spine" strokeWidth="1" />
            {[8, 11, 14, 17].map(y => (
                <line key={y} x1="7" y1={y} x2="17" y2={y} className="apb-pack-line" strokeWidth="0.8" />
            ))}
            <line x1="4" y1="7.5" x2="16" y2="7.5" className="apb-pack-perf" strokeDasharray="1.5 2" strokeWidth="0.7" />
        </svg>
    );
}

export default function AlbumProgressBar({ percent, packsAvailable, boostActive = false, boostPacksRemaining = 0, compact = false }) {
    if (compact) {
        return (
            <div className="apb-root apb-root--compact">
                <div className={`apb-compact-track${boostActive ? ' apb-compact-track--boost' : ''}`}>
                    <div className="apb-compact-fill" style={{ width: `${percent}%` }} />
                    <div className="apb-compact-glow" style={{ left: `${percent}%` }} />
                </div>
            </div>
        );
    }

    return (
        <div className={`apb-root${boostActive ? ' apb-root--boost' : ''}`}>
            <div className="apb-header">
                <div className="apb-header-left">
                    <span className="apb-eyebrow">
                        {boostActive ? 'Boost activo' : 'Próximo boost'}
                    </span>
                    <div className="apb-mechanic-hint">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                            <polygon points="0,8 8,8 4,0" className="apb-hint-arrow" />
                        </svg>
                        <span>
                            {boostActive
                                ? `probabilidades mejoradas · ${boostPacksRemaining} ${boostPacksRemaining === 1 ? 'sobre' : 'sobres'}`
                                : 'cada 10 sobres abiertos'}
                        </span>
                    </div>
                </div>
                {boostActive ? (
                    <span className="apb-boost-badge">⚡ {boostPacksRemaining}</span>
                ) : (
                    <span className="apb-pct-badge">{percent}<span className="apb-pct-sym">%</span></span>
                )}
            </div>

            <div className="apb-track-wrap">
                <div className="apb-track">
                    <div className="apb-fill" style={{ width: boostActive ? '100%' : `${percent}%` }}>
                        <div className="apb-fill-shimmer" />
                    </div>
                    <div className="apb-fill-glow" style={{ left: boostActive ? '99%' : `${Math.min(percent, 99)}%` }} />

                    {[25, 50, 75].map(tick => (
                        <div
                            key={tick}
                            className={`apb-tick${(boostActive || percent >= tick) ? ' apb-tick--passed' : ''}`}
                            style={{ left: `${tick}%` }}
                        />
                    ))}
                </div>

                <div className={`apb-end-pack${(boostActive || percent >= 90) ? ' apb-end-pack--glow' : ''}`}>
                    <PackIcon filled={boostActive || percent >= 100} />
                </div>
            </div>
        </div>
    );
}