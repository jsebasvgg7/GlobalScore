import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getHistoricalImageUrl } from '@/features/history/services/history.service';
import '../styles/PackOpeningModal.css';
import '../styles/mobile/PackOpeningModal.mobile.css';

/* ─── Constants ─────────────────────────────────────────────────────────── */

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

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StarRow({ level }) {
    if (!level) return null;
    return (
        <div className="pom2-stars">
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`pom2-star${n <= level ? ' pom2-star--lit' : ''}`}>★</span>
            ))}
        </div>
    );
}

/** Partículas para carta GOAT */
function GoatParticles() {
    return (
        <div className="pom2-particles" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
                <div key={i} className="pom2-particle" style={{
                    '--angle':  `${(i / 18) * 360}deg`,
                    '--delay':  `${(i % 6) * 0.07}s`,
                    '--dist':   `${55 + Math.random() * 55}px`,
                    '--size':   `${2 + Math.random() * 3}px`,
                    '--color':  i % 2 === 0 ? '#f59e0b' : '#fcd34d',
                }} />
            ))}
        </div>
    );
}

/** Dorso de la carta (boca abajo) */
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

/** Frente de la carta */
function CardFront({ type, card, isGoat }) {
    const color   = TYPE_COLOR[type] || '#7C6FFF';
    const isPlayer = type === 'player';
    const stars   = isPlayer ? card?.significance_level : null;
    const imgUrl  = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;
    const label   = TYPE_LABEL[type] || type;
    const iconPath = TYPE_ICON[type];

    return (
        <div
            className={`pom2-card-front${isGoat && isPlayer ? ' pom2-card-front--goat' : ''}`}
            style={{ '--c': color }}
        >
            {/* Barra de color superior */}
            <div className="pom2-card-strip" />

            {/* Etiqueta de tipo */}
            <span className="pom2-card-type-label">{label}</span>

            {/* Imagen o placeholder */}
            <div className="pom2-card-media">
                {imgUrl ? (
                    <img src={imgUrl} alt={card?.name || ''} className="pom2-card-img" />
                ) : (
                    <div className="pom2-card-placeholder">
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                            <path d={iconPath} stroke="currentColor" strokeWidth="1.8"
                                fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="pom2-card-initials">{getInitials(card?.name)}</span>
                    </div>
                )}
                {/* Esquinas decorativas */}
                <i className="pom2-corner pom2-corner--tl" aria-hidden="true" />
                <i className="pom2-corner pom2-corner--tr" aria-hidden="true" />
                <i className="pom2-corner pom2-corner--bl" aria-hidden="true" />
                <i className="pom2-corner pom2-corner--br" aria-hidden="true" />
            </div>

            {/* Footer con nombre y estrellas */}
            <div className="pom2-card-footer">
                <span className="pom2-card-name">{card?.name || '—'}</span>
                {stars && <StarRow level={stars} />}
                {!stars && (
                    <span className="pom2-card-rarity">
                        {type === 'event' ? 'Evento' : type === 'competition' ? 'Copa' : type === 'team' ? 'Equipo' : 'Jugador'}
                    </span>
                )}
            </div>

            {/* Brillo decorativo */}
            <div className="pom2-card-gloss" aria-hidden="true" />
            {isGoat && isPlayer && <GoatParticles />}
        </div>
    );
}

/** Carta individual con efecto flip */
function FlipCard({ type, card, index, isDealt, isFlipped, onFlip, isGoat }) {
    const handleKey = useCallback((e) => {
        if (!isFlipped && (e.key === 'Enter' || e.key === ' ')) onFlip();
    }, [isFlipped, onFlip]);

    return (
        <div
            className={[
                'pom2-flip-slot',
                isDealt   ? 'pom2-flip-slot--dealt'   : '',
                isFlipped ? 'pom2-flip-slot--flipped' : '',
            ].filter(Boolean).join(' ')}
            style={{ '--deal-delay': `${index * 0.11}s` }}
            onClick={!isFlipped ? onFlip : undefined}
            role={!isFlipped ? 'button' : undefined}
            aria-label={!isFlipped ? `Revelar carta ${index + 1}` : TYPE_LABEL[type]}
            tabIndex={!isFlipped ? 0 : undefined}
            onKeyDown={handleKey}
        >
            <div className="pom2-flip-inner">
                <CardBack />
                <CardFront type={type} card={card} isGoat={isGoat} />
            </div>
            {!isFlipped && (
                <span className="pom2-tap-hint" aria-hidden="true">toca</span>
            )}
        </div>
    );
}

