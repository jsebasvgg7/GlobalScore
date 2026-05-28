import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Package, BookOpen, Crown, Star, BookMarked,
    Target, CheckCircle2, Lock, ChevronRight, Zap
} from 'lucide-react';
import { supabase } from '@/shared/services/supabase/client';
import { useAlbumPacks } from '../../hooks/useAlbumPacks';
import { useAlbumCollection } from '../../hooks/useAlbumCollection';
import { useAlbumProgress } from '../../hooks/useAlbumProgress';
import { useAlbumDefinitions } from '../../hooks/useAlbumDefinitions';
import { usePackOpening } from '../../hooks/usePackOpening';
import { useAlbumCards } from '../../hooks/useAlbumCards';
import { computeAndSyncAlbumProgress } from '../../services/albums.service';
import LegendaryAlbumsSection from '../LegendaryAlbumsSection';
import StarCollectionSection from '../StarCollectionSection';
import CultAlbumsSection from '../CultAlbumsSection';
import PackOpeningModal from '../PackOpeningModal';
import '../../styles/mobile/AlbumsPageMobile.css';

// ── Metadatos por album_id ───────────────────────────────────
const ALBUM_META = {
    legendary_1: {
        bg: 'alb-mob-album-bg--leg1',
        accent: '#8b7fe8',
        cornerColor: '#8b7fe8',
        nameColor: '#c8c0ff',
        barColor: '#60519b',
        label: 'FUNDADORES',
        artStroke: 'rgba(139,127,232,0.45)',
        artFill: 'rgba(91,79,216,0.18)',
    },
    legendary_2: {
        bg: 'alb-mob-album-bg--leg2',
        accent: '#c87fe8',
        cornerColor: '#c87fe8',
        nameColor: '#e0c0ff',
        barColor: '#9b59d8',
        label: 'LEYENDAS',
        artStroke: 'rgba(200,127,232,0.45)',
        artFill: 'rgba(139,79,216,0.18)',
    },
    legendary_3: {
        bg: 'alb-mob-album-bg--leg3',
        accent: '#2dc48a',
        cornerColor: '#2dc48a',
        nameColor: '#7eebc8',
        barColor: '#2dc48a',
        label: 'ÉLITE',
        artStroke: 'rgba(45,196,138,0.45)',
        artFill: 'rgba(45,196,138,0.14)',
    },
    legendary_4: {
        bg: 'alb-mob-album-bg--leg4',
        accent: '#f59e0b',
        cornerColor: '#f59e0b',
        nameColor: '#fde68a',
        barColor: '#f59e0b',
        label: 'GOATS',
        artStroke: 'rgba(245,158,11,0.45)',
        artFill: 'rgba(245,158,11,0.14)',
    },
    legendary_5: {
        bg: 'alb-mob-album-bg--leg5',
        accent: '#f472b6',
        cornerColor: '#f472b6',
        nameColor: '#fbb6ce',
        barColor: '#f472b6',
        label: 'INMORTALES',
        artStroke: 'rgba(244,114,182,0.45)',
        artFill: 'rgba(244,114,182,0.14)',
    },
};

const DEFAULT_META = ALBUM_META['legendary_1'];

// ── Helpers ──────────────────────────────────────────────────
function getActiveAlbum(legendary, progress) {
    if (!legendary?.length) return null;
    return (
        legendary.find(def => {
            const p = progress?.find(pr => pr.album_id === def.id);
            return !p?.is_completed;
        }) ?? legendary[legendary.length - 1]
    );
}

function getAlbumProgress(albumId, progress) {
    return progress?.find(p => p.album_id === albumId) ?? null;
}

// ── Tabs de la barra inferior ────────────────────────────────
const NAV_TABS = [
    { id: 'inicio', label: 'Inicio', Icon: Package },
    { id: 'albums', label: 'Álbumes', Icon: BookOpen },
    { id: 'misiones', label: 'Misiones', Icon: Target },
];

