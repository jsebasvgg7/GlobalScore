import React, { useState } from 'react';
import { Award, CheckCircle2, Star, Clock } from 'lucide-react';
import '../styles/AwardCard.css';

export default function AwardCard({ award, userPrediction, onPredict }) {
  const [predictedWinner, setPredictedWinner] = useState(userPrediction?.predicted_winner ?? '');

  const now = new Date();
  const deadline = award.deadline ? new Date(award.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const hasPrediction = userPrediction !== undefined;
  const isFinished = award.status === 'finished';
  const isDisabled = isPastDeadline || isFinished;

  const isPredictionChanged = predictedWinner !== (userPrediction?.predicted_winner ?? '');
  const showSaveButton = !isDisabled && (!hasPrediction || isPredictionChanged);

  const handleSubmit = () => {
    if (!predictedWinner.trim()) {
      alert('Por favor ingresa tu predicción');
      return;
    }
    onPredict(award.id, predictedWinner.trim());
  };

  // ── Pill config ───────────────────────────────────────────
  const pillConfig = isFinished
    ? { label: 'Finalizado', mod: 'finished' }
    : isPastDeadline
      ? { label: 'Expirado', mod: 'expired' }
      : hasPrediction && !isPredictionChanged
        ? { label: 'Guardado', mod: 'saved' }
        : { label: 'Pendiente', mod: 'pending' };

  return (
    <div className="ac-card">

      {/* ══ HEADER ══ */}
      <div className="ac-header">
        <div className="ac-header-left">
          <div className="ac-logo-box">
            {award.logo_url && award.logo_url.startsWith('http') ? (
              <img
                src={award.logo_url}
                alt={award.name}
                className="ac-logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="ac-logo-emoji">{award.logo || '🏆'}</span>
            )}
          </div>
          <div className="ac-title-group">
            <span className="ac-title">{award.name}</span>
            <span className="ac-season">{award.season}</span>
          </div>
        </div>
        <span className={`ac-pill ac-pill--${pillConfig.mod}`}>
          <span className="ac-pill-dot" />
          {pillConfig.label}
        </span>
      </div>

      {/* ══ BODY ══ */}
      <div className="ac-body">

        {/* Campo ganador */}
        <div className="ac-field">
          <label className="ac-label">
            <Award size={10} />
            Tu predicción del ganador
          </label>
          <input
            type="text"
            className={`ac-input${hasPrediction && predictedWinner ? ' ac-input--filled' : ''}`}
            value={predictedWinner}
            onChange={(e) => setPredictedWinner(e.target.value)}
            placeholder="Ingresa el nombre del ganador..."
            disabled={isDisabled}
          />
          {isFinished && award.winner && (
            <div className="ac-result">
              <CheckCircle2 size={10} />
              <span>Ganador: <strong>{award.winner}</strong></span>
              {predictedWinner.toLowerCase() === award.winner.toLowerCase() && (
                <span className="ac-correct">✓ ¡Acertaste!</span>
              )}
            </div>
          )}
        </div>

        {/* Categoría */}
        {award.category && (
          <div className="ac-category-row">
            <span className="ac-category-badge">
              <Star size={9} />
              {award.category}
            </span>
          </div>
        )}

      </div>

      {/* ══ FOOTER ══ */}
      <div className="ac-footer">
        {isPastDeadline && !isFinished ? (
          <span className="ac-footer-msg ac-footer-msg--expired">
            <Clock size={11} />
            Plazo de predicción expirado
          </span>
        ) : isFinished && userPrediction ? (
          <span className="ac-footer-msg ac-footer-msg--finished">
            <Star size={11} />
            {userPrediction.points_earned > 0
              ? `+${userPrediction.points_earned} pts obtenidos`
              : 'Sin puntos esta vez'}
          </span>
        ) : !isDisabled && hasPrediction && !showSaveButton ? (
          <span className="ac-footer-msg ac-footer-msg--saved">
            <CheckCircle2 size={11} />
            Predicción guardada
            {userPrediction?.points_earned > 0 && (
              <span className="ac-pts-badge">+{userPrediction.points_earned}</span>
            )}
          </span>
        ) : showSaveButton ? (
          <button className="ac-save-btn" onClick={handleSubmit}>
            <CheckCircle2 size={11} />
            {hasPrediction ? 'Actualizar' : 'Guardar'}
          </button>
        ) : null}
      </div>

    </div>
  );
}