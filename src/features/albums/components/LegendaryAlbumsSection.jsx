import React, { useState } from 'react';
import '../styles/LegendaryAlbumsSection.css';

/* ─── Config ────────────────────────────────────────────────── */
const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];

const ALBUM_META = {
    legendary_1: {
        label: 'Legendarios I',
        shortLabel: 'LEG. I',
        req: '30 jugadores únicos · mín. 5 de ⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 0,
        pageNum: '01',
    },
    legendary_2: {
        label: 'Legendarios II',
        shortLabel: 'LEG. II',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 2×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 2,
        pageNum: '02',
    },
    legendary_3: {
        label: 'Legendarios III',
        shortLabel: 'LEG. III',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 4×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 4,
        pageNum: '03',
    },
    golden_album: {
        label: 'Álbum Dorado',
        shortLabel: 'DORADO',
        req: '15 jugadores únicos · todos de ⭐⭐⭐⭐+',
        slots: 15,
        minStars4: 15,
        minStars5: 0,
        pageNum: '04',
        golden: true,
    },
};

/* ─── Helpers ───────────────────────────────────────────────── */
function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function posLabel(pos) {
    const map = {
        Forward: 'DEL', Midfielder: 'MED', Defender: 'DEF',
        Goalkeeper: 'POR', 'Play-maker': 'MP', 'All-rounder': 'TOD',
    };
    return map[pos] || pos?.slice(0, 3).toUpperCase() || '—';
}

/* ─── Slot component ────────────────────────────────────────── */
function StickerSlot({ index, card, collectionItem, isGolden }) {
    const num = String(index + 1).padStart(2, '0');
    const stars = card?.significance_level ?? 4;
    const isGoat = stars === 5;
    const filled = !!collectionItem;

    if (filled) {
        return (
            <div className={`las-slot las-slot--filled${isGoat ? ' las-slot--goat' : ''}${isGolden ? ' las-slot--golden-filled' : ''}`}>
                <span className="las-slot-num">{num}</span>
                <div className="las-slot-avatar-wrap">
                    {card?.image_path ? (
                        <img src={card.image_path} alt={card.name} className="las-slot-img" />
                    ) : (
                        <div className={`las-slot-avatar${isGoat ? ' las-slot-avatar--goat' : ''}`}>
                            {getInitials(card?.name)}
                        </div>
                    )}
                    {isGoat && <span className="las-slot-goat-crown">♛</span>}
                </div>
                <div className="las-slot-info">
                    <span className="las-slot-name">{card?.name}</span>
                    {card?.position && (
                        <span className={`las-slot-pos${isGoat ? ' las-slot-pos--goat' : ''}`}>
                            {posLabel(card.position)}
                        </span>
                    )}
                </div>
                {collectionItem?.copies > 1 && (
                    <span className="las-slot-copies">×{collectionItem.copies}</span>
                )}
            </div>
        );
    }

    return (
        <div className={`las-slot las-slot--empty${isGolden ? ' las-slot--golden-empty' : ''}`}>
            <span className="las-slot-num">{num}</span>
            <svg className="las-slot-silhouette" viewBox="0 0 40 60" fill="currentColor" aria-hidden="true">
                <ellipse cx="20" cy="13" rx="9" ry="9" />
                <path d="M4 56 Q4 30 20 27 Q36 30 36 56Z" />
            </svg>
            <div className="las-slot-stars-row">
                {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className={`las-slot-star${n <= 4 ? ' las-slot-star--req' : ''}`}>★</span>
                ))}
            </div>
        </div>
    );
}

