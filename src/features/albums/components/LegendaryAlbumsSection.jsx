import React from 'react';
import '../styles/LegendaryAlbumsSection.css';

const ALBUM_META = {
    legendary_1: { label: 'Legendarios I', req: '30 jugadores únicos · mín. 5 de ⭐⭐⭐⭐' },
    legendary_2: { label: 'Legendarios II', req: '30 jugadores · 5×⭐⭐⭐⭐ + 2×⭐⭐⭐⭐⭐' },
    legendary_3: { label: 'Legendarios III', req: '30 jugadores · 5×⭐⭐⭐⭐ + 4×⭐⭐⭐⭐⭐' },
    golden_album: { label: 'Álbum Dorado', req: '15 jugadores únicos · todos de ⭐⭐⭐⭐+' },
};

const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];

export default function LegendaryAlbumsSection({ definitions, progress, collection }) {
    const playerCollection = collection.filter(c => c.card?.card_type === 'player');
    const uniquePlayers = playerCollection.length;
    const stars4Plus = playerCollection.filter(c => c.card?.significance_level >= 4).length;
    const stars5 = playerCollection.filter(c => c.card?.significance_level === 5).length;

    const getProgressData = (albumId) => {
        const prog = progress.find(p => p.album_id === albumId);
        const def = definitions.find(d => d.id === albumId);
        return { prog, def };
    };

    const isUnlocked = (albumId) => {
        const idx = ORDER.indexOf(albumId);
        if (idx === 0) return true;
        const prevId = ORDER[idx - 1];
        const prev = progress.find(p => p.album_id === prevId);
        return prev?.is_completed ?? false;
    };

    return (
        <div className="las-root">
            {ORDER.map((albumId) => {
                const { prog, def } = getProgressData(albumId);
                const unlocked = isUnlocked(albumId);
                const isGolden = albumId === 'golden_album';
                const meta = ALBUM_META[albumId];

                const reqPlayers = def?.required_unique_players ?? 0;
                const reqStars4 = def?.required_min_stars_4 ?? 0;
                const reqStars5 = def?.required_min_stars_5 ?? 0;

                const playersFill = reqPlayers ? Math.min(100, Math.round((uniquePlayers / reqPlayers) * 100)) : 0;

                return (
                    <div
                        key={albumId}
                        className={`las-card${!unlocked ? ' las-card--locked' : ''}${isGolden ? ' las-card--golden' : ''}${prog?.is_completed ? ' las-card--done' : ''}`}
                    >
                        <div className="las-card-header">
                            <div className="las-card-title-row">
                                <span className="las-card-icon">{isGolden ? '🏆' : '📖'}</span>
                                <span className="las-card-name">{meta.label}</span>
                                {prog?.is_completed && <span className="las-completed-badge">✓ Completado</span>}
                                {!unlocked && <span className="las-locked-badge">🔒 Bloqueado</span>}
                            </div>
                            <p className="las-card-req">{meta.req}</p>
                        </div>

                        {unlocked && (
                            <div className="las-progress-section">
                                <div className="las-progress-row">
                                    <span className="las-progress-label">Jugadores únicos</span>
                                    <span className="las-progress-value">
                                        {Math.min(uniquePlayers, reqPlayers || uniquePlayers)}/{reqPlayers || '—'}
                                    </span>
                                </div>
                                <div className="las-bar-wrap">
                                    <div className="las-bar-fill" style={{ width: `${playersFill}%` }} />
                                </div>

                                {reqStars4 > 0 && (
                                    <div className="las-stars-row">
                                        <span className={`las-stars-chip${stars4Plus >= reqStars4 ? ' las-stars-chip--met' : ''}`}>
                                            ⭐⭐⭐⭐ {stars4Plus}/{reqStars4}
                                        </span>
                                        {reqStars5 > 0 && (
                                            <span className={`las-stars-chip${stars5 >= reqStars5 ? ' las-stars-chip--met' : ''}`}>
                                                ⭐⭐⭐⭐⭐ {stars5}/{reqStars5}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {def?.reward_title && (
                                    <div className="las-reward">
                                        🎁 <span>{def.reward_description}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}