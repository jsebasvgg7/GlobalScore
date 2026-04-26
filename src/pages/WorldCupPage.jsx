import React, { useState, useEffect } from 'react';
import {
  Trophy, Award, TrendingUp, TrendingDown, Star, Target, Zap,
  ChevronDown, ChevronUp, Medal, User, Save, ChevronRight, CheckCircle,
  AlertCircle, Users, Swords, Crown, Shield
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useToast, ToastContainer } from '../components/ComFeedback/Toast';
import { useWorldCup } from '../hooks/HooksOthers/useWorldCup';
import KnockoutSection from '../components/ComWorldCup/KnockoutSection';
import GlobalLoader from "../components/ComFeedback/GlobalLoader";
import RightPanelWorld from '../components/ComWorldCup/RightPanelWorld';
import '../styles/StylesPages/WorldCupPage.css';
import '../styles/StylesMobile/MobileWorldCup.css';
import '../styles/StylesPanels/RightPanelWorld.css';

/* ============================================================
   DATOS
============================================================ */
const GROUPS_DATA = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Turkey'],
  E: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};

const TEAM_LOGO_MAP = {
  'Mexico': 'mexico', 'South Africa': 'sudafrica', 'Korea Republic': 'coreadelsur',
  'Czechia': 'chequia', 'Canada': 'canada', 'Bosnia': 'bosnia', 'Qatar': 'qatar',
  'Switzerland': 'suiza', 'Brazil': 'brasil', 'Morocco': 'marruecos', 'Haiti': 'haiti',
  'Scotland': 'escocia', 'USA': 'usa', 'Paraguay': 'paraguay', 'Australia': 'australia',
  'Turkey': 'turquia', 'Germany': 'alemania', 'Curacao': 'curacao',
  'Ivory Coast': 'costamarfil', 'Ecuador': 'ecuador', 'Netherlands': 'paisesbajos',
  'Japan': 'japon', 'Sweden': 'suecia', 'Tunisia': 'tunez', 'Belgium': 'belgica',
  'Egypt': 'egipto', 'Iran': 'iran', 'New Zealand': 'nuevazelanda', 'Spain': 'espana',
  'Cabo Verde': 'caboverde', 'Saudi Arabia': 'arabiasaudita', 'Uruguay': 'uruguay',
  'France': 'francia', 'Senegal': 'senegal', 'Iraq': 'irak', 'Norway': 'noruega',
  'Argentina': 'argentina', 'Algeria': 'argelia', 'Austria': 'austria', 'Jordan': 'jordan',
  'Portugal': 'portugal', 'Congo': 'congo', 'Uzbekistan': 'uzbekistan', 'Colombia': 'colombia',
  'England': 'inglaterra', 'Croatia': 'croacia', 'Ghana': 'ghana', 'Panama': 'panama',
};

const getTeamFlag = (team) => {
  const slug = TEAM_LOGO_MAP[team];
  if (!slug) return null;
  return supabase.storage.from('world-cup-logos').getPublicUrl(`${slug}.png`).data.publicUrl;
};

const AWARDS_CFG = [
  { key: 'topScorer',            label: 'Bota de Oro',         category: 'Máximo Goleador',             iconVariant: 'gold',  placeholder: 'Nombre del goleador...' },
  { key: 'topAssist',            label: 'Mejor Asistidor',     category: 'Más Asistencias',             iconVariant: 'blue',  placeholder: 'Nombre del asistidor...' },
  { key: 'goldenBall',           label: 'Balón de Oro',        category: 'Mejor Jugador del Mundial',   iconVariant: 'gold',  placeholder: 'Nombre del jugador...' },
  { key: 'bestYoungPlayer',      label: 'Mejor Joven',         category: 'Sub-21 Destacado',            iconVariant: 'green', placeholder: 'Nombre del jugador...' },
  { key: 'goldenGlove',          label: 'Guante de Oro',       category: 'Mejor Portero',               iconVariant: 'blue',  placeholder: 'Nombre del portero...' },
  { key: 'surpriseTeam',         label: 'Selección Sorpresa',  category: 'Equipo Revelación',           iconVariant: 'green', placeholder: 'Nombre del equipo...' },
  { key: 'disappointmentTeam',   label: 'Selec. Decepción',    category: 'Bajo Rendimiento',            iconVariant: 'red',   placeholder: 'Nombre del equipo...' },
  { key: 'breakoutPlayer',       label: 'Jugador Revelación',  category: 'Descubrimiento del Torneo',   iconVariant: 'amber', placeholder: 'Nombre del jugador...' },
  { key: 'disappointmentPlayer', label: 'Jugador Decepción',   category: 'Por Debajo de Expectativas', iconVariant: 'red',   placeholder: 'Nombre del jugador...' },
];

