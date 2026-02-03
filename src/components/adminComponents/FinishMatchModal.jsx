import React, { useState } from 'react';
import { X, Trophy, Target, CheckCircle, AlertCircle } from 'lucide-react';
import '../../styles/adminStyles/AdminModal.css';

export default function FinishMatchModal({ match, onFinish, onClose }) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [advancingTeam, setAdvancingTeam] = useState(null); // ⚡ NUEVO ESTADO
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validación
    if (homeScore === '' || awayScore === '') {
      setError('Por favor ingresa ambos resultados');
      return;
    }

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) {
      setError('Los resultados deben ser números válidos');
      return;
    }

    if (home < 0 || away < 0) {
      setError('Los resultados no pueden ser negativos');
      return;
    }

    // ⚡ VALIDACIÓN KNOCKOUT: Si es knockout, debe seleccionar quién pasa
    if (match.is_knockout && !advancingTeam) {
      setError('Debes seleccionar qué equipo pasa a la siguiente ronda');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onFinish(match.id, home, away, advancingTeam); // ⚡ Pasar advancingTeam
      onClose();
    } catch (err) {
      setError('Error al finalizar el partido');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="modal-backdrop-premium">
      <div className="modal-premium" style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div className="modal-header-premium">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="modal-title-premium">Finalizar Partido</h2>
              <p className="modal-subtitle-premium">
                {match.is_knockout ? 'Ingresa el resultado y quién pasa' : 'Ingresa el resultado final'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-premium">
          {/* Match Info */}
          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              {/* Home Team */}
              <div style={{ 
                flex: 1, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ fontSize: '32px' }}>
                  {match.home_team_logo}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '14px',
                  color: '#111'
                }}>
                  {match.home_team}
                </div>
              </div>

              {/* VS */}
              <div style={{
                padding: '8px 16px',
                background: 'white',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '12px',
                color: '#666',
                border: '2px solid #e5e7eb'
              }}>
                VS
              </div>

              {/* Away Team */}
              <div style={{ 
                flex: 1, 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ fontSize: '32px' }}>
                  {match.away_team_logo}
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '14px',
                  color: '#111'
                }}>
                  {match.away_team}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '12px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#666'
            }}>
              {match.league} • {match.date} {match.time}
              {match.is_knockout && (
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '700'
                }}>
                  ⚡ ELIMINATORIA
                </span>
              )}
            </div>
          </div>

          {/* Score Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {/* Home Score */}
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Target size={14} />
                <span>Goles Local</span>
                <span className="required">*</span>
              </label>
              <input
                className="form-input-premium"
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                disabled={loading}
                autoFocus
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '900',
                  padding: '16px'
                }}
              />
            </div>

            {/* Separator */}
            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#ccc',
              marginTop: '24px'
            }}>
              -
            </div>

            {/* Away Score */}
            <div className="form-group-premium">
              <label className="form-label-premium">
                <Target size={14} />
                <span>Goles Visitante</span>
                <span className="required">*</span>
              </label>
              <input
                className="form-input-premium"
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                disabled={loading}
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '900',
                  padding: '16px'
                }}
              />
            </div>
          </div>

          {/* ⚡ NUEVO: Selector de Equipo que Pasa (solo si is_knockout) */}
          {match.is_knockout && (
            <div style={{
              padding: '16px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '2px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#D97706',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Trophy size={16} />
                <span>¿Qué equipo pasa a la siguiente ronda?</span>
                <span style={{ color: '#EF4444' }}>*</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                {/* Botón Home */}
                <button
                  type="button"
                  onClick={() => setAdvancingTeam('home')}
                  disabled={loading}
                  style={{
                    padding: '14px',
                    border: advancingTeam === 'home' ? '3px solid #10B981' : '2px solid #e5e7eb',
                    borderRadius: '10px',
                    background: advancingTeam === 'home' 
                      ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' 
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '28px' }}>{match.home_team_logo}</div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '700',
                    color: advancingTeam === 'home' ? '#065F46' : '#374151'
                  }}>
                    {match.home_team}
                  </div>
                  {advancingTeam === 'home' && (
                    <CheckCircle 
                      size={20} 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: '#10B981'
                      }}
                    />
                  )}
                </button>

                {/* Botón Away */}
                <button
                  type="button"
                  onClick={() => setAdvancingTeam('away')}
                  disabled={loading}
                  style={{
                    padding: '14px',
                    border: advancingTeam === 'away' ? '3px solid #10B981' : '2px solid #e5e7eb',
                    borderRadius: '10px',
                    background: advancingTeam === 'away' 
                      ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' 
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '28px' }}>{match.away_team_logo}</div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '700',
                    color: advancingTeam === 'away' ? '#065F46' : '#374151'
                  }}>
                    {match.away_team}
                  </div>
                  {advancingTeam === 'away' && (
                    <CheckCircle 
                      size={20} 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: '#10B981'
                      }}
                    />
                  )}
                </button>
              </div>

              <div style={{
                marginTop: '10px',
                fontSize: '11px',
                color: '#9CA3AF',
                textAlign: 'center'
              }}>
                Selecciona el equipo que avanza a la siguiente fase (ej: por penales)
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#dc2626',
              marginBottom: '16px',
              animation: 'shake 0.5s'
            }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                {error}
              </span>
            </div>
          )}

          {/* Info Box */}
          <div style={{
            padding: '14px',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '2px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#6366f1',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Importante:</strong> Esta acción calculará automáticamente los puntos 
            de todas las predicciones{match.is_knockout ? ' (hasta 7 puntos en eliminatoria)' : ''} y no se puede deshacer.
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-premium">
          <button 
            className="modal-btn-premium secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="modal-btn-premium primary" 
            onClick={handleSubmit}
            disabled={loading || homeScore === '' || awayScore === '' || (match.is_knockout && !advancingTeam)}
            style={{
              background: loading 
                ? '#9CA3AF' 
                : 'linear-gradient(135deg, #10B981, #059669)',
              opacity: (loading || homeScore === '' || awayScore === '' || (match.is_knockout && !advancingTeam)) ? 0.6 : 1
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Finalizando...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Finalizar Partido</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}