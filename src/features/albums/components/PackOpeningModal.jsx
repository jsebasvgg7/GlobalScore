import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getHistoricalImageUrl } from '@/features/history/services/history.service';
import '../styles/PackOpeningModal.css';
import '../styles/mobile/PackOpeningModal.mobile.css';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const TYPE_LABEL = {
    player: 'Jugador',
    team: 'Equipo',
    competition: 'Copa',
    event: 'Evento',
};

const TYPE_COLOR = {
    player: '#7C6FFF',
    team: '#10B981',
    competition: '#F59E0B',
    event: '#F43F5E',
};

const TYPE_COLOR_RGB = {
    player: '124,111,255',
    team: '16,185,129',
    competition: '245,158,11',
    event: '244,63,94',
};

const CARD_ORDER = ['player', 'team', 'competition', 'event'];

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function posLabel(pos) {
    const map = {
        Forward: 'DEL', Midfielder: 'MED', Defender: 'DEF',
        Goalkeeper: 'POR', 'Play-maker': 'MP', 'All-rounder': 'TOD',
    };
    return map[pos] || pos?.slice(0, 3).toUpperCase() || '—';
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function GoatParticles() {
    const particles = React.useMemo(() =>
        Array.from({ length: 18 }, (_, i) => ({
            angle: `${(i / 18) * 360}deg`,
            delay: `${(i % 6) * 0.07}s`,
            dist: `${55 + (i * 37 % 55)}px`,
            size: `${2 + (i % 3)}px`,
            color: i % 2 === 0 ? '#f59e0b' : '#fcd34d',
        })),
        []);

    return (
        <div className="pom2-particles" aria-hidden="true">
            {particles.map((p, i) => (
                <div key={i} className="pom2-particle" style={{
                    '--angle': p.angle,
                    '--delay': p.delay,
                    '--dist': p.dist,
                    '--size': p.size,
                    '--color': p.color,
                }} />
            ))}
        </div>
    );
}

function CardBack() {
    return (
        <div className="pom2-card-back">
            <div className="pom2-card-back-grid" aria-hidden="true" />
            <div className="pom2-card-back-logo" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4L6 12V24C6 33 14 41 24 44C34 41 42 33 42 24V12L24 4Z"
                        stroke="currentColor" strokeWidth="1.5" strokeOpacity=".55"
                        fill="none" strokeLinejoin="round" />
                    <text x="24" y="29" textAnchor="middle"
                        fontFamily="'DM Mono', monospace" fontSize="10"
                        fontWeight="700" fill="currentColor" fillOpacity=".5">GA</text>
                </svg>
            </div>
            <span className="pom2-back-corner pom2-back-corner--tl">GA</span>
            <span className="pom2-back-corner pom2-back-corner--br">GA</span>
        </div>
    );
}

function CardFront({ type, card, isGoat, index = 0 }) {
    const color = TYPE_COLOR[type] || '#7C6FFF';
    const colorRgb = TYPE_COLOR_RGB[type] || '124,111,255';
    const isPlayer = type === 'player';
    const stars = isPlayer ? (card?.significance_level ?? 0) : 0;
    const imgUrl = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;
    const label = TYPE_LABEL[type] || type;
    const num = String(index + 1).padStart(3, '0');
    const isGoatCard = isGoat && isPlayer;

    return (
        <div
            className={`pom2-card-front${isGoatCard ? ' pom2-card-front--goat' : ''}`}
            style={{ '--acc': color, '--acc-rgb': colorRgb }}
        >
            <div className="pom2-sticker-topband" />

            <div className="pom2-sticker-header">
                <span className="pom2-sticker-num">{num}</span>
                <span className="pom2-card-type-label">{label}</span>
                {isGoatCard && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" className="pom2-sticker-crown" aria-label="GOAT">
                        <path d="M6 1l1.5 3H11L8.5 6l1 3L6 7.5 2.5 9l1-3L1 4h3.5L6 1z"
                            fill="#f59e0b" />
                    </svg>
                )}
            </div>

            <div className="pom2-sticker-avatar-zone">
                {imgUrl ? (
                    <img src={imgUrl} alt={card?.name || ''} className="pom2-sticker-img" />
                ) : (
                    <div className="pom2-sticker-avatar">{getInitials(card?.name)}</div>
                )}
                <svg className="pom2-sticker-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                    <defs>
                        <linearGradient id={`sg-pom-${num}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#fff" stopOpacity="0.7" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.9" />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="46"
                        fill="none"
                        stroke={`url(#sg-pom-${num})`}
                        strokeWidth="2"
                        strokeDasharray={isGoatCard ? "none" : "6 3"} />
                </svg>
            </div>

            <div className="pom2-sticker-stars">
                {isPlayer ? (
                    Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`pom2-star ${i < stars ? 'pom2-star--on' : 'pom2-star--off'}`}>★</span>
                    ))
                ) : (
                    <span className="pom2-card-rarity-badge">{label}</span>
                )}
            </div>

            <div className="pom2-sticker-info">
                <span className="pom2-sticker-name">{card?.name || '—'}</span>
                {isPlayer && card?.position && (
                    <span className="pom2-sticker-pos">{posLabel(card.position)}</span>
                )}
            </div>

            <div className="pom2-sticker-foil" aria-hidden="true" />
            {isGoatCard && <GoatParticles />}
        </div>
    );
}

