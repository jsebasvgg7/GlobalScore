import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Clock, Calendar, Swords } from "lucide-react";
import "../../styles/StylesCards/MatchCard.css";

// ── Espadas knockout ──────────────────────────────────────────
const SwordsIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="9.5 14.5 3 21" />
    <polyline points="14.5 9.5 21 3 21 6 18 6" />
  </svg>
);

// ── Icono reloj ───────────────────────────────────────────────
const ClockIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

// ── Icono calendario ─────────────────────────────────────────
const CalendarIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <line x1="7" y1="2" x2="7" y2="6" />
    <line x1="17" y1="2" x2="17" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ── Abreviación 3 letras ──────────────────────────────────────
const abbr = (name = "") => {
  if (!name) return "???";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
};

export default function MatchCard({ match, userPred, onPredict, isActive = false }) {
  const [homeScore,     setHomeScore]     = useState(userPred?.home_score ?? "");
  const [awayScore,     setAwayScore]     = useState(userPred?.away_score ?? "");
  const [advancingTeam, setAdvancingTeam] = useState(userPred?.predicted_advancing_team ?? null);
  const [isSaved,       setIsSaved]       = useState(userPred !== undefined);
  const [isSaving,      setIsSaving]      = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setAdvancingTeam(userPred?.predicted_advancing_team ?? null);
    setIsSaved(userPred !== undefined);
  }, [userPred]);

  const now            = new Date();
  const deadline       = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const isLive         = match.status === "live";
  const isDisabled     = isPastDeadline || match.status !== "pending";

  useEffect(() => {
    if (isDisabled) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const home    = parseInt(homeScore);
    const away    = parseInt(awayScore);
    const isValid = !isNaN(home) && !isNaN(away) && homeScore !== "" && awayScore !== "";
    const isDiff  =
      home !== userPred?.home_score ||
      away !== userPred?.away_score ||
      advancingTeam !== userPred?.predicted_advancing_team;

    if (isValid && isDiff) {
      setIsSaved(false);
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onPredict(match.id, home, away, advancingTeam);
          setTimeout(() => { setIsSaved(true); setIsSaving(false); }, 300);
        } catch (err) {
          console.error("❌ Error guardando:", err);
          setIsSaving(false);
        }
      }, 1000);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [homeScore, awayScore, advancingTeam, isDisabled, match.id, onPredict, userPred]);

  const handleScoreChange = (team, value) => {
    if (isDisabled) return;
    const n     = parseInt(value, 10);
    const score = isNaN(n) || n < 0 ? value : Math.min(n, 20);
    team === "home" ? setHomeScore(score) : setAwayScore(score);
    setIsSaved(false);
  };

  const handleAdvancingTeamClick = (team) => {
    if (isDisabled || !match.is_knockout) return;
    setAdvancingTeam((prev) => (prev === team ? null : team));
    setIsSaved(false);
  };

  // ── Estado de la pill ─────────────────────────────────────
  const pillConfig = isLive
    ? { label: "En vivo", mod: "live" }
    : isPastDeadline
    ? { label: "Cerrado", mod: "expired" }
    : isSaving
    ? { label: "Guardando…", mod: "saving" }
    : isSaved
    ? { label: "Guardado", mod: "saved" }
    : { label: "Pendiente", mod: "pending" };

  // ── Clases raíz de la card ────────────────────────────────
  const cardClasses = [
    "mc-card",
    isActive      ? "mc-card--active"   : "",
    isLive        ? "mc-card--live"     : "",
    isPastDeadline ? "mc-card--expired" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="mc-wrap">
      <div className={cardClasses}>

        {/* ══════════════════════════════
            HEADER: liga + nombre
        ══════════════════════════════ */}
        <div className="mc-header">
          <div className="mc-header-left">
            <div className="mc-league-icon">
              {match.league_logo_url ? (
                <img
                  src={match.league_logo_url}
                  alt={match.league}
                  className="mc-league-logo"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <span className="mc-league-emoji">🏆</span>
              )}
            </div>
            <span className="mc-league-name">{match.league || "Liga"}</span>
          </div>

          {/* Pill de estado */}
          <span className={`mc-pill mc-pill--${pillConfig.mod}`}>
            {pillConfig.mod === "live" && <span className="mc-live-dot" />}
            {pillConfig.mod === "saving" && <span className="mc-saving-ring" />}
            {pillConfig.label}
          </span>
        </div>

        {/* ══════════════════════════════
            ESCUDOS + SCORES
        ══════════════════════════════ */}
        <div className="mc-body">

          {/* Equipo local */}
          <div
            className={[
              "mc-team",
              match.is_knockout && !isDisabled ? "mc-team--tap" : "",
              advancingTeam === "home" ? "mc-team--on" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => handleAdvancingTeamClick("home")}
          >
            <div className="mc-shield-wrap">
              {match.home_team_logo_url ? (
                <img
                  src={match.home_team_logo_url}
                  alt={match.home_team}
                  className="mc-shield-img"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <span className="mc-shield-emoji">{match.home_team_logo || "⚽"}</span>
              )}
              {advancingTeam === "home" && !isDisabled && (
                <div className="mc-adv-badge">
                  <CheckCircle2 size={8} />
                </div>
              )}
            </div>
            <span className="mc-team-name">{match.home_team}</span>
            <span className="mc-team-abbr">{abbr(match.home_team)}</span>
          </div>

          {/* Columna central: score + VS */}
          <div className="mc-center">
            <div className={`mc-score-box${isSaved || isDisabled ? " mc-score-box--done" : ""}`}>
              <input
                type="number" min="0" max="20"
                className="mc-score-input"
                value={homeScore}
                onChange={(e) => handleScoreChange("home", e.target.value)}
                placeholder="—"
                disabled={isDisabled}
              />
            </div>

            <div className="mc-vs-wrap">
              {match.is_knockout && !isDisabled
                ? <SwordsIcon className="mc-swords-icon" />
                : <span className="mc-vs-label">VS</span>
              }
            </div>

            <div className={`mc-score-box${isSaved || isDisabled ? " mc-score-box--done" : ""}`}>
              <input
                type="number" min="0" max="20"
                className="mc-score-input"
                value={awayScore}
                onChange={(e) => handleScoreChange("away", e.target.value)}
                placeholder="—"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Equipo visitante */}
          <div
            className={[
              "mc-team",
              match.is_knockout && !isDisabled ? "mc-team--tap" : "",
              advancingTeam === "away" ? "mc-team--on" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => handleAdvancingTeamClick("away")}
          >
            <div className="mc-shield-wrap">
              {match.away_team_logo_url ? (
                <img
                  src={match.away_team_logo_url}
                  alt={match.away_team}
                  className="mc-shield-img"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <span className="mc-shield-emoji">{match.away_team_logo || "⚽"}</span>
              )}
              {advancingTeam === "away" && !isDisabled && (
                <div className="mc-adv-badge">
                  <CheckCircle2 size={8} />
                </div>
              )}
            </div>
            <span className="mc-team-name">{match.away_team}</span>
            <span className="mc-team-abbr">{abbr(match.away_team)}</span>
          </div>
        </div>

        {/* ══════════════════════════════
            FOOTER: métricas estilo dashboard
        ══════════════════════════════ */}
        <div className="mc-footer">
          <div className="mc-metric">
            <ClockIcon className="mc-metric-icon" />
            <span className="mc-metric-val">
              {isLive ? `${match.minute || "??"}'` : match.time || "—"}
            </span>
          </div>

          <div className="mc-footer-divider" />

          <div className="mc-metric">
            <CalendarIcon className="mc-metric-icon" />
            <span className="mc-metric-val">{match.date || "—"}</span>
          </div>

          {match.is_knockout && (
            <>
              <div className="mc-footer-divider" />
              <div className="mc-metric mc-metric--ko">
                <SwordsIcon className="mc-metric-icon mc-metric-icon--ko" />
                <span className="mc-metric-val">Knockout</span>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}