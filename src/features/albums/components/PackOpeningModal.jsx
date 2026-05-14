import React, { useEffect, useState, useRef } from 'react';
import { getHistoricalImageUrl } from '@/features/history/services/history.service';
import '../styles/PackOpeningModal.css';

const TYPE_LABEL = { player: 'JUGADOR', team: 'EQUIPO', competition: 'COPA', event: 'EVENTO' };
const TYPE_COLOR = { player: '#5b4fd8', team: '#1D9E75', competition: '#f59e0b', event: '#e55b5b' };
const CARD_ORDER = ['player', 'team', 'competition', 'event'];

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
}

function StarRow({ level }) {
    if (!level) return null;
    return (
        <div className="pom-stars">
            {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} className={`pom-star${n <= level ? ' pom-star--lit' : ''}`} viewBox="0 0 12 12">
                    <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9,11 6,9.5 3,11 3.5,7.5 1,5 4.5,4.5" />
                </svg>
            ))}
        </div>
    );
}

function Particles({ active }) {
    const particles = Array.from({ length: 24 }, (_, i) => i);
    if (!active) return null;
    return (
        <div className="pom-particles" aria-hidden="true">
            {particles.map(i => (
                <div
                    key={i}
                    className="pom-particle"
                    style={{
                        '--angle': `${(i / 24) * 360}deg`,
                        '--delay': `${(i % 6) * 0.07}s`,
                        '--dist': `${80 + Math.random() * 80}px`,
                        '--size': `${2 + Math.random() * 4}px`,
                    }}
                />
            ))}
        </div>
    );
}

function RevealCard({ type, card, index, visible, isGoat }) {
    const color = TYPE_COLOR[type] || '#5b4fd8';
    const isPlayer = type === 'player';
    const stars = isPlayer ? card?.significance_level : null;

    // Resolver la URL de imagen correctamente para todos los tipos de carta
    const resolvedImageUrl = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;

    return (
        <div
            className={`pom-card${visible ? ' pom-card--visible' : ''}${isGoat && isPlayer ? ' pom-card--goat' : ''}`}
            style={{ '--card-color': color, '--delay': `${index * 0.12}s` }}
        >
            <div className="pom-card-shine" />

            <div className="pom-card-inner">
                <div className="pom-card-top-bar" style={{ background: color }} />

                <div className="pom-card-type-label" style={{ color }}>
                    {TYPE_LABEL[type]}
                </div>

                <div className="pom-card-img-zone">
                    {resolvedImageUrl ? (
                        <img src={resolvedImageUrl} alt={card.name} className="pom-card-img" />
                    ) : (
                        <div className="pom-card-initials" style={{ color }}>
                            {getInitials(card?.name)}
                        </div>
                    )}
                    {isGoat && isPlayer && (
                        <div className="pom-card-goat-halo" />
                    )}
                </div>

                <div className="pom-card-info">
                    <span className="pom-card-name">{card?.name || '—'}</span>
                    {stars && <StarRow level={stars} />}
                </div>

                <div className="pom-card-bottom-bar" style={{ background: color }} />
            </div>

            {isGoat && isPlayer && <Particles active />}
        </div>
    );
}

function PackVisual({ count, onOpen }) {
    return (
        <div className="pom-pack-scene">
            <div className="pom-pack-wrapper">
                <div className="pom-pack-spine" />
                <div className="pom-pack-body">
                    <div className="pom-pack-texture" />
                    <div className="pom-pack-logo">
                        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="30" cy="30" r="28" className="pom-logo-ring" strokeWidth="1" />
                            <path d="M30 8 L36 22 L52 22 L39 32 L44 46 L30 38 L16 46 L21 32 L8 22 L24 22 Z"
                                className="pom-logo-star" strokeWidth="1.2" />
                            <circle cx="30" cy="30" r="4" className="pom-logo-dot" />
                        </svg>
                    </div>
                    <div className="pom-pack-season">TEMPORADA 25·26</div>
                    <div className="pom-pack-series">GLOBAL ALBUMS</div>
                    <div className="pom-pack-tear-line" />
                </div>
                <div className="pom-pack-tab">
                    <div className="pom-pack-perforation">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="pom-pack-perf-dot" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="pom-pack-count-label">
                <span className="pom-pack-count-n">{count}</span>
                <span className="pom-pack-count-txt">{count === 1 ? 'sobre disponible' : 'sobres disponibles'}</span>
            </div>

            <button className="pom-open-trigger" onClick={onOpen} disabled={count < 1}>
                <span>ABRIR SOBRE</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <p className="pom-pack-hint">4 figuritas · jugador · competición · equipo · evento</p>
        </div>
    );
}

