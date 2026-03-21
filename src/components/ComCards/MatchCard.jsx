import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import "../../styles/StylesCards/MatchCard.css";

// Espadas cruzadas SVG — indicador de ronda Knockout
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

// Abrevia el nombre del equipo a 3 letras
const abbr = (name = "") => {
  if (!name) return "???";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
};

export default function MatchCard({ match, userPred, onPredict }) {
  const [homeScore, setHomeScore] = useState(userPred?.home_score ?? "");
  const [awayScore, setAwayScore] = useState(userPred?.away_score ?? "");
  const [advancingTeam, setAdvancingTeam] = useState(
    userPred?.predicted_advancing_team ?? null
  );
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

  useEffect(() => {
    if (isDisabled) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    const isValid =
      !isNaN(home) && !isNaN(away) && homeScore !== "" && awayScore !== "";
    const isDiff =
      home !== userPred?.home_score ||
      away !== userPred?.away_score ||
      advancingTeam !== userPred?.predicted_advancing_team;

    if (isValid && isDiff) {
      setIsSaved(false);
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onPredict(match.id, home, away, advancingTeam);
          setTimeout(() => {
            setIsSaved(true);
            setIsSaving(false);
          }, 300);
        } catch (err) {
          console.error("❌ Error guardando:", err);
          setIsSaving(false);
        }
      }, 1000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [homeScore, awayScore, advancingTeam, isDisabled, match.id, onPredict, userPred]);

  const handleScoreChange = (team, value) => {
    if (isDisabled) return;
    const n = parseInt(value, 10);
    const score = isNaN(n) || n < 0 ? value : Math.min(n, 20);
    team === "home" ? setHomeScore(score) : setAwayScore(score);
    setIsSaved(false);
  };

  const handleAdvancingTeamClick = (team) => {
    if (isDisabled || !match.is_knockout) return;
    setAdvancingTeam((prev) => (prev === team ? null : team));
    setIsSaved(false);
  };

  // Estado del dot indicador
  const dotState =
    isPastDeadline || isLive
      ? "expired"
      : isSaving
      ? "saving"
      : isSaved
      ? "saved"
      : "pending";

  const boxDone = isSaved || isDisabled;

  return (
    <div className="mc-wrap">

      {/* ── Card principal ── */}
      <div className="mc-card">

        {/* Ícono de liga — top left */}
        <div className="mc-league-chip">
          {match.league_logo_url ? (
            <img
              src={match.league_logo_url}
              alt={match.league}
              className="mc-league-img"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <span className="mc-league-emoji">🏆</span>
          )}
        </div>

        {/* Indicador de estado — top right */}
        {match.is_knockout && !isDisabled ? (
          <SwordsIcon className="mc-swords-icon" />
        ) : (
          <span className={`mc-dot mc-dot--${dotState}`} />
        )}

        {/* ── Cuerpo: escudo · score · VS · score · escudo ── */}
        <div className="mc-body">

          {/* Equipo local */}
          <div
            className={[
              "mc-team",
              match.is_knockout && !isDisabled ? "mc-team--tap" : "",
              advancingTeam === "home" ? "mc-team--on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
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
                <span className="mc-shield-emoji">
                  {match.home_team_logo || "⚽"}
                </span>
              )}
              {advancingTeam === "home" && !isDisabled && (
                <div className="mc-adv-badge">
                  <CheckCircle2 size={8} />
                </div>
              )}
            </div>
            {/* Solo abreviación — sin nombre completo */}
            <span className="mc-team-abbr">{abbr(match.home_team)}</span>
          </div>

          {/* Score local */}
          <div className={`mc-box${boxDone ? " mc-box--done" : ""}`}>
            <input
              type="number"
              min="0"
              max="20"
              className="mc-input"
              value={homeScore}
              onChange={(e) => handleScoreChange("home", e.target.value)}
              placeholder="—"
              disabled={isDisabled}
            />
          </div>

          {/* VS central */}
          <div className="mc-vs">VS</div>

          {/* Score visitante */}
          <div className={`mc-box${boxDone ? " mc-box--done" : ""}`}>
            <input
              type="number"
              min="0"
              max="20"
              className="mc-input"
              value={awayScore}
              onChange={(e) => handleScoreChange("away", e.target.value)}
              placeholder="—"
              disabled={isDisabled}
            />
          </div>

          {/* Equipo visitante */}
          <div
            className={[
              "mc-team",
              match.is_knockout && !isDisabled ? "mc-team--tap" : "",
              advancingTeam === "away" ? "mc-team--on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
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
                <span className="mc-shield-emoji">
                  {match.away_team_logo || "⚽"}
                </span>
              )}
              {advancingTeam === "away" && !isDisabled && (
                <div className="mc-adv-badge">
                  <CheckCircle2 size={8} />
                </div>
              )}
            </div>
            {/* Solo abreviación — sin nombre completo */}
            <span className="mc-team-abbr">{abbr(match.away_team)}</span>
          </div>

        </div>

        {/* ── Footer: nombre liga + pill hora ── */}
        <div className="mc-footer">
          <span className="mc-league-label">{match.league || ""}</span>
          <div className={`mc-pill${isLive ? " mc-pill--live" : ""}`}>
            {isLive ? (
              <>
                <span className="mc-live-dot" />
                EN VIVO
              </>
            ) : (
              match.time || "—"
            )}
          </div>
        </div>

      </div>
    </div>
  );
}