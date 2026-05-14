import React, { useState, useEffect } from 'react';
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
import './AlbumsPage.css';

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
        <div className="alp-root page-root">
            <div className="alp-container">

                {/* ── Hero ── */}
                <div className="alp-hero">
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

                    {packsAvailable > 0 && (
                        <button className="alp-open-btn" onClick={handleOpenModal}>
                            <span className="alp-open-btn-count">{packsAvailable}</span>
                            Abrir {packsAvailable === 1 ? 'sobre' : 'sobres'}
                        </button>
                    )}
                </div>

                {/* ── Barra de progreso ── */}
                <div className="alp-bar-section">
                    <div className="alp-bar-header">
                        <span className="alp-bar-label">Progreso · próximo sobre</span>
                        <span className="alp-bar-pct">{barPercent}%</span>
                    </div>
                    <AlbumProgressBar percent={barPercent} packsAvailable={packsAvailable} />
                </div>

                {/* ── Nav ── */}
                <AlbumsSectionNav active={activeSection} onChange={setActiveSection} />

                {/* ── Contenido ── */}
                <div className="alp-section-content">
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