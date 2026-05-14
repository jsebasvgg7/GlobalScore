import React, { useState } from 'react';
import '../styles/CultAlbumsSection.css';

const CULT_META = {
    cult_teams: {
        label: 'Equipos Históricos',
        eyebrow: 'Álbum de Culto',
        typeTag: 'EQUIPO',
        color: '#5b4fd8',
        pageNum: '08',
        cardType: 'team',
        icon: '🛡',
    },
    cult_competitions: {
        label: 'Competiciones Históricas',
        eyebrow: 'Álbum de Culto',
        typeTag: 'COPA',
        color: '#f59e0b',
        pageNum: '12',
        cardType: 'competition',
        icon: '🏆',
    },
    cult_events: {
        label: 'Eventos Históricos',
        eyebrow: 'Álbum de Culto',
        typeTag: 'EVENTO',
        color: '#1D9E75',
        pageNum: '16',
        cardType: 'event',
        icon: '⚡',
    },
};

const CULT_ORDER = ['cult_teams', 'cult_competitions', 'cult_events'];

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function CultCardSlot({ index, item, meta }) {
    const num = String(index + 1).padStart(2, '0');
    const card = item?.card;
    const filled = !!item;

    return (
        <div
            className={`cas-card${filled ? ' cas-card--filled' : ' cas-card--empty'}`}
            style={{ '--cat-color': meta.color }}
        >
            <span className="cas-card-num">{num}</span>
            <span className="cas-card-type-tag">{meta.typeTag}</span>

            <div className="cas-card-img-zone">
                {filled ? (
                    card?.image_path ? (
                        <img src={card.image_path} alt={card.name} className="cas-card-img" />
                    ) : (
                        <div className="cas-card-avatar">{getInitials(card?.name)}</div>
                    )
                ) : (
                    <span className="cas-card-empty-icon">?</span>
                )}
            </div>

            <div className="cas-card-footer">
                {filled ? (
                    <>
                        <span className="cas-card-name">{card?.name}</span>
                        {item.copies > 1 && (
                            <span className="cas-card-copies">×{item.copies}</span>
                        )}
                    </>
                ) : (
                    <span className="cas-card-empty-label">Sin coleccionar</span>
                )}
            </div>
        </div>
    );
}

function CultCategory({ defId, definition, collection, allCards }) {
    const [open, setOpen] = useState(false);
    const meta = CULT_META[defId] ?? {
        label: definition?.name ?? defId,
        eyebrow: 'Álbum de Culto',
        typeTag: 'CARTA',
        color: '#5b4fd8',
        pageNum: '00',
        cardType: definition?.required_card_type ?? 'team',
        icon: '📒',
    };

    const owned = collection.filter(item => item.card?.card_type === meta.cardType);
    const total = allCards.filter(c => c.card_type === meta.cardType).length;
    const pct = total > 0 ? Math.round((owned.length / total) * 100) : 0;

    const slots = Array.from({ length: total || 8 }).map((_, i) => owned[i] ?? null);

    return (
        <div
            className={`cas-category${open ? ' cas-category--open' : ''}`}
            style={{ '--cat-color': meta.color }}
        >
            {/* ── Header ── */}
            <div className="cas-category-header">
                <div className="cas-spine" />
                <button
                    className="cas-header-inner"
                    onClick={() => setOpen(v => !v)}
                    aria-expanded={open}
                >
                    <div className="cas-header-left">
                        <span className="cas-header-icon">{meta.icon}</span>
                        <div className="cas-header-text">
                            <span className="cas-eyebrow">{meta.eyebrow}</span>
                            <span className="cas-cat-title">{meta.label}</span>
                        </div>
                    </div>
                    <div className="cas-header-right">
                        <div className="cas-counter">
                            <span className="cas-counter-owned">{owned.length}</span>
                            <span className="cas-counter-sep">/</span>
                            <span className="cas-counter-total">{total || '?'}</span>
                        </div>
                        <span className="cas-pct">{pct}%</span>
                        <span className={`cas-chevron${open ? ' cas-chevron--up' : ''}`}>▼</span>
                    </div>
                </button>
            </div>

            {/* ── Bar ── */}
            <div className="cas-progress-bar">
                <div className="cas-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* ── Spread ── */}
            {open && (
                <div className="cas-spread">
                    <div className="cas-spread-header">
                        <span className="cas-spread-title">{meta.label}</span>
                        <span className="cas-spread-line" />
                        <span className="cas-spread-page">Pág. {meta.pageNum}</span>
                    </div>

                    {slots.length === 0 ? (
                        <p className="cas-empty-msg">Ninguna carta de esta categoría todavía.</p>
                    ) : (
                        <div className="cas-card-grid">
                            {slots.map((item, i) => (
                                <CultCardSlot
                                    key={i}
                                    index={i}
                                    item={item}
                                    meta={meta}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CultAlbumsSection({ definitions, collection, allCards }) {
    const cultDefs = definitions.filter(d => d.album_type === 'cult');

    const categories = CULT_ORDER.map(id => {
        const def = cultDefs.find(d => d.id === id);
        return { id, def };
    }).filter(({ id }) => CULT_META[id]);

    /* Also include any extra cult defs not in CULT_ORDER */
    const extras = cultDefs.filter(d => !CULT_ORDER.includes(d.id));

    return (
        <div className="cas-root">
            <div className="cas-section-label">
                <span className="cas-section-label-text">Álbum de Culto · Categorías especiales</span>
            </div>

            {categories.map(({ id, def }) => (
                <CultCategory
                    key={id}
                    defId={id}
                    definition={def}
                    collection={collection}
                    allCards={allCards}
                />
            ))}

            {extras.map(def => (
                <CultCategory
                    key={def.id}
                    defId={def.id}
                    definition={def}
                    collection={collection}
                    allCards={allCards}
                />
            ))}
        </div>
    );
}