import React, { useState, useCallback } from 'react';
import { Lock, Search, ChevronLeft, ChevronRight, X, User, Crown } from 'lucide-react';
import '../styles/StarCollectionSection.css';
import '../styles/mobile/StarCollectionsection.mobile.css';

/* ══════════════════════════════════════════
   META POR TIER
══════════════════════════════════════════ */
const STAR_META = {
    1: {
        level: 1,
        label: 'Actuales Relevantes',
        shortLabel: 'EST I',
        desc: 'El presente del fútbol',
        spine: '#e55b5b',
        spineAlt: '#b83b3b',
        accent: '#f87171',
        accentRgb: '248,113,113',
        coverBg: '#1a0f0f',
        tag: 'NIVEL 1',
        number: '01',
        rarityLabel: 'ACTUAL',
        rarityLevel: 1,
    },
    2: {
        level: 2,
        label: 'Momentos Puntuales',
        shortLabel: 'EST II',
        desc: 'Intermitentes pero memorables',
        spine: '#5b4fd8',
        spineAlt: '#3d34a5',
        accent: '#a599d9',
        accentRgb: '165,153,217',
        coverBg: '#0f0d1a',
        tag: 'NIVEL 2',
        number: '02',
        rarityLabel: 'MOMENTO',
        rarityLevel: 2,
    },
    3: {
        level: 3,
        label: 'Culto y Distinción',
        shortLabel: 'EST III',
        desc: 'Figuras irrepetibles',
        spine: '#1D9E75',
        spineAlt: '#0d6e50',
        accent: '#34d399',
        accentRgb: '52,211,153',
        coverBg: '#0a1f18',
        tag: 'NIVEL 3',
        number: '03',
        rarityLabel: 'CULTO',
        rarityLevel: 3,
    },
    4: {
        level: 4,
        label: 'Leyendas',
        shortLabel: 'EST IV',
        desc: 'Los referentes históricos',
        spine: '#7c3aed',
        spineAlt: '#5b21b6',
        accent: '#c4b5fd',
        accentRgb: '196,181,253',
        coverBg: '#160e2a',
        tag: 'NIVEL 4',
        number: '04',
        rarityLabel: 'LEYENDA',
        rarityLevel: 4,
    },
    5: {
        level: 5,
        label: 'GOAT',
        shortLabel: 'GOAT',
        desc: 'Los 10 mejores de la historia',
        spine: '#b45309',
        spineAlt: '#7c3b00',
        accent: '#f59e0b',
        accentRgb: '245,158,11',
        coverBg: '#1a1200',
        tag: 'ESPECIAL',
        number: '✦',
        rarityLabel: 'GOAT',
        rarityLevel: 5,
        golden: true,
    },
};

const ORDER = [1, 2, 3, 4, 5];

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
   COVER ILLUSTRATIONS (una por tier)
