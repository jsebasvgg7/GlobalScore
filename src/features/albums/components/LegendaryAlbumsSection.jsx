import React, { useState } from 'react';
import { Lock, Star, ChevronLeft, ChevronRight, Gift, Crown } from 'lucide-react';
import '../styles/LegendaryAlbumsSection.css';

/* ══════════════════════════════════════════
   ORDER & META
══════════════════════════════════════════ */
const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];

const ALBUM_META = {
    legendary_1: {
        label: 'Legendarios Vol. I',
        shortLabel: 'LEG I',
        req: '30 jugadores · mín. 5×⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 0,
        tag: 'TEMPORADA 25·26',
        number: 'I',
        golden: false,
        theme: 'leather-gold',
    },
    legendary_2: {
        label: 'Legendarios Vol. II',
        shortLabel: 'LEG II',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 2×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 2,
        tag: 'TEMPORADA 25·26',
        number: 'II',
        golden: false,
        theme: 'indigo-night',
    },
    legendary_3: {
        label: 'Legendarios III Élite',
        shortLabel: 'LEG III',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 4×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 4,
        tag: 'TEMPORADA 25·26',
        number: 'III',
        golden: false,
        theme: 'field-green',
    },
    golden_album: {
        label: 'Álbum Dorado',
        shortLabel: 'DORADO',
        req: '15 jugadores · todos ⭐⭐⭐⭐⭐',
        slots: 15,
        minStars4: 15,
        minStars5: 0,
        tag: 'ESPECIAL',
        number: '✦',
        golden: true,
        theme: 'golden',
    },
};

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

/* ══════════════════════════════════════════
   COVER SVG ILLUSTRATIONS
══════════════════════════════════════════ */

function CoverLeatherGold({ locked }) {
    return (
        <svg viewBox="0 0 100 130" className="lbn-cover-art" aria-hidden="true">
            <defs>
                <pattern id="hatch-gold" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#c8993a" strokeWidth="0.5" opacity="0.18" />
                </pattern>
            </defs>
            <rect width="100" height="130" fill="url(#hatch-gold)" />
            {/* Corner brackets */}
            <line x1="8" y1="10" x2="24" y2="10" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="8" y1="10" x2="8" y2="26" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="92" y1="120" x2="76" y2="120" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="92" y1="120" x2="92" y2="104" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="92" y1="10" x2="76" y2="10" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="92" y1="10" x2="92" y2="26" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="8" y1="120" x2="24" y2="120" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            <line x1="8" y1="120" x2="8" y2="104" stroke="#c8993a" strokeWidth="0.6" opacity="0.5" />
            {!locked && (
                <g transform="translate(50,60)">
                    <path d="M0,-28 L20,-17 L20,3 Q20,19 0,30 Q-20,19 -20,3 L-20,-17 Z"
                        fill="none" stroke="#c8993a" strokeWidth="1.2" opacity="0.9" />
                    <path d="M0,-19 L13,-11 L13,2 Q13,13 0,20 Q-13,13 -13,2 L-13,-11 Z"
                        fill="#c8993a" opacity="0.1" />
                    <line x1="0" y1="-17" x2="0" y2="17" stroke="#c8993a" strokeWidth="0.6" opacity="0.4" />
                    <line x1="-15" y1="-3" x2="15" y2="-3" stroke="#c8993a" strokeWidth="0.6" opacity="0.4" />
                    <circle cx="0" cy="-3" r="2" fill="#c8993a" opacity="0.5" />
                </g>
            )}
            {!locked && (
                <text x="50" y="115" textAnchor="middle" fill="#c8993a" fontSize="8"
                    fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.22em" opacity="0.55">I</text>
            )}
        </svg>
    );
}

