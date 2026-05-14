import React, { useState } from 'react';
import '../styles/LegendaryAlbumsSection.css';

const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'golden_album'];

const ALBUM_META = {
    legendary_1: {
        label: 'Legendarios I',
        shortLabel: 'LEG I',
        req: '30 jugadores · mín. 5 de ⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 0,
        spine: '#5b4fd8',
        accent: '#a599d9',
        tag: 'TEMPORADA 25·26',
        number: '01',
    },
    legendary_2: {
        label: 'Legendarios II',
        shortLabel: 'LEG II',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 2×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 2,
        spine: '#7c3aed',
        accent: '#c4b5fd',
        tag: 'TEMPORADA 25·26',
        number: '02',
    },
    legendary_3: {
        label: 'Legendarios III',
        shortLabel: 'LEG III',
        req: '30 jugadores · 5×⭐⭐⭐⭐ + 4×⭐⭐⭐⭐⭐',
        slots: 30,
        minStars4: 5,
        minStars5: 4,
        spine: '#1D9E75',
        accent: '#34d399',
        tag: 'TEMPORADA 25·26',
        number: '03',
    },
    golden_album: {
        label: 'Álbum Dorado',
        shortLabel: 'DORADO',
        req: '15 jugadores · todos de ⭐⭐⭐⭐+',
        slots: 15,
        minStars4: 15,
        minStars5: 0,
        spine: '#b45309',
        accent: '#f59e0b',
        tag: 'ESPECIAL',
        number: '✦',
        golden: true,
    },
};

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function posLabel(pos) {
    const map = { Forward: 'DEL', Midfielder: 'MED', Defender: 'DEF', Goalkeeper: 'POR', 'Play-maker': 'MP', 'All-rounder': 'TOD' };
    return map[pos] || pos?.slice(0, 3).toUpperCase() || '—';
}

