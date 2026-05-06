import { useState, useMemo, useRef, useEffect } from "react";
import { Users2, Trophy, Shield, Zap, Search, X, ChevronRight, Filter, Star, } from "lucide-react";
import { useHistoricalPlayers, getHistoricalImageUrl } from "../../hooks/HooksHistory/useHistoricalPlayers";
import { useHistoricalCompetitions } from "../../hooks/HooksHistory/useHistoricalCompetitions";
import { useHistoricalTeams } from "../../hooks/HooksHistory/useHistoricalTeams";
import { useHistoricalEvents } from "../../hooks/HooksHistory/useHistoricalEvents";
import Footer from '../../components/ComLayout/Footer';
import "../../styles/StylesMobile/HistoryMenuMobile.css";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 16, round = false }) {
  return (
    <span
      className="hmm-skel"
      style={{ width: w, height: h, borderRadius: round ? "50%" : 3, display: "block" }}
    />
  );
}

// ─── Tema activo (lee del DOM) ────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.dataset.style || "default";
  });
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.style || "default");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-style"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: "players", label: "Jug", icon: Users2 },
  { key: "teams", label: "Equi", icon: Shield },
  { key: "events", label: "Eve", icon: Zap },
  { key: "competitions", label: "Coms", icon: Trophy },
];

const LEGACY_COLOR = {
  Dynastic: "#f59e0b", Innovative: "#8b5cf6",
  Continental: "#3b82f6", National: "#10b981",
};
const SECTION_FILTERS = {
  players: [
    {
      key: "position", label: "Posición", options: [
        { value: "Forward", label: "Delantero" },
        { value: "Midfielder", label: "Centrocampista" },
        { value: "Defender", label: "Defensor" },
        { value: "Goalkeeper", label: "Portero" },
        { value: "All-rounder", label: "Todocampista" },
      ]
    },
    {
      key: "legacy_type", label: "Legado", options: [
        { value: "Goal Scorer", label: "Goleador" },
        { value: "Tactician", label: "Táctico" },
        { value: "Innovator", label: "Genio" },
        { value: "Leader", label: "Líder" },
        { value: "Goalkeeper", label: "Portero" },
      ]
    },
    {
      key: "significance_level", label: "Nivel", options: [
        { value: "5", label: "GOAT" },
        { value: "4", label: "Leyenda" },
        { value: "3", label: "De Culto" },
      ]
    },
  ],
  teams: [
    {
      key: "legacy_type", label: "Tipo", options: [
        { value: "Dynastic", label: "Dinástico" },
        { value: "Innovative", label: "Innovador" },
        { value: "Continental", label: "Continental" },
        { value: "National", label: "Nacional" },
      ]
    },
  ],
  events: [
    {
      key: "event_category", label: "Categoría", options: [
        { value: "player", label: "Jugador" },
        { value: "team", label: "Equipo" },
      ]
    },
    {
      key: "event_type", label: "Tipo", options: [
        { value: "Championship", label: "Campeonato" },
        { value: "Historic Match", label: "Partido Histórico" },
        { value: "Legendary Performance", label: "Actuación Legendaria" },
        { value: "Era Defining", label: "Definió una Era" },
        { value: "Record", label: "Récord" },
      ]
    },
  ],
  competitions: [
    {
      key: "type", label: "Tipo", options: [
        { value: "International", label: "Internacional" },
        { value: "Continental", label: "Continental" },
        { value: "Domestic", label: "Nacional" },
      ]
    },
    {
      key: "format", label: "Formato", options: [
        { value: "groups_knockout", label: "Grupos + Elim." },
        { value: "league_only", label: "Liga" },
        { value: "knockout_only", label: "Eliminatorias" },
      ]
    },
  ],
};
const POSITION_LABEL = {
  Forward: "Delantero", Midfielder: "Centrocampista",
  "All-rounder": "Todocampista", Defender: "Defensor", Goalkeeper: "Portero",
};

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header({ totalCounts }) {
  return (
    <div className="hmm-header">
      <div className="hmm-header-bg" aria-hidden="true" />
      <div className="hmm-header-inner">
        <div className="hmm-eyebrow">
          <span className="hmm-eyebrow-line" />
          <span className="hmm-eyebrow-text">Archivo Histórico</span>
          <span className="hmm-eyebrow-line" />
        </div>
        <h1 className="hmm-title">
          <span className="hmm-title-solid">BÓVEDA</span>
          <span className="hmm-title-outline">HISTÓRICA</span>
        </h1>
        <p className="hmm-subtitle">
          {totalCounts} registros del fútbol mundial
        </p>
      </div>
    </div>
  );
}

