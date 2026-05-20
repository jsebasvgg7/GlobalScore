import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, BookOpen, Package, Flame, Target, Star, ChevronRight } from "lucide-react";
import { MobileUserProfile } from "@/features/profile";
import { MobileSubPage } from "@/shared/layout";
import AlbumBookEntry from '@/features/albums/components/AlbumBookEntry';
import { useAlbumPacks } from '@/features/albums/hooks/useAlbumPacks';
import { useAlbumCollection } from '@/features/albums/hooks/useAlbumCollection';
import { useAlbumProgress } from '@/features/albums/hooks/useAlbumProgress';
import "../../styles/MobileDashboard.css";

const ClockSVG = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
  </svg>
);

const CalSVG = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" /><line x1="7" y1="2" x2="7" y2="6" />
    <line x1="17" y1="2" x2="17" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function NoMatchBanner() {
  return (
    <div className="mob2-nm mob2-nm--empty">
      <div className="mob2-nm-empty-brut">
        <div className="mob2-nm-empty-brut-left">
          <span className="mob2-nm-empty-brut-zero">0</span>
          <div className="mob2-nm-empty-brut-bars">
            <div className="mob2-nm-empty-brut-bar mob2-nm-empty-brut-bar--a" />
            <div className="mob2-nm-empty-brut-bar mob2-nm-empty-brut-bar--b" />
            <div className="mob2-nm-empty-brut-bar mob2-nm-empty-brut-bar--c" />
          </div>
        </div>
        <div className="mob2-nm-empty-brut-right">
          <span className="mob2-nm-empty-brut-eyebrow">// PRÓXIMO PARTIDO</span>
          <span className="mob2-nm-empty-brut-heading">SIN<br />PARTIDOS</span>
          <span className="mob2-nm-empty-brut-rule" />
          <span className="mob2-nm-empty-brut-caption">TEMPORADA AL DÍA</span>
        </div>
      </div>
      <div className="mob2-nm-empty-neu">
        <div className="mob2-nm-empty-neu-icon-wrap">
          <div className="mob2-nm-empty-neu-ring mob2-nm-empty-neu-ring--outer" />
          <div className="mob2-nm-empty-neu-ring mob2-nm-empty-neu-ring--inner" />
          <div className="mob2-nm-empty-neu-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>
          <div className="mob2-nm-empty-neu-dot" />
        </div>
        <div className="mob2-nm-empty-neu-text">
          <span className="mob2-nm-empty-neu-label">Próximo partido</span>
          <span className="mob2-nm-empty-neu-title">Todo al día</span>
          <span className="mob2-nm-empty-neu-sub">No hay partidos pendientes</span>
        </div>
        <div className="mob2-nm-empty-neu-check">✓</div>
      </div>
    </div>
  );
}

function EmptyMatchesScroll({ onOpen }) {
  return (
    <>
      <div className="mob2-empty-matches-brut">
        <div className="mob2-emb-accent" />
        <div className="mob2-emb-inner">
          <span className="mob2-emb-num">00</span>
          <div className="mob2-emb-divider" />
          <span className="mob2-emb-label">SIN<br />PARTIDOS<br />PEND.</span>
        </div>
        <div className="mob2-emb-corner mob2-emb-corner--tl" />
        <div className="mob2-emb-corner mob2-emb-corner--br" />
      </div>
      <div className="mob2-empty-matches-neu">
        <div className="mob2-emn-ball">⚽</div>
        <span className="mob2-emn-title">Estás al día</span>
        <span className="mob2-emn-sub">Sin pendientes</span>
      </div>
      <div className="mob2-more-card" onPointerDown={() => onOpen("matches")}>
        <span className="mob2-more-sym">»</span>
        <span>VER TODO</span>
      </div>
    </>
  );
}

function SkeletonCard({ wide }) {
  return (
    <div className={`mob2-sk-card${wide ? " mob2-sk-card--wide" : ""}`}>
      <div className="mob2-sk-accent" />
      <div className="mob2-sk-body">
        <div className="mob2-sk-row">
          <div className="mob2-sk mob2-sk--sm" />
          <div className="mob2-sk mob2-sk--pill" />
        </div>
        <div className="mob2-sk mob2-sk--team" />
        <div className="mob2-sk mob2-sk--divider" />
        <div className="mob2-sk mob2-sk--team" />
        <div className="mob2-sk-footer">
          <div className="mob2-sk mob2-sk--xs" />
          <div className="mob2-sk mob2-sk--xs" />
        </div>
      </div>
    </div>
  );
}

