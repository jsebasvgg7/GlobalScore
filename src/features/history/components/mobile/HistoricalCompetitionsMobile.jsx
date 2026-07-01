import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import {
  Trophy, Search, X, RefreshCw, AlertCircle,
  Globe, Languages, Calendar, Users, Flag, ArrowLeft, ArrowRight,
  ChevronRight, Shuffle, Info, LayoutGrid, TableProperties, GitMerge,
} from "lucide-react";
import {
  useHistoricalCompetitions,
  useHistoricalCompetitionDetail,
  getHistoricalImageUrl,
} from "../../hooks/useHistoricalCompetitions";
import KnockoutBracketMobile from "./KnockoutBracketMobile";
import "../../styles/mobile/HistoricalCompetitionsPageMobile.css";
import "../../styles/mobile/HistoricalCompetitionsPageMobile.dark.css";

/* ── constantes (idénticas a history_competitions_shared.dart) ──── */
const TYPE_LABEL = {
  International: "INTERNACIONAL",
  Continental: "CONTINENTAL",
  Domestic: "NACIONAL",
};
const FORMAT_LABEL = {
  groups_knockout: "Grupos + Elim.",
  league_only: "Liga",
  knockout_only: "Eliminatorias",
};
const TYPE_COLOR = {
  International: "var(--hcm-type-international)",
  Continental: "var(--hcm-type-continental)",
  Domestic: "var(--hcm-type-domestic)",
};

const typeColor = (t) => TYPE_COLOR[t] || "var(--hcm-muted)";
const typeLabel = (t) => TYPE_LABEL[t] || t || "";

const gd = (f, c) => {
  const d = (f || 0) - (c || 0);
  return d > 0 ? `+${d}` : String(d);
};
const played = (row) => (row.wins || 0) + (row.draws || 0) + (row.losses || 0);