function CoverIndigoNight({ locked }) {
    return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="lbn-cover-art">
            {/* Stars scattered */}
            {[
                [20, 22, 1.2], [72, 18, 0.8], [50, 15, 1.0], [38, 32, 0.7],
                [80, 35, 0.9], [15, 48, 0.7], [65, 42, 1.0], [88, 58, 0.7],
                [30, 55, 0.8], [55, 62, 1.2], [18, 70, 0.7], [78, 72, 0.9],
                [42, 80, 0.8], [90, 85, 0.7], [10, 88, 0.9],
            ].map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} fill="#8aa8f0" opacity={0.25 + (i % 3) * 0.1} />
            ))}
            {/* Constellation lines */}
            {!locked && (
                <g opacity="0.45">
                    <line x1="50" y1="26" x2="30" y2="44" stroke="#8aa8f0" strokeWidth="0.4" />
                    <line x1="30" y1="44" x2="38" y2="60" stroke="#8aa8f0" strokeWidth="0.4" />
                    <line x1="50" y1="26" x2="68" y2="40" stroke="#8aa8f0" strokeWidth="0.4" />
                    <line x1="68" y1="40" x2="60" y2="60" stroke="#8aa8f0" strokeWidth="0.4" />
                    <line x1="38" y1="60" x2="50" y2="76" stroke="#8aa8f0" strokeWidth="0.4" />
                    <line x1="60" y1="60" x2="50" y2="76" stroke="#8aa8f0" strokeWidth="0.4" />
                    {/* Crown at center */}
                    <g transform="translate(50,48)" stroke="#8aa8f0" fill="none" strokeWidth="1" strokeLinejoin="round">
                        <path d="M-12,7 L-12,-4 L-6,2 L0,-9 L6,2 L12,-4 L12,7 Z" opacity="0.85" />
                        <rect x="-12" y="7" width="24" height="3" rx="1" fill="#8aa8f0" opacity="0.25" stroke="none" />
                        <circle cx="0" cy="-1" r="1.5" fill="#8aa8f0" opacity="0.65" stroke="none" />
                    </g>
                    <text x="50" y="115" textAnchor="middle" fill="#8aa8f0" fontSize="8"
                        fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.22em" opacity="0.55">II</text>
                </g>
            )}
        </svg>
    );
}

function CoverFieldGreen({ locked }) {
    return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="lbn-cover-art">
            {/* Grass lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <line key={i} x1="0" y1={i * 13} x2="100" y2={i * 13}
                    stroke="#4abf4a" strokeWidth="0.5" opacity="0.12" />
            ))}
            {/* Concentric rings */}
            {[40, 30, 20, 10].map((r, i) => (
                <circle key={i} cx="50" cy="58" r={r} fill="none"
                    stroke="#4abf4a" strokeWidth="0.5" opacity={0.1 + i * 0.05} />
            ))}
            {/* Radiating lines */}
            {!locked && Array.from({ length: 8 }, (_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                    <line key={i}
                        x1={50 + 12 * Math.cos(angle)} y1={58 + 12 * Math.sin(angle)}
                        x2={50 + 40 * Math.cos(angle)} y2={58 + 40 * Math.sin(angle)}
                        stroke="#4abf4a" strokeWidth="0.4" opacity="0.18" />
                );
            })}
            {!locked && (
                <g transform="translate(50,58)">
                    <path d="M5,-16 L-4,-2 L3,-2 L-5,16 L4,2 L-3,2 Z"
                        fill="#4abf4a" opacity="0.8" />
                    <circle cx="0" cy="0" r="9" fill="#4abf4a" opacity="0.07" />
                    <text x="0" y="38" textAnchor="middle" fill="#4abf4a" fontSize="8"
                        fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.22em" opacity="0.55">III</text>
                </g>
            )}
        </svg>
    );
}

