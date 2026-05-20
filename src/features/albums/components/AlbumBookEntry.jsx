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
                whileHover={{ y: -6, scale: 1.07, filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.30))' }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                aria-label="GlobalAlbums"
            >
                {packsAvailable > 0 && (
                    <span className="abe-dot-badge" aria-hidden="true" />
                )}

                {/* Libro abierto SVG — el botón ES el libro */}
                <svg
                    className="abe-book-svg"
                    width="80"
                    height="62"
                    viewBox="0 0 160 124"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    {/* Sombra suave debajo */}
                    <ellipse cx="80" cy="117" rx="54" ry="5" fill="#c8b89a" opacity="0.45" />

                    {/* ── TAPA TRASERA IZQUIERDA ── */}
                    <path d="M16 20 L70 16 L70 100 L16 104 Z" fill="#7a5a1e" stroke="#5a3e0e" strokeWidth="1" />
                    <path d="M16 20 L16 104" stroke="#9a7228" strokeWidth="3" strokeLinecap="round" />
                    <path d="M16 20 L70 16" stroke="#b8922e" strokeWidth="1.2" />
                    <path d="M16 104 L70 100" stroke="#6a4e18" strokeWidth="1.2" />
                    {/* Esquinas decorativas izquierda */}
                    <rect x="11" y="15" width="10" height="10" rx="2" fill="#c8982e" stroke="#8b6914" strokeWidth="0.8" />
                    <rect x="11" y="97" width="10" height="10" rx="2" fill="#c8982e" stroke="#8b6914" strokeWidth="0.8" />
                    <circle cx="16" cy="20" r="2.5" fill="#e8b840" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="16" cy="104" r="2.5" fill="#e8b840" stroke="#8b6914" strokeWidth="0.6" />

                    {/* ── TAPA TRASERA DERECHA ── */}
                    <path d="M144 20 L90 16 L90 100 L144 104 Z" fill="#7a5a1e" stroke="#5a3e0e" strokeWidth="1" />
                    <path d="M144 20 L144 104" stroke="#9a7228" strokeWidth="3" strokeLinecap="round" />
                    <path d="M144 20 L90 16" stroke="#b8922e" strokeWidth="1.2" />
                    <path d="M144 104 L90 100" stroke="#6a4e18" strokeWidth="1.2" />
                    {/* Esquinas decorativas derecha */}
                    <rect x="139" y="15" width="10" height="10" rx="2" fill="#c8982e" stroke="#8b6914" strokeWidth="0.8" />
                    <rect x="139" y="97" width="10" height="10" rx="2" fill="#c8982e" stroke="#8b6914" strokeWidth="0.8" />
                    <circle cx="144" cy="20" r="2.5" fill="#e8b840" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="144" cy="104" r="2.5" fill="#e8b840" stroke="#8b6914" strokeWidth="0.6" />

                    {/* ── PÁGINAS IZQUIERDA ── */}
                    <path d="M24 24 Q47 22 70 20 L70 97 Q47 99 24 101 Z" fill="#eee8d0" />
                    {/* Líneas de páginas */}
                    <path d="M28 32 Q49 30 66 28" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 38 Q49 36 66 34" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 44 Q49 42 66 40" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 50 Q49 48 66 46" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 56 Q49 54 66 52" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 62 Q49 60 66 58" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 68 Q49 66 66 64" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 74 Q49 72 66 70" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M28 80 Q49 78 66 76" stroke="#c8b898" strokeWidth="0.7" fill="none" />

                    {/* ── PÁGINAS DERECHA ── */}
                    <path d="M136 24 Q113 22 90 20 L90 97 Q113 99 136 101 Z" fill="#eee8d0" />
                    <path d="M132 32 Q111 30 94 28" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 38 Q111 36 94 34" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 44 Q111 42 94 40" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 50 Q111 48 94 46" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 56 Q111 54 94 52" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 62 Q111 60 94 58" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 68 Q111 66 94 64" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 74 Q111 72 94 70" stroke="#c8b898" strokeWidth="0.7" fill="none" />
                    <path d="M132 80 Q111 78 94 76" stroke="#c8b898" strokeWidth="0.7" fill="none" />

                    {/* ── LOMO CENTRAL ── */}
                    <path d="M70 16 Q80 14 90 16 L90 100 Q80 102 70 100 Z" fill="#5a3e0e" stroke="#3a2808" strokeWidth="0.8" />
                    {/* Costura del lomo */}
                    <circle cx="80" cy="27" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="80" cy="37" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="80" cy="47" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="80" cy="57" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="80" cy="67" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="80" cy="77" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />
                    <circle cx="80" cy="87" r="2" fill="#e8d8a8" stroke="#8b6914" strokeWidth="0.6" />

                    {/* ── MARCADOR ROJO ── */}
                    <path d="M76 8 L76 50 L80 44 L84 50 L84 8 Z" fill="#c02020" stroke="#8b1010" strokeWidth="0.8" />

                    {/* ── ESQUINAS DORADAS de las páginas ── */}
                    <path d="M24 24 L24 33 M24 24 L33 24" stroke="#e8b840" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M24 101 L24 92 M24 101 L33 101" stroke="#e8b840" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M136 24 L136 33 M136 24 L127 24" stroke="#e8b840" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M136 101 L136 92 M136 101 L127 101" stroke="#e8b840" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
            </motion.button>


        </div>
    );
}