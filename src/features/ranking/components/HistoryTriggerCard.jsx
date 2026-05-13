import React from 'react';
import { History, ChevronRight, X } from 'lucide-react';

export default function HistoryTriggerCard({ isOpen, onToggle }) {
  return (
    <button
      className={`htc-root${isOpen ? ' htc-root--active' : ''}`}
      onClick={onToggle}
      aria-pressed={isOpen}
      aria-label={isOpen ? 'Cerrar historial' : 'Ver historial mensual'}
    >
      <span className="htc-icon-wrap">
        <History size={13} />
      </span>

      <span className="htc-label-group">
        <span className="htc-label">HISTORIAL</span>
        <span className="htc-sub">Rankings mensuales archivados</span>
      </span>

      <span className={`htc-chevron${isOpen ? ' htc-chevron--close' : ''}`}>
        {isOpen ? <X size={12} /> : <ChevronRight size={12} />}
      </span>

      {/* Active state scanner line */}
      {isOpen && <span className="htc-scan" aria-hidden="true" />}
    </button>
  );
}
