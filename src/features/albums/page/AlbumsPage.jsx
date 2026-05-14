import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
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
import { useEffect } from 'react';

export default function AlbumsPage() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);
    const [allCards, setAllCards] = useState([]);

    const { packs, barPercent, packsAvailable, refresh: refreshPacks } = useAlbumPacks(user?.id);
    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(user?.id);
    const { progress, refresh: refreshProgress } = useAlbumProgress(user?.id);
    const { definitions, legendary, stars, cult } = useAlbumDefinitions();

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

    const handleOpenModal = () => {
        reset();
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        reset();
        setModalOpen(false);
    };

    const handlePackOpen = () => open(user?.id);

    const handleReset = () => {
        reset();
    };

    useEffect(() => {
        if (phase === 'revealing') {
            const t = setTimeout(() => setPhase('done'), 3200);
            return () => clearTimeout(t);
        }
    }, [phase, setPhase]);

    return (
        <div className="alp-root page-root">
            <div className="alp-container container">

                {/* Header */}
                <div className="alp-header">
                    <div className="alp-header-left">
                        <h1 className="alp-title">📖 GlobalAlbums</h1>
                        <p className="alp-subtitle">Colecciona, completa y demuestra quién sabe de fútbol</p>
                    </div>

                    {packsAvailable > 0 && (
                        <button className="alp-open-btn" onClick={handleOpenModal}>
                            📦 Abrir {packsAvailable === 1 ? 'sobre' : `${packsAvailable} sobres`}
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                <div className="alp-bar-section">
                    <AlbumProgressBar percent={barPercent} packsAvailable={packsAvailable} />
                </div>

                {/* Nav */}
                <AlbumsSectionNav active={activeSection} onChange={setActiveSection} />

                {/* Sections */}
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
                onOpen={handlePackOpen}
                onClose={handleCloseModal}
                onReset={handleReset}
            />
        </div>
    );
}