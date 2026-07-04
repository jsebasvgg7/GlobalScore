import React, { useState, useRef, useEffect } from "react";
import { Globe, Calendar, Crown, Trophy, ChevronLeft, ChevronRight, Zap, Star, BookOpen, Flame, Target, Shield } from "lucide-react";
import { MobileUserProfile } from "@/features/profile";
import "../../styles/MobileRanking.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

const HOF_META = [
  { label: "ORO", color: "#c9a227", bg: "#FFC72C", textColor: "#4A3200" },
  { label: "PLATA", color: "#6b6b6b", bg: "#D9D9D9", textColor: "#3A3A3A" },
  { label: "BRONCE", color: "#a0652a", bg: "#E8A66E", textColor: "#4A2A0C" },
];

/* ── Config por tipo de Salón de la Fama ── */
const HOF_TYPE_CONFIG = {
  monthly: { Icon: Crown, color: "#c9a227", unitLabel: "coronas", periodLabel: "Título" },
  global: { Icon: Trophy, color: "#0ea5a8", unitLabel: "trofeos", periodLabel: "Edición" },
};

/* ── Avatar genérico ── */
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

/* ── Celda bento del líder (hero, ocupa 2 filas) ── */
function PodiumHero({ user, onSelect }) {
  if (!user) return null;
  const accuracy = user.rankPredictions > 0
    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) : 0;

  return (
    <button className="mrk-bento-hero" onClick={() => onSelect(user.id)}>
      <span className="mrk-bento-hero-tag">#1 LÍDER</span>
      <Crown size={20} className="mrk-bento-hero-crown" />
      <div className="mrk-bento-hero-av">
        <MobAvatar user={user} size="hero" />
      </div>
      <span className="mrk-bento-hero-name">{user.name}</span>
      <span className="mrk-bento-hero-pts">{fmt(user.rankPoints)}</span>
      <span className="mrk-bento-hero-pts-lbl">Puntos</span>
      <div className="mrk-bento-hero-foot">
        <span>{user.rankCorrect} aciertos</span>
        <span className="mrk-bento-hero-acc">{accuracy}%</span>
      </div>
    </button>
  );
}

/* ── Celda bento compacta (#2 / #3) ── */
function PodiumMini({ user, rank, onSelect }) {
  if (!user) return null;
  const mods = ["", "silver", "bronze"];
  return (
    <button className={`mrk-bento-mini mrk-bento-mini--${mods[rank]}`} onClick={() => onSelect(user.id)}>
      <div className="mrk-bento-mini-av">
        <MobAvatar user={user} size="sm" />
        <span className="mrk-bento-mini-badge">{rank + 1}</span>
      </div>
      <div className="mrk-bento-mini-info">
        <span className="mrk-bento-mini-name">{user.name}</span>
        <span className="mrk-bento-mini-pts">{fmt(user.rankPoints)} pts &middot; #{rank + 1}</span>
      </div>
    </button>
  );
}

/* ── Fila tabla (ranking) — estilo tile bento ── */
function TableRow({ user, pos, isMe, onSelect, legCount = 0 }) {
  const accuracy = user.rankPredictions > 0
    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) : 0;
  const topMod = pos === 1 ? " mrk-row--gold"
    : pos === 2 ? " mrk-row--silver"
      : pos === 3 ? " mrk-row--bronze" : "";

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
      <span className={`mrk-row-albums${legCount > 0 ? ' mrk-row-albums--active' : ''}${legCount === 5 ? ' mrk-row-albums--immortal' : ''}`}>
      {legCount === 5 ? <Crown size={10} /> : <BookOpen size={10} />}
      <span>{legCount}/5</span>
    </span>
      <div className="mrk-row-right">
        <span className="mrk-row-pts">{fmt(user.rankPoints)}<span className="mrk-row-pts-lbl">pts</span></span>
        <span className="mrk-row-acc">{accuracy}%</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SALÓN DE LA FAMA MOBILE — layout fijo
   (hero líder + grid leyendas + hitos + tabla)
