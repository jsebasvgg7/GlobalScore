import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import AlbumProgressBar from './AlbumProgressBar';
import '../styles/AlbumBookEntry.css';

export default function AlbumBookEntry({ currentUser }) {
    const navigate = useNavigate();
    const { packs, barPercent, packsAvailable, loading } = useAlbumPacks(currentUser?.id);

    if (loading) return null;

    return (
        <button className="abe-root" onClick={() => navigate('/albums')}>

            <div className="abe-book-zone">
                <div className="abe-spine" />
                <div className="abe-book-bg">
                    <svg
                        className="abe-book-svg"
                        width="28"
                        height="28"
                        viewBox="0 0 28 28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M14 22V8" />
                        <path d="M14 8 C14 8 10 7 5 8.5 L5 23 C10 21.5 14 22 14 22" />
                        <path d="M14 8 C14 8 18 7 23 8.5 L23 23 C18 21.5 14 22 14 22" />
                        <line x1="7.5" y1="12" x2="11.5" y2="11.2" />
                        <line x1="7.5" y1="15" x2="11.5" y2="14.2" />
                        <line x1="7.5" y1="18" x2="11.5" y2="17.2" />
                        <line x1="20.5" y1="12" x2="16.5" y2="11.2" />
                        <line x1="20.5" y1="15" x2="16.5" y2="14.2" />
                        <line x1="20.5" y1="18" x2="16.5" y2="17.2" />
                    </svg>
                </div>
            </div>

            <div className="abe-content">
                <div className="abe-top">
                    <span className="abe-title">GlobalAlbums</span>
                    {packsAvailable > 0 && (
                        <span className="abe-badge">
                            {packsAvailable} {packsAvailable === 1 ? 'sobre' : 'sobres'}
                        </span>
                    )}
                </div>
                <div className="abe-sub">
                    Temporada 25/26
                </div>
                <AlbumProgressBar percent={barPercent} compact />
            </div>

            <span className="abe-arrow" aria-hidden="true">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 4l4 4-4 4" />
                </svg>
            </span>
        </button>
    );
}