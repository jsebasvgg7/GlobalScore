import React, { useState, useEffect } from 'react';
import { Package, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import { useAlbumCollection } from '../hooks/useAlbumCollection';
import { useAlbumProgress } from '../hooks/useAlbumProgress';
import { useAlbumDefinitions } from '../hooks/useAlbumDefinitions';
import { usePackOpening } from '../hooks/usePackOpening';
import { getAlbumCards, computeAndSyncAlbumProgress } from '../services/albums.service';
import LegendaryAlbumsSection from '../components/LegendaryAlbumsSection';
import StarCollectionSection from '../components/StarCollectionSection';
import CultAlbumsSection from '../components/CultAlbumsSection';
import PackOpeningModal from '../components/PackOpeningModal';
import { primaryButtonProps } from '../motion/variants';
import { useAlbumCards } from '../hooks/useAlbumCards';
import './AlbumsPage.css';

// ── Season path config ──────────────────────────────────────────────────
const SEASON_PATH = [
    { label: 'INICIO', value: null, done: true },
    { label: 'SOBRE PREMIUM', value: 10, done: true },
    { label: 'BOOST ÉPICO', value: 20, done: false, current: true },
    { label: 'SOBRE ÉLITE', value: 30, done: false },
    { label: 'ÁLB. ESPECIAL', value: 40, done: false, crown: true },
];

// ── Section tabs config ──────────────────────────────────────────────────
const SECTION_TABS = [
    {
        id: 'legendary',
        label: 'Legendarios',
        sublabel: 'Álbumes',
        icon: (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 1L8.5 5h4l-3.2 2.3 1.2 3.7L7 8.8l-3.5 2.2 1.2-3.7L1.5 5h4z" />
            </svg>
        ),
    },
    {
        id: 'stars',
        label: 'Estrellas',
        sublabel: 'Colección',
        icon: (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" />
                <circle cx="7" cy="7" r="2.5" />
                <line x1="7" y1="1" x2="7" y2="1.5" strokeWidth="1.8" />
                <line x1="7" y1="12.5" x2="7" y2="13" strokeWidth="1.8" />
                <line x1="1" y1="7" x2="1.5" y2="7" strokeWidth="1.8" />
                <line x1="12.5" y1="7" x2="13" y2="7" strokeWidth="1.8" />
            </svg>
        ),
    },
    {
        id: 'cult',
        label: 'Culto',
        sublabel: 'Especiales',
        icon: (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 11V4.5C2 4.5 4 3.5 7 4.5 10 3.5 12 4.5 12 4.5V11" />
                <path d="M7 4.5V11" />
                <line x1="3.5" y1="6.5" x2="5.5" y2="6.1" />
                <line x1="3.5" y1="8.5" x2="5.5" y2="8.1" />
                <line x1="10.5" y1="6.5" x2="8.5" y2="6.1" />
                <line x1="10.5" y1="8.5" x2="8.5" y2="8.1" />
            </svg>
        ),
    },
];

function CrownIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
            <path d="M2 19h20v2H2v-2zM2 5l5 8 5-6 5 6 5-8v12H2V5z" />
        </svg>
    );
}

const gridVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ══════════════════════════════════════════════════════════════════════════
//  INLINE SECTION NAV — tabs + barra de progreso integrada en el topbar
// ══════════════════════════════════════════════════════════════════════════
function InlineSectionNav({ active, onChange, barPercent, boostActive }) {
    return (
        <div className="alp-inline-nav">
            {/* Tabs izquierda */}
            <div className="alp-inline-nav-tabs" role="tablist" aria-label="Secciones del álbum">
                {SECTION_TABS.map((tab) => {
                    const isActive = active === tab.id;
                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            className={`alp-inline-tab${isActive ? ' alp-inline-tab--active' : ''}`}
                            onClick={() => onChange(tab.id)}
                        >
                            <span className="alp-inline-tab-inner">
                                <span className="alp-inline-icon-box" aria-hidden="true">
                                    {tab.icon}
                                </span>
                                <span className="alp-inline-text-block">
                                    <span className="alp-inline-sublabel">{tab.sublabel}</span>
                                    <span className="alp-inline-label">{tab.label}</span>
                                </span>
                            </span>
                            {isActive && <span className="alp-inline-active-bar" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>

            {/* Separador vertical */}
            <div className="alp-inline-nav-sep" />

            {/* Progress bar — parte derecha del topbar */}
            <div className="alp-inline-progress">
                <span className="alp-inline-progress-eyebrow">
                    {boostActive ? (
                        <><span className="alp-inline-boost-dot" />BOOST ACTIVO</>
                    ) : (
                        'PRÓXIMO BOOST'
                    )}
                </span>
                <div className={`alp-inline-track${boostActive ? ' alp-inline-track--boost' : ''}`}>
                    <div
                        className="alp-inline-fill"
                        style={{ width: boostActive ? '100%' : `${barPercent}%` }}
                    >
                        <div className="alp-inline-shimmer" />
                    </div>
                    <div
                        className="alp-inline-glow"
                        style={{ left: boostActive ? '99%' : `${Math.min(barPercent, 99)}%` }}
                    />
                    {[25, 50, 75].map(tick => (
                        <div
                            key={tick}
                            className={`alp-inline-tick${(boostActive || barPercent >= tick) ? ' alp-inline-tick--passed' : ''}`}
                            style={{ left: `${tick}%` }}
                        />
                    ))}
                </div>
                <span className={`alp-inline-pct${boostActive ? ' alp-inline-pct--boost' : ''}`}>
                    {boostActive ? '100' : barPercent}<span className="alp-inline-pct-sym">%</span>
                </span>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
//  ACTIVE ALBUM HERO
// ══════════════════════════════════════════════════════════════════════════
function ActiveAlbumHero({ progress, definitions }) {
    const ORDER = ['legendary_1', 'legendary_2', 'legendary_3', 'legendary_4', 'legendary_5'];
    const ALBUM_META = {
        legendary_1: { label: 'Legendarios', spine: '#5b4fd8', acc: '#a599d9', accRgb: '165,153,217', coverBg: '#1a1726', number: '01' },
        legendary_2: { label: 'Estrellas', spine: '#7c3aed', acc: '#c4b5fd', accRgb: '196,181,253', coverBg: '#160e2a', number: '02' },
        legendary_3: { label: 'Futuro', spine: '#1D9E75', acc: '#34d399', accRgb: '52,211,153', coverBg: '#0a1f18', number: '03' },
        legendary_4: { label: 'Héroes', spine: '#b45309', acc: '#f59e0b', accRgb: '245,158,11', coverBg: '#1a1200', number: '04' },
        legendary_5: { label: 'Inmortales', spine: '#9d174d', acc: '#f472b6', accRgb: '244,114,182', coverBg: '#1a0e15', number: '05' },
    };

    const activeAlbumId = ORDER.find(id => {
        const p = progress.find(p => p.album_id === id);
        return !p?.is_completed;
    }) ?? ORDER[0];

    const meta = ALBUM_META[activeAlbumId];
    const prog = progress.find(p => p.album_id === activeAlbumId);
    const slots = 30;
    const filled = prog?.unique_cards ?? 0;
    const pct = Math.min(100, Math.round((filled / slots) * 100));
    const def = definitions.find(d => d.id === activeAlbumId);

    return (
        <div className="alp-active-hero">
            <div className="alp-active-hero-info">
                <div className="alp-active-hero-top">
                    <div className="alp-active-badge">
                        <span className="alp-active-dot" />
                        ÁLBUM ACTIVO
                    </div>
                    <div className="alp-active-title-row">
                        <h2 className="alp-active-title">{meta.label.toUpperCase()}</h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke={meta.acc} strokeWidth="1.5"
                            className="alp-active-star-icon" aria-hidden="true">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <p className="alp-active-sub">
                        {def?.description ?? 'Colecciona las leyendas que marcaron la historia del fútbol.'}
                    </p>
                    <button className="alp-active-view-btn">VER ÁLBUM →</button>
                </div>

                <div className="alp-active-hero-bottom">
                    <div className="alp-active-stats">
                        <div className="alp-stat-block">
                            <div className="alp-stat-num">{filled}<span> / {slots}</span></div>
                            <div className="alp-stat-label">FIGURITAS</div>
                        </div>
                        <div className="alp-stat-sep" />
                        <div className="alp-stat-block">
                            <div className="alp-stat-pct" style={{ color: meta.acc }}>{pct}<span>%</span></div>
                            <div className="alp-stat-label">COMPLETADO</div>
                        </div>
                    </div>
                    <div className="alp-active-bar">
                        <div
                            className="alp-active-bar-fill"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${meta.spine}, ${meta.acc})` }}
                        >
                            <div className="alp-active-bar-shimmer" />
                        </div>
                        <div
                            className="alp-active-bar-glow"
                            style={{
                                left: `${Math.max(0, pct - 1)}%`,
                                background: meta.acc,
                                boxShadow: `0 0 10px 3px rgba(${meta.accRgb},.5)`
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="alp-active-book-wrap">
                <span className="alp-active-book-tag">ACTIVO</span>
                <div className="alp-active-book-shadow" />
                <div className="alp-active-book-3d">
                    <div
                        className="alp-active-spine"
                        style={{ background: `linear-gradient(180deg, ${meta.spine}, color-mix(in srgb, ${meta.spine} 70%, black))` }}
                    >
                        <span className="alp-active-spine-text">{meta.label.toUpperCase()}</span>
                    </div>
                    <div className="alp-active-cover" style={{ background: meta.coverBg }}>
                        <svg viewBox="0 0 120 160" className="alp-active-cover-art" aria-hidden="true">
                            <defs>
                                <pattern id="hatch-active" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                                    <line x1="0" y1="0" x2="0" y2="10" stroke={meta.acc} strokeWidth="0.8" opacity="0.15" />
                                </pattern>
                            </defs>
                            <rect width="120" height="160" fill="url(#hatch-active)" />
                            <circle cx="60" cy="78" r="36" fill="none" stroke={meta.acc} strokeWidth="1" opacity="0.25" />
                            <circle cx="60" cy="78" r="24" fill="none" stroke={meta.acc} strokeWidth="0.7" opacity="0.2" />
                            <circle cx="60" cy="78" r="12" fill={meta.acc} fillOpacity="0.15" stroke={meta.acc} strokeWidth="1" />
                            <g transform="translate(60,78)">
                                <circle cx="0" cy="0" r="5" fill={meta.acc} opacity="0.6" />
                                <line x1="-30" y1="0" x2="30" y2="0" stroke={meta.acc} strokeWidth="0.5" opacity="0.3" />
                                <line x1="0" y1="-30" x2="0" y2="30" stroke={meta.acc} strokeWidth="0.5" opacity="0.3" />
                            </g>
                            <text x="60" y="140" textAnchor="middle" fontFamily="'DM Mono',monospace"
                                fontSize="7" fontWeight="700" fill={meta.acc} opacity="0.4" letterSpacing="1">
                                TEMPORADA 25 - 26
                            </text>
                        </svg>
                        <div className="alp-book-clasp">
                            <div className="alp-clasp-bar" style={{ background: `linear-gradient(90deg, ${meta.acc}55, #c4aa80)` }} />
                            <div className="alp-clasp-body"><div className="alp-clasp-inner" /></div>
                            <div className="alp-clasp-bar" style={{ background: `linear-gradient(90deg, ${meta.acc}55, #c4aa80)` }} />
                        </div>
                        <div className="alp-bk-corner alp-bk-corner--tl" />
                        <div className="alp-bk-corner alp-bk-corner--tr" />
                        <div className="alp-bk-corner alp-bk-corner--bl" />
                        <div className="alp-bk-corner alp-bk-corner--br" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
//  SEASON PATH CARD
// ══════════════════════════════════════════════════════════════════════════
function SeasonPathCard({ boostActive, boostPacksRemaining }) {
    return (
        <div className="alp-season-card">
            <div className="alp-season-card-header">
                <span className="alp-card-label">CAMINO DE TEMPORADA</span>
                <button className="alp-see-all">VER TODO <ChevronRight size={10} /></button>
            </div>

            <div className="alp-path-track">
                {SEASON_PATH.map((node, i) => (
                    <React.Fragment key={i}>
                        <div className="alp-path-node">
                            <div className={`alp-path-circle ${node.done ? 'done' : node.current ? 'current' : 'future'}`}>
                                {node.crown
                                    ? <CrownIcon />
                                    : node.done
                                        ? '✓'
                                        : node.value ?? '·'}
                            </div>
                            <div className={`alp-path-label ${node.done ? 'done' : node.current ? 'current' : 'future'}`}>
                                {node.value && <div className="alp-path-value">{node.value}</div>}
                                {node.label}
                            </div>
                        </div>
                        {i < SEASON_PATH.length - 1 && (
                            <div className={`alp-path-connector ${node.done ? 'done' : 'future'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {boostActive && (
                <div className="alp-boost-inline">
                    <div className="alp-boost-inline-icon"><Zap size={13} /></div>
                    <div className="alp-boost-inline-info">
                        <span className="alp-boost-inline-title">BOOST ACTIVO</span>
                        <span className="alp-boost-inline-val">+25% probabilidades</span>
                    </div>
                    <div className="alp-boost-inline-counter">
                        <span className="alp-boost-inline-num">
                            {boostPacksRemaining}<span className="alp-boost-inline-denom"> / 5</span>
                        </span>
                        <span className="alp-boost-inline-sub">SOBRES RESTANTES</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
//  PACKS CARD
// ══════════════════════════════════════════════════════════════════════════
function PacksCard({ packsAvailable, onOpenModal }) {
    return (
        <div className="alp-packs-card">
            <div className="alp-packs-card-header">
                <span className="alp-card-label">SOBRES DISPONIBLES</span>
                <span className="alp-packs-badge">{packsAvailable}</span>
            </div>

            <div className="alp-packs-body">
                <div className="alp-pack-illustration">
                    <div className="alp-pack-glow" />
                    <svg viewBox="0 0 80 100" className="alp-pack-svg" aria-hidden="true">
                        <defs>
                            <linearGradient id="alp-pack-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#4c1d95" />
                            </linearGradient>
                            <linearGradient id="alp-pack-g2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>
                        </defs>
                        <rect x="6" y="18" width="68" height="76" rx="5" fill="url(#alp-pack-g1)" />
                        <rect x="6" y="18" width="68" height="22" rx="5" fill="#6d28d9" />
                        <rect x="6" y="30" width="68" height="10" fill="#6d28d9" />
                        <rect x="6" y="18" width="68" height="22" rx="5" fill="url(#alp-pack-g2)" opacity="0.5" />
                        <line x1="18" y1="18" x2="18" y2="94" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                        <circle cx="40" cy="64" r="20" fill="none" stroke="rgba(196,181,253,0.25)" strokeWidth="1" />
                        <circle cx="40" cy="64" r="12" fill="none" stroke="rgba(196,181,253,0.4)" strokeWidth="1.2" />
                        <circle cx="40" cy="64" r="5" fill="rgba(196,181,253,0.7)" />
                        <line x1="6" y1="40" x2="74" y2="40" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 2" strokeWidth="0.8" />
                        <path d="M28,22 L33,28 L40,22 L47,28 L52,22" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.9" />
                        <rect x="28" y="87" width="24" height="5" rx="1" fill="rgba(196,181,253,0.18)" />
                        {[[14, 30], [66, 26], [70, 60], [10, 62]].map(([x, y], i) => (
                            <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(196,181,253,0.5)"
                                style={{ animation: `alp-sparkle ${1.2 + i * 0.4}s ease-in-out infinite alternate` }} />
                        ))}
                    </svg>
                </div>

                <div className="alp-packs-info">
                    <p className="alp-packs-copy">
                        Tienes <strong>{packsAvailable} sobres</strong> listos para abrir.
                    </p>
                    <button className="alp-open-packs-btn" onClick={onOpenModal} disabled={packsAvailable < 1}>
                        <Package size={15} strokeWidth={2} />
                        ABRIR SOBRES
                    </button>
                    <button className="alp-packs-secondary">
                        Ver probabilidad de rarezas <ChevronRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function AlbumsPage({ currentUser }) {
    const user = currentUser;
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);

    const { allCards, loading: cardsLoading, refresh: refreshCards } = useAlbumCards();
    const { packs, barPercent, packsAvailable, boostActive, boostPacksRemaining, refresh: refreshPacks } = useAlbumPacks(user?.id);
    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(user?.id);
    const { progress, refresh: refreshProgress } = useAlbumProgress(user?.id);
    const { legendary, cult } = useAlbumDefinitions();

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

    return (
        <div className="alp-root page-root">

            {/* ══ HERO ZONE ══ */}
            <div className="alp-hero-zone">

                {/* ── Nav inline: tabs + barra de progreso en el mismo topbar ── */}
                <InlineSectionNav
                    active={activeSection}
                    onChange={setActiveSection}
                    barPercent={barPercent}
                    boostActive={boostActive}
                />

                {/* ── Hero grid: álbum activo | columna derecha ── */}
                {activeSection === 'legendary' && (
                    <motion.div
                        className="alp-hero-grid"
                        variants={gridVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <ActiveAlbumHero progress={progress} definitions={legendary} />

                        <div className="alp-right-column">
                            <SeasonPathCard
                                boostActive={boostActive}
                                boostPacksRemaining={boostPacksRemaining}
                            />
                            <PacksCard
                                packsAvailable={packsAvailable}
                                onOpenModal={handleOpenModal}
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ══ SECCIÓN SCROLLABLE ══ */}
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

            {/* ══ MODAL ══ */}
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