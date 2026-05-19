import React, { useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Crown } from 'lucide-react';
import { getHistoricalImageUrl } from '@/features/history/services/history.service';
import '../styles/CultAlbumsSection.css';
import '../styles/mobile/CultAlbumsSection.mobile.css';

// ══════════════════════════════════════════════════════════════
//  META DE CATEGORÍAS DE CULTO
// ══════════════════════════════════════════════════════════════
const CULT_META = {
    cult_teams: {
        label: 'Equipos Históricos',
        shortLabel: 'EQUIPOS',
        eyebrow: 'Álbum de Culto',
        typeTag: 'EQUIPO',
        color: '#5b4fd8',
        colorAlt: '#3d34a5',
        colorRgb: '91,79,216',
        coverBg: '#0f0d1a',
        pageNum: '08',
        cardType: 'team',
        icon: '🛡',
        number: '01',
        tag: 'CULTO · EQUIPOS',
        rarityLabel: 'HISTÓRICO',
        rarityLevel: 3,
    },
    cult_competitions: {
        label: 'Competiciones Históricas',
        shortLabel: 'COPAS',
        eyebrow: 'Álbum de Culto',
        typeTag: 'COPA',
        color: '#f59e0b',
        colorAlt: '#b45309',
        colorRgb: '245,158,11',
        coverBg: '#1a1200',
        pageNum: '12',
        cardType: 'competition',
        icon: '🏆',
        number: '02',
        tag: 'CULTO · COPAS',
        rarityLabel: 'LEGENDARIO',
        rarityLevel: 4,
    },
    cult_events: {
        label: 'Eventos Históricos',
        shortLabel: 'EVENTOS',
        eyebrow: 'Álbum de Culto',
        typeTag: 'EVENTO',
        color: '#1D9E75',
        colorAlt: '#0d6e50',
        colorRgb: '29,158,117',
        coverBg: '#0a1f18',
        pageNum: '16',
        cardType: 'event',
        icon: '⚡',
        number: '03',
        tag: 'CULTO · MOMENTOS',
        rarityLabel: 'ÉPICO',
        rarityLevel: 3,
    },
};

