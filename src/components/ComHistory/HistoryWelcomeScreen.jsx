import { useState } from "react";
import "../../../src/styles/StylesHistory/HistoryWelcomeScreen.css";

// ─── Íconos SVG inline ────────────────────────────────────────────────────────
function LockIcon({ unlocked }) {
  return (
    <svg
      className={`hws-lock-svg ${unlocked ? "hws-lock-svg--open" : ""}`}
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        className="hws-lock-body"
        x="6" y="34" width="52" height="38" rx="4"
        strokeWidth="3" strokeLinecap="round"
      />
      <path
        className={`hws-lock-shackle ${unlocked ? "hws-lock-shackle--open" : ""}`}
        d="M18 34V24C18 14.059 25.059 7 32 7C38.941 7 46 14.059 46 24V34"
        strokeWidth="3" strokeLinecap="round"
      />
      <circle className="hws-lock-eye" cx="32" cy="53" r="5" />
      <rect className="hws-lock-slot" x="30" y="53" width="4" height="8" rx="2" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      className="hws-key-svg"
      viewBox="0 0 100 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="hws-key-head" cx="18" cy="18" r="14" strokeWidth="3" />
      <circle className="hws-key-inner" cx="18" cy="18" r="7" strokeWidth="2.5" />
      <path className="hws-key-shaft" d="M32 18 H90" strokeWidth="3" strokeLinecap="round" />
      <path className="hws-key-teeth" d="M72 18 V26 M82 18 V23 M62 18 V28" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Partículas decorativas (Brutalist) ──────────────────────────────────────
function BrutalistParticles() {
  const shapes = [
    { x: "8%", y: "12%", size: 18, delay: 0, rotate: 0 },
    { x: "88%", y: "18%", size: 10, delay: 0.8, rotate: 45 },
    { x: "5%", y: "72%", size: 14, delay: 0.4, rotate: 15 },
    { x: "92%", y: "68%", size: 8, delay: 1.2, rotate: 30 },
    { x: "50%", y: "6%", size: 6, delay: 0.6, rotate: 0 },
    { x: "15%", y: "45%", size: 5, delay: 1.5, rotate: 60 },
    { x: "82%", y: "42%", size: 7, delay: 0.2, rotate: 20 },
  ];
  return (
    <div className="hws-particles" aria-hidden>
      {shapes.map((s, i) => (
        <div
          key={i}
          className="hws-particle"
          style={{
            left: s.x, top: s.y,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`,
            transform: `rotate(${s.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Ícono de llave compacto (para cápsula neu) ──────────────────────────────
function KeyCapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="13" stroke="white" strokeWidth="3" />
      <circle cx="18" cy="18" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <path d="M31 18H88" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 18V24M80 18V21M60 18V26" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Fondo medallón: arcos SVG + partículas orbitales ────────────────────────
function NeuBackground() {
  return (
    <svg
      className="hws-neu-arcs"
      viewBox="0 0 300 520"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <circle cx="150" cy="260" r="220" stroke="rgba(96,81,155,0.4)" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.18" />
      <circle cx="150" cy="260" r="180" stroke="rgba(96,81,155,0.35)" strokeWidth="0.5" strokeDasharray="3 8" opacity="0.18" />
      <circle cx="150" cy="260" r="140" stroke="rgba(96,81,155,0.3)" strokeWidth="0.5" opacity="0.18" />
      <circle cx="150" cy="260" r="100" stroke="rgba(96,81,155,0.25)" strokeWidth="0.5" opacity="0.18" />
      <circle cx="150" cy="75" r="4" fill="#60519b" opacity="0.18" />
      <circle cx="258" cy="165" r="3" fill="#60519b" opacity="0.14" />
      <circle cx="258" cy="355" r="4" fill="#C9961A" opacity="0.12" />
      <circle cx="42" cy="355" r="3" fill="#60519b" opacity="0.14" />
      <circle cx="42" cy="165" r="4" fill="#C9961A" opacity="0.10" />
      <circle cx="150" cy="445" r="3" fill="#60519b" opacity="0.12" />
      <rect x="144" y="66" width="12" height="2" rx="1" fill="#60519b" opacity="0.20" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoryWelcomeScreen({ onEnter, style = "brutalist" }) {
  const [phase, setPhase] = useState("idle"); // idle → turning → unlocking → exiting

  const isNeu = style === "neumorphism";

  const handleKey = () => {
    if (phase !== "idle") return;
    setPhase("turning");
    setTimeout(() => setPhase("unlocking"), 600);
    setTimeout(() => setPhase("exiting"), 1400);
    setTimeout(() => onEnter && onEnter(), 2000);
  };

  const bgNoise = !isNeu ? (
    <svg className="hws-bg-pattern" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <pattern id="hws-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hws-grid)" />
    </svg>
  ) : null;

  const isUnlocked = phase === "unlocking" || phase === "exiting";
  const isTurning = phase === "turning";

  // ── NEUMORPHISM ──────────────────────────────────────────────────────────────
  if (isNeu) {
    return (
      <div
        className={`hws-root hws-phase--${phase}`}
        data-style={style}
      >
        <NeuBackground />

        {phase === "unlocking" && <div className="hws-flash" />}

        <div className="hws-neu-medallion">

          {/* Anillos + disco con candado */}
          <div className="hws-neu-ring-wrap">
            <div className="hws-neu-ring hws-neu-ring--3" />
            <div className="hws-neu-ring hws-neu-ring--2" />
            <div className="hws-neu-ring hws-neu-ring--1" />

            <div className="hws-neu-dot" style={{ top: 4, left: "50%", transform: "translateX(-50%)" }} />
            <div className="hws-neu-dot" style={{ bottom: 4, left: "50%", transform: "translateX(-50%)" }} />
            <div className="hws-neu-dot" style={{ left: 4, top: "50%", transform: "translateY(-50%)" }} />
            <div className="hws-neu-dot" style={{ right: 4, top: "50%", transform: "translateY(-50%)" }} />

            <div className={`hws-neu-disc ${isUnlocked ? "hws-neu-disc--unlocked" : ""}`}>
              <div className={`hws-lock-wrap ${isUnlocked ? "hws-lock-wrap--unlocked" : ""}`}>
                <LockIcon unlocked={isUnlocked} />
              </div>
            </div>
          </div>

          <div className="hws-neu-overline">Archivos Históricos</div>

          <h1 className="hws-neu-title">
            Bien<em>venido</em><br />a la Historia
          </h1>

          <div className="hws-neu-rule" />

          <p className="hws-neu-sub">
            Torneos legendarios · Equipos icónicos<br />Momentos eternos
          </p>

          <div className="hws-neu-btn-wrap">
            <button
              className={`hws-neu-btn ${isTurning ? "hws-neu-btn--pressed" : ""}`}
              onClick={handleKey}
              disabled={phase !== "idle"}
              aria-label="Entrar a la sección histórica"
            >
              <span className="hws-neu-btn-text">
                {phase === "idle" && "Girar la llave"}
                {phase === "turning" && "Girando..."}
                {phase === "unlocking" && "¡Abierto!"}
                {phase === "exiting" && "Entrando..."}
              </span>
              <div className={`hws-neu-key-cap ${isTurning ? "hws-neu-key-cap--spinning" : ""}`}>
                <KeyCapIcon />
              </div>
            </button>

            {phase === "idle" && (
              <div className="hws-neu-hint">
                <div className="hws-neu-hint-pip" />
                <span>Acceso a {new Date().getFullYear() - 1870}+ años de fútbol</span>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ── BRUTALIST ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`hws-root hws-root--bru hws-phase--${phase}`}
      data-style={style}
    >
      {bgNoise}
      <BrutalistParticles />

      {phase === "unlocking" && <div className="hws-flash" />}

      <div className="hws-card">

        <div className="hws-eyebrow">
          <span className="hws-eyebrow-line" />
          <span className="hws-eyebrow-text">Archivos Históricos</span>
          <span className="hws-eyebrow-line" />
        </div>

        <div className={`hws-lock-wrap ${isUnlocked ? "hws-lock-wrap--unlocked" : ""}`}>
          <div className="hws-lock-glow" />
          <LockIcon unlocked={isUnlocked} />
        </div>

        <h1 className="hws-title">
          <span className="hws-title-line1">Bienvenido a</span>
          <span className="hws-title-line2">la Historia</span>
        </h1>

        <p className="hws-subtitle">
          Torneos legendarios · Equipos icónicos · Momentos eternos
        </p>

        <button
          className={`hws-key-btn ${isTurning ? "hws-key-btn--turning" : ""}`}
          onClick={handleKey}
          disabled={phase !== "idle"}
          aria-label="Entrar a la sección histórica"
        >
          <span className="hws-key-label">
            {phase === "idle" && "Girar la llave"}
            {phase === "turning" && "Girando..."}
            {phase === "unlocking" && "¡Abierto!"}
            {phase === "exiting" && "Entrando..."}
          </span>
          <span className="hws-key-icon-wrap">
            <KeyIcon />
          </span>
        </button>

        {phase === "idle" && (
          <p className="hws-hint">
            <span className="hws-hint-dot" />
            Acceso a {new Date().getFullYear() - 1870}+ años de fútbol
          </p>
        )}

      </div>

      <span className="hws-year-deco" aria-hidden>MMXXV</span>
    </div>
  );
}