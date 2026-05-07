import { useState, useMemo, useEffect } from "react";
import {
  Trophy, Search, X, ChevronLeft, Globe, Layers,
  Shield, RefreshCw, AlertCircle, Award, Flag,
  ChevronRight, Star, Minus, Calendar, Hash, Users, Shuffle, ArrowLeft,
} from "lucide-react";
import {
  useHistoricalCompetitions,
  useHistoricalCompetitionDetail,
  getHistoricalImageUrl,
} from "../../hooks/HooksHistory/useHistoricalCompetitions";
import KnockoutBracketMobile from "./KnockoutBracketMobile";
import SectionHeaderMobile from "../ComMobile/SectionHeaderMobile";
import "../../styles/StylesHistory/HistoricalCompetitionsPage.css";
import "../../styles/StylesMobile/HistoricalCompetitionsPageMobile.css";
import "../../styles/StylesMobile/KnockoutBracketMobile.css";

// ─── Hook: detecta si es mobile ──────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

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
              const advancing = i < 2;
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
//  LLAVE ELIMINATORIA — árbol SVG con líneas bezier
// ══════════════════════════════════════════════════════════════════════════════

const CARD_W = 210;
const CARD_H = 88;
const TEAM_H = 38;
const COL_GAP = 72;
const ROW_GAP = 24;

