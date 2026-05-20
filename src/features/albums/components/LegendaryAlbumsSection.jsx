import React, { useState, useCallback } from 'react';
import { Lock, BookOpen, Trophy, Star, ChevronLeft, ChevronRight, Gift, Crown, X, User, Search } from 'lucide-react';
import '../styles/LegendaryAlbumsSection.css';
import '../styles/mobile/LegendaryAlbumsSection.mobile.css';

// ── Orden progresivo LEG I → LEG V ───────────────
const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'legendary_4', 'legendary_5'];
const LEG_SLOT_REQS = {
    legendary_1: {
        slots: 30,
        req: [{ minStars: 4, count: 5 }],
    },
    legendary_2: {
        slots: 30,
        req: [
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
        ],
    },
    legendary_3: {
        slots: 30,
        req: [
            { minStars: 2, count: 5 },
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
        ],
    },
    legendary_4: {
        slots: 30,
        req: [
            { minStars: 2, count: 5 },
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
            { minStars: 5, count: 1 },
        ],
    },
    legendary_5: {
        slots: 30,
        req: [
            { minStars: 2, count: 5 },
            { minStars: 3, count: 5 },
            { minStars: 4, count: 5 },
            { minStars: 5, count: 5 },
        ],
    },
};

const ALBUM_META = {
    legendary_1: {
        label: 'Foundations',
        shortLabel: 'LEG I',
        subtitle: 'FOUNDATIONS',
        req: '30 jugadores · mín. 5×⭐⭐⭐⭐',
        spine: '#5b4fd8',
        spineAlt: '#3d34a5',
        accent: '#a599d9',
        accentRgb: '165,153,217',
        tag: 'TEMPORADA 25·26',
        number: '01',
        coverBg: '#1a1726',
        coverPattern: 'diagonal',
        rarityLevel: 3,
        rarityLabel: 'FUNDACIÓN',
    },
    legendary_2: {
        label: 'Rising Legends',
        shortLabel: 'LEG II',
        subtitle: 'RISING LEGENDS',
        req: '30 jugadores · 5×⭐⭐⭐ + 5×⭐⭐⭐⭐',
        spine: '#7c3aed',
        spineAlt: '#5b1fbd',
        accent: '#c4b5fd',
        accentRgb: '196,181,253',
        tag: 'TEMPORADA 25·26',
        number: '02',
        coverBg: '#160e2a',
        coverPattern: 'hex',
        rarityLevel: 4,
        rarityLabel: 'LEYENDA+',
    },
    legendary_3: {
        label: 'Historical Depth',
        shortLabel: 'LEG III',
        subtitle: 'HISTORICAL DEPTH',
        req: '30 jugadores · 5×⭐⭐ + 5×⭐⭐⭐ + 5×⭐⭐⭐⭐',
        spine: '#1D9E75',
        spineAlt: '#0d6e50',
        accent: '#34d399',
        accentRgb: '52,211,153',
        tag: 'TEMPORADA 25·26',
        number: '03',
        coverBg: '#0a1f18',
        coverPattern: 'radial',
        rarityLevel: 5,
        rarityLabel: 'ÉLITE',
    },
    legendary_4: {
        label: 'Elite Construction',
        shortLabel: 'LEG IV',
        subtitle: 'ELITE CONSTRUCTION',
        req: '30 jugadores · 5×⭐⭐ + 5×⭐⭐⭐ + 5×⭐⭐⭐⭐ + 1×⭐⭐⭐⭐⭐',
        spine: '#b45309',
        spineAlt: '#7c3b00',
        accent: '#f59e0b',
        accentRgb: '245,158,11',
        tag: 'TEMPORADA 25·26',
        number: '04',
        coverBg: '#1a1200',
        coverPattern: 'spiral',
        rarityLevel: 5,
        rarityLabel: 'GOAT',
    },
    legendary_5: {
        label: 'The Immortals',
        shortLabel: 'LEG V',
        subtitle: 'THE IMMORTALS',
        req: '30 jugadores · 5×⭐⭐ + 5×⭐⭐⭐ + 5×⭐⭐⭐⭐ + 5×⭐⭐⭐⭐⭐',
        spine: '#9d174d',
        spineAlt: '#6b1130',
        accent: '#f472b6',
        accentRgb: '244,114,182',
        tag: 'ENDGAME',
        number: '05',
        coverBg: '#1a0e15',
        coverPattern: 'immortal',
        rarityLevel: 5,
        rarityLabel: 'INMORTAL',
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

function buildSlotLayout(albumId, collection, prevUsedIds = new Set()) {
    const slotDef = LEG_SLOT_REQS[albumId];
    if (!slotDef) return { reqZones: [], generalSlots: [], filled: 0, pct: 0, usedIds: new Set() };

    const playerCol = collection.filter(
        (c) => c.card?.card_type === 'player' && !prevUsedIds.has(c.card_id ?? c.id)
    );

    const sorted = [...playerCol].sort(
        (a, b) => (b.card?.significance_level ?? 0) - (a.card?.significance_level ?? 0)
    );

    const assignedIds = new Set();
    const reqZones = [];

    const reqsSorted = [...slotDef.req].sort((a, b) => b.minStars - a.minStars);

    for (const { minStars, count } of reqsSorted) {
        const candidates = sorted.filter(
            (c) =>
                (c.card?.significance_level ?? 0) >= minStars &&
                !assignedIds.has(c.card_id ?? c.id)
        );

        const slots = Array.from({ length: count }, (_, i) => {
            const item = candidates[i] ?? null;
            if (item) assignedIds.add(item.card_id ?? item.id);
            return {
                slotType: minStars === 5 ? 'req5' : minStars === 4 ? 'req4' : minStars === 3 ? 'req3' : 'req2',
                item,
                reqLabel: '⭐'.repeat(minStars),
                minStars,
            };
        });

        reqZones.push({ minStars, slots });
    }

    const reqTotal = slotDef.req.reduce((s, r) => s + r.count, 0);
    const generalSlotCount = slotDef.slots - reqTotal;
    const generalPool = sorted.filter((c) => !assignedIds.has(c.card_id ?? c.id));

    const generalSlots = Array.from({ length: generalSlotCount }, (_, i) => {
        const item = generalPool[i] ?? null;
        if (item) assignedIds.add(item.card_id ?? item.id);
        return { slotType: 'general', item, reqLabel: null, minStars: null };
    });

    const filledReq = reqZones.reduce((sum, z) => sum + z.slots.filter(s => s.item).length, 0);
    const filledGen = generalSlots.filter(s => s.item).length;
    const filled = filledReq + filledGen;
    const pct = slotDef.slots > 0 ? Math.min(100, Math.round((filled / slotDef.slots) * 100)) : 0;

    const reqMet = reqZones.map(z => ({
        minStars: z.minStars,
        required: z.slots.length,
        filled: z.slots.filter(s => s.item).length,
    }));

    return { reqZones, generalSlots, filled, pct, usedIds: assignedIds, reqMet };
}

function computeAllUsedIds(collection) {
    const allUsed = {};
    const globalUsed = new Set();

    for (const albumId of ORDER) {
        const { usedIds } = buildSlotLayout(albumId, collection, globalUsed);
        allUsed[albumId] = globalUsed.size;
        usedIds.forEach(id => globalUsed.add(id));
        allUsed[albumId] = new Set(usedIds);
    }

    return allUsed;
}

/* ══════════════════════════════════════════
   COVER ILLUSTRATIONS
══════════════════════════════════════════ */
function BookCoverIllustration({ albumId, accent, accentRgb, locked }) {
    const id = `cover-${albumId}`;

    if (albumId === 'legendary_1') {
        return (
            <svg viewBox="0 0 120 160" className="las2-cover-svg" aria-hidden="true">
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
                <g stroke={accent} strokeWidth="0.7" opacity="0.45" fill="none">
                    <polyline points="8,8 8,22 22,22" />
                    <polyline points="112,8 112,22 98,22" />
                    <polyline points="8,152 8,138 22,138" />
                    <polyline points="112,152 112,138 98,138" />
                </g>
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
            <svg viewBox="0 0 120 160" className="las2-cover-svg" aria-hidden="true">
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
                <g fill={accent} opacity="0.35">
                    {[[10, 10], [110, 10], [10, 150], [110, 150]].map(([x, y], i) => (
                        <polygon key={i} points={`${x},${y - 5} ${x + 4},${y} ${x},${y + 5} ${x - 4},${y}`} />
                    ))}
                </g>
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
            <svg viewBox="0 0 120 160" className="las2-cover-svg" aria-hidden="true">
                <defs>
                    <radialGradient id={`${id}-center`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-center)`} />
                {[50, 40, 30, 20, 12].map((r, i) => (
                    <circle key={i} cx="60" cy="80" r={r}
                        fill="none" stroke={accent} strokeWidth="0.7"
                        opacity={0.08 + i * 0.06} />
                ))}
                {Array.from({ length: 16 }, (_, i) => {
                    const a = (i / 16) * Math.PI * 2;
                    return (
                        <line key={i}
                            x1={60 + 14 * Math.cos(a)} y1={80 + 14 * Math.sin(a)}
                            x2={60 + 52 * Math.cos(a)} y2={80 + 52 * Math.sin(a)}
                            stroke={accent} strokeWidth="0.4" opacity="0.14" />
                    );
                })}
                <g stroke={accent} strokeWidth="0.6" opacity="0.4">
                    <line x1="6" y1="12" x2="20" y2="12" /><line x1="6" y1="12" x2="6" y2="26" />
                    <line x1="114" y1="12" x2="100" y2="12" /><line x1="114" y1="12" x2="114" y2="26" />
                    <line x1="6" y1="148" x2="20" y2="148" /><line x1="6" y1="148" x2="6" y2="134" />
                    <line x1="114" y1="148" x2="100" y2="148" /><line x1="114" y1="148" x2="114" y2="134" />
                </g>
                {!locked && (
                    <g transform="translate(60,80)">
                        <circle cx="0" cy="0" r="13" fill={accent} fillOpacity="0.08" />
                        <path d="M7,-20 L-5,-2 L4,-2 L-7,20 L5,2 L-4,2 Z" fill={accent} opacity="0.9" />
                    </g>
                )}
            </svg>
        );
    }

    if (albumId === 'legendary_4') {
        return (
            <svg viewBox="0 0 120 160" className="las2-cover-svg" aria-hidden="true">
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
                <rect x="7" y="7" width="106" height="146" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
                <rect x="11" y="11" width="98" height="138" fill="none" stroke={accent} strokeWidth="0.3" opacity="0.2" />
                <g fill={accent} opacity="0.6">
                    {[[7, 7], [113, 7], [7, 153], [113, 153]].map(([x, y], i) => (
                        <polygon key={i} points={`${x},${y - 6} ${x + 5},${y} ${x},${y + 6} ${x - 5},${y}`} />
                    ))}
                </g>
                {!locked && (
                    <>
                        <path d="M60,80 Q68,62 76,72 Q86,88 70,98 Q50,110 40,88 Q30,62 56,50 Q84,38 94,72 Q102,104 74,118"
                            fill="none" stroke={accent} strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
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

    return (
        <svg viewBox="0 0 120 160" className="las2-cover-svg" aria-hidden="true">
            <defs>
                <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
                <radialGradient id={`${id}-outer`} cx="50%" cy="50%" r="80%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                </radialGradient>
            </defs>
            <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-core)`} />
            {/* Concentric rings */}
            {[56, 44, 32, 22, 14].map((r, i) => (
                <circle key={i} cx="60" cy="80" r={r}
                    fill="none" stroke={accent} strokeWidth={i === 0 ? 0.5 : 0.4}
                    opacity={0.06 + i * 0.07}
                    strokeDasharray={i % 2 === 0 ? "4 3" : "none"} />
            ))}
            {/* 5 stars pattern */}
            {Array.from({ length: 5 }, (_, i) => {
                const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const cx = 60 + 30 * Math.cos(a);
                const cy = 80 + 30 * Math.sin(a);
                return (
                    <g key={i} transform={`translate(${cx},${cy})`}>
                        <path d="M0,-5 L1.5,-1.5 L5,-1.5 L2.5,1 L3.5,4.5 L0,2.5 L-3.5,4.5 L-2.5,1 L-5,-1.5 L-1.5,-1.5 Z"
                            fill={accent} opacity="0.4" />
                    </g>
                );
            })}
            {/* Center crown */}
            {!locked && (
                <g transform="translate(60,80)">
                    <circle cx="0" cy="0" r="11" fill={accent} fillOpacity="0.06" />
                    <path d="M-10,5 L-10,-5 L-5,0 L0,-10 L5,0 L10,-5 L10,5 Z"
                        fill="none" stroke={accent} strokeWidth="1.3" strokeLinejoin="round" opacity="0.95" />
                    <rect x="-10" y="5" width="20" height="3" rx="1.5" fill={accent} opacity="0.5" />
                    {/* 5 dots on crown */}
                    {[-8, -4, 0, 4, 8].map((x, i) => (
                        <circle key={i} cx={x} cy="-1" r="1" fill={accent} opacity="0.7" />
                    ))}
                </g>
            )}
            <rect x="0" y="0" width="120" height="160" fill={`url(#${id}-outer)`} />
            {/* Corner ornaments */}
            <g stroke={accent} strokeWidth="0.6" opacity="0.35" fill="none">
                <polyline points="6,8 6,20 18,20" />
                <polyline points="114,8 114,20 102,20" />
                <polyline points="6,152 6,140 18,140" />
                <polyline points="114,152 114,140 102,140" />
            </g>
        </svg>
    );
}

/* ══════════════════════════════════════════
   STICKER CARD
══════════════════════════════════════════ */
function StickerCard({ index, card, collectionItem, accent, slotType, reqLabel }) {
    const num = String(index + 1).padStart(3, '0');
    const isGoat = card?.significance_level === 5;
    const filled = !!collectionItem;
    const stars = card?.significance_level ?? 0;
    const isReqSlot = slotType !== 'general';

    if (filled) {
        return (
            <div
                className={`las2-sticker las2-sticker--filled${isGoat ? ' las2-sticker--goat' : ''}${isReqSlot ? ' las2-sticker--req' : ''}`}
                style={{ '--acc': accent }}
            >
                <div className="las2-sticker-topband" />
                <div className="las2-sticker-header">
                    <span className="las2-sticker-num">{num}</span>
                    {isGoat && <Crown size={8} className="las2-sticker-crown" />}
                    {collectionItem?.copies > 1 && (
                        <span className="las2-sticker-copies">×{collectionItem.copies}</span>
                    )}
                </div>
                <div className="las2-sticker-avatar-zone">
                    {card?.image_path
                        ? <img src={card.image_path} alt={card.name} className="las2-sticker-img" />
                        : <div className="las2-sticker-avatar">{getInitials(card?.name)}</div>
                    }
                    <svg className="las2-sticker-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                        <defs>
                            <linearGradient id={`sg-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#fff" stopOpacity="0.7" />
                                <stop offset="100%" stopColor={accent} stopOpacity="0.9" />
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="46"
                            fill="none"
                            stroke={`url(#sg-${num})`}
                            strokeWidth="2"
                            strokeDasharray={isGoat ? "none" : "6 3"} />
                    </svg>
                </div>
                <div className="las2-sticker-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`las2-star ${i < stars ? 'las2-star--on' : 'las2-star--off'}`}>★</span>
                    ))}
                </div>
                <div className="las2-sticker-info">
                    <span className="las2-sticker-name">{card?.name}</span>
                    {card?.position && <span className="las2-sticker-pos">{posLabel(card.position)}</span>}
                </div>
                <div className="las2-sticker-foil" />
            </div>
        );
    }

    return (
        <div
            className={`las2-sticker las2-sticker--empty${isReqSlot ? ' las2-sticker--req-empty' : ''}`}
            style={{ '--acc': accent }}
        >
            <div className="las2-sticker-header">
                <span className="las2-sticker-num">{num}</span>
            </div>
            <div className="las2-sticker-avatar-zone las2-sticker-avatar-zone--empty">
                <div className="las2-sticker-silhouette">
                    <svg viewBox="0 0 60 80" fill="currentColor" aria-hidden="true" style={{ width: '55%', opacity: 0.22 }}>
                        <ellipse cx="30" cy="18" rx="12" ry="12" />
                        <path d="M6 80 Q6 44 30 38 Q54 44 54 80Z" />
                    </svg>
                </div>
            </div>
            <div className="las2-sticker-stars">
                {Array.from({ length: isReqSlot ? (slotType === 'req5' ? 5 : slotType === 'req4' ? 4 : slotType === 'req3' ? 3 : 2) : 4 }, (_, i) => (
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
   ZONE HEADER
══════════════════════════════════════════ */
function ZoneHeader({ label, count, filled, accent }) {
    return (
        <div className="las2-zone-header" style={{ '--acc': accent }}>
            <div className="las2-zone-header-line" />
            <div className="las2-zone-header-content">
                <span className="las2-zone-header-label">{label}</span>
                <span className="las2-zone-header-count">{filled}/{count}</span>
            </div>
            <div className="las2-zone-header-line" />
        </div>
    );
}

/* ══════════════════════════════════════════
   ALBUM PANEL
══════════════════════════════════════════ */
function AlbumPanel({ albumId, meta, definitions, progress, collection, prevUsedIds, onClose }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const PER_PAGE = window.innerWidth <= 768 ? 9 : 10;

    const def = definitions.find(d => d.id === albumId);
    const prog = progress.find(p => p.album_id === albumId);
    const isCompleted = prog?.is_completed ?? false;

    const { reqZones, generalSlots, filled, pct, reqMet } =
        buildSlotLayout(albumId, collection, prevUsedIds);

    const slotDef = LEG_SLOT_REQS[albumId] ?? { slots: 30, req: [] };

    const allSlots = [];
    reqZones.forEach(zone => {
        zone.slots.forEach((s, i) => allSlots.push({ ...s, globalIdx: allSlots.length }));
    });
    generalSlots.forEach((s, i) => allSlots.push({ ...s, globalIdx: allSlots.length }));

    const reqBoundaries = [];
    let cursor = 0;
    reqZones.forEach(zone => {
        reqBoundaries.push({ start: cursor, end: cursor + zone.slots.length, minStars: zone.minStars });
        cursor += zone.slots.length;
    });
    const generalStart = cursor;

    const filteredSlots = search.trim()
        ? allSlots.filter(({ item }) =>
            item?.card?.name?.toLowerCase().includes(search.toLowerCase())
        )
        : allSlots;

    const totalPages = Math.max(1, Math.ceil(filteredSlots.length / PER_PAGE));
    const safePagenr = Math.min(page, totalPages - 1);
    const pageItems = filteredSlots.slice(safePagenr * PER_PAGE, (safePagenr + 1) * PER_PAGE);
    const pageStartIdx = safePagenr * PER_PAGE;

    const reqTotal = slotDef.req.reduce((s, r) => s + r.count, 0);
    const filledReq = reqZones.reduce((sum, z) => sum + z.slots.filter(s => s.item).length, 0);

    const albumNum = meta.number;

    return (
        <>
            <div className="las2-overlay" onClick={onClose} />
            <div
                className="las2-panel"
                style={{
                    '--spine': meta.spine,
                    '--acc': meta.accent,
                    '--acc-rgb': meta.accentRgb,
                    '--cover-bg': meta.coverBg,
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="las2-modal-topbar">
                    <div className="las2-modal-topbar-spine" />
                    <span className="las2-modal-topbar-title">{meta.label}</span>
                    <span className="las2-modal-topbar-season">{meta.tag}</span>
                    <button className="las2-panel-close" onClick={onClose} aria-label="Cerrar">
                        <X size={14} />
                    </button>
                </div>

                <div className="las2-panel-body">
                    <div className="las2-panel-sidebar">
                        <div className="las2-panel-sidebar-inner">
                            <span className="las2-sidebar-id">ID: ALB-{albumNum}</span>
                            <h2 className="las2-sidebar-title">{meta.shortLabel}</h2>

                            <div className="las2-sidebar-count">
                                <span className="las2-sidebar-count-big">{filled}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <span className="las2-sidebar-count-sep">/ {slotDef.slots}</span>
                                    <span className="las2-sidebar-count-label">Items</span>
                                </div>
                            </div>

                            <div className="las2-sidebar-divider" />

                            <div className="las2-sidebar-book-img">
                                <div className="las2-sidebar-book-svg-wrap">
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
                                        <BookCoverIllustration albumId={albumId} accent={meta.accent} accentRgb={meta.accentRgb} locked={false} />
                                        <div className="las2-clasp">
                                            <div className="las2-clasp-strap las2-clasp-strap--top" />
                                            <div className="las2-clasp-buckle"><div className="las2-clasp-buckle-inner" /></div>
                                            <div className="las2-clasp-strap las2-clasp-strap--bot" />
                                        </div>
                                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                                            <div key={pos} className={`las2-corner las2-corner--${pos}`} />
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

                            <div className="las2-sidebar-pbar-wrap">
                                <div className="las2-sidebar-pbar-fill" style={{ width: `${pct}%` }} />
                                <span className="las2-sidebar-pbar-pct">{pct}%</span>
                            </div>

                            <div className="las2-sidebar-chips">
                                {reqMet?.map(({ minStars, required, filled: f }) => (
                                    <span key={minStars} className={`las2-chip ${f >= required ? 'las2-chip--ok' : ''}`}>
                                        {'★'.repeat(minStars)} {Math.min(f, required)}/{required}
                                        {minStars === 5 && <Crown size={9} style={{ marginLeft: 2 }} />}
                                    </span>
                                ))}
                                {isCompleted && (
                                    <span className="las2-chip las2-chip--done">✓ Completado</span>
                                )}
                            </div>
                        </div>

                        <div className="las2-sidebar-desc-block">
                            <div className="las2-sidebar-desc-full">
                                <span className="las2-sidebar-desc-label">Descripción</span>
                                <span className="las2-sidebar-desc-val">
                                    {def?.description ?? meta.subtitle}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="las2-panel-main">
                        <div className="las2-panel-toolbar">
                            <div className="las2-toolbar-search">
                                <Search size={13} className="las2-toolbar-search-icon" />
                                <input
                                    type="text"
                                    className="las2-toolbar-search-input"
                                    placeholder="Search items..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                                />
                            </div>
                            <div className="las2-footer-pagination" style={{ border: 'none', height: 'auto', padding: '0 0 0 12px' }}>
                                <button className="las2-page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePagenr === 0} aria-label="Página anterior"><ChevronLeft size={15} /></button>
                                <div className="las2-pagination-info">PAGE <strong>{String(safePagenr + 1).padStart(2, '0')}</strong> / {String(totalPages).padStart(2, '0')}</div>
                                <button className="las2-page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePagenr === totalPages - 1} aria-label="Página siguiente"><ChevronRight size={15} /></button>
                            </div>
                        </div>

                        <div className="las2-panel-scroll">
                            <div className="las2-page-indicator">
                                <div className="las2-page-indicator-line" />
                                <span>Página {String(safePagenr + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
                                <div className="las2-page-indicator-line" />
                            </div>

                            {renderPageWithZones(pageItems, pageStartIdx, reqBoundaries, generalStart, reqZones, generalSlots, meta, search)}
                        </div>
                    </div>
                </div>

                <div className="las2-modal-footer">
                    <div className="las2-footer-stat">
                        <span className="las2-footer-stat-label">Total Items</span>
                        <span className="las2-footer-stat-val">{filled}</span>
                    </div>
                    <div className="las2-footer-stat">
                        <span className="las2-footer-stat-label">Requisitos</span>
                        <span className="las2-footer-stat-val">{filledReq}/{reqTotal}</span>
                    </div>

                    <div className="las2-footer-spacer" />
                    <button className="las2-footer-arrow-btn" onClick={onClose}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════
   ZONE-GROUPED RENDER
══════════════════════════════════════════ */
function renderPageWithZones(pageItems, pageStartIdx, reqBoundaries, generalStart, reqZones, generalSlots, meta, search) {
    if (search.trim()) {
        return (
            <div className="las2-sticker-grid">
                {pageItems.map(({ slotType, item, globalIdx, reqLabel }, i) => (
                    <StickerCard
                        key={globalIdx ?? i}
                        index={globalIdx ?? i}
                        card={item?.card ?? null}
                        collectionItem={item ?? null}
                        accent={meta.accent}
                        slotType={slotType}
                        reqLabel={reqLabel}
                    />
                ))}
            </div>
        );
    }

    const getZone = (absIdx) => {
        for (const b of reqBoundaries) {
            if (absIdx >= b.start && absIdx < b.end) return `req${b.minStars}`;
        }
        return 'general';
    };

    const zones = [];
    let currentZone = null;
    let currentGroup = [];

    pageItems.forEach((slot, i) => {
        const absIdx = pageStartIdx + i;
        const zone = getZone(absIdx);

        if (zone !== currentZone) {
            if (currentGroup.length > 0) zones.push({ zone: currentZone, slots: currentGroup });
            currentZone = zone;
            currentGroup = [];
        }
        currentGroup.push({ ...slot, absIdx });
    });
    if (currentGroup.length > 0) zones.push({ zone: currentZone, slots: currentGroup });

    const zoneLabel = (zone) => {
        if (zone === 'req5') return { label: 'GOAT SLOTS', data: reqZones.find(z => z.minStars === 5) };
        if (zone === 'req4') return { label: 'LEYENDA SLOTS', data: reqZones.find(z => z.minStars === 4) };
        if (zone === 'req3') return { label: 'CULTO SLOTS', data: reqZones.find(z => z.minStars === 3) };
        if (zone === 'req2') return { label: 'HISTORIA SLOTS', data: reqZones.find(z => z.minStars === 2) };
        return { label: 'SLOTS GENERALES', data: null };
    };

    return zones.map(({ zone, slots }) => {
        const { label, data } = zoneLabel(zone);
        const total = data ? data.slots.length : generalSlots.length;
        const filledCount = data
            ? data.slots.filter(s => s.item).length
            : generalSlots.filter(s => s.item).length;

        return (
            <div key={zone} className={`las2-zone-block las2-zone-block--${zone}`}>
                <ZoneHeader label={label} count={total} filled={filledCount} accent={meta.accent} />
                <div className="las2-sticker-grid">
                    {slots.map(({ slotType, item, reqLabel, absIdx }) => (
                        <StickerCard
                            key={absIdx}
                            index={absIdx}
                            card={item?.card ?? null}
                            collectionItem={item ?? null}
                            accent={meta.accent}
                            slotType={slotType}
                            reqLabel={reqLabel}
                        />
                    ))}
                </div>
            </div>
        );
    });
}

/* ══════════════════════════════════════════
   BOOK CARD
══════════════════════════════════════════ */
function AlbumBook({ albumId, meta, definitions, progress, collection, locked, prevUsedIds }) {
    const [panelOpen, setPanelOpen] = useState(false);

    const { filled, pct } = locked
        ? { filled: 0, pct: 0 }
        : buildSlotLayout(albumId, collection, prevUsedIds);

    const slotDef = LEG_SLOT_REQS[albumId] ?? { slots: 30 };
    const isCompleted = progress.find(p => p.album_id === albumId)?.is_completed ?? false;

    const isEndgame = albumId === 'legendary_5';

    return (
        <>
            <div className={`las2-book-wrap ${locked ? 'las2-book-wrap--locked' : ''}`}>
                <div className="las2-page-stack">
                    {[2, 1, 0].map(i => (
                        <div key={i} className="las2-page-leaf" style={{ '--li': i, '--acc': meta.accent }} />
                    ))}
                </div>

                <button
                    className={`las2-book ${isCompleted ? 'las2-book--done' : ''} ${isEndgame ? 'las2-book--endgame' : ''}`}
                    style={{
                        '--spine': meta.spine, '--spine-alt': meta.spineAlt,
                        '--acc': meta.accent, '--acc-rgb': meta.accentRgb, '--cover-bg': meta.coverBg,
                    }}
                    onClick={() => !locked && setPanelOpen(true)}
                    disabled={locked}
                    aria-disabled={locked}
                >
                    <div className="las2-spine">
                        <span className="las2-spine-num">{meta.number}</span>
                        <span className="las2-spine-label">{meta.shortLabel}</span>
                        <div className="las2-spine-lines">
                            {[0, 1, 2].map(i => <div key={i} className="las2-spine-line" />)}
                        </div>
                    </div>

                    <div className="las2-cover">
                        <div className="las2-cover-art">
                            <BookCoverIllustration albumId={albumId} accent={meta.accent} accentRgb={meta.accentRgb} locked={locked} />
                        </div>
                        <div className="las2-clasp">
                            <div className="las2-clasp-strap las2-clasp-strap--top" />
                            <div className="las2-clasp-buckle"><div className="las2-clasp-buckle-inner" /></div>
                            <div className="las2-clasp-strap las2-clasp-strap--bot" />
                        </div>
                        {['tl', 'tr', 'bl', 'br'].map(pos => (
                            <div key={pos} className={`las2-corner las2-corner--${pos}`} />
                        ))}
                        <div className="las2-cover-tag">
                            {locked ? <><Lock size={7} strokeWidth={2.5} /> BLOQUEADO</> : meta.tag}
                        </div>
                        <div className="las2-cover-id">ID: ALB-{meta.number}</div>
                        <div className="las2-cover-title-block">
                            <span className="las2-cover-brand"></span>
                        </div>
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
                        <div className="las2-cover-footer">
                            <div className="las2-cover-footer-info">
                                <span className="las2-cover-count">{filled} / {slotDef.slots} ITEMS</span>
                                {isCompleted && <span className="las2-done-tick">✓</span>}
                            </div>
                            <div className="las2-mini-bar">
                                <div className="las2-mini-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            {!locked && <span className="las2-cover-hint">Abrir álbum →</span>}
                        </div>
                        {!locked && (
                            <div className={`las2-rarity ${isEndgame ? 'las2-rarity--endgame' : ''}`}>
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
                    prevUsedIds={prevUsedIds}
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
    // isUnlocked needs to be computed first so useMemo can use it
    const unlockedSet = React.useMemo(() => {
        const set = new Set();
        for (let i = 0; i < ORDER.length; i++) {
            const albumId = ORDER[i];
            if (i === 0) {
                set.add(albumId);
            } else {
                const prev = progress.find(p => p.album_id === ORDER[i - 1]);
                if (prev?.is_completed) set.add(albumId);
            }
        }
        return set;
    }, [progress]);

    const isUnlocked = useCallback((albumId) => unlockedSet.has(albumId), [unlockedSet]);

    const prevUsedIdsMap = React.useMemo(() => {
        const map = {};
        const globalUsed = new Set();

        for (const albumId of ORDER) {
            if (!unlockedSet.has(albumId)) {
                map[albumId] = new Set(globalUsed);
                continue;
            }

            map[albumId] = new Set(globalUsed);
            const { usedIds } = buildSlotLayout(albumId, collection, globalUsed);
            usedIds.forEach(id => globalUsed.add(id));
        }

        return map;
    }, [collection, unlockedSet]);

    return (
        <div className="las2-root">
            <div className="las2-eyebrow">
                <span>Álbumes Legendarios</span>
                <div className="las2-eyebrow-line" />
                <span className="las2-eyebrow-count">5 álbumes</span>
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
                        prevUsedIds={prevUsedIdsMap[albumId]}
                    />
                ))}
            </div>
        </div>
    );
}