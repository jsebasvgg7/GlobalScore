import React from 'react';
import '../styles/AlbumProgressBar.css';

export default function AlbumProgressBar({ percent, packsAvailable, compact = false }) {
    return (
        <div className={`apb-root${compact ? ' apb-root--compact' : ''}`}>
            <div className="apb-bar-wrap">
                <div
                    className="apb-bar-fill"
                    style={{ width: `${percent}%` }}
                />
            </div>

            {!compact && (
                <div className="apb-meta">
                    <span className="apb-label">{percent}% hacia el próximo sobre</span>
                    {packsAvailable > 0 && (
                        <span className="apb-packs-badge">
                            📦 {packsAvailable} {packsAvailable === 1 ? 'sobre' : 'sobres'}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}