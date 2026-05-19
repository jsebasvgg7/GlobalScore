import React, { useEffect, useState, useCallback } from 'react';
import { getHistoricalImageUrl } from '@/features/history/services/history.service';
import '../../styles/mobile/PackOpeningModal.mobile.css';

/* ───  Constants (shared) ────────────────────────────────────────────────── */

const TYPE_LABEL = {
    player:      'Jugador',
    team:        'Equipo',
    competition: 'Copa',
    event:       'Evento',
};

const TYPE_COLOR = {
    player:      '#7C6FFF',
    team:        '#10B981',
    competition: '#F59E0B',
    event:       '#F43F5E',
};

const TYPE_ICON = {
    player:      'M24 4C24 4 16 8 16 16C16 21 19 24 24 26C29 24 32 21 32 16C32 8 24 4 24 4Z M10 40C10 32 16 28 24 28C32 28 38 32 38 40',
    team:        'M24 4L6 12V24C6 33 14 41 24 44C34 41 42 33 42 24V12L24 4Z',
    competition: 'M24 4L28 16H42L31 23L35 35L24 28L13 35L17 23L6 16H20L24 4Z',
    event:       'M24 4C13 4 4 13 4 24C4 35 13 44 24 44C35 44 44 35 44 24C44 13 35 4 24 4Z M24 12V26L32 30',
};

const CARD_ORDER = ['player', 'team', 'competition', 'event'];

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
}

/* ─── StarRow ───────────────────────────────────────────────────────────── */
function StarRow({ level }) {
    if (!level) return null;
    return (
        <div className="mob-stars">
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`mob-star${n <= level ? ' mob-star--lit' : ''}`}>★</span>
            ))}
        </div>
    );
}

/* ─── Card Back ─────────────────────────────────────────────────────────── */
function CardBack() {
    return (
        <div className="mob-card-back">
            <div className="mob-card-back-grid" />
            <div className="mob-card-back-logo">
                <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4L6 12V24C6 33 14 41 24 44C34 41 42 33 42 24V12L24 4Z"
                        stroke="currentColor" strokeWidth="1.5" strokeOpacity=".55"
                        fill="none" strokeLinejoin="round" />
                    <text x="24" y="29" textAnchor="middle"
                        fontFamily="'DM Mono', monospace" fontSize="10"
                        fontWeight="700" fill="currentColor" fillOpacity=".5">GA</text>
                </svg>
            </div>
            <span className="mob-back-corner mob-back-corner--tl">GA</span>
            <span className="mob-back-corner mob-back-corner--br">GA</span>
        </div>
    );
}

/* ─── Card Front ────────────────────────────────────────────────────────── */
function CardFront({ type, card }) {
    const color    = TYPE_COLOR[type] || '#7C6FFF';
    const isPlayer = type === 'player';
    const stars    = isPlayer ? card?.significance_level : null;
    const imgUrl   = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;
    const label    = TYPE_LABEL[type] || type;
    const iconPath = TYPE_ICON[type];

    return (
        <div className="mob-card-front" style={{ '--c': color }}>
            <div className="mob-card-strip" />
            <span className="mob-card-type-label">{label}</span>
            <div className="mob-card-media">
                {imgUrl ? (
                    <img src={imgUrl} alt={card?.name || ''} className="mob-card-img" />
                ) : (
                    <div className="mob-card-placeholder">
                        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                            <path d={iconPath} stroke="currentColor" strokeWidth="1.8"
                                fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="mob-card-initials">{getInitials(card?.name)}</span>
                    </div>
                )}
                <i className="mob-corner mob-corner--tl" />
                <i className="mob-corner mob-corner--tr" />
                <i className="mob-corner mob-corner--bl" />
                <i className="mob-corner mob-corner--br" />
            </div>
            <div className="mob-card-footer">
                <span className="mob-card-name">{card?.name || '—'}</span>
                {stars ? <StarRow level={stars} /> : (
                    <span className="mob-card-rarity">{label}</span>
                )}
            </div>
            <div className="mob-card-gloss" />
        </div>
    );
}

/* ─── Flip Card ─────────────────────────────────────────────────────────── */
function FlipCard({ type, card, index, isDealt, isFlipped, onFlip }) {
    const handleKey = useCallback((e) => {
        if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) onFlip();
    }, [isFlipped, onFlip]);

    return (
        <div
            className={[
                'mob-flip-slot',
                isDealt   ? 'mob-flip-slot--dealt'   : '',
                isFlipped ? 'mob-flip-slot--flipped' : '',
            ].filter(Boolean).join(' ')}
            style={{ '--deal-delay': `${index * 0.11}s` }}
            onClick={!isFlipped ? onFlip : undefined}
            role={!isFlipped ? 'button' : undefined}
            aria-label={!isFlipped ? `Revelar carta ${index + 1}` : TYPE_LABEL[type]}
            tabIndex={!isFlipped ? 0 : undefined}
            onKeyDown={handleKey}
        >
            <div className="mob-flip-inner">
                <CardBack />
                <CardFront type={type} card={card} />
            </div>
            {!isFlipped && (
                <span className="mob-tap-hint" aria-hidden="true">toca</span>
            )}
        </div>
    );
}