/* ════════════════════════════════════════════════
   FIGURITA individual — dentro del panel
════════════════════════════════════════════════ */
function Sticker({ index, card, collectionItem, meta }) {
    const num = String(index + 1).padStart(2, '0');
    const isGoat = card?.significance_level === 5;
    const filled = !!collectionItem;

    if (filled) {
        return (
            <div
                className={`las-sticker las-sticker--filled${isGoat ? ' las-sticker--goat' : ''}`}
                style={{ '--acc': meta.accent }}
            >
                <span className="las-sticker-num">{num}</span>
                {isGoat && <span className="las-sticker-crown">♛</span>}
                <div className="las-sticker-img-zone">
                    {card?.image_path
                        ? <img src={card.image_path} alt={card.name} className="las-sticker-img" />
                        : <div className="las-sticker-avatar">{getInitials(card?.name)}</div>
                    }
                </div>
                <div className="las-sticker-info">
                    <span className="las-sticker-name">{card?.name}</span>
                    {card?.position && <span className="las-sticker-pos">{posLabel(card.position)}</span>}
                </div>
                {collectionItem?.copies > 1 && (
                    <span className="las-sticker-copies">×{collectionItem.copies}</span>
                )}
            </div>
        );
    }

    return (
        <div className="las-sticker las-sticker--empty" style={{ '--acc': meta.accent }}>
            <span className="las-sticker-num">{num}</span>
            <svg className="las-sticker-sil" viewBox="0 0 40 60" fill="currentColor" aria-hidden="true">
                <ellipse cx="20" cy="13" rx="9" ry="9" />
                <path d="M4 56 Q4 30 20 27 Q36 30 36 56Z" />
            </svg>
            <div className="las-sticker-stars-row">
                {[1, 2, 3, 4].map(n => <span key={n} className="las-star-dot">★</span>)}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════
   PANEL FLOTANTE — se abre sobre la página
════════════════════════════════════════════════ */
function AlbumPanel({ albumId, meta, definitions, progress, collection, onClose }) {
    const [page, setPage] = useState(0);
    const PER_PAGE = 6;

    const def = definitions.find(d => d.id === albumId);
    const prog = progress.find(p => p.album_id === albumId);
    const isCompleted = prog?.is_completed ?? false;

    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const reqStars4 = def?.required_min_stars_4 ?? meta.minStars4;
    const reqStars5 = def?.required_min_stars_5 ?? meta.minStars5;
    const stars4 = playerCol.filter(c => c.card?.significance_level >= 4).length;
    const stars5count = playerCol.filter(c => c.card?.significance_level === 5).length;
    const filled = Math.min(playerCol.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;

    const totalPages = Math.ceil(meta.slots / PER_PAGE);
    const pageItems = Array.from({ length: PER_PAGE }, (_, i) => {
        const gi = page * PER_PAGE + i;
        if (gi >= meta.slots) return null;
        return { idx: gi, item: playerCol[gi] ?? null };
    }).filter(Boolean);

    return (
        <>
            {/* Overlay semitransparente */}
            <div className="las-panel-overlay" onClick={onClose} />

            {/* Panel lateral */}
            <div className="las-panel" style={{ '--spine': meta.spine, '--acc': meta.accent }}>

                {/* Cabecera del panel */}
                <div className="las-panel-header">
                    <div className="las-panel-spine" />
                    <div className="las-panel-header-content">
                        <div className="las-panel-title-block">
                            <span className="las-panel-tag">{meta.tag}</span>
                            <span className="las-panel-title">{meta.label}</span>
                            <span className="las-panel-req">{meta.req}</span>
                        </div>
                        <div className="las-panel-counter-block">
                            <span className="las-panel-count-n">{filled}</span>
                            <span className="las-panel-count-sep">/</span>
                            <span className="las-panel-count-t">{reqPlayers}</span>
                        </div>
                    </div>
                    <button className="las-panel-close" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>

                {/* Barra de progreso */}
                <div className="las-panel-bar">
                    <div className="las-panel-bar-fill" style={{ width: `${pct}%` }} />
                </div>

                {/* Chips de requisitos */}
                <div className="las-panel-chips">
                    <span className={`las-chip${stars4 >= reqStars4 ? ' las-chip--met' : ''}`}>
                        ⭐⭐⭐⭐ {Math.min(stars4, reqStars4)}/{reqStars4}
                    </span>
                    {reqStars5 > 0 && (
                        <span className={`las-chip${stars5count >= reqStars5 ? ' las-chip--met' : ''}`}>
                            ⭐⭐⭐⭐⭐ {Math.min(stars5count, reqStars5)}/{reqStars5}
                        </span>
                    )}
                    <span className="las-chip las-chip--pct">{pct}% completado</span>
                    {isCompleted && <span className="las-chip las-chip--done">✓ Completado</span>}
                </div>

                {/* Página del álbum */}
                <div className="las-panel-scroll">
                    <div className="las-album-page">
                        {/* Encabezado de página */}
                        <div className="las-page-header">
                            <div className="las-page-line" />
                            <span className="las-page-label">Página {String(page + 1).padStart(2, '0')}</span>
                            <div className="las-page-line" />
                        </div>

                        {/* Grid de figuritas 3 × 2 */}
                        <div className="las-sticker-grid">
                            {pageItems.map(({ idx, item }) => (
                                <Sticker
                                    key={idx}
                                    index={idx}
                                    card={item?.card ?? null}
                                    collectionItem={item ?? null}
                                    meta={meta}
                                />
                            ))}
                            {Array.from({ length: PER_PAGE - pageItems.length }).map((_, i) => (
                                <div key={`ph-${i}`} className="las-sticker-phantom" />
                            ))}
                        </div>

                        {/* Paginación */}
                        <div className="las-pagination">
                            <button
                                className="las-page-btn"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >‹</button>
                            <div className="las-page-dots">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`las-page-dot${i === page ? ' las-page-dot--active' : ''}`}
                                        onClick={() => setPage(i)}
                                    />
                                ))}
                            </div>
                            <button
                                className="las-page-btn"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                            >›</button>
                        </div>
                    </div>

                    {def?.reward_description && (
                        <div className="las-reward-bar">
                            <span>🎁</span>
                            <span>{def.reward_description}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

/* ════════════════════════════════════════════════
   LIBRO — tarjeta en la fila horizontal
════════════════════════════════════════════════ */
function AlbumBook({ albumId, meta, definitions, progress, collection, locked }) {
    const [panelOpen, setPanelOpen] = useState(false);

    const def = definitions.find(d => d.id === albumId);
    const playerCol = collection.filter(c => c.card?.card_type === 'player');
    const reqPlayers = def?.required_unique_players ?? meta.slots;
    const filled = Math.min(playerCol.length, reqPlayers);
    const pct = reqPlayers > 0 ? Math.min(100, Math.round((filled / reqPlayers) * 100)) : 0;
    const isCompleted = progress.find(p => p.album_id === albumId)?.is_completed ?? false;

    return (
        <>
            <button
                className={`las-book${locked ? ' las-book--locked' : ''}${isCompleted ? ' las-book--done' : ''}${meta.golden ? ' las-book--golden' : ''}`}
                style={{ '--spine': meta.spine, '--acc': meta.accent }}
                onClick={() => !locked && setPanelOpen(true)}
                aria-disabled={locked}
            >
                {/* Lomo */}
                <div className="las-book-spine">
                    <span className="las-book-spine-num">{meta.number}</span>
                    <span className="las-book-spine-lbl">{meta.shortLabel}</span>
                </div>

                {/* Portada */}
                <div className="las-book-cover">
                    <div className="las-book-grid-bg" />

                    <div className="las-book-tag">
                        {locked ? '🔒 BLOQUEADO' : meta.tag}
                    </div>

                    <div className="las-book-title-block">
                        <span className="las-book-icon">{meta.golden ? '✦' : '📖'}</span>
                        <span className="las-book-title">{meta.label}</span>
                    </div>

                    {/* Mini preview — 6 slots */}
                    {!locked ? (
                        <div className="las-book-preview">
                            {Array.from({ length: 6 }).map((_, i) => {
                                const item = playerCol[i];
                                return (
                                    <div key={i} className={`las-book-slot${item ? ' las-book-slot--filled' : ''}`}>
                                        {item?.card?.image_path
                                            ? <img src={item.card.image_path} alt="" />
                                            : item
                                                ? <span>{getInitials(item.card?.name)}</span>
                                                : null
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="las-book-locked-hint">
                            Completa el álbum anterior para desbloquear
                        </div>
                    )}

                    {/* Footer */}
                    <div className="las-book-footer">
                        <div className="las-book-pbar">
                            <div className="las-book-pbar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="las-book-footer-row">
                            <span className="las-book-count">{filled}/{reqPlayers}</span>
                            {isCompleted && <span className="las-book-done">✓</span>}
                            {!locked && <span className="las-book-hint">Abrir →</span>}
                        </div>
                    </div>
                </div>
            </button>

            {panelOpen && (
                <AlbumPanel
                    albumId={albumId}
                    meta={meta}
                    definitions={definitions}
                    progress={progress}
                    collection={collection}
                    onClose={() => setPanelOpen(false)}
                />
            )}
        </>
    );
}

/* ════════════════════════════════════════════════
   EXPORT PRINCIPAL
════════════════════════════════════════════════ */
export default function LegendaryAlbumsSection({ definitions, progress, collection }) {
    const isUnlocked = (albumId) => {
        const idx = ORDER.indexOf(albumId);
        if (idx === 0) return true;
        const prev = progress.find(p => p.album_id === ORDER[idx - 1]);
        return prev?.is_completed ?? false;
    };

    return (
        <div className="las-root">
            <div className="las-eyebrow">
                <span>Álbumes Legendarios</span>
                <div className="las-eyebrow-line" />
                <span className="las-eyebrow-count">4 álbumes</span>
            </div>

            {/* Fila horizontal 4 × 1 */}
            <div className="las-books-row">
                {ORDER.map(albumId => (
                    <AlbumBook
                        key={albumId}
                        albumId={albumId}
                        meta={ALBUM_META[albumId]}
                        definitions={definitions}
                        progress={progress}
                        collection={collection}
                        locked={!isUnlocked(albumId)}
                    />
                ))}
            </div>
        </div>
    );
}