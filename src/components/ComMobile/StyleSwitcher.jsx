import React from "react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/StylesMobile/StyleSwitcher.css";

const STYLES = [
  {
    id: "brutalist",
    name: "Brutalist",
    preview: (
      <div className="preview-brutalist">
        <div className="pb-bar" />
        <div className="pb-card">
          <div className="pb-line pb-line--accent" />
          <div className="pb-line pb-line--muted" />
        </div>
        <div className="pb-card">
          <div className="pb-line pb-line--short" />
          <div className="pb-line pb-line--muted" />
          <div className="pb-row">
            <div className="pb-chip" />
            <div className="pb-chip" />
          </div>
        </div>
        <div className="pb-card">
          <div className="pb-line pb-line--accent" />
          <div className="pb-line pb-line--muted" />
          <div className="pb-line pb-line--short" />
        </div>
      </div>
    ),
  },
  {
    id: "neumorphism",
    name: "Soft UI",
    preview: (
      <div className="preview-neumorphism">
        <div className="pn-card">
          <div className="pn-line pn-line--muted" />
          <div className="pn-track"><div className="pn-fill" /></div>
        </div>
        <div className="pn-card">
          <div className="pn-line pn-line--accent" />
          <div className="pn-line pn-line--muted" />
          <div className="pn-pill" />
        </div>
        <div className="pn-card">
          <div className="pn-line pn-line--muted" />
          <div className="pn-line pn-line--accent" />
        </div>
      </div>
    ),
  },
];

export default function StyleSwitcher() {
  const { visualStyle, setStyle } = useTheme();

  return (
    <div className="style-switcher">
      <div className="style-switcher-title">Estilo visual</div>
      <div className="style-switcher-grid">
        {STYLES.map((s) => (
          <button
            key={s.id}
            className={`style-card${visualStyle === s.id ? " style-card--active" : ""}`}
            onClick={() => setStyle(s.id)}
          >
            <div className="style-card-preview">{s.preview}</div>
            <div className="style-card-label">
              <span className="style-card-name">{s.name}</span>
              <div className="style-card-check">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}