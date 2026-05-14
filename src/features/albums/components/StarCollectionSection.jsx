import React, { useState } from 'react';
import AlbumCard from './AlbumCard';
import '../styles/StarCollectionSection.css';

const STAR_LEVELS = [
    { level: 5, label: 'GOAT', emoji: '⭐⭐⭐⭐⭐', desc: 'Los 10 mejores de la historia' },
    { level: 4, label: 'Leyendas', emoji: '⭐⭐⭐⭐', desc: 'Los referentes históricos' },
    { level: 3, label: 'Culto', emoji: '⭐⭐⭐', desc: 'Figuras irrepetibles' },
    { level: 2, label: 'Momentos Puntuales', emoji: '⭐⭐', desc: 'Intermitentes pero memorables' },
    { level: 1, label: 'Actuales Relevantes', emoji: '⭐', desc: 'El presente del fútbol' },
];

export default function StarCollectionSection({ collection, allCards }) {
    const [openLevel, setOpenLevel] = useState(null);

    const byStars = (level) =>
        collection.filter(
            (item) => item.card?.card_type === 'player' && item.card?.significance_level === level
        );

    const totalByStars = (level) =>
        allCards.filter(
            (c) => c.card_type === 'player' && c.significance_level === level
        ).length;

    return (
        <div className="scs-root">
            {STAR_LEVELS.map(({ level, label, emoji, desc }) => {
                const owned = byStars(level);
                const total = totalByStars(level);
                const percent = total > 0 ? Math.round((owned.length / total) * 100) : 0;
                const isOpen = openLevel === level;

                return (
                    <div key={level} className={`scs-section${isOpen ? ' scs-section--open' : ''}`}>
                        <button
                            className="scs-header"
                            onClick={() => setOpenLevel(isOpen ? null : level)}
                        >
                            <div className="scs-header-left">
                                <span className="scs-emoji">{emoji}</span>
                                <div className="scs-header-text">
                                    <span className="scs-label">{label}</span>
                                    <span className="scs-desc">{desc}</span>
                                </div>
                            </div>
                            <div className="scs-header-right">
                                <span className="scs-count">{owned.length}/{total || '?'}</span>
                                <span className="scs-chevron">{isOpen ? '▲' : '▼'}</span>
                            </div>
                        </button>

                        <div className="scs-bar-wrap">
                            <div className="scs-bar-fill" style={{ width: `${percent}%` }} />
                        </div>

                        {isOpen && (
                            <div className="scs-grid">
                                {owned.map((item) => (
                                    <AlbumCard
                                        key={item.card_id}
                                        card={item.card}
                                        collectionItem={item}
                                    />
                                ))}
                                {owned.length === 0 && (
                                    <p className="scs-empty">Aún no tienes jugadores de este nivel.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}