function CoverGolden({ locked }) {
    return (
        <svg viewBox="0 0 100 130" aria-hidden="true" className="lbn-cover-art lbn-cover-art--golden">
            <defs>
                <pattern id="gold-dots" patternUnits="userSpaceOnUse" width="10" height="10">
                    <circle cx="5" cy="5" r="0.7" fill="#d4a830" opacity="0.22" />
                </pattern>
            </defs>
            <rect width="100" height="130" fill="url(#gold-dots)" />
            {/* Double frame */}
            <rect x="8" y="8" width="84" height="114" fill="none" stroke="#d4a830" strokeWidth="0.8" opacity="0.5" />
            <rect x="12" y="12" width="76" height="106" fill="none" stroke="#d4a830" strokeWidth="0.4" opacity="0.3" />
            {/* Corner ornaments */}
            {[[8, 8], [92, 8], [8, 122], [92, 122]].map(([cx, cy], i) => (
                <g key={i} transform={`translate(${cx},${cy})`}>
                    <circle r="1.8" fill="#d4a830" opacity="0.55" />
                    <circle r="4" fill="none" stroke="#d4a830" strokeWidth="0.5" opacity="0.3" />
                </g>
            ))}
            {!locked && (
                <>
                    {/* Spiral */}
                    <path d="M50,58 Q56,46 62,54 Q70,66 58,74 Q44,82 36,66 Q28,48 48,38 Q72,28 80,58"
                        fill="none" stroke="#d4a830" strokeWidth="0.9" opacity="0.3" strokeLinecap="round" />
                    {/* Trophy */}
                    <g transform="translate(50,55)" stroke="#d4a830" fill="none" strokeWidth="1.1">
                        <path d="M-9,-15 Q-11,4 0,11 Q11,4 9,-15 Z" strokeLinejoin="round" opacity="0.9" />
                        <path d="M-9,-9 Q-16,-9 -16,-3 Q-16,3 -9,3" opacity="0.65" />
                        <path d="M9,-9 Q16,-9 16,-3 Q16,3 9,3" opacity="0.65" />
                        <line x1="0" y1="11" x2="0" y2="17" opacity="0.75" />
                        <rect x="-7" y="17" width="14" height="2.5" rx="1.2" fill="#d4a830" opacity="0.55" stroke="none" />
                        <path d="M0,-6 L1.4,-2 L5,-2 L2.3,0.5 L3.2,4 L0,2.4 L-3.2,4 L-2.3,0.5 L-5,-2 L-1.4,-2 Z"
                            fill="#d4a830" opacity="0.65" stroke="none" />
                    </g>
                    <text x="50" y="115" textAnchor="middle" fill="#d4a830" fontSize="7"
                        fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.28em" opacity="0.65">GOAT</text>
                </>
            )}
        </svg>
    );
}

const COVERS = {
    legendary_1: CoverLeatherGold,
    legendary_2: CoverIndigoNight,
    legendary_3: CoverFieldGreen,
    golden_album: CoverGolden,
};

/* ══════════════════════════════════════════
   OPEN BOOK — sticker pages
══════════════════════════════════════════ */
function StickerSlot({ index, collectionItem, card, accent }) {
    const num = String(index + 1).padStart(2, '0');
    const isGoat = card?.significance_level === 5;
    const filled = !!collectionItem;

    return (
        <div className={`lbn-sticker${filled ? ' lbn-sticker--filled' : ' lbn-sticker--empty'}${isGoat ? ' lbn-sticker--goat' : ''}`}>
            <span className="lbn-sticker-num">{num}</span>
            {filled ? (
                <>
                    {isGoat && <span className="lbn-sticker-crown"><Crown size={7} /></span>}
                    <div className="lbn-sticker-img-zone">
                        {card?.image_path
                            ? <img src={card.image_path} alt={card.name} className="lbn-sticker-img" />
                            : <div className="lbn-sticker-avatar">{getInitials(card?.name)}</div>
                        }
                    </div>
                    <div className="lbn-sticker-info">
                        <span className="lbn-sticker-name">{card?.name}</span>
                        {card?.position && <span className="lbn-sticker-pos">{posLabel(card.position)}</span>}
                    </div>
                    {collectionItem?.copies > 1 && (
                        <span className="lbn-sticker-copies">×{collectionItem.copies}</span>
                    )}
                </>
            ) : (
                <>
                    <svg className="lbn-sticker-sil" viewBox="0 0 40 60" fill="currentColor" aria-hidden="true">
                        <ellipse cx="20" cy="13" rx="9" ry="9" />
                        <path d="M4 56 Q4 30 20 27 Q36 30 36 56Z" />
                    </svg>
                    <div className="lbn-sticker-empty-dots">
                        {[1, 2, 3, 4].map(n => <span key={n}>★</span>)}
                    </div>
                </>
            )}
        </div>
    );
}

