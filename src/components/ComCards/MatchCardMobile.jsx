// src/components/ComCards/MatchCardMobile.jsx
// ================================================================
//  MatchCardMobile — Versión mobile con botones +/- retro japonés
//  Sin teclado virtual. Botones tipo tecla física brutalista.
//  Se usa en MobileSubPage en lugar del MatchCard normal.
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

// ── Icono espadas knockout ───────────────────────────────────────
const SwordsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
    <line x1="13" y1="19" x2="19" y2="13"/>
    <line x1="16" y1="16" x2="20" y2="20"/>
    <line x1="19" y1="21" x2="21" y2="19"/>
    <polyline points="9.5 14.5 3 21"/>
    <polyline points="14.5 9.5 21 3 21 6 18 6"/>
  </svg>
);

// ── Botón tecla brutalista +/- ──────────────────────────────────
function KeyBtn({ symbol, onPress, disabled, accent = false }) {
  const [pressed, setPressed] = useState(false);

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (disabled) return;
    setPressed(true);
    onPress();
  };

  const handlePointerUp = () => setPressed(false);

  return (
    <button
      className={[
        "mcm-key",
        accent  ? "mcm-key--accent" : "",
        pressed ? "mcm-key--pressed" : "",
        disabled ? "mcm-key--disabled" : "",
      ].filter(Boolean).join(" ")}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={disabled}
      aria-label={symbol === "+" ? "Aumentar" : "Disminuir"}
    >
      <span className="mcm-key-face">
        <span className="mcm-key-symbol">{symbol}</span>
      </span>
      <span className="mcm-key-shadow" />
    </button>
  );
}