/* ============================================================
   HELPERS: cálculos de tabla
============================================================ */
function calcTable(group, preds) {
  const teams = GROUPS_DATA[group];
  const matches = [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]],
  ];
  const table = teams.map(t => ({ team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }));
  const matchPreds = preds?.[group]?.matches || {};

  Object.entries(matchPreds).forEach(([idx, pred]) => {
    if (pred.homeScore === '' || pred.awayScore === '') return;
    const [home, away] = matches[idx];
    const hi = teams.indexOf(home), ai = teams.indexOf(away);
    const hs = parseInt(pred.homeScore), as_ = parseInt(pred.awayScore);
    table[hi].played++; table[ai].played++;
    table[hi].gf += hs; table[hi].ga += as_;
    table[ai].gf += as_; table[ai].ga += hs;
    if (hs > as_)       { table[hi].won++; table[hi].pts += 3; table[ai].lost++; }
    else if (hs < as_)  { table[ai].won++; table[ai].pts += 3; table[hi].lost++; }
    else                { table[hi].drawn++; table[ai].drawn++; table[hi].pts++; table[ai].pts++; }
    table[hi].gd = table[hi].gf - table[hi].ga;
    table[ai].gd = table[ai].gf - table[ai].ga;
  });
  return table.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

function calcBestThirds(groupPreds) {
  const thirds = [];
  Object.keys(GROUPS_DATA).forEach(group => {
    const t = calcTable(group, groupPreds);
    if (t[2]) thirds.push({ ...t[2], group });
  });
  return thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).slice(0, 8);
}

/* ============================================================
   COMPONENTE: TeamFlag
============================================================ */
function TeamFlag({ team, className }) {
  const url = getTeamFlag(team);
  if (!url) return <span style={{ fontSize: 12 }}>🏳️</span>;
  return <img src={url} alt={team} className={className} onError={e => e.target.style.display = 'none'} />;
}

