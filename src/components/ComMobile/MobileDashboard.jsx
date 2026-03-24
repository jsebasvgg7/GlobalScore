import React, { useState, useMemo } from "react";
import { X, Swords, Trophy, Medal, User, Filter, ArrowUpDown } from "lucide-react";
import MatchCard         from "../ComCards/MatchCard";
import LeagueCard        from "../ComCards/LeagueCard";
import AwardCard         from "../ComCards/AwardCard";
import UserProfileModal  from "../ComOthers/UserProfileModal";
import "../../styles/StylesMobile/MobileDashboard.css";

const LEAGUE_CATS = [
  { id: "all",          name: "Todos",      icon: "🌍", leagues: [] },
  { id: "europe",       name: "Europa",     icon: "🏆", leagues: ["Champions League","Europa League","Conference League"] },
  { id: "england",      name: "Inglaterra", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", leagues: ["Premier League","Championship","FA Cup","EFL Cup"] },
  { id: "spain",        name: "España",     icon: "🇪🇸", leagues: ["La Liga","Copa del Rey","Supercopa"] },
  { id: "italy",        name: "Italia",     icon: "🇮🇹", leagues: ["Serie A","Coppa Italia","Supercoppa"] },
  { id: "germany",      name: "Alemania",   icon: "🇩🇪", leagues: ["Bundesliga","DFB Pokal"] },
  { id: "france",       name: "Francia",    icon: "🇫🇷", leagues: ["Ligue 1","Coupe de France","Coupe de la Ligue"] },
  { id: "southamerica", name: "Sudamérica", icon: "🌎", leagues: ["Copa Libertadores","Copa Sudamericana"] },
];

const SORT_OPTS = [
  { key: "date-asc",  label: "Más próximos" },
  { key: "date-desc", label: "Más lejanos"  },
];

/* ================================================================
   ICONOS BRUTALISTAS — SVG geométrico, sin relleno, solo trazo
================================================================ */
const IconMatch = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="42" height="42" stroke="currentColor" strokeWidth="0.5"/>
    <rect x="8" y="8" width="28" height="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3"/>
    <line x1="1" y1="22" x2="43" y2="22" stroke="currentColor" strokeWidth="0.5"/>
    <line x1="22" y1="1" x2="22" y2="43" stroke="currentColor" strokeWidth="0.5"/>
    <circle cx="22" cy="22" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
  </svg>
);

const IconLeague = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="42" height="42" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M22 8 L36 16 L36 28 L22 36 L8 28 L8 16 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M22 14 L30 18.5 L30 27 L22 31.5 L14 27 L14 18.5 Z" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="2 2"/>
    <circle cx="22" cy="22" r="2" fill="currentColor" opacity="0.4"/>
  </svg>
);

const IconAward = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="42" height="42" stroke="currentColor" strokeWidth="0.5"/>
    <rect x="14" y="9" width="16" height="17" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <rect x="8" y="9" width="6" height="10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
    <rect x="30" y="9" width="6" height="10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
    <line x1="17" y1="26" x2="17" y2="32" stroke="currentColor" strokeWidth="0.5"/>
    <line x1="27" y1="26" x2="27" y2="32" stroke="currentColor" strokeWidth="0.5"/>
    <line x1="12" y1="32" x2="32" y2="32" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="17" y="32" width="10" height="3" stroke="currentColor" strokeWidth="0.5" fill="none"/>
  </svg>
);

/* ================================================================
   EMPTY STATE — reemplaza el EmptyMsg de texto plano
   type: "matches" | "leagues" | "awards"
================================================================ */
function EmptyState({ type = "matches" }) {
  const configs = {
    matches: {
      icon: <IconMatch />,
      label: "Sin partidos pendientes",
      sub:   "Cuando haya partidos disponibles aparecerán aquí",
    },
    leagues: {
      icon: <IconLeague />,
      label: "Sin ligas activas",
      sub:   "Las ligas de temporada aparecerán aquí",
    },
    awards: {
      icon: <IconAward />,
      label: "Sin premios activos",
      sub:   "Los premios de temporada aparecerán aquí",
    },
  };
  const { icon, label, sub } = configs[type] || configs.matches;

  return (
    <div className="mob-empty">
      <div className="mob-empty-icon" style={{ color: "var(--mob-muted)" }}>
        {icon}
      </div>
      <span className="mob-empty-lbl">{label}</span>
      <span className="mob-empty-sub">{sub}</span>
    </div>
  );
}

