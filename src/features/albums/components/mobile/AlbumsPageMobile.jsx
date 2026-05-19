import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Package } from 'lucide-react';
import { supabase } from '@/shared/services/supabase/client';
import { useAlbumPacks } from '../../hooks/useAlbumPacks';
import { useAlbumCollection } from '../../hooks/useAlbumCollection';
import { useAlbumProgress } from '../../hooks/useAlbumProgress';
import { useAlbumDefinitions } from '../../hooks/useAlbumDefinitions';
import { usePackOpening } from '../../hooks/usePackOpening';
import { getAlbumCards } from '../../services/albums.service';
import AlbumProgressBar from '../AlbumProgressBar';
import LegendaryAlbumsSection from '../LegendaryAlbumsSection';
import StarCollectionSection from '../StarCollectionSection';
import CultAlbumsSection from '../CultAlbumsSection';
import PackOpeningModal from '../PackOpeningModal';
import { useAlbumCards } from '../../hooks/useAlbumCards';
import '../../styles/mobile/AlbumsPageMobile.css';

const SECTIONS = [
    { id: 'legendary', label: 'Legendarios', icon: '👑' },
    { id: 'stars', label: 'Estrellas', icon: '⭐' },
    { id: 'cult', label: 'Culto', icon: '📒' },
];

export default function AlbumsPageMobile() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [activeSection, setActiveSection] = useState('legendary');
    const [modalOpen, setModalOpen] = useState(false);
    const { allCards, loading: cardsLoading, refresh: refreshCards } = useAlbumCards();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) {
                supabase
                    .from('users')
                    .select('id')
                    .eq('auth_id', data.user.id)
                    .maybeSingle()
                    .then(({ data: profile }) => {
                        if (profile?.id) setUserId(profile.id);
                    });
            }
        });
    }, []);

    const { packs, barPercent, packsAvailable, refresh: refreshPacks } = useAlbumPacks(userId);
    const { collection, loading: collectionLoading, refresh: refreshCollection } = useAlbumCollection(userId);
    const { progress, refresh: refreshProgress } = useAlbumProgress(userId);
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
        <div className="alb-mob-root">

            {/* ── Header ── */}
            <header className="alb-mob-header">
                <button
                    className="alb-mob-back"
                    onClick={() => navigate('/app')}
                    aria-label="Volver"
                >
                    <ChevronLeft size={20} strokeWidth={2} />
                </button>

                <div className="alb-mob-header-center">
                    <BookOpen size={16} strokeWidth={2} />
                    <span>GlobalAlbums</span>
                </div>

                {packsAvailable > 0 ? (
                    <button className="alb-mob-open-btn" onClick={handleOpenModal}>
                        <Package size={14} />
                        <span>{packsAvailable}</span>
                    </button>
                ) : (
                    <div className="alb-mob-header-spacer" />
                )}
            </header>

            {/* ── Barra de progreso ── */}
            {packs && (
                <div className="alb-mob-bar-wrap">
                    <AlbumProgressBar
                        percent={barPercent}
                        packsAvailable={packsAvailable}
                        compact
                    />
                </div>
            )}

            {/* ── Section nav ── */}
            <nav className="alb-mob-snav">
                {SECTIONS.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        className={`alb-mob-snav-btn${activeSection === id ? ' alb-mob-snav-btn--active' : ''}`}
                        onClick={() => setActiveSection(id)}
                    >
                        <span className="alb-mob-snav-icon">{icon}</span>
                        <span className="alb-mob-snav-label">{label}</span>
                    </button>
                ))}
            </nav>

            {/* ── Contenido ── */}
            <main className="alb-mob-main">
                {collectionLoading ? (
                    <div className="alb-mob-loading">
                        <div className="alb-mob-loading-spinner" />
                    </div>
                ) : (
                    <>
                        {activeSection === 'legendary' && (
                            <LegendaryAlbumsSection
                                definitions={legendary}
                                progress={progress}
                                collection={collection}
                            />
                        )}
                        {activeSection === 'stars' && (
                            <StarCollectionSection
                                collection={collection}
                                allCards={allCards}
                            />
                        )}
                        {activeSection === 'cult' && (
                            <CultAlbumsSection
                                definitions={cult}
                                collection={collection}
                                allCards={allCards}
                            />
                        )}
                    </>
                )}
            </main>

            <PackOpeningModal
                isOpen={modalOpen}
                phase={phase}
                result={result}
                packsAvailable={packsAvailable}
                isGoat={isGoat}
                isLegend={isLegend}
                onOpen={() => open(userId)}
                onClose={handleCloseModal}
                onReset={reset}
            />
        </div>
    );
}