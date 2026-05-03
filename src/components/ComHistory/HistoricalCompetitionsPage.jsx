import { useState, useMemo } from "react";
import {
  Trophy, Search, X, ChevronLeft, Globe, Layers,
  Shield, RefreshCw, AlertCircle, Award, Flag,
  ChevronRight, Star, Minus
} from "lucide-react";
import {
  useHistoricalCompetitions,
  useHistoricalCompetitionDetail,
  getHistoricalImageUrl,
} from "../../hooks/HooksHistory/useHistoricalCompetitions";
import "../../styles/StylesHistory/HistoricalCompetitionsPage.css";
import "../../styles/StylesMobile/HistoricalCompetitionsPageMobile.css"

// ─── Mapas de etiquetas ───────────────────────────────────────────────────────
const TYPE_LABEL = {
  International: "Internacional",
  Continental: "Continental",
  Domestic: "Nacional",
};

const FORMAT_LABEL = {
  groups_knockout: "Grupos + Elim.",
  league_only: "Liga",
  knockout_only: "Eliminatorias",
};

const FORMAT_ICON = {
  groups_knockout: <Layers size={10} />,
  league_only: <Shield size={10} />,
  knockout_only: <Trophy size={10} />,
};

const ROUND_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

// ─── Helper: diferencia de goles ─────────────────────────────────────────────
const gd = (f, c) => {
  const d = (f || 0) - (c || 0);
  return d > 0 ? `+${d}` : String(d);
};