/* ================================================================
   SKELETON CARDS — placeholders mientras carga
================================================================ */
function SkeletonMatchCard() {
  return (
    <div className="mob-sk-mcard">
      <div className="mob-sk-mcard-head">
        <div className="mob-sk" style={{ width: 52, height: 9 }} />
        <div className="mob-sk" style={{ width: 44, height: 14, borderRadius: 20 }} />
      </div>
      <div className="mob-sk-mcard-row">
        <div className="mob-sk-mcard-left">
          <div className="mob-sk" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <div className="mob-sk" style={{ width: 52, height: 10 }} />
        </div>
        <div className="mob-sk" style={{ width: 32, height: 32 }} />
      </div>
      <div className="mob-sk-sep" />
      <div className="mob-sk-mcard-row">
        <div className="mob-sk-mcard-left">
          <div className="mob-sk" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <div className="mob-sk" style={{ width: 44, height: 10 }} />
        </div>
        <div className="mob-sk" style={{ width: 32, height: 32 }} />
      </div>
      <div className="mob-sk-mcard-foot">
        <div className="mob-sk" style={{ width: 28, height: 8 }} />
        <div className="mob-sk" style={{ width: 40, height: 8 }} />
      </div>
    </div>
  );
}

function SkeletonLeagueCard() {
  return (
    <div className="mob-sk-lcard">
      <div className="mob-sk-lcard-head">
        <div className="mob-sk" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <div className="mob-sk-lcard-info">
          <div className="mob-sk" style={{ width: 80, height: 10 }} />
          <div className="mob-sk" style={{ width: 52, height: 8 }} />
        </div>
        <div className="mob-sk" style={{ width: 9, height: 9, borderRadius: "50%" }} />
      </div>
      <div className="mob-sk-lcard-field">
        <div className="mob-sk" style={{ width: 52, height: 8 }} />
        <div className="mob-sk" style={{ width: "100%", height: 26 }} />
      </div>
      <div className="mob-sk-lcard-row">
        <div className="mob-sk-lcard-field">
          <div className="mob-sk" style={{ width: 52, height: 8 }} />
          <div className="mob-sk" style={{ width: "100%", height: 26 }} />
        </div>
        <div className="mob-sk-lcard-field">
          <div className="mob-sk" style={{ width: 40, height: 8 }} />
          <div className="mob-sk" style={{ width: "100%", height: 26 }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonAwardCard() {
  return (
    <div className="mob-sk-acard">
      <div className="mob-sk-acard-head">
        <div className="mob-sk" style={{ width: 34, height: 34, borderRadius: 8 }} />
        <div className="mob-sk-lcard-info">
          <div className="mob-sk" style={{ width: 80, height: 10 }} />
          <div className="mob-sk" style={{ width: 52, height: 8 }} />
        </div>
        <div className="mob-sk" style={{ width: 9, height: 9, borderRadius: "50%" }} />
      </div>
      <div className="mob-sk-lcard-field">
        <div className="mob-sk" style={{ width: 72, height: 8 }} />
        <div className="mob-sk" style={{ width: "100%", height: 26 }} />
      </div>
    </div>
  );
}

/* ================================================================
   STATUS DOT
================================================================ */
function StatusDot({ mod }) {
  return <span className={`mob-status-dot mob-status-dot--${mod}`} title={mod} />;
}

/* ================================================================
   MINI CARDS
================================================================ */
function MiniMatchCard({ match, userPred }) {
  const now       = new Date();
  const deadline  = match.deadline ? new Date(match.deadline) : null;
  const isExpired = deadline && now >= deadline;
  const isLive    = match.status === "live";
  const hasPred   = userPred !== undefined;
  const pillMod   = isLive ? "live" : isExpired ? "expired" : hasPred ? "saved" : "pending";
  const pillTxt   = isLive ? "VIVO" : isExpired ? "CERRADO" : hasPred ? "GUARDADO" : "PENDIENTE";

  return (
    <div className="mob-mcard">
      <div className="mob-mcard-head">
        <div className="mob-mcard-league">
          <div className="mob-mcard-dot">
            {match.league_logo_url
              ? <img src={match.league_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
              : "🏆"}
          </div>
          {(match.league || "").substring(0, 6).toUpperCase()}
        </div>
        <span className={`mob-pill mob-pill--${pillMod}`}>{pillTxt}</span>
      </div>
      <div className="mob-mcard-body">
        <div className="mob-mcard-team">
          <div className="mob-team-left">
            <div className="mob-shield">
              {match.home_team_logo_url
                ? <img src={match.home_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "⚽"}
            </div>
            <span className="mob-team-name">{(match.home_team || "").substring(0, 7)}</span>
          </div>
          <div className={`mob-score-box${hasPred ? "" : " empty"}`}>
            {hasPred ? (userPred.home_score ?? "—") : "—"}
          </div>
        </div>
        <div className="mob-sep" />
        <div className="mob-mcard-team">
          <div className="mob-team-left">
            <div className="mob-shield">
              {match.away_team_logo_url
                ? <img src={match.away_team_logo_url} alt="" onError={e => (e.target.style.display = "none")} />
                : "⚽"}
            </div>
            <span className="mob-team-name">{(match.away_team || "").substring(0, 7)}</span>
          </div>
          <div className={`mob-score-box${hasPred ? "" : " empty"}`}>
            {hasPred ? (userPred.away_score ?? "—") : "—"}
          </div>
        </div>
      </div>
      <div className="mob-mcard-foot">
        <span>{isLive ? `${match.minute || "??"}′` : (match.time || "—")}</span>
        <span>{match.date || "—"}</span>
      </div>
    </div>
  );
}

function MiniLeagueCard({ league, userPrediction }) {
  const now        = new Date();
  const deadline   = league.deadline ? new Date(league.deadline) : null;
  const isExpired  = deadline && now >= deadline;
  const isFinished = league.status === "finished";
  const hasPred    = userPrediction !== undefined;
  const dotMod     = isFinished ? "finished" : isExpired ? "expired" : hasPred ? "saved" : "pending";

  return (
    <div className="mob-lcard">
      <div className="mob-lcard-head">
        <div className="mob-lcard-logo">
          {league.logo_url
            ? <img src={league.logo_url} alt="" onError={e => (e.target.style.display = "none")} />
            : "🏆"}
        </div>
        <div className="mob-lcard-info">
          <div className="mob-lcard-name">{(league.name || "").toUpperCase()}</div>
          <div className="mob-lcard-season">{league.season || "—"}</div>
        </div>
        <div className="mob-lcard-status"><StatusDot mod={dotMod} /></div>
      </div>
      <div className="mob-lcard-body">
        <div className="mob-lcard-field">
          <div className="mob-lcard-lbl">CAMPEÓN</div>
          <div className={`mob-lcard-input${userPrediction?.predicted_champion ? " filled" : ""}`}>
            {userPrediction?.predicted_champion || "Escribe el equipo..."}
          </div>
        </div>
        <div className="mob-lcard-row">
          <div className="mob-lcard-field">
            <div className="mob-lcard-lbl">GOLEADOR</div>
            <div className={`mob-lcard-input${userPrediction?.predicted_top_scorer ? " filled" : ""}`}>
              {userPrediction?.predicted_top_scorer || "Jugador..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniAwardCard({ award, userPrediction }) {
  const now        = new Date();
  const deadline   = award.deadline ? new Date(award.deadline) : null;
  const isExpired  = deadline && now >= deadline;
  const isFinished = award.status === "finished";
  const hasPred    = userPrediction !== undefined;
  const dotMod     = isFinished ? "finished" : isExpired ? "expired" : hasPred ? "saved" : "pending";

  return (
    <div className="mob-acard">
      <div className="mob-acard-head">
        <div className="mob-lcard-logo">
          {award.logo_url && award.logo_url.startsWith("http")
            ? <img src={award.logo_url} alt="" onError={e => (e.target.style.display = "none")} />
            : (award.logo || "🏅")}
        </div>
        <div className="mob-lcard-info">
          <div className="mob-lcard-name">{(award.name || "").toUpperCase()}</div>
          <div className="mob-lcard-season">{award.season || "—"}</div>
        </div>
        <div className="mob-lcard-status"><StatusDot mod={dotMod} /></div>
      </div>
      <div className="mob-acard-body">
        <div className="mob-lcard-lbl">TU PREDICCIÓN</div>
        <div className={`mob-lcard-input${userPrediction?.predicted_winner ? " filled" : ""}`}>
          {userPrediction?.predicted_winner || "Ingresa el nombre..."}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MODALES
================================================================ */
function MobModal({ isOpen, onClose, title, count, children }) {
  if (!isOpen) return null;
  return (
    <div className="mob-modal-overlay" onClick={onClose}>
      <div className="mob-modal" onClick={e => e.stopPropagation()}>
        <div className="mob-modal-header">
          <div className="mob-modal-title">
            {title}
            <span className="mob-modal-title-accent">{count}</span>
          </div>
          <button className="mob-modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <div className="mob-modal-body">{children}</div>
      </div>
    </div>
  );
}

function MatchModal({ isOpen, onClose, pendingMatches, currentUser, onPredict }) {
  const [sortOpt,      setSortOpt]      = useState("date-asc");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [showFilter,   setShowFilter]   = useState(false);

  const processed = useMemo(() => {
    let list = [...pendingMatches];
    if (leagueFilter !== "all") {
      const cat = LEAGUE_CATS.find(c => c.id === leagueFilter);
      if (cat) list = list.filter(m => cat.leagues.some(l => m.league?.toLowerCase().includes(l.toLowerCase())));
    }
    list.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time || "00:00"}`);
      const db = new Date(`${b.date}T${b.time || "00:00"}`);
      return sortOpt === "date-asc" ? da - db : db - da;
    });
    return list;
  }, [pendingMatches, leagueFilter, sortOpt]);

  const grouped = useMemo(() => {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const groups   = {};
    processed.forEach(m => {
      const d     = new Date((m.date || "") + "T00:00:00");
      const label =
        d.getTime() === today.getTime()    ? "HOY" :
        d.getTime() === tomorrow.getTime() ? "MAÑANA" :
        d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
      if (!groups[label]) groups[label] = [];
      groups[label].push(m);
    });
    return groups;
  }, [processed]);

  const activeCat = LEAGUE_CATS.find(c => c.id === leagueFilter);

  if (!isOpen) return null;

  return (
    <div className="mob-modal-overlay" onClick={onClose}>
      <div className="mob-modal mob-modal--tall" onClick={e => e.stopPropagation()}>
        <div className="mob-modal-header">
          <div className="mob-modal-title">
            PARTIDOS
            <span className="mob-modal-title-accent">{processed.length}</span>
          </div>
          <button className="mob-modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="mob-modal-toolbar">
          <div className="mob-sort-group">
            <ArrowUpDown size={12} style={{ color: "var(--mob-muted)", flexShrink: 0 }} />
            {SORT_OPTS.map(opt => (
              <button
                key={opt.key}
                className={`mob-sort-btn${sortOpt === opt.key ? " active" : ""}`}
                onClick={() => setSortOpt(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            className={`mob-filter-btn${leagueFilter !== "all" ? " active" : ""}`}
            onClick={() => setShowFilter(true)}
          >
            <Filter size={13} />
            {leagueFilter !== "all"
              ? <span>{activeCat?.icon} {activeCat?.name}</span>
              : <span>Liga</span>}
          </button>
        </div>

        <div className="mob-modal-body">
          {processed.length === 0 ? (
            <EmptyState type="matches" />
          ) : (
            Object.entries(grouped).map(([label, group]) => (
              <div key={label} className="mob-modal-group">
                <div className="mob-modal-date-label"><span>{label}</span></div>
                <div className="mob-modal-cards">
                  {group.map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      userPred={m.predictions?.find(p => p.user_id === currentUser?.id)}
                      onPredict={onPredict}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showFilter && (
        <div className="mob-filter-panel-overlay" onClick={() => setShowFilter(false)}>
          <div className="mob-filter-panel" onClick={e => e.stopPropagation()}>
            <div className="mob-filter-panel-header">
              <div className="mob-filter-panel-title">
                <Filter size={13} />
                FILTRAR LIGA
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {leagueFilter !== "all" && (
                  <button className="mob-filter-panel-reset" onClick={() => { setLeagueFilter("all"); setShowFilter(false); }}>
                    RESET
                  </button>
                )}
                <button className="mob-modal-close" onClick={() => setShowFilter(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="mob-filter-panel-body">
              {LEAGUE_CATS.map(cat => (
                <button
                  key={cat.id}
                  className={`mob-filter-pill${leagueFilter === cat.id ? " active" : ""}`}
                  onClick={() => { setLeagueFilter(cat.id); setShowFilter(false); }}
                >
                  <span className="mob-filter-icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function MobileDashboard({
  currentUser,
  users        = [],
  matches      = [],
  leagues      = [],
  awards       = [],
  loading      = false,   // ← nueva prop opcional
  onPredict,
  onLeaguePredict,
  onAwardPredict,
}) {
  const [matchModal,   setMatchModal]   = useState(false);
  const [leagueModal,  setLeagueModal]  = useState(false);
  const [awardModal,   setAwardModal]   = useState(false);
  const [profileModal, setProfileModal] = useState(false);

  const pendingMatches = useMemo(() => matches.filter(m => m.status === "pending"), [matches]);

  const myPredCount = useMemo(
    () => matches.filter(m => m.predictions?.some(p => p.user_id === currentUser?.id)).length,
    [matches, currentUser]
  );

  const totalPredictable = matches.filter(m => m.status === "pending").length;
  const total            = Math.max(myPredCount, totalPredictable);
  const progressPct      = total > 0 ? Math.min(100, Math.round((myPredCount / total) * 100)) : 0;

  const previewMatches = pendingMatches.slice(0, 4);
  const previewLeagues = leagues.slice(0, 3);
  const previewAwards  = awards.slice(0, 3);

  return (
    <div className="mob-root">

      {/* PROGRESS */}
      <div className="mob-progress">
        <div className="mob-progress-row">
          <span className="mob-progress-lbl">PREDICCIONES TOTALES</span>
          <span className="mob-progress-count">{myPredCount} / {total}</span>
        </div>
        <div className="mob-progress-track">
          <div className="mob-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mob-quick">
        <div className="mob-qbtn" onClick={() => setMatchModal(true)}>
          <div className="mob-qbtn-icon"><Swords size={18} /></div>
          <div>
            <div className="mob-qbtn-txt">PARTIDOS</div>
            <div className="mob-qbtn-sub">{pendingMatches.length} pendientes</div>
          </div>
        </div>
        <div className="mob-qbtn" onClick={() => setLeagueModal(true)}>
          <div className="mob-qbtn-icon"><Trophy size={18} /></div>
          <div>
            <div className="mob-qbtn-txt">LIGAS</div>
            <div className="mob-qbtn-sub">{leagues.length} activas</div>
          </div>
        </div>
        <div className="mob-qbtn" onClick={() => setAwardModal(true)}>
          <div className="mob-qbtn-icon"><Medal size={18} /></div>
          <div>
            <div className="mob-qbtn-txt">PREMIOS</div>
            <div className="mob-qbtn-sub">{awards.length} activos</div>
          </div>
        </div>
        <div className="mob-qbtn" onClick={() => currentUser?.id && setProfileModal(true)}>
          <div className="mob-qbtn-icon"><User size={18} /></div>
          <div>
            <div className="mob-qbtn-txt">PERFIL</div>
            <div className="mob-qbtn-sub">Ver stats</div>
          </div>
        </div>
      </div>

      {/* ═══ PARTIDOS ═══ */}
      <div className="mob-sec">
        <span className="mob-sec-title">PARTIDOS</span>
        <span className="mob-sec-all" onClick={() => setMatchModal(true)}>TODOS »</span>
      </div>
      <div className="mob-scroll-wrap">
        <div className="mob-hscroll">
          {loading ? (
            /* Skeleton mientras carga */
            [0, 1, 2].map(i => <SkeletonMatchCard key={i} />)
          ) : previewMatches.length === 0 ? (
            <EmptyState type="matches" />
          ) : (
            <>
              {previewMatches.map(m => (
                <MiniMatchCard key={m.id} match={m} userPred={m.predictions?.find(p => p.user_id === currentUser?.id)} />
              ))}
              {pendingMatches.length > 4 && (
                <div className="mob-more-card" onClick={() => setMatchModal(true)}>
                  <span className="mob-more-sym">&raquo;</span>
                  <span>MÁS</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ LIGAS ═══ */}
      <div className="mob-sec">
        <span className="mob-sec-title">LIGAS</span>
        <span className="mob-sec-all" onClick={() => setLeagueModal(true)}>TODOS »</span>
      </div>
      <div className="mob-scroll-wrap">
        <div className="mob-hscroll">
          {loading ? (
            [0, 1].map(i => <SkeletonLeagueCard key={i} />)
          ) : previewLeagues.length === 0 ? (
            <EmptyState type="leagues" />
          ) : (
            <>
              {previewLeagues.map(l => (
                <MiniLeagueCard key={l.id} league={l} userPrediction={l.league_predictions?.find(p => p.user_id === currentUser?.id)} />
              ))}
              {leagues.length > 3 && (
                <div className="mob-more-card" onClick={() => setLeagueModal(true)}>
                  <span className="mob-more-sym">&raquo;</span>
                  <span>MÁS</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══ PREMIOS ═══ */}
      <div className="mob-sec">
        <span className="mob-sec-title">PREMIOS</span>
        <span className="mob-sec-all" onClick={() => setAwardModal(true)}>TODOS »</span>
      </div>
      <div className="mob-scroll-wrap">
        <div className="mob-hscroll">
          {loading ? (
            [0, 1].map(i => <SkeletonAwardCard key={i} />)
          ) : previewAwards.length === 0 ? (
            <EmptyState type="awards" />
          ) : (
            <>
              {previewAwards.map(a => (
                <MiniAwardCard key={a.id} award={a} userPrediction={a.award_predictions?.find(p => p.user_id === currentUser?.id)} />
              ))}
              {awards.length > 3 && (
                <div className="mob-more-card" onClick={() => setAwardModal(true)}>
                  <span className="mob-more-sym">&raquo;</span>
                  <span>MÁS</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODALES */}
      <MatchModal
        isOpen={matchModal}
        onClose={() => setMatchModal(false)}
        pendingMatches={pendingMatches}
        currentUser={currentUser}
        onPredict={onPredict}
      />

      <MobModal isOpen={leagueModal} onClose={() => setLeagueModal(false)} title="LIGAS" count={String(leagues.length)}>
        {leagues.length === 0
          ? <EmptyState type="leagues" />
          : leagues.map(l => (
              <LeagueCard key={l.id} league={l} userPrediction={l.league_predictions?.find(p => p.user_id === currentUser?.id)} onPredict={onLeaguePredict} />
            ))
        }
      </MobModal>

      <MobModal isOpen={awardModal} onClose={() => setAwardModal(false)} title="PREMIOS" count={String(awards.length)}>
        {awards.length === 0
          ? <EmptyState type="awards" />
          : awards.map(a => (
              <AwardCard key={a.id} award={a} userPrediction={a.award_predictions?.find(p => p.user_id === currentUser?.id)} onPredict={onAwardPredict} />
            ))
        }
      </MobModal>

      {profileModal && currentUser?.id && (
        <UserProfileModal userId={currentUser.id} onClose={() => setProfileModal(false)} />
      )}
    </div>
  );
}