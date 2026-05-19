import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
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
import { useAlbumCards } from '../hooks/useAlbumCards';
import './AlbumsPage.css';

const heroVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' } },
};

export default function AlbumsPage({ currentUser }) {
    const user = currentUser;
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);
    const { allCards, loading: cardsLoading, refresh: refreshCards } = useAlbumCards();

    const { packs, barPercent, packsAvailable, refresh: refreshPacks } = useAlbumPacks(user?.id);
    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(user?.id);
    const { progress, refresh: refreshProgress } = useAlbumProgress(user?.id);
    const { legendary, cult } = useAlbumDefinitions();

    const { open, reset, phase, result, isGoat, isLegend, setPhase } = usePackOpening({
        onPackOpened: () => {
            refreshPacks();
            refreshCollection();
            refreshProgress();
            refreshCards();
        },
    });

    useEffect(() => {
        refreshCards();
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
                            <Package size={20} strokeWidth={2} />
                            <span className="alp-open-btn-count">{packsAvailable}</span>
                            <span className="alp-open-btn-text">
                                Abrir {packsAvailable === 1 ? 'sobre' : 'sobres'}
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="alp-bar-section">
                <AlbumProgressBar
                    percent={barPercent}
                    packsAvailable={packsAvailable}
                />
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