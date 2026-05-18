import React, { useState, useCallback } from 'react';
import { Lock, BookOpen, Trophy, Star, ChevronLeft, ChevronRight, Gift, Crown, X, User } from 'lucide-react';
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
        coverPattern: 'diagonal',
        rarityLevel: 4,
        coverSubtitle: 'LEGENDARIOS',
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
        coverPattern: 'hex',
        rarityLevel: 4,
        rarityLabel: 'LEYENDA+',
        coverSubtitle: 'LEGENDARIOS',
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
        coverPattern: 'radial',
        rarityLevel: 5,
        rarityLabel: 'ÉLITE',
        coverSubtitle: 'LEGENDARIOS',
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
        coverPattern: 'spiral',
        rarityLevel: 5,
        rarityLabel: 'GOAT',
        coverSubtitle: 'DORADO',
    },
};

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
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
   FIX: Cálculo de progreso POR ÁLBUM
   Cada álbum tiene sus propios requisitos de stars
══════════════════════════════════════════ */
function calcAlbumProgress(meta, collection) {
    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = meta.slots;

    // Para golden_album: todos deben ser 5 estrellas
    // Para los demás: cualquier jugador califica, pero se verifica los requisitos de estrellas
    let qualifiedPlayers;
    if (meta.golden) {
        qualifiedPlayers = playerCol.filter(c => c.card?.significance_level === 5);
    } else {
        qualifiedPlayers = playerCol.filter(c => (c.card?.significance_level ?? 0) >= 1);
    }

    const stars4Count = playerCol.filter(c => (c.card?.significance_level ?? 0) >= 4).length;
    const stars5Count = playerCol.filter(c => c.card?.significance_level === 5).length;

    const filled = Math.min(qualifiedPlayers.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;

    return { filled, pct, stars4Count, stars5Count, qualifiedPlayers };
}

/* ══════════════════════════════════════════
   COVER ILLUSTRATIONS — libro estilo imagen
══════════════════════════════════════════ */
function BookCoverIllustration({ albumId, accent, accentRgb, locked }) {
    const id = `cover-${albumId}`;

    if (albumId === 'legendary_1') {
        return (
            <svg viewBox="0 0 120 160" className="las-cover-svg" aria-hidden="true">
                <defs>
                    <pattern id={`${id}-hatch`} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="10" stroke={accent} strokeWidth="0.8" opacity="0.18" />
                    </pattern>
                    <radialGradient id={`${id}-vignette`} cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                    </radialGradient>
                </defs>
                <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-hatch)`} />
                {/* Corner ornaments */}
                <g stroke={accent} strokeWidth="0.7" opacity="0.45" fill="none">
                    <polyline points="8,8 8,22 22,22" />
                    <polyline points="112,8 112,22 98,22" />
                    <polyline points="8,152 8,138 22,138" />
                    <polyline points="112,152 112,138 98,138" />
                </g>
                {/* Shield */}
                {!locked && (
                    <g transform="translate(60,78)">
                        <path d="M0,-34 L26,-20 L26,6 Q26,26 0,40 Q-26,26 -26,6 L-26,-20 Z"
                            fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="1.2" />
                        <path d="M0,-22 L16,-12 L16,4 Q16,18 0,27 Q-16,18 -16,4 L-16,-12 Z"
                            fill={accent} fillOpacity="0.06" stroke={accent} strokeWidth="0.6" strokeOpacity="0.5" />
                        <line x1="0" y1="-22" x2="0" y2="24" stroke={accent} strokeWidth="0.8" opacity="0.4" />
                        <line x1="-20" y1="-4" x2="20" y2="-4" stroke={accent} strokeWidth="0.8" opacity="0.4" />
                        <circle cx="0" cy="-4" r="3" fill={accent} opacity="0.5" />
                    </g>
                )}
                <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-vignette)`} />
            </svg>
        );
    }

    if (albumId === 'legendary_2') {
        const hexPts = (cx, cy, r) =>
            Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 3) * i - Math.PI / 6;
                return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
            }).join(' ');

        const hexes = [
            [60, 56, 18], [36, 69, 18], [84, 69, 18],
            [60, 82, 18], [36, 95, 18], [84, 95, 18], [60, 108, 18],
        ];
        return (
            <svg viewBox="0 0 120 160" className="las-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-glow)`} />
                {hexes.map(([cx, cy, r], i) => (
                    <polygon key={i} points={hexPts(cx, cy, r)}
                        fill={i === 3 ? accent : 'none'} fillOpacity={i === 3 ? 0.08 : 0}
                        stroke={accent} strokeWidth="0.6" opacity={i === 3 ? 0.6 : 0.2} />
                ))}
                {/* Corner diamonds */}
                <g fill={accent} opacity="0.35">
                    {[[10, 10], [110, 10], [10, 150], [110, 150]].map(([x, y], i) => (
                        <polygon key={i} points={`${x},${y - 5} ${x + 4},${y} ${x},${y + 5} ${x - 4},${y}`} />
                    ))}
                </g>
                {/* Crown */}
                {!locked && (
                    <g transform="translate(60,82)">
                        <path d="M-16,10 L-16,-6 L-8,2 L0,-14 L8,2 L16,-6 L16,10 Z"
                            fill="none" stroke={accent} strokeWidth="1.4" strokeLinejoin="round" opacity="0.9" />
                        <rect x="-16" y="10" width="32" height="4" rx="1.5" fill={accent} opacity="0.35" />
                        <circle cx="0" cy="-1" r="2" fill={accent} opacity="0.7" />
                        <circle cx="-10" cy="3" r="1.2" fill={accent} opacity="0.5" />
                        <circle cx="10" cy="3" r="1.2" fill={accent} opacity="0.5" />
                    </g>
                )}
            </svg>
        );
    }

    if (albumId === 'legendary_3') {
        return (
            <svg viewBox="0 0 120 160" className="las-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-center`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-center)`} />
                {/* Concentric rings */}
                {[50, 40, 30, 20, 12].map((r, i) => (
                    <circle key={i} cx="60" cy="80" r={r}
                        fill="none" stroke={accent} strokeWidth="0.7"
                        opacity={0.08 + i * 0.06} />
                ))}
                {/* Radiating lines */}
                {Array.from({ length: 16 }, (_, i) => {
                    const a = (i / 16) * Math.PI * 2;
                    return (
                        <line key={i}
                            x1={60 + 14 * Math.cos(a)} y1={80 + 14 * Math.sin(a)}
                            x2={60 + 52 * Math.cos(a)} y2={80 + 52 * Math.sin(a)}
                            stroke={accent} strokeWidth="0.4" opacity="0.14" />
                    );
                })}
                {/* Crosshair corners */}
                <g stroke={accent} strokeWidth="0.6" opacity="0.4">
                    <line x1="6" y1="12" x2="20" y2="12" /><line x1="6" y1="12" x2="6" y2="26" />
                    <line x1="114" y1="12" x2="100" y2="12" /><line x1="114" y1="12" x2="114" y2="26" />
                    <line x1="6" y1="148" x2="20" y2="148" /><line x1="6" y1="148" x2="6" y2="134" />
                    <line x1="114" y1="148" x2="100" y2="148" /><line x1="114" y1="148" x2="114" y2="134" />
                </g>
                {/* Lightning bolt */}
                {!locked && (
                    <g transform="translate(60,80)">
                        <circle cx="0" cy="0" r="13" fill={accent} fillOpacity="0.08" />
                        <path d="M7,-20 L-5,-2 L4,-2 L-7,20 L5,2 L-4,2 Z"
                            fill={accent} opacity="0.9" />
                    </g>
                )}
            </svg>
        );
    }

    // Golden
    return (
        <svg viewBox="0 0 120 160" className="las-cover-svg las-cover-svg--golden" aria-hidden="true">
            <defs>
                <pattern id={`${id}-dots`} patternUnits="userSpaceOnUse" width="12" height="12">
                    <circle cx="6" cy="6" r="1" fill={accent} opacity="0.25" />
                </pattern>
                <radialGradient id={`${id}-radial`} cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-dots)`} />
            <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-radial)`} />
            {/* Ornamental border */}
            <rect x="7" y="7" width="106" height="146" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
            <rect x="11" y="11" width="98" height="138" fill="none" stroke={accent} strokeWidth="0.3" opacity="0.2" />
            {/* Corner diamonds */}
            <g fill={accent} opacity="0.6">
                {[[7, 7], [113, 7], [7, 153], [113, 153]].map(([x, y], i) => (
                    <polygon key={i} points={`${x},${y - 6} ${x + 5},${y} ${x},${y + 6} ${x - 5},${y}`} />
                ))}
            </g>
            {/* Spiral */}
            {!locked && (
                <>
                    <path d="M60,80 Q68,62 76,72 Q86,88 70,98 Q50,110 40,88 Q30,62 56,50 Q84,38 94,72 Q102,104 74,118"
                        fill="none" stroke={accent} strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
                    {/* Trophy */}
                    <g transform="translate(60,76)">
                        <path d="M-12,-20 Q-14,4 0,16 Q14,4 12,-20 Z"
                            fill="none" stroke={accent} strokeWidth="1.4" strokeLinejoin="round" opacity="0.95" />
                        <path d="M-12,-12 Q-22,-12 -22,-4 Q-22,4 -12,4" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
                        <path d="M12,-12 Q22,-12 22,-4 Q22,4 12,4" fill="none" stroke={accent} strokeWidth="1" opacity="0.7" />
                        <line x1="0" y1="16" x2="0" y2="22" stroke={accent} strokeWidth="1.4" opacity="0.8" />
                        <rect x="-10" y="22" width="20" height="4" rx="2" fill={accent} opacity="0.6" />
                        <path d="M0,-8 L2,-4 L6,-4 L3,-1 L4,3 L0,1 L-4,3 L-3,-1 L-6,-4 L-2,-4 Z"
                            fill={accent} opacity="0.75" />
                    </g>
                </>
            )}
        </svg>
    );
}

