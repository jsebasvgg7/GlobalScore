import { useState, useMemo, useEffect, useRef } from "react";
import {
  Trophy, Search, X, Layers, Shield, RefreshCw, AlertCircle,
  Award, Globe, Star, Calendar, Users, ArrowLeft, ChevronRight,
  Filter, Shuffle,
} from "lucide-react";
import {
  useHistoricalCompetitions,
  useHistoricalCompetitionDetail,
  getHistoricalImageUrl,
} from "../../hooks/useHistoricalCompetitions";
import KnockoutBracketMobile from "./KnockoutBracketMobile";
import "../../styles/mobile/HistoricalCompetitionsPageMobile.css";

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

const TYPE_COLOR = {
  International: "#e8a020",
  Continental: "#3daa80",
  Domestic: "#5b4fd8",
};

const ROUND_ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];

const gd = (f, c) => {
  const d = (f || 0) - (c || 0);
  return d > 0 ? `+${d}` : String(d);
};

function useIsMounted() {
  const ref = useRef(true);
  useEffect(() => () => { ref.current = false; }, []);
  return ref;
}

function Skel({ w = "100%", h = 14, round = false }) {
  return (
    <span
      className="hcm-skel"
      style={{ width: w, height: h, borderRadius: round ? "50%" : 3, display: "block" }}
    />
  );
}

