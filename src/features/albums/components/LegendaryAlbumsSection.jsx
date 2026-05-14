import React, { useState } from 'react';
import { Lock, BookOpen, Trophy, Star, ChevronLeft, ChevronRight, Gift, Crown } from 'lucide-react';
import '../styles/LegendaryAlbumsSection.css';

const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];

const ALBUM_META = {
    legendary_1: {
        label: 'Legendarios I',
        shortLabel: 'LEG I',
        req: '30 jugadores · mín. 5×⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 0,
        spine: '#5b4fd8',
        spineAlt: '#3d34a5',
        accent: '#a599d9',
        accentRgb: '165,153,217',
        tag: 'TEMPORADA 25·26',
        number: '01',
        golden: false,
        coverBg: '#1a1726',
        rarityLevel: 4,
        rarityLabel: 'LEYENDA',
    },
    legendary_2: {
        label: 'Legendarios II',
        shortLabel: 'LEG II',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 2×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 2,
        spine: '#7c3aed',
        spineAlt: '#5b1fbd',
        accent: '#c4b5fd',
        accentRgb: '196,181,253',
        tag: 'TEMPORADA 25·26',
        number: '02',
        golden: false,
        coverBg: '#160e2a',
        rarityLevel: 4,
        rarityLabel: 'LEYENDA+',
    },
    legendary_3: {
        label: 'Legendarios III',
        shortLabel: 'LEG III',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 4×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 4,
        spine: '#1D9E75',
        spineAlt: '#0d6e50',
        accent: '#34d399',
        accentRgb: '52,211,153',
        tag: 'TEMPORADA 25·26',
        number: '03',
        golden: false,
        coverBg: '#0a1f18',
        rarityLevel: 5,
        rarityLabel: 'ÉLITE',
    },
    golden_album: {
        label: 'Álbum Dorado',
        shortLabel: 'DORADO',
        req: '15 jugadores · todos ⭐⭐⭐⭐⭐',
        slots: 15,
        minStars4: 15,
        minStars5: 0,
        spine: '#b45309',
        spineAlt: '#7c3b00',
        accent: '#f59e0b',
        accentRgb: '245,158,11',
        tag: 'ESPECIAL',
        number: '✦',
        golden: true,
        coverBg: '#1a1200',
        rarityLevel: 5,
        rarityLabel: 'GOAT',
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
   UNIQUE COVER ILLUSTRATIONS — one per album
══════════════════════════════════════════ */

/** Legendarios I — diagonal hatching + shield */
function CoverLeg1({ accent, locked }) {
    return (
        <svg viewBox="0 0 100 130" className="las-book-cover-art" aria-hidden="true">
            <defs>
                <pattern id="leg1-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke={accent} strokeWidth="0.6" opacity="0.25" />
                </pattern>
            </defs>
            {/* Background pattern */}
            <rect x="0" y="0" width="100" height="130" fill="url(#leg1-hatch)" />
            {/* Decorative corner lines */}
            <line x1="8" y1="8" x2="30" y2="8" stroke={accent} strokeWidth="0.5" opacity="0.4" />
            <line x1="8" y1="8" x2="8" y2="30" stroke={accent} strokeWidth="0.5" opacity="0.4" />
            <line x1="92" y1="122" x2="70" y2="122" stroke={accent} strokeWidth="0.5" opacity="0.4" />
            <line x1="92" y1="122" x2="92" y2="100" stroke={accent} strokeWidth="0.5" opacity="0.4" />
            {/* Shield shape */}
            {!locked && (
                <g transform="translate(50,62)">
                    <path
                        d="M0,-32 L24,-20 L24,4 Q24,22 0,34 Q-24,22 -24,4 L-24,-20 Z"
                        fill="none"
                        stroke={accent}
                        strokeWidth="1.2"
                        opacity="0.9"
                    />
                    <path
                        d="M0,-22 L16,-13 L16,3 Q16,15 0,23 Q-16,15 -16,3 L-16,-13 Z"
                        fill={accent}
                        opacity="0.12"
                    />
                    {/* Shield cross */}
                    <line x1="0" y1="-20" x2="0" y2="20" stroke={accent} strokeWidth="0.7" opacity="0.5" />
                    <line x1="-18" y1="-4" x2="18" y2="-4" stroke={accent} strokeWidth="0.7" opacity="0.5" />
                </g>
            )}
            {/* Roman numeral I */}
            {!locked && (
                <text x="50" y="115" textAnchor="middle" fill={accent} fontSize="9" fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.2em" opacity="0.6">I</text>
            )}
        </svg>
    );
}

/** Legendarios II — hexagonal grid + crown */
function CoverLeg2({ accent, locked }) {
    const hexPoints = (cx, cy, r) => {
        return Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(' ');
    };
    const hexes = [
        [50, 40], [30, 52], [70, 52], [50, 64], [30, 76], [70, 76], [50, 88],
    ];
    return (
        <svg viewBox="0 0 100 130" className="las-book-cover-art" aria-hidden="true">
            {/* Hex grid background */}
            {hexes.map(([cx, cy], i) => (
                <polygon
                    key={i}
                    points={hexPoints(cx, cy, 13)}
                    fill="none"
                    stroke={accent}
                    strokeWidth="0.5"
                    opacity={i === 0 ? 0.5 : 0.18}
                />
            ))}
            {/* Center hex filled */}
            {!locked && (
                <>
                    <polygon
                        points={hexPoints(50, 64, 13)}
                        fill={accent}
                        opacity="0.12"
                    />
                    {/* Crown */}
                    <g transform="translate(50,64)">
                        <path
                            d="M-14,8 L-14,-4 L-7,2 L0,-10 L7,2 L14,-4 L14,8 Z"
                            fill="none"
                            stroke={accent}
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                            opacity="0.9"
                        />
                        <rect x="-14" y="8" width="28" height="3" rx="1" fill={accent} opacity="0.3" />
                        {/* Crown gems */}
                        <circle cx="0" cy="-2" r="1.5" fill={accent} opacity="0.7" />
                        <circle cx="-9" cy="3" r="1" fill={accent} opacity="0.5" />
                        <circle cx="9" cy="3" r="1" fill={accent} opacity="0.5" />
                    </g>
                </>
            )}
            {/* II label */}
            {!locked && (
                <text x="50" y="118" textAnchor="middle" fill={accent} fontSize="9" fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.2em" opacity="0.6">II</text>
            )}
        </svg>
    );
}

/** Legendarios III — concentric rings + lightning bolt */
function CoverLeg3({ accent, locked }) {
    return (
        <svg viewBox="0 0 100 130" className="las-book-cover-art" aria-hidden="true">
            {/* Concentric arcs (bottom half only for depth) */}
            {[42, 32, 22, 12].map((r, i) => (
                <circle
                    key={i}
                    cx="50"
                    cy="65"
                    r={r}
                    fill="none"
                    stroke={accent}
                    strokeWidth="0.6"
                    opacity={0.12 + i * 0.06}
                />
            ))}
            {/* Radiating lines */}
            {Array.from({ length: 12 }, (_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const x1 = 50 + 14 * Math.cos(angle);
                const y1 = 65 + 14 * Math.sin(angle);
                const x2 = 50 + 44 * Math.cos(angle);
                const y2 = 65 + 44 * Math.sin(angle);
                return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={accent} strokeWidth="0.4" opacity="0.15" />
                );
            })}
            {/* Lightning bolt center */}
            {!locked && (
                <g transform="translate(50,65)">
                    <path
                        d="M6,-18 L-4,-2 L3,-2 L-6,18 L4,2 L-3,2 Z"
                        fill={accent}
                        opacity="0.85"
                    />
                    {/* Inner glow ring */}
                    <circle cx="0" cy="0" r="10" fill={accent} opacity="0.08" />
                </g>
            )}
            {/* III label */}
            {!locked && (
                <text x="50" y="118" textAnchor="middle" fill={accent} fontSize="9" fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.2em" opacity="0.6">III</text>
            )}
        </svg>
    );
}

/** Álbum Dorado — spiral + trophy, shimmer animation */
function CoverGolden({ accent, locked }) {
    return (
        <svg viewBox="0 0 100 130" className="las-book-cover-art las-book-cover-art--golden" aria-hidden="true">
            <defs>
                <pattern id="gold-dots" patternUnits="userSpaceOnUse" width="10" height="10">
                    <circle cx="5" cy="5" r="0.8" fill={accent} opacity="0.2" />
                </pattern>
            </defs>
            {/* Dot grid */}
            <rect x="0" y="0" width="100" height="130" fill="url(#gold-dots)" />
            {/* Spiral (hand-drawn as arcs) */}
            {!locked && (
                <>
                    <path
                        d="M50,65 Q56,52 62,60 Q70,72 58,80 Q44,88 36,72 Q28,52 48,42 Q72,32 80,62 Q86,90 62,100"
                        fill="none"
                        stroke={accent}
                        strokeWidth="1"
                        opacity="0.35"
                        strokeLinecap="round"
                    />
                    {/* Trophy */}
                    <g transform="translate(50,62)">
                        {/* Cup body */}
                        <path
                            d="M-10,-16 Q-12,4 0,12 Q12,4 10,-16 Z"
                            fill="none"
                            stroke={accent}
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                            opacity="0.95"
                        />
                        {/* Handles */}
                        <path d="M-10,-10 Q-18,-10 -18,-4 Q-18,2 -10,2" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
                        <path d="M10,-10 Q18,-10 18,-4 Q18,2 10,2" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
                        {/* Stem + base */}
                        <line x1="0" y1="12" x2="0" y2="18" stroke={accent} strokeWidth="1.2" opacity="0.8" />
                        <rect x="-8" y="18" width="16" height="3" rx="1.5" fill={accent} opacity="0.6" />
                        {/* Star inside trophy */}
                        <path d="M0,-6 L1.5,-2 L5.5,-2 L2.5,0.5 L3.5,4.5 L0,2.5 L-3.5,4.5 L-2.5,0.5 L-5.5,-2 L-1.5,-2 Z"
                            fill={accent} opacity="0.7" />
                    </g>
                </>
            )}
            {/* Corner ornaments */}
            {[
                [8, 10], [92, 10], [8, 120], [92, 120]
            ].map(([cx, cy], i) => (
                <g key={i} transform={`translate(${cx},${cy})`}>
                    <circle r="1.5" fill={accent} opacity="0.5" />
                    <circle r="4" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.25" />
                </g>
            ))}
            {/* GOAT text */}
            {!locked && (
                <text x="50" y="118" textAnchor="middle" fill={accent} fontSize="8" fontFamily="'DM Mono', monospace" fontWeight="800" letterSpacing="0.25em" opacity="0.7">GOAT</text>
            )}
        </svg>
    );
}

const COVER_COMPONENTS = {
    legendary_1: CoverLeg1,
    legendary_2: CoverLeg2,
    legendary_3: CoverLeg3,
    golden_album: CoverGolden,
};

/* ══════════════════════════════════════════
   RARITY BADGE
══════════════════════════════════════════ */
function RarityBadge({ level, label, accent, accentRgb, golden }) {
    const stars = Array.from({ length: Math.min(level, 5) });
    return (
        <div
            className={`las-rarity-badge${golden ? ' las-rarity-badge--golden' : ''}`}
            style={{ '--acc': accent, '--acc-rgb': accentRgb }}
        >
            <div className="las-rarity-badge-stars">
                {stars.map((_, i) => <span key={i} className="las-rarity-star">★</span>)}
            </div>
            <span className="las-rarity-label">{label}</span>
        </div>
    );
}

/* ══════════════════════════════════════════
   STACKED PAGES (progress indicator)
══════════════════════════════════════════ */
function StackedPages({ pct, accent }) {
    const pages = 5;
    const filled = Math.round((pct / 100) * pages);
    return (
        <div className="las-stacked-pages">
            {Array.from({ length: pages }).map((_, i) => (
                <div
                    key={i}
                    className={`las-page-leaf${i < filled ? ' las-page-leaf--filled' : ''}`}
                    style={{ '--leaf-offset': `${i * 1.5}px`, '--acc': accent }}
                />
            ))}
            <span className="las-stacked-pct">{pct}%</span>
        </div>
    );
}

/* ══════════════════════════════════════════
   PANEL STICKER
══════════════════════════════════════════ */
function PanelSticker({ index, card, collectionItem, accent }) {
    const num = String(index + 1).padStart(2, '0');
    const isGoat = card?.significance_level === 5;
    const filled = !!collectionItem;

    if (filled) {
        return (
            <div
                className={`las-sticker las-sticker--filled${isGoat ? ' las-sticker--goat' : ''}`}
                style={{ '--meta-accent': accent }}
            >
                <span className="las-sticker-num">{num}</span>
                {isGoat && <span className="las-sticker-crown"><Crown size={8} /></span>}
                <div className="las-sticker-img-zone">
                    {card?.image_path
                        ? <img src={card.image_path} alt={card.name} className="las-sticker-img" />
                        : <div className="las-sticker-avatar">{getInitials(card?.name)}</div>
                    }
                </div>
                <div className="las-sticker-info">
                    <span className="las-sticker-name">{card?.name}</span>
                    {card?.position && <span className="las-sticker-pos">{posLabel(card.position)}</span>}
                </div>
                {collectionItem?.copies > 1 && (
                    <span className="las-sticker-copies">×{collectionItem.copies}</span>
                )}
            </div>
        );
    }

    return (
        <div className="las-sticker las-sticker--empty" style={{ '--meta-accent': accent }}>
            <span className="las-sticker-num">{num}</span>
            <svg className="las-sticker-sil" viewBox="0 0 40 60" fill="currentColor" aria-hidden="true">
                <ellipse cx="20" cy="13" rx="9" ry="9" />
                <path d="M4 56 Q4 30 20 27 Q36 30 36 56Z" />
            </svg>
            <div className="las-sticker-stars-empty">
                {[1, 2, 3, 4].map(n => <span key={n} className="las-sticker-star-dot">★</span>)}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   ALBUM PANEL (slide-in detail view)
══════════════════════════════════════════ */
function AlbumPanel({ albumId, meta, definitions, progress, collection, onClose }) {
    const [page, setPage] = useState(0);
    const PER_PAGE = 6;

    const def = definitions.find(d => d.id === albumId);
    const prog = progress.find(p => p.album_id === albumId);
    const isCompleted = prog?.is_completed ?? false;

    // ── FIX: filter to players only, then check star requirements ──
    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const reqStars4 = def?.required_min_stars_4 ?? meta.minStars4;
    const reqStars5 = def?.required_min_stars_5 ?? meta.minStars5;

    // Count unique players that qualify (sorted best-first so we fill the album optimally)
    const qualifiedPlayers = playerCol.filter(c => (c.card?.significance_level ?? 0) >= 1);
    const stars4Count = playerCol.filter(c => (c.card?.significance_level ?? 0) >= 4).length;
    const stars5Count = playerCol.filter(c => c.card?.significance_level === 5).length;

    // How many slots are filled (capped to album capacity)
    const filled = Math.min(qualifiedPlayers.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;

    const totalPages = Math.ceil(meta.slots / PER_PAGE);

    // Build page items from the player collection for this album
    const pageItems = Array.from({ length: PER_PAGE }, (_, i) => {
        const gi = page * PER_PAGE + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: qualifiedPlayers[gi] ?? null };
    }).filter(Boolean);

    return (
        <>
            <div className="las-panel-overlay" onClick={onClose} />
            <div className="las-panel" style={{ '--spine': meta.spine, '--acc': meta.accent }}>
                <div className="las-panel-header">
                    <div className="las-panel-spine-bar" />
                    <div className="las-panel-header-content">
                        <div className="las-panel-title-block">
                            <span className="las-panel-tag">{meta.tag}</span>
                            <span className="las-panel-title">{meta.label}</span>
                            <span className="las-panel-req">{meta.req}</span>
                        </div>
                        <div className="las-panel-counter-block">
                            <span className="las-panel-count-n">{filled}</span>
                            <span className="las-panel-count-sep">/</span>
                            <span className="las-panel-count-t">{reqPlayers}</span>
                        </div>
                    </div>
                    <button className="las-panel-close" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                <div className="las-panel-bar">
                    <div className="las-panel-bar-fill" style={{ width: `${pct}%` }} />
                </div>

                <div className="las-panel-chips">
                    <span className={`las-chip${stars4Count >= reqStars4 ? ' las-chip--met' : ''}`}>
                        <Star size={9} /><Star size={9} /><Star size={9} /><Star size={9} />
                        &nbsp;{Math.min(stars4Count, reqStars4)}/{reqStars4}
                    </span>
                    {reqStars5 > 0 && (
                        <span className={`las-chip${stars5Count >= reqStars5 ? ' las-chip--met' : ''}`}>
                            <Crown size={9} />&nbsp;{Math.min(stars5Count, reqStars5)}/{reqStars5}
                        </span>
                    )}
                    <span className="las-chip las-chip--pct">{pct}% completado</span>
                    {isCompleted && <span className="las-chip las-chip--done">✓ Completado</span>}
                </div>

                <div className="las-panel-scroll">
                    <div className="las-album-page">
                        <div className="las-page-header">
                            <div className="las-page-header-line" />
                            <span className="las-page-label">Página {String(page + 1).padStart(2, '0')}</span>
                            <div className="las-page-header-line" />
                        </div>

                        <div className="las-sticker-grid">
                            {pageItems.map(({ idx, item }) => (
                                <PanelSticker
                                    key={idx}
                                    index={idx}
                                    card={item?.card ?? null}
                                    collectionItem={item ?? null}
                                    accent={meta.accent}
                                />
                            ))}
                            {Array.from({ length: PER_PAGE - pageItems.length }).map((_, i) => (
                                <div key={`ph-${i}`} className="las-sticker-phantom" />
                            ))}
                        </div>

                        <div className="las-pagination">
                            <button
                                className="las-page-btn"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <div className="las-page-dots">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`las-page-dot${i === page ? ' las-page-dot--active' : ''}`}
                                        onClick={() => setPage(i)}
                                    />
                                ))}
                            </div>
                            <button
                                className="las-page-btn"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {def?.reward_description && (
                        <div className="las-reward-bar">
                            <Gift size={13} className="las-reward-icon" />
                            <span>{def.reward_description}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════
   ALBUM BOOK (the card itself)
══════════════════════════════════════════ */
function AlbumBook({ albumId, meta, definitions, progress, collection, locked }) {
    const [panelOpen, setPanelOpen] = useState(false);
    const [hovered, setHovered] = useState(false);

    const def = definitions.find(d => d.id === albumId);
    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const filled = Math.min(playerCol.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;

    // ── FIX: read completion from progress prop, not recalculated ──
    const isCompleted = progress.find(p => p.album_id === albumId)?.is_completed ?? false;

    const CoverArt = COVER_COMPONENTS[albumId];

    return (
        <>
            {/* ── Wrapper: no perspective/transform-style so all 4 stay equal size ── */}
            <div
                className={`las-book-wrapper${locked ? ' las-book-wrapper--locked' : ''}`}
                onMouseEnter={() => !locked && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Page-edge stack behind the book */}
                <div className="las-book-pages-stack">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="las-book-page-leaf"
                            style={{ '--leaf-i': i, '--acc': meta.accent }}
                        />
                    ))}
                </div>

                <button
                    className={[
                        'las-book',
                        locked ? 'las-book--locked' : '',
                        isCompleted ? 'las-book--done' : '',
                        meta.golden ? 'las-book--golden' : '',
                        hovered ? 'las-book--hovered' : '',
                    ].filter(Boolean).join(' ')}
                    style={{
                        '--spine': meta.spine,
                        '--spine-alt': meta.spineAlt,
                        '--acc': meta.accent,
                        '--acc-rgb': meta.accentRgb,
                        '--cover-bg': meta.coverBg,
                    }}
                    onClick={() => !locked && setPanelOpen(true)}
                    aria-disabled={locked}
                >
                    {/* Spine */}
                    <div className="las-book-spine">
                        <span className="las-book-spine-num">{meta.number}</span>
                        <span className="las-book-spine-lbl">{meta.shortLabel}</span>
                    </div>

                    {/* Cover */}
                    <div className="las-book-cover">

                        {/* Unique SVG illustration for this album */}
                        <div className="las-book-cover-art-wrap">
                            {CoverArt && (
                                <CoverArt accent={meta.accent} locked={locked} />
                            )}
                        </div>

                        {/* Rarity badge — top-right corner */}
                        {!locked && (
                            <RarityBadge
                                level={meta.rarityLevel}
                                label={meta.rarityLabel}
                                accent={meta.accent}
                                accentRgb={meta.accentRgb}
                                golden={meta.golden}
                            />
                        )}

                        {/* Season tag */}
                        <div className="las-book-tag">
                            {locked
                                ? <span className="las-book-tag-locked"><Lock size={6} strokeWidth={2.5} /> BLOQ.</span>
                                : meta.tag
                            }
                        </div>

                        {/* Title */}
                        <div className="las-book-title-block">
                            <span className="las-book-icon">
                                {meta.golden
                                    ? <Trophy size={14} strokeWidth={1.8} />
                                    : <BookOpen size={14} strokeWidth={1.8} />
                                }
                            </span>
                            <span className="las-book-title">{meta.label}</span>
                        </div>

                        {/* Lock overlay for locked albums */}
                        {locked && (
                            <div className="las-book-locked-zone">
                                <div className="las-lock-fog" />
                                <div className="las-lock-icon-wrap">
                                    <div className="las-lock-chain las-lock-chain--left" />
                                    <div className="las-lock-chain las-lock-chain--right" />
                                    <div className="las-lock-body">
                                        <Lock size={16} strokeWidth={2} />
                                    </div>
                                    <div className="las-lock-pulse" />
                                </div>
                                <span className="las-lock-label">Completa el álbum anterior</span>
                            </div>
                        )}

                        {/* Footer: progress indicator */}
                        <div className="las-book-footer">
                            <StackedPages pct={pct} accent={meta.accent} />
                            <div className="las-book-footer-row">
                                <span className="las-book-count">{filled}/{reqPlayers}</span>
                                {isCompleted && <span className="las-book-done-badge">✓</span>}
                                {!locked && <span className="las-book-hint">Abrir →</span>}
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {panelOpen && (
                <AlbumPanel
                    albumId={albumId}
                    meta={meta}
                    definitions={definitions}
                    progress={progress}
                    collection={collection}
                    onClose={() => setPanelOpen(false)}
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
        <div className="las-root">
            <div className="las-eyebrow">
                <span>Álbumes Legendarios</span>
                <div className="las-eyebrow-line" />
                <span className="las-eyebrow-count">4 álbumes</span>
            </div>

            <div className="las-books-row">
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