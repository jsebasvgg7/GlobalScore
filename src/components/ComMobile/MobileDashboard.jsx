import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileUserProfile from "../ComProfile/MobileUserProfile";
import Footer from "../ComLayout/Footer";
import MobileSubPage     from "./MobileSubPage";
import "../../styles/StylesMobile/MobileDashboard.css";
import "../../styles/StylesMobile/MobileSubPage.css";

// ── SVGs inline ───────────────────────────────────────────────
const ClockSVG = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
  </svg>
);

const CalSVG = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18"/><line x1="7" y1="2" x2="7" y2="6"/>
    <line x1="17" y1="2" x2="17" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ── Empty mini ────────────────────────────────────────────────
function EmptyMini({ label }) {
  return (
    <div className="mob2-empty">
      <span className="mob2-empty-lbl">{label}</span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
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

// ── Mini Match Card ───────────────────────────────────────────
function MiniMatchCard({ match, userPred }) {
  const now      = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isExp    = deadline && now >= deadline;
  const isLive   = match.status === "live";
  const hasPred  = userPred !== undefined;
  const pillMod  = isLive ? "live" : isExp ? "closed" : hasPred ? "saved" : "pending";
  const pillTxt  = isLive ? "VIVO" : isExp ? "CERR." : hasPred ? "GUARD." : "PEND.";
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
            <span className="mob2-mc-tname">
              {(match.home_team || "—").substring(0, 8).toUpperCase()}
            </span>
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
            <span className="mob2-mc-tname">
              {(match.away_team || "—").substring(0, 8).toUpperCase()}
            </span>
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

// ── Mini League Card ──────────────────────────────────────────
function MiniLeagueCard({ league, userPrediction }) {
  const now      = new Date();
  const deadline = league.deadline ? new Date(league.deadline) : null;
  const isExp    = deadline && now >= deadline;
  const isFin    = league.status === "finished";
  const hasPred  = userPrediction !== undefined;
  const dotMod   = isFin ? "finished" : isExp ? "expired" : hasPred ? "saved" : "pending";

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
          <div className={`mob2-status-dot mob2-status-dot--${dotMod}`} />
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

// ── Mini Award Card ───────────────────────────────────────────
function MiniAwardCard({ award, userPrediction }) {
  const now      = new Date();
  const deadline = award.deadline ? new Date(award.deadline) : null;
  const isExp    = deadline && now >= deadline;
  const isFin    = award.status === "finished";
  const hasPred  = userPrediction !== undefined;
  const dotMod   = isFin ? "finished" : isExp ? "expired" : hasPred ? "saved" : "pending";

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
          <div className={`mob2-status-dot mob2-status-dot--${dotMod}`} />
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

// ── Next Match Banner ─────────────────────────────────────────
function NextMatchBanner({ match, currentUser, onOpen }) {
  if (!match) return null;
  const now      = new Date();
  const deadline = match.deadline ? new Date(match.deadline) : null;
  const isExp    = deadline && now >= deadline;
  const isLive   = match.status === "live";
  const hasPred  = match.predictions?.some(p => p.user_id === currentUser?.id);

  return (
    <div className="mob2-nm">
      <div className="mob2-nm-eyebrow">
      </div>
        <div className="mob2-nm-card" onClick={() => !isExp && onOpen("matches")}>

        {/* ← FOOTER ahora arriba */}
        <div className="mob2-nm-footer">
          <span className="mob2-nm-meta">Proximo Partido · {match.league} · {match.date}</span>
          {!isExp && (
            <button className="mob2-nm-btn">
              {hasPred ? "VER PRED. >>" : "PREDECIR >>"}
            </button>
          )}
        </div>

        {/* ← EQUIPOS abajo */}
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
            <span className="mob2-nm-time">
              {isLive ? `${match.minute || "??"}′` : (match.time || "—")}
            </span>
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

      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
function ProgressBar({ saved, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((saved / total) * 100)) : 0;
  return (
    <div className="mob2-progress">
      <div className="mob2-progress-row">
        <span className="mob2-progress-lbl">PREDICCIONES TOTALES</span>
        <span className="mob2-progress-count">[{saved}/{total}]</span>
      </div>
      <div className="mob2-progress-track">
        <div className="mob2-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────
// Acepta `tabs` (array custom) o `counts` (objeto para predicciones)
function TabBar({ activeTab, onTabChange, counts, tabs: customTabs }) {
  const tabs = customTabs || [
    { id: "matches", label: "Partidos", count: counts.matches },
    { id: "leagues", label: "Ligas",    count: counts.leagues },
    { id: "awards",  label: "Premios",  count: counts.awards  },
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

// ── Podio top 3 ───────────────────────────────────────────────
function PodiumPanel({ users, currentUser }) {
  const sorted = useMemo(
    () => [...users].sort((a, b) => b.points - a.points).slice(0, 3),
    [users]
  );

  if (sorted.length === 0) {
    return <div className="mob2-logros-empty">SIN DATOS DE RANKING</div>;
  }

  const visual = [sorted[1], sorted[0], sorted[2]];
  const cols   = ["2nd", "1st", "3rd"];
  const medals = ["PLATA", "ORO", "BRONCE"];
  const fmt    = n => Number(n || 0).toLocaleString("es-ES");

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
                <span className="mob2-pod-name">
                  {(u.name || "—").substring(0, 8).toUpperCase()}
                </span>
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

// ── Stats panel ───────────────────────────────────────────────
function StatsPanel({ currentUser }) {
  const u        = currentUser || {};
  const accuracy = u.predictions > 0
    ? Math.round((u.correct / u.predictions) * 100) : 0;
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

// ── Sección inferior (Ranking · Stats · Logros) ───────────────
function BottomSection({ users, currentUser, allAchievements }) {
  const [activeTab, setActiveTab] = useState("ranking");

  const bottomTabs = [
    { id: "ranking", label: "Ranking", count: 3 },
    { id: "stats",   label: "Stats",   count: 4 },
  ];

  return (
    <div className="mob2-bottom-wrap">
      {/* TabBar fuera del box — idéntico al de predicciones, sin contenedor blanco */}
      <div className="mob2-sec mob2-sec--no-hpad" style={{ marginTop: 0 }}>
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={bottomTabs}
        />
      </div>

      {/* Contenido directo, sin mob2-bottom-box */}
      {activeTab === "ranking" && (
        <PodiumPanel users={users} currentUser={currentUser} />
      )}
      {activeTab === "stats" && (
        <StatsPanel currentUser={currentUser} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────────
export default function MobileDashboard({
  currentUser,
  users            = [],
  matches          = [],
  leagues          = [],
  awards           = [],
  allAchievements  = [],
  loading          = false,
  onPredict,
  onLeaguePredict,
  onAwardPredict,
}) {
  const navigate = useNavigate();

  const [activePage,   setActivePage]   = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [activeTab,    setActiveTab]    = useState("matches");

  const pendingMatches = useMemo(
    () => matches.filter(m => m.status === "pending"),
    [matches]
  );

  const nextMatch = useMemo(() => {
    return matches
      .filter(m => m.status === "pending")
      .sort((a, b) =>
        new Date(`${a.date}T${a.time || "00:00"}`) -
        new Date(`${b.date}T${b.time || "00:00"}`)
      )[0] || null;
  }, [matches]);

  const totalPredictable = pendingMatches.length;
  const savedPending     = matches.filter(m =>
    m.status === "pending" &&
    m.predictions?.some(p => p.user_id === currentUser?.id)
  ).length;

  const previewMatches = pendingMatches.slice(0, 5);
  const previewLeagues = leagues.slice(0, 3);
  const previewAwards  = awards.slice(0, 3);

  const tabCounts  = { matches: pendingMatches.length, leagues: leagues.length, awards: awards.length };
  const allPageMap = { matches: "matches", leagues: "leagues", awards: "awards" };

  const renderTabContent = () => {
    if (activeTab === "matches") {
      return loading
        ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
        : previewMatches.length === 0
        ? <EmptyMini label="SIN PARTIDOS PENDIENTES" />
        : (
          <>
            {previewMatches.map(m => (
              <MiniMatchCard
                key={m.id}
                match={m}
                userPred={m.predictions?.find(p => p.user_id === currentUser?.id)}
              />
            ))}
            {pendingMatches.length > 5 && (
              <div className="mob2-more-card" onPointerDown={() => setActivePage("matches")}>
                <span className="mob2-more-sym">»</span>
                <span>MÁS</span>
              </div>
            )}
          </>
        );
    }

    if (activeTab === "leagues") {
      return loading
        ? [0, 1].map(i => <SkeletonCard key={i} wide />)
        : previewLeagues.length === 0
        ? <EmptyMini label="SIN LIGAS ACTIVAS" />
        : (
          <>
            {previewLeagues.map(l => (
              <MiniLeagueCard
                key={l.id}
                league={l}
                userPrediction={l.league_predictions?.find(p => p.user_id === currentUser?.id)}
              />
            ))}
            {leagues.length > 3 && (
              <div className="mob2-more-card" onPointerDown={() => setActivePage("leagues")}>
                <span className="mob2-more-sym">»</span>
                <span>MÁS</span>
              </div>
            )}
          </>
        );
    }

    if (activeTab === "awards") {
      return loading
        ? [0, 1].map(i => <SkeletonCard key={i} wide />)
        : previewAwards.length === 0
        ? <EmptyMini label="SIN PREMIOS ACTIVOS" />
        : (
          <>
            {previewAwards.map(a => (
              <MiniAwardCard
                key={a.id}
                award={a}
                userPrediction={a.award_predictions?.find(p => p.user_id === currentUser?.id)}
              />
            ))}
            {awards.length > 3 && (
              <div className="mob2-more-card" onPointerDown={() => setActivePage("awards")}>
                <span className="mob2-more-sym">»</span>
                <span>MÁS</span>
              </div>
            )}
          </>
        );
    }

    return null;
  };

  return (
    <div className="mob2-root">

      {/* Sub-páginas */}
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

      {/* PROGRESS */}
      <ProgressBar saved={savedPending} total={totalPredictable} />

      {/* NEXT MATCH */}
      <NextMatchBanner
        match={nextMatch}
        currentUser={currentUser}
        onOpen={p => setActivePage(p)}
      />

      {/* TABS + SCROLL de predicciones */}
      <div className="mob2-sec" style={{ marginTop: "14px" }}>
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
        />
        <div
          className="mob2-sec-all"
          onPointerDown={() => setActivePage(allPageMap[activeTab])}
        >
          TODOS »
        </div>
      </div>

      <div className="mob2-hscroll-wrap">
        <div className="mob2-hscroll">
          {renderTabContent()}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Ranking · Stats · Logros */}
      <BottomSection
        users={users}
        currentUser={currentUser}
        allAchievements={allAchievements}
      />

      {/* PROFILE MODAL */}
      {profileModal && currentUser?.id && (
        <MobileUserProfile
          userId={currentUser.id}
          onClose={() => setProfileModal(false)}
        />
      )}
      <Footer />
    </div>
  );
}