function FlipCard({ type, card, index, isDealt, isFlipped, onFlip, isGoat }) {
    const handleKey = useCallback((e) => {
        if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) onFlip();
    }, [isFlipped, onFlip]);

    return (
        <div
            className={[
                'pom2-flip-slot',
                isDealt ? 'pom2-flip-slot--dealt' : '',
                isFlipped ? 'pom2-flip-slot--flipped' : '',
            ].filter(Boolean).join(' ')}
            style={{ '--deal-delay': `${index * 0.09}s` }}
            onClick={!isFlipped ? onFlip : undefined}
            role={!isFlipped ? 'button' : undefined}
            aria-label={!isFlipped ? `Revelar carta ${index + 1}` : TYPE_LABEL[type]}
            tabIndex={!isFlipped ? 0 : undefined}
            onKeyDown={handleKey}
        >
            <div className="pom2-flip-inner">
                <CardBack />
                <CardFront type={type} card={card} isGoat={isGoat} index={index} />
            </div>
            {!isFlipped && (
                <span className="pom2-tap-hint" aria-hidden="true">toca</span>
            )}
        </div>
    );
}

function ConfettiBurst() {
    const pieces = React.useMemo(() =>
        Array.from({ length: 28 }, (_, i) => {
            const colors = ['#7C6FFF', '#F59E0B', '#10B981', '#F43F5E', '#c4bbff', '#fcd34d'];
            return {
                color: colors[i % colors.length],
                angle: `${(i / 28) * 360}deg`,
                dist: `${60 + (i * 23 % 70)}px`,
                size: `${3 + (i % 4)}px`,
                delay: `${(i % 7) * 0.04}s`,
                shape: i % 3 === 0 ? 'rect' : 'circle',
            };
        }), []);

    return (
        <div className="pom2-confetti" aria-hidden="true">
            {pieces.map((p, i) => (
                <div key={i} className={`pom2-confetti-piece pom2-confetti-piece--${p.shape}`} style={{
                    '--angle': p.angle,
                    '--dist': p.dist,
                    '--size': p.size,
                    '--color': p.color,
                    '--delay': p.delay,
                }} />
            ))}
        </div>
    );
}