══════════════════════════════════════════ */
function StarCoverIllustration({ level, accent, accentRgb, locked }) {
    const id = `star-cover-${level}`;

    if (level === 1) {
        return (
            <svg viewBox="0 0 120 160" className="scs2-cover-svg" aria-hidden="true">
                <defs>
                    <pattern id={`${id}-grid`} patternUnits="userSpaceOnUse" width="12" height="12">
                        <path d="M12 0H0V12" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.15" />
                    </pattern>
                    <radialGradient id={`${id}-vignette`} cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                    </radialGradient>
                </defs>
                <rect width="120" height="160" fill={`url(#${id}-grid)`} />
                {!locked && (
                    <g transform="translate(60,80)">
                        <circle cx="0" cy="0" r="28" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.2" />
                        <circle cx="0" cy="0" r="18" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.3" />
                        <circle cx="0" cy="0" r="8" fill={accent} opacity="0.15" />
                        {Array.from({ length: 8 }, (_, i) => {
                            const a = (i / 8) * Math.PI * 2;
                            return <line key={i} x1={Math.cos(a) * 10} y1={Math.sin(a) * 10} x2={Math.cos(a) * 26} y2={Math.sin(a) * 26} stroke={accent} strokeWidth="0.5" opacity="0.25" />;
                        })}
                        <polygon points="0,-14 3,-5 12,-5 5,1 8,10 0,5 -8,10 -5,1 -12,-5 -3,-5" fill={accent} opacity="0.7" />
                    </g>
                )}
                <rect width="120" height="160" fill={`url(#${id}-vignette)`} />
            </svg>
        );
    }

    if (level === 2) {
        return (
            <svg viewBox="0 0 120 160" className="scs2-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="120" height="160" fill={`url(#${id}-glow)`} />
                {!locked && (
                    <g transform="translate(60,80)">
                        {[0, 1].map(i => (
                            <polygon key={i}
                                points="0,-28 8,-8 28,-8 14,4 18,24 0,14 -18,24 -14,4 -28,-8 -8,-8"
                                fill="none" stroke={accent} strokeWidth={i === 0 ? 1.2 : 0.5}
                                opacity={i === 0 ? 0.5 : 0.2}
                                transform={`scale(${i === 0 ? 1 : 0.65})`}
                            />
                        ))}
                        {[0, 1].map(i => {
                            const a = (i / 2) * Math.PI * 2;
                            return <polygon key={i} points="0,-5 2,-2 5,-2 3,0 4,3 0,1 -4,3 -3,0 -5,-2 -2,-2" fill={accent} opacity="0.55" transform={`translate(${Math.cos(a) * 20},${Math.sin(a) * 20}) scale(0.8)`} />;
                        })}
                    </g>
                )}
                <g stroke={accent} strokeWidth="0.5" opacity="0.3">
                    {[[8, 8], [112, 8], [8, 152], [112, 152]].map(([x, y], i) => (
                        <g key={i}>
                            <line x1={x - 6} y1={y} x2={x + 6} y2={y} />
                            <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
                        </g>
                    ))}
                </g>
            </svg>
        );
    }

    if (level === 3) {
        return (
            <svg viewBox="0 0 120 160" className="scs2-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-center`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="120" height="160" fill={`url(#${id}-center)`} />
                {[38, 28, 18, 10].map((r, i) => (
                    <circle key={i} cx="60" cy="80" r={r} fill="none" stroke={accent} strokeWidth="0.6" opacity={0.08 + i * 0.07} />
                ))}
                {!locked && (
                    <g transform="translate(60,80)">
                        {Array.from({ length: 3 }, (_, i) => {
                            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
                            return <polygon key={i} points="0,-12 3,-4 11,-4 5,1 7,9 0,5 -7,9 -5,1 -11,-4 -3,-4" fill={accent} opacity="0.65" transform={`translate(${Math.cos(a) * 18},${Math.sin(a) * 18})`} />;
                        })}
                        <circle cx="0" cy="0" r="5" fill={accent} opacity="0.2" />
                    </g>
                )}
                <g stroke={accent} strokeWidth="0.5" opacity="0.25">
                    <line x1="6" y1="12" x2="20" y2="12" /><line x1="6" y1="12" x2="6" y2="26" />
                    <line x1="114" y1="12" x2="100" y2="12" /><line x1="114" y1="12" x2="114" y2="26" />
                    <line x1="6" y1="148" x2="20" y2="148" /><line x1="6" y1="148" x2="6" y2="134" />
                    <line x1="114" y1="148" x2="100" y2="148" /><line x1="114" y1="148" x2="114" y2="134" />
                </g>
            </svg>
        );
    }

    if (level === 4) {
        const hexPts = (cx, cy, r) =>
            Array.from({ length: 6 }, (_, i) => {
                const a = (Math.PI / 3) * i - Math.PI / 6;
                return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
            }).join(' ');
        const hexes = [[60, 56, 17], [36, 69, 17], [84, 69, 17], [60, 82, 17], [36, 95, 17], [84, 95, 17], [60, 108, 17]];
        return (
            <svg viewBox="0 0 120 160" className="scs2-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="120" height="160" fill={`url(#${id}-glow)`} />
                {hexes.map(([cx, cy, r], i) => (
                    <polygon key={i} points={hexPts(cx, cy, r)}
                        fill={i === 3 ? accent : 'none'} fillOpacity={i === 3 ? 0.07 : 0}
                        stroke={accent} strokeWidth="0.5" opacity={i === 3 ? 0.55 : 0.18} />
                ))}
                {!locked && (
                    <g transform="translate(60,82)">
                        {Array.from({ length: 4 }, (_, i) => {
                            const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
                            return <polygon key={i} points="0,-10 2,-3 9,-3 4,1 6,8 0,4 -6,8 -4,1 -9,-3 -2,-3" fill={accent} opacity="0.7" transform={`translate(${Math.cos(a) * 16},${Math.sin(a) * 16})`} />;
                        })}
                        <circle cx="0" cy="0" r="4" fill={accent} opacity="0.25" />
                    </g>
                )}
            </svg>
        );
    }

    /* level === 5 — GOAT dorado */
    return (
        <svg viewBox="0 0 120 160" className="scs2-cover-svg scs2-cover-svg--golden" aria-hidden="true">
            <defs>
                <pattern id={`${id}-dots`} patternUnits="userSpaceOnUse" width="10" height="10">
                    <circle cx="5" cy="5" r="0.8" fill={accent} opacity="0.3" />
                </pattern>
                <radialGradient id={`${id}-radial`} cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="120" height="160" fill={`url(#${id}-dots)`} />
            <rect width="120" height="160" fill={`url(#${id}-radial)`} />
            <rect x="7" y="7" width="106" height="146" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
            {!locked && (
                <g transform="translate(60,78)">
                    {Array.from({ length: 5 }, (_, i) => {
                        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                        return <polygon key={i} points="0,-14 3,-5 13,-5 5,2 8,12 0,7 -8,12 -5,2 -13,-5 -3,-5" fill={accent} opacity="0.75" transform={`translate(${Math.cos(a) * 22},${Math.sin(a) * 22})`} />;
                    })}
                    <polygon points="0,-14 3,-5 13,-5 5,2 8,12 0,7 -8,12 -5,2 -13,-5 -3,-5" fill={accent} opacity="0.9" />
                </g>
            )}
            <g fill={accent} opacity="0.55">
                {[[7, 7], [113, 7], [7, 153], [113, 153]].map(([x, y], i) => (
                    <polygon key={i} points={`${x},${y - 5} ${x + 4},${y} ${x},${y + 5} ${x - 4},${y}`} />
                ))}
            </g>
        </svg>
    );
}