// Nodos del camino de temporada
const SEASON_NODES = [
    { pos: 0, label: 'Inicio', val: null },
    { pos: 25, label: '10\nPremium', val: '10' },
    { pos: 50, label: '20\nÉpico', val: '20' },
    { pos: 75, label: '30\nÉlite', val: '30' },
    { pos: 100, label: '40\nEspecial', val: '40' },
];

// ─────────────────────────────────────────────────────────────
// HeroBookSVG
// ─────────────────────────────────────────────────────────────
function HeroBookSVG({ meta = DEFAULT_META, pct = 0, filled = 0, total = 30 }) {
    return (
        <svg
            className="alb-mob-hero-book"
            viewBox="0 0 100 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect x="8" y="10" width="84" height="110" rx="4" fill="#0d0b14" stroke={meta.accent} strokeWidth="0.8" strokeOpacity="0.5" />
            <rect x="12" y="14" width="76" height="102" rx="3" fill={meta.artFill} />
            <circle cx="50" cy="60" r="26" stroke={meta.artStroke} strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="60" r="18" stroke={meta.artStroke} strokeWidth="1" fill="none" />
            <path d="M50 44 L50 76 M34 60 L66 60" stroke={meta.artStroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <rect x="8" y="10" width="7" height="110" rx="2" fill="rgba(0,0,0,0.4)" />
            <rect x="14" y="16" width="2" height="98" rx="1" fill={meta.accent} opacity="0.25" />
            <rect x="7" y="8" width="9" height="9" rx="0" fill="none" stroke="#c8a830" strokeWidth="1" opacity="0.7" />
            <rect x="84" y="8" width="9" height="9" rx="0" fill="none" stroke="#c8a830" strokeWidth="1" opacity="0.7" />
            <rect x="7" y="113" width="9" height="9" rx="0" fill="none" stroke="#c8a830" strokeWidth="1" opacity="0.7" />
            <rect x="84" y="113" width="9" height="9" rx="0" fill="none" stroke="#c8a830" strokeWidth="1" opacity="0.7" />
            <rect x="46" y="2" width="8" height="28" rx="0" fill="#c02020" opacity="0.9" />
            <path d="M46 28 L50 23 L54 28" fill="#8b1010" />
            <text x="50" y="96" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="6" fontWeight="800" letterSpacing="2" fill={meta.accent} fillOpacity="0.8">
                {meta.label}
            </text>
            <rect x="16" y="106" width="68" height="3" rx="0" fill="rgba(255,255,255,0.08)" />
            <rect x="16" y="106" width={Math.round(68 * (pct / 100))} height="3" rx="0" fill={meta.accent} fillOpacity="0.7" />
            <text x="50" y="116" textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="5" fill={meta.accent} fillOpacity="0.45" letterSpacing="1">
                {filled} / {total}
            </text>
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────
// AlbumCard — card del grid de álbumes
// ─────────────────────────────────────────────────────────────
function AlbumCard({ albumId, name, pct, isActive, isLocked, progress }) {
    const meta = ALBUM_META[albumId] ?? DEFAULT_META;

    return (
        <div className={`alb-mob-album-card${isLocked ? ' alb-mob-album-card--locked' : ''}`}>
            <div className={`alb-mob-album-bg ${meta.bg}`} />
            <div className="alb-mob-album-art">
                <svg width="70" height="70" viewBox="0 0 70 70" fill="none" aria-hidden="true">
                    <polygon
                        points="35,10 46,28 66,31 51,46 54,66 35,56 16,66 19,46 4,31 24,28"
                        fill={meta.artFill}
                        stroke={meta.artStroke}
                        strokeWidth="1.5"
                    />
                    <circle cx="35" cy="36" r="8" fill={meta.artFill} stroke={meta.artStroke} strokeWidth="1" />
                </svg>
            </div>
            {['tl', 'tr', 'bl', 'br'].map(pos => (
                <div
                    key={pos}
                    className={`alb-mob-album-corner alb-mob-album-corner--${pos}`}
                    style={{ borderColor: isLocked ? 'rgba(255,255,255,0.1)' : meta.cornerColor }}
                />
            ))}
            {isActive && !isLocked && (
                <div className="alb-mob-album-chip alb-mob-album-chip--active">Activo</div>
            )}
            {isLocked && (
                <div className="alb-mob-album-lock">
                    <Lock size={28} strokeWidth={1.5} color="rgba(255,255,255,0.3)" />
                </div>
            )}
            <div className="alb-mob-album-footer">
                {isLocked ? (
                    <>
                        <div className="alb-mob-album-name" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {name || 'BLOQUEADO'}
                        </div>
                        <div className="alb-mob-album-lock-text">Completa el álbum anterior</div>
                    </>
                ) : (
                    <>
                        <div className="alb-mob-album-name" style={{ color: meta.nameColor }}>{name}</div>
                        <div className="alb-mob-album-prog-row">
                            <div className="alb-mob-album-mini-bar">
                                <div className="alb-mob-album-mini-fill" style={{ width: `${Math.min(pct, 100)}%`, background: meta.barColor }} />
                            </div>
                            <span className="alb-mob-album-pct" style={{ color: pct >= 100 ? meta.accent : undefined }}>
                                {pct}%
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SeasonPath — camino de temporada
// ─────────────────────────────────────────────────────────────
function SeasonPath({ packsOpenedSinceLast = 0, boostActive, boostPacksRemaining }) {
    const PACKS_PER_BOOST = 10;
    const progress = boostActive
        ? 100
        : Math.min((packsOpenedSinceLast / PACKS_PER_BOOST) * 100, 100);

    return (
        <div className="alb-mob-season">
            <div className="alb-mob-season-title">Camino de temporada</div>
            <div className="alb-mob-season-track">
                <div className="alb-mob-season-line">
                    <div className="alb-mob-season-line-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="alb-mob-season-nodes">
                    {SEASON_NODES.map((node, i) => {
                        const passed = progress >= node.pos;
                        const isCurrent = !passed && i > 0 && progress > SEASON_NODES[i - 1].pos;
                        return (
                            <div key={node.pos} className="alb-mob-season-node-wrap">
                                <div className={[
                                    'alb-mob-season-node',
                                    passed ? 'alb-mob-season-node--done' : '',
                                    isCurrent ? 'alb-mob-season-node--current' : '',
                                ].join(' ')}>
                                    {passed
                                        ? <CheckCircle2 size={12} strokeWidth={2.2} />
                                        : <span>{node.val ?? ''}</span>
                                    }
                                </div>
                                <span className={`alb-mob-season-node-label${passed || isCurrent ? ' alb-mob-season-node-label--active' : ''}`}>
                                    {node.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="alb-mob-boost-row">
                <span className="alb-mob-boost-label">
                    {boostActive ? 'Boost activo' : 'Próximo boost · cada 10 sobres'}
                </span>
                <span className={`alb-mob-boost-val${boostActive ? ' alb-mob-boost-val--active' : ''}`}>
                    {boostActive
                        ? `${boostPacksRemaining} restantes`
                        : `${PACKS_PER_BOOST - (packsOpenedSinceLast ?? 0)} restantes`
                    }
                </span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TAB: Inicio — sobres grandes + camino de temporada
// ─────────────────────────────────────────────────────────────
function InicioTab({
    packsAvailable,
    boostActive,
    boostPacksRemaining,
    packsOpenedSinceLast,
    onOpenPacks,
}) {
    return (
        <div className="alb-mob-inicio-tab">
            {/* Bloque de sobres — grande y prominente */}
            <div className="alb-mob-packs-hero">
                <div className="alb-mob-packs-hero-glow" />
                <div className="alb-mob-packs-hero-inner">
                    <div className="alb-mob-packs-hero-icon">
                        <Package size={38} strokeWidth={1.4} color="var(--mob-accent)" />
                        {packsAvailable > 0 && (
                            <div className="alb-mob-packs-hero-badge">
                                {packsAvailable > 99 ? '99+' : packsAvailable}
                            </div>
                        )}
                    </div>
                    <div className="alb-mob-packs-hero-info">
                        <div className="alb-mob-packs-hero-label">Sobres disponibles</div>
                        <div className="alb-mob-packs-hero-count">
                            {packsAvailable > 0
                                ? packsAvailable === 1
                                    ? '1 sobre listo para abrir'
                                    : `${packsAvailable} sobres listos para abrir`
                                : 'Sin sobres disponibles'}
                        </div>
                    </div>
                    {packsAvailable > 0 && (
                        <button className="alb-mob-packs-hero-btn" onClick={onOpenPacks}>
                            Abrir
                        </button>
                    )}
                </div>
            </div>

            {/* Camino de temporada */}
            <SeasonPath
                packsOpenedSinceLast={packsOpenedSinceLast}
                boostActive={boostActive}
                boostPacksRemaining={boostPacksRemaining}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// AlbumCarouselBlock — un bloque de carrusel horizontal
// ─────────────────────────────────────────────────────────────
function AlbumCarouselBlock({ title, icon: Icon, items, renderItem }) {
    return (
        <div className="alb-mob-carousel-block">
            <div className="alb-mob-carousel-header">
                <Icon size={13} strokeWidth={2} className="alb-mob-carousel-icon" />
                <span className="alb-mob-carousel-title">{title}</span>
                <span className="alb-mob-carousel-count">{items?.length ?? 0}</span>
            </div>
            <div className="alb-mob-carousel-scroll">
                {(items ?? []).map((item, idx) => renderItem(item, idx))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TAB: Álbumes — 3 carruseles: legendary, estrellas, culto
// ─────────────────────────────────────────────────────────────
function AlbumsTab({
    legendary,
    progress,
    collection,
    allCards,
    cult,
    activeAlbumId,
    currentUserId,
}) {
    return (
        <div className="alb-mob-albums-tab">

            {/* ── Legendary ── */}
            <div className="alb-mob-carousel-block">
                <div className="alb-mob-carousel-header">
                    <Crown size={13} strokeWidth={2} className="alb-mob-carousel-icon" />
                    <span className="alb-mob-carousel-title">Álbumes Legendary</span>
                    <span className="alb-mob-carousel-count">{legendary?.length ?? 0}</span>
                </div>
                <div className="alb-mob-section-wrap">
                    <LegendaryAlbumsSection
                        definitions={legendary}
                        progress={progress}
                        collection={collection}
                    />
                </div>
            </div>

            {/* ── Estrellas ── */}
            <div className="alb-mob-carousel-block">
                <div className="alb-mob-carousel-header">
                    <Star size={13} strokeWidth={2} className="alb-mob-carousel-icon" />
                    <span className="alb-mob-carousel-title">Álbumes Estrellas</span>
                </div>
                <div className="alb-mob-section-wrap">
                    <StarCollectionSection
                        collection={collection}
                        allCards={allCards}
                    />
                </div>
            </div>

            {/* ── Culto ── */}
            <div className="alb-mob-carousel-block">
                <div className="alb-mob-carousel-header">
                    <BookMarked size={13} strokeWidth={2} className="alb-mob-carousel-icon" />
                    <span className="alb-mob-carousel-title">Álbumes de Culto</span>
                    <span className="alb-mob-carousel-count">{cult?.length ?? 0}</span>
                </div>
                <div className="alb-mob-section-wrap">
                    <CultAlbumsSection
                        definitions={cult}
                        collection={collection}
                        allCards={allCards}
                        currentUserId={currentUserId}
                    />
                </div>
            </div>

        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TAB: Misiones — placeholder en desarrollo
// ─────────────────────────────────────────────────────────────
function MisionesTab() {
    return (
        <div className="alb-mob-misiones-tab">
            <div className="alb-mob-misiones-empty">
                <div className="alb-mob-misiones-icon">
                    <Target size={40} strokeWidth={1.2} />
                </div>
                <div className="alb-mob-misiones-title">Misiones</div>
                <div className="alb-mob-misiones-sub">
                    Completa misiones para ganar sobres y recompensas especiales.
                </div>
                <div className="alb-mob-misiones-badge">Próximamente</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function AlbumsPageMobile() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('inicio');
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data?.user) return;
            supabase
                .from('users')
                .select('id')
                .eq('auth_id', data.user.id)
                .maybeSingle()
                .then(({ data: profile }) => {
                    if (profile?.id) setUserId(profile.id);
                });
        });
    }, []);

    const {
        packsAvailable,
        boostActive,
        boostPacksRemaining,
        packsOpenedSinceLast,
        refresh: refreshPacks,
    } = useAlbumPacks(userId);

    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(userId);
    const { progress, refresh: refreshProgress } = useAlbumProgress(userId);
    const { legendary, cult } = useAlbumDefinitions();
    const { allCards, refresh: refreshCards } = useAlbumCards();

    const { open, reset, phase, result, isGoat, isLegend, setPhase } = usePackOpening({
        onPackOpened: async () => {
            await refreshPacks();
            await computeAndSyncAlbumProgress(userId);
            refreshCollection();
            refreshProgress();
            refreshCards();
        },
    });

    useEffect(() => {
        refreshCards();
        if (userId) {
            computeAndSyncAlbumProgress(userId).then(() => refreshProgress());
        }
    }, [userId]);

    useEffect(() => {
        if (phase === 'revealing') {
            const t = setTimeout(() => setPhase('done'), 3200);
            return () => clearTimeout(t);
        }
    }, [phase, setPhase]);

    const activeAlbum = getActiveAlbum(legendary, progress);
    const activeAlbumProg = activeAlbum ? getAlbumProgress(activeAlbum.id, progress) : null;
    const activeUnique = activeAlbumProg?.unique_cards ?? 0;
    const activeRequired = activeAlbum?.required_unique_players ?? 30;
    const activePct = activeRequired > 0 ? Math.round((activeUnique / activeRequired) * 100) : 0;
    const activeMeta = ALBUM_META[activeAlbum?.id] ?? DEFAULT_META;

    const handleOpenModal = () => { reset(); setModalOpen(true); };
    const handleCloseModal = () => { reset(); setModalOpen(false); };
    const handleReset = async () => { await refreshPacks(); reset(); };

    return (
        <div className="alb-mob-root">

            {/* ── Header ─────────────────────────────────── */}
            <header className="alb-mob-header">
                <button className="alb-mob-back" onClick={() => navigate('/app')} aria-label="Volver">
                    <ChevronLeft size={18} strokeWidth={2} />
                </button>
                <div className="alb-mob-header-center">
                    <BookOpen size={12} strokeWidth={2} />
                    <span>Mis álbumes</span>
                </div>
                {packsAvailable > 0 ? (
                    <button
                        className="alb-mob-open-btn"
                        onClick={handleOpenModal}
                        aria-label={`Abrir sobres. ${packsAvailable} disponibles`}
                    >
                        <Package size={13} strokeWidth={2} />
                        <span>{packsAvailable > 99 ? '99+' : packsAvailable}</span>
                    </button>
                ) : (
                    <div className="alb-mob-header-spacer" />
                )}
            </header>

            {/* ── Hero — álbum activo ─────────────────────── */}
            {activeAlbum && (
                <section className="alb-mob-hero" aria-label="Álbum activo">
                    <div className="alb-mob-hero-toprow">
                        <div className="alb-mob-hero-pills">
                            <span className="alb-mob-pill alb-mob-pill--active">Activo</span>
                            <span className="alb-mob-pill alb-mob-pill--season">25/26</span>
                        </div>
                    </div>
                    <div className="alb-mob-hero-body">
                        <HeroBookSVG
                            meta={activeMeta}
                            pct={activePct}
                            filled={activeUnique}
                            total={activeRequired}
                        />
                        <div className="alb-mob-hero-info">
                            <div className="alb-mob-hero-eyebrow">Álbum activo</div>
                            <div className="alb-mob-hero-title">{activeAlbum.name}</div>
                            <div className="alb-mob-hero-desc">
                                {activeAlbum.description ?? 'Colecciona las leyendas del fútbol'}
                            </div>
                            <div className="alb-mob-hero-stats">
                                <div>
                                    <div className="alb-mob-stat-val">{activeUnique}</div>
                                    <div className="alb-mob-stat-label">Figuritas</div>
                                </div>
                                <div>
                                    <div className="alb-mob-stat-val">{activePct}<span>%</span></div>
                                    <div className="alb-mob-stat-label">Completado</div>
                                </div>
                            </div>
                            <div className="alb-mob-hero-prog">
                                <div className="alb-mob-prog-track">
                                    <div className="alb-mob-prog-fill" style={{ width: `${Math.min(activePct, 100)}%` }} />
                                </div>
                                <div className="alb-mob-prog-labels">
                                    <span className="alb-mob-prog-count">{activeUnique} / {activeRequired} figuritas</span>
                                    <span className="alb-mob-prog-pct">{activePct}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="alb-mob-hero-actions">
                        <button className="alb-mob-btn-primary">Ver álbum →</button>
                        <button className="alb-mob-btn-secondary">Info</button>
                    </div>
                    <div className="alb-mob-scroll-handle" aria-hidden="true" />
                </section>
            )}

            {/* ── Section tabs sticky ─────────────────── */}
            <nav className="alb-mob-snav" role="tablist" aria-label="Secciones">
                {NAV_TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={activeTab === id}
                        className={`alb-mob-snav-btn${activeTab === id ? ' alb-mob-snav-btn--active' : ''}`}
                        onClick={() => setActiveTab(id)}
                    >
                        <Icon size={14} strokeWidth={activeTab === id ? 2.2 : 1.6} />
                        <span>{label}</span>
                        {id === 'inicio' && packsAvailable > 0 && (
                            <span className="alb-mob-snav-dot" aria-hidden="true" />
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Body scrollable ────────────────────────── */}
            <div className="alb-mob-body">
                {collectionLoading ? (
                    <div className="alb-mob-loading" aria-label="Cargando colección">
                        <div className="alb-mob-loading-spinner" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'inicio' && (
                            <InicioTab
                                packsAvailable={packsAvailable}
                                boostActive={boostActive}
                                boostPacksRemaining={boostPacksRemaining}
                                packsOpenedSinceLast={packsOpenedSinceLast}
                                onOpenPacks={handleOpenModal}
                            />
                        )}
                        {activeTab === 'albums' && (
                            <AlbumsTab
                                legendary={legendary}
                                progress={progress}
                                collection={collection}
                                allCards={allCards}
                                cult={cult}
                                activeAlbumId={activeAlbum?.id}
                                currentUserId={userId}
                            />
                        )}
                        {activeTab === 'misiones' && <MisionesTab />}
                    </>
                )}
            </div>

            {/* ── PackOpeningModal ───────────────────────── */}
            <PackOpeningModal
                isOpen={modalOpen}
                phase={phase}
                result={result}
                packsAvailable={packsAvailable}
                isGoat={isGoat}
                isLegend={isLegend}
                onOpen={() => open(userId)}
                onClose={handleCloseModal}
                onReset={handleReset}
            />
        </div>
    );
}