import React, { useState } from 'react';
import { Lock, Star, ChevronLeft, ChevronRight, Gift, Crown } from 'lucide-react';
import '../styles/LegendaryAlbumsSection.css';

const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];

const ALBUM_META = {
    legendary_1: {
        label: 'Legendarios Vol. I',
        shortLabel: 'VOL·I',
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
        shortLabel: 'VOL·II',
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
        shortLabel: 'VOL·III',
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
    const map = { Forward: 'DEL', Midfielder: 'MED', Defender: 'DEF', Goalkeeper: 'POR', 'Play-maker': 'MP', 'All-rounder': 'TOD' };
    return map[pos] || pos?.slice(0, 3).toUpperCase() || '—';
}

/* ══════════════════════════════════════════
   COVER ILLUSTRATIONS — cada álbum único
══════════════════════════════════════════ */

function BookCoverLeatherGold({ locked }) {
    return (
        <svg viewBox="0 0 120 160" className="lbn-cover-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="lg-leather" patternUnits="userSpaceOnUse" width="6" height="6">
                    <circle cx="3" cy="3" r="1.2" fill="#b8832a" opacity="0.12" />
                </pattern>
                <radialGradient id="lg-glow" cx="50%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#d4a030" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#d4a030" stopOpacity="0" />
                </radialGradient>
                <filter id="lg-emboss">
                    <feGaussianBlur stdDeviation="0.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <rect width="120" height="160" fill="url(#lg-leather)" />
            <rect width="120" height="160" fill="url(#lg-glow)" />

            {/* Bordura exterior doble */}
            <rect x="6" y="6" width="108" height="148" fill="none" stroke="#c8993a" strokeWidth="0.8" opacity="0.5" />
            <rect x="9" y="9" width="102" height="142" fill="none" stroke="#c8993a" strokeWidth="0.3" opacity="0.3" />

            {/* Ornamentos de esquina */}
            {[[6, 6], [114, 6], [6, 154], [114, 154]].map(([cx, cy], i) => (
                <g key={i} transform={`translate(${cx},${cy})`}>
                    <circle r="2.5" fill="#c8993a" opacity="0.7" />
                    <circle r="5" fill="none" stroke="#c8993a" strokeWidth="0.5" opacity="0.4" />
                    <line x1={i % 2 === 0 ? 3 : -3} y1="0" x2={i % 2 === 0 ? 10 : -10} y2="0" stroke="#c8993a" strokeWidth="0.5" opacity="0.4" />
                    <line x1="0" y1={i < 2 ? 3 : -3} x2="0" y2={i < 2 ? 10 : -10} stroke="#c8993a" strokeWidth="0.5" opacity="0.4" />
                </g>
            ))}

            {!locked && <>
                {/* Escudo central */}
                <g transform="translate(60,68)">
                    <path d="M0,-32 L26,-20 L26,4 Q26,26 0,40 Q-26,26 -26,4 L-26,-20 Z"
                        fill="none" stroke="#c8993a" strokeWidth="1.5" opacity="0.85" />
                    <path d="M0,-24 L18,-14 L18,2 Q18,18 0,28 Q-18,18 -18,2 L-18,-14 Z"
                        fill="#c8993a" opacity="0.08" />
                    {/* Cruz interior del escudo */}
                    <line x1="0" y1="-22" x2="0" y2="26" stroke="#c8993a" strokeWidth="0.7" opacity="0.45" />
                    <line x1="-20" y1="0" x2="20" y2="0" stroke="#c8993a" strokeWidth="0.7" opacity="0.45" />
                    {/* Punto central */}
                    <circle cx="0" cy="0" r="3.5" fill="none" stroke="#c8993a" strokeWidth="0.8" opacity="0.6" />
                    <circle cx="0" cy="0" r="1.2" fill="#c8993a" opacity="0.7" />
                    {/* Estrellas dentro del escudo */}
                    {[[-10, -12], [10, -12]].map(([sx, sy], i) => (
                        <polygon key={i} points={`${sx},${sy - 3} ${sx + 1.2},${sy - 0.5} ${sx + 3.5},${sy - 0.5} ${sx + 1.8},${sy + 1} ${sx + 2.5},${sy + 3.5} ${sx},${sy + 2} ${sx - 2.5},${sy + 3.5} ${sx - 1.8},${sy + 1} ${sx - 3.5},${sy - 0.5} ${sx - 1.2},${sy - 0.5}`}
                            fill="#c8993a" opacity="0.6" />
                    ))}
                </g>

                {/* Nombre del álbum */}
                <text x="60" y="126" textAnchor="middle" fill="#c8993a" fontSize="7"
                    fontFamily="'Playfair Display', serif" fontWeight="700" letterSpacing="0.18em" opacity="0.75">LEGENDARIOS</text>
                <text x="60" y="136" textAnchor="middle" fill="#c8993a" fontSize="5"
                    fontFamily="'DM Mono', monospace" fontWeight="700" letterSpacing="0.3em" opacity="0.5">VOL. I · 25-26</text>

                {/* Líneas decorativas horizontales */}
                <line x1="18" y1="121" x2="42" y2="121" stroke="#c8993a" strokeWidth="0.4" opacity="0.4" />
                <line x1="78" y1="121" x2="102" y2="121" stroke="#c8993a" strokeWidth="0.4" opacity="0.4" />
            </>}
        </svg>
    );
}

function BookCoverIndigoNight({ locked }) {
    const stars = [[22, 18, 1.3], [75, 14, 0.9], [52, 11, 1.1], [38, 28, 0.8], [85, 32, 1.0], [15, 42, 0.7], [68, 38, 1.1], [92, 52, 0.8], [28, 50, 0.9], [58, 58, 1.3], [12, 65, 0.7], [82, 68, 1.0], [44, 74, 0.85], [95, 80, 0.7], [8, 82, 0.9], [62, 88, 1.1], [30, 92, 0.8], [78, 95, 0.7]];
    return (
        <svg viewBox="0 0 120 160" className="lbn-cover-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="in-nebula" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#3040a0" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#1a0a40" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1a0a40" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="in-nebula2" cx="75%" cy="70%" r="45%">
                    <stop offset="0%" stopColor="#601080" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#601080" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="120" height="160" fill="url(#in-nebula)" />
            <rect width="120" height="160" fill="url(#in-nebula2)" />

            {/* Estrellas */}
            {stars.map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r} fill="#a0b8ff" opacity={0.2 + (i % 4) * 0.08} />
            ))}

            {/* Líneas de constelación */}
            {!locked && <>
                <g opacity="0.35" stroke="#8aa8f0" strokeWidth="0.4">
                    <line x1="52" y1="11" x2="28" y2="50" />
                    <line x1="28" y1="50" x2="44" y2="74" />
                    <line x1="52" y1="11" x2="68" y2="38" />
                    <line x1="68" y1="38" x2="58" y2="58" />
                    <line x1="44" y1="74" x2="58" y2="58" />
                    <line x1="58" y1="58" x2="62" y2="88" />
                </g>

                {/* Corona central */}
                <g transform="translate(60,58)" filter="url(#in-blur)">
                    <path d="M-16,10 L-16,-6 L-8,4 L0,-14 L8,4 L16,-6 L16,10 Z"
                        fill="none" stroke="#8aa8f0" strokeWidth="1.2" strokeLinejoin="round" opacity="0.9" />
                    <rect x="-16" y="10" width="32" height="4" rx="1.5"
                        fill="#8aa8f0" opacity="0.2" stroke="#8aa8f0" strokeWidth="0.5" />
                    {/* Gemas en la corona */}
                    {[[-16, -6], [0, -14], [16, -6]].map(([px, py], i) => (
                        <circle key={i} cx={px} cy={py} r="2" fill="#8aa8f0" opacity="0.7" />
                    ))}
                    <circle cx="0" cy="2" r="4" fill="none" stroke="#8aa8f0" strokeWidth="0.5" opacity="0.4" />
                </g>

                {/* Marco */}
                <rect x="10" y="10" width="100" height="140" fill="none" stroke="#8aa8f0" strokeWidth="0.5" opacity="0.2" />

                <text x="60" y="128" textAnchor="middle" fill="#8aa8f0" fontSize="6.5"
                    fontFamily="'Playfair Display', serif" fontWeight="700" letterSpacing="0.14em" opacity="0.7">LEGENDARIOS</text>
                <text x="60" y="138" textAnchor="middle" fill="#8aa8f0" fontSize="4.5"
                    fontFamily="'DM Mono', monospace" fontWeight="700" letterSpacing="0.32em" opacity="0.45">VOL. II · 25-26</text>
                <line x1="20" y1="124" x2="44" y2="124" stroke="#8aa8f0" strokeWidth="0.4" opacity="0.35" />
                <line x1="76" y1="124" x2="100" y2="124" stroke="#8aa8f0" strokeWidth="0.4" opacity="0.35" />
            </>}
        </svg>
    );
}