/* ─── Main Mobile Modal ─────────────────────────────────────────────────── */
export default function PackOpeningModalMobile({
    isOpen,
    phase,
    result,
    packsAvailable,
    isGoat,
    isLegend,
    onOpen,
    onClose,
    onReset,
}) {
    const [flippedCards, setFlippedCards] = useState(new Set());
    const [isDealt,      setIsDealt]      = useState(false);

    const allFlipped     = result ? flippedCards.size === CARD_ORDER.length : false;
    const isShowingCards = phase === 'revealing' || phase === 'done';

    useEffect(() => {
        if (phase === 'revealing') {
            setFlippedCards(new Set());
            setIsDealt(false);
            const t = setTimeout(() => setIsDealt(true), 60);
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

    const titles = {
        idle:      'Apertura de sobre',
        animating: 'Abriendo…',
        revealing: isGoat ? '¡Figurita GOAT!' : '¡Tus cartas!',
        done:      isGoat ? '¡Figurita GOAT!' : '¡Tus cartas!',
    };

    return (
        <div
            className={`mob-overlay${isGoat ? ' mob-overlay--goat' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Apertura de sobre"
        >
            <div className={[
                'mob-modal',
                isGoat   ? 'mob-modal--goat'   : '',
                isLegend ? 'mob-modal--legend' : '',
            ].filter(Boolean).join(' ')}>

                {/* ── Header ── */}
                <div className="mob-header">
                    <div className="mob-header-accent" />
                    <div className="mob-header-text">
                        <span className="mob-eyebrow">Global Albums · 25/26</span>
                        <span className="mob-title">{titles[phase] ?? titles.idle}</span>
                    </div>
                    {(allFlipped || phase === 'idle') && (
                        <button className="mob-close" onClick={onClose} aria-label="Cerrar">
                            <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                                <path d="M1 1l9 9M10 1L1 10"
                                    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    TOP HALF (50%) — Panel del sobre
                ══════════════════════════════════════ */}
                <div className="mob-pack-section">
                    <div className="mob-pack-bg-pattern" />

                    {/* Sobre grande centrado */}
                    <div className={`mob-pack-wrap${phase === 'animating' ? ' mob-pack-wrap--tearing' : ''}`}>
                        {/* Solapa */}
                        <div className="mob-pack-flap">
                            <div className="mob-pack-flap-perfs">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <span key={i} className="mob-perf" />
                                ))}
                            </div>
                        </div>
                        {/* Cuerpo */}
                        <div className="mob-pack-body">
                            <div className="mob-pack-spine" />
                            <div className="mob-pack-face">
                                {phase === 'animating' && <div className="mob-pack-beam" />}
                                <div className="mob-pack-logo">
                                    <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
                                        <path d="M24 4L6 12V24C6 33 14 41 24 44C34 41 42 33 42 24V12L24 4Z"
                                            stroke="currentColor" strokeWidth="1.4"
                                            fill="none" strokeLinejoin="round" />
                                        <text x="24" y="29" textAnchor="middle"
                                            fontFamily="'DM Mono', monospace" fontSize="11"
                                            fontWeight="700" fill="currentColor">GA</text>
                                    </svg>
                                </div>
                                <span className="mob-pack-season">25 · 26</span>
                                <span className="mob-pack-brand">Global Albums</span>
                            </div>
                        </div>
                    </div>

                    {/* Info + acciones debajo del sobre */}
                    <div className="mob-pack-info">
                        <div className="mob-pack-count">
                            <span className="mob-pack-count-n">{packsAvailable}</span>
                            <span className="mob-pack-count-lbl">
                                {packsAvailable === 1 ? 'sobre disponible' : 'sobres disponibles'}
                            </span>
                        </div>

                        {/* CTA abrir sobre */}
                        {phase === 'idle' && (
                            <button
                                className="mob-pack-cta"
                                onClick={onOpen}
                                disabled={packsAvailable < 1}
                            >
                                Abrir sobre
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6h8M7 3l3 3-3 3"
                                        stroke="currentColor" strokeWidth="1.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                        {phase === 'animating' && (
                            <span className="mob-pack-opening-lbl">Abriendo…</span>
                        )}

                        {/* Botones post-apertura */}
                        {allFlipped && (
                            <div className="mob-actions">
                                {packsAvailable > 1 && (
                                    <button className="mob-btn-again" onClick={onReset}>
                                        Abrir otro
                                        <span className="mob-badge">{packsAvailable - 1}</span>
                                    </button>
                                )}
                                <button className="mob-btn-collection" onClick={onClose}>
                                    Ver mi colección
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Separador */}
                <div className="mob-divider" />

                {/* ══════════════════════════════════════
                    BOTTOM HALF (50%) — Panel de cartas
                ══════════════════════════════════════ */}
                <div className="mob-cards-section">
                    <div className="mob-cards-header">
                        <span className="mob-cards-tag">Tus cartas</span>
                        <div className="mob-progress-dots">
                            {cards.map((_, i) => (
                                <span key={i}
                                    className={`mob-pdot${flippedCards.has(i) ? ' mob-pdot--done' : ''}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mob-cards-grid">
                        {cards.map(({ type, card }, i) => (
                            <FlipCard
                                key={type}
                                type={type}
                                card={card}
                                index={i}
                                isDealt={isDealt}
                                isFlipped={flippedCards.has(i)}
                                onFlip={() => handleFlip(i)}
                            />
                        ))}
                    </div>

                    {!allFlipped && isDealt && (
                        <p className="mob-cards-hint">
                            Toca para revelar · {flippedCards.size}/{cards.length}
                        </p>
                    )}
                    {allFlipped && (
                        <p className="mob-cards-done">¡Sobre completado!</p>
                    )}
                </div>

            </div>
        </div>
    );
}
