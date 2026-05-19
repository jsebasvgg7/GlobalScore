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
   CARTA — mismo tamaño garantizado por CSS grid
   Inspirada en la imagen: borde top de color,
   imagen cuadrada que ocupa el cuerpo, footer limpio
════════════════════════════════════════════════ */
function RevealCard({ type, card, index, visible, isGoat }) {
    const color = TYPE_COLOR[type] || '#6C63FF';
    const isPlayer = type === 'player';
    const stars = isPlayer ? card?.significance_level : null;
    const imgUrl = card?.image_path ? getHistoricalImageUrl(card.image_path) : null;
    const isGoatCard = isGoat && isPlayer;

    return (
        <div
            className={`pom-card${visible ? ' pom-card--visible' : ''}${isGoatCard ? ' pom-card--goat' : ''}`}
            style={{ '--c': color, '--delay': `${index * 0.14}s` }}
        >
            {/* Franja superior de color — sello de tipo */}
            <div className="pom-card-topstrip" />

            {/* Etiqueta de tipo */}
            <span className="pom-card-type">{TYPE_LABEL[type]}</span>

            {/* Imagen cuadrada — ocupa el espacio central */}
            <div className="pom-card-media">
                {imgUrl
                    ? <img src={imgUrl} alt={card?.name || ''} className="pom-card-img" />
                    : <span className="pom-card-initials">{getInitials(card?.name)}</span>
                }
                {/* esquinas decorativas estilo álbum Panini */}
                <i className="pom-corner pom-corner--tl" aria-hidden="true" />
                <i className="pom-corner pom-corner--tr" aria-hidden="true" />
                <i className="pom-corner pom-corner--bl" aria-hidden="true" />
                <i className="pom-corner pom-corner--br" aria-hidden="true" />
            </div>

            {/* Footer: nombre + estrellas */}
            <div className="pom-card-footer">
                <span className="pom-card-name">{card?.name || '—'}</span>
                {stars && <StarRow level={stars} />}
            </div>

            {/* Brillo diagonal */}
            <div className="pom-card-gloss" aria-hidden="true" />

            {isGoatCard && <Particles />}
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
    const [revealedCount, setRevealedCount] = useState(0);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (phase === 'revealing') {
            setRevealedCount(0);
            const timers = CARD_ORDER.map((_, i) =>
                setTimeout(() => setRevealedCount(i + 1), 220 + i * 400)
            );
            return () => timers.forEach(clearTimeout);
        }
        if (phase === 'idle') setRevealedCount(0);
    }, [phase]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const cards = result
        ? CARD_ORDER.map(type => ({ type, card: result[type] }))
        : [];

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current && phase === 'done') onClose();
    };

    const titles = {
        idle: 'Apertura de sobre',
        animating: 'Abriendo...',
        revealing: isGoat ? '¡Figurita GOAT!' : 'Tus nuevas cartas',
        done: isGoat ? '¡Figurita GOAT!' : 'Tus nuevas cartas',
    };

    return (
        <div
            ref={overlayRef}
            className="pom-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <div className={`pom-modal${isGoat ? ' pom-modal--goat' : ''}`}>

                {/* HEADER */}
                <div className="pom-header">
                    <div className="pom-header-bar" />
                    <div className="pom-header-text">
                        <span className="pom-eyebrow">Global Albums · 25/26</span>
                        <span className="pom-title">{titles[phase] ?? titles.idle}</span>
                    </div>
                    {phase === 'done' && (
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

                    {(phase === 'revealing' || phase === 'done') && (
                        <div className="pom-stage">
                            {isGoat && <div className="pom-goat-aura" aria-hidden="true" />}
                            <div className="pom-grid">
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
                        </div>
                    )}
                </div>

                {/* ACCIONES */}
                {phase === 'done' && (
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