const CULT_ORDER = ['cult_teams', 'cult_competitions', 'cult_events'];

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════
function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// ══════════════════════════════════════════════════════════════
//  COVER ILLUSTRATIONS — una por tipo de culto
// ══════════════════════════════════════════════════════════════
function CultCoverIllustration({ defId, color, colorRgb }) {
    const id = `cult-cover-${defId}`;

    if (defId === 'cult_teams') {
        return (
            <svg viewBox="0 0 120 160" className="cas2-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-glow`} cx="50%" cy="60%" r="55%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="120" height="160" fill={`url(#${id}-glow)`} />
                {/* Escudo central */}
                <g transform="translate(60,78)">
                    <path
                        d="M0,-32 L26,-18 L26,8 Q26,30 0,44 Q-26,30 -26,8 L-26,-18 Z"
                        fill="none" stroke={color} strokeWidth="1.4" opacity="0.5"
                    />
                    <path
                        d="M0,-22 L18,-12 L18,4 Q18,20 0,30 Q-18,20 -18,4 L-18,-12 Z"
                        fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.8" opacity="0.6"
                    />
                    {/* Cruz */}
                    <line x1="0" y1="-18" x2="0" y2="24" stroke={color} strokeWidth="0.8" opacity="0.45" />
                    <line x1="-16" y1="2" x2="16" y2="2" stroke={color} strokeWidth="0.8" opacity="0.45" />
                    <circle cx="0" cy="2" r="3" fill={color} opacity="0.4" />
                </g>
                {/* Esquinas */}
                <g stroke={color} strokeWidth="0.6" opacity="0.3">
                    <polyline points="8,8 8,18 18,18" /><polyline points="112,8 112,18 102,18" />
                    <polyline points="8,152 8,142 18,142" /><polyline points="112,152 112,142 102,142" />
                </g>
            </svg>
        );
    }

    if (defId === 'cult_competitions') {
        return (
            <svg viewBox="0 0 120 160" className="cas2-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-center`} cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect width="120" height="160" fill={`url(#${id}-center)`} />
                {/* Trofeo */}
                <g transform="translate(60,78)">
                    <path
                        d="M-12,-20 Q-14,4 0,16 Q14,4 12,-20 Z"
                        fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" opacity="0.9"
                    />
                    <path d="M-12,-12 Q-22,-12 -22,-4 Q-22,4 -12,4" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
                    <path d="M12,-12 Q22,-12 22,-4 Q22,4 12,4" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
                    <line x1="0" y1="16" x2="0" y2="22" stroke={color} strokeWidth="1.4" opacity="0.8" />
                    <rect x="-10" y="22" width="20" height="4" rx="2" fill={color} opacity="0.5" />
                    {/* Estrella interna */}
                    <path d="M0,-8 L2,-4 L6,-4 L3,-1 L4,3 L0,1 L-4,3 L-3,-1 L-6,-4 L-2,-4 Z" fill={color} opacity="0.75" />
                </g>
                {/* Círculos decorativos */}
                {[45, 35, 25].map((r, i) => (
                    <circle key={i} cx="60" cy="80" r={r} fill="none" stroke={color} strokeWidth="0.5" opacity={0.06 + i * 0.04} />
                ))}
                <g fill={color} opacity="0.5">
                    {[[7, 7], [113, 7], [7, 153], [113, 153]].map(([x, y], i) => (
                        <polygon key={i} points={`${x},${y - 5} ${x + 4},${y} ${x},${y + 5} ${x - 4},${y}`} />
                    ))}
                </g>
            </svg>
        );
    }

    // cult_events — rayo / zap
    return (
        <svg viewBox="0 0 120 160" className="cas2-cover-svg" aria-hidden="true">
            <defs>
                <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                <pattern id={`${id}-dots`} patternUnits="userSpaceOnUse" width="12" height="12">
                    <circle cx="6" cy="6" r="0.7" fill={color} opacity="0.22" />
                </pattern>
            </defs>
            <rect width="120" height="160" fill={`url(#${id}-dots)`} />
            <rect width="120" height="160" fill={`url(#${id}-glow)`} />
            {/* Rayo */}
            <g transform="translate(60,80)">
                <path d="M7,-34 L-5,-2 L4,-2 L-7,34 L5,2 L-4,2 Z"
                    fill={color} opacity="0.88"
                    stroke={color} strokeWidth="0.5"
                />
                {/* Ondas de energía */}
                {[18, 28].map((r, i) => (
                    <path key={i}
                        d={`M-${r},0 Q-${r - 6},-${r / 2} 0,-${r - 4} Q${r - 6},-${r / 2} ${r},0`}
                        fill="none" stroke={color} strokeWidth="0.7"
                        opacity={0.2 - i * 0.05}
                    />
                ))}
            </g>
            <g stroke={color} strokeWidth="0.5" opacity="0.3">
                <line x1="8" y1="12" x2="20" y2="12" /><line x1="8" y1="12" x2="8" y2="24" />
                <line x1="112" y1="12" x2="100" y2="12" /><line x1="112" y1="12" x2="112" y2="24" />
                <line x1="8" y1="148" x2="20" y2="148" /><line x1="8" y1="148" x2="8" y2="136" />
                <line x1="112" y1="148" x2="100" y2="148" /><line x1="112" y1="148" x2="112" y2="136" />
            </g>
        </svg>
    );
}

