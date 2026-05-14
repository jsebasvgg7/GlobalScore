import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import AlbumProgressBar from './AlbumProgressBar';
import '../styles/AlbumBookEntry.css';

// ── Variantes locales ──────────────────────────────────────────────────────
const rootVariants = {
    rest: { y: 0 },
    hover: {
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
    },
    tap: {
        y: 0,
        transition: { type: 'spring', stiffness: 600, damping: 28 },
    },
};

const spineVariants = {
    rest: { scaleY: 1 },
    hover: {
        scaleY: 1.04,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
};

const iconVariants = {
    rest: { rotate: 0, scale: 1 },
    hover: {
        rotate: -5,
        scale: 1.1,
        transition: { type: 'spring', stiffness: 300, damping: 18 },
    },
};

const arrowVariants = {
    rest: { x: 0, opacity: 0.4 },
    hover: {
        x: 4,
        opacity: 1,
        transition: { type: 'spring', stiffness: 400, damping: 22 },
    },
};

export default function AlbumBookEntry({ currentUser }) {
    const navigate = useNavigate();
    const { packs, barPercent, packsAvailable, loading } = useAlbumPacks(currentUser?.id);

    if (loading) return null;

    return (
        <motion.button
            className="abe-root"
            onClick={() => navigate('/albums')}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={rootVariants}
            // Framer controla el hover — quitamos el CSS :hover transform
            style={{ transform: 'none' }}
        >
            <div className="abe-book-zone">
                {/* Spine con micro-scale vertical */}
                <motion.div className="abe-spine" variants={spineVariants} />

                {/* Ícono del libro con rotación suave */}
                <motion.div className="abe-book-bg" variants={iconVariants}>
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
                </motion.div>
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

            {/* Flecha con slide derecha */}
            <motion.span className="abe-arrow" variants={arrowVariants} aria-hidden="true">
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
            </motion.span>
        </motion.button>
    );
}