import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft, Search, X, Filter, Shuffle,
  User, Shield, Globe, Trophy, Clock, TrendingUp,
  Star, Zap, ChevronRight, RefreshCw, AlertCircle,
  BookOpen, BarChart2,
} from 'lucide-react';
import {
  useHistoricalPlayers,
  useHistoricalPlayerDetail,
  getHistoricalImageUrl,
} from '@/features/history/hooks/useHistoricalPlayers';
import '../../styles/mobile/HistoricalPlayersMobile.css';
import '../../styles/mobile/HistoricalPlayersMobile.dark.css';

// ─── Diccionarios ──────────────────────────────────────────────
const POSITION_LABEL = {
  Forward: 'Delantero', Midfielder: 'Mediocampista',
  'Play-maker': 'Media Punta', 'All-rounder': 'Todocampista',
  Defender: 'Defensor', Goalkeeper: 'Portero',
};
const LEGACY_LABEL = {
  'Goal Scorer': 'Goleador', Tactician: 'Táctico',
  Innovator: 'Genio', Leader: 'Líder',
  Goalkeeper: 'Portero', Technician: 'Técnico',
};
const SIG_LABEL = ['', 'Activo', 'Notable', 'Icónico', 'Leyenda', 'GOAT'];

const FILTER_OPTIONS = [
  {
    key: 'position', label: 'POSICIÓN', options: [
      { value: 'Forward', label: 'Delantero' },
      { value: 'Midfielder', label: 'Mediocampista' },
      { value: 'Defender', label: 'Defensor' },
      { value: 'Goalkeeper', label: 'Portero' },
      { value: 'All-rounder', label: 'Todocampista' },
      { value: 'Play-maker', label: 'Media Punta' },
    ],
  },
  {
    key: 'legacy_type', label: 'LEGADO', options: [
      { value: 'Goal Scorer', label: 'Goleador' },
      { value: 'Tactician', label: 'Táctico' },
      { value: 'Innovator', label: 'Genio' },
      { value: 'Leader', label: 'Líder' },
      { value: 'Goalkeeper', label: 'Portero' },
      { value: 'Technician', label: 'Técnico' },
    ],
  },
  {
    key: 'significance_level', label: 'NIVEL', options: [
      { value: '5', label: 'GOAT' },
      { value: '4', label: 'Leyenda' },
      { value: '3', label: 'Icónico' },
      { value: '2', label: 'Notable' },
      { value: '1', label: 'Activo' },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
//  MICRO-HELPERS
// ══════════════════════════════════════════════════════════════

function DotGrid({ cols = 5, rows = 4 }) {
  return (
    <svg className="hpm-dot-grid" width={cols * 14} height={rows * 14} aria-hidden="true">
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle key={`${r}-${c}`} cx={c * 14 + 7} cy={r * 14 + 7} r={1.5} />
        ))
      )}
    </svg>
  );
}

function PlayerInitials({ name }) {
  const parts = (name || '').split(' ');
  const init = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name || '??').slice(0, 2).toUpperCase();
  return <span className="hpm-initials">{init}</span>;
}

function Stars({ level, size = 10 }) {
  return (
    <span className="hpm-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size}
          fill={n <= level ? '#F59E0B' : 'none'}
          stroke={n <= level ? '#F59E0B' : '#C4BFB8'} />
      ))}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