/* ══════════════════════════════════════════
   STICKER CARD (dentro del modal)
══════════════════════════════════════════ */
function StickerCard({ index, card, collectionItem, accent, level }) {
    const num = String(index + 1).padStart(3, '0');
    const isGoat = level === 5;
    const filled = !!collectionItem;
    const stars = level;

    if (filled) {
        return (
            <div
                className={`scs2-sticker scs2-sticker--filled${isGoat ? ' scs2-sticker--goat' : ''}`}
                style={{ '--acc': accent }}
            >
                {/* Banda top degradado */}
                <div className="scs2-sticker-topband" />

                <div className="scs2-sticker-header">
                    <span className="scs2-sticker-num">{num}</span>
                    {isGoat && <Crown size={9} className="scs2-sticker-crown" />}
                    {collectionItem?.copies > 1 && (
                        <span className="scs2-sticker-copies">×{collectionItem.copies}</span>
                    )}
                </div>

                <div className="scs2-sticker-avatar-zone">
                    {card?.image_path
                        ? <img src={card.image_path} alt={card.name} className="scs2-sticker-img" />
                        : <div className="scs2-sticker-avatar">{getInitials(card?.name)}</div>
                    }
                    {/* Anillo foil */}
                    <svg className="scs2-sticker-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                        <defs>
                            <linearGradient id={`sg-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#fff" stopOpacity="0.7" />
                                <stop offset="100%" stopColor={accent} stopOpacity="0.9" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="46"
                            fill="none"
                            stroke={`url(#sg-${num}`}
                            strokeWidth="2"
                            strokeDasharray={isGoat ? "none" : "6 3"} />
                    </svg>
                </div>

                <div className="scs2-sticker-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`scs2-star ${i < stars ? 'scs2-star--on' : 'scs2-star--off'}`}>★</span>
                    ))}
                </div>

                <div className="scs2-sticker-info">
                    <span className="scs2-sticker-name">{card?.name}</span>
                    {card?.position && <span className="scs2-sticker-pos">{posLabel(card.position)}</span>}
                </div>

                {/* Foil shimmer overlay */}
                <div className="scs2-sticker-foil" />
            </div>
        );
    }

    return (
        <div className="scs2-sticker scs2-sticker--empty" style={{ '--acc': accent }}>
            <div className="scs2-sticker-header">
                <span className="scs2-sticker-num">{num}</span>
            </div>
            <div className="scs2-sticker-avatar-zone scs2-sticker-avatar-zone--empty">
                <div className="scs2-sticker-silhouette">
                    <svg viewBox="0 0 60 80" fill="currentColor" aria-hidden="true" style={{ width: '55%', opacity: 0.22 }}>
                        <ellipse cx="30" cy="18" rx="12" ry="12" />
                        <path d="M6 80 Q6 44 30 38 Q54 44 54 80Z" />
                    </svg>
                </div>
            </div>
            <div className="scs2-sticker-stars">
                {Array.from({ length: 4 }, (_, i) => (
                    <span key={i} className="scs2-star scs2-star--empty">★</span>
                ))}
            </div>
            <div className="scs2-sticker-info">
                <span className="scs2-sticker-name scs2-sticker-name--empty">???</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   MODAL PANEL
══════════════════════════════════════════ */
function StarPanel({ level, meta, collection, allCards, onClose }) {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const PER_PAGE = window.innerWidth <= 768 ? 9 : 10;

    const owned = collection.filter(
        item => item.card?.card_type === 'player' && item.card?.significance_level === level
    );
    const total = allCards.filter(
        c => c.card_type === 'player' && c.significance_level === level
    ).length;

    const pct = total > 0 ? Math.min(100, Math.round((owned.length / total) * 100)) : 0;

    const allSlots = Array.from({ length: total }, (_, i) => ({
        idx: i,
        item: owned[i] ?? null,
    }));

    const filteredSlots = search.trim()
        ? allSlots.filter(({ item }) => item?.card?.name?.toLowerCase().includes(search.toLowerCase()))
        : allSlots;

    const totalPages = Math.max(1, Math.ceil(filteredSlots.length / PER_PAGE));
    const safePagenr = Math.min(page, totalPages - 1);
    const pageItems = filteredSlots.slice(safePagenr * PER_PAGE, (safePagenr + 1) * PER_PAGE);

    const albumNum = meta.number === '✦' ? 'GOAT' : meta.number;

    return (
        <>
            <div className="scs2-overlay" onClick={onClose} />
            <div
                className="scs2-panel"
                style={{
                    '--spine': meta.spine,
                    '--spine-alt': meta.spineAlt,
                    '--acc': meta.accent,
                    '--acc-rgb': meta.accentRgb,
                    '--cover-bg': meta.coverBg,
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* TOPBAR */}
                <div className="scs2-modal-topbar">
                    <div className="scs2-modal-topbar-spine" />
                    <span className="scs2-modal-topbar-title">{meta.label}</span>
                    <span className="scs2-modal-topbar-season">{meta.tag}</span>
                    <button className="scs2-panel-close" onClick={onClose} aria-label="Cerrar"><X size={14} /></button>
                </div>

                {/* BODY */}
                <div className="scs2-panel-body">

                    {/* SIDEBAR */}
                    <div className="scs2-panel-sidebar">
                        <div className="scs2-panel-sidebar-inner">
                            <span className="scs2-sidebar-id">ID: STR-{albumNum}</span>
                            <h2 className="scs2-sidebar-title">{meta.shortLabel}</h2>

                            <div className="scs2-sidebar-count">
                                <span className="scs2-sidebar-count-big">{owned.length}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <span className="scs2-sidebar-count-sep">/ {total || '?'}</span>
                                    <span className="scs2-sidebar-count-label">Jugadores</span>
                                </div>
                            </div>

                            <div className="scs2-sidebar-divider" />

                            {/* Libro */}
                            <div className="scs2-sidebar-book-img">
                                <div className="scs2-sidebar-book-svg-wrap">
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 22,
                                        background: `linear-gradient(180deg, ${meta.spine} 0%, ${meta.spineAlt} 100%)`,
                                        borderRadius: '3px 0 0 3px',
                                        boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{
                                            fontFamily: "'DM Mono', monospace", fontSize: 7, fontWeight: 800,
                                            color: 'rgba(255,255,255,0.7)', writingMode: 'vertical-rl',
                                            textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em',
                                        }}>{meta.shortLabel}</span>
                                    </div>
                                    <div style={{
                                        position: 'absolute', left: 22, top: 0, right: 0, bottom: 0,
                                        background: meta.coverBg, borderRadius: '0 4px 4px 0', overflow: 'hidden',
                                        boxShadow: '4px 6px 0 rgba(0,0,0,0.32), 8px 14px 28px rgba(0,0,0,0.22)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <StarCoverIllustration level={level} accent={meta.accent} accentRgb={meta.accentRgb} locked={false} />
                                        <div className="scs2-clasp">
                                            <div className="scs2-clasp-strap scs2-clasp-strap--top" />
                                            <div className="scs2-clasp-buckle"><div className="scs2-clasp-buckle-inner" /></div>
                                            <div className="scs2-clasp-strap scs2-clasp-strap--bot" />
                                        </div>
                                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                                            <div key={pos} className={`scs2-corner scs2-corner--${pos}`} />
                                        ))}
                                    </div>
                                    <div style={{
                                        position: 'absolute', top: 4, right: -8, bottom: 4, width: 10,
                                        zIndex: 0, display: 'flex', flexDirection: 'column', gap: 1,
                                    }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                flex: 1, borderRadius: '0 1px 1px 0', background: '#d4cfc8',
                                                transform: `translateX(${i * 1.5}px)`, opacity: 0.7 - i * 0.2,
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="scs2-sidebar-pbar-wrap">
                                <div className="scs2-sidebar-pbar-fill" style={{ width: `${pct}%` }} />
                                <span className="scs2-sidebar-pbar-pct">{pct}%</span>
                            </div>

                            {/* Stars chip */}
                            <div className="scs2-sidebar-chips">
                                <span className="scs2-chip">
                                    {Array.from({ length: level }, () => '★').join('')}
                                    {' · '}{meta.rarityLabel}
                                </span>
                                {pct === 100 && (
                                    <span className="scs2-chip scs2-chip--done">✓ Completado</span>
                                )}
                            </div>
                        </div>

                        <div className="scs2-sidebar-desc-block">
                            <div className="scs2-sidebar-desc-full">
                                <span className="scs2-sidebar-desc-label">Descripción</span>
                                <span className="scs2-sidebar-desc-val">{meta.desc}</span>
                            </div>
                        </div>
                    </div>

                    {/* PANEL PRINCIPAL */}
                    <div className="scs2-panel-main">
                        <div className="scs2-panel-toolbar">
                            <div className="scs2-toolbar-search">
                                <Search size={13} className="scs2-toolbar-search-icon" />
                                <input
                                    type="text"
                                    className="scs2-toolbar-search-input"
                                    placeholder="Search players..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>

                        <div className="scs2-panel-scroll">
                            <div className="scs2-page-indicator">
                                <div className="scs2-page-indicator-line" />
                                <span>Página {String(safePagenr + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
                                <div className="scs2-page-indicator-line" />
                            </div>

                            <div className="scs2-sticker-grid">
                                {pageItems.map(({ idx, item }) => (
                                    <StickerCard
                                        key={idx}
                                        index={idx}
                                        card={item?.card ?? null}
                                        collectionItem={item ?? null}
                                        accent={meta.accent}
                                        level={level}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="scs2-modal-footer">
                    <div className="scs2-footer-stat">
                        <span className="scs2-footer-stat-label">Colectados</span>
                        <span className="scs2-footer-stat-val">{owned.length}</span>
                    </div>
                    <div className="scs2-footer-stat">
                        <span className="scs2-footer-stat-label">Total</span>
                        <span className="scs2-footer-stat-val">{total || '?'}</span>
                    </div>

                    <div className="scs2-footer-pagination">
                        <button
                            className="scs2-page-btn"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={safePagenr === 0}
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <div className="scs2-pagination-info">
                            PAGE <strong>{String(safePagenr + 1).padStart(2, '0')}</strong> / {String(totalPages).padStart(2, '0')}
                        </div>
                        <button
                            className="scs2-page-btn"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={safePagenr === totalPages - 1}
                            aria-label="Página siguiente"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="scs2-footer-spacer" />
                    <button className="scs2-footer-close-btn" onClick={onClose}>Cerrar Álbum</button>
                    <button className="scs2-footer-arrow-btn" onClick={onClose}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════
   BOOK CARD
══════════════════════════════════════════ */
function StarBook({ level, meta, collection, allCards }) {
    const [panelOpen, setPanelOpen] = useState(false);

    const owned = collection.filter(
        item => item.card?.card_type === 'player' && item.card?.significance_level === level
    );
    const total = allCards.filter(
        c => c.card_type === 'player' && c.significance_level === level
    ).length;

    const pct = total > 0 ? Math.min(100, Math.round((owned.length / total) * 100)) : 0;
    const isCompleted = total > 0 && owned.length >= total;

    return (
        <>
            <div className="scs2-book-wrap">
                <div className="scs2-page-stack">
                    {[2, 1, 0].map(i => (
                        <div key={i} className="scs2-page-leaf" style={{ '--li': i, '--acc': meta.accent }} />
                    ))}
                </div>

                <button
                    className={`scs2-book${isCompleted ? ' scs2-book--done' : ''}${meta.golden ? ' scs2-book--golden' : ''}`}
                    style={{
                        '--spine': meta.spine,
                        '--spine-alt': meta.spineAlt,
                        '--acc': meta.accent,
                        '--acc-rgb': meta.accentRgb,
                        '--cover-bg': meta.coverBg,
                    }}
                    onClick={() => setPanelOpen(true)}
                >
                    {/* Lomo */}
                    <div className="scs2-spine">
                        <span className="scs2-spine-num">{meta.number}</span>
                        <span className="scs2-spine-label">{meta.shortLabel}</span>
                        <div className="scs2-spine-lines">
                            {[0, 1, 2].map(i => <div key={i} className="scs2-spine-line" />)}
                        </div>
                    </div>

                    {/* Portada */}
                    <div className="scs2-cover">
                        <div className="scs2-cover-art">
                            <StarCoverIllustration level={level} accent={meta.accent} accentRgb={meta.accentRgb} locked={false} />
                        </div>
                        <div className="scs2-clasp">
                            <div className="scs2-clasp-strap scs2-clasp-strap--top" />
                            <div className="scs2-clasp-buckle"><div className="scs2-clasp-buckle-inner" /></div>
                            <div className="scs2-clasp-strap scs2-clasp-strap--bot" />
                        </div>
                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                            <div key={pos} className={`scs2-corner scs2-corner--${pos}`} />
                        ))}

                        <div className="scs2-cover-tag">{meta.tag}</div>
                        <div className="scs2-cover-id">ID: STR-{meta.number === '✦' ? 'GOAT' : meta.number}</div>

                        <div className="scs2-cover-title-block">
                            <div className="scs2-cover-stars-row">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className={`scs2-cover-star${i < level ? ' scs2-cover-star--lit' : ''}`}>★</span>
                                ))}
                            </div>
                        </div>

                        <div className="scs2-cover-footer">
                            <div className="scs2-cover-footer-info">
                                <span className="scs2-cover-count">{owned.length} / {total || '?'} JUGADORES</span>
                                {isCompleted && <span className="scs2-done-tick">✓</span>}
                            </div>
                            <div className="scs2-mini-bar">
                                <div className="scs2-mini-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="scs2-cover-hint">Abrir álbum →</span>
                        </div>

                        <div className={`scs2-rarity${meta.golden ? ' scs2-rarity--golden' : ''}`}>
                            <div className="scs2-rarity-stars">
                                {Array.from({ length: meta.rarityLevel }, (_, i) => <span key={i}>★</span>)}
                            </div>
                            <span className="scs2-rarity-label">{meta.rarityLabel}</span>
                        </div>
                    </div>
                </button>
            </div>

            {panelOpen && (
                <StarPanel
                    level={level}
                    meta={meta}
                    collection={collection}
                    allCards={allCards}
                    onClose={() => setPanelOpen(false)}
                />
            )}
        </>
    );
}

/* ══════════════════════════════════════════
   EXPORT PRINCIPAL
══════════════════════════════════════════ */
export default function StarCollectionSection({ collection, allCards }) {
    return (
        <div className="scs2-root">
            <div className="scs2-eyebrow">
                <span>Colección de Estrellas</span>
                <div className="scs2-eyebrow-line" />
                <span className="scs2-eyebrow-count">5 álbumes</span>
            </div>
            <div className="scs2-row">
                {ORDER.map(level => (
                    <StarBook
                        key={level}
                        level={level}
                        meta={STAR_META[level]}
                        collection={collection}
                        allCards={allCards}
                    />
                ))}
            </div>
        </div>
    );
}