function TearAnimation() {
    return (
        <div className="pom-tear-scene">
            <div className="pom-tear-pack">
                <div className="pom-tear-pack-body">
                    <div className="pom-tear-texture" />
                    <div className="pom-tear-light" />
                </div>
                <div className="pom-tear-top">
                    <div className="pom-tear-top-body" />
                </div>
                <div className="pom-tear-line-container">
                    <div className="pom-tear-beam" />
                </div>
            </div>
            <p className="pom-tear-label">Abriendo sobre...</p>
        </div>
    );
}

export default function PackOpeningModal({
    isOpen, phase, result, packsAvailable,
    isGoat, isLegend, onOpen, onClose, onReset,
}) {
    const [revealedCount, setRevealedCount] = useState(0);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (phase === 'revealing') {
            setRevealedCount(0);
            const timers = CARD_ORDER.map((_, i) =>
                setTimeout(() => setRevealedCount(i + 1), 300 + i * 450)
            );
            return () => timers.forEach(clearTimeout);
        }
        if (phase === 'idle') setRevealedCount(0);
    }, [phase]);

    if (!isOpen) return null;

    const cards = result ? CARD_ORDER.map(type => ({ type, card: result[type] })) : [];

    const overlayMod = isGoat ? ' pom-overlay--goat' : isLegend ? ' pom-overlay--legend' : '';

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current && phase === 'done') onClose();
    };

    return (
        <div ref={overlayRef} className={`pom-overlay${overlayMod}`} onClick={handleOverlayClick}>
            <div className={`pom-modal${isGoat ? ' pom-modal--goat' : ''}`}>

                <div className="pom-modal-header">
                    <div className="pom-modal-header-left">
                        <div className="pom-modal-spine" />
                        <div className="pom-modal-title-block">
                            <span className="pom-modal-eyebrow">GLOBAL ALBUMS · 25/26</span>
                            <span className="pom-modal-title">
                                {phase === 'idle' && 'APERTURA DE SOBRE'}
                                {phase === 'animating' && 'ABRIENDO...'}
                                {(phase === 'revealing' || phase === 'done') && (
                                    isGoat ? 'FIGURITA GOAT' : isLegend ? 'FIGURITA LEYENDA' : 'TUS FIGURITAS'
                                )}
                            </span>
                        </div>
                    </div>
                    {phase === 'done' && (
                        <button className="pom-modal-close" onClick={onClose} aria-label="Cerrar">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="pom-modal-bar" />

                <div className="pom-modal-body">
                    {phase === 'idle' && (
                        <PackVisual count={packsAvailable} onOpen={onOpen} />
                    )}

                    {phase === 'animating' && <TearAnimation />}

                    {(phase === 'revealing' || phase === 'done') && (
                        <div className="pom-cards-stage">
                            {isGoat && <div className="pom-goat-light" />}
                            {cards.map(({ type, card }, i) => (
                                <RevealCard
                                    key={type}
                                    type={type}
                                    card={card}
                                    index={i}
                                    visible={i < revealedCount}
                                    isGoat={isGoat}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {phase === 'done' && (
                    <div className="pom-modal-actions">
                        {packsAvailable > 1 && (
                            <button className="pom-btn-again" onClick={onReset}>
                                <span>ABRIR OTRO</span>
                                <span className="pom-btn-count">{packsAvailable - 1}</span>
                            </button>
                        )}
                        <button className="pom-btn-collection" onClick={onClose}>
                            VER MI COLECCIÓN
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}