import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import {
  Shield, ArrowLeft, RefreshCw, AlertCircle,
  Trophy, Star, MapPin, Calendar, User2,
  Search, X, ChevronRight, Shuffle, Globe,
} from "lucide-react";
import { useHistoricalTeams, useHistoricalTeamDetail } from "../../hooks/useHistoricalTeams";
import { getHistoricalImageUrl } from "../../hooks/useHistoricalPlayers";
import "../../styles/mobile/HistoricalTeamsMobile.css";
import "../../styles/mobile/HistoricalTeamsMobile.dark.css";

// ── Diccionarios ────────────────────────────────────────────────
const LEGACY_LABEL = {
  "Dynastic": "Dinástico",
  "Innovative": "Innovador",
  "Continental": "Continental",
  "National": "Nacional",
};
const LEGACY_COLOR = {
  "Dynastic": "#f59e0b",
  "Innovative": "#8b5cf6",
  "Continental": "#3b82f6",
  "National": "#10b981",
};
const POSITION_ROLE_LABEL = {
  "GK": "Portero", "CB": "Defensa Central", "LB": "Lateral Izq.",
  "RB": "Lateral Der.", "CDM": "Med. Def.", "CM": "Centrocampista",
  "CAM": "Med. Ofensivo", "LM": "Mediapunta Izq.", "RM": "Mediapunta Der.",
  "LW": "Extremo Izq.", "RW": "Extremo Der.", "ST": "Delantero Centro",
  "SS": "Segundo Delantero",
};

// ══════════════════════════════════════════════════════════════
//  MICRO-HELPERS
// ══════════════════════════════════════════════════════════════
function DotGrid({ cols = 5, rows = 4 }) {
  return (
    <svg className="htm-dot-grid" width={cols * 14} height={rows * 14} aria-hidden="true">
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle key={`${r}-${c}`} cx={c * 14 + 7} cy={r * 14 + 7} r={1.5} />
        ))
      )}
    </svg>
  );
}