function BookCoverFieldGreen({ locked }) {
    return (
        <svg viewBox="0 0 120 160" className="lbn-cover-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="fg-grass" patternUnits="userSpaceOnUse" width="8" height="16">
                    <line x1="4" y1="16" x2="2" y2="8" stroke="#3a9e3a" strokeWidth="0.6" opacity="0.25" />
                    <line x1="4" y1="16" x2="6" y2="8" stroke="#3a9e3a" strokeWidth="0.6" opacity="0.25" />
                    <line x1="4" y1="16" x2="4" y2="7" stroke="#3a9e3a" strokeWidth="0.7" opacity="0.3" />
                </pattern>
                <radialGradient id="fg-spotlight" cx="50%" cy="45%" r="50%">
                    <stop offset="0%" stopColor="#4abf4a" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#4abf4a" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="120" height="160" fill="url(#fg-grass)" />
            <rect width="120" height="160" fill="url(#fg-spotlight)" />

            {/* Líneas del campo */}
            {!locked && <>
                {/* Campo de fútbol esquemático */}
                <rect x="18" y="28" width="84" height="104" fill="none" stroke="#4abf4a" strokeWidth="0.7" opacity="0.35" />
                {/* Círculo central */}
                <circle cx="60" cy="80" r="22" fill="none" stroke="#4abf4a" strokeWidth="0.6" opacity="0.3" />
                {/* Punto central */}
                <circle cx="60" cy="80" r="1.5" fill="#4abf4a" opacity="0.5" />
                {/* Medio campo */}
                <line x1="18" y1="80" x2="102" y2="80" stroke="#4abf4a" strokeWidth="0.6" opacity="0.3" />
                {/* Áreas */}
                <rect x="36" y="28" width="48" height="20" fill="none" stroke="#4abf4a" strokeWidth="0.5" opacity="0.28" />
                <rect x="36" y="112" width="48" height="20" fill="none" stroke="#4abf4a" strokeWidth="0.5" opacity="0.28" />
                {/* Área pequeña */}
                <rect x="46" y="28" width="28" height="10" fill="none" stroke="#4abf4a" strokeWidth="0.4" opacity="0.22" />
                <rect x="46" y="122" width="28" height="10" fill="none" stroke="#4abf4a" strokeWidth="0.4" opacity="0.22" />

                {/* Rayo central — símbolo élite */}
                <g transform="translate(60,80)">
                    <path d="M6,-18 L-4,-2 L4,-2 L-6,18 L4,2 L-4,2 Z"
                        fill="#4abf4a" opacity="0.75" />
                    <circle cx="0" cy="0" r="10" fill="#4abf4a" opacity="0.06" />
                </g>

                <text x="60" y="134" textAnchor="middle" fill="#4abf4a" fontSize="6.5"
                    fontFamily="'Playfair Display', serif" fontWeight="700" letterSpacing="0.14em" opacity="0.75">LEGENDARIOS</text>
                <text x="60" y="143" textAnchor="middle" fill="#4abf4a" fontSize="4.5"
                    fontFamily="'DM Mono', monospace" fontWeight="700" letterSpacing="0.3em" opacity="0.5">ÉLITE · 25-26</text>
                <line x1="20" y1="130" x2="42" y2="130" stroke="#4abf4a" strokeWidth="0.4" opacity="0.4" />
                <line x1="78" y1="130" x2="100" y2="130" stroke="#4abf4a" strokeWidth="0.4" opacity="0.4" />
            </>}
        </svg>
    );
}

