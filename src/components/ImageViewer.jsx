// src/components/ImageViewer.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/ImageViewer.css';

export default function ImageViewer({ imageUrl, userName, onClose }) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Bloquear scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Prevenir cierre al hacer click en la imagen
  const handleImageClick = (e) => {
    e.stopPropagation();
  };

  // Touch events para swipe down
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) { // Solo permitir swipe hacia abajo
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Si se deslizó más de 100px, cerrar
    if (currentY > 100) {
      onClose();
    } else {
      setCurrentY(0);
    }
  };

  // Calcular opacidad del backdrop según el swipe
  const backdropOpacity = Math.max(0, 1 - (currentY / 300));

  return (
    <div 
      className="image-viewer-overlay" 
      onClick={onClose}
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${0.95 * backdropOpacity})`
      }}
    >
      {/* Header */}
      <div className="image-viewer-header">
        <div className="viewer-user-info">
        </div>
        <button className="viewer-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      {/* Imagen */}
      <div 
        className="image-viewer-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${currentY}px)`,
          opacity: backdropOpacity,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }}
      >
        <img 
          src={imageUrl} 
          alt={userName}
          className="viewer-image"
          onClick={handleImageClick}
        />
      </div>

      {/* Indicador de swipe */}
      <div className="swipe-indicator">
        <div className="swipe-line"></div>
      </div>
    </div>
  );
}