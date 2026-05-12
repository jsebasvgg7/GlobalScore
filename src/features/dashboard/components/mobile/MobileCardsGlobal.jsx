import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Trophy, Target, Award, Star, Shield, Clock } from "lucide-react";
import '../../styles/MobileCardsGlobal.css';
// ── Icono espadas knockout ───────────────────────────────────────
const SwordsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="9.5 14.5 3 21" />
    <polyline points="14.5 9.5 21 3 21 6 18 6" />
  </svg>
);

// ────────────────────────────────────────────────────────────────
//  SHARED: Botón tecla brutalista +/-
// ────────────────────────────────────────────────────────────────
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
        "mcg-key",
        accent ? "mcg-key--accent" : "",
        pressed ? "mcg-key--pressed" : "",
        disabled ? "mcg-key--disabled" : "",
      ].filter(Boolean).join(" ")}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={disabled}
      aria-label={symbol === "+" ? "Aumentar" : "Disminuir"}
    >
      <span className="mcg-key-face">
        <span className="mcg-key-symbol">{symbol}</span>
      </span>
      <span className="mcg-key-shadow" />
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
//  SHARED: Score display retro
// ────────────────────────────────────────────────────────────────
function ScoreDisplay({ value, saved }) {
  const isEmpty = value === "" || value === null || value === undefined;
  return (
    <div className={[
      "mcg-score-display",
      saved ? "mcg-score-display--saved" : "",
      isEmpty ? "mcg-score-display--empty" : "",
    ].filter(Boolean).join(" ")}>
      <span className="mcg-score-num">{isEmpty ? "—" : value}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  SHARED: Pill de estado
// ────────────────────────────────────────────────────────────────
function StatusPill({ mod, label, live = false, saving = false }) {
  return (
    <span className={`mcg-pill mcg-pill--${mod}`}>
      {live && <span className="mcg-live-dot" />}
      {saving && <span className="mcg-spin" />}
      {label}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────
//  SHARED: Header de tarjeta (logo liga + nombre + pill)
// ────────────────────────────────────────────────────────────────
function CardHeader({ logoUrl, logoEmoji, name, season, pillMod, pillLabel, live, saving, isKo }) {
  return (
    <div className="mcg-header">
      <div className="mcg-header-left">
        <div className="mcg-league-ico">
          {logoUrl
            ? <img src={logoUrl} alt={name} onError={e => (e.target.style.display = "none")} />
            : (logoEmoji || "🏆")}
        </div>
        <div className="mcg-title-group">
          <span className="mcg-league-name">{name || "Liga"}</span>
          {season && <span className="mcg-season">{season}</span>}
        </div>
        {isKo && (
          <span className="mcg-ko-badge">
            <SwordsIcon /> KO
          </span>
        )}
      </div>
      <StatusPill mod={pillMod} label={pillLabel} live={live} saving={saving} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
//  SHARED: Footer meta (hora + fecha)
// ────────────────────────────────────────────────────────────────
function CardFooterMeta({ time, date, isLive, minute }) {
  return (
    <div className="mcg-footer">
      <span className="mcg-meta">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
        </svg>
        {isLive ? `${minute || "??"}′` : (time || "—")}
      </span>
      <div className="mcg-footer-sep" />
      <span className="mcg-meta">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" /><line x1="7" y1="2" x2="7" y2="6" />
          <line x1="17" y1="2" x2="17" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {date || "—"}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  1. MATCH CARD MOBILE
// ════════════════════════════════════════════════════════════════
function TeamRow({ side, match, score, onInc, onDec, isDisabled, isSaved, isAdvancing, onAdvClick }) {
  const isHome = side === "home";
  const teamName = isHome ? match.home_team : match.away_team;
  const logoUrl = isHome ? match.home_team_logo_url : match.away_team_logo_url;
  const logoEmoji = isHome ? match.home_team_logo : match.away_team_logo;

  return (
    <div className={["mcg-team-row", isAdvancing ? "mcg-team-row--adv" : ""].filter(Boolean).join(" ")}>
      <div
        className={[
          "mcg-shield",
          match.is_knockout && !isDisabled ? "mcg-shield--tap" : "",
          isAdvancing ? "mcg-shield--on" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => match.is_knockout && !isDisabled && onAdvClick(side)}
      >
        {logoUrl
          ? <img src={logoUrl} alt={teamName} onError={e => (e.target.style.display = "none")} />
          : <span>{logoEmoji || "⚽"}</span>}
        {isAdvancing && !isDisabled && (
          <div className="mcg-adv-dot"><CheckCircle2 size={8} /></div>
        )}
      </div>

      <span className="mcg-team-name">{teamName}</span>

      <div className="mcg-controls">
        <KeyBtn symbol="−" onPress={onDec} disabled={isDisabled || score <= 0 || score === ""} />
        <ScoreDisplay value={score} saved={isSaved} />
        <KeyBtn symbol="+" onPress={onInc} disabled={isDisabled} accent />
      </div>
    </div>
  );
}

export function MatchCardMobile({ match, userPred, onPredict }) {
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");
  const [advancingTeam, setAdvancingTeam] = useState(userPred?.predicted_advancing_team ?? null);
  const [isSaved, setIsSaved] = useState(userPred !== undefined);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setHomeScore(userPred?.home_score ?? "");
    setAwayScore(userPred?.away_score ?? "");
    setAdvancingTeam(userPred?.predicted_advancing_team ?? null);
    setIsSaved(userPred !== undefined);
  }, [userPred]);

  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const isLive = match.status === "live";
  const isDisabled = isPastDeadline || match.status !== "pending";

  const triggerSave = (home, away, adv) => {
    const isValid = home !== "" && away !== "" && !isNaN(parseInt(home)) && !isNaN(parseInt(away));
    if (!isValid || isDisabled) return;
    const isDiff =
      parseInt(home) !== userPred?.home_score ||
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

  const pillConfig = isLive
    ? { mod: "live", label: "EN VIVO", live: true }
    : isPastDeadline
      ? { mod: "expired", label: "CERRADO" }
      : isSaving
        ? { mod: "saving", label: "GUARDANDO", saving: true }
        : isSaved
          ? { mod: "saved", label: "GUARDADO" }
          : { mod: "pending", label: "PENDIENTE" };

  return (
    <div className={[
      "mcg-match-card",
      isLive ? "mcg-match-card--live" : "",
      isPastDeadline ? "mcg-match-card--expired" : "",
    ].filter(Boolean).join(" ")}>

      <CardHeader
        logoUrl={match.league_logo_url}
        name={match.league}
        pillMod={pillConfig.mod}
        pillLabel={pillConfig.label}
        live={pillConfig.live}
        saving={pillConfig.saving}
        isKo={match.is_knockout}
      />

      <div className="mcg-match-body">
        <TeamRow side="home" match={match} score={homeScore}
          onInc={() => handleInc("home")} onDec={() => handleDec("home")}
          isDisabled={isDisabled} isSaved={isSaved}
          isAdvancing={advancingTeam === "home"} onAdvClick={handleAdvClick} />

        <div className="mcg-vs-row">
          <div className="mcg-vs-line" />
          <span className="mcg-vs">
            {match.is_knockout && !isDisabled ? <SwordsIcon /> : "VS"}
          </span>
          <div className="mcg-vs-line" />
        </div>

        <TeamRow side="away" match={match} score={awayScore}
          onInc={() => handleInc("away")} onDec={() => handleDec("away")}
          isDisabled={isDisabled} isSaved={isSaved}
          isAdvancing={advancingTeam === "away"} onAdvClick={handleAdvClick} />
      </div>

      <CardFooterMeta time={match.time} date={match.date} isLive={isLive} minute={match.minute} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  2. LEAGUE CARD MOBILE
// ════════════════════════════════════════════════════════════════
export function LeagueCardMobile({ league, userPrediction, onPredict }) {
  const [champion, setChampion] = useState(userPrediction?.predicted_champion ?? "");
  const [topScorer, setTopScorer] = useState(userPrediction?.predicted_top_scorer ?? "");
  const [topAssist, setTopAssist] = useState(userPrediction?.predicted_top_assist ?? "");
  const [mvp, setMvp] = useState(userPrediction?.predicted_mvp ?? "");

  useEffect(() => {
    setChampion(userPrediction?.predicted_champion ?? "");
    setTopScorer(userPrediction?.predicted_top_scorer ?? "");
    setTopAssist(userPrediction?.predicted_top_assist ?? "");
    setMvp(userPrediction?.predicted_mvp ?? "");
  }, [userPrediction]);

  const now = new Date();
  const deadline = league.deadline ? new Date(league.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const hasPrediction = userPrediction !== undefined;
  const isFinished = league.status === "finished";
  const isDisabled = isPastDeadline || isFinished;

  const isPredictionChanged =
    champion !== (userPrediction?.predicted_champion ?? "") ||
    topScorer !== (userPrediction?.predicted_top_scorer ?? "") ||
    topAssist !== (userPrediction?.predicted_top_assist ?? "") ||
    mvp !== (userPrediction?.predicted_mvp ?? "");

  const showSaveButton = !isDisabled && (!hasPrediction || isPredictionChanged);

  const handleSubmit = () => {
    if (!champion.trim() || !topScorer.trim() || !topAssist.trim() || !mvp.trim()) {
      alert("Por favor completa todas las predicciones");
      return;
    }
    onPredict(league.id, champion.trim(), topScorer.trim(), topAssist.trim(), mvp.trim());
  };

  const pillConfig = isFinished
    ? { mod: "finished", label: "FINALIZADO" }
    : isPastDeadline
      ? { mod: "expired", label: "EXPIRADO" }
      : hasPrediction && !isPredictionChanged
        ? { mod: "saved", label: "GUARDADO" }
        : { mod: "pending", label: "PENDIENTE" };

  return (
    <div className={[
      "mcg-league-card",
      isFinished ? "mcg-league-card--finished" : "",
      isPastDeadline ? "mcg-league-card--expired" : "",
    ].filter(Boolean).join(" ")}>

      <CardHeader
        logoUrl={league.logo_url}
        logoEmoji={league.logo}
        name={league.name}
        season={league.season}
        pillMod={pillConfig.mod}
        pillLabel={pillConfig.label}
      />

      <div className="mcg-lc-body">

        {/* Campeón */}
        <div className="mcg-lc-field">
          <label className="mcg-lc-label">
            <Shield size={10} /> Campeón
          </label>
          <input
            type="text"
            className={`mcg-lc-input${hasPrediction && champion ? " mcg-lc-input--filled" : ""}`}
            value={champion}
            onChange={e => setChampion(e.target.value)}
            placeholder="Equipo campeón..."
            disabled={isDisabled}
          />
          {isFinished && league.champion && (
            <div className="mcg-lc-result">
              <CheckCircle2 size={10} />
              <span>{league.champion}</span>
              {champion.toLowerCase() === league.champion.toLowerCase() && (
                <span className="mcg-lc-correct">✓</span>
              )}
            </div>
          )}
        </div>

        {/* Goleador + Asistidor */}
        <div className="mcg-lc-row">
          <div className="mcg-lc-cell">
            <label className="mcg-lc-label"><Trophy size={10} /> Goleador</label>
            <input
              type="text"
              className={`mcg-lc-input${hasPrediction && topScorer ? " mcg-lc-input--filled" : ""}`}
              value={topScorer}
              onChange={e => setTopScorer(e.target.value)}
              placeholder="Jugador..."
              disabled={isDisabled}
            />
            {isFinished && league.top_scorer && (
              <div className="mcg-lc-result">
                <CheckCircle2 size={10} />
                <span>{league.top_scorer}</span>
                {topScorer.toLowerCase() === league.top_scorer.toLowerCase() && (
                  <span className="mcg-lc-correct">✓</span>
                )}
              </div>
            )}
          </div>
          <div className="mcg-lc-cell">
            <label className="mcg-lc-label"><Target size={10} /> Asistidor</label>
            <input
              type="text"
              className={`mcg-lc-input${hasPrediction && topAssist ? " mcg-lc-input--filled" : ""}`}
              value={topAssist}
              onChange={e => setTopAssist(e.target.value)}
              placeholder="Jugador..."
              disabled={isDisabled}
            />
            {isFinished && league.top_assist && (
              <div className="mcg-lc-result">
                <CheckCircle2 size={10} />
                <span>{league.top_assist}</span>
                {topAssist.toLowerCase() === league.top_assist.toLowerCase() && (
                  <span className="mcg-lc-correct">✓</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MVP */}
        <div className="mcg-lc-field mcg-lc-field--last">
          <label className="mcg-lc-label"><Award size={10} /> MVP</label>
          <input
            type="text"
            className={`mcg-lc-input${hasPrediction && mvp ? " mcg-lc-input--filled" : ""}`}
            value={mvp}
            onChange={e => setMvp(e.target.value)}
            placeholder="Jugador MVP..."
            disabled={isDisabled}
          />
          {isFinished && league.mvp_player && (
            <div className="mcg-lc-result">
              <CheckCircle2 size={10} />
              <span>{league.mvp_player}</span>
              {mvp.toLowerCase() === league.mvp_player.toLowerCase() && (
                <span className="mcg-lc-correct">✓</span>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="mcg-lc-footer">
        {isPastDeadline && !isFinished ? (
          <span className="mcg-lc-footer-msg mcg-lc-footer-msg--expired">
            <Clock size={11} /> Plazo expirado
          </span>
        ) : isFinished && userPrediction ? (
          <span className="mcg-lc-footer-msg mcg-lc-footer-msg--finished">
            <Star size={11} />
            {userPrediction.points_earned > 0
              ? `+${userPrediction.points_earned} pts obtenidos`
              : "Sin puntos esta vez"}
          </span>
        ) : !isDisabled && hasPrediction && !showSaveButton ? (
          <span className="mcg-lc-footer-msg mcg-lc-footer-msg--saved">
            <CheckCircle2 size={11} /> Predicción guardada
            {userPrediction?.points_earned > 0 && (
              <span className="mcg-pts-badge">+{userPrediction.points_earned}</span>
            )}
          </span>
        ) : showSaveButton ? (
          <button className="mcg-save-btn" onClick={handleSubmit}>
            <CheckCircle2 size={11} />
            {hasPrediction ? "Actualizar" : "Guardar"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  3. AWARD CARD MOBILE
// ════════════════════════════════════════════════════════════════
export function AwardCardMobile({ award, userPrediction, onPredict }) {
  const [predictedWinner, setPredictedWinner] = useState(userPrediction?.predicted_winner ?? "");

  useEffect(() => {
    setPredictedWinner(userPrediction?.predicted_winner ?? "");
  }, [userPrediction]);

  const now = new Date();
  const deadline = award.deadline ? new Date(award.deadline) : null;
  const isPastDeadline = deadline && now >= deadline;
  const hasPrediction = userPrediction !== undefined;
  const isFinished = award.status === "finished";
  const isDisabled = isPastDeadline || isFinished;

  const isPredictionChanged = predictedWinner !== (userPrediction?.predicted_winner ?? "");
  const showSaveButton = !isDisabled && (!hasPrediction || isPredictionChanged);

  const handleSubmit = () => {
    if (!predictedWinner.trim()) {
      alert("Por favor ingresa tu predicción");
      return;
    }
    onPredict(award.id, predictedWinner.trim());
  };

  const pillConfig = isFinished
    ? { mod: "finished", label: "FINALIZADO" }
    : isPastDeadline
      ? { mod: "expired", label: "EXPIRADO" }
      : hasPrediction && !isPredictionChanged
        ? { mod: "saved", label: "GUARDADO" }
        : { mod: "pending", label: "PENDIENTE" };

  return (
    <div className={[
      "mcg-award-card",
      isFinished ? "mcg-award-card--finished" : "",
      isPastDeadline ? "mcg-award-card--expired" : "",
    ].filter(Boolean).join(" ")}>

      <CardHeader
        logoUrl={award.logo_url?.startsWith("http") ? award.logo_url : null}
        logoEmoji={award.logo || "🏅"}
        name={award.name}
        season={award.season}
        pillMod={pillConfig.mod}
        pillLabel={pillConfig.label}
      />

      <div className="mcg-ac-body">

        <div className="mcg-ac-field">
          <label className="mcg-ac-label">
            <Award size={10} /> Tu predicción del ganador
          </label>
          <input
            type="text"
            className={`mcg-ac-input${hasPrediction && predictedWinner ? " mcg-ac-input--filled" : ""}`}
            value={predictedWinner}
            onChange={e => setPredictedWinner(e.target.value)}
            placeholder="Nombre del ganador..."
            disabled={isDisabled}
          />
          {isFinished && award.winner && (
            <div className="mcg-ac-result">
              <CheckCircle2 size={10} />
              <span>Ganador: <strong>{award.winner}</strong></span>
              {predictedWinner.toLowerCase() === award.winner.toLowerCase() && (
                <span className="mcg-ac-correct">✓ ¡Acertaste!</span>
              )}
            </div>
          )}
        </div>

        {award.category && (
          <div className="mcg-ac-category">
            <span className="mcg-ac-cat-badge">
              <Star size={9} /> {award.category}
            </span>
          </div>
        )}

      </div>

      <div className="mcg-ac-footer">
        {isPastDeadline && !isFinished ? (
          <span className="mcg-lc-footer-msg mcg-lc-footer-msg--expired">
            <Clock size={11} /> Plazo expirado
          </span>
        ) : isFinished && userPrediction ? (
          <span className="mcg-lc-footer-msg mcg-lc-footer-msg--finished">
            <Star size={11} />
            {userPrediction.points_earned > 0
              ? `+${userPrediction.points_earned} pts obtenidos`
              : "Sin puntos esta vez"}
          </span>
        ) : !isDisabled && hasPrediction && !showSaveButton ? (
          <span className="mcg-lc-footer-msg mcg-lc-footer-msg--saved">
            <CheckCircle2 size={11} /> Predicción guardada
            {userPrediction?.points_earned > 0 && (
              <span className="mcg-pts-badge">+{userPrediction.points_earned}</span>
            )}
          </span>
        ) : showSaveButton ? (
          <button className="mcg-save-btn" onClick={handleSubmit}>
            <CheckCircle2 size={11} />
            {hasPrediction ? "Actualizar" : "Guardar"}
          </button>
        ) : null}
      </div>
    </div>
  );
}