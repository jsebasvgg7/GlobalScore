import React from "react";
import { useWindowManager, APP_REGISTRY } from "./WindowManagerContext";
import "./Window.css";

// ── Ventana genérica ─────────────────────────────────────────
// Sin drag/resize todavía — posición fija según el estado de
// WindowManager (cascada al abrir). Foco al hacer click.
export default function Window({ window }) {
  const { closeWindow, minimizeWindow, focusWindow, windows, sharedProps } = useWindowManager();

  const app = APP_REGISTRY[window.appId];
  const AppContent = app?.component;

  const maxZ = Math.max(...windows.map((w) => w.zIndex), 1);
  const isFocused = window.zIndex === maxZ;

  if (window.isMinimized) return null;

  return (
    <div
      className={`win ${isFocused ? "win--focused" : "win--dimmed"}`}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        minHeight: window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={() => focusWindow(window.id)}
    >
      <div className="win-titlebar">
        <span className="win-titlebar-label">{window.title}</span>
        <div className="win-titlebar-controls">
          <button
            className="win-btn win-btn--minimize"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }}
            aria-label="Minimizar"
          />
          <button
            className="win-btn win-btn--close"
            onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }}
            aria-label="Cerrar"
          />
        </div>
      </div>
      <div className="win-body">
        {AppContent ? <AppContent {...sharedProps} /> : <p className="win-empty">Contenido no registrado.</p>}
      </div>
    </div>
  );
}