function BookCoverGolden({ locked }) {
    return (
        <svg viewBox="0 0 120 160" className="lbn-cover-svg lbn-cover-svg--golden" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="go-dots" patternUnits="userSpaceOnUse" width="8" height="8">
                    <circle cx="4" cy="4" r="0.8" fill="#d4a830" opacity="0.2" />
                </pattern>
                <radialGradient id="go-glow" cx="50%" cy="42%" r="55%">
                    <stop offset="0%" stopColor="#e8c050" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#d4a830" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="120" height="160" fill="url(#go-dots)" />
            <rect width="120" height="160" fill="url(#go-glow)" />

            {/* Marco doble ornamental */}
            <rect x="7" y="7" width="106" height="146" fill="none" stroke="#d4a830" strokeWidth="1" opacity="0.55" />
            <rect x="11" y="11" width="98" height="138" fill="none" stroke="#d4a830" strokeWidth="0.4" opacity="0.35" />

            {/* Ornamentos esquinas elaborados */}
            {[[7, 7, 0], [113, 7, 1], [7, 153, 2], [113, 153, 3]].map(([cx, cy, q]) => {
                const sx = q % 2 === 0 ? 1 : -1;
                const sy = q < 2 ? 1 : -1;
                return (
                    <g key={q} transform={`translate(${cx},${cy})`}>
                        <circle r="2.5" fill="#d4a830" opacity="0.7" />
                        <line x1={sx * 4} y1="0" x2={sx * 14} y2="0" stroke="#d4a830" strokeWidth="0.6" opacity="0.5" />
                        <line x1="0" y1={sy * 4} x2="0" y2={sy * 14} stroke="#d4a830" strokeWidth="0.6" opacity="0.5" />
                        <line x1={sx * 8} y1={sy * 3} x2={sx * 8} y2={sy * 8} stroke="#d4a830" strokeWidth="0.4" opacity="0.35" />
                        <line x1={sx * 3} y1={sy * 8} x2={sx * 8} y2={sy * 8} stroke="#d4a830" strokeWidth="0.4" opacity="0.35" />
                    </g>
                );
            })}

            {!locked && <>
                {/* Espiral áurea */}
                <path d="M60,62 Q70,46 78,58 Q88,74 72,84 Q54,96 42,76 Q30,54 52,42 Q78,28 90,62"
                    fill="none" stroke="#d4a830" strokeWidth="0.9" opacity="0.28" strokeLinecap="round" />

                {/* Trofeo */}
                <g transform="translate(60,66)">
                    <path d="M-12,-18 Q-14,5 0,14 Q14,5 12,-18 Z"
                        fill="none" stroke="#d4a830" strokeWidth="1.3" strokeLinejoin="round" opacity="0.95" />
                    {/* Asas del trofeo */}
                    <path d="M-12,-10 Q-20,-10 -20,-4 Q-20,2 -12,2" fill="none" stroke="#d4a830" strokeWidth="1" opacity="0.75" />
                    <path d="M12,-10 Q20,-10 20,-4 Q20,2 12,2" fill="none" stroke="#d4a830" strokeWidth="1" opacity="0.75" />
                    {/* Pie del trofeo */}
                    <line x1="0" y1="14" x2="0" y2="20" stroke="#d4a830" strokeWidth="1.1" opacity="0.85" />
                    <rect x="-9" y="20" width="18" height="3.5" rx="1.5" fill="#d4a830" opacity="0.6" />
                    {/* Estrella central en trofeo */}
                    <polygon points="0,-8 1.8,-3.5 6.5,-3.5 2.8,-0.5 4.2,4.5 0,2.2 -4.2,4.5 -2.8,-0.5 -6.5,-3.5 -1.8,-3.5"
                        fill="#d4a830" opacity="0.75" />
                    {/* Estrellas superiores */}
                    {[[-18, -18], [0, -22], [18, -18]].map(([px, py], i) => (
                        <circle key={i} cx={px} cy={py} r="1.8" fill="#d4a830" opacity={0.5 + i * 0.1} />
                    ))}
                </g>

                <text x="60" y="122" textAnchor="middle" fill="#d4a830" fontSize="7"
                    fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="700" letterSpacing="0.1em" opacity="0.85">Álbum Dorado</text>
                <text x="60" y="132" textAnchor="middle" fill="#d4a830" fontSize="4.5"
                    fontFamily="'DM Mono', monospace" fontWeight="700" letterSpacing="0.32em" opacity="0.5">GOAT · ESPECIAL</text>

                {/* Pequeña decoración bajo el texto */}
                <g transform="translate(60,138)" opacity="0.45">
                    <line x1="-22" y1="0" x2="-8" y2="0" stroke="#d4a830" strokeWidth="0.4" />
                    <circle cx="0" cy="0" r="1.5" fill="#d4a830" />
                    <line x1="8" y1="0" x2="22" y2="0" stroke="#d4a830" strokeWidth="0.4" />
                </g>
            </>}
        </svg>
    );
}