//  HEADER — fiel a _PlayersHeader Flutter
// ══════════════════════════════════════════════════════════════
function PlayersHeader({ total, goats, countries, onBack }) {
  return (
    <header className="hpm-header">
      <DotGrid cols={6} rows={4} />
      <div className="hpm-breadcrumb">
        <button className="hpm-back-btn" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={10} />
          <span>HISTÓRICO</span>
        </button>
        <span className="hpm-breadcrumb-sep">›</span>
        <span className="hpm-breadcrumb-active">JUGADORES</span>
      </div>
      <div className="hpm-title-row">
        <div className="hpm-title-bar" />
        <div>
          <h1 className="hpm-title">JUGADORES</h1>
          <p className="hpm-subtitle">Explora las leyendas del fútbol.</p>
        </div>
      </div>
      <div className="hpm-stats-wrap">
        <div className="hpm-stats">
          <div className="hpm-stat-cell hpm-stat-cell--accent">
            <div className="hpm-stat-icon"><User size={15} /></div>
            <div className="hpm-stat-info">
              <span className="hpm-stat-num">{total || '—'}</span>
              <span className="hpm-stat-lbl">JUGADORES</span>
            </div>
          </div>
          <div className="hpm-stat-cell hpm-stat-cell--gold">
            <div className="hpm-stat-icon"><Star size={15} /></div>
            <div className="hpm-stat-info">
              <span className="hpm-stat-num">{goats || '—'}</span>
              <span className="hpm-stat-lbl">GOATS</span>
            </div>
          </div>
          <div className="hpm-stat-cell hpm-stat-cell--green">
            <div className="hpm-stat-icon"><Globe size={15} /></div>
            <div className="hpm-stat-info">
              <span className="hpm-stat-num">{countries || '—'}</span>
              <span className="hpm-stat-lbl">PAÍSES</span>
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
function SearchBar({ value, onChange, onClear, onFilter, hasFilters, filterCount, onRandom }) {
  return (
    <div className="hpm-search-row">
      <div className="hpm-search-wrap">
        <Search size={14} className="hpm-search-ico" />
        <input
          className="hpm-search-input"
          placeholder="Buscar jugador..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="hpm-search-clear" onClick={onClear} aria-label="Limpiar">
            <X size={12} />
          </button>
        )}
      </div>
      <button
        className={`hpm-icon-btn ${hasFilters ? 'hpm-icon-btn--active' : ''}`}
        onClick={onFilter}
        aria-label="Filtros"
      >
        <Filter size={15} />
        {hasFilters && <span className="hpm-filter-dot">{filterCount}</span>}
      </button>
      <button className="hpm-icon-btn hpm-icon-btn--dark" onClick={onRandom} aria-label="Aleatorio">
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
    <div className="hpm-counter-row">
      <div className="hpm-counter-left">
        <span className="hpm-counter-bar" />
        <span className="hpm-counter-label">JUGADORES</span>
      </div>
      <span className="hpm-counter-badge">{count} ENCONTRADOS</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PLAYER CARD — grid 2 cols neobrutalista
// ══════════════════════════════════════════════════════════════
function PlayerCard({ player, onClick }) {
  const img = getHistoricalImageUrl(player.image_path);
  const sig = player.significance_level || 0;
  const isGoat = sig === 5;
  const num = (Math.abs(player.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 99) + 1;

  return (
    <article className="hpm-player-card" onClick={() => onClick(player)}>
      <div className="hpm-card-photo">
        {img
          ? <img src={img} alt={player.name} className="hpm-card-img" />
          : <PlayerInitials name={player.name} />
        }
        {isGoat && <span className="hpm-card-goat">GOAT</span>}
        <span className="hpm-card-num">#{num}</span>
        <span className="hpm-card-more">···</span>
      </div>
      <div className="hpm-card-body">
        <p className="hpm-card-name">{player.name.toUpperCase()}</p>
        {player.country && <p className="hpm-card-country">{player.country.toUpperCase()}</p>}
        {player.position && (
          <p className="hpm-card-pos">
            {(POSITION_LABEL[player.position] || player.position).toUpperCase()}
          </p>
        )}
        {sig > 0 && (
          <div className="hpm-card-trophies">
            {Array.from({ length: Math.min(sig, 5) }, (_, i) => (
              <Trophy key={i} size={10} className="hpm-card-trophy" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════
//  FILTER SHEET
// ══════════════════════════════════════════════════════════════
function FilterSheet({ activeFilters, onApply, onClose }) {
  const [draft, setDraft] = useState({ ...activeFilters });
  const toggle = (key, val) =>
    setDraft((prev) => ({ ...prev, [key]: prev[key] === val ? '' : val }));
  const hasActive = Object.values(draft).some(Boolean);

  return (
    <div className="hpm-sheet-backdrop" onClick={onClose}>
      <div className="hpm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="hpm-sheet-handle" />
        <div className="hpm-sheet-header">
          <span className="hpm-sheet-title">FILTRAR</span>
          {hasActive && (
            <button className="hpm-sheet-clear"
              onClick={() => { setDraft({}); onApply({}); onClose(); }}>
              Limpiar todo
            </button>
          )}
        </div>
        <div className="hpm-sheet-body">
          {FILTER_OPTIONS.map((group) => (
            <div key={group.key} className="hpm-sheet-group">
              <p className="hpm-sheet-group-label">{group.label}</p>
              <div className="hpm-sheet-chips">
                {group.options.map((opt) => {
                  const isOn = draft[group.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className={`hpm-sheet-chip ${isOn ? 'hpm-sheet-chip--on' : ''}`}
                      onClick={() => toggle(group.key, opt.value)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="hpm-sheet-footer">
          <button className="hpm-sheet-apply" onClick={() => { onApply(draft); onClose(); }}>
            APLICAR FILTROS
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  RANDOM MODAL — fiel a _RandomPlayerModal Flutter
// ══════════════════════════════════════════════════════════════
function RandomModal({ players, onSelect, onClose }) {
  const [displayed, setDisplayed] = useState(null);
  const [phase, setPhase] = useState('spinning');
  const winner = useRef(players[Math.floor(Math.random() * players.length)]);
  const ivRef = useRef(null);
  const toRef = useRef(null);

  const runSpin = (win) => {
    if (ivRef.current) clearInterval(ivRef.current);
    if (toRef.current) clearTimeout(toRef.current);
    let i = 0;
    ivRef.current = setInterval(() => {
      setDisplayed(players[i % players.length]);
      i++;
    }, 80);
    toRef.current = setTimeout(() => {
      clearInterval(ivRef.current);
      setDisplayed(win);
      setPhase('revealed');
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
    winner.current = players[Math.floor(Math.random() * players.length)];
    setPhase('spinning');
    setDisplayed(null);
    runSpin(winner.current);
  };

  const img = displayed ? getHistoricalImageUrl(displayed.image_path) : null;

  return (
    <div className="hpm-modal-backdrop" onClick={onClose}>
      <div className="hpm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="hpm-modal-header">
          <Shuffle size={13} />
          <span>MODO ALEATORIO</span>
          <button className="hpm-modal-close" onClick={onClose}><X size={13} /></button>
        </div>
        <div className="hpm-modal-body">
          <div className={`hpm-slot ${phase === 'revealed' ? 'hpm-slot--revealed' : 'hpm-slot--spinning'}`}>
            {displayed ? (
              <div className="hpm-slot-row">
                <div className="hpm-slot-avatar">
                  {img
                    ? <img src={img} alt={displayed.name} />
                    : <PlayerInitials name={displayed.name} />
                  }
                  {displayed.significance_level === 5 && (
                    <span className="hpm-slot-goat">GOAT</span>
                  )}
                </div>
                <div className="hpm-slot-info">
                  <p className="hpm-slot-name">{displayed.name.toUpperCase()}</p>
                  <p className="hpm-slot-meta">
                    {displayed.country}
                    {displayed.position ? ` · ${POSITION_LABEL[displayed.position] || displayed.position}` : ''}
                  </p>
                </div>
                {phase === 'revealed' && <ChevronRight size={16} className="hpm-slot-arrow" />}
              </div>
            ) : (
              <div className="hpm-slot-empty"><RefreshCw size={22} className="hpm-spin" /></div>
            )}
          </div>

          {phase === 'spinning' && (
            <div className="hpm-slot-status-row">
              <span className="hpm-slot-dot" />
              <span className="hpm-slot-status">BUSCANDO...</span>
              <span className="hpm-slot-dot" />
            </div>
          )}

          {phase === 'revealed' && (
            <>
              <button className="hpm-modal-cta" onClick={() => { onSelect(winner.current); onClose(); }}>
                VER JUGADOR →
              </button>
              <button className="hpm-modal-secondary" onClick={spin}>
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
//  DETALLE — 5 tabs fiel a Flutter PlayerDetail
// ══════════════════════════════════════════════════════════════
const TABS = [
  { key: 'resumen', label: 'RESUMEN', Icon: BarChart2 },
  { key: 'trayectoria', label: 'TRAYECTO', Icon: TrendingUp },
  { key: 'equipos', label: 'EQUI & MOM', Icon: Shield },
  { key: 'palmares', label: 'PALMARÉS', Icon: Trophy },
  { key: 'historia', label: 'HISTORIA', Icon: BookOpen },
];

function PlayerDetailView({ playerId, onBack }) {
  const { player, teams, events, career, national, titles, loading, error, reload } =
    useHistoricalPlayerDetail(playerId);
  const [tab, setTab] = useState('resumen');

  if (loading) return (
    <div className="hpm-detail-loading">
      <RefreshCw size={20} className="hpm-spin" />
      <span>Cargando jugador...</span>
    </div>
  );
  if (error || !player) return (
    <div className="hpm-detail-error">
      <AlertCircle size={18} />
      <p>{error || 'Jugador no encontrado'}</p>
      <button onClick={reload}><RefreshCw size={12} /> Reintentar</button>
    </div>
  );

  return (
    <div className="hpm-detail">
      <DetailTopBar player={player} onBack={onBack} />
      <div className="hpm-detail-content">
        {tab === 'resumen' && <TabResumen player={player} career={career} national={national} titles={titles} />}
        {tab === 'trayectoria' && <TabTrayectoria career={career} national={national} />}
        {tab === 'equipos' && <TabEquipos teams={teams} events={events} />}
        {tab === 'palmares' && <TabPalmares titles={titles} />}
        {tab === 'historia' && <TabHistoria player={player} career={career} national={national} titles={titles} />}
      </div>
      <nav className="hpm-tab-bar">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`hpm-tab-btn ${tab === key ? 'hpm-tab-btn--active' : ''}`}
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

// ── Detail Top Bar ──────────────────────────────────────────────
function DetailTopBar({ player, onBack }) {
  const sig = player.significance_level || 0;
  const isGoat = sig === 5;
  return (
    <header className="hpm-detail-topbar">
      <button className="hpm-detail-back" onClick={onBack} aria-label="Volver">
        <ArrowLeft size={15} />
      </button>
      <div className="hpm-detail-breadcrumb">
        <span className="hpm-detail-breadcrumb-path">HISTÓRICO › LEYENDAS</span>
        <span className="hpm-detail-breadcrumb-name">{player.name.toUpperCase()}</span>
      </div>
      {isGoat ? (
        <span className="hpm-detail-badge hpm-detail-badge--goat">GOAT</span>
      ) : sig >= 2 ? (
        <span className="hpm-detail-badge hpm-detail-badge--sig">
          {SIG_LABEL[sig]?.toUpperCase()}
        </span>
      ) : null}
    </header>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB RESUMEN — fiel a PlayerTabResumen Flutter
// ══════════════════════════════════════════════════════════════
function TabResumen({ player, career, national, titles }) {
  const img = getHistoricalImageUrl(player.image_path);
  const sig = player.significance_level || 0;
  const isGoat = sig === 5;
  const isActive = sig === 1;
  const posLabel = POSITION_LABEL[player.position] || player.position || '';
  const lifespan = player.birth_year
    ? `${player.birth_year}${player.death_year ? ` – ${player.death_year}` : ' – Presente'}`
    : null;

  const totals = (career || []).reduce(
    (a, r) => ({
      goals: a.goals + (parseInt(r.goals) || 0),
      assists: a.assists + (parseInt(r.assists) || 0),
      apps: a.apps + (parseInt(r.appearances) || 0),
      clubs: a.clubs + 1,
    }),
    { goals: 0, assists: 0, apps: 0, clubs: 0 }
  );
  const nat = (national || []).reduce(
    (a, r) => ({ caps: a.caps + (parseInt(r.caps) || 0), goals: a.goals + (parseInt(r.goals) || 0) }),
    { caps: 0, goals: 0 }
  );
  const titlesCount = (titles || []).reduce(
    (s, t) => t.title_category !== 'individual' ? s + (parseInt(t.quantity) || 1) : s, 0
  );

  return (
    <div className="hpm-tab-scroll">
      {/* Hero section */}
      <div className="hpm-resumen-hero">
        <DotGrid cols={5} rows={3} />
        <div className="hpm-resumen-row">
          <div className="hpm-resumen-photo-wrap">
            <div className="hpm-resumen-photo">
              {img ? <img src={img} alt={player.name} /> : <PlayerInitials name={player.name} />}
              {isGoat && <span className="hpm-photo-goat">GOAT</span>}
              {isActive && <span className="hpm-photo-active">ACTIVO</span>}
              {(player.ballon_dor_count || 0) > 0 && (
                <span className="hpm-photo-ballon">
                  <Trophy size={8} /> {player.ballon_dor_count}
                </span>
              )}
            </div>
          </div>
          <div className="hpm-resumen-info">
            <span className="hpm-resumen-archivo">+ ARCHIVO HISTÓRICO</span>
            <h2 className="hpm-resumen-name">{player.name.toUpperCase()}</h2>
            {player.legacy_type && (
              <span className="hpm-resumen-legacy">
                + {(LEGACY_LABEL[player.legacy_type] || player.legacy_type).toUpperCase()} +
              </span>
            )}
            {sig >= 2 && (
              <div className="hpm-resumen-stars">
                <Stars level={sig} size={11} />
                <span className="hpm-resumen-sig-label" style={{ color: isGoat ? '#F59E0B' : '#88887D' }}>
                  {SIG_LABEL[sig]?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="hpm-resumen-chips">
              {posLabel && <span className="hpm-chip hpm-chip--accent"><Zap size={8} />{posLabel}</span>}
              {player.country && <span className="hpm-chip"><Globe size={8} />{player.country}</span>}
              {lifespan && <span className="hpm-chip"><Clock size={8} />{lifespan}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid 2x3 */}
      <div className="hpm-stats-grid">
        <StatCell value={totals.goals + nat.goals || '—'} label="GOLES" />
        <StatCell value={totals.assists || '—'} label="ASISTENCIAS" />
        <StatCell value={nat.goals || '—'} label="INT'L GOLES" />
        <StatCell value={totals.clubs || '—'} label="CLUBES" />
        <StatCell value={nat.caps || '—'} label="INT'L PART." />
        <StatCell value={titlesCount || '—'} label="TÍTULOS" highlight />
      </div>

      {player.impact_summary && (
        <>
          <SectionHeader label="TRASCENDENCIA" />
          <div className="hpm-impact-card">
            <p>{player.impact_summary}</p>
          </div>
        </>
      )}

      {player.description && (
        <>
          <SectionHeader label="DESCRIPCIÓN" />
          <p className="hpm-description">{player.description}</p>
        </>
      )}
      <div className="hpm-tab-bottom-space" />
    </div>
  );
}

function StatCell({ value, label, highlight }) {
  return (
    <div className={`hpm-stat-cell-grid ${highlight ? 'hpm-stat-cell-grid--gold' : ''}`}>
      <span className="hpm-stat-cell-num">{value}</span>
      <span className="hpm-stat-cell-lbl">{label}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB TRAYECTORIA — fiel a PlayerTabTrayectoria Flutter
// ══════════════════════════════════════════════════════════════
function TabTrayectoria({ career, national }) {
  return (
    <div className="hpm-tab-scroll">
      <TabHeader
        icon={<TrendingUp size={17} />}
        title="TRAYECTORIA"
        subtitle={`${(career || []).length} clubes · ${(national || []).length} selecciones`}
      />

      {(career || []).length === 0 && (national || []).length === 0 && (
        <Empty msg="Sin datos de trayectoria" />
      )}

      {(career || []).length > 0 && (
        <>
          <SectionDot label="CLUBES" color="var(--hpm-accent)" />
          <div className="hpm-timeline">
            {career.map((entry, i) => (
              <TimelineItem key={i} year={entry.start_year} isLast={i === career.length - 1} color="var(--hpm-accent)">
                <div className="hpm-tline-card">
                  <div className="hpm-tline-card-top">
                    <span className="hpm-tline-club">{entry.team_name?.toUpperCase() || '—'}</span>
                    <span className="hpm-tline-period" style={{ color: 'var(--hpm-accent)' }}>
                      {entry.start_year || '?'} – {entry.end_year || '?'}
                    </span>
                  </div>
                  {(entry.role_note || entry.team_country) && (
                    <p className="hpm-tline-note">{entry.role_note || entry.team_country}</p>
                  )}
                  {(entry.appearances > 0 || entry.goals > 0 || entry.assists > 0) && (
                    <div className="hpm-tline-stats">
                      {entry.appearances > 0 && <MiniStat value={entry.appearances} label="PJ" />}
                      {entry.goals > 0 && <MiniStat value={entry.goals} label="G" color="var(--hpm-accent)" />}
                      {entry.assists > 0 && <MiniStat value={entry.assists} label="A" color="var(--hpm-green)" />}
                    </div>
                  )}
                </div>
              </TimelineItem>
            ))}
          </div>
        </>
      )}

      {(national || []).length > 0 && (
        <>
          <SectionDot label="SELECCIÓN NACIONAL" color="var(--hpm-green)" />
          <div className="hpm-timeline">
            {national.map((entry, i) => (
              <TimelineItem key={i} year={entry.start_year} isLast={i === national.length - 1} color="var(--hpm-green)">
                <div className="hpm-tline-card hpm-tline-card--national">
                  <div className="hpm-tline-card-top">
                    <span className="hpm-tline-club">{entry.country?.toUpperCase() || '—'}</span>
                    <span className="hpm-tline-period" style={{ color: 'var(--hpm-green)' }}>
                      {entry.start_year || '?'} – {entry.end_year || '?'}
                    </span>
                  </div>
                  {entry.role_note && <p className="hpm-tline-note">{entry.role_note}</p>}
                  {(entry.caps > 0 || entry.goals > 0) && (
                    <div className="hpm-tline-stats">
                      {entry.caps > 0 && <MiniStat value={entry.caps} label="PARTIDOS" />}
                      {entry.goals > 0 && <MiniStat value={entry.goals} label="GOLES" color="var(--hpm-green)" />}
                    </div>
                  )}
                </div>
              </TimelineItem>
            ))}
          </div>
        </>
      )}
      <div className="hpm-tab-bottom-space" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB EQUIPOS & MOMENTOS
// ══════════════════════════════════════════════════════════════
function TabEquipos({ teams, events }) {
  const hasData = (teams || []).length > 0 || (events || []).length > 0;
  return (
    <div className="hpm-tab-scroll">
      <TabHeader
        icon={<Shield size={17} />}
        title="EQUIPOS & MOMENTOS"
        subtitle={!hasData ? 'Sin registros' : `${(teams || []).length} equipo${(teams || []).length !== 1 ? 's' : ''} histórico${(teams || []).length !== 1 ? 's' : ''}`}
      />
      {!hasData && <Empty msg="Sin datos de equipos ni momentos" />}

      {(teams || []).length > 0 && (
        <>
          <SectionDot label="EQUIPOS HISTÓRICOS" color="var(--hpm-accent)" />
          <div className="hpm-equi-list">
            {teams.map((row, i) => {
              const team = row.historical_teams;
              const tImg = getHistoricalImageUrl(team?.image_path);
              return (
                <div key={i} className="hpm-equi-row">
                  <div className="hpm-equi-logo">
                    {tImg ? <img src={tImg} alt={team?.name} /> : <Shield size={22} />}
                  </div>
                  <div className="hpm-equi-info">
                    <span className="hpm-equi-name">{team?.name?.toUpperCase()}</span>
                    {team?.country && <span className="hpm-equi-country">{team.country}</span>}
                    {row.roles && <span className="hpm-equi-roles">{row.roles}</span>}
                  </div>
                  <span className="hpm-equi-years">
                    {row.start_year || '?'} – {row.end_year || '?'}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(events || []).length > 0 && (
        <>
          <SectionDot label="MOMENTOS HISTÓRICOS" color="var(--hpm-gold)" />
          <div className="hpm-moments-list">
            {events.map((row, i) => {
              const ev = row.historical_events;
              const evImg = getHistoricalImageUrl(ev?.image_path);
              const year = ev?.event_date ? new Date(ev.event_date).getFullYear() : null;
              return (
                <div key={i} className="hpm-moment-row">
                  <div className="hpm-moment-thumb">
                    {evImg ? <img src={evImg} alt={ev?.title} /> : <Zap size={22} />}
                  </div>
                  <div className="hpm-moment-info">
                    <div className="hpm-moment-meta">
                      {ev?.event_type && <span className="hpm-moment-type">{ev.event_type.toUpperCase()}</span>}
                      {year && <span className="hpm-moment-year">{year}</span>}
                    </div>
                    <span className="hpm-moment-title">{ev?.title}</span>
                    {row.role_note && <span className="hpm-moment-role">{row.role_note}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="hpm-tab-bottom-space" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB PALMARÉS — fiel a PlayerTabPalmares Flutter
// ══════════════════════════════════════════════════════════════
function TabPalmares({ titles }) {
  const cats = { club: [], national: [], individual: [] };
  (titles || []).forEach((t) => {
    const cat = t.title_category || 'club';
    if (cats[cat]) cats[cat].push(t);
  });
  const total = (titles || []).reduce(
    (s, t) => t.title_category !== 'individual' ? s + (parseInt(t.quantity) || 1) : s, 0
  );

  return (
    <div className="hpm-tab-scroll">
      <div className="hpm-palmares-header">
        <div className="hpm-tab-header-left">
          <div className="hpm-tab-icon"><Trophy size={17} /></div>
          <div>
            <p className="hpm-tab-header-title">PALMARÉS</p>
            <p className="hpm-tab-header-sub">{total} títulos colectivos</p>
          </div>
        </div>
        <span className="hpm-palmares-total">{total}</span>
      </div>

      {(titles || []).length === 0 && <Empty msg="Sin datos de palmarés" />}

      {[
        { cat: 'club', label: 'CLUB', icon: <Shield size={11} />, color: 'var(--hpm-accent)' },
        { cat: 'national', label: 'SELECCIÓN', icon: <Globe size={11} />, color: 'var(--hpm-green)' },
        { cat: 'individual', label: 'INDIVIDUAL', icon: <User size={11} />, color: 'var(--hpm-gold)' },
      ].map(({ cat, label, icon, color }) =>
        cats[cat].length > 0 && (
          <div key={cat}>
            <div className="hpm-palmares-section-label" style={{ color }}>
              {icon} {label}
            </div>
            <div className="hpm-palmares-list">
              {cats[cat].map((t, i) => (
                <div key={i} className="hpm-title-row" style={{ '--tcolor': color }}>
                  <div className="hpm-title-icon"><Trophy size={17} style={{ color }} /></div>
                  <div className="hpm-title-info">
                    <span className="hpm-title-name">{t.title_name?.toUpperCase()}</span>
                    {t.year && <span className="hpm-title-year">{t.year}</span>}
                  </div>
                  <span className="hpm-title-count">{t.quantity || 1}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
      <div className="hpm-tab-bottom-space" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TAB HISTORIA — fiel a PlayerTabHistoria Flutter (timeline)
// ══════════════════════════════════════════════════════════════
function TabHistoria({ player, career, national, titles }) {
  const TYPE_COLOR = {
    birth: 'var(--hpm-gold)',
    club: 'var(--hpm-accent)',
    national: 'var(--hpm-green)',
    award: 'var(--hpm-gold)',
  };
  const TYPE_ICON = { birth: '🐣', club: '🛡️', national: '🌍', award: '🏆' };

  const events = useMemo(() => {
    const list = [];
    if (player.birth_year) list.push({
      year: player.birth_year, type: 'birth',
      title: `NACE EN ${player.country?.toUpperCase() || '—'}`,
      desc: player.country ? 'Inicio de una historia en el fútbol mundial.' : null,
    });
    (career || []).forEach((c) => {
      if (c.start_year) list.push({
        year: c.start_year, type: 'club',
        title: c.role_note?.toUpperCase() || `LLEGA A ${c.team_name?.toUpperCase()}`,
        desc: c.team_country ? `${c.team_name} · ${c.team_country}` : c.team_name,
      });
    });
    (national || []).forEach((n) => {
      if (n.start_year) list.push({
        year: n.start_year, type: 'national',
        title: `DEBUTA CON ${n.country?.toUpperCase()}`,
        desc: n.role_note,
      });
    });
    (titles || []).forEach((t) => {
      if (t.title_category === 'individual' && t.year) {
        const y = parseInt(t.year);
        if (!isNaN(y)) list.push({ year: y, type: 'award', title: t.title_name?.toUpperCase(), desc: t.team_name });
      }
    });
    return list.sort((a, b) => a.year - b.year);
  }, [player, career, national, titles]);

  const lifespan = player.birth_year
    ? `${player.birth_year}${player.death_year ? ` – ${player.death_year}` : ' – Presente'}`
    : 'Línea de tiempo';

  return (
    <div className="hpm-tab-scroll">
      <TabHeader icon={<BookOpen size={17} />} title="HISTORIA" subtitle={lifespan} />
      {events.length === 0 && <Empty msg="Sin datos históricos" />}
      <div className="hpm-historia-timeline">
        {events.map((ev, i) => (
          <div key={i} className="hpm-historia-row">
            <div className="hpm-historia-left">
              <span className="hpm-historia-year" style={{ background: TYPE_COLOR[ev.type] || 'var(--hpm-accent)' }}>
                {ev.year}
              </span>
              {i < events.length - 1 && (
                <span className="hpm-historia-line" style={{ background: `color-mix(in srgb, ${TYPE_COLOR[ev.type] || 'var(--hpm-accent)'} 35%, transparent)` }} />
              )}
            </div>
            <div className="hpm-historia-card" style={{ '--hc': TYPE_COLOR[ev.type] || 'var(--hpm-accent)' }}>
              <div className="hpm-historia-icon-wrap" style={{ background: `color-mix(in srgb, ${TYPE_COLOR[ev.type] || 'var(--hpm-accent)'} 15%, transparent)` }}>
                <span style={{ fontSize: 14 }}>{TYPE_ICON[ev.type]}</span>
              </div>
              <div className="hpm-historia-text">
                <span className="hpm-historia-title">{ev.title}</span>
                {ev.desc && <span className="hpm-historia-desc">{ev.desc}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hpm-tab-bottom-space" />
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────────
function TabHeader({ icon, title, subtitle }) {
  return (
    <div className="hpm-tab-header">
      <div className="hpm-tab-icon">{icon}</div>
      <div>
        <p className="hpm-tab-header-title">{title}</p>
        <p className="hpm-tab-header-sub">{subtitle}</p>
      </div>
    </div>
  );
}

function SectionHeader({ label }) {
  return (
    <div className="hpm-section-header">
      <span className="hpm-section-bar" />
      <span className="hpm-section-label">{label}</span>
    </div>
  );
}

function SectionDot({ label, color }) {
  return (
    <div className="hpm-section-dot-row">
      <span className="hpm-section-dot" style={{ background: color }} />
      <span className="hpm-section-dot-label" style={{ color }}>{label}</span>
    </div>
  );
}

function TimelineItem({ year, isLast, color, children }) {
  return (
    <div className="hpm-tline-item">
      <div className="hpm-tline-left">
        <span className="hpm-tline-year" style={{ background: color }}>{year || '?'}</span>
        {!isLast && <span className="hpm-tline-connector" style={{ background: `color-mix(in srgb, ${color} 35%, transparent)` }} />}
      </div>
      <div className="hpm-tline-body">{children}</div>
    </div>
  );
}

function MiniStat({ value, label, color }) {
  return (
    <span className="hpm-mini-stat">
      <span className="hpm-mini-stat-val" style={{ color: color || 'var(--hpm-dark)' }}>{value}</span>
      <span className="hpm-mini-stat-lbl">{label}</span>
    </span>
  );
}

function Empty({ msg }) {
  return <div className="hpm-empty"><p>{msg}</p></div>;
}

// ══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL — HistoricalPlayersMobile
//  Auto-contenido: tiene su propio header, búsqueda, filtros,
//  modal aleatorio y detalle con 5 tabs.
//  No depende de HistoryMenuMobile ni de HistoryPage para nav interna.
// ══════════════════════════════════════════════════════════════
export default function HistoricalPlayersMobile({ onBack, initialPlayerId }) {
  const {
    allPlayers, loading, error, reload,
    search, setSearch,
    filterPosition, setFilterPosition,
    filterLegacy, setFilterLegacy,
    filterSignificance, setFilterSignificance,
  } = useHistoricalPlayers();

  const [selectedId, setSelectedId] = useState(initialPlayerId || null);
  const [filters, setFilters] = useState({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (initialPlayerId) setSelectedId(initialPlayerId);
  }, [initialPlayerId]);

  // ── Esconder el bottom nav global mientras se ve el detalle ──
  useEffect(() => {
    const root = document.body;
    if (selectedId) {
      root.classList.add('hpm-hide-bottom-nav');
    } else {
      root.classList.remove('hpm-hide-bottom-nav');
    }
    return () => root.classList.remove('hpm-hide-bottom-nav');
  }, [selectedId]);

  // Sync filtros con el hook
  useEffect(() => {
    setFilterPosition(filters.position || '');
    setFilterLegacy(filters.legacy_type || '');
    setFilterSignificance(filters.significance_level || '');
  }, [filters]);

  const players = useMemo(() => {
    return allPlayers.filter((p) => {
      if (filters.position && p.position !== filters.position) return false;
      if (filters.legacy_type && p.legacy_type !== filters.legacy_type) return false;
      if (filters.significance_level && String(p.significance_level) !== filters.significance_level) return false;
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        p.name?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q) ||
        p.position?.toLowerCase().includes(q)
      );
    });
  }, [allPlayers, filters, search]);

  const goats = useMemo(() => allPlayers.filter((p) => p.significance_level === 5).length, [allPlayers]);
  const countries = useMemo(() => new Set(allPlayers.map((p) => p.country).filter(Boolean)).size, [allPlayers]);

  const hasFilters = Object.values(filters).some(Boolean);
  const filterCount = Object.values(filters).filter(Boolean).length;

  // Vista de detalle — reemplaza la pantalla completa
  if (selectedId) {
    return (
      <PlayerDetailView
        playerId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  // Vista de listado
  return (
    <div className="hpm-root">
      <PlayersHeader
        total={allPlayers.length}
        goats={goats}
        countries={countries}
        onBack={onBack}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
        onFilter={() => setSheetOpen(true)}
        hasFilters={hasFilters}
        filterCount={filterCount}
        onRandom={() => allPlayers.length > 0 && setModalOpen(true)}
      />

      <CounterRow count={players.length} />

      <div className="hpm-grid">
        {loading && (
          <div className="hpm-loading">
            <RefreshCw size={20} className="hpm-spin" />
            <span>Cargando leyendas...</span>
          </div>
        )}
        {!loading && error && (
          <div className="hpm-error">
            <AlertCircle size={18} />
            <p>{error}</p>
            <button onClick={reload}><RefreshCw size={12} /> Reintentar</button>
          </div>
        )}
        {!loading && !error && players.length === 0 && (
          <div className="hpm-empty-grid">
            <User size={32} strokeWidth={1} />
            <p>{allPlayers.length === 0 ? 'Aún no hay jugadores históricos' : 'Sin coincidencias'}</p>
            <span>
              {allPlayers.length === 0
                ? 'El administrador publicará las leyendas pronto.'
                : 'Prueba con otro nombre o ajusta los filtros.'}
            </span>
          </div>
        )}
        {!loading && !error && players.map((p) => (
          <PlayerCard key={p.id} player={p} onClick={(pl) => setSelectedId(pl.id)} />
        ))}
      </div>

      {sheetOpen && (
        <FilterSheet
          activeFilters={filters}
          onApply={setFilters}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {modalOpen && (
        <RandomModal
          players={allPlayers}
          onSelect={(p) => { setSelectedId(p.id); setModalOpen(false); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}