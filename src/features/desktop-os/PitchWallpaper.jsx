import React from "react";

// ── Wallpaper: silueta de cancha de fútbol ──────────────────
// Solo líneas técnicas, sin relleno — vive detrás de las
// ventanas y el dock, ocupando todo el desktop-canvas.
// viewBox fijo con preserveAspectRatio para que escale bien
// en cualquier resolución sin deformarse.
export default function PitchWallpaper() {
  return (
    <svg
      className="pitch-wallpaper"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Contorno de la cancha */}
      <rect x="80" y="60" width="1040" height="580" fill="none" />

      {/* Línea de medio campo */}
      <line x1="600" y1="60" x2="600" y2="640" />

      {/* Círculo central + punto */}
      <circle cx="600" cy="350" r="90" fill="none" />
      <circle cx="600" cy="350" r="3" />

      {/* Área grande izquierda */}
      <rect x="80" y="200" width="150" height="300" fill="none" />
      {/* Área chica izquierda */}
      <rect x="80" y="270" width="60" height="160" fill="none" />
      {/* Semicírculo izquierda */}
      <path d="M 230 265 A 65 65 0 0 1 230 435" fill="none" />
      {/* Punto penal izquierda */}
      <circle cx="200" cy="350" r="3" />

      {/* Área grande derecha */}
      <rect x="970" y="200" width="150" height="300" fill="none" />
      {/* Área chica derecha */}
      <rect x="1060" y="270" width="60" height="160" fill="none" />
      {/* Semicírculo derecha */}
      <path d="M 970 265 A 65 65 0 0 0 970 435" fill="none" />
      {/* Punto penal derecha */}
      <circle cx="1000" cy="350" r="3" />

      {/* Arcos de esquina */}
      <path d="M 80 80 A 20 20 0 0 0 100 60" fill="none" />
      <path d="M 1100 60 A 20 20 0 0 0 1120 80" fill="none" />
      <path d="M 100 640 A 20 20 0 0 0 80 620" fill="none" />
      <path d="M 1120 620 A 20 20 0 0 0 1100 640" fill="none" />
    </svg>
  );
}