/* ─── PackDonePanel ─────────────────────────────────────────────────────── */
function PackDonePanel({ cards, packsAvailable, onReset, onClose }) {
    return (
        <div className="pom2-done-panel">
            <div className="pom2-pack-bg-pattern" aria-hidden="true" />
            <ConfettiBurst />

            <div className="pom2-done-badge" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <p className="pom2-done-title">¡Sobre completado!</p>

            <div className="pom2-done-thumbs">
                {cards.map(({ type, card }, i) => {
                    const color = TYPE_COLOR[type] || '#7C6FFF';
                    const label = TYPE_LABEL[type] || type;
                    const initials = card?.name
                        ? card.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                        : label.slice(0, 2).toUpperCase();
                    return (
                        <div key={i} className="pom2-done-thumb" style={{ '--acc': color }}>
                            <span className="pom2-done-thumb-init">{initials}</span>
                            <span className="pom2-done-thumb-type">{label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="pom2-actions">
                {packsAvailable > 1 && (
                    <button className="pom2-btn-again" onClick={onReset}>
                        Abrir otro
                        <span className="pom2-badge">{packsAvailable - 1}</span>
                    </button>
                )}
                <button className="pom2-btn-collection" onClick={onClose}>
                    Ver mi colección
                </button>
            </div>
        </div>
    );
}

/* ─── HoloScanner ───────────────────────────────────────────────────────── */
const OS_LINES_ANIMATING = [
    'INICIANDO APERTURA...',
    'LEYENDO CONTENIDO...',
    'CLASIFICANDO ÍTEMS...',
    'VERIFICANDO RAREZA...',
];

const OS_LINES_REVEALING = [
    'TRANSFERENCIA COMPLETADA ✓',
    'SINCRONIZANDO COLECCIÓN...',
    'ÍTEM REGISTRADO ✓',
];

const SCAN_TYPES = [
    { key: 'player', label: 'JUGADOR', color: '#7C6FFF' },
    { key: 'team', label: 'EQUIPO', color: '#10B981' },
    { key: 'competition', label: 'COPA', color: '#F59E0B' },
    { key: 'event', label: 'EVENTO', color: '#F43F5E' },
];

function HoloScanner({ phase, isGoat, flippedCount, totalCards }) {
    const [osLine, setOsLine] = useState(0);
    const [typesVisible, setTypesVisible] = useState(0);
    const [rarityStep, setRarityStep] = useState(0);

    const isAnimating = phase === 'animating';
    const isRevealing = phase === 'revealing' || phase === 'done';

    useEffect(() => {
        if (!isAnimating) return;
        setOsLine(0);
        setTypesVisible(0);
        setRarityStep(0);

        const timers = [];
        OS_LINES_ANIMATING.forEach((_, i) => {
            timers.push(setTimeout(() => setOsLine(i + 1), 200 + i * 320));
        });
        SCAN_TYPES.forEach((_, i) => {
            timers.push(setTimeout(() => setTypesVisible(i + 1), 500 + i * 200));
        });
        for (let s = 1; s <= 4; s++) {
            timers.push(setTimeout(() => setRarityStep(s), 900 + s * 200));
        }
        return () => timers.forEach(clearTimeout);
    }, [isAnimating]);

    useEffect(() => {
        if (isRevealing) {
            setOsLine(OS_LINES_ANIMATING.length);
            setTypesVisible(SCAN_TYPES.length);
            setRarityStep(4);
        }
    }, [isRevealing]);

    const revealedLines = isRevealing
        ? OS_LINES_REVEALING.slice(0, Math.min(flippedCount + 1, OS_LINES_REVEALING.length))
        : [];

    return (
        <div className={`pom2-holo${isGoat ? ' pom2-holo--goat' : ''}`} aria-hidden="true">
            <div className="pom2-holo-grid" />
            <div className={`pom2-holo-scanline${isRevealing ? ' pom2-holo-scanline--slow' : ''}`} />
            <div className="pom2-holo-scanline-v" />
            <div className="pom2-holo-corner pom2-holo-corner--tl" />
            <div className="pom2-holo-corner pom2-holo-corner--tr" />
            <div className="pom2-holo-corner pom2-holo-corner--bl" />
            <div className="pom2-holo-corner pom2-holo-corner--br" />

            <div className="pom2-holo-content">
                <div className="pom2-holo-header">
                    <span className="pom2-holo-dot" />
                    <span className="pom2-holo-os-title">GLOBAL ALBUMS OS v2.6</span>
                </div>

                <div className="pom2-holo-lines">
                    {OS_LINES_ANIMATING.slice(0, osLine).map((line, i) => (
                        <div key={i} className="pom2-holo-line pom2-holo-line--in">
                            <span className="pom2-holo-prompt">›</span>
                            <span className="pom2-holo-line-text">{line}</span>
                        </div>
                    ))}
                    {revealedLines.map((line, i) => (
                        <div key={'r' + i} className="pom2-holo-line pom2-holo-line--done">
                            <span className="pom2-holo-prompt">✓</span>
                            <span className="pom2-holo-line-text">{line}</span>
                        </div>
                    ))}
                </div>

                {typesVisible > 0 && <div className="pom2-holo-sep" />}

                {typesVisible > 0 && (
                    <div className="pom2-holo-section">
                        <span className="pom2-holo-label">CONTENIDO DETECTADO</span>
                        <div className="pom2-holo-types">
                            {SCAN_TYPES.slice(0, typesVisible).map((t, i) => (
                                <div key={t.key} className="pom2-holo-type-row pom2-holo-type-row--in"
                                    style={{ '--tc': t.color, '--ti': i }}>
                                    <span className="pom2-holo-type-diamond">◈</span>
                                    <span className="pom2-holo-type-name">{t.label}</span>
                                    <span className="pom2-holo-type-signal" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {rarityStep > 0 && (
                    <>
                        <div className="pom2-holo-sep" />
                        <div className="pom2-holo-section">
                            <span className="pom2-holo-label">
                                {isGoat ? '⚠ ANOMALÍA DETECTADA' : 'RAREZA ESTIMADA'}
                            </span>
                            {isGoat ? (
                                <div className="pom2-holo-anomaly">
                                    <span className="pom2-holo-anomaly-text">ÍTEM DE ALTO VALOR</span>
                                </div>
                            ) : (
                                <div className="pom2-holo-rarity-bar">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i}
                                            className={`pom2-holo-rarity-seg${i < rarityStep * 2 ? ' pom2-holo-rarity-seg--on' : ''}`}
                                            style={{ '--ri': i }} />
                                    ))}
                                    <span className="pom2-holo-rarity-lbl">
                                        {isRevealing ? 'CONFIRMADA' : 'ANALIZANDO'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {isRevealing && (
                    <>
                        <div className="pom2-holo-sep" />
                        <div className="pom2-holo-section">
                            <span className="pom2-holo-label">ÍTEMS REVELADOS</span>
                            <div className="pom2-holo-counter">
                                <span className="pom2-holo-counter-n">{flippedCount}</span>
                                <span className="pom2-holo-counter-sep">/</span>
                                <span className="pom2-holo-counter-total">{totalCards}</span>
                                <div className="pom2-holo-counter-pips">
                                    {Array.from({ length: totalCards }).map((_, i) => (
                                        <span key={i}
                                            className={`pom2-holo-pip${i < flippedCount ? ' pom2-holo-pip--on' : ''}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ─── EnvelopePack ───────────────────────────────────────────────────────── */
function EnvelopePack({ count, phase, onOpen, isOpening, allFlipped, packsAvailable, onReset, onClose, isGoat, flippedCount, totalCards }) {
    const [envPhase, setEnvPhase] = useState('idle');
    const [scannerActive, setScannerActive] = useState(false);

    useEffect(() => {
        if (phase === 'idle') {
            setEnvPhase('idle');
            setScannerActive(false);
            return;
        }
        if (phase === 'animating') {
            setEnvPhase('shake');
            const t1 = setTimeout(() => setEnvPhase('opening'), 450);
            const t2 = setTimeout(() => {
                setEnvPhase('gone');
                setScannerActive(true);
            }, 950);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [phase]);

    useEffect(() => {
        if (allFlipped) setScannerActive(false);
    }, [allFlipped]);

    const isGone = envPhase === 'gone' || phase === 'revealing' || phase === 'done';

    return (
        <div className="pom2-pack-panel">
            <div className="pom2-pack-bg-pattern" aria-hidden="true" />

            {!isGone && (
                <div className={`pom2-env-wrap pom2-env-wrap--${envPhase}`} data-env-phase={envPhase} aria-hidden="true">
                    <div className={`pom2-env-glow pom2-env-glow--${envPhase}`} aria-hidden="true" />
                    <div className="pom2-env-shadow" />
                    <div className="pom2-env-body">
                        <div className="pom2-env-spine" />
                        <div className="pom2-env-shine" />
                        <div className="pom2-env-face">
                            <div className="pom2-env-logo">
                                <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                                    <path d="M24 4L6 12V24C6 33 14 41 24 44C34 41 42 33 42 24V12L24 4Z"
                                        stroke="currentColor" strokeWidth="1.5"
                                        fill="none" strokeLinejoin="round" />
                                    <text x="24" y="29" textAnchor="middle"
                                        fontFamily="'DM Mono', monospace" fontSize="11"
                                        fontWeight="700" fill="currentColor">GA</text>
                                </svg>
                            </div>
                            <span className="pom2-env-brand">Global Albums</span>
                            <span className="pom2-env-season">25 · 26</span>
                        </div>
                        <div className="pom2-env-flap-bottom" />
                        <div className="pom2-env-beam" />
                    </div>
                    <div className="pom2-env-flap">
                        <div className="pom2-env-flap-face" />
                        <div className="pom2-env-perfs">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <span key={i} className="pom2-env-perf" />
                            ))}
                        </div>
                    </div>
                    <div className="pom2-env-tear-line">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="pom2-env-tear-seg" />
                        ))}
                    </div>
                </div>
            )}

            <div className={`pom2-pack-count${isGone ? ' pom2-pack-count--hidden' : ''}`}>
                <span className="pom2-pack-count-n">{count}</span>
                <span className="pom2-pack-count-lbl">
                    {count === 1 ? 'sobre disponible' : 'sobres disponibles'}
                </span>
            </div>

            {phase === 'idle' && (
                <button
                    className="pom2-pack-cta"
                    onClick={onOpen}
                    disabled={count < 1 || isOpening}
                    aria-label="Abrir sobre"
                    aria-busy={isOpening}
                >
                    {isOpening ? 'Abriendo…' : 'Abrir sobre'}
                    {!isOpening && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6h8M7 3l3 3-3 3"
                                stroke="currentColor" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            )}

            {scannerActive && (
                <HoloScanner
                    phase={phase}
                    isGoat={isGoat}
                    flippedCount={flippedCount}
                    totalCards={totalCards}
                />
            )}

            <p className={`pom2-pack-types-hint${isGone ? ' pom2-pack-types-hint--hidden' : ''}`}>
                jugador · equipo · copa · evento
            </p>
        </div>
    );
}

/* ─── CardsPanel ─────────────────────────────────────────────────────────── */
function CardsPanel({ cards, isDealt, flippedSet, onFlip, isGoat, allFlipped, packsAvailable, onReset, onClose }) {
    return (
        <div className="pom2-cards-panel">
            <div className="pom2-cards-header">
                <span className="pom2-cards-tag">Tus cartas</span>
                <div className="pom2-progress-dots" aria-label={`${flippedSet.size} de ${cards.length} reveladas`}>
                    {cards.map((_, i) => (
                        <span key={i}
                            className={`pom2-pdot${flippedSet.has(i) ? ' pom2-pdot--done' : ''}`} />
                    ))}
                </div>
            </div>

            <div className="pom2-cards-grid">
                {!isDealt
                    ? CARD_ORDER.map((type, i) => (
                        <div key={type} className="pom2-waiting-slot" style={{ '--slot-i': i }} aria-hidden="true">
                            <CardBack />
                            <div className="pom2-waiting-shimmer" />
                            <span className="pom2-waiting-type">{TYPE_LABEL[type]}</span>
                        </div>
                    ))
                    : cards.map(({ type, card }, i) => (
                        <FlipCard
                            key={type}
                            type={type}
                            card={card}
                            index={i}
                            isDealt={isDealt}
                            isFlipped={flippedSet.has(i)}
                            onFlip={() => onFlip(i)}
                            isGoat={isGoat}
                        />
                    ))}
            </div>

            {!allFlipped && isDealt && (
                <p className="pom2-cards-hint pom2-cards-hint--visible" aria-live="polite">
                    Toca cada carta para revelarla · {flippedSet.size}/{cards.length}
                </p>
            )}
            {allFlipped && (
                <div className="pom2-cards-done-wrap" aria-live="polite">
                    <ConfettiBurst />
                    <p className="pom2-cards-done">¡Sobre completado!</p>
                </div>
            )}

            {allFlipped && (
                <div className="pom2-mobile-actions">
                    {packsAvailable > 1 && (
                        <button className="pom2-btn-again" onClick={onReset}>
                            Abrir otro
                            <span className="pom2-badge">{packsAvailable - 1}</span>
                        </button>
                    )}
                    <button className="pom2-btn-collection" onClick={onClose}>
                        Ver mi colección
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Modal principal ───────────────────────────────────────────────────── */
export default function PackOpeningModal({
    isOpen,
    phase,
    result,
    packsAvailable,
    isGoat,
    isLegend,
    isOpening,
    onOpen,
    onClose,
    onReset,
}) {
    const [flippedCards, setFlippedCards] = useState(new Set());
    const [isDealt, setIsDealt] = useState(false);
    const overlayRef = useRef(null);

    const allFlipped = result ? flippedCards.size === CARD_ORDER.length : false;

    useEffect(() => {
        if (phase === 'revealing') {
            setFlippedCards(new Set());
            setIsDealt(false);
            const t = setTimeout(() => setIsDealt(true), 30);
            return () => clearTimeout(t);
        }
        if (phase === 'idle') {
            setFlippedCards(new Set());
            setIsDealt(false);
        }
    }, [phase]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const cards = result
        ? CARD_ORDER.map(type => ({ type, card: result[type] }))
        : CARD_ORDER.map(type => ({ type, card: null }));

    const handleFlip = (i) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            next.add(i);
            return next;
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current && allFlipped) onClose();
    };

    const titles = {
        idle: 'Apertura de sobre',
        animating: 'Abriendo…',
        revealing: isGoat ? '¡Figurita GOAT!' : '¡Tus cartas!',
        done: isGoat ? '¡Figurita GOAT!' : '¡Tus cartas!',
    };

    return (
        <div
            ref={overlayRef}
            className="pom2-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Apertura de sobre"
        >
            <div className={[
                'pom2-modal',
                isGoat ? 'pom2-modal--goat' : '',
                isLegend ? 'pom2-modal--legend' : '',
                `pom2-modal--${phase}`,
            ].filter(Boolean).join(' ')}>

                <div className="pom2-header">
                    <div className="pom2-header-accent" aria-hidden="true" />
                    <div className="pom2-header-text">
                        <span className="pom2-eyebrow">Global Albums · 25/26</span>
                        <span className="pom2-title">{titles[phase] ?? titles.idle}</span>
                    </div>
                    {(allFlipped || phase === 'idle') && (
                        <button
                            className="pom2-close"
                            onClick={onClose}
                            aria-label="Cerrar modal"
                        >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                                <path d="M1 1l9 9M10 1L1 10"
                                    stroke="currentColor" strokeWidth="1.6"
                                    strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="pom2-header-sep" aria-hidden="true" />

                <div className="pom2-body">
                    {allFlipped ? (
                        <PackDonePanel
                            cards={cards}
                            packsAvailable={packsAvailable}
                            onReset={onReset}
                            onClose={onClose}
                        />
                    ) : (
                        <EnvelopePack
                            count={packsAvailable}
                            phase={phase}
                            onOpen={onOpen}
                            isOpening={isOpening}
                            allFlipped={allFlipped}
                            packsAvailable={packsAvailable}
                            onReset={onReset}
                            onClose={onClose}
                            isGoat={isGoat}
                            flippedCount={flippedCards.size}
                            totalCards={CARD_ORDER.length}
                        />
                    )}

                    <div className="pom2-divider" aria-hidden="true" />

                    <CardsPanel
                        cards={cards}
                        isDealt={isDealt}
                        flippedSet={flippedCards}
                        onFlip={handleFlip}
                        isGoat={isGoat}
                        allFlipped={allFlipped}
                        packsAvailable={packsAvailable}
                        onReset={onReset}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
}