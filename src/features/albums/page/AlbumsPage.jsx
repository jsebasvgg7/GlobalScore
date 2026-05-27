import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Package, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import { useAlbumCollection } from '../hooks/useAlbumCollection';
import { useAlbumProgress } from '../hooks/useAlbumProgress';
import { useAlbumDefinitions } from '../hooks/useAlbumDefinitions';
import { usePackOpening } from '../hooks/usePackOpening';
import { computeAndSyncAlbumProgress } from '../services/albums.service';
import AlbumsPageNav from '../components/AlbumsPageNav';
import AlbumsSectionNav from '../components/AlbumsSectionNav';
import LegendaryAlbumsSection from '../components/LegendaryAlbumsSection';
import StarCollectionSection from '../components/StarCollectionSection';
import CultAlbumsSection from '../components/CultAlbumsSection';
import PackOpeningModal from '../components/PackOpeningModal';
import { useAlbumCards } from '../hooks/useAlbumCards';
import './AlbumsPage.css';

// ─────────────────────────────────────────────────────────────
// Metadata idéntica a LegendaryAlbumsSection (para el AlbumBook)
// ─────────────────────────────────────────────────────────────
const ALBUM_META = {
    legendary_1: {
        label: 'Foundations', shortLabel: 'LEG I', subtitle: 'FOUNDATIONS',
        spine: '#5b4fd8', spineAlt: '#3d34a5', accent: '#a599d9', accentRgb: '165,153,217',
        tag: 'TEMPORADA 25·26', number: '01', coverBg: '#1a1726', rarityLevel: 3, rarityLabel: 'FUNDACIÓN',
    },
    legendary_2: {
        label: 'Rising Legends', shortLabel: 'LEG II', subtitle: 'RISING LEGENDS',
        spine: '#7c3aed', spineAlt: '#5b1fbd', accent: '#c4b5fd', accentRgb: '196,181,253',
        tag: 'TEMPORADA 25·26', number: '02', coverBg: '#160e2a', rarityLevel: 4, rarityLabel: 'LEYENDA+',
    },
    legendary_3: {
        label: 'Historical Depth', shortLabel: 'LEG III', subtitle: 'HISTORICAL DEPTH',
        spine: '#1D9E75', spineAlt: '#0d6e50', accent: '#34d399', accentRgb: '52,211,153',
        tag: 'TEMPORADA 25·26', number: '03', coverBg: '#0a1f18', rarityLevel: 5, rarityLabel: 'ÉLITE',
    },
    legendary_4: {
        label: 'Elite Construction', shortLabel: 'LEG IV', subtitle: 'ELITE CONSTRUCTION',
        spine: '#b45309', spineAlt: '#7c3b00', accent: '#f59e0b', accentRgb: '245,158,11',
        tag: 'TEMPORADA 25·26', number: '04', coverBg: '#1a1200', rarityLevel: 5, rarityLabel: 'GOAT',
    },
    legendary_5: {
        label: 'The Immortals', shortLabel: 'LEG V', subtitle: 'THE IMMORTALS',
        spine: '#9d174d', spineAlt: '#6b1130', accent: '#f472b6', accentRgb: '244,114,182',
        tag: 'ENDGAME', number: '05', coverBg: '#1a0e15', rarityLevel: 5, rarityLabel: 'INMORTAL',
    },
};

const LEG_ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'legendary_4', 'legendary_5'];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getActiveAlbum(legendary, progress) {
    if (!legendary?.length) return null;
    const active = legendary.find(def => {
        const p = progress?.find(pr => pr.album_id === def.id);
        return !p?.is_completed;
    });
    return active || legendary[legendary.length - 1];
}

function getAlbumProgress(albumId, progress) {
    return progress?.find(p => p.album_id === albumId) ?? null;
}

// ─────────────────────────────────────────────────────────────
// Variantes de animación
// ─────────────────────────────────────────────────────────────
const panelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.28, ease: 'easeOut', delay: i * 0.06 },
    }),
};

