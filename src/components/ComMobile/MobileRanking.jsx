import React, { useState } from "react";
import { Globe, Calendar, Crown } from "lucide-react";
import UserProfileModal from "../ComOthers/UserProfileModal";
import "../../styles/StylesMobile/MobileRanking.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

function MobAvatar({ user, size = "md" }) {
  const cls = `mrk-av mrk-av--${size}`;
  if (user?.avatar_url)
    return <img src={user.avatar_url} alt={user.name} className={cls} />;
  return (
    <div className={`${cls} mrk-av--ph`}>
      {(user?.name || "U")[0].toUpperCase()}
    </div>
  );
}

/* ── Podio top 3 ── */
function PodiumCard({ user, rank, onSelect }) {
  if (!user) return <div className="mrk-podium-slot mrk-podium-slot--empty" />;

  const accuracy =
    user.rankPredictions > 0
      ? Math.round((user.rankCorrect / user.rankPredictions) * 100)
      : 0;

  const mods   = ["gold", "silver", "bronze"];
  const labels = ["ORO", "PLATA", "BRONCE"];
  const nums   = ["1", "2", "3"];

  return (
    <div className={`mrk-podium-card mrk-podium-card--${mods[rank]}`}>
      <span className="mrk-podium-medal">{labels[rank]}</span>

      <button className="mrk-podium-av-btn" onClick={() => onSelect(user.id)}>
        <div className="mrk-podium-av-ring">
          <MobAvatar user={user} size="podium" />
        </div>
        <span className="mrk-podium-num">{nums[rank]}</span>
      </button>

      <span className="mrk-podium-name">{user.name}</span>
      <span className="mrk-podium-pts">{fmt(user.rankPoints)} pts</span>

      <div className="mrk-podium-stats">
        <span className="mrk-podium-stat">
          <span className="mrk-podium-stat-val">{user.rankCorrect}</span>
          <span className="mrk-podium-stat-lbl">AC</span>
        </span>
        <span className="mrk-podium-sep" />
        <span className="mrk-podium-stat">
          <span className="mrk-podium-stat-val mrk-podium-stat-val--acc">{accuracy}%</span>
          <span className="mrk-podium-stat-lbl">PREC</span>
        </span>
      </div>
    </div>
  );
}

