import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import "../../styles/StylesCards/MatchCard.css";

// ── Icono espadas knockout ────────────────────────────────────
const SwordsIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

// ── Icono calendario ─────────────────────────────────────────
const CalendarIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" />
    <line x1="7" y1="2" x2="7" y2="6" />
    <line x1="17" y1="2" x2="17" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

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

  // ── Pill de estado ────────────────────────────────────────
  const pillConfig = isLive
    ? { label: "En vivo",    mod: "live"    }
    : isPastDeadline
    ? { label: "Cerrado",    mod: "expired" }
    : isSaving
    ? { label: "Guardando…", mod: "saving"  }
    : isSaved
    ? { label: "Guardado",   mod: "saved"   }
    : { label: "Pendiente",  mod: "pending" };

  // ── Clases raíz ───────────────────────────────────────────
  const cardClasses = [
    "mc-card",
    isActive       ? "mc-card--active"  : "",
    isLive         ? "mc-card--live"    : "",
    isPastDeadline ? "mc-card--expired" : "",
  ].filter(Boolean).join(" ");

  // ── Bloque reutilizable por equipo ────────────────────────
  // isHome = true  → nombre ARRIBA  del escudo
  // isHome = false → nombre ABAJO   del escudo
  const TeamBlock = ({ side }) => {
    const isHome    = side === "home";
    const teamName  = isHome ? match.home_team          : match.away_team;
    const logoUrl   = isHome ? match.home_team_logo_url : match.away_team_logo_url;
    const logoEmoji = isHome ? match.home_team_logo     : match.away_team_logo;
    const score     = isHome ? homeScore                : awayScore;
    const isAdv     = advancingTeam === side;

    const blockClasses = [
      "mc-team-block",
      match.is_knockout && !isDisabled ? "mc-team-block--tap" : "",
      isAdv ? "mc-team-block--on" : "",
    ].filter(Boolean).join(" ");

    const scoreBoxClasses = [
      "mc-score-box",
      (isSaved || isDisabled) ? "mc-score-box--done" : "",
    ].filter(Boolean).join(" ");

    const nameEl = (
      <span className={`mc-team-name mc-team-name--${isHome ? "top" : "bottom"}`}>
        {teamName}
      </span>
    );

    const rowEl = (
      <div className="mc-team-row">
        <div className="mc-shield-wrap">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={teamName}
              className="mc-shield-img"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <span className="mc-shield-emoji">{logoEmoji || "⚽"}</span>
          )}
          {isAdv && !isDisabled && (
            <div className="mc-adv-badge">
              <CheckCircle2 size={7} />
            </div>
          )}
        </div>
        <div className={scoreBoxClasses}>
          <input
            type="number" min="0" max="20"
            className="mc-score-input"
            value={score}
            onChange={(e) => handleScoreChange(side, e.target.value)}
            placeholder="—"
            disabled={isDisabled}
          />
        </div>
      </div>
    );

    return (
      <div className={blockClasses} onClick={() => handleAdvancingTeamClick(side)}>
        {/* Local: nombre arriba — Visitante: nombre abajo */}
        {isHome ? <>{nameEl}{rowEl}</> : <>{rowEl}{nameEl}</>}
      </div>
    );
  };

  return (
    <div className="mc-wrap">
      <div className={cardClasses}>

        {/* ══════════════════════════════
            HEADER: liga + pill
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

          <span className={`mc-pill mc-pill--${pillConfig.mod}`}>
            {pillConfig.mod === "live"   && <span className="mc-live-dot" />}
            {pillConfig.mod === "saving" && <span className="mc-saving-ring" />}
            {pillConfig.label}
          </span>
        </div>

        {/* ══════════════════════════════
            BODY: local / divisor / visitante
        ══════════════════════════════ */}
        <div className="mc-body">
          <TeamBlock side="home" />

          <div className="mc-divider">
            <div className="mc-divider-line" />
            {match.is_knockout && !isDisabled
              ? <SwordsIcon className="mc-swords-icon" />
              : <span className="mc-vs-label">VS</span>
            }
            <div className="mc-divider-line" />
          </div>

          <TeamBlock side="away" />
        </div>

        {/* ══════════════════════════════
            FOOTER: hora | fecha
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
        </div>

      </div>
    </div>
  );
}