// ─── BUSCADOR GLOBAL ─────────────────────────────────────────────────────────
function GlobalSearch({ query, onChange, onClear, resultCount, searching }) {
  const inputRef = useRef(null);
  return (
    <div className="hmm-search-wrap">
      <div className={`hmm-search-box ${query ? "hmm-search-box--active" : ""}`}>
        <Search size={15} className="hmm-search-icon" />
        <input
          ref={inputRef}
          className="hmm-search-input"
          placeholder="Buscar jugador, equipo, momento..."
          value={query}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button className="hmm-search-clear" onClick={onClear} aria-label="Limpiar">
            <X size={13} />
          </button>
        )}
      </div>
      {query && (
        <div className="hmm-search-hint">
          {searching
            ? <span>Buscando…</span>
            : <span><strong>{resultCount}</strong> resultado{resultCount !== 1 ? "s" : ""}</span>
          }
        </div>
      )}
    </div>
  );
}

// ─── NAV DE SECCIONES ────────────────────────────────────────────────────────
function SectionNav({ active, onChange }) {
  return (
    <nav className="hmm-nav">
      {SECTIONS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`hmm-nav-btn ${active === key ? "hmm-nav-btn--active" : ""}`}
          onClick={() => onChange(key)}
        >
          <Icon size={14} strokeWidth={active === key ? 2.2 : 1.6} />
          <span>{label}</span>
          {active === key && <span className="hmm-nav-indicator" />}
        </button>
      ))}
    </nav>
  );
}

// ─── ITEMS DE CADA SECCIÓN ────────────────────────────────────────────────────

// Jugador
function PlayerRow({ player, onClick }) {
  const imgUrl = getHistoricalImageUrl(player.image_path);
  return (
    <button className="hmm-row hmm-row--player" onClick={onClick}>
      <div className="hmm-row-avatar">
        {imgUrl
          ? <img src={imgUrl} alt={player.name} />
          : <span>{player.name?.slice(0, 2).toUpperCase()}</span>
        }
        {player.significance_level === 5 && (
          <span className="hmm-row-goat">GOAT</span>
        )}
      </div>
      <div className="hmm-row-info">
        <span className="hmm-row-name">{player.name}</span>
        <div className="hmm-row-meta">
          {player.country && <span>{player.country}</span>}
          {player.position && (
            <><span className="hmm-dot">·</span><span>{POSITION_LABEL[player.position] || player.position}</span></>
          )}
        </div>
        {player.significance_level > 0 && (
          <div className="hmm-row-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} size={8}
                fill={n <= player.significance_level ? "#f59e0b" : "none"}
                stroke={n <= player.significance_level ? "#f59e0b" : "var(--border)"}
              />
            ))}
          </div>
        )}
      </div>
      <ChevronRight size={15} className="hmm-row-chevron" />
    </button>
  );
}

// Equipo
function TeamRow({ team, onClick }) {
  const imgUrl = getHistoricalImageUrl(team.image_path);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";
  return (
    <button
      className="hmm-row hmm-row--team"
      onClick={onClick}
      style={{ "--tc": team.primary_color || legColor }}
    >
      <div className="hmm-row-tc-stripe" />
      <div className="hmm-row-shield">
        {imgUrl
          ? <img src={imgUrl} alt={team.name} />
          : <Shield size={20} strokeWidth={1.2} />
        }
      </div>
      <div className="hmm-row-info">
        <span className="hmm-row-name">{team.name}</span>
        <div className="hmm-row-meta">
          {team.country && <span>{team.country}</span>}
          {team.era_dominance && (
            <><span className="hmm-dot">·</span><span>{team.era_dominance}</span></>
          )}
        </div>
        {team.legacy_type && (
          <span className="hmm-row-badge" style={{ "--bc": legColor }}>
            {team.legacy_type}
          </span>
        )}
      </div>
      {team.titles_count > 0 && (
        <span className="hmm-row-titles">
          <Trophy size={9} />{team.titles_count}
        </span>
      )}
      <ChevronRight size={15} className="hmm-row-chevron" />
    </button>
  );
}