// ══════════════════════════════════════════════════════════════════════════════
//  CARD DE COMPETICIÓN (listado)
// ══════════════════════════════════════════════════════════════════════════════
function CompetitionCard({ comp, onClick, active }) {
  const imgUrl = getHistoricalImageUrl(comp.image_path);
  const winner = comp.historical_teams?.name || comp.winner_text || null;
  const typeStr = TYPE_LABEL[comp.type] || comp.type || "";
  const fmtStr = FORMAT_LABEL[comp.format] || "";

  return (
    <button
      className={`hcp-card ${active ? "hcp-card--active" : ""}`}
      onClick={() => onClick(comp)}
      style={{ "--type-color": typeColor(comp.type) }}
    >
      <div className="hcp-card-stripe" />

      <div className="hcp-card-logo-wrap">
        {imgUrl
          ? <img src={imgUrl} alt={comp.name} className="hcp-card-logo" />
          : <span className="hcp-card-logo-ph"><Trophy size={22} /></span>
        }
      </div>

      <div className="hcp-card-body">
        <div className="hcp-card-top">
          <span className="hcp-card-name">{comp.name}</span>
          {comp.year && <span className="hcp-card-year">{comp.year}</span>}
        </div>

        <div className="hcp-card-meta">
          {comp.country && <><Globe size={9} /><span>{comp.country}</span></>}
          {typeStr && <><span className="hcp-sep">·</span><span>{typeStr}</span></>}
        </div>

        <div className="hcp-card-footer">
          {fmtStr && (
            <span className="hcp-format-badge">
              {FORMAT_ICON[comp.format]}{fmtStr}
            </span>
          )}
          {winner && (
            <span className="hcp-winner-chip">
              <Trophy size={9} />{winner}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={13} className="hcp-card-chevron" />
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TABLA DE GRUPOS
// ══════════════════════════════════════════════════════════════════════════════
function GroupTable({ groupName, rows }) {
  return (
    <div className="hcp-group-block">
      <div className="hcp-group-name">{groupName}</div>
      <div className="hcp-table-wrap">
        <table className="hcp-table">
          <thead>
            <tr>
              <th className="hcp-th hcp-th--pos">#</th>
              <th className="hcp-th hcp-th--team">Equipo</th>
              <th className="hcp-th hcp-th--num">PJ</th>
              <th className="hcp-th hcp-th--num">G</th>
              <th className="hcp-th hcp-th--num">E</th>
              <th className="hcp-th hcp-th--num">P</th>
              <th className="hcp-th hcp-th--num">GF</th>
              <th className="hcp-th hcp-th--num">GC</th>
              <th className="hcp-th hcp-th--num">DG</th>
              <th className="hcp-th hcp-th--pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const pj = (row.wins || 0) + (row.draws || 0) + (row.losses || 0);
              const advancing = i < 2; // top 2 clasifican
              return (
                <tr key={row.id || i} className={`hcp-tr ${advancing ? "hcp-tr--adv" : ""}`}>
                  <td className="hcp-td hcp-td--pos">
                    {advancing
                      ? <span className="hcp-adv-dot" />
                      : <span className="hcp-pos-num">{row.position || i + 1}</span>
                    }
                  </td>
                  <td className="hcp-td hcp-td--team">{row.team_name}</td>
                  <td className="hcp-td hcp-td--num">{pj || "–"}</td>
                  <td className="hcp-td hcp-td--num">{row.wins ?? "–"}</td>
                  <td className="hcp-td hcp-td--num">{row.draws ?? "–"}</td>
                  <td className="hcp-td hcp-td--num">{row.losses ?? "–"}</td>
                  <td className="hcp-td hcp-td--num">{row.goals_for ?? "–"}</td>
                  <td className="hcp-td hcp-td--num">{row.goals_against ?? "–"}</td>
                  <td className="hcp-td hcp-td--num hcp-td--gd">{gd(row.goals_for, row.goals_against)}</td>
                  <td className="hcp-td hcp-td--pts">{row.points ?? "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TABLA DE LIGA
// ══════════════════════════════════════════════════════════════════════════════
function LeagueTable({ standings }) {
  return (
    <div className="hcp-table-wrap">
      <table className="hcp-table hcp-table--league">
        <thead>
          <tr>
            <th className="hcp-th hcp-th--pos">#</th>
            <th className="hcp-th hcp-th--team">Equipo</th>
            <th className="hcp-th hcp-th--num">PJ</th>
            <th className="hcp-th hcp-th--num">G</th>
            <th className="hcp-th hcp-th--num">E</th>
            <th className="hcp-th hcp-th--num">P</th>
            <th className="hcp-th hcp-th--num">GF</th>
            <th className="hcp-th hcp-th--num">GC</th>
            <th className="hcp-th hcp-th--num">DG</th>
            <th className="hcp-th hcp-th--pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const pj = (row.wins || 0) + (row.draws || 0) + (row.losses || 0);
            return (
              <tr key={row.id || i} className={`hcp-tr ${row.champion ? "hcp-tr--champion" : ""}`}>
                <td className="hcp-td hcp-td--pos">
                  {row.champion
                    ? <Star size={11} className="hcp-champion-star" />
                    : <span className="hcp-pos-num">{row.position}</span>
                  }
                </td>
                <td className="hcp-td hcp-td--team">
                  {row.team_name}
                  {row.champion && <span className="hcp-champion-tag">Campeón</span>}
                </td>
                <td className="hcp-td hcp-td--num">{pj || "–"}</td>
                <td className="hcp-td hcp-td--num">{row.wins ?? "–"}</td>
                <td className="hcp-td hcp-td--num">{row.draws ?? "–"}</td>
                <td className="hcp-td hcp-td--num">{row.losses ?? "–"}</td>
                <td className="hcp-td hcp-td--num">{row.goals_for ?? "–"}</td>
                <td className="hcp-td hcp-td--num">{row.goals_against ?? "–"}</td>
                <td className="hcp-td hcp-td--num hcp-td--gd">{gd(row.goals_for, row.goals_against)}</td>
                <td className="hcp-td hcp-td--pts">{row.points ?? "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LLAVE ELIMINATORIA
// ══════════════════════════════════════════════════════════════════════════════
function KnockoutBracket({ knockout }) {
  // Agrupar por ronda
  const byRound = useMemo(() => {
    return knockout.reduce((acc, m) => {
      const r = m.round || "Final";
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
      return acc;
    }, {});
  }, [knockout]);

  const rounds = ROUND_ORDER.filter(r => byRound[r]);
  if (rounds.length === 0) return <p className="hcp-empty-note">Sin partidos registrados.</p>;

  return (
    <div className="hcp-bracket">
      {rounds.map(round => (
        <div key={round} className="hcp-bracket-col">
          <div className="hcp-bracket-round-label">{round}</div>
          <div className="hcp-bracket-matches">
            {byRound[round].map((m, i) => {
              const winA = m.winner === "team_a";
              const winB = m.winner === "team_b";
              const sa = m.score_a != null ? m.score_a : null;
              const sb = m.score_b != null ? m.score_b : null;
              const hasPen = m.penalties_a != null || m.penalties_b != null;
              return (
                <div key={i} className="hcp-match-card">
                  <div className={`hcp-match-team ${winA ? "hcp-match-team--win" : winB ? "hcp-match-team--lose" : ""}`}>
                    <span className="hcp-match-team-name">{m.team_a || "—"}</span>
                    <span className="hcp-match-score">{sa ?? "–"}</span>
                  </div>
                  <div className="hcp-match-divider">
                    {hasPen && (
                      <span className="hcp-pen-label">
                        ({m.penalties_a ?? "–"} – {m.penalties_b ?? "–"}) pen.
                      </span>
                    )}
                  </div>
                  <div className={`hcp-match-team ${winB ? "hcp-match-team--win" : winA ? "hcp-match-team--lose" : ""}`}>
                    <span className="hcp-match-team-name">{m.team_b || "—"}</span>
                    <span className="hcp-match-score">{sb ?? "–"}</span>
                  </div>
                  {m.notes && <div className="hcp-match-notes">{m.notes}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VISTA DE DETALLE
// ══════════════════════════════════════════════════════════════════════════════
function CompetitionDetail({ competitionId, onBack }) {
  const { competition, groupedGroups, standings, knockout, loading, error, reload } =
    useHistoricalCompetitionDetail(competitionId);

  const [activeTab, setActiveTab] = useState("info");

  if (loading) {
    return (
      <div className="hcp-detail">
        <div className="hcp-state hcp-state--loading">
          <RefreshCw size={16} className="hcp-spin" />
          <span>Cargando competición...</span>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="hcp-detail">
        <div className="hcp-state hcp-state--error">
          <AlertCircle size={18} />
          <p>{error || "No encontrado"}</p>
          <button className="hcp-retry-btn" onClick={reload}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  const fmt = competition.format;
  const imgUrl = getHistoricalImageUrl(competition.image_path);
  const winner =
    competition.historical_teams?.name ||
    competition.winner_text ||
    null;

  const tabs = [
    { key: "info", label: "Información" },
    fmt === "groups_knockout" && Object.keys(groupedGroups).length > 0 &&
    { key: "groups", label: "Fase de Grupos" },
    fmt === "league_only" && standings.length > 0 &&
    { key: "standings", label: "Clasificación" },
    (fmt === "groups_knockout" || fmt === "knockout_only") && knockout.length > 0 &&
    { key: "knockout", label: "Eliminatorias" },
  ].filter(Boolean);

  return (
    <div className="hcp-detail">

      {/* Hero */}
      <div className="hcp-detail-hero">
        <div className="hcp-detail-logo-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={competition.name} className="hcp-detail-logo" />
            : <span className="hcp-detail-logo-ph"><Trophy size={34} /></span>
          }
        </div>

        <div className="hcp-detail-hero-info">
          <h1 className="hcp-detail-name">{competition.name}</h1>

          <div className="hcp-detail-chips">
            {competition.year && <span className="hcp-chip hcp-chip--year">{competition.year}</span>}
            {competition.country && <span className="hcp-chip hcp-chip--country"><Globe size={9} />{competition.country}</span>}
            {competition.type && <span className="hcp-chip hcp-chip--type" style={{ "--tc": typeColor(competition.type) }}>{TYPE_LABEL[competition.type] || competition.type}</span>}
            {fmt && <span className="hcp-chip hcp-chip--format">{FORMAT_ICON[fmt]}{FORMAT_LABEL[fmt]}</span>}
            {competition.num_teams && <span className="hcp-chip hcp-chip--teams"><Shield size={9} />{competition.num_teams} equipos</span>}
          </div>

          {winner && (
            <div className="hcp-detail-winner">
              <Trophy size={14} />
              <span className="hcp-winner-label">Campeón:</span>
              <span className="hcp-winner-name">{winner}</span>
            </div>
          )}

          {competition.edition && (
            <p className="hcp-detail-edition">{competition.edition}</p>
          )}
        </div>
      </div>

      {/* Tabs de sección */}
      {tabs.length > 1 && (
        <nav className="hcp-section-nav">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`hcp-snav-btn ${activeTab === key ? "hcp-snav-btn--active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* ── INFO ── */}
      {activeTab === "info" && (
        <div className="hcp-section">
          {competition.description ? (
            <>
              <div className="hcp-section-header">
                <span className="hcp-section-label"><Globe size={10} /> Contexto Histórico</span>
              </div>
              <div className="hcp-detail-desc">
                {competition.description.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </>
          ) : (
            <p className="hcp-empty-note">Sin descripción registrada.</p>
          )}
        </div>
      )}

      {/* ── GRUPOS ── */}
      {activeTab === "groups" && (
        <div className="hcp-section">
          <div className="hcp-section-header">
            <span className="hcp-section-label"><Layers size={10} /> Fase de Grupos</span>
          </div>
          <div className="hcp-groups-grid">
            {Object.entries(groupedGroups).map(([name, rows]) => (
              <GroupTable key={name} groupName={name} rows={rows} />
            ))}
          </div>
          <div className="hcp-groups-legend">
            <span className="hcp-adv-dot" />
            <span>Clasificado · PJ = Partidos jugados · DG = Diferencia de goles</span>
          </div>
        </div>
      )}

      {/* ── LIGA ── */}
      {activeTab === "standings" && (
        <div className="hcp-section">
          <div className="hcp-section-header">
            <span className="hcp-section-label"><Award size={10} /> Clasificación Final</span>
          </div>
          <LeagueTable standings={standings} />
        </div>
      )}

      {/* ── ELIMINATORIAS ── */}
      {activeTab === "knockout" && (
        <div className="hcp-section">
          <div className="hcp-section-header">
            <span className="hcp-section-label"><Trophy size={10} /> Fase Eliminatoria</span>
          </div>
          <KnockoutBracket knockout={knockout} />
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoricalCompetitionsPage() {
  const {
    competitions, loading, error, reload,
    search, setSearch,
    filterType, setFilterType,
    filterFormat, setFilterFormat,
    types, formats,
  } = useHistoricalCompetitions();

  const [selectedId, setSelectedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = filterType || filterFormat;

  const handleSelect = (comp) => setSelectedId(comp.id);
  const handleBack = () => setSelectedId(null);

  // Vista detalle
  if (selectedId) {
    return (
      <div className="hcp-root hcp-root--detail">
        <CompetitionDetail competitionId={selectedId} onBack={handleBack} />
      </div>
    );
  }

  // Vista listado
  return (
    <div className="hcp-root">
      {/* Header */}
      <header className="hcp-header">
        <div className="hcp-header-left">
          <div className="hcp-header-icon">
            <Trophy size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="hcp-header-title">COMPETICIONES HISTORICAS</h1>
            <p className="hcp-header-sub">Torneos que definieron una era</p>
          </div>
        </div>

        <div className="hcp-search-wrap">
          <div className="hcp-search">
            <Search size={13} className="hcp-search-ico" />
            <input
              className="hcp-search-input"
              placeholder="Buscar competición..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="hcp-search-clear" onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>

          <button
            className={`hcp-filter-btn ${showFilters ? "hcp-filter-btn--active" : ""}`}
            onClick={() => setShowFilters(v => !v)}
          >
            <Layers size={12} />
            Filtros
            {hasFilters && <span className="hcp-filter-dot" />}
          </button>
        </div>
      </header>

      {/* Filtros */}
      {showFilters && (
        <div className="hcp-filters-panel">
          <div className="hcp-filters-row">
            <div className="hcp-filter-group">
              <label className="hcp-filter-label">Tipo</label>
              <select className="hcp-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">Todos</option>
                {types.map(t => <option key={t} value={t}>{TYPE_LABEL[t] || t}</option>)}
              </select>
            </div>
            <div className="hcp-filter-group">
              <label className="hcp-filter-label">Formato</label>
              <select className="hcp-filter-select" value={filterFormat} onChange={e => setFilterFormat(e.target.value)}>
                <option value="">Todos</option>
                {formats.map(f => <option key={f} value={f}>{FORMAT_LABEL[f] || f}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button className="hcp-clear-filters" onClick={() => { setFilterType(""); setFilterFormat(""); }}>
                <X size={11} /> Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barra de resultados */}
      <div className="hcp-results-bar">
        <span className="hcp-results-count">
          {competitions.length} competición{competitions.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Estado: cargando */}
      {loading && (
        <div className="hcp-state hcp-state--loading">
          <RefreshCw size={15} className="hcp-spin" />
          <span>Cargando competiciones...</span>
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && (
        <div className="hcp-state hcp-state--error">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button className="hcp-retry-btn" onClick={reload}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

      {/* Estado: vacío */}
      {!loading && !error && competitions.length === 0 && (
        <div className="hcp-state hcp-state--empty">
          <Trophy size={32} strokeWidth={1} />
          <p className="hcp-empty-title">Sin competiciones</p>
          <p className="hcp-empty-sub">
            {search || hasFilters
              ? "Intenta con otros filtros o términos de búsqueda."
              : "Aún no hay competiciones publicadas."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && competitions.length > 0 && (
        <div className="hcp-grid">
          {competitions.map(comp => (
            <CompetitionCard
              key={comp.id}
              comp={comp}
              onClick={handleSelect}
              active={comp.id === selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helper color por tipo ────────────────────────────────────────────────────
function typeColor(type) {
  switch (type) {
    case "International": return "#e8a020";
    case "Continental": return "#3daa80";
    case "Domestic": return "#5b4fd8";
    default: return "#888780";
  }
}
