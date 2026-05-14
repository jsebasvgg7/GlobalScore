import React from 'react';
import '../styles/AlbumCard.css';

const STAR_ICONS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

const FRAME_CLASS = {
    normal: '',
    silver: 'ac-frame--silver',
    gold: 'ac-frame--gold',
    legendary: 'ac-frame--legendary',
};

const TYPE_ICON = {
    player: '👤',
    team: '👥',
    competition: '🏆',
    event: '📅',
};

export default function AlbumCard({ card, collectionItem, empty = false, small = false }) {
    if (empty) {
        return (
            <div className={`ac-root ac-root--empty${small ? ' ac-root--small' : ''}`}>
                <span className="ac-empty-icon">?</span>
            </div>
        );
    }

    const frameClass = FRAME_CLASS[collectionItem?.frame_level ?? 'normal'];
    const stars = card?.significance_level;
    const isGoat = stars === 5;

    return (
        <div className={`ac-root ${frameClass}${small ? ' ac-root--small' : ''}${isGoat ? ' ac-root--goat' : ''}`}>
            <div className="ac-image-wrap">
                {card?.image_path ? (
                    <img src={card.image_path} alt={card.name} className="ac-image" />
                ) : (
                    <span className="ac-type-icon">{TYPE_ICON[card?.card_type] ?? '🃏'}</span>
                )}
            </div>

            <div className="ac-info">
                <span className="ac-name">{card?.name}</span>
                {stars && <span className="ac-stars">{STAR_ICONS[stars]}</span>}
            </div>

            {collectionItem && collectionItem.copies > 1 && (
                <span className="ac-copies">×{collectionItem.copies}</span>
            )}
        </div>
    );
}