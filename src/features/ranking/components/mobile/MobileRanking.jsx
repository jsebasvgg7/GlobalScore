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
   SALÓN DE LA FAMA MOBILE
   Medallón para el líder (identidad propia) +
   grid de leyendas + hitos + tabla

   ── Mapeo esperado de `champions` ──
   Cada objeto (1 fila por usuario campeón, ya agrupado y ordenado
   por el backend a partir de public.monthly_championship_history)
   debe traer:
     id             ← user_id
     name           ← join con public.users
     avatar_url     ← join con public.users
     points         ← MAX(points) del histórico de títulos de ese usuario
     period         ← month_year del título que se muestre
     championships  ← COUNT(*) de filas en monthly_championship_history

   Para los 4 hitos (todos con datos reales, confirmado en
   profile.service.js / MobileUserProfile.jsx), sumar también
   estos campos directos de public.users vía join:
     best_streak    ← users.best_streak (racha más larga histórica)
     correct        ← users.correct     (aciertos totales)
     predictions    ← users.predictions (predicciones totales)
   accuracy se deriva acá mismo con la misma fórmula que ya usa
   el resto de la app: round(correct / predictions * 100).

   Cada hito se sigue ocultando solo si ningún campeón trae el
   dato correspondiente — no hace falta tocar este componente
   si algún campo llega vacío en un caso puntual. ── */
