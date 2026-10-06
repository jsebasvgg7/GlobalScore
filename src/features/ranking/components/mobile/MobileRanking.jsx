import React, { useState, useRef, useEffect } from "react";
import { Globe, Calendar, Crown, Trophy, ChevronLeft, ChevronRight, Zap, Star, Flame, Target } from "lucide-react";
import { MobileUserProfile } from "@/features/profile";
import "./MobileRanking.css";

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

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/* "2026-01" → "26-01" (formato corto del mockup); otros formatos pasan tal cual */
const shortPeriod = (p) => {
  if (!p) return "—";
  const m = /^(\d{4})-(\d{2})$/.exec(p);
  return m ? `${m[1].slice(2)}-${m[2]}` : p;
};

/* Valor + unidad del hito "Primer campeón":
   mensual "2026-01" → 2026 / enero · global "25/26" → 25/26 / temp. */
const hitoPeriod = (p, hofType) => {
  if (!p) return { big: "—", unit: "" };
  const m = /^(\d{4})-(\d{2})$/.exec(p);
  if (m) return { big: m[1], unit: MONTHS_ES[Number(m[2]) - 1] || "" };
  return { big: p, unit: hofType === "global" ? "temp." : "" };
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

/* ── Podio 2 · 1 · 3: cada bloque es un polígono SVG con trazo fijo
     (non-scaling-stroke), así el borde se ve nítido sin importar la altura.
     Los puestos exteriores tienen el bisel hacia afuera y el 1 en ambos lados ── */
const POD_SHAPE = {
  1: { poly: "0,15 18,0 82,0 100,15 100,100 0,100", capY: 15 },
  2: { poly: "0,20 24,0 100,0 100,100 0,100", capY: 20 },
  3: { poly: "0,0 76,0 100,20 100,100 0,100", capY: 20 },
};

const pad2 = (n) => String(n).padStart(2, "0");

function PodiumStep({ user, rank, isMe, onSelect }) {
  const { poly, capY } = POD_SHAPE[rank];

  return (
    <div className={`mrk-pod mrk-pod--${rank}`}>
      {user && (
        <button
          className={`mrk-pod-who${isMe ? " mrk-pod-who--me" : ""}`}
          onClick={() => onSelect(user.id)}
          aria-current={isMe ? "true" : undefined}
        >
          <span className="mrk-pod-av">
            <MobAvatar user={user} size={rank === 1 ? "pod1" : "pod"} />
            <span className="mrk-pod-tag">{pad2(rank)}</span>
          </span>
          <span className="mrk-pod-name">{user.name}</span>
          <span className="mrk-pod-pts">{fmt(user.rankPoints)} pts</span>
        </button>
      )}
      <div className="mrk-pod-block" aria-hidden="true">
        <svg className="mrk-pod-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points={poly} />
          <line x1="0" y1={capY} x2="100" y2={capY} />
        </svg>
        <span className="mrk-pod-num">{rank}</span>
      </div>
    </div>
  );
}

/* ── Fila de la clasificación (puesto 4 en adelante) ── */
function RankItem({ user, pos, isMe, index, onSelect }) {
  const accuracy = user.rankPredictions > 0
    ? Math.round((user.rankCorrect / user.rankPredictions) * 100) : 0;

  return (
    <li className="mrk-item-li" style={{ "--i": Math.min(index, 10) }}>
      <button
        className={`mrk-item${isMe ? " mrk-item--me" : ""}`}
        onClick={() => onSelect(user.id)}
        aria-current={isMe ? "true" : undefined}
      >
        <span className="mrk-item-av">
          <MobAvatar user={user} size="list" />
          <span className="mrk-item-pos">{pad2(pos)}</span>
        </span>
        <span className="mrk-item-info">
          <span className="mrk-item-name">
            <span className="mrk-item-name-text">{user.name}</span>
            {isMe && <span className="mrk-item-you">Tú</span>}
          </span>
          <span className="mrk-item-sub">
            {user.rankCorrect}
            <Target size={13} strokeWidth={1.75} role="img" aria-label="aciertos" />
            <span aria-hidden="true">·</span>
            {accuracy}%
          </span>
        </span>
        <span className="mrk-item-score">
          <span className="mrk-item-pts">{fmt(user.rankPoints)}</span>
          <span className="mrk-item-pts-lbl">pts</span>
        </span>
      </button>
    </li>
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
     equipped_banner_url ← join con public.users (banner del medallón #1; opcional)
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
  const rest = champions.slice(5); //          #6 en adelante

  if (!leader) return null;

  const withStreak = champions.filter((c) => (c.best_streak || 0) > 0);
  const bestStreak = withStreak.length
    ? withStreak.reduce((best, c) => (c.best_streak > best.best_streak ? c : best))
    : null;

  const topScorer = champions.reduce(
    (best, c) => (c.points || 0) > (best.points || 0) ? c : best, champions[0]
  );

  const withPeriod = champions.filter((c) => !!c.period);
  const firstChamp = withPeriod.length
    ? withPeriod.reduce((first, c) => (c.period < first.period ? c : first))
    : null;

  /* Hitos: filas alternadas relleno / contorno, siempre al final del Salón */
  const hitos = [
    firstChamp && {
      key: "first", holder: firstChamp, Icon: Crown, label: "1er Campeón",
      ...hitoPeriod(firstChamp.period, hofType),
    },
    bestStreak && {
      key: "streak", holder: bestStreak, Icon: Flame, label: "Mejor Racha",
      big: String(bestStreak.best_streak), unit: "pred.",
    },
    topScorer && {
      key: "points", holder: topScorer, Icon: Target, label: "Máx puntos",
      big: fmt(topScorer.points), unit: "pts",
    },
  ].filter(Boolean);

  const bannerStyle = leader.equipped_banner_url
    ? { "--banner": `url("${leader.equipped_banner_url}")` }
    : undefined;

  return (
    <div className="mrk-salon">

      {/* ── Leyenda suprema: banner + avatar + stats ── */}
      <section aria-labelledby="sal-hero-title">
        <h3 id="sal-hero-title" className="sal-title">Leyenda Suprema</h3>
        <button className="sal-medal" onClick={() => onSelect(leader.id)}>
          <span className="sal-medal-banner" style={bannerStyle}>
            <span className="sal-medal-av">
              <MobAvatar user={leader} size="sal" />
              <span className="sal-chip">#1</span>
            </span>
          </span>
          <span className="sal-medal-body">
            <span className="sal-medal-id">
              <span className="sal-medal-name">{leader.name}</span>
              <span className="sal-medal-role">el dominador</span>
            </span>
            <span className="sal-medal-stats">
              <span className="sal-medal-stat">
                <b>{leader.championships || 0}</b>
                <i>{cfg.unitLabel}</i>
              </span>
              <span className="sal-medal-stat">
                <b>{fmt(leader.points)}</b>
                <i>pts max</i>
              </span>
              <span className="sal-medal-stat">
                <b>{shortPeriod(leader.period)}</b>
                <i>{cfg.periodLabel}</i>
              </span>
            </span>
          </span>
        </button>
      </section>

      {/* ── Leyendas del salón (#2 a #5): filas horizontales ── */}
      {runnersUp.length > 0 && (
        <section aria-labelledby="sal-legends-title">
          <h3 id="sal-legends-title" className="sal-title">Leyendas Del Salón</h3>
          <ul className="sal-rows">
            {runnersUp.map((u, i) => (
              <li key={u.id} style={{ "--i": i }}>
                <button className="sal-row" onClick={() => onSelect(u.id)}>
                  <MobAvatar user={u} size="row" />
                  <span className="sal-row-id">
                    <span className="sal-row-name">{u.name}</span>
                    <span className="sal-row-meta">
                      <span className="sal-chip sal-chip--sm">#{i + 2}</span>
                      <TypeIcon size={13} strokeWidth={1.75} aria-hidden="true" />
                      {u.championships || 0}
                    </span>
                  </span>
                  <span className="sal-row-stat">
                    <b>{u.championships || 0}</b><i>{cfg.unitLabel}</i>
                  </span>
                  <span className="sal-row-stat">
                    <b>{fmt(u.points)}</b><i>pts max</i>
                  </span>
                  <span className="sal-row-stat">
                    <b>{shortPeriod(u.period)}</b><i>{cfg.periodLabel}</i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Resto de campeones: versión compacta de la misma fila ── */}
      {rest.length > 0 && (
        <section aria-labelledby="sal-rest-title">
          <h3 id="sal-rest-title" className="sal-title">
            Todos Los Campeones
            <span className="sal-title-count">{rest.length}</span>
          </h3>
          <ul className="sal-rows">
            {rest.map((u, i) => (
              <li key={u.id} style={{ "--i": i }}>
                <button className="sal-row sal-row--compact" onClick={() => onSelect(u.id)}>
                  <MobAvatar user={u} size="rowc" />
                  <span className="sal-row-id">
                    <span className="sal-row-name">{u.name}</span>
                    <span className="sal-row-meta">
                      <span className="sal-chip sal-chip--sm">#{i + 6}</span>
                    </span>
                  </span>
                  <span className="sal-row-stat">
                    <b>{u.championships || 0}</b><i>{cfg.unitLabel}</i>
                  </span>
                  <span className="sal-row-stat">
                    <b>{fmt(u.points)}</b><i>pts max</i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Hitos del salón: al final, filas alternadas con avatar del titular ── */}
      {hitos.length > 0 && (
        <section aria-labelledby="sal-hitos-title">
          <h3 id="sal-hitos-title" className="sal-title">Hitos Del Salón</h3>
          <ul className="sal-hitos">
            {hitos.map(({ key, holder, Icon, label, big, unit }, i) => (
              <li key={key} style={{ "--i": i }}>
                <button
                  className={`sal-hito ${i % 2 === 0 ? "sal-hito--fill" : "sal-hito--line"}`}
                  onClick={() => onSelect(holder.id)}
                >
                  <span className="sal-hito-av">
                    <MobAvatar user={holder} size="hito" />
                    <span className="sal-hito-badge"><Icon size={15} strokeWidth={1.75} aria-hidden="true" /></span>
                  </span>
                  <span className="sal-hito-id">
                    <span className="sal-hito-name">{holder.name}</span>
                    <span className="sal-hito-lbl">{label}</span>
                  </span>
                  <span className="sal-hito-val">
                    <b>{big}</b>
                    {unit && <i>{unit}</i>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
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
      <div className="mrk-tabs" role="tablist" aria-label="Tipo de ranking">
        {[
          { key: "global", icon: <Globe size={13} />, label: "Global" },
          { key: "monthly", icon: <Calendar size={13} />, label: "Mensual" },
          { key: "halloffame", icon: <Crown size={13} />, label: "S. Fama" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={rankingType === key}
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
              <Crown size={16} strokeWidth={1.75} /><span>Mensual</span>
            </button>
            <button
              className={hofType === "global" ? "active" : ""}
              onClick={() => setHofType("global")}
            >
              <Trophy size={16} strokeWidth={1.75} /><span>Global</span>
            </button>
          </div>

          {/* ── Stats generales (sin duplicar al líder, ya está en el medallón) ── */}
          <div className="mrk-stats-row mrk-stats-row--hof">
            <div className="mrk-stat-block">
              <span className="mrk-stat-num">{activeChampions.length}</span>
              <span className="mrk-stat-lbl">campeones</span>
            </div>
            <div className="mrk-stat-block">
              <span className="mrk-stat-num">
                {activeChampions.reduce((acc, c) => acc + (c.championships || 0), 0)}
              </span>
              <span className="mrk-stat-lbl">{hofCfg.unitLabel}</span>
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

      {/* ════ PODIO + CLASIFICACIÓN ════ */}
      {rankingType !== "halloffame" && (
        <>
          {top3.length > 0 ? (
            <div className="mrk-podium" role="group" aria-label="Podio: los tres primeros">
              <PodiumStep user={top3[1]} rank={2} isMe={!!top3[1] && top3[1].id === currentUser?.id} onSelect={setSelectedUserId} />
              <PodiumStep user={top3[0]} rank={1} isMe={top3[0].id === currentUser?.id} onSelect={setSelectedUserId} />
              <PodiumStep user={top3[2]} rank={3} isMe={!!top3[2] && top3[2].id === currentUser?.id} onSelect={setSelectedUserId} />
            </div>
          ) : (
            <div className="mrk-podium-empty">
              <Target size={36} className="mrk-podium-empty-icon" />
              <p>Aún no han puntuado</p>
            </div>
          )}

          <section className="mrk-sheet" aria-labelledby="mrk-sheet-title">
            <header className="mrk-sheet-head">
              <div>
                <h2 id="mrk-sheet-title" className="mrk-sheet-title">Clasificación</h2>
                <p className="mrk-sheet-meta">{totalParticipated} de {totalRegistered} participan</p>
              </div>
              <span className="mrk-sheet-period">
                {rankingType === "monthly" ? getCurrentMonthLabel() : "Global"}
              </span>
            </header>

            {rest.length > 0 ? (
              <ol className="mrk-list">
                {rest.map((user, i) => (
                  <RankItem
                    key={user.id}
                    user={user}
                    pos={i + 4}
                    index={i}
                    isMe={user.id === currentUser?.id}
                    onSelect={setSelectedUserId}
                  />
                ))}
              </ol>
            ) : (
              <p className="mrk-list-empty">
                {top3.length > 0
                  ? "Los demás jugadores aparecerán aquí cuando puntúen."
                  : "La clasificación arranca con la primera puntuación."}
              </p>
            )}
          </section>
        </>
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