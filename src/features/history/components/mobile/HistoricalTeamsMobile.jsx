import { useState, useEffect, useRef } from "react";
import {
  Shield, ArrowLeft, RefreshCw, AlertCircle,
  Trophy, Star, MapPin, Calendar, User2,
  Search, X, ChevronRight, Shuffle,
} from "lucide-react";
import { useHistoricalTeams, useHistoricalTeamDetail } from "../../hooks/useHistoricalTeams";
import { getHistoricalImageUrl } from "../../hooks/useHistoricalPlayers";
import "../../styles/mobile/HistoricalTeamsMobile.css";

const LEGACY_TEAM_LABEL = {
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

const SECTIONS = [
  { key: "history", label: "Historia", icon: Trophy },
  { key: "titles", label: "Palmarés", icon: Star },
  { key: "squad", label: "Alineación", icon: Shield },
];

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
                <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="'DM Mono', monospace" fill={numColor}>
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
          <span className="htm-lineup-num" style={{ background: primaryColor || "var(--accent)" }}>
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

function TeamDetail({ teamId, onBack }) {
  const { team, lineup, titles, loading, error, reload } = useHistoricalTeamDetail(teamId);
  const [activeSection, setActiveSection] = useState("history");

  if (loading) return (
    <div className="htm-state htm-state--loading">
      <RefreshCw size={16} className="htm-spin" />
      <span>Cargando equipo...</span>
    </div>
  );

  if (error || !team) return (
    <div className="htm-state htm-state--error">
      <AlertCircle size={18} />
      <p>{error || "Equipo no encontrado"}</p>
      <button className="htm-retry-btn" onClick={reload}>
        <RefreshCw size={11} /> Reintentar
      </button>
    </div>
  );

  const imgUrl = getHistoricalImageUrl(team.image_path);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";

  return (
    <div className="htm-detail">
      <button className="htm-back-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Equipos
      </button>

      <div className="htm-detail-hero" style={{ "--team-primary": team.primary_color || "#5b4fd8" }}>
        <div className="htm-detail-hero-bg" />
        <div className="htm-detail-logo-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={team.name} className="htm-detail-logo" />
            : <Shield size={30} strokeWidth={1.2} />
          }
        </div>
        <div className="htm-detail-hero-body">
          {team.legacy_type && (
            <span className="htm-detail-legacy" style={{ "--lc": legColor }}>
              {LEGACY_TEAM_LABEL[team.legacy_type] || team.legacy_type}
            </span>
          )}
          <h1 className="htm-detail-name">{team.name}</h1>
          <div className="htm-detail-chips">
            {team.country && <span className="htm-chip"><MapPin size={9} />{team.country}</span>}
            {team.founded_year && <span className="htm-chip"><Calendar size={9} />{team.founded_year}</span>}
            {team.era_dominance && <span className="htm-chip htm-chip--era">{team.era_dominance}</span>}
            {team.formation && <span className="htm-chip htm-chip--form">{team.formation}</span>}
            {team.manager && <span className="htm-chip"><User2 size={9} />{team.manager}</span>}
          </div>
          {team.titles_count > 0 && (
            <span className="htm-titles-chip">
              <Trophy size={10} /> {team.titles_count} título{team.titles_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <nav className="htm-tabs">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`htm-tab-btn ${activeSection === key ? "htm-tab-btn--active" : ""}`}
            onClick={() => setActiveSection(key)}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </nav>

      {activeSection === "history" && (
        <div className="htm-section">
          <div className="htm-section-label"><Trophy size={10} /> Por qué es histórico</div>
          {team.historical_note || team.description ? (
            <div className="htm-history-body">
              {(team.historical_note || team.description).split("\n").map((p, i) =>
                p.trim() ? <p key={i}>{p.trim()}</p> : null
              )}
            </div>
          ) : (
            <p className="htm-empty-note">Sin descripción histórica.</p>
          )}
        </div>
      )}

      {activeSection === "titles" && (
        <div className="htm-section">
          <div className="htm-section-label"><Star size={10} /> Palmarés</div>
          {titles.length === 0 ? (
            <div className="htm-empty-block">
              <Star size={24} strokeWidth={1} />
              <p>Sin títulos registrados</p>
            </div>
          ) : (
            <div className="htm-titles-list">
              {titles.map((t, i) => (
                <div key={t.id} className="htm-title-row" style={{ "--i": i }}>
                  <div className="htm-title-icon" style={{ background: team.primary_color || "var(--accent)" }}>
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
        </div>
      )}

      {activeSection === "squad" && (
        <div className="htm-section">
          <div className="htm-section-label">
            <Shield size={10} /> Alineación Histórica
            {team.formation && <span className="htm-formation-tag">{team.formation}</span>}
          </div>
          {lineup.length === 0 ? (
            <div className="htm-empty-block">
              <Shield size={24} strokeWidth={1} />
              <p>Alineación no disponible</p>
            </div>
          ) : (
            <>
              <RetroField lineup={lineup} primaryColor={team.primary_color} secondaryColor={team.secondary_color} />
              <LineupList lineup={lineup} primaryColor={team.primary_color} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoricalTeamsMobile({ onBack, initialSelectedId }) {
  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const [search, setSearch] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const spinTimer = useRef(null);

  const { teams, loading, error, reload } = useHistoricalTeams();

  useEffect(() => {
    setSelectedId(initialSelectedId || null);
  }, [initialSelectedId]);

  const filtered = teams.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.country?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpin = () => {
    if (!teams.length || spinning) return;
    setSpinResult(null);
    setSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setSpinResult(teams[Math.floor(Math.random() * teams.length)]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final = teams[Math.floor(Math.random() * teams.length)];
        setSpinResult(final);
        setSpinning(false);
      }
    }, 80);
    spinTimer.current = interval;
  };

  const handleSpinGo = () => {
    if (spinResult) setSelectedId(spinResult.id);
  };

  const clearSpin = () => setSpinResult(null);

  if (selectedId) {
    return (
      <div className="htm-root">
        <TeamDetail
          teamId={selectedId}
          onBack={() => {
            if (initialSelectedId) {
              onBack?.();
              return;
            }

            setSelectedId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="htm-root">
      <div className="htm-header">
        <div className="htm-header-bg" />
        <button className="htm-header-back" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>

        <div className="htm-header-inner">
          <div className="htm-eyebrow">
            <span className="htm-eyebrow-line" />
            <span className="htm-eyebrow-text">Archivo Histórico</span>
            <span className="htm-eyebrow-line" />
          </div>
          <div className="htm-title">
            <span className="htm-title-solid">EQUI</span>
            <span className="htm-title-outline">POS</span>
          </div>
          <p className="htm-subtitle">Equipos legendarios del fútbol</p>

          <div className="htm-spin-zone">
            <button className={`htm-spin-btn ${spinning ? "htm-spin-btn--off" : ""}`} onClick={handleSpin}>
              <Shuffle size={13} />
              {spinning ? "Sorteando..." : "Equipo Aleatorio"}
            </button>

            {spinResult && (
              <div className={`htm-slot-wrap ${spinning ? "htm-slot-wrap--spin" : "htm-slot-wrap--done"}`} onClick={handleSpinGo}>
                <div className="htm-slot-item">
                  <div className="htm-slot-logo">
                    {getHistoricalImageUrl(spinResult.image_path)
                      ? <img src={getHistoricalImageUrl(spinResult.image_path)} alt={spinResult.name} />
                      : <Shield size={16} />
                    }
                  </div>
                  <div className="htm-slot-info">
                    <span className="htm-slot-name">{spinResult.name}</span>
                    <span className="htm-slot-meta">{spinResult.country}{spinResult.era_dominance ? ` · ${spinResult.era_dominance}` : ""}</span>
                  </div>
                  {!spinning && <ChevronRight size={14} className="htm-slot-chevron" />}
                </div>
                {!spinning && (
                  <button className="htm-slot-clear" onClick={(e) => { e.stopPropagation(); clearSpin(); }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="htm-toolbar">
        <div className={`htm-search-box ${search ? "htm-search-box--active" : ""}`}>
          <Search size={13} className="htm-search-ico" />
          <input
            className="htm-search-input"
            placeholder="Buscar equipo, país..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="htm-search-clear" onClick={() => setSearch("")}>
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="htm-results-bar">
        <span className="htm-results-count">{filtered.length} equipo{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading && (
        <div className="htm-state htm-state--loading">
          <RefreshCw size={15} className="htm-spin" />
          <span>Cargando equipos...</span>
        </div>
      )}

      {!loading && error && (
        <div className="htm-state htm-state--error">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button className="htm-retry-btn" onClick={reload}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="htm-state htm-state--empty">
          <Shield size={32} strokeWidth={1} />
          <p>{search ? "Sin coincidencias" : "Aún no hay equipos"}</p>
          <span>{search ? "Prueba con otro nombre." : "El administrador publicará los equipos pronto."}</span>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="htm-list">
          {filtered.map((team, idx) => {
            const imgUrl = getHistoricalImageUrl(team.image_path);
            const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";
            return (
              <button
                key={team.id}
                className="htm-card"
                style={{ "--tc": team.primary_color || "#5b4fd8", "--i": idx }}
                onClick={() => setSelectedId(team.id)}
              >
                <div className="htm-card-stripe" style={{ background: team.primary_color || "var(--accent)" }} />
                <div className="htm-card-logo">
                  {imgUrl
                    ? <img src={imgUrl} alt={team.name} />
                    : <Shield size={20} strokeWidth={1.2} />
                  }
                </div>
                <div className="htm-card-body">
                  <span className="htm-card-name">{team.name}</span>
                  <div className="htm-card-meta">
                    {team.country && <span>{team.country}</span>}
                    {team.era_dominance && <><span className="htm-sep">·</span><span>{team.era_dominance}</span></>}
                  </div>
                  <div className="htm-card-footer">
                    {team.legacy_type && (
                      <span className="htm-card-legacy" style={{ color: legColor, borderColor: legColor + "44" }}>
                        {LEGACY_TEAM_LABEL[team.legacy_type] || team.legacy_type}
                      </span>
                    )}
                    {team.titles_count > 0 && (
                      <span className="htm-card-titles">
                        <Trophy size={9} /> {team.titles_count}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={14} className="htm-card-chevron" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
