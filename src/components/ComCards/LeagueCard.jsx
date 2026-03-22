import React, { useState } from 'react';
import { Trophy, Target, Award, Star, CheckCircle2, Shield, Clock } from 'lucide-react';
import '../../styles/StylesCards/LeagueCard.css';

export default function LeagueCard({ league, userPrediction, onPredict }) {
  const [champion,  setChampion]  = useState(userPrediction?.predicted_champion    ?? '');
  const [topScorer, setTopScorer] = useState(userPrediction?.predicted_top_scorer  ?? '');
  const [topAssist, setTopAssist] = useState(userPrediction?.predicted_top_assist  ?? '');
  const [mvp,       setMvp]       = useState(userPrediction?.predicted_mvp         ?? '');

  const now            = new Date();
  const deadline       = league.deadline ? new Date(league.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const hasPrediction  = userPrediction !== undefined;
  const isFinished     = league.status === 'finished';
  const isDisabled     = isPastDeadline || isFinished;

  const isPredictionChanged =
    champion  !== (userPrediction?.predicted_champion   ?? '') ||
    topScorer !== (userPrediction?.predicted_top_scorer ?? '') ||
    topAssist !== (userPrediction?.predicted_top_assist ?? '') ||
    mvp       !== (userPrediction?.predicted_mvp        ?? '');

  const showSaveButton = !isDisabled && (!hasPrediction || isPredictionChanged);

  const handleSubmit = () => {
    if (!champion.trim() || !topScorer.trim() || !topAssist.trim() || !mvp.trim()) {
      alert('Por favor completa todas las predicciones');
      return;
    }
    onPredict(league.id, champion.trim(), topScorer.trim(), topAssist.trim(), mvp.trim());
  };

  // ── Pill config ───────────────────────────────────────────
  const pillConfig = isFinished
    ? { label: 'Finalizado', mod: 'finished' }
    : isPastDeadline
    ? { label: 'Expirado',   mod: 'expired'  }
    : hasPrediction && !isPredictionChanged
    ? { label: 'Guardado',   mod: 'saved'    }
    : { label: 'Pendiente',  mod: 'pending'  };

  return (
    <div className="lc-card">

      {/* ══ HEADER ══ */}
      <div className="lc-header">
        <div className="lc-header-left">
          <div className="lc-logo-box">
            {league.logo_url ? (
              <img
                src={league.logo_url}
                alt={league.name}
                className="lc-logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="lc-logo-emoji">{league.logo || '🏆'}</span>
            )}
          </div>
          <div className="lc-title-group">
            <span className="lc-title">{league.name}</span>
            <span className="lc-season">{league.season}</span>
          </div>
        </div>
        <span className={`lc-pill lc-pill--${pillConfig.mod}`}>
          <span className="lc-pill-dot" />
          {pillConfig.label}
        </span>
      </div>

      {/* ══ BODY ══ */}
      <div className="lc-body">

        {/* Campeón — ancho completo */}
        <div className="lc-field">
          <label className="lc-label">
            <Shield size={10} />
            Campeón de la competición
          </label>
          <input
            type="text"
            className={`lc-input${hasPrediction && champion ? ' lc-input--filled' : ''}`}
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            placeholder="Escribe el equipo..."
            disabled={isDisabled}
          />
          {isFinished && league.champion && (
            <div className="lc-result">
              <CheckCircle2 size={10} />
              <span>{league.champion}</span>
              {champion.toLowerCase() === league.champion.toLowerCase() && (
                <span className="lc-correct">✓ Correcto</span>
              )}
            </div>
          )}
        </div>

        {/* Goleador + Asistidor — fila dividida */}
        <div className="lc-field-row">
          <div className="lc-field-cell">
            <label className="lc-label">
              <Trophy size={10} />
              Goleador
            </label>
            <input
              type="text"
              className={`lc-input${hasPrediction && topScorer ? ' lc-input--filled' : ''}`}
              value={topScorer}
              onChange={(e) => setTopScorer(e.target.value)}
              placeholder="Jugador..."
              disabled={isDisabled}
            />
            {isFinished && league.top_scorer && (
              <div className="lc-result">
                <CheckCircle2 size={10} />
                <span>{league.top_scorer}</span>
                {topScorer.toLowerCase() === league.top_scorer.toLowerCase() && (
                  <span className="lc-correct">✓</span>
                )}
              </div>
            )}
          </div>
          <div className="lc-field-cell">
            <label className="lc-label">
              <Target size={10} />
              Asistidor
            </label>
            <input
              type="text"
              className={`lc-input${hasPrediction && topAssist ? ' lc-input--filled' : ''}`}
              value={topAssist}
              onChange={(e) => setTopAssist(e.target.value)}
              placeholder="Jugador..."
              disabled={isDisabled}
            />
            {isFinished && league.top_assist && (
              <div className="lc-result">
                <CheckCircle2 size={10} />
                <span>{league.top_assist}</span>
                {topAssist.toLowerCase() === league.top_assist.toLowerCase() && (
                  <span className="lc-correct">✓</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MVP — ancho completo */}
        <div className="lc-field lc-field--last">
          <label className="lc-label">
            <Award size={10} />
            Jugador MVP
          </label>
          <input
            type="text"
            className={`lc-input${hasPrediction && mvp ? ' lc-input--filled' : ''}`}
            value={mvp}
            onChange={(e) => setMvp(e.target.value)}
            placeholder="Jugador..."
            disabled={isDisabled}
          />
          {isFinished && league.mvp_player && (
            <div className="lc-result">
              <CheckCircle2 size={10} />
              <span>{league.mvp_player}</span>
              {mvp.toLowerCase() === league.mvp_player.toLowerCase() && (
                <span className="lc-correct">✓</span>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ══ FOOTER ══ */}
      <div className="lc-footer">
        {isPastDeadline && !isFinished ? (
          <span className="lc-footer-msg lc-footer-msg--expired">
            <Clock size={11} />
            Plazo de predicción expirado
          </span>
        ) : isFinished && userPrediction ? (
          <span className="lc-footer-msg lc-footer-msg--finished">
            <Star size={11} />
            {userPrediction.points_earned > 0
              ? `+${userPrediction.points_earned} pts obtenidos`
              : 'Sin puntos esta vez'}
          </span>
        ) : !isDisabled && hasPrediction && !showSaveButton ? (
          <span className="lc-footer-msg lc-footer-msg--saved">
            <CheckCircle2 size={11} />
            Predicción guardada
            {userPrediction?.points_earned > 0 && (
              <span className="lc-pts-badge">+{userPrediction.points_earned}</span>
            )}
          </span>
        ) : showSaveButton ? (
          <button className="lc-save-btn" onClick={handleSubmit}>
            <CheckCircle2 size={11} />
            {hasPrediction ? 'Actualizar' : 'Guardar'}
          </button>
        ) : null}
      </div>

    </div>
  );
}