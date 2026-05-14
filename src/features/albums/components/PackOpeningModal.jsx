import React, { useEffect, useState } from 'react';
import AlbumCard from './AlbumCard';
import '../styles/PackOpeningModal.css';

const CARD_ORDER = ['player', 'team', 'competition', 'event'];

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
    const [revealedCount, setRevealedCount] = useState(0);

    useEffect(() => {
        if (phase === 'revealing') {
            setRevealedCount(0);
            const timers = CARD_ORDER.map((_, i) =>
                setTimeout(() => setRevealedCount(i + 1), 400 + i * 600)
            );
            return () => timers.forEach(clearTimeout);
        }
        if (phase === 'idle') setRevealedCount(0);
    }, [phase]);

    if (!isOpen) return null;

    const cards = result
        ? [
            { type: 'player', card: result.player },
            { type: 'team', card: result.team },
            { type: 'competition', card: result.competition },
            { type: 'event', card: result.event },
        ]
        : [];

    const overlayClass = `pom-overlay${isGoat ? ' pom-overlay--goat' : isLegend ? ' pom-overlay--legend' : ''}`;

    return (
        <div className={overlayClass} onClick={(e) => e.target === e.currentTarget && phase === 'done' && onClose()}>
            <div className={`pom-modal${isGoat ? ' pom-modal--goat' : ''}`}>

                {/* Header */}
                <div className="pom-header">
                    <span className="pom-title">
                        {phase === 'idle' && '📦 Abrir Sobre'}
                        {phase === 'animating' && '✨ Abriendo...'}
                        {(phase === 'revealing' || phase === 'done') && (isGoat ? '🏆 ¡GOAT!' : isLegend ? '⭐ ¡Leyenda!' : '📦 Tus figuritas')}
                    </span>
                    {phase === 'done' && (
                        <button className="pom-close" onClick={onClose}>✕</button>
                    )}
                </div>

                {/* Idle state */}
                {phase === 'idle' && (
                    <div className="pom-idle">
                        <div className="pom-pack-icon">📦</div>
                        <p className="pom-packs-count">
                            {packsAvailable} {packsAvailable === 1 ? 'sobre disponible' : 'sobres disponibles'}
                        </p>
                        <p className="pom-idle-hint">Cada sobre contiene 4 figuritas: 1 jugador, 1 competición, 1 equipo y 1 evento.</p>
                        <button className="pom-btn-open" onClick={onOpen} disabled={packsAvailable < 1}>
                            Abrir sobre
                        </button>
                    </div>
                )}

                {/* Animating */}
                {phase === 'animating' && (
                    <div className="pom-animating">
                        <div className="pom-pack-anim">📦</div>
                    </div>
                )}

                {/* Revealing / done */}
                {(phase === 'revealing' || phase === 'done') && result && (
                    <div className="pom-cards">
                        {isGoat && <div className="pom-goat-burst" />}
                        {cards.map(({ type, card }, i) => (
                            <div
                                key={type}
                                className={`pom-card-wrap${i < revealedCount ? ' pom-card-wrap--visible' : ''}`}
                                style={{ transitionDelay: `${i * 0.05}s` }}
                            >
                                {card ? (
                                    <AlbumCard card={card} collectionItem={null} />
                                ) : (
                                    <AlbumCard empty />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Done actions */}
                {phase === 'done' && (
                    <div className="pom-actions">
                        {packsAvailable > 1 && (
                            <button className="pom-btn-again" onClick={onReset}>
                                Abrir otro ({packsAvailable - 1} restantes)
                            </button>
                        )}
                        <button className="pom-btn-close-text" onClick={onClose}>Ver mi colección</button>
                    </div>
                )}

            </div>
        </div>
    );
}