/* ============================================================
   COMPONENTE: GroupCard (DESKTOP)
============================================================ */
function GroupCard({ group, groupPreds, isActive, onActivate }) {
  const teams = GROUPS_DATA[group];
  const matchPreds = groupPreds?.[group]?.matches || {};
  const table = calcTable(group, groupPreds);

  const filledCount = Object.values(matchPreds).filter(
    p => p.homeScore !== '' && p.awayScore !== '' && p.homeScore !== undefined
  ).length;

  return (
    <div
      className={`wcp-group-card${isActive ? ' wcp-group-card--active' : ''}`}
      onClick={onActivate}
    >
      {/* Header */}
      <div className="wcp-group-hdr">
        <div className="wcp-group-hdr-left">
          <div className="wcp-group-letter">{group}</div>
          <span className="wcp-group-lbl">GRUPO {group}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {filledCount > 0 && (
            <span className="wcp-group-prog">{filledCount}/6</span>
          )}
          {filledCount === 0 && (
            <span className="wcp-group-prog wcp-group-prog--empty">0/6</span>
          )}
          <ChevronRight size={13} className="wcp-group-arrow" />
        </div>
      </div>

      {/* Tabla de clasificación */}
      <table className="wcp-group-table">
        <thead>
          <tr>
            <th>#</th><th>Equipo</th><th>PJ</th><th>G</th>
            <th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr key={row.team} className={i < 2 ? 'wcp-qualified' : i === 2 ? 'wcp-third-place' : ''}>
              <td>{i + 1}</td>
              <td>
                <div className="wcp-team-cell">
                  <TeamFlag team={row.team} className="wcp-team-flag" />
                  <span className="wcp-team-name">{row.team}</span>
                </div>
              </td>
              <td>{row.played}</td><td>{row.won}</td>
              <td>{row.drawn}</td><td>{row.lost}</td>
              <td>{row.gf}</td><td>{row.ga}</td>
              <td className={row.gd > 0 ? 'wcp-gd-pos' : row.gd < 0 ? 'wcp-gd-neg' : ''}>
                {row.gd > 0 ? '+' : ''}{row.gd}
              </td>
              <td><span className="wcp-pts-bold">{row.pts}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Hint de predicción */}
      <div className="wcp-group-hint" onClick={e => { e.stopPropagation(); onActivate(); }}>
        <Swords size={9} />
        {isActive ? 'Panel abierto' : 'Predecir partidos'}
        <ChevronRight size={9} />
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE: AwardIcon helper
============================================================ */
function AwardIconEl({ variant, size = 20 }) {
  const icons = {
    gold: <Trophy size={size} />,
    green: <TrendingUp size={size} />,
    blue: <Target size={size} />,
    red: <TrendingDown size={size} />,
    purple: <Star size={size} />,
    amber: <Zap size={size} />,
  };
  return icons[variant] || <Award size={size} />;
}

/* ============================================================
   DESKTOP — SECCIÓN GRUPOS
============================================================ */
function DesktopGroups({ groupPreds, onGroupUpdate, activeGroup, onSetActiveGroup }) {
  const bestThirds = calcBestThirds(groupPreds);

  return (
    <div>
      <div className="wcp-section-hdr">
        <div className="wcp-section-hdr-left">
          <span className="wcp-section-num">01</span>
          <h2 className="wcp-section-title">FASE DE GRUPOS</h2>
        </div>
        <span className="wcp-section-sub">12 grupos · 48 selecciones</span>
      </div>

      <div className="wcp-groups-grid">
        {Object.keys(GROUPS_DATA).map(group => (
          <GroupCard
            key={group}
            group={group}
            groupPreds={groupPreds}
            isActive={activeGroup === group}
            onActivate={() => onSetActiveGroup(activeGroup === group ? null : group)}
          />
        ))}
      </div>

      {bestThirds.length > 0 && (
        <div className="wcp-thirds-wrap">
          <div className="wcp-thirds-hdr">
            <Trophy size={15} className="wcp-thirds-icon" />
            <span className="wcp-thirds-title">MEJORES TERCEROS — 8 CLASIFICAN</span>
          </div>
          <table className="wcp-thirds-table">
            <thead>
              <tr><th>POS</th><th>GRUPO</th><th>EQUIPO</th><th>PJ</th><th>PTS</th><th>DG</th></tr>
            </thead>
            <tbody>
              {bestThirds.map((row, i) => (
                <tr key={i} className={i < 8 ? 'wcp-q' : ''}>
                  <td><span className={`wcp-rnk-badge${i < 8 ? ' wcp-rnk-badge--q' : ''}`}>{i + 1}</span></td>
                  <td><span className="wcp-grp-badge">G-{row.group}</span></td>
                  <td>
                    <div className="wcp-team-cell">
                      <TeamFlag team={row.team} className="wcp-team-flag" />
                      <span>{row.team}</span>
                    </div>
                  </td>
                  <td>{row.played}</td>
                  <td><strong>{row.pts}</strong></td>
                  <td className={row.gd > 0 ? 'wcp-gd-pos' : row.gd < 0 ? 'wcp-gd-neg' : ''}>
                    {row.gd > 0 ? '+' : ''}{row.gd}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DESKTOP — SECCIÓN ELIMINATORIAS
============================================================ */
function DesktopKnockout({ groupPreds, knockout, onKnockoutUpdate, onSave, saving }) {
  return (
    <div>
      <div className="wcp-section-hdr">
        <div className="wcp-section-hdr-left">
          <span className="wcp-section-num">02</span>
          <h2 className="wcp-section-title">ELIMINATORIAS</h2>
        </div>
        <span className="wcp-section-sub">Rondas eliminatorias · 32 → 1</span>
      </div>
      <div className="wcp-knockout">
        <KnockoutSection
          groupPredictions={groupPreds}
          knockoutPredictions={knockout}
          onUpdatePrediction={onKnockoutUpdate}
        />
      </div>
    </div>
  );
}

/* ============================================================
   DESKTOP — SECCIÓN PREMIOS
============================================================ */
function DesktopAwards({ awards, onAwardUpdate, onSave, saving }) {
  return (
    <div>
      <div className="wcp-section-hdr">
        <div className="wcp-section-hdr-left">
          <span className="wcp-section-num">03</span>
          <h2 className="wcp-section-title">PREMIOS INDIVIDUALES</h2>
        </div>
        <span className="wcp-section-sub">Galardones · Temporada 2026</span>
      </div>

      <div className="wcp-awards-grid">
        {AWARDS_CFG.map(cfg => (
          <div key={cfg.key} className="wcp-award-card">
            <div className="wcp-award-hdr">
              <div className={`wcp-award-icon wcp-award-icon--${cfg.iconVariant}`}>
                <AwardIconEl variant={cfg.iconVariant} size={20} />
              </div>
              <div className="wcp-award-info">
                <span className="wcp-award-name">{cfg.label}</span>
                <span className="wcp-award-category">{cfg.category}</span>
              </div>
            </div>
            <div className="wcp-award-field">
              <div className="wcp-award-label">
                <Award size={9} /> TU PREDICCIÓN
              </div>
              <input
                type="text"
                className="wcp-award-input"
                value={awards[cfg.key] || ''}
                onChange={e => onAwardUpdate(cfg.key, e.target.value)}
                placeholder={cfg.placeholder}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MOBILE — SECCIÓN GRUPOS
============================================================ */
function MobileGroups({ groupPreds, onGroupUpdate }) {
  const [expanded, setExpanded] = useState({});
  const bestThirds = calcBestThirds(groupPreds);

  return (
    <div className="mwc-body">
      <div className="mwc-sec-hdr">
        <div className="mwc-sec-dot" />
        <span className="mwc-sec-title">FASE DE GRUPOS — 12 GRUPOS</span>
      </div>

      {Object.keys(GROUPS_DATA).map(group => {
        const teams = GROUPS_DATA[group];
        const matches = [
          [teams[0], teams[1]], [teams[2], teams[3]],
          [teams[0], teams[2]], [teams[1], teams[3]],
          [teams[0], teams[3]], [teams[1], teams[2]],
        ];
        const matchPreds = groupPreds?.[group]?.matches || {};
        const table = calcTable(group, groupPreds);

        const handleScore = (idx, side, val) => {
          const cur = matchPreds[idx] || { homeScore: '', awayScore: '' };
          const updated = { ...cur, [side === 'home' ? 'homeScore' : 'awayScore']: val };
          onGroupUpdate(group, { ...(groupPreds[group] || {}), matches: { ...matchPreds, [idx]: updated } });
        };

        return (
          <div key={group} className="mwc-group-card">
            <div className="mwc-group-hdr" onClick={() => setExpanded(p => ({ ...p, [group]: !p[group] }))}>
              <div className="mwc-group-hdr-left">
                <div className="mwc-group-letter">{group}</div>
                <span className="mwc-group-lbl">Grupo {group}</span>
              </div>
              <ChevronDown size={15} className={`mwc-group-chevron${expanded[group] ? ' open' : ''}`} />
            </div>

            <div className="mwc-group-table-wrap">
              <table className="mwc-group-table">
                <thead>
                  <tr>
                    <th>#</th><th>Equipo</th><th>PJ</th><th>G</th>
                    <th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, i) => (
                    <tr key={row.team} className={i < 2 ? 'mwc-qualified' : i === 2 ? 'mwc-third-place' : ''}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="mwc-team-cell">
                          <TeamFlag team={row.team} className="mwc-team-flag" />
                          <span className="mwc-team-name">{row.team}</span>
                        </div>
                      </td>
                      <td>{row.played}</td><td>{row.won}</td>
                      <td>{row.drawn}</td><td>{row.lost}</td>
                      <td>{row.gf}</td><td>{row.ga}</td>
                      <td className={row.gd > 0 ? 'mwc-gd-pos' : row.gd < 0 ? 'mwc-gd-neg' : ''}>
                        {row.gd > 0 ? '+' : ''}{row.gd}
                      </td>
                      <td><span className="mwc-pts-bold">{row.pts}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {expanded[group] && (
              <div className="mwc-group-preds">
                <div className="mwc-preds-lbl">PARTIDOS</div>
                {matches.map(([home, away], idx) => {
                  const pred = matchPreds[idx] || { homeScore: '', awayScore: '' };
                  return (
                    <div key={idx} className="mwc-match-pred">
                      <div className="mwc-match-team">
                        <TeamFlag team={home} className="mwc-team-flag" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home}</span>
                      </div>
                      <div className="mwc-score-pair">
                        <input className="mwc-score-input" type="number" min="0" max="20"
                          value={pred.homeScore} placeholder="0"
                          onChange={e => handleScore(idx, 'home', e.target.value)} />
                        <span className="mwc-score-sep">-</span>
                        <input className="mwc-score-input" type="number" min="0" max="20"
                          value={pred.awayScore} placeholder="0"
                          onChange={e => handleScore(idx, 'away', e.target.value)} />
                      </div>
                      <div className="mwc-match-team mwc-match-team--right">
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{away}</span>
                        <TeamFlag team={away} className="mwc-team-flag" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {bestThirds.length > 0 && (
        <div className="mwc-thirds-wrap">
          <div className="mwc-thirds-hdr">
            <Trophy size={15} />
            <span className="mwc-thirds-title">Mejores Terceros (8 clasifican)</span>
          </div>
          <div className="mwc-thirds-table-wrap">
            <table className="mwc-thirds-table">
              <thead><tr><th>POS</th><th>GRP</th><th>EQUIPO</th><th>PTS</th><th>DG</th></tr></thead>
              <tbody>
                {bestThirds.map((row, i) => (
                  <tr key={i} className={i < 8 ? 'mwc-q' : ''}>
                    <td><span className={`mwc-rnk-sm${i < 8 ? ' mwc-rnk-sm--q' : ''}`}>{i + 1}</span></td>
                    <td><span className="mwc-grp-sm">G-{row.group}</span></td>
                    <td>
                      <div className="mwc-team-cell">
                        <TeamFlag team={row.team} className="mwc-team-flag" />
                        <span className="mwc-team-name">{row.team}</span>
                      </div>
                    </td>
                    <td><strong>{row.pts}</strong></td>
                    <td className={row.gd > 0 ? 'mwc-gd-pos' : row.gd < 0 ? 'mwc-gd-neg' : ''}>
                      {row.gd > 0 ? '+' : ''}{row.gd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MOBILE — KO CARD helper
============================================================ */
function MobileKoCard({ match, homeTeam, awayTeam, selected, onSelect }) {
  return (
    <div className="mwc-ko-card">
      <div className="mwc-ko-card-lbl">
        <span>{match.label}</span>
        <span className="mwc-ko-card-id">#{match.id}</span>
      </div>
      <div
        className={`mwc-ko-team-opt${selected === homeTeam ? ' selected' : ''}${!homeTeam ? ' disabled' : ''}`}
        onClick={() => homeTeam && onSelect(homeTeam)}
      >
        {homeTeam && <TeamFlag team={homeTeam} className="mwc-ko-flag" />}
        <span className="mwc-ko-team-name">{homeTeam || match.home}</span>
        {selected === homeTeam && <CheckCircle size={14} className="mwc-ko-check" />}
      </div>
      <div className="mwc-ko-vs">VS</div>
      <div
        className={`mwc-ko-team-opt${selected === awayTeam ? ' selected' : ''}${!awayTeam ? ' disabled' : ''}`}
        onClick={() => awayTeam && onSelect(awayTeam)}
      >
        {awayTeam && <TeamFlag team={awayTeam} className="mwc-ko-flag" />}
        <span className="mwc-ko-team-name">{awayTeam || match.away}</span>
        {selected === awayTeam && <CheckCircle size={14} className="mwc-ko-check" />}
      </div>
      {selected && (
        <div className="mwc-ko-winner-row">
          <Trophy size={11} />
          <span>Ganador: {selected}</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MOBILE — SECCIÓN ELIMINATORIAS (simplificada)
============================================================ */
function MobileKnockout({ groupPreds, knockout, onKnockoutUpdate }) {
  const hasGroupPreds = Object.values(groupPreds).some(g => g?.matches && Object.keys(g.matches).length > 0);

  if (!hasGroupPreds) {
    return (
      <div className="mwc-body">
        <div className="mwc-ko-empty" style={{ padding: '60px 20px' }}>
          <AlertCircle size={40} />
          <p>Completa primero la Fase de Grupos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mwc-ko-section">
      <KnockoutSection
        groupPredictions={groupPreds}
        knockoutPredictions={knockout}
        onUpdatePrediction={onKnockoutUpdate}
      />
    </div>
  );
}

/* ============================================================
   MOBILE — SECCIÓN PREMIOS
============================================================ */
function MobileAwards({ awards, onAwardUpdate }) {
  return (
    <div className="mwc-body">
      <div className="mwc-sec-hdr">
        <div className="mwc-sec-dot" />
        <span className="mwc-sec-title">PREMIOS INDIVIDUALES</span>
      </div>
      <div className="mwc-awards">
        {AWARDS_CFG.map(cfg => (
          <div key={cfg.key} className="mwc-award-card">
            <div className="mwc-award-hdr">
              <div className={`mwc-award-icon mwc-award-icon--${cfg.iconVariant}`}>
                <AwardIconEl variant={cfg.iconVariant} size={18} />
              </div>
              <div className="mwc-award-info">
                <span className="mwc-award-name">{cfg.label}</span>
                <span className="mwc-award-cat">{cfg.category}</span>
              </div>
            </div>
            <input
              type="text"
              className="mwc-award-input"
              value={awards[cfg.key] || ''}
              onChange={e => onAwardUpdate(cfg.key, e.target.value)}
              placeholder={cfg.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
export default function WorldCupPage({ currentUser }) {
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [predictions, setPredictions] = useState({
    groups: {},
    knockout: { round16: {}, round8: {}, quarters: {}, semis: {}, final: {}, thirdPlace: {} },
    awards: {
      topScorer: '', topAssist: '', goldenBall: '', bestYoungPlayer: '',
      goldenGlove: '', surpriseTeam: '', disappointmentTeam: '',
      breakoutPlayer: '', disappointmentPlayer: '',
    },
  });
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const { loadPredictions, savePredictions, loading: saving } = useWorldCup(currentUser);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadPredictions();
        if (data) setPredictions(data);
      } catch { toast.error('Error al cargar predicciones'); }
      finally { setLoading(false); }
    })();
  }, [currentUser]);

  const handleSave = () => savePredictions(
    predictions,
    () => toast.success('¡Predicciones guardadas! 🏆'),
    err => toast.error(`Error: ${err}`)
  );

  const handleGroupUpdate = (group, data) =>
    setPredictions(p => ({ ...p, groups: { ...p.groups, [group]: data } }));

  const handleKnockoutUpdate = ko =>
    setPredictions(p => ({ ...p, knockout: ko }));

  const handleAwardUpdate = (key, val) =>
    setPredictions(p => ({ ...p, awards: { ...p.awards, [key]: val } }));

  // Contadores para badges
  const groupFilled = Object.values(predictions.groups).filter(g =>
    g?.matches && Object.keys(g.matches).length > 0
  ).length;
  const ko16Count = Object.keys(predictions.knockout?.round16 || {}).length;
  const awardsCount = Object.values(predictions.awards).filter(v => v?.trim()).length;

  if (loading) return <GlobalLoader variant="page" label="Cargando mundial" />;

  return (
    <>
      {/* ══════════ DESKTOP ══════════ */}
      <div className="wcp-shell page-root">

        {/* TABS NAV */}
        <div className="wcp-tabs">
          <button className={`wcp-tab${activeTab === 'groups' ? ' active' : ''}`} onClick={() => setActiveTab('groups')}>
            <Users size={14} /> FASE DE GRUPOS
            {groupFilled > 0 && <span className="wcp-tab-badge">{groupFilled}</span>}
          </button>
          <button className={`wcp-tab${activeTab === 'knockout' ? ' active' : ''}`} onClick={() => setActiveTab('knockout')}>
            <Swords size={14} /> ELIMINATORIAS
            {ko16Count > 0 && <span className="wcp-tab-badge">{ko16Count}</span>}
          </button>
          <button className={`wcp-tab${activeTab === 'awards' ? ' active' : ''}`} onClick={() => setActiveTab('awards')}>
            <Award size={14} /> PREMIOS
            {awardsCount > 0 && <span className="wcp-tab-badge">{awardsCount}</span>}
          </button>
          <div className="wcp-tabs-save">
            <button className="wcp-save-btn" onClick={handleSave} disabled={saving}>
              <Save size={13} />
              {saving ? 'GUARDANDO...' : 'GUARDAR TODO'}
            </button>
          </div>
        </div>

        {/* LAYOUT CON PANEL DERECHO */}
        <div className="wcp-layout">
          <div className="wcp-body">
            {activeTab === 'groups' && (
              <DesktopGroups
                groupPreds={predictions.groups}
                onGroupUpdate={handleGroupUpdate}
                activeGroup={activeGroup}
                onSetActiveGroup={setActiveGroup}
              />
            )}
            {activeTab === 'knockout' && (
              <DesktopKnockout
                groupPreds={predictions.groups}
                knockout={predictions.knockout}
                onKnockoutUpdate={handleKnockoutUpdate}
                onSave={handleSave}
                saving={saving}
              />
            )}
            {activeTab === 'awards' && (
              <DesktopAwards
                awards={predictions.awards}
                onAwardUpdate={handleAwardUpdate}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </div>

          {activeTab === 'groups' && activeGroup && (
            <RightPanelWorld
              group={activeGroup}
              groupPreds={predictions.groups}
              onUpdate={handleGroupUpdate}
              onClose={() => setActiveGroup(null)}
            />
          )}
        </div>
      </div>

      {/* ══════════ MOBILE ══════════ */}
      <div className="mwc-root">
        {/* HERO MOBILE */}
        <div className="mwc-hero">
          <div className="mwc-hero-icon">
            <Trophy size={26} />
          </div>
          <div className="mwc-hero-info">
            <h1 className="mwc-hero-title">MUNDIAL <span>2026</span></h1>
            <p className="mwc-hero-sub">USA · CANADA · MEXICO · FIFA</p>
          </div>
        </div>

        {/* TABS MOBILE */}
        <div className="mwc-tabs">
          <button className={`mwc-tab${activeTab === 'groups' ? ' active' : ''}`} onClick={() => setActiveTab('groups')}>
            <Users size={13} /> Grupos
          </button>
          <button className={`mwc-tab${activeTab === 'knockout' ? ' active' : ''}`} onClick={() => setActiveTab('knockout')}>
            <Swords size={13} /> KO
          </button>
          <button className={`mwc-tab${activeTab === 'awards' ? ' active' : ''}`} onClick={() => setActiveTab('awards')}>
            <Award size={13} /> Premios
          </button>
        </div>

        {/* SAVE BAR MOBILE */}
        <div className="mwc-save-bar">
          <span className="mwc-save-info">
            {groupFilled}/12 grupos · {awardsCount}/9 premios
          </span>
          <button className="mwc-save-btn" onClick={handleSave} disabled={saving}>
            <Save size={12} />
            {saving ? 'Guardando...' : 'GUARDAR'}
          </button>
        </div>

        {/* CONTENIDO MOBILE */}
        {activeTab === 'groups' && (
          <MobileGroups
            groupPreds={predictions.groups}
            onGroupUpdate={handleGroupUpdate}
          />
        )}
        {activeTab === 'knockout' && (
          <MobileKnockout
            groupPreds={predictions.groups}
            knockout={predictions.knockout}
            onKnockoutUpdate={handleKnockoutUpdate}
          />
        )}
        {activeTab === 'awards' && (
          <MobileAwards
            awards={predictions.awards}
            onAwardUpdate={handleAwardUpdate}
          />
        )}
      </div>

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </>
  );
}