import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import { useAuth } from '@/context/ThemeContext';
import AlbumProgressBar from './AlbumProgressBar';
import '../styles/AlbumBookEntry.css';

export default function AlbumBookEntry() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { packs, barPercent, packsAvailable, loading } = useAlbumPacks(user?.id);

    if (loading || !packs) return null;

    return (
        <button className="abe-root" onClick={() => navigate('/albums')}>
            <div className="abe-icon">📖</div>

            <div className="abe-content">
                <div className="abe-top">
                    <span className="abe-title">GlobalAlbums</span>
                    {packsAvailable > 0 && (
                        <span className="abe-badge">
                            {packsAvailable} {packsAvailable === 1 ? 'sobre' : 'sobres'}
                        </span>
                    )}
                </div>

                <AlbumProgressBar percent={barPercent} compact />
            </div>

            <span className="abe-arrow">›</span>
        </button>
    );
}