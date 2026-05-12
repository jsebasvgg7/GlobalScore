import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Filter, ArrowUpDown, X, SlidersHorizontal } from "lucide-react";
import { MatchCardMobile, LeagueCardMobile, AwardCardMobile } from '@/features/dashboard';
import "./MobileCardsGlobal.css";
import "./MobileSubPage.css";

// ── Categorías de liga ──────────────────────────────────────────
const LEAGUE_CATS = [
  { id: "all", name: "Todos", icon: "🌍", leagues: [] },
  { id: "europe", name: "Europa", icon: "🏆", leagues: ["Champions League", "Europa League", "Conference League"] },
  { id: "england", name: "Inglaterra", icon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", leagues: ["Premier League", "Championship", "FA Cup", "EFL Cup"] },
  { id: "spain", name: "España", icon: "🇪🇸", leagues: ["La Liga", "Copa del Rey", "Supercopa"] },
  { id: "italy", name: "Italia", icon: "🇮🇹", leagues: ["Serie A", "Coppa Italia", "Supercoppa"] },
  { id: "germany", name: "Alemania", icon: "🇩🇪", leagues: ["Bundesliga", "DFB Pokal"] },
  { id: "france", name: "Francia", icon: "🇫🇷", leagues: ["Ligue 1", "Coupe de France", "Coupe de la Ligue"] },
  { id: "southamerica", name: "Sudamérica", icon: "🌎", leagues: ["Copa Libertadores", "Copa Sudamericana"] },
];

const SORT_OPTS = [
  { key: "date-asc", label: "Más próximos" },
  { key: "date-desc", label: "Más lejanos" },
];

// ── Empty state ─────────────────────────────────────────────────
function EmptyState({ label = "Sin elementos disponibles" }) {
  return (
    <div className="msp-empty">
      <div className="msp-empty-box">
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="42" height="42" stroke="currentColor" strokeWidth="0.5" />
          <rect x="8" y="8" width="28" height="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="1" y1="22" x2="43" y2="22" stroke="currentColor" strokeWidth="0.5" />
          <line x1="22" y1="1" x2="22" y2="43" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="22" cy="22" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </div>
      <span className="msp-empty-lbl">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PÁGINA DE PARTIDOS
// ═══════════════════════════════════════════════════════════════
function MatchesPage({ matches, currentUser, onPredict, onBack }) {
  const [sort, setSort] = useState("date-asc");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    let list = [...matches];
    if (leagueFilter !== "all") {
      const cat = LEAGUE_CATS.find(c => c.id === leagueFilter);
      if (cat) list = list.filter(m =>
        cat.leagues.some(l => m.league?.toLowerCase().includes(l.toLowerCase()))
      );
    }
    list.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time || "00:00"}`);
      const db = new Date(`${b.date}T${b.time || "00:00"}`);
      return sort === "date-asc" ? da - db : db - da;
    });
    return list;
  }, [matches, leagueFilter, sort]);

  const grouped = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const g = {};
    filtered.forEach(m => {
      const d = new Date(`${m.date}T00:00:00`);
      const label =
        d.getTime() === today.getTime() ? "HOY" :
          d.getTime() === tomorrow.getTime() ? "MAÑANA" :
            d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
      if (!g[label]) g[label] = [];
      g[label].push(m);
    });
    return g;
  }, [filtered]);

  const activeCat = LEAGUE_CATS.find(c => c.id === leagueFilter);

  return (
    <div className="msp-page">

      {/* ── TOP BAR ── */}
      <div className="msp-topbar">
        <button className="msp-back" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div className="msp-topbar-center">
          <span className="msp-topbar-title">PARTIDOS</span>
          <span className="msp-topbar-count">{filtered.length}</span>
        </div>
        <button
          className={`msp-filter-toggle${leagueFilter !== "all" ? " active" : ""}`}
          onClick={() => setShowFilter(true)}
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* ── SORT PILLS ── */}
      <div className="msp-sort-row">
        <ArrowUpDown size={11} className="msp-sort-icon" />
        {SORT_OPTS.map(o => (
          <button
            key={o.key}
            className={`msp-sort-pill${sort === o.key ? " active" : ""}`}
            onClick={() => setSort(o.key)}
          >
            {o.label}
          </button>
        ))}
        {leagueFilter !== "all" && (
          <span className="msp-active-chip">
            {activeCat?.icon} {activeCat?.name}
            <button onClick={() => setLeagueFilter("all")}><X size={9} /></button>
          </span>
        )}
      </div>

      {/* ── CONTENIDO ── */}
      <div className="msp-body">
        {filtered.length === 0 ? (
          <EmptyState label="Sin partidos disponibles" />
        ) : (
          Object.entries(grouped).map(([label, group], gi) => (
            <div key={label} className="msp-group">
              <div className={`msp-date-label${gi === 0 ? " first" : ""}`}>
                <div className="msp-date-line" />
                <span>{label}</span>
                <div className="msp-date-line" />
              </div>
              <div className="msp-cards-col">
                {group.map(m => (
                  <MatchCardMobile
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

      {/* ── PANEL FILTRO (lateral) ── */}
      {showFilter && (
        <div className="msp-filter-overlay" onClick={() => setShowFilter(false)}>
          <div className="msp-filter-panel" onClick={e => e.stopPropagation()}>
            <div className="msp-filter-hdr">
              <span className="msp-filter-hdr-title">
                <Filter size={12} /> FILTRAR LIGA
              </span>
              <div className="msp-filter-hdr-actions">
                {leagueFilter !== "all" && (
                  <button className="msp-filter-reset" onClick={() => { setLeagueFilter("all"); setShowFilter(false); }}>
                    RESET
                  </button>
                )}
                <button className="msp-filter-close" onClick={() => setShowFilter(false)}>
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="msp-filter-body">
              {LEAGUE_CATS.map(cat => (
                <button
                  key={cat.id}
                  className={`msp-filter-item${leagueFilter === cat.id ? " active" : ""}`}
                  onClick={() => { setLeagueFilter(cat.id); setShowFilter(false); }}
                >
                  <span className="msp-filter-item-icon">{cat.icon}</span>
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

// ═══════════════════════════════════════════════════════════════
//  PÁGINA DE LIGAS
// ═══════════════════════════════════════════════════════════════
function LeaguesPage({ leagues, currentUser, onPredict, onBack }) {
  return (
    <div className="msp-page">
      <div className="msp-topbar">
        <button className="msp-back" onClick={onBack}><ArrowLeft size={16} /></button>
        <div className="msp-topbar-center">
          <span className="msp-topbar-title">LIGAS</span>
          <span className="msp-topbar-count">{leagues.length}</span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div className="msp-season-label">
        <div className="msp-date-line" />
        <span>TEMPORADA 2025 · 2026</span>
        <div className="msp-date-line" />
      </div>

      <div className="msp-body">
        {leagues.length === 0 ? (
          <EmptyState label="Sin ligas activas" />
        ) : (
          <div className="msp-cards-col">
            {leagues.map(l => (
              <LeagueCardMobile
                key={l.id}
                league={l}
                userPrediction={l.league_predictions?.find(p => p.user_id === currentUser?.id)}
                onPredict={onPredict}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PÁGINA DE PREMIOS
// ═══════════════════════════════════════════════════════════════
function AwardsPage({ awards, currentUser, onPredict, onBack }) {
  return (
    <div className="msp-page">
      <div className="msp-topbar">
        <button className="msp-back" onClick={onBack}><ArrowLeft size={16} /></button>
        <div className="msp-topbar-center">
          <span className="msp-topbar-title">PREMIOS</span>
          <span className="msp-topbar-count">{awards.length}</span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div className="msp-season-label">
        <div className="msp-date-line" />
        <span>TEMPORADA 2025 · 2026</span>
        <div className="msp-date-line" />
      </div>

      <div className="msp-body">
        {awards.length === 0 ? (
          <EmptyState label="Sin premios activos" />
        ) : (
          <div className="msp-cards-col">
            {awards.map(a => (
              <AwardCardMobile
                key={a.id}
                award={a}
                userPrediction={a.award_predictions?.find(p => p.user_id === currentUser?.id)}
                onPredict={onPredict}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT PRINCIPAL — selector de página
// ═══════════════════════════════════════════════════════════════
export default function MobileSubPage({
  page,
  matches = [],
  leagues = [],
  awards = [],
  currentUser,
  onPredict,
  onLeaguePredict,
  onAwardPredict,
  onBack,
}) {
  // Bloquear scroll del body mientras la sub-página esté abierta
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const pendingMatches = useMemo(
    () => matches.filter(m => !m.isClosedForPrediction),
    [matches]
  );

  if (page === "matches") return (
    <MatchesPage
      matches={matches}
      currentUser={currentUser}
      onPredict={onPredict}
      onBack={onBack}
    />
  );

  if (page === "leagues") return (
    <LeaguesPage
      leagues={leagues}
      currentUser={currentUser}
      onPredict={onLeaguePredict}
      onBack={onBack}
    />
  );

  if (page === "awards") return (
    <AwardsPage
      awards={awards}
      currentUser={currentUser}
      onPredict={onAwardPredict}
      onBack={onBack}
    />
  );

  return null;
}