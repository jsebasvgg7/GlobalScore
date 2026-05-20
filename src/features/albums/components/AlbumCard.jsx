import React from 'react';
import '../styles/AlbumCard.css';

const FRAME_CLASS = {
    normal: '',
    silver: 'ac-root--silver',
    gold: 'ac-root--gold',
    legendary: 'ac-root--legendary',
};

const TYPE_LABEL = {
    player: 'JUG',
    team: 'EQU',
    competition: 'COPA',
    event: 'EVT',
};

const TYPE_COLOR = {
    player: '#5b4fd8',
    team: '#1D9E75',
    competition: '#f59e0b',
    event: '#e55b5b',
};

const TYPE_GRADIENT = {
    player: 'linear-gradient(135deg, #3d34a5 0%, #7c6fe0 50%, #5b4fd8 100%)',
    team: 'linear-gradient(135deg, #0d6e50 0%, #2dc48a 50%, #1D9E75 100%)',
    competition: 'linear-gradient(135deg, #b45309 0%, #fbbf24 50%, #f59e0b 100%)',
    event: 'linear-gradient(135deg, #b83b3b 0%, #f87171 50%, #e55b5b 100%)',
};

function StarDots({ level, color }) {
    if (!level) return null;
    return (
        <div className="ac-stars-row">
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`ac-star${n <= level ? ' ac-star--lit' : ''}`}>★</span>
            ))}
        </div>
    );
}

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// Foil shimmer SVG overlay
function FoilOverlay() {
    return (
        <svg className="ac-foil" viewBox="0 0 80 120" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id="foil-h" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                    <stop offset="40%" stopColor="#fff" stopOpacity="0.07" />
                    <stop offset="60%" stopColor="#fff" stopOpacity="0.13" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect width="80" height="120" fill="url(#foil-h)" />
        </svg>
    );
}

export default function AlbumCard({ card, collectionItem, empty = false, small = false }) {
    if (empty) {
        return (
            <div className={`ac-root ac-root--empty${small ? ' ac-root--small' : ''}`}>
                {/* Número grande estilo Panini clásico */}
                <div className="ac-empty-number">
                    <svg className="ac-empty-sil" viewBox="0 0 60 80" fill="currentColor" aria-hidden="true">
                        {/* Silueta jugador */}
                        <ellipse cx="30" cy="18" rx="11" ry="11" opacity="0.18" />
                        <path d="M8 78 Q8 42 30 36 Q52 42 52 78Z" opacity="0.18" />
                        {/* Contorno punteado interior */}
                        <ellipse cx="30" cy="18" rx="11" ry="11" fill="none"
                            stroke="currentColor" strokeWidth="1.2"
                            strokeDasharray="3 2" opacity="0.35" />
                        <path d="M8 78 Q8 42 30 36 Q52 42 52 78Z" fill="none"
                            stroke="currentColor" strokeWidth="1.2"
                            strokeDasharray="3 2" opacity="0.35" />
                    </svg>
                </div>
                <div className="ac-empty-bottom">
                    <div className="ac-empty-stars-row">
                        {[1, 2, 3, 4].map(n => <span key={n} className="ac-star ac-star--empty">★</span>)}
                    </div>
                    <span className="ac-empty-label">???</span>
                </div>
            </div>
        );
    }

    const cardType = card?.card_type ?? 'player';
    const frameClass = FRAME_CLASS[collectionItem?.frame_level ?? 'normal'];
    const stars = card?.significance_level;
    const isGoat = stars === 5;
    const typeColor = TYPE_COLOR[cardType] ?? '#5b4fd8';
    const typeGradient = TYPE_GRADIENT[cardType] ?? TYPE_GRADIENT.player;
    const typeLabel = TYPE_LABEL[cardType] ?? '?';

    return (
        <div
            className={`ac-root ${frameClass}${small ? ' ac-root--small' : ''}${isGoat ? ' ac-root--goat' : ''}`}
            style={{ '--card-color': typeColor, '--card-gradient': typeGradient }}
        >
            {/* Banda superior con degradado */}
            <div className="ac-header-band">
                <div className="ac-type-tag">{typeLabel}</div>
                {isGoat && <span className="ac-goat-badge">GOAT</span>}
            </div>

            {/* Zona imagen con marco circular foil */}
            <div className="ac-image-section">
                <div className="ac-image-ring">
                    <div className="ac-image-wrap">
                        {card?.image_path ? (
                            <img src={card.image_path} alt={card.name} className="ac-image" />
                        ) : (
                            <div className="ac-initials">{getInitials(card?.name)}</div>
                        )}
                    </div>
                    {/* Anillo foil decorativo */}
                    <svg className="ac-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="50" r="46"
                            fill="none"
                            stroke="url(#ring-grad)"
                            strokeWidth="2.5"
                            strokeDasharray="8 3" />
                        <defs>
                            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={typeColor} stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#fff" stopOpacity="0.6" />
                                <stop offset="100%" stopColor={typeColor} stopOpacity="0.8" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {isGoat && <div className="ac-goat-halo" />}
                </div>
            </div>

            {/* Footer de la carta */}
            <div className="ac-footer-band">
                <StarDots level={stars} color={typeColor} />
                <span className="ac-name">{card?.name}</span>
                {card?.position && (
                    <span className="ac-position">{card.position.slice(0, 3).toUpperCase()}</span>
                )}
            </div>

            {/* Overlay foil shimmer */}
            <FoilOverlay />

            {collectionItem?.copies > 1 && (
                <span className="ac-copies">×{collectionItem.copies}</span>
            )}
        </div>
    );
}