// ─────────────────────────────────────────────────────────────
// ActiveAlbumBook  — replica visual del libro del álbum activo
// ─────────────────────────────────────────────────────────────
function ActiveAlbumBook({ albumId, pct, filled, total }) {
    const meta = ALBUM_META[albumId];
    if (!meta) return null;

    return (
        <div className="alp-active-book">
            {/* Hojas apiladas detrás */}
            <div className="alp-active-book-pages">
                {[2, 1, 0].map(i => (
                    <div key={i} className="alp-active-book-leaf"
                        style={{ '--li': i, '--acc': meta.accent }} />
                ))}
            </div>

            {/* Libro principal */}
            <div className="alp-active-book-body"
                style={{
                    '--spine': meta.spine,
                    '--spine-alt': meta.spineAlt,
                    '--acc': meta.accent,
                    '--acc-rgb': meta.accentRgb,
                    '--cover-bg': meta.coverBg,
                }}>

                {/* Lomo */}
                <div className="alp-active-book-spine">
                    <span className="alp-active-book-spine-num">{meta.number}</span>
                    <span className="alp-active-book-spine-label">{meta.shortLabel}</span>
                </div>

                {/* Portada */}
                <div className="alp-active-book-cover">
                    {/* Tag */}
                    <div className="alp-active-book-tag">{meta.tag}</div>

                    {/* Esquinas doradas */}
                    {['tl', 'tr', 'bl', 'br'].map(pos => (
                        <div key={pos} className={`alp-active-book-corner alp-active-book-corner--${pos}`} />
                    ))}

                    {/* Broche */}
                    <div className="alp-active-book-clasp">
                        <div className="alp-active-book-clasp-strap alp-active-book-clasp-strap--top" />
                        <div className="alp-active-book-clasp-buckle">
                            <div className="alp-active-book-clasp-inner" />
                        </div>
                        <div className="alp-active-book-clasp-strap alp-active-book-clasp-strap--bot" />
                    </div>

                    {/* Ilustración central */}
                    <div className="alp-active-book-art">
                        <svg viewBox="0 0 80 90" fill="none" className="alp-active-book-art-svg">
                            <circle cx="40" cy="42" r="28"
                                stroke={meta.accent} strokeOpacity="0.2" strokeWidth="1" />
                            <circle cx="40" cy="42" r="20"
                                stroke={meta.accent} strokeOpacity="0.35" strokeWidth="0.8" />
                            {/* Escudo */}
                            <path d="M40 22 L54 28 L54 44 C54 54 40 60 40 60 C40 60 26 54 26 44 L26 28 Z"
                                fill={meta.accent} fillOpacity="0.15"
                                stroke={meta.accent} strokeOpacity="0.5" strokeWidth="1" />
                            <circle cx="40" cy="42" r="6"
                                fill={meta.accent} fillOpacity="0.25" />
                            {/* Estrellas */}
                            {Array.from({ length: Math.min(meta.rarityLevel, 5) }, (_, i) => {
                                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                                const r = 14;
                                return (
                                    <circle key={i}
                                        cx={40 + Math.cos(angle) * r}
                                        cy={42 + Math.sin(angle) * r}
                                        r="1.5"
                                        fill={meta.accent} fillOpacity="0.7" />
                                );
                            })}
                        </svg>
                    </div>

                    {/* Footer con barra */}
                    <div className="alp-active-book-footer">
                        <span className="alp-active-book-count">{filled} / {total} ITEMS</span>
                        <div className="alp-active-book-bar">
                            <div className="alp-active-book-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                    </div>

                    {/* Rareza */}
                    <div className="alp-active-book-rarity">
                        <div className="alp-active-book-rarity-stars">
                            {Array.from({ length: meta.rarityLevel }, (_, i) => <span key={i}>★</span>)}
                        </div>
                        <span className="alp-active-book-rarity-label">{meta.rarityLabel}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// BoostProgressBar
// ─────────────────────────────────────────────────────────────
function BoostProgressBar({ boostActive, boostPacksRemaining, packsOpenedSinceLast = 0 }) {
    const PACKS_PER_BOOST = 10;
    const progress = boostActive ? 100 : Math.min((packsOpenedSinceLast / PACKS_PER_BOOST) * 100, 100);
    const milestones = [
        { pos: 25, label: '10 Sobre\nPremium' },
        { pos: 50, label: '20 Boost\nÉpico' },
        { pos: 75, label: '30 Sobre\nÉlite' },
        { pos: 100, label: '40 Álbum\nEspecial' },
    ];
    return (
        <div className={`alp-boost-bar${boostActive ? ' alp-boost-bar--active' : ''}`}>
            <div className="alp-boost-bar-header">
                <span className="alp-boost-bar-eyebrow">Camino de temporada</span>
                <button className="alp-boost-bar-ver">Ver todo →</button>
            </div>
            <div className="alp-boost-milestones">
                {milestones.map((m, i) => {
                    const passed = progress >= m.pos;
                    const current = !passed && (i === 0 ? progress > 0 : progress >= milestones[i - 1].pos);
                    return (
                        <div key={m.pos} className={`alp-boost-milestone${passed ? ' alp-boost-milestone--passed' : ''}${current ? ' alp-boost-milestone--current' : ''}`}>
                            <div className="alp-boost-milestone-dot">
                                {passed
                                    ? <span className="alp-boost-milestone-check">✓</span>
                                    : <span className="alp-boost-milestone-num">{m.pos}</span>
                                }
                            </div>
                            <span className="alp-boost-milestone-label">{m.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="alp-boost-track-wrap">
                <div className="alp-boost-track">
                    <div className="alp-boost-fill" style={{ width: `${progress}%` }}>
                        <div className="alp-boost-fill-shimmer" />
                    </div>
                </div>
            </div>
            <div className="alp-boost-info-row">
                {boostActive ? (
                    <>
                        <span className="alp-boost-active-tag">⚡ BOOST ACTIVO</span>
                        <span className="alp-boost-packs-left">
                            <strong>{boostPacksRemaining}</strong> / 5 sobres restantes
                        </span>
                    </>
                ) : (
                    <>
                        <span className="alp-boost-inactive-tag">Próximo boost</span>
                        <span className="alp-boost-packs-left">
                            <strong>{PACKS_PER_BOOST - packsOpenedSinceLast}</strong> sobres para boost
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Pack3D
// ─────────────────────────────────────────────────────────────
function Pack3D({ count, onClick }) {
    return (
        <div className="alp-pack3d-wrap">
            <div className="alp-pack3d-stack">
                <div className="alp-pack3d-shadow alp-pack3d-shadow--3" />
                <div className="alp-pack3d-shadow alp-pack3d-shadow--2" />
                <div className="alp-pack3d-main">
                    <svg viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="alp-pack3d-svg">
                        <defs>
                            <linearGradient id="packGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#7B6FE8" />
                                <stop offset="100%" stopColor="#4a3fc7" />
                            </linearGradient>
                            <linearGradient id="packShine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>
                            <linearGradient id="packTab" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#5b4fd8" />
                                <stop offset="100%" stopColor="#8b7fc7" />
                            </linearGradient>
                        </defs>
                        <ellipse cx="45" cy="112" rx="30" ry="5" fill="rgba(91,79,216,0.25)" />
                        <rect x="8" y="22" width="74" height="90" rx="6" fill="url(#packGrad)" />
                        <rect x="8" y="22" width="74" height="90" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        <rect x="8" y="22" width="74" height="24" rx="6" fill="url(#packTab)" />
                        <rect x="8" y="34" width="74" height="12" fill="url(#packTab)" />
                        <line x1="8" y1="46" x2="82" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 3" />
                        <line x1="22" y1="22" x2="22" y2="112" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                        {[58, 68, 78, 88, 98].map(y => (
                            <line key={y} x1="28" y1={y} x2="76" y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                        ))}
                        <path d="M45 54 L56 59 L56 70 C56 76 45 81 45 81 C45 81 34 76 34 70 L34 59 Z"
                            fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                        <circle cx="45" cy="67" r="4" fill="rgba(255,255,255,0.2)" />
                        <rect x="8" y="22" width="38" height="90" rx="6" fill="url(#packShine)" />
                        <circle cx="68" cy="32" r="1.5" fill="rgba(255,255,255,0.6)" />
                        <circle cx="75" cy="38" r="1" fill="rgba(255,255,255,0.4)" />
                        <circle cx="63" cy="40" r="0.8" fill="rgba(255,255,255,0.3)" />
                    </svg>
                </div>
            </div>
            <div className="alp-pack3d-info">
                <div className="alp-pack3d-count-row">
                    <span className="alp-pack3d-label">Sobres disponibles</span>
                    <span className="alp-pack3d-badge">{count}</span>
                </div>
                <p className="alp-pack3d-desc">
                    {count > 0
                        ? `Tienes ${count} ${count === 1 ? 'sobre listo' : 'sobres listos'} para abrir.`
                        : 'No hay sobres disponibles. ¡Sigue jugando para ganar más!'}
                </p>
                {count > 0 && (
                    <button className="alp-pack3d-btn" onClick={onClick}>
                        <Package size={15} strokeWidth={2} />
                        Abrir sobres
                    </button>
                )}
                <button className="alp-pack3d-rarity-link">Ver probabilidad de rarezas →</button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// AlbumsCarousel — flechas navegan entre secciones, muestra
// los componentes reales sin su navbar interna
// ─────────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'legendary', label: 'Tus Álbumes Legendary' },
    { id: 'stars', label: 'Tus Álbumes Stars' },
    { id: 'cult', label: 'Tus Álbumes Cult' },
];

function AlbumsCarousel({ legendary, progress, collection, allCards, cult, currentUserId, collectionLoading }) {
    const [sectionIdx, setSectionIdx] = useState(0);
    const section = SECTIONS[sectionIdx];

    const totalLeg = legendary?.length ?? 0;
    const totalStars = 5; // StarCollectionSection tiene 5 tiers fijos
    const totalCult = cult?.length ?? 0;
    const totals = [totalLeg, totalStars, totalCult];

    const handlePrev = () => setSectionIdx(i => (i - 1 + SECTIONS.length) % SECTIONS.length);
    const handleNext = () => setSectionIdx(i => (i + 1) % SECTIONS.length);

    return (
        <div className="alp-carousel">
            {/* ── Header ── */}
            <div className="alp-carousel-header">
                <span className="alp-carousel-title">{section.label}</span>
                <div className="alp-carousel-nav">
                    <span className="alp-carousel-count">{totals[sectionIdx]} Álbumes</span>
                    <button className="alp-carousel-arrow" onClick={handlePrev} aria-label="Anterior">
                        <ChevronLeft size={15} />
                    </button>
                    <button className="alp-carousel-arrow" onClick={handleNext} aria-label="Siguiente">
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>

            {/* ── Contenido real ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={section.id}
                    className="alp-carousel-content"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                    {section.id === 'legendary' && (
                        <LegendaryAlbumsSection
                            definitions={legendary}
                            progress={progress}
                            collection={collection}
                        />
                    )}
                    {section.id === 'stars' && !collectionLoading && (
                        <StarCollectionSection
                            collection={collection}
                            allCards={allCards}
                        />
                    )}
                    {section.id === 'cult' && !collectionLoading && (
                        <CultAlbumsSection
                            definitions={cult}
                            collection={collection}
                            allCards={allCards}
                            currentUserId={currentUserId}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function AlbumsPage({ currentUser }) {
    const user = currentUser;
    const [activePage, setActivePage] = useState('resumen');
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);

    const { allCards, loading: cardsLoading, refresh: refreshCards } = useAlbumCards();
    const { packsAvailable, boostActive, boostPacksRemaining, packsOpenedSinceLast, refresh: refreshPacks } = useAlbumPacks(user?.id);
    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(user?.id);
    const { progress, refresh: refreshProgress } = useAlbumProgress(user?.id);
    const { legendary, stars, cult } = useAlbumDefinitions();

    const { open, reset, phase, result, isGoat, isLegend, setPhase } = usePackOpening({
        onPackOpened: async () => {
            await refreshPacks();
            await computeAndSyncAlbumProgress(user?.id);
            refreshCollection();
            refreshProgress();
            refreshCards();
        },
    });

    useEffect(() => { refreshCards(); }, []);

    useEffect(() => {
        if (user?.id) {
            computeAndSyncAlbumProgress(user.id).then(() => refreshProgress());
        }
    }, [user?.id]);

    useEffect(() => {
        if (phase === 'revealing') {
            const t = setTimeout(() => setPhase('done'), 3200);
            return () => clearTimeout(t);
        }
    }, [phase, setPhase]);

    const handleOpenModal = () => { reset(); setModalOpen(true); };
    const handleCloseModal = () => { reset(); setModalOpen(false); };
    const handleReset = async () => { await refreshPacks(); reset(); };

    // Álbum activo
    const activeAlbum = getActiveAlbum(legendary, progress);
    const activeAlbumProgress = activeAlbum ? getAlbumProgress(activeAlbum.id, progress) : null;
    const activeUnique = activeAlbumProgress?.unique_cards ?? 0;
    const activeRequired = activeAlbum?.required_unique_players ?? 30;
    const activePct = activeRequired > 0 ? Math.round((activeUnique / activeRequired) * 100) : 0;
    const activeCompleted = activeAlbumProgress?.is_completed ?? false;

    return (
        <div className="alp-root">

            {/* ══ NAV PRINCIPAL ══════════════════════════════════════════ */}
            <AlbumsPageNav active={activePage} onChange={setActivePage} />

            {/* ══ TAB: RESUMEN ══════════════════════════════════════════ */}
            {activePage === 'resumen' && (
                <>
                    {/* ── BODY: panel izq + panel der ── */}
                    <div className="alp-body">

                        {/* Panel izquierdo: info + libro activo */}
                        <motion.aside
                            className="alp-active-panel"
                            variants={panelVariants} custom={1}
                            initial="hidden" animate="visible"
                        >
                            <div className="alp-active-panel-inner">
                                {/* Info columna izquierda */}
                                <div className="alp-active-info">
                                    <span className="alp-panel-eyebrow">Álbum activo</span>

                                    <div className="alp-active-name">
                                        {activeAlbum?.name ?? '—'}
                                        {activeCompleted && (
                                            <span className="alp-active-badge alp-active-badge--done">Completado</span>
                                        )}
                                    </div>

                                    <p className="alp-active-desc">
                                        {activeAlbum?.description ?? 'Colecciona las leyendas que marcaron la historia del fútbol.'}
                                    </p>

                                    {/* Barra de progreso */}
                                    <div className="alp-active-progress">
                                        <div className="alp-active-progress-track">
                                            <div className="alp-active-progress-fill"
                                                style={{ width: `${Math.min(activePct, 100)}%` }} />
                                            <div className="alp-active-progress-glow"
                                                style={{ left: `${Math.min(activePct, 99)}%` }} />
                                        </div>
                                        <div className="alp-active-progress-labels">
                                            <span className="alp-active-progress-count">
                                                <strong>{activeUnique}</strong>
                                                <span> / {activeRequired} figuritas</span>
                                            </span>
                                            <span className="alp-active-progress-pct">{activePct}%</span>
                                        </div>
                                    </div>

                                    <button className="alp-view-album-btn">Ver álbum →</button>
                                </div>

                                {/* Libro 3D del álbum activo */}
                                {activeAlbum?.id && (
                                    <ActiveAlbumBook
                                        albumId={activeAlbum.id}
                                        pct={activePct}
                                        filled={activeUnique}
                                        total={activeRequired}
                                    />
                                )}
                            </div>
                        </motion.aside>

                        {/* Panel derecho: Boost progress + Sobre 3D */}
                        <motion.aside
                            className="alp-right-panel"
                            variants={panelVariants} custom={2}
                            initial="hidden" animate="visible"
                        >
                            <BoostProgressBar
                                boostActive={boostActive}
                                boostPacksRemaining={boostPacksRemaining}
                                packsOpenedSinceLast={packsOpenedSinceLast ?? 0}
                            />
                            <div className="alp-right-divider" />
                            <Pack3D count={packsAvailable} onClick={handleOpenModal} />
                        </motion.aside>
                    </div>

                    {/* ── CARRUSEL (ocupa el resto de la pantalla) ── */}
                    <motion.div
                        className="alp-carousel-area"
                        variants={panelVariants} custom={3}
                        initial="hidden" animate="visible"
                    >
                        <AlbumsCarousel
                            legendary={legendary}
                            progress={progress}
                            collection={collection}
                            allCards={allCards}
                            cult={cult}
                            currentUserId={user?.id}
                            collectionLoading={collectionLoading}
                        />
                    </motion.div>
                </>
            )}

            {/* ══ TAB: COLECCIÓN ══════════════════════════════════════ */}
            {activePage === 'coleccion' && (
                <div className="alp-section-area">
                    <AlbumsSectionNav active={activeSection} onChange={setActiveSection} />
                    <div className="alp-section-scroll">
                        {activeSection === 'legendary' && (
                            <LegendaryAlbumsSection
                                definitions={legendary}
                                progress={progress}
                                collection={collection}
                            />
                        )}
                        {activeSection === 'stars' && !collectionLoading && (
                            <StarCollectionSection
                                collection={collection}
                                allCards={allCards}
                            />
                        )}
                        {activeSection === 'cult' && !collectionLoading && (
                            <CultAlbumsSection
                                definitions={cult}
                                collection={collection}
                                allCards={allCards}
                                currentUserId={user?.id}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ══ MODAL ══════════════════════════════════════════════ */}
            <PackOpeningModal
                isOpen={modalOpen}
                phase={phase}
                result={result}
                packsAvailable={packsAvailable}
                isGoat={isGoat}
                isLegend={isLegend}
                onOpen={() => open(user?.id)}
                onClose={handleCloseModal}
                onReset={handleReset}
            />
        </div>
    );
}