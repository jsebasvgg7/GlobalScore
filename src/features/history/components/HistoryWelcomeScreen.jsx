import { useState, useEffect, useRef } from "react";
import "../../styles/StylesHistory/HistoryWelcomeScreen.css";

// ─── Partículas flotantes ────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 6,
  }));

  return (
    <div className="hws-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="hws-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Puerta de Bóveda SVG ────────────────────────────────────
function VaultDoor({ isOpen, isSpinning }) {
  return (
    <div
      className={`hws-vault-wrap${isOpen ? " hws-vault-wrap--open" : ""}${isSpinning ? " hws-vault-wrap--spin" : ""}`}
      aria-hidden="true"
    >
      {/* Sombra ambiental detrás */}
      <div className="hws-vault-shadow" />

      {/* Marco fijo de la bóveda */}
      <div className="hws-vault-frame">
        <div className="hws-vault-frame-inner">
          {/* Interior de la bóveda (visible cuando se abre) */}
          <div className="hws-vault-interior">
            <div className="hws-vault-interior-glow" />
            <div className="hws-vault-safebox-row">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="hws-vault-safebox" />
              ))}
            </div>
            <div className="hws-vault-safebox-row hws-vault-safebox-row--sm">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="hws-vault-safebox hws-vault-safebox--sm" />
              ))}
            </div>
          </div>

          {/* PUERTA — esta es la que gira */}
          <div className="hws-vault-door">
            {/* Anillos decorativos */}
            <div className="hws-door-ring hws-door-ring--outer" />
            <div className="hws-door-ring hws-door-ring--mid" />
            <div className="hws-door-ring hws-door-ring--inner" />

            {/* Rayos / dientes del dial */}
            <div className="hws-door-spokes">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="hws-door-spoke"
                  style={{ transform: `rotate(${i * 22.5}deg)` }}
                />
              ))}
            </div>

            {/* Centro del dial */}
            <div className="hws-door-center">
              <div className="hws-door-center-dot" />
            </div>

            {/* Pasadores de cierre (bolts) */}
            {["top", "bottom", "left", "right"].map((pos) => (
              <div key={pos} className={`hws-door-bolt hws-door-bolt--${pos}`} />
            ))}

            {/* Ornamento filigrana */}
            <div className="hws-door-ornament" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function HistoryWelcomeScreen({ onEnter }) {
  const [phase, setPhase] = useState("idle"); // idle | spinning | opening | done
  const timeouts = useRef([]);

  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timeouts.current.push(id);
  };

  useEffect(() => {
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const handleEnter = () => {
    if (phase !== "idle") return;
    setPhase("spinning");
    schedule(() => setPhase("opening"), 1800);
    schedule(() => {
      setPhase("done");
      onEnter?.();
    }, 3200);
  };

  const isSpinning = phase === "spinning";
  const isOpen = phase === "opening" || phase === "done";

  return (
    <div className={`hws-root${isOpen ? " hws-root--opening" : ""}`}>
      {/* Fondo con textura */}
      <div className="hws-bg" aria-hidden="true">
        <div className="hws-bg-grid" />
        <div className="hws-bg-vignette" />
      </div>

      <Particles />

      {/* Contenido central */}
      <div className="hws-center">
        {/* Cabecera */}
        <header className="hws-header">
          <div className="hws-header-eyebrow">
            <span className="hws-eyebrow-line" />
            <span className="hws-eyebrow-text">Archivo Histórico</span>
            <span className="hws-eyebrow-line" />
          </div>
          <h1 className="hws-title">
            <span className="hws-title-top">BÓVEDA</span>
            <span className="hws-title-bottom">HISTÓRICA</span>
          </h1>
          <p className="hws-subtitle">
            Las leyendas del fútbol mundial aguardan dentro.<br />
            Accede al archivo de los grandes de todos los tiempos.
          </p>
        </header>

        {/* Puerta */}
        <div className="hws-vault-section">
          <VaultDoor isOpen={isOpen} isSpinning={isSpinning} />
        </div>

        {/* CTA */}
        <div className="hws-cta-wrap">
          <button
            className={`hws-cta-btn${phase !== "idle" ? " hws-cta-btn--busy" : ""}`}
            onClick={handleEnter}
            disabled={phase !== "idle"}
          >
            <span className="hws-cta-inner">
              {phase === "idle" && (
                <>
                  <span className="hws-cta-icon">⟳</span>
                  <span>Abrir Bóveda</span>
                </>
              )}
              {phase === "spinning" && <span>Girando mecanismo…</span>}
              {(phase === "opening" || phase === "done") && <span>Accediendo…</span>}
            </span>
            <span className="hws-cta-shine" />
          </button>

          <p className="hws-cta-hint">
            {phase === "idle" ? "Gira el mecanismo para acceder" : "Bienvenido al archivo histórico"}
          </p>
        </div>
      </div>

      {/* Overlay de transición final */}
      <div className={`hws-transition-overlay${isOpen ? " hws-transition-overlay--active" : ""}`} />
    </div>
  );
}
