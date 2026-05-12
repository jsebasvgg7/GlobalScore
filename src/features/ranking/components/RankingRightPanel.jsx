import React from "react";
import "../styles/RankingRightPanel.css";

const initials = (name = "") => (name || "U").slice(0, 2).toUpperCase();
const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

function PodiumStep({ user, rank, rankingUsers }) {
  if (!user) return null;

  const accuracy =
    user.rankPredictions > 0
      ? Math.round((user.rankCorrect / user.rankPredictions) * 100)
      : 0;

  const medals = ["ORO", "PLATA", "BRONCE"];
  const modifiers = ["rrp-step--gold", "rrp-step--silver", "rrp-step--bronze"];

  return (
    <div className={`rrp-step ${modifiers[rank]}`}>
      <div className="rrp-step-rank">{rank + 1}</div>

      <div className="rrp-step-body">
        <div className="rrp-step-medal">{medals[rank]}</div>

        <div className="rrp-step-avatar">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} />
          ) : (
            <span>{initials(user.name)}</span>
          )}
        </div>

        <div className="rrp-step-info">
          <span className="rrp-step-name">{user.name}</span>
          <span className="rrp-step-pts">{fmt(user.rankPoints)} pts</span>
        </div>

        <div className="rrp-step-stats">
          <div className="rrp-step-stat">
            <span className="rrp-step-stat-val">{user.rankCorrect}</span>
            <span className="rrp-step-stat-lbl">AC</span>
          </div>
          <div className="rrp-step-stat">
            <span className="rrp-step-stat-val">{user.rankPredictions}</span>
            <span className="rrp-step-stat-lbl">PRED</span>
          </div>
          <div className="rrp-step-stat rrp-step-stat--acc">
            <span className="rrp-step-stat-val">{accuracy}</span>
            <span className="rrp-step-stat-lbl">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankingRightPanel({
  users = [],
  currentUser = null,
  rankingType = "global",
}) {
  const rankingUsers = users.map((u) => ({
    ...u,
    rankPoints:
      rankingType === "monthly" ? u.monthly_points || 0 : u.points || 0,
    rankCorrect:
      rankingType === "monthly" ? u.monthly_correct || 0 : u.correct || 0,
    rankPredictions:
      rankingType === "monthly"
        ? u.monthly_predictions || 0
        : u.predictions || 0,
  }));

  const sorted = [...rankingUsers].sort((a, b) => b.rankPoints - a.rankPoints);
  const top3 = sorted.slice(0, 3);

  const leader = sorted[0] || null;
  const totalParticipants = users.filter(
    (u) =>
      (rankingType === "monthly"
        ? u.monthly_predictions
        : u.predictions) > 0
  ).length;

  return (
    <aside className="rrp-root">

      {/* ── LABEL ── */}
      <div className="rrp-label">
        <span className="rrp-label-dot" />
        PODIO
        <span className="rrp-label-dot" />
      </div>

      {/* ── PODIO ESCALERA VERTICAL ── */}
      <div className="rrp-podium">
        {top3.map((user, i) => (
          <PodiumStep
            key={user.id}
            user={user}
            rank={i}
            rankingUsers={rankingUsers}
          />
        ))}
      </div>

      {/* ── STATS GLOBALES ── */}
      {leader && (
        <div className="rrp-global">
          <div className="rrp-global-title">
            {rankingType === "monthly"
              ? "CLASIFICACIÓN MENSUAL"
              : "CLASIFICACIÓN GLOBAL"}
          </div>

          <div className="rrp-global-row">
            <span className="rrp-global-lbl">Registrados</span>
            <span className="rrp-global-val">{users.length}</span>
          </div>
          <div className="rrp-global-row">
            <span className="rrp-global-lbl">Participantes</span>
            <span className="rrp-global-val">{totalParticipants}</span>
          </div>
          <div className="rrp-global-row">
            <span className="rrp-global-lbl">Líder</span>
            <span className="rrp-global-val rrp-global-val--leader">
              {leader.name}
            </span>
          </div>
          <div className="rrp-global-row">
            <span className="rrp-global-lbl">Puntos líder</span>
            <span className="rrp-global-val rrp-global-val--pts">
              {fmt(leader.rankPoints)}
            </span>
          </div>

          {currentUser && (
            <div className="rrp-global-row rrp-global-row--me">
              <span className="rrp-global-lbl">Tu posición</span>
              <span className="rrp-global-val">
                #
                {sorted.findIndex((u) => u.id === currentUser.id) + 1 || "—"}
              </span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
} 