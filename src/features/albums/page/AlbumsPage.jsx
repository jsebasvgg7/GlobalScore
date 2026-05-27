import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
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

// ── Helpers ──────────────────────────────────────────────────────
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

// ── Variants ─────────────────────────────────────────────────────
const panelVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease: 'easeOut', delay: i * 0.06 },
    }),
};

export default function AlbumsPage({ currentUser }) {
    const user = currentUser;
    const [activePage, setActivePage] = useState('resumen');
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);
    const { allCards, loading: cardsLoading, refresh: refreshCards } = useAlbumCards();

    const { packsAvailable, boostActive, boostPacksRemaining, refresh: refreshPacks } = useAlbumPacks(user?.id);
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

    // Álbum activo para el panel izquierdo
    const activeAlbum = getActiveAlbum(legendary, progress);
    const activeAlbumProgress = activeAlbum ? getAlbumProgress(activeAlbum.id, progress) : null;
    const activeUnique = activeAlbumProgress?.unique_cards ?? 0;
    const activeRequired = activeAlbum?.required_unique_players ?? 30;
    const activePct = activeRequired > 0 ? Math.round((activeUnique / activeRequired) * 100) : 0;
    const activeCompleted = activeAlbumProgress?.is_completed ?? false;

    return (
        <div className="alp-root">

            {/* ══ NAV PRINCIPAL (siempre visible arriba) ══════════════════ */}
            <AlbumsPageNav active={activePage} onChange={setActivePage} />

            {/* ══ TAB: RESUMEN ════════════════════════════════════════════ */}
            {activePage === 'resumen' && (
                <>
                    {/* ── HERO STRIP ── */}
                    <motion.div
                        className="alp-hero"
                        variants={panelVariants}
                        custom={0}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="alp-hero-left">
                            <div className="alp-hero-eyebrow">
                                <span className="alp-hero-eyebrow-dot" />
                                Temporada 25 · 26
                            </div>
                            <h1 className="alp-hero-title">
                                Global<span className="alp-hero-title-accent">Albums</span>
                            </h1>
                            <p className="alp-hero-sub">
                                Colecciona · Completa · Demuestra quién sabe de fútbol
                            </p>
                        </div>
                    </motion.div>

                    {/* ── BODY: dos columnas ── */}
                    <div className="alp-body">

                        {/* Panel izquierdo: Álbum activo */}
                        <motion.aside
                            className="alp-active-panel"
                            variants={panelVariants}
                            custom={1}
                            initial="hidden"
                            animate="visible"
                        >
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

                            <div className="alp-active-progress">
                                <div className="alp-active-progress-track">
                                    <div
                                        className="alp-active-progress-fill"
                                        style={{ width: `${Math.min(activePct, 100)}%` }}
                                    />
                                </div>
                                <div className="alp-active-progress-labels">
                                    <span className="alp-active-progress-count">
                                        <strong>{activeUnique}</strong>
                                        <span>/{activeRequired} figuritas</span>
                                    </span>
                                    <span className="alp-active-progress-pct">{activePct}%</span>
                                </div>
                            </div>

                            {boostActive && (
                                <div className="alp-active-boost">
                                    <span className="alp-boost-icon">⚡</span>
                                    <span className="alp-boost-text">
                                        Boost activo · <strong>+25%</strong> probabilidades
                                    </span>
                                    <span className="alp-boost-remaining">
                                        {boostPacksRemaining} / 5 sobres restantes
                                    </span>
                                </div>
                            )}
                        </motion.aside>

                        {/* Panel derecho: Sobres disponibles */}
                        <motion.aside
                            className="alp-packs-panel"
                            variants={panelVariants}
                            custom={2}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="alp-packs-header">
                                <span className="alp-panel-eyebrow">Sobres disponibles</span>
                                {packsAvailable > 0 && (
                                    <span className="alp-packs-badge">{packsAvailable}</span>
                                )}
                            </div>

                            {packsAvailable > 0 ? (
                                <>
                                    <p className="alp-packs-desc">
                                        Tienes {packsAvailable} {packsAvailable === 1 ? 'sobre listo' : 'sobres listos'} para abrir.
                                    </p>
                                    <button className="alp-packs-open-btn" onClick={handleOpenModal}>
                                        <Package size={16} strokeWidth={2} />
                                        Abrir sobres
                                    </button>
                                </>
                            ) : (
                                <p className="alp-packs-empty">
                                    No hay sobres disponibles. ¡Sigue jugando para ganar más!
                                </p>
                            )}
                        </motion.aside>
                    </div>
                </>
            )}

            {/* ══ TAB: COLECCIÓN ══════════════════════════════════════════ */}
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

            {/* ══ MODAL APERTURA DE SOBRES ════════════════════════════════ */}
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