function BracketMatchCard({ match, x, y, isFinal, animDelay }) {
  const winA = match.winner === "team_a";
  const winB = match.winner === "team_b";
  const hasPen = match.penalties_a != null || match.penalties_b != null;
  const GOLD = "#f59e0b";

  const dividerY = y + TEAM_H;
  const remainH = CARD_H - TEAM_H;

  return (
    <g className="hcp-bk-match-group" style={{ animationDelay: `${animDelay}ms` }}>
      {/* Drop shadow rect */}
      <rect x={x + 2} y={y + 3} width={CARD_W} height={CARD_H} rx={4} className="hcp-bk-card-shadow" />
      {/* Card background */}
      <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={4} className="hcp-bk-card-bg" />
      {/* Winner accent stripe */}
      {(winA || winB) && (
        <rect x={x} y={y} width={3} height={CARD_H} rx={2}
          fill={isFinal ? GOLD : "var(--accent)"}
          opacity={0.9}
        />
      )}
      {/* Divider */}
      <line x1={x + 10} y1={dividerY} x2={x + CARD_W - 10} y2={dividerY} className="hcp-bk-divider" />

      {/* Team A */}
      <foreignObject x={x} y={y} width={CARD_W} height={TEAM_H}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className={`hcp-bk-team-row ${winA ? "hcp-bk-team--win" : winB ? "hcp-bk-team--lose" : ""}`}
          style={winA && isFinal ? { "--bk-win-color": GOLD } : {}}
        >
          <span className="hcp-bk-team-name">{match.team_a || "—"}</span>
          <span className="hcp-bk-score">{match.score_a ?? "–"}</span>
        </div>
      </foreignObject>

      {/* Team B */}
      <foreignObject x={x} y={dividerY} width={CARD_W} height={remainH}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className={`hcp-bk-team-row ${winB ? "hcp-bk-team--win" : winA ? "hcp-bk-team--lose" : ""}`}
          style={winB && isFinal ? { "--bk-win-color": GOLD } : {}}
        >
          <span className="hcp-bk-team-name">{match.team_b || "—"}</span>
          <span className="hcp-bk-score">{match.score_b ?? "–"}</span>
        </div>
      </foreignObject>

      {/* Penalties label */}
      {hasPen && (
        <text
          x={x + CARD_W / 2} y={dividerY}
          className="hcp-bk-pen-text"
          textAnchor="middle" dominantBaseline="middle"
        >
          ({match.penalties_a ?? "–"} – {match.penalties_b ?? "–"}) pen.
        </text>
      )}

      {/* Champion star on Final */}
      {isFinal && (winA || winB) && (
        <text
          x={x + CARD_W - 14} y={y + CARD_H / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={14} fill={GOLD} opacity={0.9}
        >★</text>
      )}
    </g>
  );
}

function KnockoutBracket({ knockout }) {
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

  const PAD_X = 20;
  const PAD_Y = 40;
  const maxMatches = Math.max(...rounds.map(r => byRound[r].length));

  const svgH = PAD_Y + maxMatches * CARD_H + (maxMatches - 1) * ROW_GAP + PAD_Y;
  const svgW = PAD_X + rounds.length * (CARD_W + COL_GAP) - COL_GAP + PAD_X;

  const getPositions = (colIdx) => {
    const count = byRound[rounds[colIdx]].length;
    const totalH = count * CARD_H + (count - 1) * ROW_GAP;
    const startY = PAD_Y + (svgH - PAD_Y * 2 - totalH) / 2;
    return Array.from({ length: count }, (_, i) => startY + i * (CARD_H + ROW_GAP));
  };

  const bezier = (x1, cy1, x2, cy2) => {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${cy1} C ${mx} ${cy1}, ${mx} ${cy2}, ${x2} ${cy2}`;
  };

  return (
    <div className="hcp-bk-wrapper">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ minWidth: Math.min(svgW, 300), maxWidth: svgW, display: "block" }}
        className="hcp-bk-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Conectores Bezier ── */}
        {rounds.slice(0, -1).map((round, colIdx) => {
          const posA = getPositions(colIdx);
          const posB = getPositions(colIdx + 1);
          const xR = PAD_X + colIdx * (CARD_W + COL_GAP) + CARD_W;
          const xL = PAD_X + (colIdx + 1) * (CARD_W + COL_GAP);
          const nextCount = byRound[rounds[colIdx + 1]].length;
          const paths = [];

          for (let j = 0; j < nextCount; j++) {
            const cy2 = posB[j] + CARD_H / 2;
            const iA = j * 2;
            const iB = j * 2 + 1;
            if (posA[iA] !== undefined) {
              paths.push(
                <path key={`${colIdx}-${j}-a`}
                  d={bezier(xR, posA[iA] + CARD_H / 2, xL, cy2)}
                  className="hcp-bk-connector"
                />
              );
            }
            if (posA[iB] !== undefined) {
              paths.push(
                <path key={`${colIdx}-${j}-b`}
                  d={bezier(xR, posA[iB] + CARD_H / 2, xL, cy2)}
                  className="hcp-bk-connector"
                />
              );
            }
          }
          return <g key={colIdx}>{paths}</g>;
        })}

        {/* ── Tarjetas de partido ── */}
        {rounds.map((round, colIdx) => {
          const isFinal = round === "Final";
          const positions = getPositions(colIdx);
          const x = PAD_X + colIdx * (CARD_W + COL_GAP);

          return (
            <g key={round}>
              <text
                x={x + CARD_W / 2} y={PAD_Y - 14}
                textAnchor="middle"
                className={`hcp-bk-round-label ${isFinal ? "hcp-bk-round-label--final" : ""}`}
              >
                {round}
              </text>

              {byRound[round].map((match, i) => (
                <BracketMatchCard
                  key={i}
                  match={match}
                  x={x}
                  y={positions[i]}
                  isFinal={isFinal}
                  animDelay={colIdx * 90 + i * 55}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  FICHA DE DATOS (en tab Información)
// ══════════════════════════════════════════════════════════════════════════════
function InfoMetaGrid({ competition }) {
  const fmt = competition.format;
  const typeStr = TYPE_LABEL[competition.type] || competition.type || null;

  const items = [
    competition.year && {
      icon: <Calendar size={13} />,
      label: "Año",
      value: competition.year,
      accent: true,
    },
    competition.country && {
      icon: <Globe size={13} />,
      label: "Sede",
      value: competition.country,
    },
    typeStr && {
      icon: <Flag size={13} />,
      label: "Tipo",
      value: typeStr,
      color: typeColor(competition.type),
    },
    competition.num_teams && {
      icon: <Users size={13} />,
      label: "Equipos",
      value: competition.num_teams,
      green: true,
    },

  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="hcp-meta-grid">
      {items.map((item, i) => (
        <div key={i} className="hcp-meta-item">
          <span
            className="hcp-meta-icon"
            style={item.color ? { color: item.color } : item.accent ? { color: "var(--accent)" } : item.green ? { color: "#10b981" } : {}}
          >
            {item.icon}
          </span>
          <div className="hcp-meta-content">
            <span className="hcp-meta-label">{item.label}</span>
            <span
              className="hcp-meta-value"
              style={item.color ? { color: item.color } : item.accent ? { color: "var(--accent)" } : item.green ? { color: "#10b981" } : {}}
            >
              {item.value}
            </span>
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
  const isMobile = useIsMobile();

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
      <button className="hcp-back-section-btn" onClick={onBack}>
        <ArrowLeft size={13} /> Competiciones
      </button>
      {/* ── HERO: solo logo + nombre + campeón ── */}
      <div className="hcp-detail-hero" style={{ "--type-color": typeColor(competition.type) }}>
        <div className="hcp-detail-logo-wrap">
          {imgUrl
            ? <img src={imgUrl} alt={competition.name} className="hcp-detail-logo" />
            : <span className="hcp-detail-logo-ph"><Trophy size={34} /></span>
          }
        </div>

        <div className="hcp-detail-hero-info">
          <h1 className="hcp-detail-name">{competition.name}</h1>

          {winner && (
            <div className="hcp-detail-winner">
              <Trophy size={14} />
              <span className="hcp-winner-label">Campeón:</span>
              <span className="hcp-winner-name">{winner}</span>
            </div>
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

      {/* ── INFO: ficha de datos + descripción ── */}
      {activeTab === "info" && (
        <div className="hcp-section hcp-section--info">
          <InfoMetaGrid competition={competition} />
          {competition.description && (
            <>
              <div className="hcp-info-divider">
                <span className="hcp-section-label"><Globe size={10} /> Contexto Histórico</span>
              </div>
              <div className="hcp-detail-desc">
                {competition.description.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </>
          )}
          {!competition.description && (
            <p className="hcp-empty-note" style={{ marginTop: 24 }}>Sin descripción registrada.</p>
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
        <div className="hcp-section hcp-section--knockout">
          <div className="hcp-section-header">
            <span className="hcp-section-label"><Trophy size={10} /> Fase Eliminatoria</span>
          </div>
          {isMobile
            ? <KnockoutBracketMobile knockout={knockout} />
            : <KnockoutBracket knockout={knockout} />
          }
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function HistoricalCompetitionsPage({ onBack, initialSelectedId }) {
  const {
    competitions, loading, error, reload,
    search, setSearch,
    filterType, setFilterType,
    filterFormat, setFilterFormat,
    types, formats,
  } = useHistoricalCompetitions();

  const [selectedId, setSelectedId] = useState(initialSelectedId || null);
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = filterType || filterFormat;

  const handleSelect = (comp) => setSelectedId(comp.id);
  const handleBack = () => setSelectedId(null);

  if (selectedId) {
    return (
      <div className="hcp-root hcp-root--detail">
        <CompetitionDetail competitionId={selectedId} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="hcp-root">

      {/* Header mobile */}
      <div className="hcp-mobile-header-wrap">
        <SectionHeaderMobile
          section="competitions"
          items={competitions}
          onRandomSelect={(comp) => setSelectedId(comp.id)}
          onBack={onBack}
        />
      </div>

      {/* Header desktop */}
      <header className="hcp-header hcp-header--desktop">
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
            {hasFilters && <span className="hcp-filter-dot" />}
          </button>
          <button className="hp-back-vault-btn" onClick={onBack}>
            <ArrowLeft size={12} />
          </button>
        </div>
      </header>

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

      <div className="hcp-results-bar">
        <span className="hcp-results-count">
          {competitions.length} competición{competitions.length !== 1 ? "es" : ""}
        </span>
      </div>

      {loading && (
        <div className="hcp-state hcp-state--loading">
          <RefreshCw size={15} className="hcp-spin" />
          <span>Cargando competiciones...</span>
        </div>
      )}

      {!loading && error && (
        <div className="hcp-state hcp-state--error">
          <AlertCircle size={18} />
          <p>{error}</p>
          <button className="hcp-retry-btn" onClick={reload}>
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

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