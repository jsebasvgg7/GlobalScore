import React, { useState } from 'react';
import AlbumCard from './AlbumCard';
import '../styles/CultAlbumsSection.css';

const CULT_META = {
    cult_teams: { label: 'Equipos Históricos', icon: '👥' },
    cult_competitions: { label: 'Competiciones Históricas', icon: '🏆' },
    cult_events: { label: 'Eventos Históricos', icon: '📅' },
};

export default function CultAlbumsSection({ definitions, collection, allCards }) {
    const [openId, setOpenId] = useState(null);

    const cultDefs = definitions.filter((d) => d.album_type === 'cult');

    const getOwned = (cardType) =>
        collection.filter((item) => item.card?.card_type === cardType);

    const getTotal = (cardType) =>
        allCards.filter((c) => c.card_type === cardType).length;

    return (
        <div className="cas-root">
            {cultDefs.map((def) => {
                const meta = CULT_META[def.id] ?? { label: def.name, icon: '📒' };
                const owned = getOwned(def.required_card_type);
                const total = getTotal(def.required_card_type);
                const percent = total > 0 ? Math.round((owned.length / total) * 100) : 0;
                const isOpen = openId === def.id;

                return (
                    <div key={def.id} className={`cas-section${isOpen ? ' cas-section--open' : ''}`}>
                        <button
                            className="cas-header"
                            onClick={() => setOpenId(isOpen ? null : def.id)}
                        >
                            <div className="cas-header-left">
                                <span className="cas-icon">{meta.icon}</span>
                                <span className="cas-label">{meta.label}</span>
                            </div>
                            <div className="cas-header-right">
                                <span className="cas-count">{owned.length}/{total || '?'}</span>
                                <span className="cas-chevron">{isOpen ? '▲' : '▼'}</span>
                            </div>
                        </button>

                        <div className="cas-bar-wrap">
                            <div className="cas-bar-fill" style={{ width: `${percent}%` }} />
                        </div>

                        {isOpen && (
                            <div className="cas-grid">
                                {owned.map((item) => (
                                    <AlbumCard
                                        key={item.card_id}
                                        card={item.card}
                                        collectionItem={item}
                                        small
                                    />
                                ))}
                                {owned.length === 0 && (
                                    <p className="cas-empty">Ninguna carta de esta categoría todavía.</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}