function OpenBook({ albumId, meta, definitions, progress, collection, onClose }) {
    const [page, setPage] = useState(0);
    const PER_PAGE = 6; // 6 per page = 3 left + 3 right (but shown as grid of 6 across both pages)

    const def = definitions.find(d => d.id === albumId);
    const prog = progress.find(p => p.album_id === albumId);
    const isCompleted = prog?.is_completed ?? false;

    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const reqStars4 = def?.required_min_stars_4 ?? meta.minStars4;
    const reqStars5 = def?.required_min_stars_5 ?? meta.minStars5;
    const qualifiedPlayers = playerCol.filter(c => (c.card?.significance_level ?? 0) >= 1);
    const stars4Count = playerCol.filter(c => (c.card?.significance_level ?? 0) >= 4).length;
    const stars5Count = playerCol.filter(c => c.card?.significance_level === 5).length;
    const filled = Math.min(qualifiedPlayers.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;
    const totalPages = Math.ceil(meta.slots / PER_PAGE);

    // Left page: slots 0-2, Right page: slots 3-5
    const pageStart = page * PER_PAGE;
    const leftItems = Array.from({ length: 3 }, (_, i) => {
        const gi = pageStart + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: qualifiedPlayers[gi] ?? null };
    }).filter(Boolean);
    const rightItems = Array.from({ length: 3 }, (_, i) => {
        const gi = pageStart + 3 + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: qualifiedPlayers[gi] ?? null };
    }).filter(Boolean);

    return (
        <>
            <div className="lbn-overlay" onClick={onClose} />
            <div className={`lbn-open-book lbn-open-book--${meta.theme}`}>
                {/* Book label above */}
                <div className="lbn-open-book-label">
                    <span className="lbn-open-book-title">{meta.label}</span>
                    <button className="lbn-open-book-close" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                {/* ── Two pages ── */}
                <div className="lbn-pages-wrap">

                    {/* LEFT PAGE */}
                    <div className="lbn-page lbn-page--left">
                        <div className="lbn-page-inner">
                            <div className="lbn-page-header">
                                <span className="lbn-page-eyebrow">{meta.tag}</span>
                                <span className="lbn-page-num">pág. {String(page * 2 + 1).padStart(2, '0')}</span>
                            </div>
                            <div className="lbn-page-divider" />
                            <div className="lbn-sticker-col">
                                {leftItems.map(({ idx, item }) => (
                                    <StickerSlot key={idx} index={idx} collectionItem={item} card={item?.card ?? null} />
                                ))}
                                {Array.from({ length: 3 - leftItems.length }).map((_, i) => (
                                    <div key={`ph-l-${i}`} className="lbn-sticker-phantom" />
                                ))}
                            </div>
                            <div className="lbn-page-footer">
                                <div className="lbn-page-progress">
                                    <div className="lbn-page-progress-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="lbn-page-count">{filled}/{reqPlayers}</span>
                            </div>
                        </div>
                    </div>

                    {/* CENTER SPINE */}
                    <div className="lbn-book-gutter">
                        <div className="lbn-gutter-shadow-left" />
                        <div className="lbn-gutter-center" />
                        <div className="lbn-gutter-shadow-right" />
                    </div>

                    {/* RIGHT PAGE */}
                    <div className="lbn-page lbn-page--right">
                        <div className="lbn-page-inner">
                            <div className="lbn-page-header">
                                <span className="lbn-page-eyebrow">Colección de jugadores</span>
                                <span className="lbn-page-num">pág. {String(page * 2 + 2).padStart(2, '0')}</span>
                            </div>
                            <div className="lbn-page-divider" />
                            <div className="lbn-sticker-col">
                                {rightItems.map(({ idx, item }) => (
                                    <StickerSlot key={idx} index={idx} collectionItem={item} card={item?.card ?? null} />
                                ))}
                                {Array.from({ length: 3 - rightItems.length }).map((_, i) => (
                                    <div key={`ph-r-${i}`} className="lbn-sticker-phantom" />
                                ))}
                            </div>

                            {/* Chips */}
                            <div className="lbn-page-chips">
                                <span className={`lbn-chip${stars4Count >= reqStars4 ? ' lbn-chip--met' : ''}`}>
                                    <Star size={8} /><Star size={8} /><Star size={8} /><Star size={8} />
                                    &nbsp;{Math.min(stars4Count, reqStars4)}/{reqStars4}
                                </span>
                                {reqStars5 > 0 && (
                                    <span className={`lbn-chip${stars5Count >= reqStars5 ? ' lbn-chip--met' : ''}`}>
                                        <Crown size={8} />&nbsp;{Math.min(stars5Count, reqStars5)}/{reqStars5}
                                    </span>
                                )}
                                {isCompleted && <span className="lbn-chip lbn-chip--done">✓ Completado</span>}
                            </div>

                            {/* Pagination */}
                            <div className="lbn-pagination">
                                <button className="lbn-pg-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                                    <ChevronLeft size={13} />
                                </button>
                                <div className="lbn-pg-dots">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button key={i} className={`lbn-pg-dot${i === page ? ' lbn-pg-dot--active' : ''}`}
                                            onClick={() => setPage(i)} />
                                    ))}
                                </div>
                                <button className="lbn-pg-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
                                    <ChevronRight size={13} />
                                </button>
                            </div>

                            {def?.reward_description && (
                                <div className="lbn-reward">
                                    <Gift size={11} className="lbn-reward-icon" />
                                    <span>{def.reward_description}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════
   SINGLE BOOK CARD
══════════════════════════════════════════ */
function AlbumBook({ albumId, meta, definitions, progress, collection, locked }) {
    const [bookOpen, setBookOpen] = useState(false);
    const [hovered, setHovered] = useState(false);

    const def = definitions.find(d => d.id === albumId);
    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const filled = Math.min(playerCol.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;
    const isCompleted = progress.find(p => p.album_id === albumId)?.is_completed ?? false;
    const CoverArt = COVERS[albumId];

    return (
        <>
            <div
                className={`lbn-wrapper${locked ? ' lbn-wrapper--locked' : ''}${hovered ? ' lbn-wrapper--hovered' : ''}`}
                onMouseEnter={() => !locked && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Pages stack visible from side */}
                <div className="lbn-pages-edge" />

                <button
                    className={[
                        'lbn-book',
                        `lbn-book--${meta.theme}`,
                        locked ? 'lbn-book--locked' : '',
                        isCompleted ? 'lbn-book--done' : '',
                        hovered && !locked ? 'lbn-book--hovered' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => !locked && setBookOpen(true)}
                    aria-disabled={locked}
                >
                    {/* ── Spine ── */}
                    <div className="lbn-spine">
                        <span className="lbn-spine-num">{meta.number}</span>
                        <span className="lbn-spine-label">{meta.shortLabel}</span>
                    </div>

                    {/* ── Cover ── */}
                    <div className="lbn-cover">
                        {/* SVG illustration */}
                        <div className="lbn-cover-art-wrap">
                            {CoverArt && <CoverArt locked={locked} />}
                        </div>

                        {/* Season tag top-left */}
                        <div className="lbn-cover-tag">
                            {locked
                                ? <><Lock size={5} strokeWidth={2.5} /> BLOQ.</>
                                : meta.tag
                            }
                        </div>

                        {/* Title */}
                        <div className="lbn-cover-title-block">
                            <span className="lbn-cover-title">{meta.label}</span>
                        </div>

                        {/* Lock overlay */}
                        {locked && (
                            <div className="lbn-locked-overlay">
                                <div className="lbn-locked-fog" />
                                <div className="lbn-locked-icon">
                                    <Lock size={18} strokeWidth={1.8} />
                                    <div className="lbn-locked-pulse" />
                                </div>
                                <span className="lbn-locked-label">Completa el álbum anterior</span>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="lbn-cover-footer">
                            <div className="lbn-cover-progress">
                                <div className="lbn-cover-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="lbn-cover-footer-row">
                                <span className="lbn-cover-count">{filled}/{reqPlayers}</span>
                                {isCompleted && <span className="lbn-cover-done">✓</span>}
                                {!locked && <span className="lbn-cover-hint">Abrir →</span>}
                            </div>
                        </div>
                    </div>
                </button>

                {/* Hover info label below book */}
                <div className="lbn-hover-label">
                    <span className="lbn-hover-title">{meta.label}</span>
                    <span className="lbn-hover-req">{meta.req}</span>
                </div>
            </div>

            {bookOpen && (
                <OpenBook
                    albumId={albumId}
                    meta={meta}
                    definitions={definitions}
                    progress={progress}
                    collection={collection}
                    onClose={() => setBookOpen(false)}
                />
            )}
        </>
    );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function LegendaryAlbumsSection({ definitions, progress, collection }) {
    const isUnlocked = (albumId) => {
        const idx = ORDER.indexOf(albumId);
        if (idx === 0) return true;
        const prev = progress.find(p => p.album_id === ORDER[idx - 1]);
        return prev?.is_completed ?? false;
    };

    return (
        <div className="lbn-root">
            <div className="lbn-eyebrow">
                <span>Álbumes Legendarios</span>
                <div className="lbn-eyebrow-line" />
                <span className="lbn-eyebrow-count">4 álbumes</span>
            </div>

            <div className="lbn-shelf">
                {ORDER.map(albumId => (
                    <AlbumBook
                        key={albumId}
                        albumId={albumId}
                        meta={ALBUM_META[albumId]}
                        definitions={definitions}
                        progress={progress}
                        collection={collection}
                        locked={!isUnlocked(albumId)}
                    />
                ))}
            </div>
        </div>
    );
}