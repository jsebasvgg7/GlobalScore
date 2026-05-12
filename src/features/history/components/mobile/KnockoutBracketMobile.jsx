import { useMemo } from "react";
import { Trophy, ChevronDown } from "lucide-react";

const ROUND_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

// ─── Colores por ronda ────────────────────────────────────────────────────────
const ROUND_COLOR = {
  Octavos:   { bg: "rgba(91,79,216,0.06)",  border: "rgba(91,79,216,0.18)",  label: "#8b7fc7" },
  Cuartos:   { bg: "rgba(61,170,128,0.06)", border: "rgba(61,170,128,0.18)", label: "#3daa80" },
  Semifinal: { bg: "rgba(232,160,32,0.06)", border: "rgba(232,160,32,0.18)", label: "#e8a020" },
  Tercero:   { bg: "rgba(136,135,128,0.06)",border: "rgba(136,135,128,0.2)", label: "#888780" },
  Final:     { bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.35)", label: "#f59e0b" },
};

// ─── Una tarjeta de partido ───────────────────────────────────────────────────
function MobileMatchCard({ match, isFinal }) {
  const winA = match.winner === "team_a";
  const winB = match.winner === "team_b";
  const hasPen = match.penalties_a != null || match.penalties_b != null;
  const winColor = isFinal ? "#f59e0b" : "var(--accent)";

  return (
    <div className={`hcp-mb-match ${isFinal ? "hcp-mb-match--final" : ""}`}>
      {/* Equipo A */}
      <div className={`hcp-mb-team ${winA ? "hcp-mb-team--win" : winB ? "hcp-mb-team--lose" : ""}`}
        style={winA ? { "--mb-win": winColor } : {}}>
        <span className="hcp-mb-team-name">{match.team_a || "—"}</span>
        <span className="hcp-mb-score">{match.score_a ?? "–"}</span>
      </div>

      {/* Divisor + penales */}
      <div className="hcp-mb-divider">
        {hasPen && (
          <span className="hcp-mb-pen">
            ({match.penalties_a ?? "–"} – {match.penalties_b ?? "–"}) pen.
          </span>
        )}
      </div>

      {/* Equipo B */}
      <div className={`hcp-mb-team ${winB ? "hcp-mb-team--win" : winA ? "hcp-mb-team--lose" : ""}`}
        style={winB ? { "--mb-win": winColor } : {}}>
        <span className="hcp-mb-team-name">{match.team_b || "—"}</span>
        <span className="hcp-mb-score">{match.score_b ?? "–"}</span>
      </div>

      {/* Notas */}
      {match.notes && <div className="hcp-mb-notes">{match.notes}</div>}
    </div>
  );
}

// ─── Bloque de ronda ─────────────────────────────────────────────────────────
function MobileRoundBlock({ round, matches, isLast, animIdx }) {
  const isFinal = round === "Final";
  const colors  = ROUND_COLOR[round] || ROUND_COLOR["Octavos"];

  return (
    <div className="hcp-mb-round-wrap" style={{ "--round-delay": `${animIdx * 90}ms` }}>

      {/* Etiqueta de ronda */}
      <div className="hcp-mb-round-header" style={{ borderColor: colors.border, background: colors.bg }}>
        <span className="hcp-mb-round-dot" style={{ background: colors.label }} />
        <span className="hcp-mb-round-label" style={{ color: colors.label }}>
          {isFinal && <Trophy size={11} style={{ marginRight: 5, flexShrink: 0 }} />}
          {round}
        </span>
        <span className="hcp-mb-round-count">
          {matches.length} {matches.length === 1 ? "partido" : "partidos"}
        </span>
      </div>

      {/* Tarjetas de partido */}
      <div className="hcp-mb-matches-col">
        {matches.map((m, i) => (
          <MobileMatchCard key={i} match={m} isFinal={isFinal} />
        ))}
      </div>

      {/* Flecha de progresión hacia la siguiente ronda */}
      {!isLast && (
        <div className="hcp-mb-arrow">
          <div className="hcp-mb-arrow-line" />
          <ChevronDown size={14} className="hcp-mb-arrow-icon" />
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function KnockoutBracketMobile({ knockout }) {
  const byRound = useMemo(() => {
    return knockout.reduce((acc, m) => {
      const r = m.round || "Final";
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
      return acc;
    }, {});
  }, [knockout]);

  const rounds = ROUND_ORDER.filter(r => byRound[r]);

  if (rounds.length === 0) {
    return <p className="hcp-empty-note">Sin partidos registrados.</p>;
  }

  return (
    <div className="hcp-mb-bracket">
      {rounds.map((round, i) => (
        <MobileRoundBlock
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
