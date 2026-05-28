import React, { useState, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
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
import AlbumsPageMobile from '../components/mobile/AlbumsPageMobile';
import './AlbumsPage.css';

// ── Helpers ───────────────────────────────────────────────────
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

// ── Metadata del libro activo (colores por album_id) ─────────
const ALBUM_META = {
    legendary_1: { spine: '#5b4fd8', spineAlt: '#3d34a5', accent: '#a599d9', accentRgb: '165,153,217', coverBg: '#1a1726', shortLabel: 'LEG I', number: '01', rarityLevel: 3, rarityLabel: 'FUNDADORES', tag: 'TEMPORADA 25·26' },
    legendary_2: { spine: '#7c3aed', spineAlt: '#5b1fbd', accent: '#c4b5fd', accentRgb: '196,181,253', coverBg: '#160e2a', shortLabel: 'LEG II', number: '02', rarityLevel: 4, rarityLabel: 'LEYENDAS', tag: 'TEMPORADA 25·26' },
    legendary_3: { spine: '#1D9E75', spineAlt: '#0d6e50', accent: '#34d399', accentRgb: '52,211,153', coverBg: '#0a1f18', shortLabel: 'LEG III', number: '03', rarityLevel: 5, rarityLabel: 'ÉLITE', tag: 'TEMPORADA 25·26' },
    legendary_4: { spine: '#b45309', spineAlt: '#7c3b00', accent: '#f59e0b', accentRgb: '245,158,11', coverBg: '#1a1200', shortLabel: 'LEG IV', number: '04', rarityLevel: 5, rarityLabel: 'GOATS', tag: 'TEMPORADA 25·26' },
    legendary_5: { spine: '#9d174d', spineAlt: '#6b1130', accent: '#f472b6', accentRgb: '244,114,182', coverBg: '#1a0e15', shortLabel: 'LEG V', number: '05', rarityLevel: 5, rarityLabel: 'INMORTALES', tag: 'ENDGAME' },
};
const DEFAULT_META = { spine: '#5b4fd8', spineAlt: '#3d34a5', accent: '#a599d9', accentRgb: '165,153,217', coverBg: '#1a1726', shortLabel: 'ALB', number: '01', rarityLevel: 1, rarityLabel: '', tag: '' };

// ── Variants animación ────────────────────────────────────────
const panelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut', delay: i * 0.06 } }),
};