════════════════════════════════════════ */
function MobSalonDeLaFama({ champions, onSelect, hofType }) {
  const cfg = HOF_TYPE_CONFIG[hofType] || HOF_TYPE_CONFIG.monthly;
  const TypeIcon = cfg.Icon;

  const leader = champions[0];
  const runnersUp = champions.slice(1, 5); // #2 a #5
  const rest = champions.slice(5);

  if (!leader) return null;

  /* ── Cálculo de hitos a partir de los datos disponibles ── */
  const bestStreak = champions.reduce(
    (best, c) => (c.bestStreak || 0) > (best.bestStreak || 0) ? c : best, champions[0]
  );
  const topScorer = champions.reduce(
    (best, c) => (c.points || 0) > (best.points || 0) ? c : best, champions[0]
  );
  const firstChamp = champions.reduce((first, c) => {
    if (!c.period) return first;
    if (!first.period) return c;
    return c.period < first.period ? c : first;
  }, champions[0]);
  const mostAccurate = champions.reduce(
    (best, c) => (c.accuracy || 0) > (best.accuracy || 0) ? c : best, champions[0]
  );

  return (
    <div className="mrk-salon">

      {/* ── Líder supremo, siempre fijo arriba ── */}
      <button className="mrk-salon-leader" onClick={() => onSelect(leader.id)}>
        <span className="mrk-salon-leader-tag">Leyenda suprema</span>
        <span className="mrk-salon-leader-pos">#1</span>
        <div className="mrk-salon-leader-av">
          <div className="mrk-salon-leader-av-ring">
            <MobAvatar user={leader} size="hof" />
          </div>
        </div>
        <div className="mrk-salon-leader-body">
          <span className="mrk-salon-leader-name">{leader.name}</span>
          <span className="mrk-salon-leader-title">El dominador</span>
          <div className="mrk-salon-leader-crowns">
            {Array.from({ length: Math.min(leader.championships || 0, 6) }).map((_, i) => (
              <TypeIcon key={i} size={13} color="#4A3200" />
            ))}
          </div>
          <div className="mrk-salon-leader-stats">
            <div className="mrk-salon-leader-stat">
              <span className="mrk-salon-leader-stat-val">{leader.championships || 0}</span>
              <span className="mrk-salon-leader-stat-lbl">{cfg.unitLabel}</span>
            </div>
            <div className="mrk-salon-leader-stat">
              <span className="mrk-salon-leader-stat-val">{fmt(leader.points)}</span>
              <span className="mrk-salon-leader-stat-lbl">Max pts</span>
            </div>
            <div className="mrk-salon-leader-stat">
              <span className="mrk-salon-leader-stat-val">{leader.period || "—"}</span>
              <span className="mrk-salon-leader-stat-lbl">{cfg.periodLabel}</span>
            </div>
          </div>
        </div>
      </button>

      {/* ── Grid 2x2: leyendas del salón (#2 a #5) ── */}
      {runnersUp.length > 0 && (
        <div>
          <div className="mrk-salon-section-lbl">Leyendas del salón</div>
          <div className="mrk-salon-grid" style={{ marginTop: 10 }}>
            {runnersUp.map((u, i) => {
              const rank = i + 2;
              const mod = rank === 2 ? "--2" : rank === 3 ? "--3" : "";
              return (
                <button
                  key={u.id}
                  className={`mrk-salon-card mrk-salon-card${mod}`}
                  onClick={() => onSelect(u.id)}
                >
                  <span className="mrk-salon-card-pos">{rank}</span>
                  <MobAvatar user={u} size="sm" />
                  <span className="mrk-salon-card-name">{u.name}</span>
                  <span className="mrk-salon-card-crown">
                    <TypeIcon size={10} /> {u.championships || 0} {cfg.unitLabel}
                  </span>
                  <div className="mrk-salon-card-stats">
                    <div className="mrk-salon-card-stat">
                      <span className="mrk-salon-card-stat-val">{fmt(u.points)}</span>
                      <span className="mrk-salon-card-stat-lbl">Max pts</span>
                    </div>
                    <div className="mrk-salon-card-stat">
                      <span className="mrk-salon-card-stat-val">{u.period || "—"}</span>
                      <span className="mrk-salon-card-stat-lbl">{cfg.periodLabel}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Hitos del Salón ── */}
      <div>
        <div className="mrk-salon-section-lbl">Hitos del salón</div>
        <div className="mrk-salon-hitos" style={{ marginTop: 10 }}>
          <div className="mrk-salon-hito mrk-salon-hito--gold">
            <div className="mrk-salon-hito-icon"><Crown size={13} /></div>
            <div className="mrk-salon-hito-body">
              <span className="mrk-salon-hito-lbl">Primer campeón</span>
              <span className="mrk-salon-hito-name">{firstChamp.name}</span>
              <span className="mrk-salon-hito-val">{firstChamp.period || "—"}</span>
            </div>
          </div>
          <div className="mrk-salon-hito mrk-salon-hito--fire">
            <div className="mrk-salon-hito-icon"><Flame size={13} /></div>
            <div className="mrk-salon-hito-body">
              <span className="mrk-salon-hito-lbl">Mejor racha</span>
              <span className="mrk-salon-hito-name">{bestStreak.name}</span>
              <span className="mrk-salon-hito-val">{bestStreak.bestStreak || 0} victorias</span>
            </div>
          </div>
          <div className="mrk-salon-hito mrk-salon-hito--target">
            <div className="mrk-salon-hito-icon"><Target size={13} /></div>
            <div className="mrk-salon-hito-body">
              <span className="mrk-salon-hito-lbl">Máxima puntuación</span>
              <span className="mrk-salon-hito-name">{topScorer.name}</span>
              <span className="mrk-salon-hito-val">{fmt(topScorer.points)} pts</span>
            </div>
          </div>
          <div className="mrk-salon-hito mrk-salon-hito--shield">
            <div className="mrk-salon-hito-icon"><Shield size={13} /></div>
            <div className="mrk-salon-hito-body">
              <span className="mrk-salon-hito-lbl">Invicto</span>
              <span className="mrk-salon-hito-name">{mostAccurate.name}</span>
              <span className="mrk-salon-hito-val">{mostAccurate.accuracy || 0}% aciertos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla final: resto de campeones ── */}
      {rest.length > 0 && (
        <div>
          <div className="mrk-salon-section-lbl">Todos los campeones</div>
          <div className="mrk-salon-table" style={{ marginTop: 10 }}>
            <div className="mrk-salon-table-head">
              <span />
              <span className="mrk-salon-th-user">Jugador</span>
              <span className="mrk-salon-th-num">Coronas</span>
              <span className="mrk-salon-th-num">Max pts</span>
            </div>
            {rest.map((u, i) => (
              <button key={u.id} className="mrk-salon-trow" onClick={() => onSelect(u.id)}>
                <span className="mrk-salon-trow-pos">{i + 6}</span>
                <MobAvatar user={u} size="sm" />
                <span className="mrk-salon-trow-name">{u.name}</span>
                <span className="mrk-salon-trow-num">{u.championships || 0}</span>
                <span className="mrk-salon-trow-num">{fmt(u.points)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function MobileRanking({
  users = [],
  currentUser = null,
  rankingType = "global",
  onChangeType,
  champions = [],
  globalChampions = [],
  albumProgress = {},
}) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [hofType, setHofType] = useState("monthly"); // 'monthly' | 'global'

  const rankingUsers = users.map((u) => ({
    ...u,
    rankPoints: rankingType === "monthly" ? u.monthly_points || 0 : u.season_points || 0,
    rankCorrect: rankingType === "monthly" ? u.monthly_correct || 0 : u.season_correct || 0,
    rankPredictions: rankingType === "monthly" ? u.monthly_predictions || 0 : u.season_predictions || 0,
  }));

  const sorted = [...rankingUsers]
    .filter((u) => u.rankPoints > 0)
    .sort((a, b) => b.rankPoints - a.rankPoints);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const totalRegistered = users.length;
  const totalParticipated = rankingUsers.filter((u) => u.rankPredictions > 0).length;
  const leader = sorted[0] || null;

  const activeChampions = hofType === "monthly" ? champions : globalChampions;
  const hofCfg = HOF_TYPE_CONFIG[hofType] || HOF_TYPE_CONFIG.monthly;
  const HofTypeIcon = hofCfg.Icon;
  const hofLeader = activeChampions[0] || null;

  const getCurrentMonthLabel = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <div className="mrk-root">

      {/* ── TABS ── */}
      <div className="mrk-tabs">
        {[
          { key: "global", icon: <Globe size={13} />, label: "Global" },
          { key: "monthly", icon: <Calendar size={13} />, label: "Mensual" },
          { key: "halloffame", icon: <Crown size={13} />, label: "S. Fama" },
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

      {/* ── ORÉJITAS HOF: Mensual (coronas) / Global (trofeos) ── */}
      {rankingType === "halloffame" && (
        <div className="mrk-hof-ears">
          <button
            className={`mrk-hof-ear${hofType === "monthly" ? " active" : ""}`}
            onClick={() => setHofType("monthly")}
          >
            <Crown size={11} /><span>Mensual</span>
          </button>
          <button
            className={`mrk-hof-ear${hofType === "global" ? " active" : ""}`}
            onClick={() => setHofType("global")}
          >
            <Trophy size={11} /><span>Global</span>
          </button>
        </div>
      )}

      {/* ── STATS ROW HOF (solo para Salón de la Fama) ── */}
      {rankingType === "halloffame" && (
        <div className="mrk-stats-row mrk-stats-row--hof">
          <div className="mrk-stat-block">
            <span className="mrk-stat-num">{activeChampions.length}</span>
            <span className="mrk-stat-lbl">Campeones</span>
          </div>
          <div className="mrk-stat-divider" />
          <div className="mrk-stat-block">
            <span className="mrk-stat-num">
              {activeChampions.reduce((acc, c) => acc + (c.championships || 0), 0)}
            </span>
            <span className="mrk-stat-lbl">{hofCfg.unitLabel.charAt(0).toUpperCase() + hofCfg.unitLabel.slice(1)}</span>
          </div>
          {hofLeader && (
            <>
              <div className="mrk-stat-divider" />
              <div className="mrk-stat-block mrk-stat-block--leader">
                <span className="mrk-stat-leader-name">{hofLeader.name}</span>
                <span className="mrk-stat-leader-pts" style={{ color: hofCfg.color, display: "flex", alignItems: "center", gap: 4 }}>
                  {hofLeader.championships || 0} <HofTypeIcon size={11} />
                </span>
                <span className="mrk-stat-lbl">Dominador</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════ SALÓN DE LA FAMA ════ */}
      {rankingType === "halloffame" && (
        activeChampions.length === 0 ? (
          <div className="mrk-hof-empty">
            <HofTypeIcon size={44} className="mrk-hof-empty-icon" />
            <p>Aún no hay campeones registrados</p>
          </div>
        ) : (
          <MobSalonDeLaFama champions={activeChampions} onSelect={setSelectedUserId} hofType={hofType} />
        )
      )}

      {/* ════ BENTO: STATS + PODIO ════ */}
      {rankingType !== "halloffame" && top3.length > 0 && (
        <div className="mrk-bento-wrap">
          <div className="mrk-bento-stats">
            <div className="mrk-bento-stat-tile">
              <span className="mrk-bento-stat-num">{totalRegistered}</span>
              <span className="mrk-bento-stat-lbl">Registrados</span>
            </div>
            <div className="mrk-bento-stat-tile">
              <span className="mrk-bento-stat-num">{totalParticipated}</span>
              <span className="mrk-bento-stat-lbl">Participantes</span>
            </div>
          </div>
          <div className="mrk-bento-grid">
            <PodiumHero user={top3[0]} onSelect={setSelectedUserId} />
            <div className="mrk-bento-side">
              <PodiumMini user={top3[1]} rank={1} onSelect={setSelectedUserId} />
              <PodiumMini user={top3[2]} rank={2} onSelect={setSelectedUserId} />
            </div>
          </div>
        </div>
      )}

      {/* ════ TABLA ════ */}
      {rankingType !== "halloffame" && (
        <div className="mrk-table">
          <div className="mrk-table-header">
            <span className="mrk-table-title">Clasificación</span>
            <span className="mrk-table-sub">
              {rankingType === "monthly" ? getCurrentMonthLabel() : "Global"}
            </span>
          </div>
         {top3.map((user, i) => (
          <TableRow key={user.id} user={user} pos={i + 1}
            isMe={user.id === currentUser?.id}
            onSelect={setSelectedUserId}
            legCount={albumProgress[user.id] || 0} />
        ))}
        {rest.length > 0 && <div className="mrk-table-sep" />}
        {rest.map((user, i) => (
          <TableRow key={user.id} user={user} pos={i + 4}
            isMe={user.id === currentUser?.id}
            onSelect={setSelectedUserId}
            legCount={albumProgress[user.id] || 0} />
        ))}
        </div>
      )}

      {selectedUserId && (
        <MobileUserProfile
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}