/* ── Fila de tabla ── */
function TableRow({ user, pos, isMe, onSelect }) {
  const accuracy =
    user.rankPredictions > 0
      ? Math.round((user.rankCorrect / user.rankPredictions) * 100)
      : 0;

  const topMod =
    pos === 1 ? " mrk-row--gold"
    : pos === 2 ? " mrk-row--silver"
    : pos === 3 ? " mrk-row--bronze"
    : "";

  return (
    <div className={`mrk-row${topMod}${isMe ? " mrk-row--me" : ""}`}>
      <span className={`mrk-row-num mrk-row-num--${Math.min(pos, 4)}`}>{pos}</span>

      <button className="mrk-row-user" onClick={() => onSelect(user.id)}>
        <MobAvatar user={user} size="sm" />
        <div className="mrk-row-info">
          <span className="mrk-row-name">
            {user.name}
            {isMe && <span className="mrk-row-you">TÚ</span>}
          </span>
          <span className="mrk-row-sub">{user.rankCorrect} aciertos</span>
        </div>
      </button>

      <div className="mrk-row-right">
        <span className="mrk-row-pts">{fmt(user.rankPoints)}<span className="mrk-row-pts-lbl">pts</span></span>
        <span className="mrk-row-acc">{accuracy}%</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function MobileRanking({
  users        = [],
  currentUser  = null,
  rankingType  = "global",
  onChangeType,
}) {
  const [selectedUserId, setSelectedUserId] = useState(null);

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
  const top3   = sorted.slice(0, 3);
  const rest   = sorted.slice(3);

  const totalRegistered   = users.length;
  const totalParticipated = rankingUsers.filter((u) => u.rankPredictions > 0).length;
  const leader            = sorted[0] || null;

  const getCurrentMonthLabel = () => {
    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <div className="mrk-root">

      {/* ── TABS ── */}
      <div className="mrk-tabs">
        {[
          { key: "global",     icon: <Globe size={13}/>,    label: "Global"  },
          { key: "monthly",    icon: <Calendar size={13}/>, label: "Mensual" },
          { key: "halloffame", icon: <Crown size={13}/>,    label: "S. Fama" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`mrk-tab${rankingType === key ? " active" : ""}`}
            onClick={() => onChangeType?.(key)}
          >
            {icon}<span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── STATS RÁPIDOS ── */}
      <div className="mrk-stats-row">
        <div className="mrk-stat-block">
          <span className="mrk-stat-num">{totalRegistered}</span>
          <span className="mrk-stat-lbl">Registrados</span>
        </div>
        <div className="mrk-stat-divider" />
        <div className="mrk-stat-block">
          <span className="mrk-stat-num">{totalParticipated}</span>
          <span className="mrk-stat-lbl">Participantes</span>
        </div>
        {leader && (
          <>
            <div className="mrk-stat-divider" />
            <div className="mrk-stat-block mrk-stat-block--leader">
              <span className="mrk-stat-leader-name">{leader.name}</span>
              <span className="mrk-stat-leader-pts">{fmt(leader.rankPoints)} pts</span>
              <span className="mrk-stat-lbl">Líder</span>
            </div>
          </>
        )}
      </div>

      {/* ── PODIO ── */}
      {rankingType !== "halloffame" && top3.length > 0 && (
        <div className="mrk-podium-wrap">
          {/* Header */}
          <div className="mrk-podium-header">
            <div className="mrk-podium-header-line mrk-podium-header-line--left" />
            <Crown size={13} className="mrk-podium-crown" />
            <span className="mrk-podium-title">Podio</span>
            <div className="mrk-podium-header-line mrk-podium-header-line--right" />
          </div>

          {/* Escalera — 2° izquierda, 1° centro alto, 3° derecha baja */}
          <div className="mrk-podium-stage">
            <div className="mrk-podium-col mrk-podium-col--second">
              <PodiumCard user={top3[1]} rank={1} onSelect={setSelectedUserId} />
              <div className="mrk-podium-step mrk-podium-step--second" />
            </div>
            <div className="mrk-podium-col mrk-podium-col--first">
              <PodiumCard user={top3[0]} rank={0} onSelect={setSelectedUserId} />
              <div className="mrk-podium-step mrk-podium-step--first" />
            </div>
            <div className="mrk-podium-col mrk-podium-col--third">
              <PodiumCard user={top3[2]} rank={2} onSelect={setSelectedUserId} />
              <div className="mrk-podium-step mrk-podium-step--third" />
            </div>
          </div>
        </div>
      )}

      {/* ── TABLA ── */}
      {rankingType !== "halloffame" && (
        <div className="mrk-table">
          <div className="mrk-table-header">
            <span className="mrk-table-title">Clasificación</span>
            <span className="mrk-table-sub">
              {rankingType === "monthly" ? getCurrentMonthLabel() : "Global"}
            </span>
          </div>

          {/* Top 3 primero */}
          {top3.map((user, i) => (
            <TableRow
              key={user.id}
              user={user}
              pos={i + 1}
              isMe={user.id === currentUser?.id}
              onSelect={setSelectedUserId}
            />
          ))}

          {/* Separador */}
          {rest.length > 0 && <div className="mrk-table-sep" />}

          {/* Resto */}
          {rest.map((user, i) => (
            <TableRow
              key={user.id}
              user={user}
              pos={i + 4}
              isMe={user.id === currentUser?.id}
              onSelect={setSelectedUserId}
            />
          ))}
        </div>
      )}

      {/* Modal de perfil */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}