// ── Score display ────────────────────────────────────────────────
function ScoreDisplay({ value, saved, isHome }) {
  const isEmpty = value === "" || value === null || value === undefined;
  return (
    <div className={[
      "mcm-score-display",
      saved   ? "mcm-score-display--saved" : "",
      isEmpty ? "mcm-score-display--empty" : "",
    ].filter(Boolean).join(" ")}>
      <span className="mcm-score-num">
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
}

// ── Team block ───────────────────────────────────────────────────
function TeamRow({ side, match, score, onInc, onDec, isDisabled, isSaved, isAdvancing, onAdvClick }) {
  const isHome    = side === "home";
  const teamName  = isHome ? match.home_team          : match.away_team;
  const logoUrl   = isHome ? match.home_team_logo_url : match.away_team_logo_url;
  const logoEmoji = isHome ? match.home_team_logo     : match.away_team_logo;

  return (
    <div className={["mcm-team-row", isAdvancing ? "mcm-team-row--adv" : ""].filter(Boolean).join(" ")}>

      {/* Escudo — tap para seleccionar advancing en knockout */}
      <div
        className={[
          "mcm-shield",
          match.is_knockout && !isDisabled ? "mcm-shield--tap" : "",
          isAdvancing ? "mcm-shield--on" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => match.is_knockout && !isDisabled && onAdvClick(side)}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={teamName}
            onError={e => (e.target.style.display = "none")}/>
        ) : (
          <span>{logoEmoji || "⚽"}</span>
        )}
        {isAdvancing && !isDisabled && (
          <div className="mcm-adv-dot"><CheckCircle2 size={8}/></div>
        )}
      </div>

      {/* Nombre */}
      <span className="mcm-team-name">{teamName}</span>

      {/* Controles */}
      <div className="mcm-controls">
        <KeyBtn symbol="−" onPress={onDec} disabled={isDisabled || score <= 0 || score === ""} />
        <ScoreDisplay value={score} saved={isSaved} />
        <KeyBtn symbol="+" onPress={onInc} disabled={isDisabled} accent />
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function MatchCardMobile({ match, userPred, onPredict }) {
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

  // Auto-save con debounce
  const triggerSave = (home, away, adv) => {
    const isValid = home !== "" && away !== "" &&
                    !isNaN(parseInt(home)) && !isNaN(parseInt(away));
    if (!isValid || isDisabled) return;

    const isDiff = parseInt(home) !== userPred?.home_score ||
                   parseInt(away) !== userPred?.away_score ||
                   adv !== userPred?.predicted_advancing_team;
    if (!isDiff) return;

    setIsSaved(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onPredict(match.id, parseInt(home), parseInt(away), adv);
        setIsSaved(true);
      } catch (err) {
        console.error("Error guardando:", err);
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  const handleInc = (side) => {
    if (isDisabled) return;
    if (side === "home") {
      const next = homeScore === "" ? 0 : Math.min(20, parseInt(homeScore) + 1);
      setHomeScore(next);
      triggerSave(next, awayScore, advancingTeam);
    } else {
      const next = awayScore === "" ? 0 : Math.min(20, parseInt(awayScore) + 1);
      setAwayScore(next);
      triggerSave(homeScore, next, advancingTeam);
    }
  };

  const handleDec = (side) => {
    if (isDisabled) return;
    if (side === "home") {
      const prev = homeScore === "" ? 0 : Math.max(0, parseInt(homeScore) - 1);
      setHomeScore(prev);
      triggerSave(prev, awayScore, advancingTeam);
    } else {
      const prev = awayScore === "" ? 0 : Math.max(0, parseInt(awayScore) - 1);
      setAwayScore(prev);
      triggerSave(homeScore, prev, advancingTeam);
    }
  };

  const handleAdvClick = (side) => {
    const next = advancingTeam === side ? null : side;
    setAdvancingTeam(next);
    triggerSave(homeScore, awayScore, next);
  };

  // Pill config
  const pillConfig = isLive
    ? { label: "EN VIVO",   mod: "live"    }
    : isPastDeadline
    ? { label: "CERRADO",   mod: "expired" }
    : isSaving
    ? { label: "GUARDANDO", mod: "saving"  }
    : isSaved
    ? { label: "GUARDADO",  mod: "saved"   }
    : { label: "PENDIENTE", mod: "pending" };

  return (
    <div className={[
      "mcm-card",
      isLive         ? "mcm-card--live"    : "",
      isPastDeadline ? "mcm-card--expired" : "",
    ].filter(Boolean).join(" ")}>

      {/* ── HEADER ── */}
      <div className="mcm-header">
        <div className="mcm-header-left">
          <div className="mcm-league-ico">
            {match.league_logo_url ? (
              <img src={match.league_logo_url} alt={match.league}
                onError={e => (e.target.style.display = "none")}/>
            ) : "🏆"}
          </div>
          <span className="mcm-league-name">{match.league || "Liga"}</span>
          {match.is_knockout && (
            <span className="mcm-ko-badge">
              <SwordsIcon/> KO
            </span>
          )}
        </div>
        <span className={`mcm-pill mcm-pill--${pillConfig.mod}`}>
          {pillConfig.mod === "live"   && <span className="mcm-live-dot"/>}
          {pillConfig.mod === "saving" && <span className="mcm-spin"/>}
          {pillConfig.label}
        </span>
      </div>

      {/* ── BODY ── */}
      <div className="mcm-body">
        <TeamRow
          side="home"
          match={match}
          score={homeScore}
          onInc={() => handleInc("home")}
          onDec={() => handleDec("home")}
          isDisabled={isDisabled}
          isSaved={isSaved}
          isAdvancing={advancingTeam === "home"}
          onAdvClick={handleAdvClick}
        />

        {/* Divisor */}
        <div className="mcm-vs-row">
          <div className="mcm-vs-line"/>
          <span className="mcm-vs">
            {match.is_knockout && !isDisabled ? <SwordsIcon/> : "VS"}
          </span>
          <div className="mcm-vs-line"/>
        </div>

        <TeamRow
          side="away"
          match={match}
          score={awayScore}
          onInc={() => handleInc("away")}
          onDec={() => handleDec("away")}
          isDisabled={isDisabled}
          isSaved={isSaved}
          isAdvancing={advancingTeam === "away"}
          onAdvClick={handleAdvClick}
        />
      </div>

      {/* ── FOOTER ── */}
      <div className="mcm-footer">
        <span className="mcm-meta">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
          {isLive ? `${match.minute || "??"}′` : match.time || "—"}
        </span>
        <div className="mcm-footer-sep"/>
        <span className="mcm-meta">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18"/><line x1="7" y1="2" x2="7" y2="6"/><line x1="17" y1="2" x2="17" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {match.date || "—"}
        </span>
      </div>

    </div>
  );
}