const COVERS = {
    leather_gold: BookCoverLeatherGold,
    indigo_night: BookCoverIndigoNight,
    field_green: BookCoverFieldGreen,
    golden: BookCoverGolden,
};

/* ══════════════════════════════════════════
   FIGURITA PANINI — sticker rectangular
══════════════════════════════════════════ */
function PaniniSticker({ index, collectionItem, card }) {
    const num = String(index + 1).padStart(2, '0');
    const filled = !!collectionItem;
    const isGoat = card?.significance_level === 5;
    const isLegend = card?.significance_level === 4;

    if (!filled) {
        return (
            <div className="lbn-sticker lbn-sticker--empty">
                <div className="lbn-sticker-num-band">
                    <span className="lbn-sticker-num">{num}</span>
                </div>
                <div className="lbn-sticker-img-area">
                    <svg className="lbn-sticker-silhouette" viewBox="0 0 50 70" fill="currentColor">
                        <ellipse cx="25" cy="16" rx="11" ry="11" />
                        <path d="M5 70 Q5 38 25 34 Q45 38 45 70Z" />
                    </svg>
                </div>
                <div className="lbn-sticker-footer-band">
                    <div className="lbn-sticker-shine-lines">
                        <span /><span /><span />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`lbn-sticker lbn-sticker--filled${isGoat ? ' lbn-sticker--goat' : ''}${isLegend ? ' lbn-sticker--legend' : ''}`}>
            {/* Pegatina esquina superior — efecto de colección */}
            <div className="lbn-sticker-corner-fold" />

            <div className="lbn-sticker-num-band">
                <span className="lbn-sticker-num">{num}</span>
                {card?.position && <span className="lbn-sticker-pos">{posLabel(card.position)}</span>}
                {isGoat && <span className="lbn-sticker-crown-icon"><Crown size={7} /></span>}
            </div>

            <div className="lbn-sticker-img-area">
                {card?.image_path
                    ? <img src={card.image_path} alt={card.name} className="lbn-sticker-photo" />
                    : <div className="lbn-sticker-initials">{getInitials(card?.name)}</div>
                }
                {isGoat && <div className="lbn-sticker-goat-halo" />}
            </div>

            <div className="lbn-sticker-footer-band">
                <span className="lbn-sticker-name">{card?.name}</span>
                {card?.significance_level && (
                    <div className="lbn-sticker-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`lbn-sstar${i < card.significance_level ? ' lbn-sstar--lit' : ''}`}>★</span>
                        ))}
                    </div>
                )}
            </div>

            {collectionItem?.copies > 1 && (
                <span className="lbn-sticker-copies">×{collectionItem.copies}</span>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════
   OPEN BOOK MODAL — álbum Panini
══════════════════════════════════════════ */
function OpenBook({ albumId, meta, definitions, progress, collection, onClose }) {
    const [page, setPage] = useState(0);
    const PER_PAGE = 8; // 4 left + 4 right

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

    const pageStart = page * PER_PAGE;
    const leftSlots = Array.from({ length: 4 }, (_, i) => {
        const gi = pageStart + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: qualifiedPlayers[gi] ?? null };
    }).filter(Boolean);
    const rightSlots = Array.from({ length: 4 }, (_, i) => {
        const gi = pageStart + 4 + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: qualifiedPlayers[gi] ?? null };
    }).filter(Boolean);

    return (
        <>
            <div className="lbn-overlay" onClick={onClose} />
            <div className={`lbn-album-modal lbn-album-modal--${meta.theme}`}>

                {/* ── Cabecera del álbum ── */}
                <div className="lbn-modal-header">
                    <div className="lbn-modal-header-spine" />
                    <div className="lbn-modal-header-body">
                        <div className="lbn-modal-header-left">
                            <span className="lbn-modal-season">{meta.tag}</span>
                            <span className="lbn-modal-title">{meta.label}</span>
                        </div>
                        <div className="lbn-modal-header-right">
                            <div className="lbn-modal-progress-pill">
                                <div className="lbn-modal-progress-fill" style={{ width: `${pct}%` }} />
                                <span className="lbn-modal-progress-text">{filled}/{reqPlayers}</span>
                            </div>
                            <button className="lbn-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
                        </div>
                    </div>
                </div>

                {/* ── Doble página ── */}
                <div className="lbn-album-spread">

                    {/* PÁGINA IZQUIERDA */}
                    <div className="lbn-album-page lbn-album-page--left">
                        <div className="lbn-page-header-strip">
                            <span className="lbn-page-label">{meta.tag}</span>
                            <span className="lbn-page-num-label">PÁG. {String(page * 2 + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="lbn-page-rule" />
                        <div className="lbn-stickers-grid">
                            {leftSlots.map(({ idx, item }) => (
                                <PaniniSticker key={idx} index={idx} collectionItem={item} card={item?.card ?? null} />
                            ))}
                            {Array.from({ length: 4 - leftSlots.length }).map((_, i) => (
                                <PaniniSticker key={`e-l-${i}`} index={pageStart + leftSlots.length + i} collectionItem={null} card={null} />
                            ))}
                        </div>
                        <div className="lbn-page-footer-strip">
                            <div className="lbn-pf-bar">
                                <div className="lbn-pf-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="lbn-pf-count">{filled}/{reqPlayers}</span>
                        </div>
                    </div>

                    {/* LOMO CENTRAL */}
                    <div className="lbn-album-gutter">
                        <div className="lbn-gutter-inner" />
                    </div>

                    {/* PÁGINA DERECHA */}
                    <div className="lbn-album-page lbn-album-page--right">
                        <div className="lbn-page-header-strip">
                            <span className="lbn-page-label">Colección · Jugadores</span>
                            <span className="lbn-page-num-label">PÁG. {String(page * 2 + 2).padStart(2, '0')}</span>
                        </div>
                        <div className="lbn-page-rule" />
                        <div className="lbn-stickers-grid">
                            {rightSlots.map(({ idx, item }) => (
                                <PaniniSticker key={idx} index={idx} collectionItem={item} card={item?.card ?? null} />
                            ))}
                            {Array.from({ length: 4 - rightSlots.length }).map((_, i) => (
                                <PaniniSticker key={`e-r-${i}`} index={pageStart + 4 + rightSlots.length + i} collectionItem={null} card={null} />
                            ))}
                        </div>

                        {/* Chips de requisitos */}
                        <div className="lbn-req-chips">
                            <span className={`lbn-req-chip${stars4Count >= reqStars4 ? ' lbn-req-chip--met' : ''}`}>
                                <Star size={9} /><Star size={9} /><Star size={9} /><Star size={9} />&nbsp;{Math.min(stars4Count, reqStars4)}/{reqStars4}
                            </span>
                            {reqStars5 > 0 && (
                                <span className={`lbn-req-chip${stars5Count >= reqStars5 ? ' lbn-req-chip--met' : ''}`}>
                                    <Crown size={9} />&nbsp;{Math.min(stars5Count, reqStars5)}/{reqStars5}
                                </span>
                            )}
                            {isCompleted && <span className="lbn-req-chip lbn-req-chip--done">✓ Completado</span>}
                        </div>

                        {/* Paginación */}
                        <div className="lbn-pagination">
                            <button className="lbn-pg-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                                <ChevronLeft size={14} />
                            </button>
                            <div className="lbn-pg-dots">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button key={i} className={`lbn-pg-dot${i === page ? ' lbn-pg-dot--active' : ''}`} onClick={() => setPage(i)} />
                                ))}
                            </div>
                            <button className="lbn-pg-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
                                <ChevronRight size={14} />
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
        </>
    );
}

