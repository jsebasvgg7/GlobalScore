import React, { useState } from "react";
import { X, Trophy, Target, CheckCircle, AlertCircle } from "lucide-react";
import "../../styles/StylesAdmin/AdminModal.css";

export default function FinishMatchModal({ match, onFinish, onClose }) {
  const [homeScore, setHomeScore]       = useState("");
  const [awayScore, setAwayScore]       = useState("");
  const [advancingTeam, setAdvancingTeam] = useState(null);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const canSubmit =
    homeScore !== "" &&
    awayScore !== "" &&
    (!match.is_knockout || advancingTeam);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    if (isNaN(home) || isNaN(away))  { setError("Los resultados deben ser números válidos"); return; }
    if (home < 0 || away < 0)        { setError("Los resultados no pueden ser negativos"); return; }
    if (match.is_knockout && !advancingTeam) { setError("Selecciona el equipo que pasa"); return; }

    setError("");
    setLoading(true);
    try {
      await onFinish(match.id, home, away, advancingTeam);
      onClose();
    } catch (err) {
      setError("Error al finalizar el partido");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <div className="am2-backdrop">
      <div className="am2-shell am2-shell--narrow">

        {/* ── Header ── */}
        <div className="am2-header am2-header--green">
          <div className="am2-header-icon am2-header-icon--green">
            <Trophy size={18} />
          </div>
          <div className="am2-header-text">
            <h2>Finalizar Partido</h2>
            <p>{match.is_knockout ? "Ingresa el resultado y quién pasa" : "Ingresa el resultado final"}</p>
          </div>
          <button className="am2-close" onClick={onClose} disabled={loading} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="am2-body">

          {/* Match card */}
          <div className="fm2-match-card">
            <div className="fm2-team">
              <span className="fm2-team-logo">{match.home_team_logo}</span>
              <span className="fm2-team-name">{match.home_team}</span>
            </div>
            <div className="fm2-vs">
              <span>VS</span>
              {match.is_knockout && (
                <span className="fm2-knockout-badge">⚡ Eliminatoria</span>
              )}
            </div>
            <div className="fm2-team">
              <span className="fm2-team-logo">{match.away_team_logo}</span>
              <span className="fm2-team-name">{match.away_team}</span>
            </div>
          </div>
          <div className="fm2-meta">
            {match.league} · {match.date} {match.time}
          </div>

          {/* Score row */}
          <div className="fm2-score-row">
            <div className="am2-field fm2-score-field">
              <label className="am2-label">
                <Target size={12} />
                Goles Local <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input fm2-score-input"
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="fm2-score-sep">–</div>

            <div className="am2-field fm2-score-field">
              <label className="am2-label">
                <Target size={12} />
                Goles Visitante <span className="am2-req">*</span>
              </label>
              <input
                className="am2-input fm2-score-input"
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="0"
                disabled={loading}
              />
            </div>
          </div>

          {/* Knockout: quién pasa */}
          {match.is_knockout && (
            <div className="fm2-knockout-section">
              <div className="fm2-knockout-title">
                <Trophy size={13} />
                ¿Quién pasa a la siguiente ronda?
                <span className="am2-req">*</span>
              </div>
              <div className="fm2-knockout-grid">
                {[
                  { key: "home", label: match.home_team, logo: match.home_team_logo },
                  { key: "away", label: match.away_team, logo: match.away_team_logo },
                ].map(({ key, label, logo }) => (
                  <button
                    key={key}
                    type="button"
                    className={`fm2-team-btn ${advancingTeam === key ? "fm2-team-btn--selected" : ""}`}
                    onClick={() => setAdvancingTeam(key)}
                    disabled={loading}
                  >
                    <span className="fm2-team-btn-logo">{logo}</span>
                    <span className="fm2-team-btn-name">{label}</span>
                    {advancingTeam === key && (
                      <CheckCircle size={16} className="fm2-team-btn-check" />
                    )}
                  </button>
                ))}
              </div>
              <span className="am2-hint">
                Equipo que avanza (ej: por penales)
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="fm2-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Info */}
          <div className="fm2-info-box">
            <strong>⚠️ Importante:</strong> Esta acción calculará automáticamente los puntos
            de todas las predicciones{match.is_knockout ? " (hasta 7 pts en eliminatoria)" : ""} y no se puede deshacer.
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="am2-footer">
          <button className="am2-btn am2-btn--cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="am2-btn am2-btn--finish"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <>
                <span className="am2-spinner" />
                Finalizando…
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                Finalizar Partido
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}