// Evento
function EventRow({ event, onClick }) {
  const bannerUrl = getHistoricalImageUrl(event.banner_image_path || event.image_path);
  const protagonist = event.event_category === "player"
    ? event.historical_players : event.historical_teams;
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;

  return (
    <button className="hmm-row hmm-row--event" onClick={onClick}>
      <div className="hmm-row-event-img">
        {bannerUrl
          ? <img src={bannerUrl} alt={event.title} />
          : <div className="hmm-row-event-ph"><Zap size={18} strokeWidth={1} /></div>
        }
        {year && <span className="hmm-row-event-year">{year}</span>}
      </div>
      <div className="hmm-row-info">
        <span className="hmm-row-name hmm-row-name--sm">{event.title}</span>
        {protagonist && (
          <div className="hmm-row-meta">
            <span>{protagonist.name}</span>
          </div>
        )}
        {event.event_type && (
          <span className="hmm-row-type">{event.event_type}</span>
        )}
      </div>
      <ChevronRight size={15} className="hmm-row-chevron" />
    </button>
  );
}

// Competición
function CompRow({ competition, onClick }) {
  const imgUrl = getHistoricalImageUrl(competition.image_path);
  const winner = competition.historical_teams?.name || competition.winner_text;
  return (
    <button className="hmm-row hmm-row--comp" onClick={onClick}>
      <div className="hmm-row-comp-logo">
        {imgUrl
          ? <img src={imgUrl} alt={competition.name} />
          : <Trophy size={18} strokeWidth={1.2} />
        }
      </div>
      <div className="hmm-row-info">
        <span className="hmm-row-name hmm-row-name--sm">{competition.name}</span>
        <div className="hmm-row-meta">
          {competition.year && <span className="hmm-row-year">{competition.year}</span>}
          {competition.country && (
            <><span className="hmm-dot">·</span><span>{competition.country}</span></>
          )}
        </div>
        {winner && (
          <span className="hmm-row-winner"><Trophy size={8} />{winner}</span>
        )}
      </div>
      <ChevronRight size={15} className="hmm-row-chevron" />
    </button>
  );
}

// ─── LISTA VACÍA ─────────────────────────────────────────────────────────────
function FilterPanel({ section, activeFilters, onChange, onClear }) {
  const filters = SECTION_FILTERS[section] || [];
  if (filters.length === 0) return null;

  return (
    <div className="hmm-filter-panel">
      {filters.map(({ key, label, options }) => (
        <div key={key} className="hmm-filter-group">
          <span className="hmm-filter-group-label">{label}</span>
          <div className="hmm-filter-options">
            {options.map(({ value, label: optLabel }) => (
              <button
                key={value}
                className={`hmm-filter-chip ${activeFilters[key] === value ? "hmm-filter-chip--active" : ""}`}
                onClick={() => onChange(key, activeFilters[key] === value ? null : value)}
              >
                {optLabel}
              </button>
            ))}
          </div>
        </div>
      ))}
      {Object.values(activeFilters).some(Boolean) && (
        <button className="hmm-filter-clear" onClick={onClear}>
          <X size={11} /> Limpiar filtros
        </button>
      )}
    </div>
  );
}
function EmptyState({ section, query }) {
  const icons = { players: Users2, teams: Shield, events: Zap, competitions: Trophy };
  const Icon = icons[section] || Zap;
  return (
    <div className="hmm-empty">
      <Icon size={28} strokeWidth={1} />
      <p>{query ? `Sin resultados para "${query}"` : "Sin datos disponibles"}</p>
    </div>
  );
}

