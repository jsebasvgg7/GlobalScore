/* ════════════════════════════════════════════════
   GLOBALALBUMS — MOTION VARIANTS
   Importar desde cualquier componente del feature
   Framer Motion v12
════════════════════════════════════════════════ */

// ── Libro en estantería (hover 3D) ──────────────────────────────────────────
export const bookShelfVariants = {
    rest: {
        rotateY: -14,
        rotateX: 1,
        y: 0,
        filter: 'drop-shadow(4px 16px 20px rgba(0,0,0,0.45)) drop-shadow(2px 4px 6px rgba(0,0,0,0.25))',
    },
    hover: {
        rotateY: -3,
        rotateX: 0.5,
        y: -10,
        filter: 'drop-shadow(6px 28px 32px rgba(0,0,0,0.45)) drop-shadow(2px 6px 10px rgba(0,0,0,0.3))',
        transition: { type: 'spring', stiffness: 160, damping: 18 },
    },
};

// ── Label que aparece debajo del libro al hover ─────────────────────────────
export const bookLabelVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: 'easeOut' },
    },
};

// ── Modal libro abierto (entrada con spring) ────────────────────────────────
export const openBookVariants = {
    hidden: {
        opacity: 0,
        scale: 0.86,
        rotateX: 10,
    },
    visible: {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: { type: 'spring', stiffness: 180, damping: 22 },
    },
};

// ── Overlay (fade simple) ───────────────────────────────────────────────────
export const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.22 },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.18 },
    },
};

// ── Carta de sobre (stagger por índice) ────────────────────────────────────
export const revealCardVariants = {
    hidden: {
        opacity: 0,
        y: -30,
        rotate: -3,
    },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: {
            delay: i * 0.12,
            type: 'spring',
            stiffness: 200,
            damping: 20,
        },
    }),
};

// ── Modal PackOpening entrada ───────────────────────────────────────────────
export const packModalVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.97,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 220, damping: 24 },
    },
};

// ── Accordion expand/collapse (height: auto) ────────────────────────────────
export const accordionVariants = {
    hidden: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.24, ease: [0.23, 1, 0.32, 1] },
    },
    visible: {
        height: 'auto',
        opacity: 1,
        transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] },
    },
};

// ── Section switch en mobile (slide lateral) ────────────────────────────────
export const sectionSlideVariants = {
    hidden: (dir) => ({
        opacity: 0,
        x: dir > 0 ? 20 : -20,
    }),
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: (dir) => ({
        opacity: 0,
        x: dir > 0 ? -20 : 20,
        transition: { duration: 0.15, ease: 'easeIn' },
    }),
};

// ── Slot de figurita (whileInView, once) ────────────────────────────────────
export const stickerSlotVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: Math.min(i * 0.04, 0.3), // máximo 300ms de delay total
            duration: 0.22,
            ease: 'easeOut',
        },
    }),
};

// ── Botón principal (hero) ──────────────────────────────────────────────────
export const primaryButtonProps = {
    whileHover: { scale: 1.03, y: -1 },
    whileTap: { scale: 0.97, y: 1 },
    transition: { type: 'spring', stiffness: 400, damping: 20 },
};

// ── Botón mobile (tap only) ─────────────────────────────────────────────────
export const mobileButtonProps = {
    whileTap: { scale: 0.94 },
    transition: { type: 'spring', stiffness: 400, damping: 20 },
};