function GroupTable({ groupName, rows }) {
  return (
    <div className="hcm-group-block">
      <div className="hcm-group-name">{groupName}</div>
      <div className="hcm-table-wrap">
        <table className="hcm-table">
          <thead>
            <tr>
              <th className="hcm-th hcm-th--pos">#</th>
              <th className="hcm-th hcm-th--team">Equipo</th>
              <th className="hcm-th hcm-th--num">PJ</th>
              <th className="hcm-th hcm-th--num">G</th>
              <th className="hcm-th hcm-th--num">E</th>
              <th className="hcm-th hcm-th--num">P</th>
              <th className="hcm-th hcm-th--num">GF</th>
              <th className="hcm-th hcm-th--num">GC</th>
              <th className="hcm-th hcm-th--num">DG</th>
              <th className="hcm-th hcm-th--pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const pj = (row.wins || 0) + (row.draws || 0) + (row.losses || 0);
              const adv = i < 2;
              return (
                <tr key={row.id || i} className={`hcm-tr ${adv ? "hcm-tr--adv" : ""}`}>
                  <td className="hcm-td hcm-td--pos">
                    {adv ? <span className="hcm-adv-dot" /> : <span className="hcm-pos-num">{row.position || i + 1}</span>}
                  </td>
                  <td className="hcm-td hcm-td--team">{row.team_name}</td>
                  <td className="hcm-td hcm-td--num">{pj || "–"}</td>
                  <td className="hcm-td hcm-td--num">{row.wins ?? "–"}</td>
                  <td className="hcm-td hcm-td--num">{row.draws ?? "–"}</td>
                  <td className="hcm-td hcm-td--num">{row.losses ?? "–"}</td>
                  <td className="hcm-td hcm-td--num">{row.goals_for ?? "–"}</td>
                  <td className="hcm-td hcm-td--num">{row.goals_against ?? "–"}</td>
                  <td className="hcm-td hcm-td--num hcm-td--gd">{gd(row.goals_for, row.goals_against)}</td>
                  <td className="hcm-td hcm-td--pts">{row.points ?? "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeagueTable({ standings }) {
  return (
    <div className="hcm-table-wrap">
      <table className="hcm-table">
        <thead>
          <tr>
            <th className="hcm-th hcm-th--pos">#</th>
            <th className="hcm-th hcm-th--team">Equipo</th>
            <th className="hcm-th hcm-th--num">PJ</th>
            <th className="hcm-th hcm-th--num">G</th>
            <th className="hcm-th hcm-th--num">E</th>
            <th className="hcm-th hcm-th--num">P</th>
            <th className="hcm-th hcm-th--num">GF</th>
            <th className="hcm-th hcm-th--num">GC</th>
            <th className="hcm-th hcm-th--num">DG</th>
            <th className="hcm-th hcm-th--pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const pj = (row.wins || 0) + (row.draws || 0) + (row.losses || 0);
            return (
              <tr key={row.id || i} className={`hcm-tr ${row.champion ? "hcm-tr--champion" : ""}`}>
                <td className="hcm-td hcm-td--pos">
                  {row.champion
                    ? <Star size={10} className="hcm-champion-star" />
                    : <span className="hcm-pos-num">{row.position}</span>
                  }
                </td>
                <td className="hcm-td hcm-td--team">
                  {row.team_name}
                  {row.champion && <span className="hcm-champion-tag">Campeón</span>}
                </td>
                <td className="hcm-td hcm-td--num">{pj || "–"}</td>
                <td className="hcm-td hcm-td--num">{row.wins ?? "–"}</td>
                <td className="hcm-td hcm-td--num">{row.draws ?? "–"}</td>
                <td className="hcm-td hcm-td--num">{row.losses ?? "–"}</td>
                <td className="hcm-td hcm-td--num">{row.goals_for ?? "–"}</td>
                <td className="hcm-td hcm-td--num">{row.goals_against ?? "–"}</td>
                <td className="hcm-td hcm-td--num hcm-td--gd">{gd(row.goals_for, row.goals_against)}</td>
                <td className="hcm-td hcm-td--pts">{row.points ?? "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CompetitionDetail({ competitionId, onBack }) {
  const { competition, groupedGroups, standings, knockout, loading, error, reload } =
    useHistoricalCompetitionDetail(competitionId);
  const [activeTab, setActiveTab] = useState("info");

  if (loading) {
    return (
      <div className="hcm-detail">
        <div className="hcm-state hcm-state--loading">
          <RefreshCw size={15} className="hcm-spin" />
          <span>Cargando competición...</span>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="hcm-detail">
        <div className="hcm-state hcm-state--error">
          <AlertCircle size={16} />
          <p>{error || "No encontrado"}</p>
          <button className="hcm-retry-btn" onClick={reload}>
            <RefreshCw size={10} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  const fmt = competition.format;
  const imgUrl = getHistoricalImageUrl(competition.image_path);
  const winner = competition.historical_teams?.name || competition.winner_text || null;
  const typeColor = TYPE_COLOR[competition.type] || "#888";
  const typeLabel = TYPE_LABEL[competition.type] || competition.type || "";

  const tabs = [
    { key: "info", label: "Info" },
    fmt === "groups_knockout" && Object.keys(groupedGroups).length > 0 && { key: "groups", label: "Grupos" },
    fmt === "league_only" && standings.length > 0 && { key: "standings", label: "Tabla" },
    (fmt === "groups_knockout" || fmt === "knockout_only") && knockout.length > 0 && { key: "knockout", label: "Eliminat." },
  ].filter(Boolean);

  return (
    <div className="hcm-detail">
      <button className="hcm-back-btn" onClick={onBack}>
        <ArrowLeft size={13} />
        <span>Competiciones</span>
      </button>

      <div className="hcm-detail-hero" style={{ "--tc": typeColor }}>
        <div className="hcm-detail-hero-bg" />
        <div className="hcm-detail-logo-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={competition.name} className="hcm-detail-logo" />
            : <Trophy size={28} />
          }
        </div>
        <div className="hcm-detail-hero-body">
          <div className="hcm-detail-type-chip" style={{ background: typeColor + "22", color: typeColor, borderColor: typeColor + "55" }}>
            {typeLabel}
          </div>
          <h1 className="hcm-detail-name">{competition.name}</h1>
          {winner && (
            <div className="hcm-detail-winner">
              <Trophy size={11} />
              <span className="hcm-detail-winner-label">Campeón</span>
              <span className="hcm-detail-winner-name">{winner}</span>
            </div>
          )}
        </div>
      </div>

      {tabs.length > 1 && (
        <nav className="hcm-tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`hcm-tab-btn ${activeTab === key ? "hcm-tab-btn--active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {activeTab === "info" && (
        <div className="hcm-section">
          <div className="hcm-meta-grid">
            {competition.year && (
              <div className="hcm-meta-item">
                <span className="hcm-meta-icon" style={{ color: "var(--hcm-accent)" }}><Calendar size={13} /></span>
                <div>
                  <span className="hcm-meta-label">Año</span>
                  <span className="hcm-meta-value" style={{ color: "var(--hcm-accent)" }}>{competition.year}</span>
                </div>
              </div>
            )}
            {competition.country && (
              <div className="hcm-meta-item">
                <span className="hcm-meta-icon"><Globe size={13} /></span>
                <div>
                  <span className="hcm-meta-label">Sede</span>
                  <span className="hcm-meta-value">{competition.country}</span>
                </div>
              </div>
            )}
            {typeLabel && (
              <div className="hcm-meta-item">
                <span className="hcm-meta-icon" style={{ color: typeColor }}><Shield size={13} /></span>
                <div>
                  <span className="hcm-meta-label">Tipo</span>
                  <span className="hcm-meta-value" style={{ color: typeColor }}>{typeLabel}</span>
                </div>
              </div>
            )}
            {competition.num_teams && (
              <div className="hcm-meta-item">
                <span className="hcm-meta-icon" style={{ color: "#10b981" }}><Users size={13} /></span>
                <div>
                  <span className="hcm-meta-label">Equipos</span>
                  <span className="hcm-meta-value" style={{ color: "#10b981" }}>{competition.num_teams}</span>
                </div>
              </div>
            )}
          </div>

          {competition.description && (
            <div className="hcm-desc-wrap">
              <div className="hcm-desc-label">
                <Globe size={9} />
                <span>Contexto Histórico</span>
              </div>
              <div className="hcm-desc-body">
                {competition.description.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "groups" && (
        <div className="hcm-section">
          <div className="hcm-section-label"><Layers size={9} /> Fase de Grupos</div>
          <div className="hcm-groups-list">
            {Object.entries(groupedGroups).map(([name, rows]) => (
              <GroupTable key={name} groupName={name} rows={rows} />
            ))}
          </div>
          <div className="hcm-legend">
            <span className="hcm-adv-dot" />
            <span>Clasificado · DG = Diferencia de goles</span>
          </div>
        </div>
      )}

      {activeTab === "standings" && (
        <div className="hcm-section">
          <div className="hcm-section-label"><Award size={9} /> Clasificación Final</div>
          <LeagueTable standings={standings} />
        </div>
      )}

      {activeTab === "knockout" && (
        <div className="hcm-section hcm-section--knockout">
          <div className="hcm-section-label"><Trophy size={9} /> Fase Eliminatoria</div>
          <KnockoutBracketMobile knockout={knockout} />
        </div>
      )}
    </div>
  );
}

function CompCard({ comp, onClick }) {
  const imgUrl = getHistoricalImageUrl(comp.image_path);
  const winner = comp.historical_teams?.name || comp.winner_text || null;
  const typeColor = TYPE_COLOR[comp.type] || "#888";

  return (
    <button className="hcm-card" onClick={() => onClick(comp)}>
      <div className="hcm-card-stripe" style={{ background: typeColor }} />
      <div className="hcm-card-logo">
        {imgUrl
          ? <img src={imgUrl} alt={comp.name} />
          : <Trophy size={20} />
        }
      </div>
      <div className="hcm-card-body">
        <span className="hcm-card-name">{comp.name}</span>
        <div className="hcm-card-meta">
          {comp.country && <span>{comp.country}</span>}
          {comp.year && <><span className="hcm-sep">·</span><span className="hcm-card-year">{comp.year}</span></>}
          {comp.type && <><span className="hcm-sep">·</span><span style={{ color: typeColor }}>{TYPE_LABEL[comp.type] || comp.type}</span></>}
        </div>
        {winner && (
          <div className="hcm-card-winner">
            <Trophy size={8} />
            <span>{winner}</span>
          </div>
        )}
        {comp.format && (
          <span className="hcm-card-fmt">{FORMAT_LABEL[comp.format] || comp.format}</span>
        )}
      </div>
      <ChevronRight size={15} className="hcm-card-chevron" />
    </button>
  );
}

export default function HistoricalCompetitionsMobile({ onBack, initialSelectedId }) {
  const {
    competitions, loading, error, reload,
    search, setSearch,
    filterType, setFilterType,
    filterFormat, setFilterFormat,
    types, formats,
  } = useHistoricalCompetitions();

  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const handleBack = () => {
    onBack?.();
  };
  const [filterOpen, setFilterOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinItem, setSpinItem] = useState(null);
  const spinRef = useRef(null);
  const spinTimeout = useRef(null);

  useEffect(() => {
    setSelectedId(initialSelectedId || null);
  }, [initialSelectedId]);

  const hasFilters = filterType || filterFormat;

  const handleSpin = () => {
    if (spinning || competitions.length === 0) return;
    const picked = competitions[Math.floor(Math.random() * competitions.length)];
    let i = 0;
    setSpinning(true);
    setSpinItem(competitions[0]);
    spinRef.current = setInterval(() => {
      setSpinItem(competitions[i % competitions.length]);
      i++;
    }, 80);
    spinTimeout.current = setTimeout(() => {
      clearInterval(spinRef.current);
      setSpinItem(picked);
      setSpinning(false);
      setTimeout(() => setSelectedId(picked.id), 350);
    }, 2400);
  };

  useEffect(() => () => {
    clearInterval(spinRef.current);
    clearTimeout(spinTimeout.current);
  }, []);

  if (selectedId) {
    return (
      <div className="hcm-root">
        <CompetitionDetail
          competitionId={selectedId}
          onBack={onBack}
        />
      </div>
    );
  }

  return (
    <div className="hcm-root">
      <div className="hcm-header">
        <div className="hcm-header-bg" aria-hidden="true" />
        <button className="hcm-header-back" onClick={onBack}>
          <ArrowLeft size={14} />
        </button>
        <div className="hcm-header-inner">
          <div className="hcm-eyebrow">
            <span className="hcm-eyebrow-line" />
            <span className="hcm-eyebrow-text">Archivo Histórico</span>
            <span className="hcm-eyebrow-line" />
          </div>
          <h1 className="hcm-title">
            <span className="hcm-title-solid">COMPE</span>
            <span className="hcm-title-outline">TICIONES</span>
          </h1>
          <p className="hcm-subtitle">{competitions.length} torneos registrados</p>

          <div className="hcm-spin-zone">
            {!spinning && !spinItem && (
              <button
                className={`hcm-spin-btn ${competitions.length === 0 ? "hcm-spin-btn--off" : ""}`}
                onClick={handleSpin}
                disabled={competitions.length === 0}
              >
                <Shuffle size={12} />
                <span>Competición aleatoria</span>
              </button>
            )}
            {(spinning || spinItem) && (
              <div className={`hcm-slot-wrap ${spinning ? "hcm-slot-wrap--spin" : "hcm-slot-wrap--done"}`}>
                {spinItem && (
                  <div className="hcm-slot-item">
                    <div className="hcm-slot-logo">
                      {getHistoricalImageUrl(spinItem.image_path)
                        ? <img src={getHistoricalImageUrl(spinItem.image_path)} alt={spinItem.name} />
                        : <Trophy size={16} />
                      }
                    </div>
                    <div className="hcm-slot-info">
                      <span className="hcm-slot-name">{spinItem.name}</span>
                      <span className="hcm-slot-meta">{spinItem.country}{spinItem.year ? ` · ${spinItem.year}` : ""}</span>
                    </div>
                    {!spinning && <ChevronRight size={14} className="hcm-slot-chevron" />}
                  </div>
                )}
                {!spinning && (
                  <button className="hcm-slot-clear" onClick={() => setSpinItem(null)}>
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hcm-toolbar">
        <div className={`hcm-search-box ${search ? "hcm-search-box--active" : ""}`}>
          <Search size={13} className="hcm-search-ico" />
          <input
            className="hcm-search-input"
            placeholder="Buscar competición..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="hcm-search-clear" onClick={() => setSearch("")}>
              <X size={11} />
            </button>
          )}
        </div>
        <button
          className={`hcm-filter-toggle ${filterOpen ? "hcm-filter-toggle--active" : ""} ${hasFilters ? "hcm-filter-toggle--has" : ""}`}
          onClick={() => setFilterOpen(v => !v)}
        >
          <Filter size={14} />
          {hasFilters && <span className="hcm-filter-dot" />}
        </button>
      </div>

      {filterOpen && (
        <div className="hcm-filter-panel">
          <div className="hcm-filter-group">
            <span className="hcm-filter-label">Tipo</span>
            <div className="hcm-filter-chips">
              {types.map(t => (
                <button
                  key={t}
                  className={`hcm-chip ${filterType === t ? "hcm-chip--active" : ""}`}
                  onClick={() => setFilterType(filterType === t ? "" : t)}
                >
                  {TYPE_LABEL[t] || t}
                </button>
              ))}
            </div>
          </div>
          <div className="hcm-filter-group">
            <span className="hcm-filter-label">Formato</span>
            <div className="hcm-filter-chips">
              {formats.map(f => (
                <button
                  key={f}
                  className={`hcm-chip ${filterFormat === f ? "hcm-chip--active" : ""}`}
                  onClick={() => setFilterFormat(filterFormat === f ? "" : f)}
                >
                  {FORMAT_LABEL[f] || f}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button className="hcm-filter-clear" onClick={() => { setFilterType(""); setFilterFormat(""); }}>
              <X size={10} /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      <div className="hcm-results-bar">
        <span className="hcm-results-count">{competitions.length} resultado{competitions.length !== 1 ? "s" : ""}</span>
      </div>

      {loading && (
        <div className="hcm-state hcm-state--loading">
          <RefreshCw size={14} className="hcm-spin" />
          <span>Cargando...</span>
        </div>
      )}

      {!loading && error && (
        <div className="hcm-state hcm-state--error">
          <AlertCircle size={16} />
          <p>{error}</p>
          <button className="hcm-retry-btn" onClick={reload}>
            <RefreshCw size={10} /> Reintentar
          </button>
        </div>
      )}

      {!loading && !error && competitions.length === 0 && (
        <div className="hcm-state hcm-state--empty">
          <Trophy size={28} strokeWidth={1} />
          <p>Sin competiciones</p>
          <span>{search || hasFilters ? "Intenta con otros filtros." : "Aún no hay datos."}</span>
        </div>
      )}

      {!loading && !error && competitions.length > 0 && (
        <div className="hcm-list">
          {competitions.map(comp => (
            <CompCard key={comp.id} comp={comp} onClick={c => setSelectedId(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
