import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAlbumPacks } from '../hooks/useAlbumPacks';
import '../styles/AlbumBookEntry.css';

export default function AlbumBookEntry({ currentUser }) {
    const navigate = useNavigate();
    const { packsAvailable, loading } = useAlbumPacks(currentUser?.id);
    const [hovered, setHovered] = React.useState(false);

    if (loading) return null;

    return (
        <div className="abe-float-anchor">
            <motion.button
                className="abe-float-btn"
                onClick={() => navigate('/albums')}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                aria-label="GlobalAlbums"
            >
                {packsAvailable > 0 && (
                    <span className="abe-dot-badge" aria-hidden="true" />
                )}
                <svg
                    className="abe-book-svg"
                    width="26"
                    height="26"
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
            </motion.button>
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        className="abe-tooltip"
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        GlobalAlbums
                        {packsAvailable > 0 && (
                            <span className="abe-tooltip-badge">
                                {packsAvailable}
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
}