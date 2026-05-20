import React, { useState, useRef, useEffect } from "react";
import { Globe, Calendar, Crown, ChevronLeft, ChevronRight, Zap, Star, BookOpen } from "lucide-react";
import { MobileUserProfile } from "@/features/profile";
import "../../styles/MobileRanking.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

const HOF_META = [
  { label: "ORO", color: "#c9a227" },
  { label: "PLATA", color: "#8a8a8a" },
  { label: "BRONCE", color: "#a0652a" },
];

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

function PodiumCard({ user, rank, onSelect }) {
  if (!user) return null;
  const mods = ["gold", "silver", "bronze"];
  const labels = ["ORO", "PLATA", "BRONCE"];

  return (
    <div className={`mrk-podium-card mrk-podium-card--${mods[rank]}`}>
      <span className="mrk-podium-medal">{labels[rank]}</span>
      <button className="mrk-podium-av-btn" onClick={() => onSelect(user.id)}>
        <div className="mrk-podium-av-ring">
          <MobAvatar user={user} size="podium" />
        </div>
        <span className="mrk-podium-num">{rank + 1}</span>
      </button>
      <span className="mrk-podium-name">{user.name}</span>
      <span className="mrk-podium-pts">{fmt(user.rankPoints)} pts</span>
    </div>
  );
}

function TableRow({ user, pos, isMe, onSelect, legCount }) {
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
      <div className="mrk-row-right">
        <span className="mrk-row-pts">{fmt(user.rankPoints)}<span className="mrk-row-pts-lbl">pts</span></span>
        <span className="mrk-row-acc">{accuracy}%</span>
      </div>
      {legCount !== undefined && (
        <span className={`mrk-row-albums${legCount > 0 ? ' mrk-row-albums--active' : ''}`}>
          <BookOpen size={10} />
          <span>{legCount}/4</span>
        </span>
      )}
    </div>
  );
}