/* ══════════════════════════════════════════
   STICKER CARD — panel mejorado
══════════════════════════════════════════ */
function StickerCard({ index, card, collectionItem, accent }) {
    const num = String(index + 1).padStart(3, '0');
    const isGoat = card?.significance_level === 5;
    const filled = !!collectionItem;
    const stars = card?.significance_level ?? 0;

    if (filled) {
        return (
            <div className={`las2-sticker las2-sticker--filled${isGoat ? ' las2-sticker--goat' : ''}`}
                style={{ '--acc': accent }}>
                {/* Header */}
                <div className="las2-sticker-header">
                    <span className="las2-sticker-num">{num}</span>
                    {isGoat && <Crown size={9} className="las2-sticker-crown" />}
                    {collectionItem?.copies > 1 && (
                        <span className="las2-sticker-copies">×{collectionItem.copies}</span>
                    )}
                </div>
                {/* Avatar */}
                <div className="las2-sticker-avatar-zone">
                    {card?.image_path
                        ? <img src={card.image_path} alt={card.name} className="las2-sticker-img" />
                        : <div className="las2-sticker-avatar">{getInitials(card?.name)}</div>
                    }
                </div>
                {/* Stars */}
                <div className="las2-sticker-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`las2-star ${i < stars ? 'las2-star--on' : 'las2-star--off'}`}>★</span>
                    ))}
                </div>
                {/* Info */}
                <div className="las2-sticker-info">
                    <span className="las2-sticker-name">{card?.name}</span>
                    {card?.position && <span className="las2-sticker-pos">{posLabel(card.position)}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className="las2-sticker las2-sticker--empty" style={{ '--acc': accent }}>
            <div className="las2-sticker-header">
                <span className="las2-sticker-num">{num}</span>
            </div>
            <div className="las2-sticker-avatar-zone">
                <div className="las2-sticker-silhouette">
                    <User size={22} strokeWidth={1} />
                </div>
            </div>
            <div className="las2-sticker-stars">
                {Array.from({ length: 4 }, (_, i) => (
                    <span key={i} className="las2-star las2-star--empty">★</span>
                ))}
            </div>
            <div className="las2-sticker-info">
                <span className="las2-sticker-name las2-sticker-name--empty">???</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   PANEL DETALLE — diseño radical nuevo
══════════════════════════════════════════ */
function AlbumPanel({ albumId, meta, definitions, progress, collection, onClose }) {
    const [page, setPage] = useState(0);
    const PER_PAGE = 12; // más cartas por página

    const def = definitions.find(d => d.id === albumId);
    const prog = progress.find(p => p.album_id === albumId);
    const isCompleted = prog?.is_completed ?? false;

    const { filled, pct, stars4Count, stars5Count, qualifiedPlayers } = calcAlbumProgress(meta, collection);
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const reqStars4 = def?.required_min_stars_4 ?? meta.minStars4;
    const reqStars5 = def?.required_min_stars_5 ?? meta.minStars5;
    const totalPages = Math.ceil(meta.slots / PER_PAGE);

    const pageItems = Array.from({ length: PER_PAGE }, (_, i) => {
        const gi = page * PER_PAGE + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: qualifiedPlayers[gi] ?? null };
    }).filter(Boolean);

    return (
        <>
            <div className="las2-overlay" onClick={onClose} />
            <div className="las2-panel" style={{ '--spine': meta.spine, '--acc': meta.accent, '--acc-rgb': meta.accentRgb, '--cover-bg': meta.coverBg }}>

                {/* ── HEADER ── */}
                <div className="las2-panel-head">
                    <div className="las2-panel-head-spine" />
                    <div className="las2-panel-head-body">
                        <div className="las2-panel-head-top">
                            <div className="las2-panel-title-group">
                                <span className="las2-panel-season">{meta.tag}</span>
                                <h2 className="las2-panel-title">{meta.label}</h2>
                                <p className="las2-panel-req">{meta.req}</p>
                            </div>
                            <div className="las2-panel-count-block">
                                <span className="las2-panel-count-big">{filled}</span>
                                <div className="las2-panel-count-meta">
                                    <span className="las2-panel-count-sep">/ {reqPlayers}</span>
                                    <span className="las2-panel-count-label">jugadores</span>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="las2-pbar-wrap">
                            <div className="las2-pbar-fill" style={{ width: `${pct}%` }} />
                            <span className="las2-pbar-pct">{pct}%</span>
                        </div>

                        {/* Requirement chips */}
                        <div className="las2-chips">
                            <span className={`las2-chip ${stars4Count >= reqStars4 ? 'las2-chip--ok' : ''}`}>
                                {'★★★★'} {Math.min(stars4Count, reqStars4)}/{reqStars4}
                            </span>
                            {reqStars5 > 0 && (
                                <span className={`las2-chip ${stars5Count >= reqStars5 ? 'las2-chip--ok' : ''}`}>
                                    <Crown size={10} /> {Math.min(stars5Count, reqStars5)}/{reqStars5} GOAT
                                </span>
                            )}
                            {isCompleted && (
                                <span className="las2-chip las2-chip--done">✓ Completado</span>
                            )}
                        </div>
                    </div>
                    <button className="las2-panel-close" onClick={onClose} aria-label="Cerrar">
                        <X size={16} />
                    </button>
                </div>

                {/* ── BODY: grid de stickers ── */}
                <div className="las2-panel-scroll">

                    {/* Page indicator */}
                    <div className="las2-page-indicator">
                        <div className="las2-page-indicator-line" />
                        <span>Página {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
                        <div className="las2-page-indicator-line" />
                    </div>

                    {/* Grid */}
                    <div className="las2-sticker-grid">
                        {pageItems.map(({ idx, item }) => (
                            <StickerCard
                                key={idx}
                                index={idx}
                                card={item?.card ?? null}
                                collectionItem={item ?? null}
                                accent={meta.accent}
                            />
                        ))}
                    </div>

                    {/* Paginación */}
                    <div className="las2-pagination">
                        <button className="las2-page-btn"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}>
                            <ChevronLeft size={16} />
                        </button>
                        <div className="las2-page-nums">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i}
                                    className={`las2-page-num ${i === page ? 'las2-page-num--active' : ''}`}
                                    onClick={() => setPage(i)}>
                                    {String(i + 1).padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                        <button className="las2-page-btn"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Reward */}
                    {def?.reward_description && (
                        <div className="las2-reward">
                            <Gift size={14} />
                            <span>{def.reward_description}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════
   BOOK CARD — estilo álbum físico (imagen ref)
══════════════════════════════════════════ */
function AlbumBook({ albumId, meta, definitions, progress, collection, locked }) {
    const [panelOpen, setPanelOpen] = useState(false);

    const { filled, pct, qualifiedPlayers } = locked
        ? { filled: 0, pct: 0, qualifiedPlayers: [] }
        : calcAlbumProgress(meta, collection);
    const reqPlayers = meta.slots;

    const isCompleted = progress.find(p => p.album_id === albumId)?.is_completed ?? false;

    return (
        <>
            <div className={`las2-book-wrap ${locked ? 'las2-book-wrap--locked' : ''}`}>
                {/* Page stack effect */}
                <div className="las2-page-stack">
                    {[2, 1, 0].map(i => (
                        <div key={i} className="las2-page-leaf"
                            style={{ '--li': i, '--acc': meta.accent }} />
                    ))}
                </div>

                <button
                    className={`las2-book ${isCompleted ? 'las2-book--done' : ''} ${meta.golden ? 'las2-book--golden' : ''}`}
                    style={{
                        '--spine': meta.spine,
                        '--spine-alt': meta.spineAlt,
                        '--acc': meta.accent,
                        '--acc-rgb': meta.accentRgb,
                        '--cover-bg': meta.coverBg,
                    }}
                    onClick={() => !locked && setPanelOpen(true)}
                    disabled={locked}
                    aria-disabled={locked}
                >
                    {/* ── LOMO (spine) ── */}
                    <div className="las2-spine">
                        <span className="las2-spine-num">{meta.number}</span>
                        <span className="las2-spine-label">{meta.shortLabel}</span>
                        <div className="las2-spine-lines">
                            {[0, 1, 2].map(i => <div key={i} className="las2-spine-line" />)}
                        </div>
                    </div>

                    {/* ── PORTADA ── */}
                    <div className="las2-cover">
                        {/* Ilustración SVG de fondo */}
                        <div className="las2-cover-art">
                            <BookCoverIllustration
                                albumId={albumId}
                                accent={meta.accent}
                                accentRgb={meta.accentRgb}
                                locked={locked}
                            />
                        </div>

                        {/* Clasp / hebilla (estilo imagen) */}
                        <div className="las2-clasp">
                            <div className="las2-clasp-strap las2-clasp-strap--top" />
                            <div className="las2-clasp-buckle">
                                <div className="las2-clasp-buckle-inner" />
                            </div>
                            <div className="las2-clasp-strap las2-clasp-strap--bot" />
                        </div>

                        {/* Metal corners */}
                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                            <div key={pos} className={`las2-corner las2-corner--${pos}`} />
                        ))}

                        {/* Tag temporada / Lock */}
                        <div className="las2-cover-tag">
                            {locked
                                ? <><Lock size={7} strokeWidth={2.5} /> BLOQUEADO</>
                                : meta.tag
                            }
                        </div>

                        {/* ID del álbum */}
                        <div className="las2-cover-id">ID: ALB-{meta.number === '✦' ? 'GOLD' : meta.number}</div>

                        {/* Título del libro (centro) */}
                        <div className="las2-cover-title-block">
                            <span className="las2-cover-brand"></span>
                        </div>

                        {/* Lock overlay */}
                        {locked && (
                            <div className="las2-lock-overlay">
                                <div className="las2-lock-fog" />
                                <div className="las2-lock-core">
                                    <div className="las2-lock-ring" />
                                    <Lock size={18} strokeWidth={1.8} />
                                    <div className="las2-lock-pulse" />
                                </div>
                                <span className="las2-lock-msg">Completa el álbum anterior</span>
                            </div>
                        )}

                        {/* Footer del libro */}
                        <div className="las2-cover-footer">
                            <div className="las2-cover-footer-info">
                                <span className="las2-cover-count">{filled} / {reqPlayers} ITEMS</span>
                                {isCompleted && <span className="las2-done-tick">✓</span>}
                            </div>
                            {/* Mini progress */}
                            <div className="las2-mini-bar">
                                <div className="las2-mini-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            {!locked && (
                                <span className="las2-cover-hint">Abrir álbum →</span>
                            )}
                        </div>

                        {/* Rarity badge */}
                        {!locked && (
                            <div className={`las2-rarity ${meta.golden ? 'las2-rarity--golden' : ''}`}>
                                <div className="las2-rarity-stars">
                                    {Array.from({ length: meta.rarityLevel }, (_, i) => <span key={i}>★</span>)}
                                </div>
                                <span className="las2-rarity-label">{meta.rarityLabel}</span>
                            </div>
                        )}
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
    const isUnlocked = useCallback((albumId) => {
        const idx = ORDER.indexOf(albumId);
        if (idx === 0) return true;
        const prev = progress.find(p => p.album_id === ORDER[idx - 1]);
        return prev?.is_completed ?? false;
    }, [progress]);

    return (
        <div className="las2-root">
            <div className="las2-eyebrow">
                <span>Álbumes Legendarios</span>
                <div className="las2-eyebrow-line" />
                <span className="las2-eyebrow-count">4 álbumes</span>
            </div>

            <div className="las2-row">
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