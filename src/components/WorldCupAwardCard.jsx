// src/components/WorldCupAwardCard.jsx
import React, { useState } from 'react';
import { Award } from 'lucide-react';

export default function WorldCupAwardCard({ award, value, onChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = award.icon;

  return (
    <div 
      className="wc-award-card-light"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Header con icono */}
      <div className="wc-award-header-light">
        <div className="wc-award-icon-container">
          <Icon size={28} />
        </div>
        <div className="wc-award-info-header">
          <h3 className="wc-award-name-light">{award.label}</h3>
          <span className="wc-award-category-light">{award.category}</span>
        </div>
      </div>

      {/* Formulario de predicción */}
      <div className="wc-award-prediction-form">
        <div className="wc-prediction-field-award">
          <label className="wc-prediction-label-award">
            <Award size={14} />
            <span>Tu Predicción</span>
          </label>
          <input
            type="text"
            className="wc-prediction-input-award"
            value={value}
            onChange={(e) => onChange(award.key, e.target.value)}
            placeholder={award.placeholder}
          />
        </div>
      </div>
    </div>
  );
}