function MobSalonDeLaFama({ champions, onSelect, hofType }) {
  const cfg = HOF_TYPE_CONFIG[hofType] || HOF_TYPE_CONFIG.monthly;
  const TypeIcon = cfg.Icon;

  const leader = champions[0];
  const runnersUp = champions.slice(1, 5); // #2 a #5
  const rest = champions.slice(5);

  if (!leader) return null;

  /* accuracy real: misma fórmula que PanelStats / UserProfilePanel */
  const withAccuracyField = (c) => {
    const acc = c.accuracy
      ?? (c.predictions > 0 ? Math.round((c.correct / c.predictions) * 100) : null);
    return acc;
  };

  const withStreak = champions.filter((c) => (c.best_streak || 0) > 0);
  const bestStreak = withStreak.length
    ? withStreak.reduce((best, c) => (c.best_streak > best.best_streak ? c : best))
    : null;

  const accuracyCandidates = champions
    .map((c) => ({ user: c, acc: withAccuracyField(c) }))
    .filter((c) => c.acc !== null && c.acc > 0);
  const mostAccurate = accuracyCandidates.length
    ? accuracyCandidates.reduce((best, c) => (c.acc > best.acc ? c : best)).user
    : null;
  const mostAccurateValue = mostAccurate ? withAccuracyField(mostAccurate) : null;

  const topScorer = champions.reduce(
    (best, c) => (c.points || 0) > (best.points || 0) ? c : best, champions[0]
  );

  const withPeriod = champions.filter((c) => !!c.period);
  const firstChamp = withPeriod.length
    ? withPeriod.reduce((first, c) => (c.period < first.period ? c : first))
    : null;

  const leaderAccuracy = leader.accuracy
    ?? (leader.predictions > 0 ? Math.round((leader.correct / leader.predictions) * 100) : null);

  return (
    <div className="mrk-salon">

      {/* ── EL MEDALLÓN: pieza de identidad del Salón, no una card más ── */}
      <div className="mrk-medallion-wrap">
        <div className="mrk-medallion-ribbon" />
        <button className="mrk-medallion" onClick={() => onSelect(leader.id)}>
          <div className="mrk-medallion-crownfield">
            {Array.from({ length: 12 }).map((_, i) => (
              <TypeIcon key={i} size={26} />
            ))}
          </div>
          <span className="mrk-medallion-tag">Leyenda suprema · #1</span>
          <div className="mrk-medallion-av">
            <MobAvatar user={leader} size="hof" />
          </div>
          <span className="mrk-medallion-name">{leader.name}</span>
          <span className="mrk-medallion-title">El dominador</span>
          <div className="mrk-medallion-crowns">
            {Array.from({ length: Math.min(leader.championships || 0, 6) }).map((_, i) => (
              <TypeIcon key={i} size={14} color="#1A1A2E" />
            ))}
          </div>
          <div className="mrk-medallion-stats">
            <div className="mrk-medallion-stat">
              <span className="mrk-medallion-stat-val">{leader.championships || 0}</span>
              <span className="mrk-medallion-stat-lbl">{cfg.unitLabel}</span>
            </div>
            <div className="mrk-medallion-stat">
              <span className="mrk-medallion-stat-val">{fmt(leader.points)}</span>
              <span className="mrk-medallion-stat-lbl">Max pts</span>
            </div>
            <div className="mrk-medallion-stat">
              <span className="mrk-medallion-stat-val">{leader.period || "—"}</span>
              <span className="mrk-medallion-stat-lbl">{cfg.periodLabel}</span>
            </div>
          </div>
          {leaderAccuracy !== null && (
            <div className="mrk-medallion-bar-wrap">
              <div className="mrk-medallion-bar-lbl">
                <span>Aciertos</span>
                <span>{leaderAccuracy}%</span>
              </div>
              <div className="mrk-medallion-bar-track">
                <div className="mrk-medallion-bar-fill" style={{ width: `${leaderAccuracy}%` }} />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* ── Grid 2x2: leyendas del salón (#2 a #5) ── */}
      {runnersUp.length > 0 && (
        <div>
          <div className="mrk-salon-section-lbl">
            Leyendas del salón
            <span className="mrk-salon-section-count">{runnersUp.length}</span>
          </div>
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
                  <span className="mrk-salon-card-pts">{fmt(u.points)}</span>
                  <span className="mrk-salon-card-pts-lbl">Max pts</span>
                  <span className="mrk-salon-card-period">{cfg.periodLabel}: {u.period || "—"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Hitos del Salón: solo se muestran los que tienen datos reales ── */}
      {(firstChamp || bestStreak || topScorer || mostAccurate) && (
        <div>
          <div className="mrk-salon-section-lbl">Hitos del salón</div>
          <div className="mrk-salon-hitos" style={{ marginTop: 10 }}>
            {firstChamp && (
              <div className="mrk-salon-hito mrk-salon-hito--gold">
                <div className="mrk-salon-hito-top">
                  <div className="mrk-salon-hito-icon"><Crown size={13} /></div>
                  <span className="mrk-salon-hito-lbl">Primer campeón</span>
                </div>
                <span className="mrk-salon-hito-val">{firstChamp.period}</span>
                <span className="mrk-salon-hito-name">{firstChamp.name}</span>
              </div>
            )}
            {bestStreak && (
              <div className="mrk-salon-hito mrk-salon-hito--fire">
                <div className="mrk-salon-hito-top">
                  <div className="mrk-salon-hito-icon"><Flame size={13} /></div>
                  <span className="mrk-salon-hito-lbl">Mejor racha</span>
                </div>
                <span className="mrk-salon-hito-val">{bestStreak.best_streak}</span>
                <span className="mrk-salon-hito-name">{bestStreak.name}</span>
              </div>
            )}
            {topScorer && (
              <div className="mrk-salon-hito mrk-salon-hito--target">
                <div className="mrk-salon-hito-top">
                  <div className="mrk-salon-hito-icon"><Target size={13} /></div>
                  <span className="mrk-salon-hito-lbl">Máx. puntuación</span>
                </div>
                <span className="mrk-salon-hito-val">{fmt(topScorer.points)}</span>
                <span className="mrk-salon-hito-name">{topScorer.name}</span>
              </div>
            )}
            {mostAccurate && (
              <div className="mrk-salon-hito mrk-salon-hito--shield">
                <div className="mrk-salon-hito-top">
                  <div className="mrk-salon-hito-icon"><Shield size={13} /></div>
                  <span className="mrk-salon-hito-lbl">Más certero</span>
                </div>
                <span className="mrk-salon-hito-val">{mostAccurateValue}%</span>
                <span className="mrk-salon-hito-name">{mostAccurate.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tabla final: resto de campeones ── */}
      {rest.length > 0 && (
        <div>
          <div className="mrk-salon-section-lbl">
            Todos los campeones
            <span className="mrk-salon-section-count">{rest.length}</span>
          </div>
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

      {/* ── Zona HOF: envuelve tabs, stats y salón con una identidad propia ── */}
      {rankingType === "halloffame" && (
        <div className="mrk-hof-zone">

          {/* ── Segmented control: Mensual (coronas) / Global (trofeos) ── */}
          <div className="mrk-hof-switch">
            <button
              className={hofType === "monthly" ? "active" : ""}
              onClick={() => setHofType("monthly")}
            >
              <Crown size={11} /><span>Mensual</span>
            </button>
            <button
              className={hofType === "global" ? "active" : ""}
              onClick={() => setHofType("global")}
            >
              <Trophy size={11} /><span>Global</span>
            </button>
          </div>

          {/* ── Stats generales (sin duplicar al líder, ya está en el medallón) ── */}
          <div className="mrk-stats-row mrk-stats-row--hof">
            <div className="mrk-stat-block">
              <span className="mrk-stat-num">{activeChampions.length}</span>
              <span className="mrk-stat-lbl">Campeones</span>
            </div>
            <div className="mrk-stat-block">
              <span className="mrk-stat-num">
                {activeChampions.reduce((acc, c) => acc + (c.championships || 0), 0)}
              </span>
              <span className="mrk-stat-lbl">{hofCfg.unitLabel.charAt(0).toUpperCase() + hofCfg.unitLabel.slice(1)}</span>
            </div>
          </div>

          {/* ════ SALÓN DE LA FAMA ════ */}
          {activeChampions.length === 0 ? (
            <div className="mrk-hof-empty">
              <HofTypeIcon size={44} className="mrk-hof-empty-icon" />
              <p>Aún no hay campeones registrados</p>
            </div>
          ) : (
            <MobSalonDeLaFama champions={activeChampions} onSelect={setSelectedUserId} hofType={hofType} />
          )}
        </div>
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