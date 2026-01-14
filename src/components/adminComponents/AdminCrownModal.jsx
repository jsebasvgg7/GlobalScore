// src/components/adminComponents/AdminCrownModal.jsx
import React, { useState } from 'react';
import { X, Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { ToastContainer, useToast } from '../../components/Toast';
import '../../styles/adminStyles/AdminCrownModal.css';

export default function AdminCrownModal({ onClose, onAward, currentTopUser, currentMonth }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monthLabel, setMonthLabel] = useState(currentMonth || '');
  const toast = useToast();

  const handleAward = async () => {
    if (!currentTopUser) {
      setError('No hay un usuario top disponible');
      return;
    }

    if (!monthLabel) {
      setError('Por favor, especifica el mes (ej: 2026-01)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('award_monthly_championship', {
        winner_user_id: currentTopUser.id,
        month_label: monthLabel,
        awarded_by_user_id: supabase.auth.user()?.id // Asumiendo currentUser es el admin
      });

      if (error) throw error;

      toast.success(`👑 Corona otorgada a ${currentTopUser.name} para ${monthLabel}`);
      onAward?.(data);
      onClose();
    } catch (err) {
      console.error('Error awarding crown:', err);
      setError(err.message || 'Error al otorgar la corona');
      toast.error('❌ Error al otorgar la corona');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-crown-modal-overlay">
      <div className="admin-crown-modal">
        <div className="modal-header">
          <Trophy size={24} className="header-icon" />
          <h2>Otorgar Corona Mensual</h2>
          <button className="close-btn" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="user-info">
            <div className="user-detail">
              <span className="label">Campeón Actual:</span>
              <span className="value">{currentTopUser?.name || 'No disponible'}</span>
            </div>
            <div className="user-detail">
              <span className="label">Puntos Mensuales:</span>
              <span className="value">{currentTopUser?.monthly_points || 0}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="monthLabel">Mes (YYYY-MM):</label>
            <input
              id="monthLabel"
              type="text"
              value={monthLabel}
              onChange={(e) => setMonthLabel(e.target.value)}
              placeholder="Ej: 2026-01"
              disabled={isLoading}
            />
          </div>

          <p className="confirmation-text">
            ¿Confirmas otorgar la corona mensual a {currentTopUser?.name} para {monthLabel || 'el mes actual'}?
            <br />
            Esta acción es permanente y actualizará el contador de campeonatos.
          </p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button className="award-btn" onClick={handleAward} disabled={isLoading || !currentTopUser}>
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <CheckCircle size={16} />
                Otorgar Corona
              </>
            )}
          </button>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
}