/* ══════════════════════════════════════════════════════════════
   DOT GRID
══════════════════════════════════════════════════════════════ */
function DotGrid({ cols = 5, rows = 4 }) {
  return (
    <div className="hcm-header-dotgrid" style={{ gridTemplateColumns: `repeat(${cols}, 11px)` }} aria-hidden="true">
      {Array.from({ length: cols * rows }, (_, i) => <span key={i} />)}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BADGE
══════════════════════════════════════════════════════════════ */
function CompBadge({ label, bg, fg = "#fff" }) {
  return (
    <span className="hcm-card-type-badge" style={{ background: bg, color: fg }}>
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEADER — fiel a _CompHeader
══════════════════════════════════════════════════════════════ */
function CompHeader({ onBack }) {
  return (
    <header className="hcm-header">
      <DotGrid cols={5} rows={4} />
      <div className="hcm-header-row">
        <button className="hcm-back-btn" onClick={onBack}>
          <ArrowLeft size={11} />
          <span>HISTÓRICO</span>
        </button>
        <span className="hcm-header-badge">COMPETICIONES</span>
      </div>
      <div className="hcm-title-row">
        <span className="hcm-title-bar" />
        <div>
          <h1 className="hcm-title">COMPETICIONES</h1>
          <p className="hcm-subtitle">Torneos que definieron una era.</p>
        </div>
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATS STRIP — fiel a _StatsStrip
══════════════════════════════════════════════════════════════ */
function StatsStrip({ total, intl, continental }) {
  return (
    <div className="hcm-stats">
      <div className="hcm-stat-cell hcm-stat-cell--purple">
        <div className="hcm-stat-icon"><Trophy size={15} /></div>
        <div className="hcm-stat-body">
          <span className="hcm-stat-num">{total}</span>
          <span className="hcm-stat-label">TORNEOS</span>
        </div>
      </div>
      <div className="hcm-stat-cell hcm-stat-cell--gold">
        <div className="hcm-stat-icon"><Globe size={15} /></div>
        <div className="hcm-stat-body">
          <span className="hcm-stat-num">{intl}</span>
          <span className="hcm-stat-label">INTER'L</span>
        </div>
      </div>
      <div className="hcm-stat-cell hcm-stat-cell--green">
        <div className="hcm-stat-icon"><Languages size={15} /></div>
        <div className="hcm-stat-body">
          <span className="hcm-stat-num">{continental}</span>
          <span className="hcm-stat-label">CONTIN.</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SEARCH BAR — fiel a _SearchBar
══════════════════════════════════════════════════════════════ */
function SearchBar({ value, onChange, onClear, onRandom, disabled }) {
  return (
    <div className="hcm-toolbar">
      <div className="hcm-search-box">
        <Search size={16} className="hcm-search-ico" />
        <input
          className="hcm-search-input"
          placeholder="Buscar competición…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="hcm-search-clear" onClick={onClear} aria-label="Limpiar">
            <X size={14} />
          </button>
        )}
      </div>
      <button
        className="hcm-shuffle-btn"
        onClick={onRandom}
        disabled={disabled}
        aria-label="Competición aleatoria"
      >
        <Shuffle size={16} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COUNTER ROW — fiel a _CounterRow
══════════════════════════════════════════════════════════════ */
function CounterRow({ count }) {
  return (
    <div className="hcm-counter-row">
      <span className="hcm-counter-bar" />
      <span className="hcm-counter-label">COMPETICIONES</span>
      <span className="hcm-counter-badge">{count} ENCONTRADAS</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMP CARD — fiel a CompCard (logo 1:1 90px, stripe, hard shadow)
══════════════════════════════════════════════════════════════ */
function CompCard({ comp, index, onClick }) {
  const imgUrl = getHistoricalImageUrl(comp.image_path);
  const winner = comp.historical_teams?.name || comp.winner_text || null;
  const tc = typeColor(comp.type);

  return (
    <button
      className="hcm-card"
      style={{ "--i": index, animationDelay: `${Math.min(index * 35, 500)}ms` }}
      onClick={() => onClick(comp)}
    >
      <span className="hcm-card-stripe" style={{ background: tc }} />
      <div className="hcm-card-logo">
        {imgUrl
          ? <img src={imgUrl} alt={comp.name} />
          : <Trophy size={36} color={tc} />}
      </div>
      <div className="hcm-card-body">
        <div className="hcm-card-tags">
          {comp.type && <CompBadge label={typeLabel(comp.type)} bg={tc} />}
          {comp.format && (
            <span className="hcm-card-fmt">{FORMAT_LABEL[comp.format] || comp.format}</span>
          )}
        </div>
        <span className="hcm-card-name">{comp.name}</span>
        <div className="hcm-card-meta">
          {comp.year && <span className="hcm-card-year">{comp.year}</span>}
          {comp.country && <><span className="hcm-sep">·</span><span>{comp.country}</span></>}
        </div>
        {winner && (
          <div className="hcm-card-winner">
            <Trophy size={10} />
            <span>{winner.toUpperCase()}</span>
          </div>
        )}
      </div>
      <ChevronRight size={18} className="hcm-card-chevron" />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: INFO — fiel a comp_tab_info.dart
══════════════════════════════════════════════════════════════ */
function TabInfo({ competition }) {
  const imgUrl = getHistoricalImageUrl(competition.image_path);
  const tc = typeColor(competition.type);
  const winner = competition.historical_teams?.name || competition.winner_text || null;

  const metaItems = [
    competition.year && { icon: <Calendar size={14} />, label: "AÑO", value: competition.year, color: "var(--hcm-purple)" },
    competition.country && { icon: <Globe size={14} />, label: "SEDE", value: competition.country, color: "var(--hcm-muted)" },
    competition.type && { icon: <Flag size={14} />, label: "TIPO", value: typeLabel(competition.type), color: tc },
    competition.num_teams && { icon: <Users size={14} />, label: "EQUIPOS", value: competition.num_teams, color: "var(--hcm-green)" },
  ].filter(Boolean);

  return (
    <div className="hcm-tab-pane hcm-tab-pane--info">
      {/* hero card */}
      <div className="hcm-hero-card">
        <div className="hcm-hero-stripe" style={{ background: tc }} />
        <div className="hcm-hero-row">
          <div className="hcm-hero-logo">
            {imgUrl ? <img src={imgUrl} alt={competition.name} /> : <Trophy size={30} color={tc} />}
          </div>
          <div className="hcm-hero-body">
            <div className="hcm-hero-tags">
              {competition.type && <CompBadge label={typeLabel(competition.type)} bg={tc} />}
              {competition.format && (
                <span className="hcm-card-fmt">{FORMAT_LABEL[competition.format] || competition.format}</span>
              )}
            </div>
            <h1 className="hcm-hero-name">{competition.name}</h1>
            {(competition.year || competition.country) && (
              <span className="hcm-hero-meta">
                {[competition.year, competition.country].filter(Boolean).join(" · ")}
              </span>
            )}
            {winner && (
              <div className="hcm-hero-winner">
                <Trophy size={12} />
                <span>{winner}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* meta grid */}
      {metaItems.length > 0 && (
        <div className="hcm-meta-grid">
          {metaItems.map((item, i) => (
            <div className="hcm-meta-item" key={i}>
              <div className="hcm-meta-icon" style={{ background: item.color }}>{item.icon}</div>
              <div className="hcm-meta-body">
                <span className="hcm-meta-label">{item.label}</span>
                <span className="hcm-meta-value" style={{ color: item.color }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* contexto histórico */}
      {competition.description && (
        <>
          <div className="hcm-section-header">
            <span className="hcm-section-header-dot" style={{ background: "var(--hcm-purple)" }} />
            <Globe size={12} color="var(--hcm-purple)" />
            <span className="hcm-section-header-label" style={{ color: "var(--hcm-purple)" }}>CONTEXTO HISTÓRICO</span>
          </div>
          <div className="hcm-desc-box">
            <p>{competition.description}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: GRUPOS — fiel a comp_tab_grupos.dart
══════════════════════════════════════════════════════════════ */
function GroupTable({ name, rows }) {
  return (
    <div className="hcm-group-table">
      <div className="hcm-group-header"><span>GRUPO {name}</span></div>
      <div className="hcm-col-headers">
        <span className="hcm-col-pos" />
        <span className="hcm-col-team hcm-th">EQUIPO</span>
        {["PJ", "G", "E", "P", "GF", "GC", "DG", "PTS"].map((h) => (
          <span key={h} className="hcm-col-num hcm-th">{h}</span>
        ))}
      </div>
      {rows.map((row, i) => {
        const adv = i < 2;
        return (
          <div key={row.id || i} className={`hcm-row ${adv ? "hcm-row--adv" : ""}`}>
            <span className="hcm-col-pos">
              {adv ? <span className="hcm-row-pos-dot" /> : <span className="hcm-row-pos-num">{row.position || i + 1}</span>}
            </span>
            <span className={`hcm-col-team hcm-row-team ${adv ? "hcm-row-team--strong" : ""}`}>{row.team_name}</span>
            {[played(row), row.wins, row.draws, row.losses, row.goals_for, row.goals_against].map((v, j) => (
              <span key={j} className="hcm-col-num hcm-td">{v ?? "–"}</span>
            ))}
            <span className="hcm-col-num hcm-td">{gd(row.goals_for, row.goals_against)}</span>
            <span className={`hcm-col-num hcm-td ${adv ? "hcm-td--pts-champion" : "hcm-td--pts"}`}>{row.points ?? "–"}</span>
          </div>
        );
      })}
    </div>
  );
}

function TabGrupos({ groupedGroups }) {
  const entries = Object.entries(groupedGroups);
  return (
    <div className="hcm-tab-pane hcm-tab-pane--grupos">
      {entries.map(([name, rows]) => (
        <GroupTable key={name} name={name} rows={rows} />
      ))}
      <div className="hcm-legend">
        <span className="hcm-legend-dot" />
        <span>Clasificado · PJ=Partidos · DG=Diferencia de goles</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: STANDINGS — fiel a comp_tab_standings.dart
══════════════════════════════════════════════════════════════ */
function TabStandings({ standings }) {
  return (
    <div className="hcm-tab-pane hcm-tab-pane--standings">
      <div className="hcm-standings-wrap">
        <div className="hcm-col-headers">
          <span className="hcm-col-pos hcm-th" style={{ textAlign: "center" }}>#</span>
          <span className="hcm-col-team hcm-th">EQUIPO</span>
          {["PJ", "G", "E", "P", "GF", "GC", "DG", "PTS"].map((h) => (
            <span key={h} className="hcm-col-num hcm-th">{h}</span>
          ))}
        </div>
        {standings.map((row) => (
          <div key={row.id || row.position} className={`hcm-row ${row.champion ? "hcm-row--champion" : ""}`}>
            <span className="hcm-col-pos" style={{ textAlign: "center" }}>
              {row.champion ? <Trophy size={12} color="var(--hcm-gold)" style={{ display: "inline" }} /> : <span className="hcm-row-pos-num">{row.position}</span>}
            </span>
            <span className={`hcm-col-team hcm-row-team ${row.champion ? "hcm-row-team--strong" : ""}`}>
              {row.team_name}
              {row.champion && <span className="hcm-champion-tag">CAM</span>}
            </span>
            {[played(row), row.wins, row.draws, row.losses, row.goals_for, row.goals_against].map((v, j) => (
              <span key={j} className="hcm-col-num hcm-td">{v ?? "–"}</span>
            ))}
            <span className="hcm-col-num hcm-td">{gd(row.goals_for, row.goals_against)}</span>
            <span className={`hcm-col-num hcm-td ${row.champion ? "hcm-td--pts-champion" : "hcm-td--pts"}`}>{row.points ?? "–"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB: KNOCKOUT — fiel a comp_tab_knockout.dart
══════════════════════════════════════════════════════════════ */
function TabKnockout({ knockout }) {
  if (!knockout || knockout.length === 0) {
    return <div className="hcm-knockout-empty">Sin partidos registrados.</div>;
  }
  return (
    <div className="hcm-tab-pane hcm-tab-pane--knockout">
      <KnockoutBracketMobile knockout={knockout} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETALLE — top bar
══════════════════════════════════════════════════════════════ */
function DetailTopBar({ competition, onBack }) {
  const tc = typeColor(competition.type);
  return (
    <div className="hcm-detail-topbar">
      <button className="hcm-detail-back" onClick={onBack}>
        <ArrowLeft size={16} />
      </button>
      <div className="hcm-detail-titles">
        <span className="hcm-detail-breadcrumb">HISTÓRICO › COMPETICIONES</span>
        <span className="hcm-detail-title">{competition.name.toUpperCase()}</span>
      </div>
      {competition.type && (
        <span className="hcm-detail-type-badge" style={{ background: tc }}>
          {typeLabel(competition.type)}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETALLE — bottom tab bar (fondo negro sólido en activo)
══════════════════════════════════════════════════════════════ */
function DetailTabBar({ tabs, current, onTap }) {
  if (tabs.length < 2) return null;
  return (
    <nav className="hcm-detail-navbar">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`hcm-detail-nav-btn ${current === key ? "hcm-detail-nav-btn--active" : ""}`}
          onClick={() => onTap(key)}
        >
          <Icon size={18} />
          <span className="hcm-detail-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETALLE — shell
══════════════════════════════════════════════════════════════ */
function CompetitionDetail({ competitionId, onBack }) {
  const { competition, groupedGroups, standings, knockout, loading, error, reload } =
    useHistoricalCompetitionDetail(competitionId);
  const [tab, setTab] = useState("info");

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ocultar bottom nav nativo de la app mientras se ve el detalle
  useEffect(() => {
    const root = document.body;
    root.classList.add("hcm-hide-bottom-nav");
    return () => root.classList.remove("hcm-hide-bottom-nav");
  }, []);

  if (loading) {
    return (
      <div className="hcm-detail">
        <div className="hcm-state hcm-state--loading">
          <RefreshCw size={16} className="hcm-spin" />
          <span>Cargando competición…</span>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="hcm-detail">
        <div className="hcm-state hcm-state--error">
          <AlertCircle size={18} />
          <p>{error || "No encontrado"}</p>
          <button className="hcm-retry-btn" onClick={reload}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  const hasGroups = Object.keys(groupedGroups).length > 0;
  const hasStandings = standings.length > 0 && !hasGroups;
  const hasKnockout = knockout.length > 0;

  const tabs = [
    { key: "info", label: "INFO", Icon: Info },
    hasGroups && { key: "grupos", label: "GRUPOS", Icon: LayoutGrid },
    hasStandings && { key: "standings", label: "TABLA", Icon: TableProperties },
    hasKnockout && { key: "knockout", label: "LLAVE", Icon: GitMerge },
  ].filter(Boolean);

  return (
    <div className="hcm-detail">
      <DetailTopBar competition={competition} onBack={onBack} />
      <div className="hcm-detail-content">
        {tab === "info" && <TabInfo competition={competition} />}
        {tab === "grupos" && hasGroups && <TabGrupos groupedGroups={groupedGroups} />}
        {tab === "standings" && hasStandings && <TabStandings standings={standings} />}
        {tab === "knockout" && hasKnockout && <TabKnockout knockout={knockout} />}
      </div>
      <DetailTabBar tabs={tabs} current={tab} onTap={setTab} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODAL ALEATORIO — fiel a _RandomModal / _RandomSlot
══════════════════════════════════════════════════════════════ */
function RandomSlot({ comp, done }) {
  const imgUrl = getHistoricalImageUrl(comp.image_path);
  const tc = typeColor(comp.type);
  return (
    <div className={`hcm-modal-slot ${done ? "hcm-modal-slot--done" : ""}`}>
      <div className="hcm-modal-slot-logo">
        {imgUrl ? <img src={imgUrl} alt={comp.name} /> : <Trophy size={32} color={tc} />}
      </div>
      <div className="hcm-modal-slot-info">
        {comp.type && <CompBadge label={typeLabel(comp.type)} bg={tc} />}
        <span className="hcm-modal-slot-name">{comp.name}</span>
        {(comp.year || comp.country) && (
          <span className="hcm-modal-slot-meta">
            {[comp.year, comp.country].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
      {done && <ArrowRight size={18} className="hcm-modal-slot-arrow" />}
    </div>
  );
}

function RandomModal({ competitions, onClose, onSelect }) {
  const [current, setCurrent] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const winner = useRef(null);
  const ivRef = useRef(null);
  const toRef = useRef(null);

  const start = () => {
    if (competitions.length === 0) return;
    winner.current = competitions[Math.floor(Math.random() * competitions.length)];
    setRunning(true);
    setDone(false);
    setCurrent(competitions[Math.floor(Math.random() * competitions.length)]);

    if (ivRef.current) clearInterval(ivRef.current);
    ivRef.current = setInterval(() => {
      setCurrent(competitions[Math.floor(Math.random() * competitions.length)]);
    }, 80);

    if (toRef.current) clearTimeout(toRef.current);
    toRef.current = setTimeout(() => {
      clearInterval(ivRef.current);
      setRunning(false);
      setDone(true);
      setCurrent(winner.current);
    }, 2400);
  };

  useEffect(() => () => {
    clearInterval(ivRef.current);
    clearTimeout(toRef.current);
  }, []);

  return (
    <div className="hcm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hcm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hcm-modal-handle" />
        <div className="hcm-modal-title-row">
          <span className="hcm-modal-title-bar" />
          <span className="hcm-modal-title">COMPETICIÓN ALEATORIA</span>
        </div>

        {current && <RandomSlot comp={current} done={done} />}

        {!running && !done && (
          <button className="hcm-modal-btn hcm-modal-btn--spin" onClick={start}>
            <Shuffle size={14} />
            <span>GIRAR</span>
          </button>
        )}

        {running && (
          <div className="hcm-modal-spinning">GIRANDO…</div>
        )}

        {done && !running && (
          <>
            <button
              className="hcm-modal-btn hcm-modal-btn--go"
              onClick={() => { onSelect(winner.current); onClose(); }}
            >
              <ArrowRight size={14} />
              <span>VER COMPETICIÓN</span>
            </button>
            <button
              className="hcm-modal-btn hcm-modal-btn--again"
              onClick={() => { setDone(false); setCurrent(null); }}
            >
              <RefreshCw size={14} />
              <span>GIRAR DE NUEVO</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
export default function HistoricalCompetitionsMobile({ onBack, initialSelectedId }) {
  const {
    competitions, loading, error, reload,
    search, setSearch,
  } = useHistoricalCompetitions();

  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const [showRandom, setShowRandom] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => { setSelectedId(initialSelectedId || null); }, [initialSelectedId]);

  const totalTorneos = competitions.length;
  const totalIntl = useMemo(() => competitions.filter((c) => c.type === "International").length, [competitions]);
  const totalCont = useMemo(() => competitions.filter((c) => c.type === "Continental").length, [competitions]);

  if (selectedId) {
    return (
      <div className="hcm-root hcm-root--detail-shell">
        <CompetitionDetail
          competitionId={selectedId}
          onBack={() => {
            if (initialSelectedId) { onBack?.(); return; }
            setSelectedId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="hcm-root">
      <CompHeader onBack={onBack} />

      <StatsStrip total={totalTorneos} intl={totalIntl} continental={totalCont} />

      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
        onRandom={() => setShowRandom(true)}
        disabled={competitions.length === 0}
      />

      {!loading && !error && <CounterRow count={competitions.length} />}

      {loading && (
        <div className="hcm-state hcm-state--loading">
          <RefreshCw size={15} className="hcm-spin" />
          <span>Cargando…</span>
        </div>
      )}

      {!loading && error && (
        <div className="hcm-state hcm-state--error">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button className="hcm-retry-btn" onClick={reload}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && competitions.length === 0 && (
        <div className="hcm-state hcm-state--empty">
          <Trophy size={42} color="var(--hcm-border-l)" strokeWidth={1} />
          <p>SIN RESULTADOS</p>
        </div>
      )}

      {!loading && !error && competitions.length > 0 && (
        <div className="hcm-list">
          {competitions.map((comp, i) => (
            <CompCard key={comp.id} comp={comp} index={i} onClick={(c) => setSelectedId(c.id)} />
          ))}
        </div>
      )}

      {showRandom && (
        <RandomModal
          competitions={competitions}
          onClose={() => setShowRandom(false)}
          onSelect={(c) => setSelectedId(c.id)}
        />
      )}
    </div>
  );
}