// ─── SKELETONS DE CARGA ───────────────────────────────────────────────────────
function LoadingRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="hmm-row-skel">
          <Skel w={44} h={44} round />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <Skel w="65%" h={14} />
            <Skel w="45%" h={11} />
          </div>
        </div>
      ))}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoryMenuMobile({ onSectionChange }) {
  const { allPlayers, loading: loadingPlayers } = useHistoricalPlayers();
  const { competitions, loading: loadingComps } = useHistoricalCompetitions();
  const { teams, loading: loadingTeams } = useHistoricalTeams();
  const { events, loading: loadingEvents } = useHistoricalEvents();

  const [activeSection, setActiveSection] = useState("players");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const listRef = useRef(null);

  const nav = (key, item = null) => onSectionChange?.(key, item);
  const totalCounts = allPlayers.length + teams.length + events.length + competitions.length;

  // ── Búsqueda global ──────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();

    const matchPlayers = allPlayers.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q) ||
      p.position?.toLowerCase().includes(q) ||
      p.legacy_type?.toLowerCase().includes(q)
    ).map(p => ({ type: "player", data: p }));

    const matchTeams = teams.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.country?.toLowerCase().includes(q) ||
      t.era_dominance?.toLowerCase().includes(q)
    ).map(t => ({ type: "team", data: t }));

    const matchEvents = events.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.historical_players?.name?.toLowerCase().includes(q) ||
      e.historical_teams?.name?.toLowerCase().includes(q) ||
      e.event_type?.toLowerCase().includes(q)
    ).map(e => ({ type: "event", data: e }));

    const matchComps = competitions.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      c.historical_teams?.name?.toLowerCase().includes(q)
    ).map(c => ({ type: "competition", data: c }));

    return [...matchPlayers, ...matchTeams, ...matchEvents, ...matchComps];
  }, [query, allPlayers, teams, events, competitions]);

  // ── Items de sección activa ──────────────────────────────────────────────
  const sectionItems = useMemo(() => {
    switch (activeSection) {
      case "players": return allPlayers.map(p => ({ type: "player", data: p }));
      case "teams": return teams.map(t => ({ type: "team", data: t }));
      case "events": return events.map(e => ({ type: "event", data: e }));
      case "competitions": return competitions.map(c => ({ type: "competition", data: c }));
      default: return [];
    }
  }, [activeSection, allPlayers, teams, events, competitions]);

  const isLoading = {
    players: loadingPlayers,
    teams: loadingTeams,
    events: loadingEvents,
    competitions: loadingComps,
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const filteredItems = useMemo(() => {
    const base = searchResults !== null ? searchResults : sectionItems;
    if (!hasActiveFilters) return base;

    return base.filter(({ data }) => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        if (key === "significance_level") return String(data[key]) === value;
        return data[key] === value;
      });
    });
  }, [searchResults, sectionItems, activeFilters, hasActiveFilters]);

  const displayItems = filteredItems;
  const loading = searchResults !== null ? false : isLoading[activeSection];

  const handleSectionChange = (key) => {
    setActiveSection(key);
    setQuery("");
    setActiveFilters({});
    setFilterOpen(false);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClear = () => {
    setQuery("");
  };

  // ── Render de un item (polimórfico) ──────────────────────────────────────
  const renderItem = (item, idx) => {
    switch (item.type) {
      case "player":
        return (
          <PlayerRow
            key={item.data.id || idx}
            player={item.data}
            onClick={() => nav("players", item.data)}
          />
        );
      case "team":
        return (
          <TeamRow
            key={item.data.id || idx}
            team={item.data}
            onClick={() => nav("teams", item.data)}
          />
        );
      case "event":
        return (
          <EventRow
            key={item.data.id || idx}
            event={item.data}
            onClick={() => nav("events", item.data)}
          />
        );
      case "competition":
        return (
          <CompRow
            key={item.data.id || idx}
            competition={item.data}
            onClick={() => nav("competitions", item.data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="hmm-root">

      {/* ── Header ── */}
      <Header totalCounts={totalCounts} />

      {/* ── Buscador global ── */}
      <div className="hmm-search-row">
        <GlobalSearch
          query={query}
          onChange={setQuery}
          onClear={handleClear}
          resultCount={displayItems.length}
          searching={false}
        />
        {SECTION_FILTERS[activeSection]?.length > 0 && (
          <button
            className={`hmm-filter-toggle ${filterOpen ? "hmm-filter-toggle--active" : ""} ${hasActiveFilters ? "hmm-filter-toggle--has" : ""}`}
            onClick={() => setFilterOpen(v => !v)}
          >
            <Filter size={15} />
            {hasActiveFilters && <span className="hmm-filter-dot" />}
          </button>
        )}
      </div>

      {filterOpen && (
        <FilterPanel
          section={activeSection}
          activeFilters={activeFilters}
          onChange={(key, value) => setActiveFilters(prev =>
            value === null ? (() => { const n = { ...prev }; delete n[key]; return n; })() : { ...prev, [key]: value }
          )}
          onClear={() => setActiveFilters({})}
        />
      )}

      {/* ── Nav secciones (oculto si hay búsqueda activa) ── */}
      {!query && (
        <SectionNav active={activeSection} onChange={handleSectionChange} />
      )}

      {/* ── Etiqueta de sección o búsqueda ── */}
      <div className="hmm-list-label">
        {query
          ? <><Search size={10} /> Resultados para "{query}"</>
          : <>{SECTIONS.find(s => s.key === activeSection)?.label || ""}</>
        }
        {!query && !loading && (
          <span className="hmm-list-count">{sectionItems.length}</span>
        )}
      </div>

      {/* ── Lista ── */}
      <div className="hmm-list" ref={listRef}>
        {loading
          ? <LoadingRows />
          : displayItems.length > 0
            ? displayItems.map((item, idx) => renderItem(item, idx))
            : <EmptyState section={activeSection} query={query} />
        }
      </div>
      <Footer />
    </div>
  );
}