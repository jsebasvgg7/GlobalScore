import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Users2, Trophy, Shield, Zap, Search, X, ChevronRight,
  Filter, Star, Shuffle, ArrowLeft,
} from "lucide-react";
import { useHistoricalPlayers, getHistoricalImageUrl } from "../../hooks/useHistoricalPlayers";
import { useHistoricalCompetitions } from "../../hooks/useHistoricalCompetitions";
import { useHistoricalTeams } from "../../hooks/useHistoricalTeams";
import { useHistoricalEvents } from "../../hooks/useHistoricalEvents";
import "../../styles/mobile/HistoryMenuMobile.css";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 16, round = false }) {
  return (
    <span
      className="hmm-skel"
      style={{ width: w, height: h, borderRadius: round ? "50%" : 3, display: "block" }}
    />
  );
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
        { value: "Forward", label: "Del" },
        { value: "Midfielder", label: "Med" },
        { value: "Defender", label: "Def" },
        { value: "Goalkeeper", label: "Por" },
        { value: "All-rounder", label: "Tod" },
        { value: "Play-maker", label: "MP" }
      ]
    },
    {
      key: "legacy_type", label: "Legado", options: [
        { value: "Goal Scorer", label: "Goleador" },
        { value: "Tactician", label: "Táctico" },
        { value: "Innovator", label: "Genio" },
        { value: "Leader", label: "Líder" },
        { value: "Goalkeeper", label: "Portero" },
        { value: "Technician", label: "Técnico" }
      ]
    },
    {
      key: "significance_level", label: "Nivel", options: [
        { value: "5", label: "GOAT" },
        { value: "4", label: "Leyenda" },
        { value: "3", label: "Iconico" },
        { value: "2", label: "Notable" },
        { value: "1", label: "Activo" },
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
  Forward: "Delantero", Midfielder: "Centrocampista", Playmaker: "Media Punta",
  "All-rounder": "Todocampista", Defender: "Defensor", Goalkeeper: "Portero",
};

// ─── Animación ruleta (igual que SectionHeaderMobile) ────────────────────────
function RouletteSlot({ items, running, winner, onDone, renderItem }) {
  const [displayed, setDisplayed] = useState(null);
  const [phase, setPhase] = useState("idle");
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    setPhase("spinning");
    let i = 0;
    intervalRef.current = setInterval(() => {
      setDisplayed(items[i % items.length]);
      i++;
    }, 80);
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      setDisplayed(winner);
      setPhase("reveal");
      onDone?.();
    }, 2800);
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [running]);

  if (!displayed && phase === "idle") return null;
  return (
    <div className={`hmm-slot ${phase === "spinning" ? "hmm-slot--spin" : ""} ${phase === "reveal" ? "hmm-slot--reveal" : ""}`}>
      {displayed && renderItem(displayed, phase)}
    </div>
  );
}

// ─── SlotItem por tipo ────────────────────────────────────────────────────────
function PlayerSlotItem({ item, phase }) {
  const img = getHistoricalImageUrl(item.image_path);
  return (
    <div className="hmm-slot-row">
      <div className={`hmm-slot-avatar ${item.significance_level === 5 ? "hmm-slot-avatar--goat" : ""}`}>
        {img ? <img src={img} alt={item.name} /> : <span>{item.name?.slice(0, 2).toUpperCase()}</span>}
        {item.significance_level === 5 && <span className="hmm-slot-goat-chip">GOAT</span>}
      </div>
      <div className="hmm-slot-info">
        <span className="hmm-slot-name">{item.name}</span>
        <span className="hmm-slot-meta">{item.country}{item.position ? ` · ${item.position}` : ""}</span>
      </div>
      {phase === "reveal" && <ChevronRight size={16} className="hmm-slot-chevron" />}
    </div>
  );
}

