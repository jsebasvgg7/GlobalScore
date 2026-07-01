import { useMemo } from "react";
import { Trophy, ChevronDown } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   LLAVE (KNOCKOUT) — fiel a comp_tab_knockout.dart / KnockoutBracketWidget
   100% unificado a los tokens hcm-* (mismo mono, mismos bordes,
   mismas sombras duras que el resto de HistoricalCompetitionsMobile).
   Ya no depende de [data-style] ni de variables ajenas al sistema.
══════════════════════════════════════════════════════════════ */

const ROUND_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

/* Color de acento por ronda — todos tomados de los tokens ya
   definidos en HistoricalCompetitionsPageMobile.css, nada hardcodeado. */
const ROUND_COLOR = {
  Octavos: "var(--hcm-purple)",
  Cuartos: "var(--hcm-green)",
  Semifinal: "var(--hcm-type-international)",
  Tercero: "var(--hcm-muted)",
  Final: "var(--hcm-gold)",
};

/* ── Tarjeta de partido ─────────────────────────────────────── */
function KoMatchCard({ match, isFinal }) {
  const winA = match.winner === "team_a";
  const winB = match.winner === "team_b";
  const hasPen = match.penalties_a != null || match.penalties_b != null;

  return (
    <div className={`hcm-ko-match ${isFinal ? "hcm-ko-match--final" : ""}`}>
      <div className={`hcm-ko-team ${winA ? "hcm-ko-team--win" : winB ? "hcm-ko-team--lose" : ""}`}>
        <span className="hcm-ko-name">{match.team_a || "—"}</span>
        <span className="hcm-ko-score">{match.score_a ?? "–"}</span>
      </div>

      <div className="hcm-ko-divider">
        {hasPen && (
          <span className="hcm-ko-pen">
            ({match.penalties_a ?? "–"} – {match.penalties_b ?? "–"}) pen.
          </span>
        )}
      </div>

      <div className={`hcm-ko-team ${winB ? "hcm-ko-team--win" : winA ? "hcm-ko-team--lose" : ""}`}>
        <span className="hcm-ko-name">{match.team_b || "—"}</span>
        <span className="hcm-ko-score">{match.score_b ?? "–"}</span>
      </div>

      {match.notes && <div className="hcm-ko-notes">{match.notes}</div>}
    </div>
  );
}

/* ── Bloque de ronda ────────────────────────────────────────── */
function KoRoundBlock({ round, matches, isLast, animIdx }) {
  const isFinal = round === "Final";
  const color = ROUND_COLOR[round] || "var(--hcm-purple)";

  return (
    <div className="hcm-ko-round" style={{ "--ko-delay": `${animIdx * 90}ms` }}>
      <div className="hcm-ko-round-header">
        <span className="hcm-ko-round-dot" style={{ background: color }} />
        <span className="hcm-ko-round-label" style={{ color }}>
          {isFinal && <Trophy size={11} />}
          {round.toUpperCase()}
        </span>
        <span className="hcm-ko-round-count">
          {matches.length} {matches.length === 1 ? "PARTIDO" : "PARTIDOS"}
        </span>
      </div>

      <div className="hcm-ko-matches">
        {matches.map((m, i) => (
          <KoMatchCard key={i} match={m} isFinal={isFinal} />
        ))}
      </div>

      {!isLast && (
        <div className="hcm-ko-arrow">
          <span className="hcm-ko-arrow-line" />
          <ChevronDown size={13} className="hcm-ko-arrow-icon" />
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ───────────────────────────────────── */
export default function KnockoutBracketMobile({ knockout }) {
  const byRound = useMemo(() => {
    return (knockout || []).reduce((acc, m) => {
      const r = m.round || "Final";
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
      return acc;
    }, {});
  }, [knockout]);

  const rounds = ROUND_ORDER.filter((r) => byRound[r]);

  if (rounds.length === 0) {
    return <div className="hcm-knockout-empty">Sin partidos registrados.</div>;
  }

  return (
    <div className="hcm-ko-bracket">
      {rounds.map((round, i) => (
        <KoRoundBlock
          key={round}
          round={round}
          matches={byRound[round]}
          isLast={i === rounds.length - 1}
          animIdx={i}
        />
      ))}
    </div>
  );
}