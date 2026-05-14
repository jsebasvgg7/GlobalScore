import React, { useState } from 'react';
import '../styles/StarCollectionSection.css';

const STAR_LEVELS = [
    { level: 5, label: 'GOAT', desc: 'Los 10 mejores de la historia', color: '#f59e0b', pageNum: '01' },
    { level: 4, label: 'Leyendas', desc: 'Los referentes históricos', color: '#8b5cf6', pageNum: '02' },
    { level: 3, label: 'Culto', desc: 'Figuras irrepetibles', color: '#1D9E75', pageNum: '03' },
    { level: 2, label: 'Momentos Puntuales', desc: 'Intermitentes pero memorables', color: '#5b4fd8', pageNum: '04' },
    { level: 1, label: 'Actuales Relevantes', desc: 'El presente del fútbol', color: '#e55b5b', pageNum: '05' },
];

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function StarRow({ filled, total }) {
    return (
        <div className="scs-star-row" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={`scs-star${i < filled ? ' scs-star--lit' : ''}`}>★</span>
            ))}
        </div>
    );
}

function StarSlot({ index, item, color }) {
    const num = String(index + 1).padStart(2, '0');
    const card = item?.card;
    const filled = !!item;

    if (filled) {
        return (
            <div className="scs-slot scs-slot--filled" style={{ '--tier-color': color }}>
                <span className="scs-slot-num">{num}</span>

                <div className="scs-slot-img-zone">
                    {card?.image_path ? (
                        <img src={card.image_path} alt={card.name} className="scs-slot-img" />
                    ) : (
                        <div className="scs-slot-avatar">{getInitials(card?.name)}</div>
                    )}
                </div>

                <div className="scs-slot-footer">
                    {card?.country && (
                        <span className="scs-slot-country">{card.country}</span>
                    )}
                    <span className="scs-slot-name">{card?.name}</span>
                </div>

                {item.copies > 1 && (
                    <span className="scs-slot-copies">×{item.copies}</span>
                )}
            </div>
        );
    }

    return (
        <div className="scs-slot scs-slot--empty" style={{ '--tier-color': color }}>
            <span className="scs-slot-num">{num}</span>
            <svg className="scs-slot-silhouette" viewBox="0 0 40 60" fill="currentColor" aria-hidden="true">
                <ellipse cx="20" cy="13" rx="9" ry="9" />
                <path d="M4 56 Q4 30 20 27 Q36 30 36 56Z" />
            </svg>
        </div>
    );
}

function StarTier({ level, label, desc, color, pageNum, collection, allCards }) {
    const [open, setOpen] = useState(false);

    const owned = collection.filter(
        item => item.card?.card_type === 'player' && item.card?.significance_level === level
    );
    const total = allCards.filter(
        c => c.card_type === 'player' && c.significance_level === level
    ).length;

    const pct = total > 0 ? Math.round((owned.length / total) * 100) : 0;
    const starsFilled = Math.round((level / 5) * 5);

    /* Build full slot list: owned first, then empties */
    const slots = Array.from({ length: total || 12 }).map((_, i) => owned[i] ?? null);

    return (
        <div
            className={`scs-tier${open ? ' scs-tier--open' : ''}`}
            style={{ '--tier-color': color }}
        >
            {/* ── Tier header ── */}
            <button
                className="scs-tier-header"
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
            >
                <div className="scs-tier-header-left">
                    <div className="scs-tier-spine" />
                    <div className="scs-tier-info">
                        <div className="scs-tier-top-row">
                            <StarRow filled={starsFilled} total={5} />
                            <span className="scs-tier-label">{label}</span>
                        </div>
                        <span className="scs-tier-desc">{desc}</span>
                    </div>
                </div>

                <div className="scs-tier-header-right">
                    <div className="scs-tier-stat">
                        <span className="scs-tier-owned">{owned.length}</span>
                        <span className="scs-tier-sep">/</span>
                        <span className="scs-tier-total">{total || '?'}</span>
                    </div>
                    <span className="scs-tier-pct">{pct}%</span>
                    <span className={`scs-tier-chevron${open ? ' scs-tier-chevron--up' : ''}`}>▼</span>
                </div>
            </button>

            {/* ── Progress bar ── */}
            <div className="scs-tier-bar">
                <div className="scs-tier-bar-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* ── Album page ── */}
            {open && (
                <div className="scs-album-page">
                    <div className="scs-page-header">
                        <span className="scs-page-section">
                            Estrellas · {label}
                        </span>
                        <span className="scs-page-num">Pág. {pageNum}</span>
                    </div>

                    {slots.length === 0 ? (
                        <p className="scs-empty-msg">Aún no hay jugadores de este nivel en el álbum.</p>
                    ) : (
                        <div className="scs-slot-grid">
                            {slots.map((item, i) => (
                                <StarSlot
                                    key={i}
                                    index={i}
                                    item={item}
                                    color={color}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function StarCollectionSection({ collection, allCards }) {
    return (
        <div className="scs-root">
            <div className="scs-album-cover">
                <span className="scs-album-cover-label">Sección · Estrellas</span>
                <span className="scs-album-cover-sub">Jugadores por nivel de importancia histórica</span>
            </div>

            {STAR_LEVELS.map(tier => (
                <StarTier
                    key={tier.level}
                    {...tier}
                    collection={collection}
                    allCards={allCards}
                />
            ))}
        </div>
    );
}