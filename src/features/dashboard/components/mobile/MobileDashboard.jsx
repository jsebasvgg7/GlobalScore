import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Target, ChevronRight } from "lucide-react";
import { MobileUserProfile } from "@/features/profile";
import { MobileSubPage } from "@/shared/layout";
import AlbumBookEntry from '@/features/albums/components/AlbumBookEntry';
import { useAlbumPacks } from '@/features/albums/hooks/useAlbumPacks';
import { useAlbumCollection } from '@/features/albums/hooks/useAlbumCollection';
import { useAlbumProgress } from '@/features/albums/hooks/useAlbumProgress';
import "./MobileDashboard.css";

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
    <div className="mob2-nm">
      <div className="mob2-nm-card mob2-nm-card--empty">
        <div className="mob2-nm-footer">
          <span className="mob2-nm-chip">PRÓXIMO PARTIDO</span>
          <span className="mob2-nm-meta"><CalSVG /> Temporada al día</span>
        </div>
        <div className="mob2-nm-teams mob2-nm-teams--empty">
          <div className="mob2-nm-empty-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>
          <div className="mob2-nm-empty-center">
            <span className="mob2-nm-empty-title">Sin partidos pendientes</span>
            <span className="mob2-nm-empty-sub">Te avisamos cuando haya uno nuevo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyMatchesScroll() {
  return (
    <>
      <div className="mob2-fw-card mob2-fw-card--hero mob2-fw-card--ghost mob2-fw-card--ghost-hero">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag mob2-sm-tag--ghost">// PRÓXIMO PARTIDO</span>
          <span className="mob2-sm-title mob2-sm-title--ghost">Sin partidos pendientes</span>
          <span className="mob2-sm-meta mob2-sm-meta--ghost">Temporada al día</span>
        </div>
      </div>
      <GhostMatchCard />
      <GhostMatchCard />
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

// Card de partido — hero (grande, morada) para la 1ra, small para el resto
function FullWidthMatchCard({ match, userPred, variant = "hero" }) {
  const now = new Date();
  const isLive = match.status === "live";
  const hasPred = userPred !== undefined;
  const timeLabel = isLive ? `${match.minute || "??"}′` : (match.time || "—");

  if (variant === "small") {
    return (
      <div className="mob2-fw-card mob2-fw-card--small">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag">{(match.league || "LIGA").toUpperCase()}</span>
          <span className="mob2-sm-title">
            {(match.home_team || "—").substring(0, 3).toUpperCase()} vs {(match.away_team || "—").substring(0, 3).toUpperCase()}
          </span>
          <span className="mob2-sm-meta">{hasPred ? `${userPred.home_score ?? "—"}-${userPred.away_score ?? "—"}` : timeLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mob2-fw-card mob2-fw-card--hero">
      <div className="mob2-hero-body">
        <span className="mob2-hero-tag">{(match.league || "LIGA").toUpperCase()}</span>
        <div className="mob2-hero-teams-wrap">
          <div className="mob2-hero-teams">
            <div className="mob2-hero-team">
              <div className="mob2-hero-flag">
                {match.home_team_logo_url
                  ? <img src={match.home_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                  : "⚽"}
              </div>
              <span className="mob2-hero-tname">{(match.home_team || "—").toUpperCase()}</span>
            </div>
            <span className="mob2-hero-vs">
              {hasPred ? `${userPred.home_score ?? "—"}-${userPred.away_score ?? "—"}` : "VS"}
            </span>
            <div className="mob2-hero-team">
              <div className="mob2-hero-flag">
                {match.away_team_logo_url
                  ? <img src={match.away_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                  : "⚽"}
              </div>
              <span className="mob2-hero-tname">{(match.away_team || "—").toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="mob2-hero-footer">
          <span className="mob2-hero-date">{match.date || "—"}</span>
          <span className="mob2-hero-time">{timeLabel}</span>
        </div>
      </div>
    </div>
  );
}

// Card fantasma — placeholder decorativo que rellena huecos del grid bento
// de Partidos cuando hay menos de 3 items (1 o 2 partidos pendientes)
function GhostMatchCard() {
  return (
    <div className="mob2-fw-card mob2-fw-card--small mob2-fw-card--ghost">
      <div className="mob2-sm-body">
        <span className="mob2-sm-tag mob2-sm-tag--ghost">// PRÓXIMAMENTE</span>
        <span className="mob2-sm-title mob2-sm-title--ghost">Nuevo partido</span>
        <span className="mob2-sm-meta mob2-sm-meta--ghost">Aún sin confirmar</span>
      </div>
    </div>
  );
}

// Card de liga — hero (grande, morada) para la 1ra, small para el resto
function FullWidthLeagueCard({ league, userPrediction, variant = "hero" }) {
  const hasPred = userPrediction !== undefined;

  if (variant === "small") {
    return (
      <div className="mob2-fw-card mob2-fw-card--small mob2-fw-card--tint-green">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag">{(league.name || "LIGA").toUpperCase()}</span>
          <span className="mob2-sm-title">{hasPred ? userPrediction.predicted_champion : "Sin predicción"}</span>
          <span className="mob2-sm-meta">{league.season || "—"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mob2-fw-card mob2-fw-card--hero mob2-fw-card--hero-green">
      <div className="mob2-hero-body">
        <div>
          <span className="mob2-hero-tag">{(league.name || "LIGA").toUpperCase()} · {league.season || "—"}</span>
          <div style={{ marginTop: 14 }}>
            <span className="mob2-hero-meta" style={{ display: "block", marginBottom: 6, fontSize: 8 }}>CAMPEÓN PREDICHO</span>
            <span className="mob2-hero-tname" style={{ fontSize: 15 }}>
              {userPrediction?.predicted_champion || "Sin predicción"}
            </span>
          </div>
        </div>
        <div className="mob2-hero-footer">
          <span className="mob2-hero-meta">{hasPred ? "GUARDADO" : "PENDIENTE"}</span>
        </div>
      </div>
    </div>
  );
}

// Card de premio — hero (grande, amarilla) para la 1ra, small (tint amarilla) para el resto
function FullWidthAwardCard({ award, userPrediction, variant = "hero" }) {
  const hasPred = userPrediction !== undefined;

  if (variant === "small") {
    return (
      <div className="mob2-fw-card mob2-fw-card--small mob2-fw-card--tint-amber">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag">{(award.name || "PREMIO").toUpperCase()}</span>
          <span className="mob2-sm-title">{hasPred ? userPrediction.predicted_winner : "Sin predicción"}</span>
          <span className="mob2-sm-meta">{award.season || "—"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mob2-fw-card mob2-fw-card--hero mob2-fw-card--hero-amber">
      <div className="mob2-hero-body">
        <div>
          <span className="mob2-hero-tag">{(award.name || "PREMIO").toUpperCase()} · {award.season || "—"}</span>
          <div style={{ marginTop: 14 }}>
            <span className="mob2-hero-meta" style={{ display: "block", marginBottom: 6, fontSize: 8 }}>TU PREDICCIÓN</span>
            <span className="mob2-hero-tname" style={{ fontSize: 15 }}>
              {userPrediction?.predicted_winner || "Sin predicción"}
            </span>
          </div>
        </div>
        <div className="mob2-hero-footer">
          <span className="mob2-hero-meta">{hasPred ? "GUARDADO" : "PENDIENTE"}</span>
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
  const leagueLabel = (match.league || "LIGA").toUpperCase();

  return (
    <div className="mob2-nm">
      <button className="mob2-nm-card" onClick={() => onOpen("matches")} disabled={isExp}>
        <div className="mob2-nm-footer">
          <span className="mob2-nm-chip">PRÓXIMO PARTIDO</span>
          <span className="mob2-nm-meta"><CalSVG /> {match.date}</span>
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
            <span className="mob2-nm-league-badge">{leagueLabel.substring(0, 8)}</span>
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
        <span className="mob2-nm-plus">+</span>
        <span className="mob2-nm-arrow">›</span>
      </button>
    </div>
  );
}

function ProgressBar({ saved, total, onNavigate }) {
  const pct = total > 0 ? Math.min(100, Math.round((saved / total) * 100)) : 0;
  return (
    <div className="mob2-pred">
      <div className="mob2-pred-body">
        <div className="mob2-pred-head">
          <div className="mob2-pred-title">
            <span className="mob2-pred-bar" />
            <Target size={13} />
            <span>PREDICCIONES</span>
          </div>
          <span className="mob2-pred-badge">✓ {pct}%</span>
        </div>

        <div className="mob2-pred-nums">
          <span className="mob2-pred-saved">{saved}</span>
          <span className="mob2-pred-total"> / {total}</span>
        </div>
        <span className="mob2-pred-caption">COMPLETADAS</span>

        <div className="mob2-pred-track-wrap">
          <div className="mob2-pred-track">
            <div className="mob2-pred-fill" style={{ width: `${pct}%` }} />
            <div className="mob2-pred-seg" style={{ left: "25%" }} />
            <div className="mob2-pred-seg" style={{ left: "50%" }} />
            <div className="mob2-pred-seg" style={{ left: "75%" }} />
          </div>
        </div>
      </div>

      <button className="mob2-pred-arrow" onClick={onNavigate} aria-label="Historial">
        <ChevronRight size={16} />
      </button>
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
    () => [...users].sort((a, b) => (b.season_points || 0) - (a.season_points || 0)).slice(0, 3),
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
    <div className="mob2-fw-card mob2-pod-frame">
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
                  <span className="mob2-pod-pts">{fmt(u.season_points)}</span>
                  <span className="mob2-pod-medal">{medals[i]}</span>
                </div>
                <div className="mob2-pod-step" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatsPanel({ currentUser }) {
  const u = currentUser || {};
  const seasonPoints = u.season_points || 0;
  const seasonCorrect = u.season_correct || 0;
  const seasonPredictions = u.season_predictions || 0;
  const accuracy = seasonPredictions > 0 ? Math.round((seasonCorrect / seasonPredictions) * 100) : 0;
  const fmt = n => Number(n || 0).toLocaleString("es-ES");

  return (
    <div className="mob2-bento-grid">
      <div className="mob2-fw-card mob2-fw-card--hero mob2-bento-hero">
        <div className="mob2-hero-body">
          <span className="mob2-hero-tag">PUNTOS</span>
          <div className="mob2-bento-hero-val">{fmt(seasonPoints)}</div>
        </div>
      </div>
      <div className="mob2-fw-card mob2-fw-card--small mob2-bento-small">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag">ACIERTOS</span>
          <span className="mob2-sm-title mob2-sm-title--lg">{fmt(seasonCorrect)}</span>
        </div>
      </div>
      <div className="mob2-fw-card mob2-fw-card--small mob2-bento-small">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag mob2-sm-tag--green">PRECISIÓN</span>
          <span className="mob2-sm-title mob2-sm-title--lg mob2-sm-title--green">{accuracy}%</span>
        </div>
      </div>
      <div className="mob2-fw-card mob2-bento-wide">
        <div className="mob2-sm-body mob2-sm-body--row">
          <span className="mob2-sm-tag">PREDICCIONES</span>
          <span className="mob2-sm-title mob2-sm-title--lg">{fmt(seasonPredictions)}</span>
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

      <div className="mob2-bento-grid">
        <div className="mob2-fw-card mob2-fw-card--hero mob2-bento-hero">
          <div className="mob2-hero-body">
            <span className="mob2-hero-tag">PRÓXIMO SOBRE</span>
            <div className="mob2-bento-hero-val">{barPercent}%</div>
            <div className="mob2-alb-bar-track mob2-alb-bar-track--hero">
              <div className="mob2-alb-bar-fill mob2-alb-bar-fill--hero" style={{ width: `${barPercent}%` }} />
            </div>
            <span className="mob2-hero-meta mob2-alb-bar-hint--hero">RESULTADO EXACTO = SOBRE</span>
          </div>
        </div>
        <div className="mob2-fw-card mob2-fw-card--small mob2-bento-small mob2-fw-card--tint-amber">
          <div className="mob2-sm-body">
            <span className="mob2-sm-tag">CARTAS</span>
            <span className="mob2-sm-title mob2-sm-title--lg">{uniqueCards}</span>
          </div>
        </div>
        <div className="mob2-fw-card mob2-fw-card--small mob2-bento-small">
          <div className="mob2-sm-body">
            <span className="mob2-sm-tag">ÁLBUMES</span>
            <span className="mob2-sm-title mob2-sm-title--lg">{legendaryCompleted}<span className="mob2-sm-title--sub">/5</span></span>
          </div>
        </div>
        <div className="mob2-fw-card mob2-bento-wide">
          <div className="mob2-sm-body mob2-sm-body--row">
            <span className="mob2-sm-tag">SOBRES</span>
            <span className="mob2-sm-title mob2-sm-title--lg">{packsAvailable}</span>
          </div>
        </div>
        <div className="mob2-fw-card mob2-bento-wide">
          <div className="mob2-sm-body mob2-sm-body--row">
            <span className="mob2-sm-tag">GOATS</span>
            <span className="mob2-sm-title mob2-sm-title--lg">{goats}</span>
          </div>
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

// ── Sección inferior (Stats · Ranking · Álbumes) ──────────────
function BottomSection({ users, currentUser, allAchievements }) {
  const [activeTab, setActiveTab] = useState("stats");
  const navigate = useNavigate();

  const bottomTabs = [
    { id: "stats", label: "Stats", count: 4 },
    { id: "ranking", label: "Ranking", count: 3 },
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

      {activeTab === "stats" && (
        <StatsPanel currentUser={currentUser} />
      )}
      {activeTab === "ranking" && (
        <PodiumPanel users={users} currentUser={currentUser} />
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

  const previewMatches = pendingMatches.slice(0, 3);
  const previewLeagues = leagues.slice(0, 3);
  const previewAwards = awards.slice(0, 3);
  const tabCounts = { matches: pendingMatches.length, leagues: leagues.length, awards: awards.length };

  const renderTabContent = () => {
    if (activeTab === "matches") {
      if (loading) return [0, 1, 2].map(i => <SkeletonCard key={i} />);
      if (previewMatches.length === 0) return <EmptyMatchesScroll />;
      const matchCards = previewMatches.map((m, i) => (
        <FullWidthMatchCard
          key={m.id}
          match={m}
          userPred={m.predictions?.find(p => p.user_id === currentUser?.id)}
          variant={i === 0 ? "hero" : "small"}
        />
      ));
      // Grid bento = 1 hero + 2 smalls. Si hay 1 o 2 partidos, se rellenan
      // los huecos con cards fantasma decorativas ("Nuevo partido próximamente")
      const ghostsNeeded = Math.max(0, 3 - matchCards.length);
      const ghostCards = Array.from({ length: ghostsNeeded }, (_, i) => (
        <GhostMatchCard key={`ghost-${i}`} />
      ));
      return [...matchCards, ...ghostCards];
    }

    if (activeTab === "leagues") {
      if (loading) return [0, 1].map(i => <SkeletonCard key={i} wide />);
      if (previewLeagues.length === 0) {
        return <div className="mob2-empty"><span className="mob2-empty-lbl">SIN LIGAS ACTIVAS</span></div>;
      }
      return previewLeagues.map((l, i) => (
        <FullWidthLeagueCard
          key={l.id}
          league={l}
          userPrediction={l.league_predictions?.find(p => p.user_id === currentUser?.id)}
          variant={i === 0 ? "hero" : "small"}
        />
      ));
    }

    if (activeTab === "awards") {
      if (loading) return [0, 1].map(i => <SkeletonCard key={i} wide />);
      if (previewAwards.length === 0) {
        return <div className="mob2-empty"><span className="mob2-empty-lbl">SIN PREMIOS ACTIVOS</span></div>;
      }
      return previewAwards.map((a, i) => (
        <FullWidthAwardCard
          key={a.id}
          award={a}
          userPrediction={a.award_predictions?.find(p => p.user_id === currentUser?.id)}
          variant={i === 0 ? "hero" : "small"}
        />
      ));
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

      <NextMatchBanner match={nextMatch} currentUser={currentUser} onOpen={p => setActivePage(p)} />
      <ProgressBar saved={savedPending} total={totalPredictable} onNavigate={() => setActivePage("matches")} />

      <div className="mob2-sec" style={{ marginTop: "14px" }}>
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
      </div>

      <div className="mob2-fw-scroll">{renderTabContent()}</div>

      <div className="mob2-fw-viewall-wrap">
        <button className="mob2-fw-viewall" onClick={() => setActivePage(activeTab)}>
          Ver todos <ChevronRight size={13} />
        </button>
      </div>

      <BottomSection users={users} currentUser={currentUser} allAchievements={allAchievements} />

      {profileModal && currentUser?.id && (
        <MobileUserProfile userId={currentUser.id} onClose={() => setProfileModal(false)} />
      )}
    </div>
  );
}