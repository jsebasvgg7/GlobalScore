import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import { useAlbumCollection } from '../hooks/useAlbumCollection';
import { useAlbumProgress } from '../hooks/useAlbumProgress';
import { useAlbumDefinitions } from '../hooks/useAlbumDefinitions';
import { usePackOpening } from '../hooks/usePackOpening';
import { getAlbumCards } from '../services/albums.service';
import AlbumsSectionNav from '../components/AlbumsSectionNav';
import AlbumProgressBar from '../components/AlbumProgressBar';
import LegendaryAlbumsSection from '../components/LegendaryAlbumsSection';
import StarCollectionSection from '../components/StarCollectionSection';
import CultAlbumsSection from '../components/CultAlbumsSection';
import PackOpeningModal from '../components/PackOpeningModal';
import { primaryButtonProps } from '../motion/variants';
import './AlbumsPage.css';

// ── Variantes locales de esta página ──────────────────────────────────────
const heroVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.32, ease: 'easeOut' },
    },
};

const barFillVariants = {
    hidden: { width: '0%' },
    visible: (pct) => ({
        width: `${pct}%`,
        transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.2 },
    }),
};

export default function AlbumsPage({ currentUser }) {
    const user = currentUser;
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);
    const [allCards, setAllCards] = useState([]);

    const { packs, barPercent, packsAvailable, refresh: refreshPacks } = useAlbumPacks(user?.id);
    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(user?.id);
    const { progress, refresh: refreshProgress } = useAlbumProgress(user?.id);
    const { legendary, cult } = useAlbumDefinitions();

    const { open, reset, phase, result, isGoat, isLegend, setPhase } = usePackOpening({
        onPackOpened: () => {
            refreshPacks();
            refreshCollection();
            refreshProgress();
        },
    });

    useEffect(() => {
        getAlbumCards().then(setAllCards).catch(console.error);
    }, []);

    useEffect(() => {
        if (phase === 'revealing') {
            const t = setTimeout(() => setPhase('done'), 3200);
            return () => clearTimeout(t);
        }
    }, [phase, setPhase]);

    const handleOpenModal = () => { reset(); setModalOpen(true); };
    const handleCloseModal = () => { reset(); setModalOpen(false); };

    return (
        <div className="alp-root">

            {/* ── HERO ── */}
            <motion.div
                className="alp-hero"
                variants={heroVariants}
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

                {/* Botón con Framer — reemplaza CSS transform hover/active */}
                <AnimatePresence>
                    {packsAvailable > 0 && (
                        <motion.button
                            className="alp-open-btn"
                            onClick={handleOpenModal}
                            {...primaryButtonProps}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="alp-open-btn-count">{packsAvailable}</span>
                            Abrir {packsAvailable === 1 ? 'sobre' : 'sobres'}
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── BARRA DE PROGRESO ── */}
            <div className="alp-bar-section">
                <div className="alp-bar-header">
                    <span className="alp-bar-label">Progreso · próximo sobre</span>
                    <span className="alp-bar-pct">{barPercent}%</span>
                </div>

                {/* Progress bar con motion — reemplaza transition: width en CSS */}
                <div className="apb-root">
                    <div className="apb-bar-wrap">
                        <motion.div
                            className="apb-bar-fill"
                            custom={barPercent}
                            variants={barFillVariants}
                            initial="hidden"
                            animate="visible"
                            key={barPercent} // re-anima si cambia el valor
                        />
                    </div>
                </div>
            </div>

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
                    />
                )}
            </div>

            <PackOpeningModal
                isOpen={modalOpen}
                phase={phase}
                result={result}
                packsAvailable={packsAvailable}
                isGoat={isGoat}
                isLegend={isLegend}
                onOpen={() => open(user?.id)}
                onClose={handleCloseModal}
                onReset={reset}
            />
        </div>
    );
}