function TeamInitials({ name, color }) {
  const words = (name || "").split(" ");
  const init = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (name || "??").slice(0, 2).toUpperCase();
  return (
    <span className="htm-card-initials" style={{ color: color ? `${color}70` : "rgba(91,79,216,0.4)" }}>
      {init}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
//  HEADER — fiel a _TeamsHeader Flutter
// ══════════════════════════════════════════════════════════════
function TeamsHeader({ total, legendary, countries, onBack }) {
  return (
    <header className="htm-header">
      <DotGrid cols={6} rows={4} />
      <div className="htm-breadcrumb">
        <button className="htm-back-btn" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={10} />
          <span>HISTÓRICO</span>
        </button>
        <span className="htm-breadcrumb-sep">›</span>
        <span className="htm-breadcrumb-active">EQUIPOS</span>
      </div>
      <div className="htm-title-row">
        <div className="htm-title-bar" />
        <div>
          <h1 className="htm-title">
            <span className="htm-title-solid">EQUI</span>
            <span className="htm-title-accent">POS</span>
          </h1>
          <p className="htm-subtitle">Equipos que definieron una era</p>
        </div>
      </div>
      <div className="htm-stats-wrap">
        <div className="htm-stats">
          <div className="htm-stat-cell htm-stat-cell--accent">
            <div className="htm-stat-icon"><Shield size={15} /></div>
            <div className="htm-stat-info">
              <span className="htm-stat-num">{total || "—"}</span>
              <span className="htm-stat-lbl">EQUIPOS</span>
            </div>
          </div>
          <div className="htm-stat-cell htm-stat-cell--gold">
            <div className="htm-stat-icon"><Trophy size={15} /></div>
            <div className="htm-stat-info">
              <span className="htm-stat-num">{legendary || "—"}</span>
              <span className="htm-stat-lbl">LEYENDAS</span>
            </div>
          </div>
          <div className="htm-stat-cell htm-stat-cell--green">
            <div className="htm-stat-icon"><Globe size={15} /></div>
            <div className="htm-stat-info">
              <span className="htm-stat-num">{countries || "—"}</span>
              <span className="htm-stat-lbl">PAÍSES</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════
//  SEARCH BAR
// ══════════════════════════════════════════════════════════════
function SearchBar({ value, onChange, onClear, onRandom }) {
  return (
    <div className="htm-search-row">
      <div className="htm-search-wrap">
        <Search size={14} className="htm-search-ico" />
        <input
          className="htm-search-input"
          placeholder="Buscar equipo..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="htm-search-clear" onClick={onClear} aria-label="Limpiar">
            <X size={12} />
          </button>
        )}
      </div>
      <button className="htm-icon-btn htm-icon-btn--dark" onClick={onRandom} aria-label="Aleatorio">
        <Shuffle size={15} />
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COUNTER ROW
// ══════════════════════════════════════════════════════════════
function CounterRow({ count }) {
  return (
    <div className="htm-counter-row">
      <div className="htm-counter-left">
        <span className="htm-counter-bar" />
        <span className="htm-counter-label">EQUIPOS</span>
      </div>
      <span className="htm-counter-badge">{count} ENCONTRADOS</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TEAM CARD — grid 2 cols neobrutalista (igual que PlayerCard)
// ══════════════════════════════════════════════════════════════
function TeamCard({ team, onClick, index }) {
  const img = getHistoricalImageUrl(team.image_path);
  const isLegendary = ["Dynastic", "Dominant"].includes(team.legacy_type);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--htm-accent)";

  return (
    <article
      className="htm-team-card"
      onClick={() => onClick(team)}
      style={{ "--i": index }}
    >
      <div className="htm-card-photo" style={{ "--tc": team.primary_color || "#5b4fd8" }}>
        {/* Left color stripe */}
        <div className="htm-card-stripe" style={{ background: team.primary_color || "var(--htm-accent)" }} />
        {/* Background tint */}
        <div className="htm-card-bg-tint" style={{ background: team.primary_color ? `${team.primary_color}1a` : "rgba(91,79,216,0.08)" }} />
        {img
          ? <img src={img} alt={team.name} className="htm-card-img" />
          : <TeamInitials name={team.name} color={team.primary_color} />
        }
        {isLegendary && <span className="htm-card-top">TOP</span>}
        <span className="htm-card-more">···</span>
        {team.era_dominance && (
          <span className="htm-card-era" style={{ color: team.primary_color || "var(--htm-accent)" }}>
            {team.era_dominance}
          </span>
        )}
      </div>
      <div className="htm-card-body">
        <p className="htm-card-name">{(team.name || "").toUpperCase()}</p>
        {team.country && <p className="htm-card-country">{team.country.toUpperCase()}</p>}
        {team.titles_count > 0 && (
          <div className="htm-card-trophies">
            {Array.from({ length: Math.min(team.titles_count, 5) }, (_, i) => (
              <Trophy key={i} size={10} className="htm-card-trophy" />
            ))}
            {team.titles_count > 5 && (
              <span className="htm-card-trophy-extra">+{team.titles_count - 5}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════
//  RANDOM MODAL — fiel a _RandomTeamModal Flutter
// ══════════════════════════════════════════════════════════════
function RandomModal({ teams, onSelect, onClose }) {
  const [displayed, setDisplayed] = useState(null);
  const [phase, setPhase] = useState("spinning");
  const winner = useRef(teams[Math.floor(Math.random() * teams.length)]);
  const ivRef = useRef(null);
  const toRef = useRef(null);

  const runSpin = (win) => {
    if (ivRef.current) clearInterval(ivRef.current);
    if (toRef.current) clearTimeout(toRef.current);
    let i = 0;
    ivRef.current = setInterval(() => {
      setDisplayed(teams[i % teams.length]);
      i++;
    }, 80);
    toRef.current = setTimeout(() => {
      clearInterval(ivRef.current);
      setDisplayed(win);
      setPhase("revealed");
    }, 2800);
  };

  useEffect(() => {
    runSpin(winner.current);
    return () => {
      if (ivRef.current) clearInterval(ivRef.current);
      if (toRef.current) clearTimeout(toRef.current);
    };
  }, []);

  const spin = () => {
    winner.current = teams[Math.floor(Math.random() * teams.length)];
    setPhase("spinning");
    setDisplayed(null);
    runSpin(winner.current);
  };

  const img = displayed ? getHistoricalImageUrl(displayed.image_path) : null;

  return (
    <div className="htm-modal-backdrop" onClick={onClose}>
      <div className="htm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="htm-modal-header">
          <Shuffle size={13} />
          <span>MODO ALEATORIO</span>
          <button className="htm-modal-close" onClick={onClose}><X size={13} /></button>
        </div>
        <div className="htm-modal-body">
          <div className={`htm-slot ${phase === "revealed" ? "htm-slot--revealed" : "htm-slot--spinning"}`}>
            {displayed ? (
              <div className="htm-slot-row">
                <div className="htm-slot-avatar" style={{ "--tc": displayed.primary_color || "#5b4fd8" }}>
                  {img
                    ? <img src={img} alt={displayed.name} />
                    : <TeamInitials name={displayed.name} color={displayed.primary_color} />
                  }
                </div>
                <div className="htm-slot-info">
                  <p className="htm-slot-name">{(displayed.name || "").toUpperCase()}</p>
                  <p className="htm-slot-meta">
                    {displayed.country}
                    {displayed.era_dominance ? ` · ${displayed.era_dominance}` : ""}
                  </p>
                </div>
                {phase === "revealed" && <ChevronRight size={16} className="htm-slot-arrow" />}
              </div>
            ) : (
              <div className="htm-slot-empty"><RefreshCw size={22} className="htm-spin" /></div>
            )}
          </div>

          {phase === "spinning" && (
            <div className="htm-slot-status-row">
              <span className="htm-slot-dot" />
              <span className="htm-slot-status">BUSCANDO...</span>
              <span className="htm-slot-dot" />
            </div>
          )}

          {phase === "revealed" && (
            <>
              <button className="htm-modal-cta" onClick={() => { onSelect(winner.current); onClose(); }}>
                VER EQUIPO →
              </button>
              <button className="htm-modal-secondary" onClick={spin}>
                OTRO →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DETALLE — 3 tabs fiel a Flutter TeamDetail
// ══════════════════════════════════════════════════════════════
const TABS = [
  { key: "resumen", label: "RESUMEN", Icon: Shield },
  { key: "palmares", label: "PALMARÉS", Icon: Trophy },
  { key: "alineacion", label: "ALINEACIÓN", Icon: Star },
];

// ── Retro Field (campo SVG) ──────────────────────────────────
function RetroField({ lineup, primaryColor, secondaryColor }) {
  const [hovered, setHovered] = useState(null);
  const isDark = (hex) => {
    if (!hex || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  };
  const numColor = isDark(primaryColor) ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.75)";

  return (
    <div className="htm-field-wrap">
      <div className="htm-field">
        <svg className="htm-field-lines" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="htm-grass" x="0" y="0" width="300" height="30" patternUnits="userSpaceOnUse">
              <rect width="300" height="15" fill="#2d7a2d" />
              <rect y="15" width="300" height="15" fill="#267226" />
            </pattern>
          </defs>
          <rect width="300" height="420" fill="url(#htm-grass)" rx="4" />
          <rect x="12" y="12" width="276" height="396" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <line x1="12" y1="210" x2="288" y2="210" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <circle cx="150" cy="210" r="42" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <circle cx="150" cy="210" r="2.5" fill="rgba(255,255,255,0.8)" />
          <rect x="72" y="12" width="156" height="58" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <rect x="108" y="12" width="84" height="26" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
          <circle cx="150" cy="56" r="2" fill="rgba(255,255,255,0.75)" />
          <path d="M 106 70 A 44 44 0 0 0 194 70" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
          <rect x="72" y="350" width="156" height="58" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <rect x="108" y="382" width="84" height="26" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
          <circle cx="150" cy="364" r="2" fill="rgba(255,255,255,0.75)" />
          <path d="M 106 350 A 44 44 0 0 1 194 350" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
          <rect x="120" y="6" width="60" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <rect x="120" y="404" width="60" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        </svg>
        {lineup.map((player) => {
          const cx = 12 + (player.pos_x / 100) * 276;
          const cy = 12 + (player.pos_y / 100) * 396;
          return (
            <div
              key={player.id}
              className={`htm-player-token ${hovered === player.id ? "htm-player-token--hovered" : ""}`}
              style={{ left: `${(cx / 300) * 100}%`, top: `${(cy / 420) * 100}%` }}
              onTouchStart={() => setHovered(player.id)}
              onTouchEnd={() => setTimeout(() => setHovered(null), 1200)}
            >
              <svg className="htm-shirt" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 4 L6 10 L10 11 L10 30 L26 30 L26 11 L30 10 L26 4 C24 6 12 6 10 4 Z"
                  fill={primaryColor || "#fff"}
                  stroke={secondaryColor || "#000"}
                  strokeWidth="1.2"
                />
                <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="800"
                  fontFamily="'DM Mono', monospace" fill={numColor}>
                  {player.shirt_number}
                </text>
              </svg>
              <span className="htm-token-name">{player.player_name.split(" ").pop()}</span>
              {hovered === player.id && (
                <div className="htm-token-tooltip">
                  <span className="htm-tt-num">#{player.shirt_number}</span>
                  <span className="htm-tt-name">{player.player_name}</span>
                  {player.position_role && (
                    <span className="htm-tt-role">{POSITION_ROLE_LABEL[player.position_role] || player.position_role}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineupList({ lineup, primaryColor }) {
  return (
    <div className="htm-lineup-list">
      {lineup.map((p) => (
        <div key={p.id} className="htm-lineup-row">
          <span className="htm-lineup-num" style={{ background: primaryColor || "var(--htm-accent)" }}>
            {p.shirt_number}
          </span>
          <div className="htm-lineup-info">
            <span className="htm-lineup-name">{p.player_name}</span>
            {p.position_role && (
              <span className="htm-lineup-role">{POSITION_ROLE_LABEL[p.position_role] || p.position_role}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab Resumen ───────────────────────────────────────────────
function TabResumen({ team }) {
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--htm-accent)";
  return (
    <div className="htm-tab-content">
      <div className="htm-tab-header">
        <div className="htm-tab-icon"><Shield size={16} /></div>
        <div>
          <p className="htm-tab-header-title">IDENTIDAD DEL EQUIPO</p>
          <p className="htm-tab-header-sub">Historia y datos del club</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="htm-resumen-stats">
        {team.titles_count > 0 && (
          <div className="htm-resumen-stat">
            <span className="htm-resumen-stat-num" style={{ color: "var(--htm-gold)" }}>{team.titles_count}</span>
            <span className="htm-resumen-stat-lbl">TÍTULOS</span>
          </div>
        )}
        {team.squad_size && (
          <div className="htm-resumen-stat">
            <span className="htm-resumen-stat-num" style={{ color: "var(--htm-accent)" }}>{team.squad_size}</span>
            <span className="htm-resumen-stat-lbl">JUGADORES</span>
          </div>
        )}
        {team.country && (
          <div className="htm-resumen-stat">
            <span className="htm-resumen-stat-num" style={{ color: "var(--htm-green)", fontSize: "11px" }}>{team.country}</span>
            <span className="htm-resumen-stat-lbl">PAÍS</span>
          </div>
        )}
      </div>

      {/* Info chips */}
      <div className="htm-resumen-chips">
        {team.legacy_type && (
          <div className="htm-resumen-chip">
            <span className="htm-resumen-chip-lbl">TIPO</span>
            <span className="htm-resumen-chip-val" style={{ color: legColor, borderColor: `${legColor}44` }}>
              {LEGACY_LABEL[team.legacy_type] || team.legacy_type}
            </span>
          </div>
        )}
        {team.era_dominance && (
          <div className="htm-resumen-chip htm-resumen-chip--dark">
            <span className="htm-resumen-chip-lbl">ERA DE DOMINIO</span>
            <span className="htm-resumen-chip-val">{team.era_dominance}</span>
          </div>
        )}
        {team.formation && (
          <div className="htm-resumen-chip">
            <span className="htm-resumen-chip-lbl">FORMACIÓN</span>
            <span className="htm-resumen-chip-val">{team.formation}</span>
          </div>
        )}
        {team.manager && (
          <div className="htm-resumen-chip">
            <span className="htm-resumen-chip-lbl">ENTRENADOR</span>
            <span className="htm-resumen-chip-val">{team.manager}</span>
          </div>
        )}
      </div>

      {/* History text */}
      {(team.historical_note || team.description) && (
        <div className="htm-section-header">
          <span className="htm-section-bar" />
          <span className="htm-section-label">HISTORIA DEL CLUB</span>
        </div>
      )}
      {(team.historical_note || team.description) && (
        <div className="htm-history-body">
          {(team.historical_note || team.description).split("\n").map((p, i) =>
            p.trim() ? <p key={i}>{p.trim()}</p> : null
          )}
        </div>
      )}
      <div className="htm-tab-bottom-space" />
    </div>
  );
}

// ── Tab Palmarés ──────────────────────────────────────────────
function TabPalmares({ team, titles }) {
  return (
    <div className="htm-tab-content">
      <div className="htm-tab-header">
        <div className="htm-tab-icon"><Trophy size={16} /></div>
        <div>
          <p className="htm-tab-header-title">PALMARÉS</p>
          <p className="htm-tab-header-sub">Historial de títulos del equipo</p>
        </div>
      </div>

      {team.titles_count > 0 && (
        <div className="htm-palmares-total">
          <div className="htm-palmares-trophy-big">
            <Trophy size={28} />
          </div>
          <div>
            <p className="htm-palmares-total-num">{team.titles_count}</p>
            <p className="htm-palmares-total-lbl">TÍTULOS TOTALES</p>
          </div>
        </div>
      )}

      {titles.length === 0 ? (
        <div className="htm-empty-block">
          <Trophy size={28} strokeWidth={1} />
          <p>Sin títulos registrados</p>
        </div>
      ) : (
        <div className="htm-section-header">
          <span className="htm-section-bar" />
          <span className="htm-section-label">OTROS</span>
          <span className="htm-section-badge">{titles.length}</span>
        </div>
      )}

      {titles.length > 0 && (
        <div className="htm-titles-list">
          {titles.map((t, i) => (
            <div key={t.id} className="htm-title-row" style={{ "--i": i }}>
              <div className="htm-title-icon" style={{ background: team.primary_color || "var(--htm-accent)" }}>
                <Trophy size={12} color="#fff" />
              </div>
              <div className="htm-title-info">
                <span className="htm-title-name">{t.title_name}</span>
                {t.year && <span className="htm-title-year">{t.year}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="htm-tab-bottom-space" />
    </div>
  );
}

// ── Tab Alineación ────────────────────────────────────────────
function TabAlineacion({ team, lineup }) {
  return (
    <div className="htm-tab-content">
      <div className="htm-tab-header">
        <div className="htm-tab-icon"><Star size={16} /></div>
        <div>
          <p className="htm-tab-header-title">
            ALINEACIÓN HISTÓRICA
            {team.formation && <span className="htm-formation-tag">{team.formation}</span>}
          </p>
          <p className="htm-tab-header-sub">Toca un jugador para su detalle</p>
        </div>
      </div>

      {lineup.length === 0 ? (
        <div className="htm-empty-block">
          <Shield size={28} strokeWidth={1} />
          <p>Alineación no disponible</p>
        </div>
      ) : (
        <>
          <div className="htm-section-header">
            <span className="htm-section-bar" />
            <span className="htm-section-label">PLANTILLA COMPLETA</span>
            <span className="htm-section-badge">{lineup.length}</span>
          </div>
          <RetroField lineup={lineup} primaryColor={team.primary_color} secondaryColor={team.secondary_color} />
          <div className="htm-section-header">
            <span className="htm-section-bar" />
            <span className="htm-section-label">TITULARES</span>
            <span className="htm-section-badge">{lineup.length}</span>
          </div>
          <LineupList lineup={lineup} primaryColor={team.primary_color} />
        </>
      )}
      <div className="htm-tab-bottom-space" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DETAIL TOP BAR
// ══════════════════════════════════════════════════════════════
function DetailTopBar({ team, onBack }) {
  const img = getHistoricalImageUrl(team.image_path);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--htm-accent)";

  return (
    <div className="htm-detail-top" style={{ "--team-primary": team.primary_color || "#5b4fd8" }}>
      <div className="htm-detail-hero-bg" />
      <button className="htm-detail-back" onClick={onBack}>
        <ArrowLeft size={10} />
        <span>EQUIPOS</span>
      </button>
      <div className="htm-detail-hero-row">
        <div className="htm-detail-avatar">
          {img
            ? <img src={img} alt={team.name} />
            : <TeamInitials name={team.name} color={team.primary_color} />
          }
        </div>
        <div className="htm-detail-hero-info">
          {team.legacy_type && (
            <span className="htm-detail-legacy" style={{ color: legColor, borderColor: `${legColor}55` }}>
              {LEGACY_LABEL[team.legacy_type] || team.legacy_type}
            </span>
          )}
          <h1 className="htm-detail-name">{team.name}</h1>
          <div className="htm-detail-chips">
            {team.country && <span className="htm-chip"><MapPin size={9} />{team.country}</span>}
            {team.era_dominance && <span className="htm-chip htm-chip--era">{team.era_dominance}</span>}
            {team.titles_count > 0 && (
              <span className="htm-chip htm-chip--titles">
                <Trophy size={9} />{team.titles_count} títulos
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TEAM DETAIL VIEW
// ══════════════════════════════════════════════════════════════
function TeamDetailView({ teamId, onBack }) {
  const { team, lineup, titles, loading, error, reload } = useHistoricalTeamDetail(teamId);
  const [tab, setTab] = useState("resumen");

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ocultar bottom nav global igual que players
  useEffect(() => {
    const root = document.body;
    root.classList.add("htm-hide-bottom-nav");
    return () => root.classList.remove("htm-hide-bottom-nav");
  }, []);

  if (loading) return (
    <div className="htm-detail-loading">
      <RefreshCw size={20} className="htm-spin" />
      <span>Cargando equipo...</span>
    </div>
  );
  if (error || !team) return (
    <div className="htm-detail-error">
      <AlertCircle size={18} />
      <p>{error || "Equipo no encontrado"}</p>
      <button onClick={reload}><RefreshCw size={12} /> Reintentar</button>
    </div>
  );

  return (
    <div className="htm-detail">
      <DetailTopBar team={team} onBack={onBack} />
      <div className="htm-detail-content">
        {tab === "resumen" && <TabResumen team={team} />}
        {tab === "palmares" && <TabPalmares team={team} titles={titles} />}
        {tab === "alineacion" && <TabAlineacion team={team} lineup={lineup} />}
      </div>
      <nav className="htm-tab-bar">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`htm-tab-btn ${tab === key ? "htm-tab-btn--active" : ""}`}
            onClick={() => setTab(key)}
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function HistoricalTeamsMobile({ onBack, initialSelectedId }) {
  const { teams, loading, error, reload } = useHistoricalTeams();
  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setSelectedId(initialSelectedId || null);
  }, [initialSelectedId]);

  // Ocultar bottom nav cuando hay detalle
  useEffect(() => {
    const root = document.body;
    if (selectedId) {
      root.classList.add("htm-hide-bottom-nav");
    } else {
      root.classList.remove("htm-hide-bottom-nav");
    }
    return () => root.classList.remove("htm-hide-bottom-nav");
  }, [selectedId]);

  const filtered = useMemo(() => {
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter(t =>
      t.name?.toLowerCase().includes(q) || t.country?.toLowerCase().includes(q)
    );
  }, [teams, search]);

  const legendary = useMemo(
    () => teams.filter(t => ["Dynastic", "Dominant"].includes(t.legacy_type)).length,
    [teams]
  );
  const countries = useMemo(
    () => new Set(teams.map(t => t.country).filter(Boolean)).size,
    [teams]
  );

  if (selectedId) {
    return (
      <div className="htm-root">
        <TeamDetailView
          teamId={selectedId}
          onBack={() => {
            if (initialSelectedId) { onBack?.(); return; }
            setSelectedId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="htm-root">
      <TeamsHeader
        total={teams.length}
        legendary={legendary}
        countries={countries}
        onBack={onBack}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
        onRandom={() => teams.length > 0 && setModalOpen(true)}
      />

      <CounterRow count={filtered.length} />

      <div className="htm-grid">
        {loading && (
          <div className="htm-loading">
            <RefreshCw size={20} className="htm-spin" />
            <span>Cargando equipos...</span>
          </div>
        )}
        {!loading && error && (
          <div className="htm-error">
            <AlertCircle size={18} />
            <p>{error}</p>
            <button onClick={reload}><RefreshCw size={12} /> Reintentar</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="htm-empty-grid">
            <Shield size={32} strokeWidth={1} />
            <p>{teams.length === 0 ? "Aún no hay equipos históricos" : "Sin coincidencias"}</p>
            <span>
              {teams.length === 0
                ? "El administrador publicará los equipos pronto."
                : "Prueba con otro nombre."}
            </span>
          </div>
        )}
        {!loading && !error && filtered.map((team, idx) => (
          <TeamCard key={team.id} team={team} index={idx} onClick={(t) => setSelectedId(t.id)} />
        ))}
      </div>

      {modalOpen && (
        <RandomModal
          teams={teams}
          onSelect={(t) => { setSelectedId(t.id); setModalOpen(false); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}