/* ══════════════════════════════════════════
   LIBRO EN ESTANTERÍA
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

    const themeKey = meta.theme.replace('-', '_');
    const CoverSVG = COVERS[themeKey];

    return (
        <>
            <div
                className={`lbn-wrapper${locked ? ' lbn-wrapper--locked' : ''}${hovered ? ' lbn-wrapper--hovered' : ''}`}
                onMouseEnter={() => !locked && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Páginas visibles desde el lado */}
                <div className="lbn-pages-stack" />

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
                    {/* Lomo */}
                    <div className="lbn-spine">
                        <span className="lbn-spine-roman">{meta.number}</span>
                        <span className="lbn-spine-text">{meta.shortLabel}</span>
                    </div>

                    {/* Tapa */}
                    <div className="lbn-cover">
                        {/* Ilustración SVG */}
                        <div className="lbn-cover-art-wrap">
                            {CoverSVG && <CoverSVG locked={locked} />}
                        </div>

                        {/* Tag temporada arriba izquierda */}
                        {!locked && (
                            <div className="lbn-cover-season-tag">{meta.tag}</div>
                        )}

                        {/* Lock overlay */}
                        {locked && (
                            <div className="lbn-locked-overlay">
                                <div className="lbn-locked-fog" />
                                <div className="lbn-locked-content">
                                    <Lock size={20} strokeWidth={1.6} />
                                    <div className="lbn-locked-ring" />
                                </div>
                                <span className="lbn-locked-text">Completa el álbum anterior</span>
                            </div>
                        )}

                        {/* Barra de progreso y conteo */}
                        <div className="lbn-cover-footer">
                            <div className="lbn-cover-progress-track">
                                <div className="lbn-cover-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="lbn-cover-footer-row">
                                <span className="lbn-cover-count">{filled}/{reqPlayers}</span>
                                {isCompleted && <span className="lbn-cover-done">✓</span>}
                                {!locked && !isCompleted && <span className="lbn-cover-hint">abrir →</span>}
                            </div>
                        </div>
                    </div>
                </button>

                {/* Etiqueta hover debajo */}
                <div className="lbn-hover-label">
                    <span className="lbn-hl-title">{meta.label}</span>
                    <span className="lbn-hl-req">{meta.req}</span>
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
   EXPORT PRINCIPAL
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