function MobHofCarousel({ champions, onSelect }) {
  const [active, setActive] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const total = champions.length;

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setTimeout(() => nav("right"), 6000);
    return () => clearTimeout(timerRef.current);
  }, [active, total]);

  function nav(dir, target) {
    if (total <= 1 || exiting) return;
    clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => {
      const next = target !== undefined
        ? target
        : dir === "right" ? (active + 1) % total : (active - 1 + total) % total;
      setActive(next);
      setExiting(false);
    }, 220);
  }

  const champ = champions[active];
  const meta = HOF_META[Math.min(active, 2)];

  return (
    <div className="mrk-hof-carousel">
      <div className="mrk-hof-card-row">
        <div className={`mrk-hof-card${exiting ? " mrk-hof-card--exit" : ""}`}
          style={{ borderTopColor: meta.color }}>

          <div className="mrk-hof-card-top">
            <span className="mrk-hof-medal" style={{ color: meta.color }}>{meta.label}</span>
            <span className="mrk-hof-pos" style={{ background: meta.color }}>#{active + 1}</span>
          </div>

          <button className="mrk-hof-av-btn" onClick={() => onSelect(champ.id)}>
            <div className="mrk-hof-av-ring" style={{
              background: `linear-gradient(135deg, ${meta.color}88, ${meta.color})`
            }}>
              <MobAvatar user={champ} size="hof" />
            </div>
          </button>

          <span className="mrk-hof-name">{champ.name}</span>

          <div className="mrk-hof-crowns">
            {Array.from({ length: Math.min(champ.monthly_championships, 6) }).map((_, i) => (
              <Crown key={i} size={14} style={{ color: meta.color }} />
            ))}
            {champ.monthly_championships > 6 && (
              <span className="mrk-hof-crowns-extra" style={{ color: meta.color }}>
                +{champ.monthly_championships - 6}
              </span>
            )}
          </div>

          <div className="mrk-hof-stats">
            <div className="mrk-hof-stat">
              <span className="mrk-hof-stat-val" style={{ color: meta.color }}>
                {champ.monthly_championships}
              </span>
              <span className="mrk-hof-stat-lbl">Coronas</span>
            </div>
            <div className="mrk-hof-stat-sep" />
            <div className="mrk-hof-stat">
              <span className="mrk-hof-stat-val">{fmt(champ.championship_points)}</span>
              <span className="mrk-hof-stat-lbl">Max pts</span>
            </div>
            <div className="mrk-hof-stat-sep" />
            <div className="mrk-hof-stat">
              <span className="mrk-hof-stat-val mrk-hof-stat-val--sm">
                {champ.championship_month_year || "—"}
              </span>
              <span className="mrk-hof-stat-lbl">Título</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mrk-hof-dots">
        {champions.map((_, i) => (
          <button
            key={i}
            className={`mrk-hof-dot${i === active ? " mrk-hof-dot--active" : ""}`}
            onClick={() => nav(i > active ? "right" : "left", i)}
            style={i === active ? { background: meta.color, width: 18 } : {}}
          />
        ))}
      </div>

      {champions.slice(0, 3).length > 0 && (
        <div className="mrk-hof-list">
          <div className="mrk-hof-list-label">Top campeones</div>
          {champions.slice(0, 3).map((u, i) => {
            const m = HOF_META[i];
            return (
              <div
                key={u.id}
                className={`mrk-hof-list-row${i === active ? " mrk-hof-list-row--active" : ""}`}
                style={{ borderLeftColor: i === active ? m.color : "transparent" }}
                onClick={() => nav(i > active ? "right" : "left", i)}
              >
                <span className="mrk-hof-list-badge" style={{ background: m.color }}>
                  {i + 1}
                </span>
                <MobAvatar user={u} size="sm" />
                <div className="mrk-hof-list-info">
                  <span className="mrk-hof-list-name">{u.name}</span>
                  <span className="mrk-hof-list-crowns" style={{ color: m.color }}>
                    <Crown size={9} /> {u.monthly_championships} coronas
                  </span>
                </div>
                <span className="mrk-hof-list-pts" style={{ color: m.color }}>
                  {fmt(u.championship_points)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MobileRanking({
  users = [],
  currentUser = null,
  rankingType = "global",
  onChangeType,
  champions = [],
  albumProgress = {},
}) {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const rankingUsers = users.map((u) => ({
    ...u,
    rankPoints: rankingType === "monthly" ? u.monthly_points || 0 : u.points || 0,
    rankCorrect: rankingType === "monthly" ? u.monthly_correct || 0 : u.correct || 0,
    rankPredictions: rankingType === "monthly" ? u.monthly_predictions || 0 : u.predictions || 0,
  }));

  const sorted = [...rankingUsers].sort((a, b) => b.rankPoints - a.rankPoints);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const totalRegistered = users.length;
  const totalParticipated = rankingUsers.filter((u) => u.rankPredictions > 0).length;
  const leader = sorted[0] || null;
  const hofLeader = champions[0] || null;

  const getCurrentMonthLabel = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  return (
    <div className="mrk-root">

      {/* TABS */}
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

      {/* STATS ROW */}
      <div className="mrk-stats-row">
        {rankingType === "halloffame" ? (
          <>
            <div className="mrk-stat-block">
              <span className="mrk-stat-num">{champions.length}</span>
              <span className="mrk-stat-lbl">Campeones</span>
            </div>
            <div className="mrk-stat-divider" />
            <div className="mrk-stat-block">
              <span className="mrk-stat-num">
                {champions.reduce((acc, c) => acc + (c.monthly_championships || 0), 0)}
              </span>
              <span className="mrk-stat-lbl">Coronas</span>
            </div>
            {hofLeader && (
              <>
                <div className="mrk-stat-divider" />
                <div className="mrk-stat-block mrk-stat-block--leader">
                  <span className="mrk-stat-leader-name">{hofLeader.name}</span>
                  <span className="mrk-stat-leader-pts" style={{ color: "#c9a227" }}>
                    {hofLeader.monthly_championships} 👑
                  </span>
                  <span className="mrk-stat-lbl">Dominador</span>
                </div>
              </>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* SALÓN DE LA FAMA */}
      {rankingType === "halloffame" && (
        champions.length === 0 ? (
          <div className="mrk-hof-empty">
            <Crown size={44} className="mrk-hof-empty-icon" />
            <p>Aún no hay campeones registrados</p>
          </div>
        ) : (
          <MobHofCarousel champions={champions} onSelect={setSelectedUserId} />
        )
      )}

      {/* PODIO */}
      {rankingType !== "halloffame" && top3.length > 0 && (
        <div className="mrk-podium-wrap">
          <div className="mrk-podium-header">
            <div className="mrk-podium-header-line mrk-podium-header-line--left" />
            <Crown size={13} className="mrk-podium-crown" />
            <span className="mrk-podium-title">Podio</span>
            <div className="mrk-podium-header-line mrk-podium-header-line--right" />
          </div>
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

      {/* TABLA */}
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
              legCount={albumProgress[user.id] || 0}
            />
          ))}
          {rest.length > 0 && <div className="mrk-table-sep" />}
          {rest.map((user, i) => (
            <TableRow key={user.id} user={user} pos={i + 4}
              isMe={user.id === currentUser?.id}
              onSelect={setSelectedUserId}
              legCount={albumProgress[user.id] || 0}
            />
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