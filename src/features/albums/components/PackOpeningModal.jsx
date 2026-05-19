import React, { useEffect, useState, useRef } from 'react';
import { getHistoricalImageUrl } from '@/features/history/services/history.service';
import '../styles/PackOpeningModal.css';
import '../styles/mobile/PackOpeningModal.mobile.css';

const TYPE_LABEL = { player: 'JUGADOR', team: 'EQUIPO', competition: 'COPA', event: 'EVENTO' };
const TYPE_COLOR = {
    player: '#6C63FF',
    team: '#10B981',
    competition: '#F59E0B',
    event: '#F43F5E',
};
const CARD_ORDER = ['player', 'team', 'competition', 'event'];

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function StarRow({ level }) {
    if (!level) return null;
    return (
        <div className="pom-stars">
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`pom-star${n <= level ? ' pom-star--lit' : ''}`}>★</span>
            ))}
        </div>
    );
}

function Particles() {
    return (
        <div className="pom-particles" aria-hidden="true">
            {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="pom-particle" style={{
                    '--angle': `${(i / 20) * 360}deg`,
                    '--delay': `${(i % 5) * 0.08}s`,
                    '--dist': `${60 + Math.random() * 70}px`,
                    '--size': `${2 + Math.random() * 3}px`,
                    '--color': i % 2 === 0 ? '#f59e0b' : '#fcd34d',
                }} />
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════
   BACK of card — shown face-down on the table
════════════════════════════════════════════════ */
function CardBack() {
    return (
        <div className="pom-card-back">
            <div className="pom-card-back-pattern" />
            <span className="pom-card-back-corner pom-card-back-corner--tl">GA</span>
            <div className="pom-card-back-logo">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="21"
                        stroke="currentColor" strokeWidth="1.5" strokeOpacity=".5" />
                    <path d="M24 7l4 11h12l-9.5 7.5 3.5 11L24 30l-10 6.5 3.5-11L8 18h12z"
                        stroke="currentColor" strokeWidth="1.5" strokeOpacity=".5"
                        fill="none" strokeLinejoin="round" />
                </svg>
            </div>
            <span className="pom-card-back-corner pom-card-back-corner--br">GA</span>
        </div>
    );
}

/* ════════════════════════════════════════════════
   CARTA INDIVIDUAL — flip on click
   Face-down by default; revealed on user tap/click
════════════════════════════════════════════════ */
function RevealCard({ type, card, index, dealt, isRevealed, onReveal, isGoat }) {
    const color = TYPE_COLOR[type] || '#6C63FF';
    const isPlayer = type === 'player';
    const stars = isPlayer ? card?.significance_level : null;
    const imgUrl = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;
    const isGoatCard = isGoat && isPlayer;

    return (
        <div
            className={`pom-card-slot${dealt ? ' pom-card-slot--dealt' : ''}${isRevealed ? ' pom-card-slot--revealed' : ''}`}
            style={{ '--deal-delay': `${index * 0.12}s` }}
            onClick={!isRevealed ? onReveal : undefined}
            role={!isRevealed ? 'button' : undefined}
            aria-label={!isRevealed ? `Revelar carta ${index + 1}` : TYPE_LABEL[type]}
            tabIndex={!isRevealed ? 0 : undefined}
            onKeyDown={!isRevealed ? (e) => e.key === 'Enter' && onReveal() : undefined}
        >
            <div className="pom-card-inner">

                {/* BACK */}
                <CardBack />

                {/* FRONT */}
                <div
                    className={`pom-card-front${isGoatCard ? ' pom-card-front--goat' : ''}`}
                    style={{ '--c': color }}
                >
                    <div className="pom-card-topstrip" />
                    <span className="pom-card-type">{TYPE_LABEL[type]}</span>

                    <div className="pom-card-media">
                        {imgUrl
                            ? <img src={imgUrl} alt={card?.name || ''} className="pom-card-img" />
                            : <span className="pom-card-initials">{getInitials(card?.name)}</span>
                        }
                        <i className="pom-corner pom-corner--tl" aria-hidden="true" />
                        <i className="pom-corner pom-corner--tr" aria-hidden="true" />
                        <i className="pom-corner pom-corner--bl" aria-hidden="true" />
                        <i className="pom-corner pom-corner--br" aria-hidden="true" />
                    </div>

                    <div className="pom-card-footer">
                        <span className="pom-card-name">{card?.name || '—'}</span>
                        {stars && <StarRow level={stars} />}
                    </div>

                    <div className="pom-card-gloss" aria-hidden="true" />
                    {isGoatCard && <Particles />}
                </div>

            </div>

            {/* Tap hint — only visible when face-down */}
            {!isRevealed && (
                <span className="pom-tap-hint" aria-hidden="true">toca para revelar</span>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════
   TABLE FELT — decorative background surface
════════════════════════════════════════════════ */
function TableFelt() {
    return <div className="pom-table-felt" aria-hidden="true" />;
}

/* ════════════════════════════════════════════════
   PROGRESS DOTS — one per card
════════════════════════════════════════════════ */
function ProgressDots({ total, revealedSet }) {
    return (
        <div className="pom-progress-dots" aria-label={`${revealedSet.size} de ${total} cartas reveladas`}>
            {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`pom-pdot${revealedSet.has(i) ? ' pom-pdot--done' : ''}`} />
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════
   SOBRE — fase idle
════════════════════════════════════════════════ */
function PackVisual({ count, onOpen }) {
    return (
        <div className="pom-pack-scene">
            <div className="pom-pack-glow" aria-hidden="true" />

            <div className="pom-pack-wrapper" aria-hidden="true">
                <div className="pom-pack-spine" />
                <div className="pom-pack-body">
                    <div className="pom-pack-tab">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="pom-perf" />
                        ))}
                    </div>
                    <div className="pom-pack-face">
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" className="pom-pack-logo">
                            <circle cx="24" cy="24" r="21"
                                stroke="currentColor" strokeWidth="1" strokeOpacity=".35" />
                            <path d="M24 7l4 11h12l-9.5 7.5 3.5 11L24 30l-10 6.5 3.5-11L8 18h12z"
                                stroke="currentColor" strokeWidth="1.3" strokeOpacity=".55"
                                fill="none" strokeLinejoin="round" />
                        </svg>
                        <span className="pom-pack-season">25 · 26</span>
                        <span className="pom-pack-brand">Global Albums</span>
                    </div>
                </div>
            </div>

            <div className="pom-count-block">
                <span className="pom-count-n">{count}</span>
                <span className="pom-count-lbl">
                    {count === 1 ? 'sobre disponible' : 'sobres disponibles'}
                </span>
            </div>

            <button className="pom-cta" onClick={onOpen} disabled={count < 1}>
                Abrir sobre
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M2.5 6.5h8M7.5 3.5l3 3-3 3"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <p className="pom-hint">jugador · equipo · copa · evento</p>
        </div>
    );
}

function TearAnimation() {
    return (
        <div className="pom-tear-scene">
            <div className="pom-tear-pack">
                <div className="pom-tear-flap" />
                <div className="pom-tear-body">
                    <div className="pom-tear-beam" />
                </div>
            </div>
            <p className="pom-tear-lbl">Abriendo...</p>
        </div>
    );
}

/* ════════════════════════════════════════════════
   MODAL PRINCIPAL
════════════════════════════════════════════════ */
export default function PackOpeningModal({
    isOpen, phase, result, packsAvailable,
    isGoat, isLegend, onOpen, onClose, onReset,
}) {
    // Set of revealed card indices (0-3)
    const [revealedCards, setRevealedCards] = useState(new Set());
    // Whether cards have been "dealt" (animate in)
    const [dealt, setDealt] = useState(false);
    const overlayRef = useRef(null);

    const allRevealed = revealedCards.size === CARD_ORDER.length;

    // Reset reveal state when a new pack is opened
    useEffect(() => {
        if (phase === 'revealing') {
            setRevealedCards(new Set());
            setDealt(false);
            // Small delay so the DOM mounts before the deal animation fires
            const t = setTimeout(() => setDealt(true), 40);
            return () => clearTimeout(t);
        }
        if (phase === 'idle') {
            setRevealedCards(new Set());
            setDealt(false);
        }
    }, [phase]);

    // Once all cards are revealed, transition phase to 'done' after a short pause
    useEffect(() => {
        if (allRevealed && phase === 'revealing') {
            const t = setTimeout(() => {
                // The parent usePackOpening hook exposes setPhase via onReset/open chain;
                // here we trigger the parent's phase change by calling onReset indirectly.
                // If your hook exposes setPhase directly, call setPhase('done') instead.
                // This no-op re-render keeps local state intact; parent can listen via prop.
            }, 600);
            return () => clearTimeout(t);
        }
    }, [allRevealed, phase]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const cards = result
        ? CARD_ORDER.map(type => ({ type, card: result[type] }))
        : [];

    const handleReveal = (index) => {
        setRevealedCards(prev => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current && allRevealed) onClose();
    };

    const isShowingCards = phase === 'revealing' || phase === 'done';

    const titles = {
        idle: 'Apertura de sobre',
        animating: 'Abriendo...',
        revealing: isGoat ? '¡Figurita GOAT!' : 'Tus nuevas cartas',
        done: isGoat ? '¡Figurita GOAT!' : 'Tus nuevas cartas',
    };

    const subtitle = isShowingCards
        ? allRevealed
            ? '¡Sobre completado!'
            : `Toca cada carta para revelarla · ${revealedCards.size}/${CARD_ORDER.length}`
        : null;

    return (
        <div
            ref={overlayRef}
            className="pom-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Apertura de sobre"
        >
            <div className={`pom-modal${isGoat ? ' pom-modal--goat' : ''}`}>

                {/* HEADER */}
                <div className="pom-header">
                    <div className="pom-header-bar" />
                    <div className="pom-header-text">
                        <span className="pom-eyebrow">Global Albums · 25/26</span>
                        <span className="pom-title">{titles[phase] ?? titles.idle}</span>
                        {subtitle && (
                            <span className="pom-subtitle">{subtitle}</span>
                        )}
                    </div>
                    {allRevealed && (
                        <button className="pom-close" onClick={onClose} aria-label="Cerrar">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path d="M1 1l9 9M10 1L1 10"
                                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="pom-sep" />

                {/* BODY */}
                <div className="pom-body">
                    {phase === 'idle' && <PackVisual count={packsAvailable} onOpen={onOpen} />}
                    {phase === 'animating' && <TearAnimation />}

                    {isShowingCards && (
                        <div className="pom-stage">
                            {/* Table felt behind the cards */}
                            <TableFelt />

                            {isGoat && <div className="pom-goat-aura" aria-hidden="true" />}

                            <div className="pom-grid">
                                {cards.map(({ type, card }, i) => (
                                    <RevealCard
                                        key={type}
                                        type={type}
                                        card={card}
                                        index={i}
                                        dealt={dealt}
                                        isRevealed={revealedCards.has(i)}
                                        onReveal={() => handleReveal(i)}
                                        isGoat={isGoat}
                                    />
                                ))}
                            </div>

                            <ProgressDots
                                total={CARD_ORDER.length}
                                revealedSet={revealedCards}
                            />
                        </div>
                    )}
                </div>

                {/* ACCIONES — visible once all cards revealed */}
                {isShowingCards && allRevealed && (
                    <div className="pom-actions">
                        {packsAvailable > 1 && (
                            <button className="pom-btn-again" onClick={onReset}>
                                <span>Abrir otro</span>
                                <span className="pom-badge">{packsAvailable - 1}</span>
                            </button>
                        )}
                        <button className="pom-btn-collection" onClick={onClose}>
                            Ver mi colección
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}