// ─────────────────────────────────────────────────────────────
// ActiveAlbumHero — libro grande con soporte
// ─────────────────────────────────────────────────────────────
function ActiveAlbumHero({ albumId, name, description, pct, filled, total, onViewAlbum, activeCompleted }) {
    const meta = ALBUM_META[albumId] ?? DEFAULT_META;

    return (
        <div className="alp-hero-layout">
            {/* Columna izquierda: info + stats */}
            <div className="alp-hero-info">
                <span className="alp-panel-eyebrow">Álbum activo</span>

                <div className="alp-active-name">
                    {name ?? '—'}
                    {activeCompleted && (
                        <span className="alp-active-badge alp-active-badge--done">Completado</span>
                    )}
                </div>

                <p className="alp-active-desc">
                    {description ?? 'Colecciona las leyendas que marcaron la historia del fútbol.'}
                </p>

                {/* Stats grandes */}
                <div className="alp-hero-stats">
                    <div className="alp-hero-stat">
                        <span className="alp-hero-stat-val">{filled}</span>
                        <span className="alp-hero-stat-label">Figuritas</span>
                    </div>
                    <div className="alp-hero-stat-divider" />
                    <div className="alp-hero-stat">
                        <span className="alp-hero-stat-val">{pct}<span className="alp-hero-stat-pct-sym">%</span></span>
                        <span className="alp-hero-stat-label">Completado</span>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="alp-active-progress">
                    <div className="alp-active-progress-track">
                        <div className="alp-active-progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                        <div className="alp-active-progress-glow" style={{ left: `${Math.min(pct, 99)}%` }} />
                    </div>
                    <div className="alp-active-progress-labels">
                        <span className="alp-active-progress-count">
                            <strong>{filled}</strong> / {total} figuritas
                        </span>
                        <span className="alp-active-progress-pct">{pct}%</span>
                    </div>
                </div>

                <button className="alp-view-album-btn">
                    Ver álbum →
                </button>
            </div>

            {/* Columna derecha: libro 3D grande + soporte */}
            <div className="alp-hero-book-wrap">
                <div className="alp-hero-book-scene">
                    {/* Hojas apiladas */}
                    <div className="alp-hero-pages">
                        {[2, 1, 0].map(i => (
                            <div key={i} className="alp-hero-page-leaf"
                                style={{ '--li': i, '--acc': meta.accent }} />
                        ))}
                    </div>

                    {/* El libro */}
                    <div className="alp-hero-book"
                        style={{
                            '--spine': meta.spine,
                            '--spine-alt': meta.spineAlt,
                            '--acc': meta.accent,
                            '--acc-rgb': meta.accentRgb,
                            '--cover-bg': meta.coverBg,
                        }}>

                        {/* Lomo */}
                        <div className="alp-hero-spine">
                            <span className="alp-hero-spine-num">{meta.number}</span>
                            <span className="alp-hero-spine-label">{meta.shortLabel}</span>
                            <div className="alp-hero-spine-lines">
                                {[0, 1, 2].map(i => <div key={i} className="alp-hero-spine-line" />)}
                            </div>
                        </div>

                        {/* Portada */}
                        <div className="alp-hero-cover">
                            {/* Tag */}
                            <div className="alp-hero-cover-tag">{meta.tag}</div>

                            {/* Esquinas doradas */}
                            {['tl', 'tr', 'bl', 'br'].map(pos => (
                                <div key={pos} className={`alp-hero-corner alp-hero-corner--${pos}`} />
                            ))}

                            {/* Broche */}
                            <div className="alp-hero-clasp">
                                <div className="alp-hero-clasp-strap alp-hero-clasp-strap--top" />
                                <div className="alp-hero-clasp-buckle">
                                    <div className="alp-hero-clasp-inner" />
                                </div>
                                <div className="alp-hero-clasp-strap alp-hero-clasp-strap--bot" />
                            </div>

                            {/* Arte central */}
                            <div className="alp-hero-art">
                                <svg viewBox="0 0 120 140" fill="none" className="alp-hero-art-svg">
                                    <circle cx="60" cy="65" r="44"
                                        stroke={meta.accent} strokeOpacity="0.12" strokeWidth="1.5" />
                                    <circle cx="60" cy="65" r="32"
                                        stroke={meta.accent} strokeOpacity="0.22" strokeWidth="1" />
                                    <circle cx="60" cy="65" r="20"
                                        stroke={meta.accent} strokeOpacity="0.15" strokeWidth="0.8" />
                                    {/* Escudo */}
                                    <path d="M60 34 L78 42 L78 64 C78 76 60 84 60 84 C60 84 42 76 42 64 L42 42 Z"
                                        fill={meta.accent} fillOpacity="0.12"
                                        stroke={meta.accent} strokeOpacity="0.5" strokeWidth="1.2" />
                                    <circle cx="60" cy="60" r="8"
                                        fill={meta.accent} fillOpacity="0.2" />
                                    <circle cx="60" cy="60" r="4"
                                        fill={meta.accent} fillOpacity="0.4" />
                                    {/* Estrellas de rareza */}
                                    {Array.from({ length: Math.min(meta.rarityLevel, 5) }, (_, i) => {
                                        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                                        const r = 22;
                                        return (
                                            <circle key={i}
                                                cx={60 + Math.cos(angle) * r}
                                                cy={65 + Math.sin(angle) * r}
                                                r="2" fill={meta.accent} fillOpacity="0.7" />
                                        );
                                    })}
                                    {/* Label rareza */}
                                    <text x="60" y="108" textAnchor="middle"
                                        fontFamily="DM Mono, monospace" fontSize="7"
                                        fontWeight="700" letterSpacing="2"
                                        fill={meta.accent} fillOpacity="0.5">
                                        {meta.rarityLabel}
                                    </text>
                                </svg>
                            </div>

                            {/* Footer del libro */}
                            <div className="alp-hero-cover-footer">
                                <div className="alp-hero-cover-footer-info">
                                    <span className="alp-hero-cover-count">{filled} / {total} ITEMS</span>
                                    {activeCompleted && <span className="alp-hero-done-tick">✓</span>}
                                </div>
                                <div className="alp-hero-cover-bar">
                                    <div className="alp-hero-cover-bar-fill" style={{ width: `${pct}%` }} />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Soporte / pedestal */}
                    <div className="alp-hero-pedestal">
                        <div className="alp-hero-pedestal-top" />
                        <div className="alp-hero-pedestal-body" />
                        <div className="alp-hero-pedestal-shadow" />
                    </div>

                </div>

                {/* Badge ACTIVO — esquina superior derecha del wrap */}
                <div className="alp-hero-active-badge">ACTIVO</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// BoostProgressBar — connected milestone track
// ─────────────────────────────────────────────────────────────
function BoostProgressBar({ boostActive, boostPacksRemaining, packsOpenedSinceLast = 0 }) {
    const PACKS_PER_BOOST = 10;
    const progress = boostActive ? 100 : Math.min((packsOpenedSinceLast / PACKS_PER_BOOST) * 100, 100);

    const nodes = [
        { pos: 0, label: 'Inicio', reward: null },
        { pos: 25, label: '10\nPremium', reward: '10' },
        { pos: 50, label: '20\nÉpico', reward: '20' },
        { pos: 75, label: '30\nÉlite', reward: '30' },
        { pos: 100, label: '40\nEspecial', reward: '👑' },
    ];

    return (
        <div className={`alp-boost-bar${boostActive ? ' alp-boost-bar--active' : ''}`}>
            <div className="alp-boost-bar-header">
                <span className="alp-boost-bar-eyebrow">Camino de temporada</span>
                <button className="alp-boost-bar-ver">Ver todo →</button>
            </div>

            <div className="alp-season-track">
                <div className="alp-season-track-line">
                    <div className="alp-season-track-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="alp-season-nodes">
                    {nodes.map((node, i) => {
                        const passed = progress >= node.pos;
                        const isCurrent = !passed && (i === 0 ? progress > 0 : progress > nodes[i - 1].pos);
                        return (
                            <div key={node.pos} className="alp-season-node-wrap">
                                <div className={`alp-season-node${passed ? ' alp-season-node--passed' : ''}${isCurrent ? ' alp-season-node--current' : ''}`}>
                                    {passed
                                        ? <span className="alp-season-node-check">✓</span>
                                        : <span className="alp-season-node-val">{node.reward ?? ''}</span>
                                    }
                                </div>
                                <span className="alp-season-node-label">{node.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Boost status card */}
            <div className={`alp-boost-info-row${boostActive ? ' alp-boost-info-row--active' : ''}`}>
                {boostActive ? (
                    <>
                        <div className="alp-boost-info-left">
                            <span className="alp-boost-info-icon">⚡</span>
                            <div className="alp-boost-info-texts">
                                <span className="alp-boost-active-tag">Boost activo</span>
                                <span className="alp-boost-active-sub">+25% probabilidades</span>
                            </div>
                        </div>
                        <div className={`alp-boost-packs-left alp-boost-packs-left--active`}>
                            <strong>{boostPacksRemaining}</strong>
                            / 5 sobres
                        </div>
                    </>
                ) : (
                    <>
                        <div className="alp-boost-info-left">
                            <span className="alp-boost-info-icon">🎯</span>
                            <div className="alp-boost-info-texts">
                                <span className="alp-boost-inactive-tag">Próximo boost</span>
                                <span className="alp-boost-inactive-sub">cada 10 sobres</span>
                            </div>
                        </div>
                        <div className="alp-boost-packs-left">
                            <strong>{PACKS_PER_BOOST - packsOpenedSinceLast}</strong>
                            sobres restantes
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Pack3D — centrado vertical
// ─────────────────────────────────────────────────────────────
function Pack3D({ count, onClick }) {
    return (
        <div className="alp-pack3d-wrap">
            {/* Badge encima de todo */}
            <div className="alp-pack3d-count-row">
                <span className="alp-pack3d-label">Sobres disponibles</span>
                {count > 0 && <span className="alp-pack3d-badge">{count}</span>}
            </div>

            {/* Fila: sobre izq + info der */}
            <div className="alp-pack3d-row">
                <div className="alp-pack3d-stack">
                    <div className="alp-pack3d-shadow alp-pack3d-shadow--3" />
                    <div className="alp-pack3d-shadow alp-pack3d-shadow--2" />
                    <div className="alp-pack3d-main">
                        <svg viewBox="0 0 90 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="alp-pack3d-svg">
                            <defs>
                                <linearGradient id="packGrad2" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#7B6FE8" />
                                    <stop offset="100%" stopColor="#4a3fc7" />
                                </linearGradient>
                                <linearGradient id="packShine2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                                <linearGradient id="packTab2" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#5b4fd8" />
                                    <stop offset="100%" stopColor="#8b7fc7" />
                                </linearGradient>
                            </defs>
                            <ellipse cx="45" cy="112" rx="30" ry="5" fill="rgba(91,79,216,0.25)" />
                            <rect x="8" y="22" width="74" height="90" rx="6" fill="url(#packGrad2)" />
                            <rect x="8" y="22" width="74" height="90" rx="6" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <rect x="8" y="22" width="74" height="24" rx="6" fill="url(#packTab2)" />
                            <rect x="8" y="34" width="74" height="12" fill="url(#packTab2)" />
                            <line x1="8" y1="46" x2="82" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 3" />
                            <line x1="22" y1="22" x2="22" y2="112" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
                            {[58, 68, 78, 88, 98].map(y => (
                                <line key={y} x1="28" y1={y} x2="76" y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
                            ))}
                            <path d="M45 54 L56 59 L56 70 C56 76 45 81 45 81 C45 81 34 76 34 70 L34 59 Z"
                                fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                            <circle cx="45" cy="67" r="4" fill="rgba(255,255,255,0.2)" />
                            <rect x="8" y="22" width="38" height="90" rx="6" fill="url(#packShine2)" />
                            <circle cx="68" cy="32" r="1.5" fill="rgba(255,255,255,0.6)" />
                            <circle cx="75" cy="38" r="1" fill="rgba(255,255,255,0.4)" />
                            <circle cx="63" cy="40" r="0.8" fill="rgba(255,255,255,0.3)" />
                        </svg>
                    </div>
                </div>

                {/* Info derecha */}
                <div className="alp-pack3d-info">
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
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// AlbumsCarousel — secciones reales con flechas
// ─────────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'legendary', label: 'Tus Álbumes Legendary' },
    { id: 'stars', label: 'Tus Álbumes Stars' },
    { id: 'cult', label: 'Tus Álbumes Cult' },
];

function AlbumsCarousel({ legendary, progress, collection, allCards, cult, currentUserId, collectionLoading }) {
    const [sectionIdx, setSectionIdx] = useState(0);
    const section = SECTIONS[sectionIdx];

    const totals = [legendary?.length ?? 0, 5, cult?.length ?? 0];

    const handlePrev = () => setSectionIdx(i => (i - 1 + SECTIONS.length) % SECTIONS.length);
    const handleNext = () => setSectionIdx(i => (i + 1) % SECTIONS.length);

    return (
        <div className="alp-carousel">
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

    const activeAlbum = getActiveAlbum(legendary, progress);
    const activeAlbumProgress = activeAlbum ? getAlbumProgress(activeAlbum.id, progress) : null;
    const activeUnique = activeAlbumProgress?.unique_cards ?? 0;
    const activeRequired = activeAlbum?.required_unique_players ?? 30;
    const activePct = activeRequired > 0 ? Math.round((activeUnique / activeRequired) * 100) : 0;
    const activeCompleted = activeAlbumProgress?.is_completed ?? false;

    return (
        <>
            <div className="alp-root">
                {/* por ahora no se habilitara la nav primero trabajaremos en los albums*/}
                {/* <AlbumsPageNav active={activePage} onChange={setActivePage} /> */}

                {activePage === 'resumen' && (
                    <>
                        {/* ── BODY: panel izq grande + panel der ── */}
                        <div className="alp-body">

                            {/* Panel izquierdo 57% — libro hero */}
                            <motion.aside
                                className="alp-active-panel"
                                variants={panelVariants} custom={1}
                                initial="hidden" animate="visible"
                            >
                                <ActiveAlbumHero
                                    albumId={activeAlbum?.id}
                                    name={activeAlbum?.name}
                                    description={activeAlbum?.description}
                                    pct={activePct}
                                    filled={activeUnique}
                                    total={activeRequired}
                                    activeCompleted={activeCompleted}
                                    onViewAlbum={() => setActivePage('coleccion')}
                                />
                            </motion.aside>

                            {/* Panel derecho 43% — boost + sobre */}
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

                        {/* ── CARRUSEL INFERIOR ── */}
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

            <AlbumsPageMobile />

        </>
    );
}