/* ─── Album card ────────────────────────────────────────────── */
function AlbumCard({ albumId, definitions, progress, collection }) {
    const [expanded, setExpanded] = useState(albumId === 'legendary_1');
    const meta = ALBUM_META[albumId];
    const isGolden = meta.golden;

    const def = definitions.find(d => d.id === albumId);
    const prog = progress.find(p => p.album_id === albumId);
    const isCompleted = prog?.is_completed ?? false;

    const playerCollection = collection.filter(c => c.card?.card_type === 'player');
    const uniquePlayers = playerCollection.length;
    const stars4Plus = playerCollection.filter(c => c.card?.significance_level >= 4).length;
    const stars5 = playerCollection.filter(c => c.card?.significance_level === 5).length;

    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const reqStars4 = def?.required_min_stars_4 ?? meta.minStars4;
    const reqStars5 = def?.required_min_stars_5 ?? meta.minStars5;

    const filledCount = Math.min(uniquePlayers, reqPlayers);
    const fillPct = reqPlayers > 0 ? Math.min(100, Math.round((filledCount / reqPlayers) * 100)) : 0;
    const meets4 = stars4Plus >= reqStars4;
    const meets5 = reqStars5 === 0 || stars5 >= reqStars5;

    /* Build slot data: take the first N player cards */
    const stickerCards = playerCollection.slice(0, meta.slots);

    return (
        <div className={`las-album${isGolden ? ' las-album--golden' : ''}${isCompleted ? ' las-album--done' : ''}`}>

            {/* ── Album header ── */}
            <button
                className="las-album-header"
                onClick={() => setExpanded(v => !v)}
                aria-expanded={expanded}
            >
                <div className="las-album-header-left">
                    <span className="las-album-edition-tag">
                        {isGolden ? '✦ ESPECIAL' : `TEMPORADA 25·26`}
                    </span>
                    <span className="las-album-title">
                        {isGolden ? '🏆' : '📖'} {meta.label}
                    </span>
                    <span className="las-album-req">{meta.req}</span>
                </div>

                <div className="las-album-header-right">
                    <div className="las-album-counter">
                        <span className="las-album-counter-fill">{filledCount}</span>
                        <span className="las-album-counter-sep">/</span>
                        <span className="las-album-counter-total">{reqPlayers}</span>
                    </div>

                    {isCompleted && (
                        <span className="las-album-done-badge">✓ Completado</span>
                    )}

                    <span className={`las-album-chevron${expanded ? ' las-album-chevron--up' : ''}`}>
                        ▼
                    </span>
                </div>
            </button>

            {/* ── Progress strip ── */}
            <div className="las-album-progress-strip">
                <div className="las-album-progress-fill" style={{ width: `${fillPct}%` }} />
            </div>

            {/* ── Requirements chips ── */}
            {expanded && (
                <div className="las-album-req-chips">
                    <span className={`las-req-chip${meets4 ? ' las-req-chip--met' : ''}`}>
                        ⭐⭐⭐⭐ {Math.min(stars4Plus, reqStars4)}/{reqStars4}
                    </span>
                    {reqStars5 > 0 && (
                        <span className={`las-req-chip${meets5 ? ' las-req-chip--met' : ''}`}>
                            ⭐⭐⭐⭐⭐ {Math.min(stars5, reqStars5)}/{reqStars5}
                        </span>
                    )}
                    <span className="las-req-chip-pct">{fillPct}% completado</span>
                </div>
            )}

            {/* ── Sticker grid ── */}
            {expanded && (
                <div className="las-album-body">
                    <div className="las-album-page-label">
                        <span>Página {meta.pageNum}</span>
                        <span className="las-album-page-dots">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`las-page-dot${i === 0 ? ' las-page-dot--active' : ''}`} />
                            ))}
                        </span>
                    </div>

                    <div className="las-sticker-grid">
                        {Array.from({ length: meta.slots }).map((_, i) => {
                            const item = stickerCards[i];
                            return (
                                <StickerSlot
                                    key={i}
                                    index={i}
                                    card={item?.card ?? null}
                                    collectionItem={item ?? null}
                                    isGolden={isGolden}
                                />
                            );
                        })}
                    </div>

                    {def?.reward_description && (
                        <div className="las-album-reward">
                            <span className="las-album-reward-icon">🎁</span>
                            <span>{def.reward_description}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Main export ───────────────────────────────────────────── */
export default function LegendaryAlbumsSection({ definitions, progress, collection }) {
    const isUnlocked = (albumId) => {
        const idx = ORDER.indexOf(albumId);
        if (idx === 0) return true;
        const prevId = ORDER[idx - 1];
        const prev = progress.find(p => p.album_id === prevId);
        return prev?.is_completed ?? false;
    };

    return (
        <div className="las-root">
            {ORDER.map((albumId) => {
                const unlocked = isUnlocked(albumId);
                const meta = ALBUM_META[albumId];

                if (!unlocked) {
                    return (
                        <div key={albumId} className={`las-album las-album--locked${meta.golden ? ' las-album--golden las-album--golden-locked' : ''}`}>
                            <div className="las-album-header las-album-header--locked">
                                <div className="las-album-header-left">
                                    <span className="las-album-edition-tag las-album-edition-tag--locked">
                                        🔒 BLOQUEADO
                                    </span>
                                    <span className="las-album-title las-album-title--locked">
                                        {meta.golden ? '🏆' : '📖'} {meta.label}
                                    </span>
                                    <span className="las-album-req las-album-req--locked">{meta.req}</span>
                                </div>
                                <div className="las-album-header-right">
                                    <span className="las-album-locked-hint">
                                        Completa el álbum anterior
                                    </span>
                                </div>
                            </div>
                            <div className="las-album-progress-strip">
                                <div className="las-album-progress-fill" style={{ width: '0%' }} />
                            </div>
                            <div className="las-album-locked-grid">
                                {Array.from({ length: Math.min(meta.slots, 10) }).map((_, i) => (
                                    <div key={i} className="las-slot las-slot--empty las-slot--blurred" />
                                ))}
                            </div>
                        </div>
                    );
                }

                return (
                    <AlbumCard
                        key={albumId}
                        albumId={albumId}
                        definitions={definitions}
                        progress={progress}
                        collection={collection}
                    />
                );
            })}
        </div>
    );
}