// ══════════════════════════════════════════════════════════════
//  STICKER CARD dentro del modal
// ══════════════════════════════════════════════════════════════
function CultStickerCard({ index, item, meta }) {
    const num = String(index + 1).padStart(3, '0');
    const card = item?.card;
    const filled = !!item;

    if (filled) {
        const resolvedImg = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;
        return (
            <div className="cas2-sticker cas2-sticker--filled" style={{ '--acc': meta.color }}>
                {/* Banda top degradado */}
                <div className="cas2-sticker-topband" />

                <div className="cas2-sticker-header">
                    <span className="cas2-sticker-num">{num}</span>
                    {item.copies > 1 && (
                        <span className="cas2-sticker-copies">×{item.copies}</span>
                    )}
                </div>

                <div className="cas2-sticker-avatar-zone">
                    {resolvedImg ? (
                        <img src={resolvedImg} alt={card.name} className="cas2-sticker-img" />
                    ) : (
                        <div className="cas2-sticker-avatar">{getInitials(card?.name)}</div>
                    )}
                    {/* Anillo foil */}
                    <svg className="cas2-sticker-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                        <defs>
                            <linearGradient id={`cg-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={meta.color} stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#fff" stopOpacity="0.7" />
                                <stop offset="100%" stopColor={meta.color} stopOpacity="0.9" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="46"
                            fill="none"
                            stroke={`url(#cg-${num})`}
                            strokeWidth="2"
                            strokeDasharray="6 3" />
                    </svg>
                </div>

                <div className="cas2-sticker-info">
                    <span className="cas2-sticker-name">{card?.name}</span>
                </div>

                {/* Foil shimmer overlay */}
                <div className="cas2-sticker-foil" />
            </div>
        );
    }

    return (
        <div className="cas2-sticker cas2-sticker--empty" style={{ '--acc': meta.color }}>
            <div className="cas2-sticker-header">
                <span className="cas2-sticker-num">{num}</span>
            </div>
            <div className="cas2-sticker-avatar-zone cas2-sticker-avatar-zone--empty">
                <div className="cas2-sticker-silhouette">
                    <svg viewBox="0 0 60 80" fill="currentColor" aria-hidden="true" style={{ width: '55%', opacity: 0.22 }}>
                        <ellipse cx="30" cy="18" rx="12" ry="12" />
                        <path d="M6 80 Q6 44 30 38 Q54 44 54 80Z" />
                    </svg>
                </div>
            </div>
            <div className="cas2-sticker-info">
                <span className="cas2-sticker-name cas2-sticker-name--empty">???</span>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
//  MODAL PANEL — igual estructura que LegendaryAlbumsSection
// ══════════════════════════════════════════════════════════════
function CultPanel({ defId, meta, collection, allCards, onClose }) {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const PER_PAGE = window.innerWidth <= 768 ? 9 : 10;

    const owned = collection.filter(item => item.card?.card_type === meta.cardType);
    const total = allCards.filter(c => c.card_type === meta.cardType).length;
    const pct = total > 0 ? Math.min(100, Math.round((owned.length / total) * 100)) : 0;

    const allSlots = Array.from({ length: total }, (_, i) => ({
        idx: i,
        item: owned[i] ?? null,
    }));

    const filteredSlots = search.trim()
        ? allSlots.filter(({ item }) =>
            item?.card?.name?.toLowerCase().includes(search.toLowerCase())
        )
        : allSlots;

    const totalPages = Math.max(1, Math.ceil(filteredSlots.length / PER_PAGE));
    const safePagenr = Math.min(page, totalPages - 1);
    const pageItems = filteredSlots.slice(safePagenr * PER_PAGE, (safePagenr + 1) * PER_PAGE);

    return (
        <>
            <div className="cas2-overlay" onClick={onClose} />
            <div
                className="cas2-panel"
                style={{
                    '--spine': meta.color,
                    '--spine-alt': meta.colorAlt,
                    '--acc': meta.color,
                    '--acc-rgb': meta.colorRgb,
                    '--cover-bg': meta.coverBg,
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── TOPBAR ── */}
                <div className="cas2-modal-topbar">
                    <div className="cas2-modal-topbar-spine" />
                    <span className="cas2-modal-topbar-title">{meta.label}</span>
                    <span className="cas2-modal-topbar-season">{meta.tag}</span>
                    <button className="cas2-panel-close" onClick={onClose} aria-label="Cerrar">
                        <X size={14} />
                    </button>
                </div>

                {/* ── BODY ── */}
                <div className="cas2-panel-body">

                    {/* ── SIDEBAR ── */}
                    <div className="cas2-panel-sidebar">
                        <div className="cas2-panel-sidebar-inner">
                            <span className="cas2-sidebar-id">ID: CLT-{meta.number}</span>
                            <h2 className="cas2-sidebar-title">{meta.shortLabel}</h2>

                            <div className="cas2-sidebar-count">
                                <span className="cas2-sidebar-count-big">{owned.length}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <span className="cas2-sidebar-count-sep">/ {total || '?'}</span>
                                    <span className="cas2-sidebar-count-label">Cartas</span>
                                </div>
                            </div>

                            <div className="cas2-sidebar-divider" />

                            {/* Mini libro en sidebar */}
                            <div className="cas2-sidebar-book-img">
                                <div className="cas2-sidebar-book-svg-wrap">
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 22,
                                        background: `linear-gradient(180deg, ${meta.color} 0%, ${meta.colorAlt} 100%)`,
                                        borderRadius: '3px 0 0 3px',
                                        boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{
                                            fontFamily: "'DM Mono', monospace", fontSize: 7, fontWeight: 800,
                                            color: 'rgba(255,255,255,0.75)', writingMode: 'vertical-rl',
                                            textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em',
                                        }}>{meta.shortLabel}</span>
                                    </div>
                                    <div style={{
                                        position: 'absolute', left: 22, top: 0, right: 0, bottom: 0,
                                        background: meta.coverBg, borderRadius: '0 4px 4px 0', overflow: 'hidden',
                                        boxShadow: '4px 6px 0 rgba(0,0,0,0.32), 8px 14px 28px rgba(0,0,0,0.22)',
                                    }}>
                                        <CultCoverIllustration defId={defId} color={meta.color} colorRgb={meta.colorRgb} />
                                        {/* Cantoneras */}
                                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                                            <div key={pos} className={`cas2-corner cas2-corner--${pos}`} />
                                        ))}
                                    </div>
                                    {/* Páginas laterales */}
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

                            {/* Progress bar */}
                            <div className="cas2-sidebar-pbar-wrap">
                                <div className="cas2-sidebar-pbar-fill" style={{ width: `${pct}%` }} />
                                <span className="cas2-sidebar-pbar-pct">{pct}%</span>
                            </div>

                            {/* Chips */}
                            <div className="cas2-sidebar-chips">
                                <span className="cas2-chip">
                                    {meta.icon} {meta.typeTag} · {meta.rarityLabel}
                                </span>
                                {pct === 100 && (
                                    <span className="cas2-chip cas2-chip--done">✓ Completado</span>
                                )}
                            </div>
                        </div>

                        {/* Desc */}
                        <div className="cas2-sidebar-desc-block">
                            <div className="cas2-sidebar-desc-full">
                                <span className="cas2-sidebar-desc-label">Descripción</span>
                                <span className="cas2-sidebar-desc-val">{meta.eyebrow} · {meta.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── PANEL PRINCIPAL ── */}
                    <div className="cas2-panel-main">
                        <div className="cas2-panel-toolbar">
                            <div className="cas2-toolbar-search">
                                <Search size={13} className="cas2-toolbar-search-icon" />
                                <input
                                    type="text"
                                    className="cas2-toolbar-search-input"
                                    placeholder="Buscar carta..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>

                        <div className="cas2-panel-scroll">
                            <div className="cas2-page-indicator">
                                <div className="cas2-page-indicator-line" />
                                <span>Página {String(safePagenr + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
                                <div className="cas2-page-indicator-line" />
                            </div>

                            <div className="cas2-sticker-grid">
                                {pageItems.map(({ idx, item }) => (
                                    <CultStickerCard
                                        key={idx}
                                        index={idx}
                                        item={item}
                                        meta={meta}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="cas2-modal-footer">
                    <div className="cas2-footer-stat">
                        <span className="cas2-footer-stat-label">Colectadas</span>
                        <span className="cas2-footer-stat-val">{owned.length}</span>
                    </div>
                    <div className="cas2-footer-stat">
                        <span className="cas2-footer-stat-label">Total</span>
                        <span className="cas2-footer-stat-val">{total || '?'}</span>
                    </div>

                    <div className="cas2-footer-pagination">
                        <button
                            className="cas2-page-btn"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={safePagenr === 0}
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <div className="cas2-pagination-info">
                            PAGE <strong>{String(safePagenr + 1).padStart(2, '0')}</strong> / {String(totalPages).padStart(2, '0')}
                        </div>
                        <button
                            className="cas2-page-btn"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={safePagenr === totalPages - 1}
                            aria-label="Página siguiente"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>

                    <div className="cas2-footer-spacer" />
                    <button className="cas2-footer-close-btn" onClick={onClose}>Cerrar Álbum</button>
                    <button className="cas2-footer-arrow-btn" onClick={onClose}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

// ══════════════════════════════════════════════════════════════
//  BOOK CARD — mismo molde que las2-book
// ══════════════════════════════════════════════════════════════
function CultBook({ defId, meta, collection, allCards }) {
    const [panelOpen, setPanelOpen] = useState(false);

    const owned = collection.filter(item => item.card?.card_type === meta.cardType);
    const total = allCards.filter(c => c.card_type === meta.cardType).length;
    const pct = total > 0 ? Math.min(100, Math.round((owned.length / total) * 100)) : 0;
    const isCompleted = total > 0 && owned.length >= total;

    return (
        <>
            <div className="cas2-book-wrap">
                {/* Páginas apiladas detrás */}
                <div className="cas2-page-stack">
                    {[2, 1, 0].map(i => (
                        <div key={i} className="cas2-page-leaf" style={{ '--li': i, '--acc': meta.color }} />
                    ))}
                </div>

                <button
                    className={`cas2-book${isCompleted ? ' cas2-book--done' : ''}`}
                    style={{
                        '--spine': meta.color,
                        '--spine-alt': meta.colorAlt,
                        '--acc': meta.color,
                        '--acc-rgb': meta.colorRgb,
                        '--cover-bg': meta.coverBg,
                    }}
                    onClick={() => setPanelOpen(true)}
                >
                    {/* Lomo */}
                    <div className="cas2-spine">
                        <span className="cas2-spine-num">{meta.number}</span>
                        <span className="cas2-spine-label">{meta.shortLabel}</span>
                        <div className="cas2-spine-lines">
                            {[0, 1, 2].map(i => <div key={i} className="cas2-spine-line" />)}
                        </div>
                    </div>

                    {/* Portada */}
                    <div className="cas2-cover">
                        <div className="cas2-cover-art">
                            <CultCoverIllustration defId={defId} color={meta.color} colorRgb={meta.colorRgb} />
                        </div>

                        {/* Hebilla */}
                        <div className="cas2-clasp">
                            <div className="cas2-clasp-strap cas2-clasp-strap--top" />
                            <div className="cas2-clasp-buckle"><div className="cas2-clasp-buckle-inner" /></div>
                            <div className="cas2-clasp-strap cas2-clasp-strap--bot" />
                        </div>

                        {/* Cantoneras */}
                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                            <div key={pos} className={`cas2-corner cas2-corner--${pos}`} />
                        ))}

                        <div className="cas2-cover-tag">{meta.tag}</div>
                        <div className="cas2-cover-id">ID: CLT-{meta.number}</div>

                        {/* Ícono central */}
                        <div className="cas2-cover-title-block">
                        </div>

                        {/* Rarity badge */}
                        <div className="cas2-rarity">
                            <div className="cas2-rarity-stars">
                                {Array.from({ length: meta.rarityLevel }, (_, i) => <span key={i}>★</span>)}
                            </div>
                            <span className="cas2-rarity-label">{meta.rarityLabel}</span>
                        </div>

                        {/* Footer del libro */}
                        <div className="cas2-cover-footer">
                            <div className="cas2-cover-footer-info">
                                <span className="cas2-cover-count">{owned.length} / {total || '?'} CARTAS</span>
                                {isCompleted && <span className="cas2-done-tick">✓</span>}
                            </div>
                            <div className="cas2-mini-bar">
                                <div className="cas2-mini-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="cas2-cover-hint">Abrir álbum →</span>
                        </div>
                    </div>
                </button>
            </div>

            {panelOpen && (
                <CultPanel
                    defId={defId}
                    meta={meta}
                    collection={collection}
                    allCards={allCards}
                    onClose={() => setPanelOpen(false)}
                />
            )}
        </>
    );
}

// ══════════════════════════════════════════════════════════════
//  EXPORT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function CultAlbumsSection({ definitions, collection, allCards }) {
    const cultDefs = definitions.filter(d => d.album_type === 'cult');

    const categories = CULT_ORDER.map(id => {
        const def = cultDefs.find(d => d.id === id);
        return { id, def };
    }).filter(({ id }) => CULT_META[id]);

    const extras = cultDefs.filter(d => !CULT_ORDER.includes(d.id));

    return (
        <div className="cas2-root">
            <div className="cas2-eyebrow">
                <span>Álbum de Culto · Categorías Especiales</span>
                <div className="cas2-eyebrow-line" />
                <span className="cas2-eyebrow-count">{categories.length + extras.length} álbumes</span>
            </div>

            <div className="cas2-row">
                {categories.map(({ id }) => (
                    <CultBook
                        key={id}
                        defId={id}
                        meta={CULT_META[id]}
                        collection={collection}
                        allCards={allCards}
                    />
                ))}

                {extras.map(def => {
                    const extraMeta = {
                        label: def.name ?? def.id,
                        shortLabel: (def.name ?? def.id).slice(0, 6).toUpperCase(),
                        eyebrow: 'Álbum de Culto',
                        typeTag: 'CARTA',
                        color: '#5b4fd8',
                        colorAlt: '#3d34a5',
                        colorRgb: '91,79,216',
                        coverBg: '#0f0d1a',
                        pageNum: '00',
                        cardType: def.required_card_type ?? 'team',
                        icon: '📒',
                        number: '??',
                        tag: 'CULTO',
                        rarityLabel: 'ESPECIAL',
                        rarityLevel: 2,
                    };
                    return (
                        <CultBook
                            key={def.id}
                            defId={def.id}
                            meta={extraMeta}
                            collection={collection}
                            allCards={allCards}
                        />
                    );
                })}
            </div>
        </div>
    );
}