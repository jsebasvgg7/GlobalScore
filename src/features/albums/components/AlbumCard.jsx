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

function StarDots({ level }) {
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

export default function AlbumCard({ card, collectionItem, empty = false, small = false }) {
    if (empty) {
        return (
            <div className={`ac-root ac-root--empty${small ? ' ac-root--small' : ''}`}>
                <svg className="ac-empty-sil" viewBox="0 0 40 60" fill="currentColor" aria-hidden="true">
                    <ellipse cx="20" cy="13" rx="9" ry="9" />
                    <path d="M4 56 Q4 30 20 27 Q36 30 36 56Z" />
                </svg>
                <div className="ac-empty-stars">
                    {[1, 2, 3, 4].map(n => <span key={n} className="ac-star">★</span>)}
                </div>
            </div>
        );
    }

    const cardType = card?.card_type ?? 'player';
    const frameClass = FRAME_CLASS[collectionItem?.frame_level ?? 'normal'];
    const stars = card?.significance_level;
    const isGoat = stars === 5;
    const typeColor = TYPE_COLOR[cardType] ?? '#5b4fd8';
    const typeLabel = TYPE_LABEL[cardType] ?? '?';

    return (
        <div
            className={`ac-root ${frameClass}${small ? ' ac-root--small' : ''}${isGoat ? ' ac-root--goat' : ''}`}
            style={{ '--card-color': typeColor }}
        >
            <div className="ac-top-bar" />

            <div className="ac-type-tag">{typeLabel}</div>

            <div className="ac-image-wrap">
                {card?.image_path ? (
                    <img src={card.image_path} alt={card.name} className="ac-image" />
                ) : (
                    <div className="ac-initials">{getInitials(card?.name)}</div>
                )}
                {isGoat && <div className="ac-goat-halo" />}
            </div>

            <div className="ac-info">
                <span className="ac-name">{card?.name}</span>
                <StarDots level={stars} />
            </div>

            <div className="ac-bottom-bar" />

            {collectionItem?.copies > 1 && (
                <span className="ac-copies">×{collectionItem.copies}</span>
            )}
        </div>
    );
}