function TeamSlotItem({ item, phase }) {
  const img = getHistoricalImageUrl(item.image_path);
  return (
    <div className="hmm-slot-row">
      <div className="hmm-slot-avatar hmm-slot-avatar--shield">
        {img ? <img src={img} alt={item.name} /> : <span>{item.name?.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="hmm-slot-info">
        <span className="hmm-slot-name">{item.name}</span>
        <span className="hmm-slot-meta">{item.country}{item.era_dominance ? ` · ${item.era_dominance}` : ""}</span>
      </div>
      {phase === "reveal" && <ChevronRight size={16} className="hmm-slot-chevron" />}
    </div>
  );
}

function EventSlotItem({ item, phase }) {
  const img = getHistoricalImageUrl(item.banner_image_path || item.image_path);
  const year = item.event_date ? new Date(item.event_date).getFullYear() : null;
  return (
    <div className="hmm-slot-row">
      <div className="hmm-slot-avatar hmm-slot-avatar--event">
        {img ? <img src={img} alt={item.title} /> : <Zap size={20} strokeWidth={1} />}
        {year && <span className="hmm-slot-event-year">{year}</span>}
      </div>
      <div className="hmm-slot-info">
        <span className="hmm-slot-name">{item.title}</span>
        <span className="hmm-slot-meta">{item.event_type || ""}</span>
      </div>
      {phase === "reveal" && <ChevronRight size={16} className="hmm-slot-chevron" />}
    </div>
  );
}

function CompSlotItem({ item, phase }) {
  const img = getHistoricalImageUrl(item.image_path);
  return (
    <div className="hmm-slot-row">
      <div className="hmm-slot-avatar hmm-slot-avatar--shield">
        {img ? <img src={img} alt={item.name} /> : <span>{item.name?.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="hmm-slot-info">
        <span className="hmm-slot-name">{item.name}</span>
        <span className="hmm-slot-meta">{item.country}{item.year ? ` · ${item.year}` : ""}</span>
      </div>
      {phase === "reveal" && <ChevronRight size={16} className="hmm-slot-chevron" />}
    </div>
  );
}

const SLOT_ITEM_BY_SECTION = {
  players: PlayerSlotItem,
  teams: TeamSlotItem,
  events: EventSlotItem,
  competitions: CompSlotItem,
};

const RANDOM_LABEL = {
  players: "Jugador aleatorio",
  teams: "Equipo aleatorio",
  events: "Momento aleatorio",
  competitions: "Competición aleatoria",
};

// ─── HEADER con ruleta animada ────────────────────────────────────────────────
function Header({ totalCounts, onRandomSelect, activeSection, poolItems }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [done, setDone] = useState(false);

  // Resetear la ruleta cuando cambia de sección
  useEffect(() => {
    setSpinning(false);
    setWinner(null);
    setDone(false);
  }, [activeSection]);

  const handleSpin = useCallback(() => {
    if (spinning || poolItems.length === 0) return;
    const picked = poolItems[Math.floor(Math.random() * poolItems.length)];
    setWinner(picked);
    setDone(false);
    setSpinning(true);
  }, [spinning, poolItems]);

  const handleDone = useCallback(() => {
    setSpinning(false);
    setDone(true);
  }, []);

  const handleClear = useCallback(() => {
    setWinner(null);
    setDone(false);
  }, []);

  const handleReveal = useCallback(() => {
    if (winner && done) onRandomSelect?.(winner);
  }, [winner, done, onRandomSelect]);

  const SlotItem = SLOT_ITEM_BY_SECTION[activeSection] || PlayerSlotItem;

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

        {/* ── Zona de ruleta ── */}
        <div className="hmm-random-zone">
          {!done && !spinning && (
            <button
              className={`hmm-header-random-btn ${poolItems.length === 0 ? "hmm-header-random-btn--disabled" : ""}`}
              onClick={handleSpin}
              disabled={poolItems.length === 0 || spinning}
              aria-label="Ver item aleatorio"
            >
              <Shuffle size={13} />
              <span>{RANDOM_LABEL[activeSection] || "Aleatorio"}</span>
            </button>
          )}

          {(spinning || done) && (
            <div className={`hmm-roulette ${done ? "hmm-roulette--done" : ""}`}>
              <div className="hmm-roulette-arrow" aria-hidden="true">▶</div>
              <button
                className="hmm-roulette-slot"
                onClick={done ? handleReveal : undefined}
                disabled={!done}
              >
                <RouletteSlot
                  items={poolItems}
                  running={spinning}
                  winner={winner}
                  onDone={handleDone}
                  renderItem={(item, phase) => <SlotItem item={item} phase={phase} />}
                />
              </button>
              <div className="hmm-roulette-arrow hmm-roulette-arrow--right" aria-hidden="true">◀</div>
              {done && (
                <button className="hmm-roulette-clear" onClick={handleClear} aria-label="Cerrar">
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>
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

// ─── Badge jugador activo ─────────────────────────────────────────────────────
function ActiveBadgeMobile() {
  return (
    <span className="hmm-active-badge">
      <span className="hmm-active-badge-dot" />
      <span className="hmm-active-badge-star">★</span>
      <span className="hmm-active-badge-text">Activo</span>
    </span>
  );
}

// ─── ITEMS DE CADA SECCIÓN ────────────────────────────────────────────────────

function PlayerRow({ player, onClick }) {
  const imgUrl = getHistoricalImageUrl(player.image_path);
  const isActive = player.significance_level === 1;

  return (
    <button className="hmm-player-card" onClick={onClick}>
      <div className="hmm-player-card-img">
        {imgUrl
          ? <img src={imgUrl} alt={player.name} />
          : <span className="hmm-player-card-initials">{player.name?.slice(0, 2).toUpperCase()}</span>
        }
        {player.significance_level === 5 && (
          <span className="hmm-player-card-goat">GOAT</span>
        )}
        {isActive && (
          <span className="hmm-player-card-active-overlay">
            <span className="hmm-player-card-active-dot" />EN ACTIVO
          </span>
        )}
      </div>
      <div className="hmm-player-card-body">
        <span className="hmm-player-card-name">{player.name}</span>
        <span className="hmm-player-card-meta">
          {player.country}{player.position ? ` · ${POSITION_LABEL[player.position] || player.position}` : ""}
        </span>
        {isActive ? (
          <ActiveBadgeMobile />
        ) : player.significance_level > 0 ? (
          <div className="hmm-player-card-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} size={8}
                fill={n <= player.significance_level ? "#f59e0b" : "none"}
                stroke={n <= player.significance_level ? "#f59e0b" : "var(--border)"}
              />
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function TeamRow({ team, onClick }) {
  const imgUrl = getHistoricalImageUrl(team.image_path);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";
  return (
    <button
      className="hmm-team-card"
      onClick={onClick}
      style={{ "--tc": team.primary_color || legColor, "--bc": legColor }}
    >
      <div className="hmm-team-card-img">
        {imgUrl
          ? <img src={imgUrl} alt={team.name} />
          : <span className="hmm-team-card-placeholder"><Shield size={36} strokeWidth={1} /></span>
        }
        <div className="hmm-team-card-stripe" />
        {team.titles_count > 0 && (
          <span className="hmm-team-card-titles">
            <Trophy size={8} />{team.titles_count}
          </span>
        )}
      </div>
      <div className="hmm-team-card-body">
        <span className="hmm-team-card-name">{team.name}</span>
        <span className="hmm-team-card-meta">
          {team.country}{team.era_dominance ? ` · ${team.era_dominance}` : ""}
        </span>
        {team.legacy_type && (
          <span className="hmm-team-card-badge">{team.legacy_type}</span>
        )}
      </div>
    </button>
  );
}

function EventRow({ event, onClick }) {
  const bannerUrl = getHistoricalImageUrl(event.banner_image_path || event.image_path);
  const protagonist = event.event_category === "player"
    ? event.historical_players : event.historical_teams;
  const year = event.event_date ? new Date(event.event_date).getFullYear() : null;

  return (
    <button className="hmm-event-card" onClick={onClick}>
      <div className="hmm-event-card-banner">
        {bannerUrl
          ? <img src={bannerUrl} alt={event.title} />
          : <div className="hmm-event-card-placeholder"><Zap size={40} strokeWidth={1} /></div>
        }
        {year && <span className="hmm-event-card-year">{year}</span>}
        {event.event_type && <span className="hmm-event-card-type">{event.event_type}</span>}
      </div>
      <div className="hmm-event-card-body">
        <span className="hmm-event-card-title">{event.title}</span>
        {protagonist && (
          <div className="hmm-event-card-protagonist">
            <span className="hmm-event-card-protagonist-dot" />
            {protagonist.name}
          </div>
        )}
      </div>
    </button>
  );
}

function CompRow({ competition, onClick }) {
  const imgUrl = getHistoricalImageUrl(competition.image_path);
  const winner = competition.historical_teams?.name || competition.winner_text;
  return (
    <button className="hmm-comp-card" onClick={onClick}>
      <div className="hmm-comp-card-img">
        {imgUrl
          ? <img src={imgUrl} alt={competition.name} />
          : <span className="hmm-comp-card-placeholder"><Trophy size={36} strokeWidth={1} /></span>
        }
        {competition.year && (
          <span className="hmm-comp-card-year">{competition.year}</span>
        )}
        {competition.type && (
          <span className="hmm-comp-card-type">{competition.type}</span>
        )}
      </div>
      <div className="hmm-comp-card-body">
        <span className="hmm-comp-card-name">{competition.name}</span>
        <span className="hmm-comp-card-meta">
          {competition.country || ""}
        </span>
        {winner && (
          <span className="hmm-comp-card-winner">
            <Trophy size={8} />{winner}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── PANEL DE FILTROS ─────────────────────────────────────────────────────────
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
export default function HistoryMenuMobile({ onSectionChange, initialSection, initialItem }) {
  const { allPlayers, loading: loadingPlayers } = useHistoricalPlayers();
  const { competitions, loading: loadingComps } = useHistoricalCompetitions();
  const { teams, loading: loadingTeams } = useHistoricalTeams();
  const { events, loading: loadingEvents } = useHistoricalEvents();

  const [activeSection, setActiveSection] = useState(initialSection || "players");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const listRef = useRef(null);

  const nav = (key, item = null) => onSectionChange?.(key, item);
  const totalCounts = allPlayers.length + teams.length + events.length + competitions.length;

  // Si viene initialSection, activarla
  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection]);

  // Si viene initialItem con datos completos (no solo {id}), navegar directamente al detalle
  useEffect(() => {
    if (initialItem && initialSection && initialItem.name) {
      onSectionChange?.(initialSection, initialItem);
    }
  }, []);

  // Pool de items de la sección activa (datos crudos para la ruleta)
  const activePool = useMemo(() => {
    switch (activeSection) {
      case "players": return allPlayers;
      case "teams": return teams;
      case "events": return events;
      case "competitions": return competitions;
      default: return [];
    }
  }, [activeSection, allPlayers, teams, events, competitions]);

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
      <Header
        totalCounts={totalCounts}
        onRandomSelect={(item) => nav(activeSection, item)}
        activeSection={activeSection}
        poolItems={activePool}
      />

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

      {!query && (
        <SectionNav active={activeSection} onChange={handleSectionChange} />
      )}

      <div className="hmm-list-label">
        {query
          ? <><Search size={10} /> Resultados para "{query}"</>
          : <>{SECTIONS.find(s => s.key === activeSection)?.label || ""}</>
        }
        {!query && !loading && (
          <span className="hmm-list-count">{sectionItems.length}</span>
        )}
      </div>

      <div className={`hmm-list${activeSection === "players" ? " hmm-list--players"
        : activeSection === "teams" ? " hmm-list--teams"
          : activeSection === "competitions" ? " hmm-list--competitions"
            : activeSection === "events" ? " hmm-list--events"
              : ""
        }`} ref={listRef}>
        {loading
          ? <LoadingRows />
          : displayItems.length > 0
            ? displayItems.map((item, idx) => renderItem(item, idx))
            : <EmptyState section={activeSection} query={query} />
        }
      </div>
    </div>
  );
}