/** Sobre visual (lado izquierdo) */
function PackVisual({ count, phase, onOpen, allFlipped, packsAvailable, onReset, onClose }) {
    const isOpening = phase === 'animating';

    return (
        <div className="pom2-pack-panel">
            {/* Patrón de fondo */}
            <div className="pom2-pack-bg-pattern" aria-hidden="true" />

            {/* Sobre */}
            <div className={`pom2-pack-wrap${isOpening ? ' pom2-pack-wrap--tearing' : ''}`} aria-hidden="true">
                {/* Solapa (animada al abrir) */}
                <div className="pom2-pack-flap">
                    <div className="pom2-pack-flap-perfs">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <span key={i} className="pom2-perf" />
                        ))}
                    </div>
                </div>
                {/* Cuerpo del sobre */}
                <div className="pom2-pack-body">
                    <div className="pom2-pack-spine" />
                    <div className="pom2-pack-face">
                        {/* Rayo de apertura */}
                        {isOpening && <div className="pom2-pack-beam" aria-hidden="true" />}
                        <div className="pom2-pack-logo">
                            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                                <path d="M24 4L6 12V24C6 33 14 41 24 44C34 41 42 33 42 24V12L24 4Z"
                                    stroke="currentColor" strokeWidth="1.4"
                                    fill="none" strokeLinejoin="round" />
                                <text x="24" y="29" textAnchor="middle"
                                    fontFamily="'DM Mono', monospace" fontSize="11"
                                    fontWeight="700" fill="currentColor">GA</text>
                            </svg>
                        </div>
                        <span className="pom2-pack-season">25 · 26</span>
                        <span className="pom2-pack-brand">Global Albums</span>
                    </div>
                </div>
            </div>

            {/* Contador de sobres */}
            <div className="pom2-pack-count">
                <span className="pom2-pack-count-n">{count}</span>
                <span className="pom2-pack-count-lbl">
                    {count === 1 ? 'sobre disponible' : 'sobres disponibles'}
                </span>
            </div>

            {/* Botón abrir / estado abriendo */}
            {phase === 'idle' && (
                <button
                    className="pom2-pack-cta"
                    onClick={onOpen}
                    disabled={count < 1}
                    aria-label="Abrir sobre"
                >
                    Abrir sobre
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6h8M7 3l3 3-3 3"
                            stroke="currentColor" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
            {phase === 'animating' && (
                <span className="pom2-pack-opening-lbl" aria-live="polite">Abriendo…</span>
                
            )}
            
             {/* Pista de tipos */}
            <p className="pom2-pack-types-hint">jugador · equipo · copa · evento</p>
            {/* Botones de acción cuando el sobre está completado */}
                {allFlipped && (
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
                )}
        </div>
    );
}

/** Área de cartas (lado derecho) */
function CardsPanel({ cards, isDealt, flippedSet, onFlip, isGoat, allFlipped }) {
    return (
        <div className="pom2-cards-panel">
            {/* Cabecera de la sección */}
            <div className="pom2-cards-header">
                <span className="pom2-cards-tag">Tus cartas</span>
                {/* Puntos de progreso */}
                <div className="pom2-progress-dots" aria-label={`${flippedSet.size} de ${cards.length} reveladas`}>
                    {cards.map((_, i) => (
                        <span key={i}
                            className={`pom2-pdot${flippedSet.has(i) ? ' pom2-pdot--done' : ''}`} />
                    ))}
                </div>
            </div>

            {/* Grid 2×2 */}
            <div className="pom2-cards-grid">
                {cards.map(({ type, card }, i) => (
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

            {/* Hint cuando no están todas volteadas */}
            {!allFlipped && isDealt && (
                <p className="pom2-cards-hint" aria-live="polite">
                    Toca cada carta para revelarla · {flippedSet.size}/{cards.length}
                </p>
            )}
            {allFlipped && (
                <p className="pom2-cards-done" aria-live="polite">¡Sobre completado!</p>
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
    onOpen,
    onClose,
    onReset,
}) {
    const [flippedCards, setFlippedCards] = useState(new Set());
    const [isDealt,      setIsDealt]      = useState(false);
    const overlayRef = useRef(null);

    const allFlipped = result ? flippedCards.size === CARD_ORDER.length : false;
    const isShowingCards = phase === 'revealing' || phase === 'done';

    /* Resetear al abrir nuevo sobre */
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

    /* Bloquear scroll del body */
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

    /* Títulos por fase */
    const titles = {
        idle:      'Apertura de sobre',
        animating: 'Abriendo…',
        revealing: isGoat ? '¡Figurita GOAT!' : '¡Tus cartas!',
        done:      isGoat ? '¡Figurita GOAT!' : '¡Tus cartas!',
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
                isGoat   ? 'pom2-modal--goat'   : '',
                isLegend ? 'pom2-modal--legend' : '',
                `pom2-modal--${phase}`,
            ].filter(Boolean).join(' ')}>

                {/* ── Header ── */}
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

                {/* ── Body: sobre + cartas side by side ── */}
                <div className="pom2-body">
                    {/* Lado izquierdo: sobre */}
                   <PackVisual
                        count={packsAvailable}
                        phase={phase}
                        onOpen={onOpen}
                        allFlipped={allFlipped}
                        packsAvailable={packsAvailable}
                        onReset={onReset}
                        onClose={onClose}
                    />

                    {/* Divisor vertical */}
                    <div className="pom2-divider" aria-hidden="true" />

                    {/* Lado derecho: cartas */}
                    <CardsPanel
                        cards={cards}
                        isDealt={isDealt}
                        flippedSet={flippedCards}
                        onFlip={handleFlip}
                        isGoat={isGoat}
                        allFlipped={allFlipped}
                    />
                </div>
            </div>
        </div>
    );
}