function MiniMatchCard({ match, userPred }) {
  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isExp = deadline && now >= deadline;
  const isLive = match.status === "live";
  const hasPred = userPred !== undefined;
  const pillMod = isLive ? "live" : isExp ? "closed" : hasPred ? "saved" : "pending";
  const pillTxt = isLive ? "VIVO" : isExp ? "CERR." : hasPred ? "GUARD." : "PEND.";
  const accentMod = isLive ? "amber" : hasPred ? "green" : isExp ? "red" : "purple";

  return (
    <div className="mob2-mc">
      <div className={`mob2-mc-accent mob2-mc-accent--${accentMod}`} />
      <div className="mob2-mc-inner">
        <div className="mob2-mc-head">
          <div className="mob2-mc-league">
            <div className="mob2-mc-lg-box">
              {match.league_logo_url
                ? <img src={match.league_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "🏆"}
            </div>
            <span className="mob2-mc-lg-name">
              {(match.league || "LIGA").substring(0, 6).toUpperCase()}
            </span>
          </div>
          <span className={`mob2-mc-pill mob2-mc-pill--${pillMod}`}>{pillTxt}</span>
        </div>
        <div className="mob2-mc-teams">
          <div className="mob2-mc-team">
            <div className="mob2-mc-flag">
              {match.home_team_logo_url
                ? <img src={match.home_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "⚽"}
            </div>
            <span className="mob2-mc-tname">{(match.home_team || "—").substring(0, 8).toUpperCase()}</span>
            <div className={`mob2-mc-num${hasPred ? " mob2-mc-num--has" : ""}`}>
              {hasPred ? (userPred.home_score ?? "—") : "—"}
            </div>
          </div>
          <div className="mob2-mc-sep" />
          <div className="mob2-mc-team">
            <div className="mob2-mc-flag">
              {match.away_team_logo_url
                ? <img src={match.away_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "⚽"}
            </div>
            <span className="mob2-mc-tname">{(match.away_team || "—").substring(0, 8).toUpperCase()}</span>
            <div className={`mob2-mc-num${hasPred ? " mob2-mc-num--has" : ""}`}>
              {hasPred ? (userPred.away_score ?? "—") : "—"}
            </div>
          </div>
        </div>
        <div className="mob2-mc-foot">
          <span className="mob2-mc-ft"><ClockSVG /> {isLive ? `${match.minute || "??"}′` : (match.time || "—")}</span>
          <span className="mob2-mc-ft"><CalSVG /> {match.date || "—"}</span>
        </div>
      </div>
    </div>
  );
}

function MiniLeagueCard({ league, userPrediction }) {
  const now = new Date();
  const deadline = league.deadline ? new Date(league.deadline) : null;
  const isExp = deadline && now >= deadline;
  const isFin = league.status === "finished";
  const hasPred = userPrediction !== undefined;

  return (
    <div className="mob2-lc">
      <div className={`mob2-mc-accent mob2-mc-accent--${hasPred ? "green" : isExp || isFin ? "red" : "purple"}`} />
      <div className="mob2-lc-inner">
        <div className="mob2-lc-head">
          <div className="mob2-mc-lg-box">
            {league.logo_url
              ? <img src={league.logo_url} alt="" onError={e => (e.target.style.display = "none")} />
              : "🏆"}
          </div>
          <div className="mob2-lc-info">
            <span className="mob2-lc-name">{(league.name || "LIGA").toUpperCase()}</span>
            <span className="mob2-lc-season">{league.season || "—"}</span>
          </div>
          <div className={`mob2-status-dot mob2-status-dot--${isFin ? "finished" : isExp ? "expired" : hasPred ? "saved" : "pending"}`} />
        </div>
        <div className="mob2-lc-field">
          <span className="mob2-lc-lbl">CAMPEÓN</span>
          <div className={`mob2-lc-input${userPrediction?.predicted_champion ? " mob2-lc-input--filled" : ""}`}>
            {userPrediction?.predicted_champion || "Escribe el equipo..."}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniAwardCard({ award, userPrediction }) {
  const now = new Date();
  const deadline = award.deadline ? new Date(award.deadline) : null;
  const isExp = deadline && now >= deadline;
  const isFin = award.status === "finished";
  const hasPred = userPrediction !== undefined;

  return (
    <div className="mob2-ac">
      <div className={`mob2-mc-accent mob2-mc-accent--${hasPred ? "green" : isExp || isFin ? "red" : "purple"}`} />
      <div className="mob2-lc-inner">
        <div className="mob2-lc-head">
          <div className="mob2-mc-lg-box">
            {award.logo_url && award.logo_url.startsWith("http")
              ? <img src={award.logo_url} alt="" onError={e => (e.target.style.display = "none")} />
              : (award.logo || "🏅")}
          </div>
          <div className="mob2-lc-info">
            <span className="mob2-lc-name">{(award.name || "PREMIO").toUpperCase()}</span>
            <span className="mob2-lc-season">{award.season || "—"}</span>
          </div>
          <div className={`mob2-status-dot mob2-status-dot--${isFin ? "finished" : isExp ? "expired" : hasPred ? "saved" : "pending"}`} />
        </div>
        <div className="mob2-lc-field">
          <span className="mob2-lc-lbl">TU PREDICCIÓN</span>
          <div className={`mob2-lc-input${userPrediction?.predicted_winner ? " mob2-lc-input--filled" : ""}`}>
            {userPrediction?.predicted_winner || "Ingresa el nombre..."}
          </div>
        </div>
      </div>
    </div>
  );
}

function NextMatchBanner({ match, currentUser, onOpen }) {
  if (!match) return <NoMatchBanner />;
  const now = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isExp = deadline && now >= deadline;
  const isLive = match.status === "live";

  return (
    <div className="mob2-nm">
      <div className="mob2-nm-eyebrow" />
      <button className="mob2-nm-card" onClick={() => onOpen("matches")} disabled={isExp}>
        <div className="mob2-nm-footer">
          <span className="mob2-nm-meta">PRÓXIMO PARTIDO · {match.league}</span>
          <span className="mob2-nm-meta">{match.date}</span>
        </div>
        <div className="mob2-nm-teams">
          <div className="mob2-nm-team">
            <div className="mob2-nm-flag">
              {match.home_team_logo_url
                ? <img src={match.home_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "⚽"}
            </div>
            <span className="mob2-nm-tname">{(match.home_team || "LOCAL").toUpperCase()}</span>
          </div>
          <div className="mob2-nm-center">
            <span className="mob2-nm-vs">VS</span>
            <span className="mob2-nm-time">{isLive ? `${match.minute || "??"}′` : (match.time || "—")}</span>
          </div>
          <div className="mob2-nm-team">
            <div className="mob2-nm-flag">
              {match.away_team_logo_url
                ? <img src={match.away_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "⚽"}
            </div>
            <span className="mob2-nm-tname">{(match.away_team || "VISIT.").toUpperCase()}</span>
          </div>
        </div>
      </button>
    </div>
  );
}

function ProgressBar({ saved, total, onNavigate }) {
  const pct = total > 0 ? Math.min(100, Math.round((saved / total) * 100)) : 0;
  return (
    <div className="mob2-progress">
      <div className="mob2-progress-row">
        <div className="mob2-progress-row-left">
          <span className="mob2-progress-lbl">Predic.</span>
          <span className="mob2-progress-count">[{saved}/{total}]</span>
        </div>
        <button className="mob2-history-cta-icon" onClick={onNavigate} aria-label="Historial">
          <BookOpen size={18} />
        </button>
      </div>
      <div className="mob2-progress-track">
        <div className="mob2-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TabBar({ activeTab, onTabChange, counts, tabs: customTabs }) {
  const tabs = customTabs || [
    { id: "matches", label: "Partidos", count: counts.matches },
    { id: "leagues", label: "Ligas", count: counts.leagues },
    { id: "awards", label: "Premios", count: counts.awards },
  ];

  return (
    <div className="mob2-tabbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`mob2-tab${activeTab === tab.id ? " mob2-tab--active" : ""}`}
          onPointerDown={() => onTabChange(tab.id)}
        >
          <span className="mob2-tab-label">{tab.label}</span>
          <span className="mob2-tab-count">{tab.count} items</span>
        </button>
      ))}
    </div>
  );
}

function PodiumPanel({ users, currentUser }) {
  const sorted = useMemo(
    () => [...users].sort((a, b) => b.points - a.points).slice(0, 3),
    [users]
  );

  if (sorted.length === 0) {
    return <div className="mob2-logros-empty">SIN DATOS DE RANKING</div>;
  }

  const visual = [sorted[1], sorted[0], sorted[2]];
  const cols = ["2nd", "1st", "3rd"];
  const medals = ["PLATA", "ORO", "BRONCE"];
  const fmt = n => Number(n || 0).toLocaleString("es-ES");

  return (
    <div className="mob2-podium">
      <div className="mob2-podium-stage">
        {visual.map((u, i) => {
          if (!u) return <div key={i} className={`mob2-pod-col mob2-pod-col--${cols[i]}`} />;
          const isMe = u.id === currentUser?.id;
          return (
            <div key={u.id} className={`mob2-pod-col mob2-pod-col--${cols[i]}`}>
              <div className="mob2-pod-card">
                <div className="mob2-pod-av">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.name} />
                    : (u.name || "U")[0].toUpperCase()}
                </div>
                <span className="mob2-pod-name">{(u.name || "—").substring(0, 8).toUpperCase()}</span>
                {isMe && <span className="mob2-pod-you">TÚ</span>}
                <span className="mob2-pod-pts">{fmt(u.points)}</span>
                <span className="mob2-pod-medal">{medals[i]}</span>
              </div>
              <div className="mob2-pod-step" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsPanel({ currentUser }) {
  const u = currentUser || {};
  const accuracy = u.predictions > 0 ? Math.round((u.correct / u.predictions) * 100) : 0;
  const fmt = n => Number(n || 0).toLocaleString("es-ES");

  return (
    <div>
      <div className="mob2-stats-grid">
        <div className="mob2-stat-cell">
          <div className="mob2-stat-val mob2-stat-val--accent">
            {fmt(u.points)}<span className="mob2-stat-unit">pts</span>
          </div>
          <div className="mob2-stat-lbl">Puntos</div>
        </div>
        <div className="mob2-stats-sep" />
        <div className="mob2-stat-cell">
          <div className="mob2-stat-val">{fmt(u.correct)}</div>
          <div className="mob2-stat-lbl">Aciertos</div>
        </div>
        <div className="mob2-stat-cell">
          <div className="mob2-stat-val mob2-stat-val--green">
            {accuracy}<span className="mob2-stat-unit">%</span>
          </div>
          <div className="mob2-stat-lbl">Precisión</div>
          <div className="mob2-stat-bar-wrap">
            <div className="mob2-stat-bar-fill" style={{ width: `${accuracy}%` }} />
          </div>
        </div>
        <div className="mob2-stats-sep" />
        <div className="mob2-stat-cell">
          <div className="mob2-stat-val">{fmt(u.predictions)}</div>
          <div className="mob2-stat-lbl">Predicciones</div>
        </div>
      </div>
    </div>
  );
}

// ── NUEVO: Panel de Álbumes ───────────────────────────────────
function AlbumsPanel({ currentUser, onNavigate }) {
  const userId = currentUser?.id;
  const { packs, packsAvailable, barPercent } = useAlbumPacks(userId);
  const { collection } = useAlbumCollection(userId);
  const { progress } = useAlbumProgress(userId);

  const uniqueCards = collection.length;
  const legendaryCompleted = progress.filter(p =>
    ['legendary_1','legendary_2','legendary_3','legendary_4','legendary_5'].includes(p.album_id) && p.is_completed
  ).length;
  const players = collection.filter(i => i.card?.card_type === 'player').length;
  const goats = collection.filter(i => i.card?.significance_level === 5).length;

  return (
    <div className="mob2-alb-panel">

      {/* Barra de progreso hacia siguiente sobre */}
      <div className="mob2-alb-bar-wrap">
        <div className="mob2-alb-bar-header">
          <span className="mob2-alb-bar-label">PRÓXIMO SOBRE</span>
          <span className="mob2-alb-bar-pct">{barPercent}<span>%</span></span>
        </div>
        <div className="mob2-alb-bar-track">
          <div className="mob2-alb-bar-fill" style={{ width: `${barPercent}%` }} />
          <div className="mob2-alb-bar-glow" style={{ left: `${Math.min(barPercent, 98)}%` }} />
        </div>
        <div className="mob2-alb-bar-hint">resultado exacto = sobre</div>
      </div>

      {/* Stats grid */}
      <div className="mob2-alb-grid">
        <div className="mob2-alb-cell mob2-alb-cell--packs">
          <Package size={14} className="mob2-alb-cell-icon" />
          <span className="mob2-alb-cell-val">{packsAvailable}</span>
          <span className="mob2-alb-cell-lbl">SOBRES</span>
        </div>
        <div className="mob2-alb-cell mob2-alb-cell--cards">
          <Star size={14} className="mob2-alb-cell-icon" />
          <span className="mob2-alb-cell-val">{uniqueCards}</span>
          <span className="mob2-alb-cell-lbl">CARTAS</span>
        </div>
        <div className="mob2-alb-cell mob2-alb-cell--leg">
          <Crown size={14} className="mob2-alb-cell-icon" />
          <span className="mob2-alb-cell-val">{legendaryCompleted}<span className="mob2-alb-cell-of">/5</span></span>
          <span className="mob2-alb-cell-lbl">ÁLBUMES</span>
        </div>
        <div className="mob2-alb-cell mob2-alb-cell--goat">
          <Flame size={14} className="mob2-alb-cell-icon" />
          <span className="mob2-alb-cell-val">{goats}</span>
          <span className="mob2-alb-cell-lbl">GOATs</span>
        </div>
      </div>

      {/* CTA */}
      <button className="mob2-alb-cta" onClick={onNavigate}>
        <BookOpen size={16} />
        <span>Abrir GlobalAlbums</span>
        <ChevronRight size={14} className="mob2-alb-cta-arrow" />
        {packsAvailable > 0 && (
          <span className="mob2-alb-cta-badge">{packsAvailable}</span>
        )}
      </button>
    </div>
  );
}

// ── Sección inferior (Ranking · Stats · Álbumes) ──────────────
function BottomSection({ users, currentUser, allAchievements }) {
  const [activeTab, setActiveTab] = useState("ranking");
  const navigate = useNavigate();

  const bottomTabs = [
    { id: "ranking", label: "Ranking", count: 3 },
    { id: "stats", label: "Stats", count: 4 },
    { id: "albums", label: "Álbumes", count: null },
  ];

  return (
    <div className="mob2-bottom-wrap">
      <div className="mob2-sec mob2-sec--no-hpad" style={{ marginTop: -14 }}>
        <div className="mob2-tabbar">
          {bottomTabs.map(tab => (
            <button
              key={tab.id}
              className={`mob2-tab${activeTab === tab.id ? " mob2-tab--active" : ""}`}
              onPointerDown={() => setActiveTab(tab.id)}
            >
              <span className="mob2-tab-label">{tab.label}</span>
              <span className="mob2-tab-count">{tab.count != null ? `${tab.count} items` : '25·26'}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "ranking" && (
        <PodiumPanel users={users} currentUser={currentUser} />
      )}
      {activeTab === "stats" && (
        <StatsPanel currentUser={currentUser} />
      )}
      {activeTab === "albums" && (
        <AlbumsPanel currentUser={currentUser} onNavigate={() => navigate('/albums')} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────────
export default function MobileDashboard({
  currentUser,
  users = [],
  matches = [],
  leagues = [],
  awards = [],
  allAchievements = [],
  loading = false,
  onPredict,
  onLeaguePredict,
  onAwardPredict,
}) {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("matches");

  const pendingMatches = useMemo(() => matches.filter(m => m.status === "pending"), [matches]);

  const nextMatch = useMemo(() => {
    return matches
      .filter(m => m.status === "pending")
      .sort((a, b) =>
        new Date(`${a.date}T${a.time || "00:00"}`) -
        new Date(`${b.date}T${b.time || "00:00"}`)
      )[0] || null;
  }, [matches]);

  const totalPredictable = pendingMatches.length;
  const savedPending = matches.filter(m =>
    m.status === "pending" &&
    m.predictions?.some(p => p.user_id === currentUser?.id)
  ).length;

  const previewMatches = pendingMatches.slice(0, 4);
  const previewLeagues = leagues.slice(0, 3);
  const previewAwards = awards.slice(0, 3);
  const tabCounts = { matches: pendingMatches.length, leagues: leagues.length, awards: awards.length };

  const renderTabContent = () => {
    if (activeTab === "matches") {
      if (loading) return [0, 1, 2].map(i => <SkeletonCard key={i} />);
      if (previewMatches.length === 0) return <EmptyMatchesScroll onOpen={p => setActivePage(p)} />;
      return (
        <>
          {previewMatches.map(m => (
            <MiniMatchCard key={m.id} match={m} userPred={m.predictions?.find(p => p.user_id === currentUser?.id)} />
          ))}
          <div className="mob2-more-card" onPointerDown={() => setActivePage("matches")}>
            <span className="mob2-more-sym">»</span>
            <span>TODOS</span>
          </div>
        </>
      );
    }

    if (activeTab === "leagues") {
      if (loading) return [0, 1].map(i => <SkeletonCard key={i} wide />);
      if (previewLeagues.length === 0) {
        return (
          <>
            <div className="mob2-empty"><span className="mob2-empty-lbl">SIN LIGAS ACTIVAS</span></div>
            <div className="mob2-more-card" onPointerDown={() => setActivePage("leagues")}>
              <span className="mob2-more-sym">»</span><span>VER TODO</span>
            </div>
          </>
        );
      }
      return (
        <>
          {previewLeagues.map(l => (
            <MiniLeagueCard key={l.id} league={l} userPrediction={l.league_predictions?.find(p => p.user_id === currentUser?.id)} />
          ))}
          <div className="mob2-more-card" onPointerDown={() => setActivePage("leagues")}>
            <span className="mob2-more-sym">»</span><span>VER TODO</span>
          </div>
        </>
      );
    }

    if (activeTab === "awards") {
      if (loading) return [0, 1].map(i => <SkeletonCard key={i} wide />);
      if (previewAwards.length === 0) {
        return (
          <>
            <div className="mob2-empty"><span className="mob2-empty-lbl">SIN PREMIOS ACTIVOS</span></div>
            <div className="mob2-more-card" onPointerDown={() => setActivePage("awards")}>
              <span className="mob2-more-sym">»</span><span>VER TODO</span>
            </div>
          </>
        );
      }
      return (
        <>
          {previewAwards.map(a => (
            <MiniAwardCard key={a.id} award={a} userPrediction={a.award_predictions?.find(p => p.user_id === currentUser?.id)} />
          ))}
          <div className="mob2-more-card" onPointerDown={() => setActivePage("awards")}>
            <span className="mob2-more-sym">»</span><span>VER TODO</span>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="mob2-root">
      {activePage && (
        <MobileSubPage
          page={activePage}
          matches={matches}
          leagues={leagues}
          awards={awards}
          currentUser={currentUser}
          onPredict={onPredict}
          onLeaguePredict={onLeaguePredict}
          onAwardPredict={onAwardPredict}
          onBack={() => setActivePage(null)}
        />
      )}

      <ProgressBar saved={savedPending} total={totalPredictable} onNavigate={() => navigate("/albums")} />
      <NextMatchBanner match={nextMatch} currentUser={currentUser} onOpen={p => setActivePage(p)} />

      <div className="mob2-sec" style={{ marginTop: "14px" }}>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
      </div>

      <div className="mob2-hscroll-wrap">
        <div className="mob2-hscroll">{renderTabContent()}</div>
      </div>

      <BottomSection users={users} currentUser={currentUser} allAchievements={allAchievements} />

      {profileModal && currentUser?.id && (
        <MobileUserProfile userId={currentUser.id} onClose={() => setProfileModal(false)} />
      )}
    </div>
  );
}