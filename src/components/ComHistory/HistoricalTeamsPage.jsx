import { useState, useRef } from "react";
import {
  Shield, ArrowLeft, RefreshCw, AlertCircle,
  Trophy, Users2, Zap, ChevronRight, Search, X,
  Star, MapPin, Calendar, User2, Hash
} from "lucide-react";
import { useHistoricalTeams, useHistoricalTeamDetail } from "../../hooks/HooksHistory/useHistoricalTeams";
import { getHistoricalImageUrl } from "../../hooks/HooksHistory/useHistoricalPlayers";
import "../../styles/StylesHistory/HistoricalTeamsPage.css";
import "../../styles/StylesMobile/HistoricalTeamsPageMobile.css";

// ─── Mapas de traducción ──────────────────────────────────────
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

// ── Secciones de navegación ───────────────────────────────────
const SECTIONS = [
  { key: "squad", label: "Alineación", icon: Shield },
  { key: "history", label: "Historia", icon: Trophy },
  { key: "titles", label: "Palmarés", icon: Star },
];

// ══════════════════════════════════════════════════════════════
//  CAMPO DE FÚTBOL RETRO
// ══════════════════════════════════════════════════════════════
function RetroField({ lineup, primaryColor, secondaryColor }) {
  const [hovered, setHovered] = useState(null);

  // Color del texto de la camiseta (contraste)
  const isDark = (hex) => {
    if (!hex || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
  };
  const textColor = isDark(primaryColor) ? "#fff" : "#111";
  const numColor = isDark(primaryColor) ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.75)";

  return (
    <div className="htp-field-wrap">
      {/* Campo SVG retro */}
      <div className="htp-field">
        {/* Líneas del campo */}
        <svg className="htp-field-lines" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet">
          {/* Fondo césped */}
          <defs>
            <pattern id="grass" x="0" y="0" width="300" height="30" patternUnits="userSpaceOnUse">
              <rect width="300" height="15" fill="#2d7a2d" />
              <rect y="15" width="300" height="15" fill="#267226" />
            </pattern>
          </defs>
          <rect width="300" height="420" fill="url(#grass)" rx="4" />

          {/* Borde campo */}
          <rect x="12" y="12" width="276" height="396" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />

          {/* Línea central */}
          <line x1="12" y1="210" x2="288" y2="210" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />

          {/* Círculo central */}
          <circle cx="150" cy="210" r="42" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <circle cx="150" cy="210" r="2.5" fill="rgba(255,255,255,0.8)" />

          {/* Área grande arriba */}
          <rect x="72" y="12" width="156" height="58" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          {/* Área pequeña arriba */}
          <rect x="108" y="12" width="84" height="26" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
          {/* Punto penalti arriba */}
          <circle cx="150" cy="56" r="2" fill="rgba(255,255,255,0.75)" />
          {/* Arco área arriba */}
          <path d="M 106 70 A 44 44 0 0 0 194 70" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />

          {/* Área grande abajo */}
          <rect x="72" y="350" width="156" height="58" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          {/* Área pequeña abajo */}
          <rect x="108" y="382" width="84" height="26" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />
          {/* Punto penalti abajo */}
          <circle cx="150" cy="364" r="2" fill="rgba(255,255,255,0.75)" />
          {/* Arco área abajo */}
          <path d="M 106 350 A 44 44 0 0 1 194 350" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1" />

          {/* Porterías */}
          <rect x="120" y="6" width="60" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <rect x="120" y="404" width="60" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

          {/* Banderines */}
          <circle cx="12" cy="12" r="3" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
          <circle cx="288" cy="12" r="3" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
          <circle cx="12" cy="408" r="3" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
          <circle cx="288" cy="408" r="3" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
        </svg>

        {/* Jugadores sobre el campo */}
        {lineup.map((player) => {
          // pos_x y pos_y son 0..100 del campo interior (excl. márgenes)
          // Mapeamos al area jugable: x: 12..288 → 276px, y: 12..408 → 396px
          const cx = 12 + (player.pos_x / 100) * 276;
          const cy = 12 + (player.pos_y / 100) * 396;

          return (
            <div
              key={player.id}
              className={`htp-player-token ${hovered === player.id ? "htp-player-token--hovered" : ""}`}
              style={{
                left: `${(cx / 300) * 100}%`,
                top: `${(cy / 420) * 100}%`,
              }}
              onMouseEnter={() => setHovered(player.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Camiseta SVG */}
              <svg className="htp-shirt" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 4 L6 10 L10 11 L10 30 L26 30 L26 11 L30 10 L26 4 C24 6 12 6 10 4 Z"
                  fill={primaryColor || "#fff"}
                  stroke={secondaryColor || "#000"}
                  strokeWidth="1.2"
                />
                {/* Número */}
                <text
                  x="18" y="22"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fontFamily="'DM Mono', monospace"
                  fill={numColor}
                >
                  {player.shirt_number}
                </text>
              </svg>

              {/* Nombre */}
              <span
                className="htp-token-name"
                style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                {player.player_name.split(" ").pop()}
              </span>

              {/* Tooltip */}
              {hovered === player.id && (
                <div className="htp-token-tooltip">
                  <span className="htp-tt-num">#{player.shirt_number}</span>
                  <span className="htp-tt-name">{player.player_name}</span>
                  {player.position_role && (
                    <span className="htp-tt-role">{POSITION_ROLE_LABEL[player.position_role] || player.position_role}</span>
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

// ══════════════════════════════════════════════════════════════
//  LISTA DE JUGADORES (columna derecha del squad)
// ══════════════════════════════════════════════════════════════
function LineupList({ lineup, primaryColor }) {
  return (
    <div className="htp-lineup-list">
      {lineup.map((p) => (
        <div key={p.id} className="htp-lineup-row">
          <span
            className="htp-lineup-num"
            style={{ background: primaryColor || "var(--accent)", color: "#fff" }}
          >
            {p.shirt_number}
          </span>
          <div className="htp-lineup-info">
            <span className="htp-lineup-name">{p.player_name}</span>
            {p.position_role && (
              <span className="htp-lineup-role">
                {POSITION_ROLE_LABEL[p.position_role] || p.position_role}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DETALLE DE EQUIPO
// ══════════════════════════════════════════════════════════════
function TeamDetail({ teamId, onBack }) {
  const { team, lineup, titles, loading, error, reload } = useHistoricalTeamDetail(teamId);
  const [activeSection, setActiveSection] = useState("squad");
  const sectionRefs = {
    squad: useRef(null),
    history: useRef(null),
    titles: useRef(null),
  };

  const scrollTo = (key) => {
    setActiveSection(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return (
    <div className="htp-state-loading">
      <RefreshCw size={20} className="htp-spin" />
      <span>Cargando equipo...</span>
    </div>
  );

  if (error || !team) return (
    <div className="htp-state-error">
      <AlertCircle size={20} />
      <p>{error || "Equipo no encontrado"}</p>
      <button className="htp-retry-btn" onClick={reload}>
        <RefreshCw size={12} /> Reintentar
      </button>
    </div>
  );

  const imgUrl = getHistoricalImageUrl(team.image_path);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";

  return (
    <div className="htp-detail">
      <button className="htp-back-section-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Equipos
      </button>

      {/* ── HERO ── */}
      <div
        className="htp-hero"
        style={{ "--team-primary": team.primary_color || "#5b4fd8", "--team-secondary": team.secondary_color || "#fff" }}
      >
        <div className="htp-hero-color-strip" />
        <div className="htp-hero-body">
          {/* Escudo */}
          <div className="htp-hero-shield">
            {imgUrl
              ? <img src={imgUrl} alt={team.name} />
              : <Shield size={32} strokeWidth={1.2} />
            }
          </div>

          {/* Info */}
          <div className="htp-hero-info">
            <h1 className="htp-hero-name">{team.name}</h1>
            <div className="htp-hero-chips">
              {team.country && <span className="htp-chip htp-chip--country"><MapPin size={9} />{team.country}</span>}
              {team.founded_year && <span className="htp-chip"><Calendar size={9} />{team.founded_year}</span>}
              {team.era_dominance && <span className="htp-chip htp-chip--era">{team.era_dominance}</span>}
              {team.formation && <span className="htp-chip htp-chip--form">{team.formation}</span>}
              {team.manager && <span className="htp-chip"><User2 size={9} />{team.manager}</span>}
            </div>
            <div className="htp-hero-bottom">
              {team.legacy_type && (
                <span className="htp-legacy-badge" style={{ "--lc": legColor }}>
                  {LEGACY_TEAM_LABEL[team.legacy_type] || team.legacy_type}
                </span>
              )}
              {team.titles_count > 0 && (
                <span className="htp-titles-chip">
                  <Trophy size={10} /> {team.titles_count} título{team.titles_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── NAV DE SECCIONES ── */}
      <nav className="htp-section-nav">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`htp-snav-btn ${activeSection === key ? "htp-snav-btn--active" : ""}`}
            onClick={() => scrollTo(key)}
            style={activeSection === key ? { "--snav-c": team.primary_color || "var(--accent)" } : {}}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </nav>


      {/* ═══════════════════════════════════════
          SECCIÓN 1: HISTORIA
      ═══════════════════════════════════════ */}
      <section ref={sectionRefs.history} className="htp-section" id="history">
        <div className="htp-section-header">
          <span className="htp-section-label"><Trophy size={11} /> Por qué es histórico</span>
        </div>

        {team.historical_note ? (
          <div className="htp-history-body">
            {team.historical_note.split("\n").map((p, i) =>
              p.trim() ? <p key={i}>{p.trim()}</p> : null
            )}
          </div>
        ) : team.description ? (
          <div className="htp-history-body">
            {team.description.split("\n").map((p, i) =>
              p.trim() ? <p key={i}>{p.trim()}</p> : null
            )}
          </div>
        ) : (
          <p className="htp-history-empty">Sin descripción histórica.</p>
        )}

      </section>
      {/* ═══════════════════════════════════════
          SECCIÓN 2: PALMARÉS
      ═══════════════════════════════════════ */}
      <section ref={sectionRefs.titles} className="htp-section htp-section--last" id="titles">
        <div className="htp-section-header">
          <span className="htp-section-label"><Star size={11} /> Palmarés</span>
        </div>

        {titles.length === 0 ? (
          <div className="htp-empty-titles">
            <Star size={24} strokeWidth={1} />
            <p>Sin títulos registrados</p>
          </div>
        ) : (
          <div className="htp-titles-list">
            {titles.map((t, i) => (
              <div key={t.id} className="htp-title-row" style={{ "--i": i }}>
                <div className="htp-title-icon" style={{ background: team.primary_color || "var(--accent)" }}>
                  <Trophy size={12} color="#fff" />
                </div>
                <div className="htp-title-info">
                  <span className="htp-title-name">{t.title_name}</span>
                  {t.year && <span className="htp-title-year">{t.year}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* ═══════════════════════════════════════
          SECCIÓN 3: ALINEACIÓN
      ═══════════════════════════════════════ */}
      <section ref={sectionRefs.squad} className="htp-section" id="squad">
        <div className="htp-section-header">
          <span className="htp-section-label"><Shield size={11} /> Alineación Histórica</span>
          {team.formation && <span className="htp-formation-tag">{team.formation}</span>}
        </div>

        {lineup.length === 0 ? (
          <div className="htp-empty-lineup">
            <Shield size={28} strokeWidth={1} />
            <p>Alineación no disponible</p>
          </div>
        ) : (
          <div className="htp-squad-layout">
            <RetroField
              lineup={lineup}
              primaryColor={team.primary_color}
              secondaryColor={team.secondary_color}
            />
            <LineupList lineup={lineup} primaryColor={team.primary_color} />
          </div>
        )}
      </section>

    </div>
  );
}


// ══════════════════════════════════════════════════════════════
//  CARD DE EQUIPO EN LA GRILLA
// ══════════════════════════════════════════════════════════════
function TeamCard({ team, onClick }) {
  const imgUrl = getHistoricalImageUrl(team.image_path);
  const legColor = LEGACY_COLOR[team.legacy_type] || "var(--accent)";

  return (
    <article
      className="htp-team-card"
      onClick={() => onClick(team.id)}
      style={{ "--tc": team.primary_color || "#5b4fd8" }}
    >
      {/* Franja de color del equipo */}
      <div className="htp-tc-stripe" />

      <div className="htp-tc-body">
        {/* Escudo */}
        <div className="htp-tc-shield">
          {imgUrl
            ? <img src={imgUrl} alt={team.name} />
            : <Shield size={24} strokeWidth={1.2} />
          }
        </div>

        {/* Info */}
        <div className="htp-tc-info">
          <h3 className="htp-tc-name">{team.name}</h3>
          <div className="htp-tc-meta">
            {team.country && <span>{team.country}</span>}
            {team.era_dominance && <><span className="htp-tc-sep">·</span><span>{team.era_dominance}</span></>}
          </div>
          {team.legacy_type && (
            <span className="htp-tc-badge" style={{ "--lc": legColor }}>
              {LEGACY_TEAM_LABEL[team.legacy_type] || team.legacy_type}
            </span>
          )}
        </div>

        {/* Títulos count */}
        {team.titles_count > 0 && (
          <div className="htp-tc-titles">
            <Trophy size={10} />
            <span>{team.titles_count}</span>
          </div>
        )}

        <ChevronRight size={14} className="htp-tc-chevron" />
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL — HistoricalTeamsPage
// ══════════════════════════════════════════════════════════════
export default function HistoricalTeamsPage({ rightPanelRef, onBack }) {
  const [selectedId, setSelectedId] = useState(null);
  const { teams, loading, error, reload, search, setSearch } = useHistoricalTeams();

  if (selectedId) {
    return <TeamDetail teamId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="htp-root">

      <header className="htp-header">
        <div className="htp-header-left">
          <div className="htp-header-icon"><Shield size={18} strokeWidth={1.5} /></div>
          <div>
            <h1 className="htp-header-title">EQUIPOS HISTORICOS</h1>
            <p className="htp-header-sub">{teams.length} equipos legendarios</p>
          </div>
        </div>

        {/* ANTES tenías solo htp-search-wrap, ahora agrupa los dos */}
        <div className="htp-header-right">
          <div className="htp-search-wrap">
            <Search size={12} className="htp-search-ico" />
            <input
              className="htp-search-input"
              placeholder="Buscar equipo, país..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="htp-search-clear" onClick={() => setSearch("")}><X size={11} /></button>}
          </div>
          <button className="htp-back-vault-btn" onClick={onBack}>
            Volver
          </button>
        </div>
      </header>

      {/* Estados */}
      {loading && (
        <div className="htp-state-loading">
          <RefreshCw size={18} className="htp-spin" />
          <span>Cargando equipos...</span>
        </div>
      )}
      {error && !loading && (
        <div className="htp-state-error">
          <AlertCircle size={18} /><p>{error}</p>
          <button className="htp-retry-btn" onClick={reload}><RefreshCw size={12} /> Reintentar</button>
        </div>
      )}
      {!loading && !error && teams.length === 0 && (
        <div className="htp-state-empty">
          <Shield size={32} strokeWidth={1} />
          <p className="htp-empty-title">{search ? "Sin coincidencias" : "Aún no hay equipos"}</p>
          <p className="htp-empty-sub">{search ? "Prueba con otro nombre." : "El administrador publicará los equipos pronto."}</p>
        </div>
      )}

      {/* Grilla */}
      {!loading && !error && teams.length > 0 && (
        <div className="htp-teams-grid">
          {teams.map(t => (
            <TeamCard key={t.id} team={t} onClick={setSelectedId} />
          ))}
        </div>
      )}
    </div>
  );
}