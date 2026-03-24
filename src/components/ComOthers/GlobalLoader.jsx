import React from "react";
import "../../styles/StylesOthers/GlobalLoader.css";

/**
 * GlobalLoader — spinner unificado para todo el proyecto
 *
 * Variantes:
 *  - "page"    → pantalla completa, bloquea el layout (reemplaza PageLoader)
 *  - "overlay" → fixed overlay semitransparente (reemplaza LoadingOverlay)
 *  - "inline"  → dentro de un contenedor, flex-centered (reemplaza spinners de secciones)
 *  - "dots"    → tres puntos rebotando, fondo transparente (reemplaza LoadingDots)
 *
 * Tamaños (solo aplica a inline/overlay):
 *  - "sm" → 20px  | "md" → 32px (default) | "lg" → 48px
 *
 * Props:
 *  - variant?  "page" | "overlay" | "inline" | "dots"  (default: "inline")
 *  - size?     "sm" | "md" | "lg"                       (default: "md")
 *  - label?    string — texto opcional bajo el spinner
 *  - message?  string — alias de label para compatibilidad con LoadingOverlay
 *  - color?    string — color CSS (default: var(--accent))
 */
export default function GlobalLoader({
  variant = "inline",
  size = "md",
  label,
  message,
  color,
}) {
  const text = label || message;

  if (variant === "dots") {
    return (
      <span className="gl-dots" style={color ? { "--gl-color": color } : {}}>
        <span className="gl-dot" />
        <span className="gl-dot" />
        <span className="gl-dot" />
      </span>
    );
  }

  const spinner = (
    <span
      className={`gl-ring gl-ring--${size}`}
      style={color ? { "--gl-color": color } : {}}
      aria-hidden="true"
    />
  );

  if (variant === "page") {
    return (
      <div className="gl-page" role="status" aria-label={text || "Cargando"}>
        <div className="gl-page-inner">
          {spinner}
          {text && <span className="gl-page-label">{text}</span>}
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="gl-overlay" role="status" aria-label={text || "Procesando"}>
        <div className="gl-overlay-inner">
          {spinner}
          {text && <span className="gl-overlay-label">{text}</span>}
        </div>
      </div>
    );
  }

  /* inline — default */
  return (
    <div className={`gl-inline gl-inline--${size}`} role="status" aria-label={text || "Cargando"}>
      {spinner}
      {text && <span className="gl-inline-label">{text}</span>}
    </div>
  );
}

/* ── Exportaciones de compatibilidad con los componentes existentes ── */

/** Reemplaza <PageLoader /> */
export function PageLoader() {
  return <GlobalLoader variant="page" />;
}

/** Reemplaza <LoadingOverlay message="..." /> */
export function LoadingOverlay({ message }) {
  return <GlobalLoader variant="overlay" message={message} />;
}

/** Reemplaza <LoadingDots /> */
export function LoadingDots({ color }) {
  return <GlobalLoader variant="dots" color={color} />;
}

/** Reemplaza <Spinner size={n} color="..." /> */
export function Spinner({ size, color }) {
  const s = size >= 40 ? "lg" : size >= 24 ? "md" : "sm";
  return <GlobalLoader variant="inline" size={s} color={color} />;
}

/** Reemplaza <ButtonLoader size={n} /> */
export function ButtonLoader({ size }) {
  return <GlobalLoader variant="dots" />;
}