import React, { useMemo } from 'react';
import { X, Swords, ChevronRight } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

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

function getTeamFlag(team) {
  const slug = TEAM_LOGO_MAP[team];
  if (!slug) return null;
  return supabase.storage.from('world-cup-logos').getPublicUrl(`${slug}.png`).data.publicUrl;
}

/* ============================================================
   HELPERS: cálculo de tabla
============================================================ */
function calcTable(group, groupPreds) {
  const teams = GROUPS_DATA[group];
  if (!teams) return [];
  const matches = [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]],
  ];
  const table = teams.map(t => ({ team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }));
  const matchPreds = groupPreds?.[group]?.matches || {};

  Object.entries(matchPreds).forEach(([idx, pred]) => {
    if (pred.homeScore === '' || pred.awayScore === '' || pred.homeScore === undefined) return;
    const [home, away] = matches[idx];
    const hi = teams.indexOf(home), ai = teams.indexOf(away);
    const hs = parseInt(pred.homeScore), as_ = parseInt(pred.awayScore);
    if (isNaN(hs) || isNaN(as_)) return;
    table[hi].played++; table[ai].played++;
    table[hi].gf += hs; table[hi].ga += as_;
    table[ai].gf += as_; table[ai].ga += hs;
    if (hs > as_) { table[hi].won++; table[hi].pts += 3; table[ai].lost++; }
    else if (hs < as_) { table[ai].won++; table[ai].pts += 3; table[hi].lost++; }
    else { table[hi].drawn++; table[ai].drawn++; table[hi].pts++; table[ai].pts++; }
    table[hi].gd = table[hi].gf - table[hi].ga;
    table[ai].gd = table[ai].gf - table[ai].ga;
  });
  return table.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

/* ============================================================
   SUB-COMPONENTE: TeamFlag
============================================================ */
function TeamFlag({ team }) {
  const url = getTeamFlag(team);
  if (!url) return <span style={{ fontSize: 12 }}>🏳️</span>;
  return (
    <img
      src={url}
      alt={team}
      className="rpw-flag"
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
export default function RightPanelWorld({ group, groupPreds, onUpdate, onClose }) {
  const teams = group ? GROUPS_DATA[group] : [];
  const matchPreds = group ? (groupPreds?.[group]?.matches || {}) : {};
  const table = useMemo(() => group ? calcTable(group, groupPreds) : [], [group, groupPreds]);

  const matches = teams ? [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]],
  ] : [];

  const handleScore = (idx, side, val) => {
    const cur = matchPreds[idx] || { homeScore: '', awayScore: '' };
    const updated = { ...cur, [side === 'home' ? 'homeScore' : 'awayScore']: val };
    onUpdate(group, {
      ...(groupPreds[group] || {}),
      matches: { ...matchPreds, [idx]: updated }
    });
  };

  const filledCount = Object.values(matchPreds).filter(
    p => p.homeScore !== '' && p.awayScore !== '' && p.homeScore !== undefined
  ).length;

  if (!group) return null;

  return (
    <aside className="rpw-root">

      {/* ── HEADER ── */}
      <div className="rpw-header">
        <div className="rpw-header-left">
          <div className="rpw-group-badge">{group}</div>
          <div className="rpw-header-info">
            <span className="rpw-header-title">GRUPO {group}</span>
            <span className="rpw-header-sub">{filledCount}/6 partidos</span>
          </div>
        </div>
        <button className="rpw-close-btn" onClick={onClose} aria-label="Cerrar panel">
          <X size={16} />
        </button>
      </div>

      {/* ── TABLA ── */}
      <div className="rpw-block">
        <div className="rpw-block-label">
          CLASIFICACIÓN
          <span className="rpw-label-line" />
        </div>
        <table className="rpw-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>DG</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr
                key={row.team}
                className={i < 2 ? 'rpw-qualified' : i === 2 ? 'rpw-third' : ''}
              >
                <td className="rpw-pos">{i + 1}</td>
                <td>
                  <div className="rpw-team-cell">
                    <TeamFlag team={row.team} />
                    <span className="rpw-team-name">{row.team}</span>
                  </div>
                </td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td className={row.gd > 0 ? 'rpw-gd-pos' : row.gd < 0 ? 'rpw-gd-neg' : ''}>
                  {row.gd > 0 ? '+' : ''}{row.gd}
                </td>
                <td><span className="rpw-pts">{row.pts}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── PARTIDOS ── */}
      <div className="rpw-block rpw-block--matches">
        <div className="rpw-block-label">
          <Swords size={9} />
          PARTIDOS
          <span className="rpw-label-line" />
        </div>

        <div className="rpw-matches-list">
          {matches.map(([home, away], idx) => {
            const pred = matchPreds[idx] || { homeScore: '', awayScore: '' };
            const hasPred = pred.homeScore !== '' && pred.awayScore !== '' && pred.homeScore !== undefined;
            return (
              <div key={idx} className={`rpw-match-row${hasPred ? ' rpw-match-row--filled' : ''}`}>
                {/* Home */}
                <div className="rpw-match-team rpw-match-team--home">
                  <TeamFlag team={home} />
                  <span className="rpw-match-team-name">{home}</span>
                </div>

                {/* Score inputs */}
                <div className="rpw-score-pair">
                  <input
                    className="rpw-score-input"
                    type="number"
                    min="0"
                    max="20"
                    value={pred.homeScore}
                    placeholder="–"
                    onChange={e => handleScore(idx, 'home', e.target.value)}
                  />
                  <span className="rpw-score-sep">:</span>
                  <input
                    className="rpw-score-input"
                    type="number"
                    min="0"
                    max="20"
                    value={pred.awayScore}
                    placeholder="–"
                    onChange={e => handleScore(idx, 'away', e.target.value)}
                  />
                </div>

                {/* Away */}
                <div className="rpw-match-team rpw-match-team--away">
                  <span className="rpw-match-team-name">{away}</span>
                  <TeamFlag team={away} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LEYENDA ── */}
      <div className="rpw-legend">
        <span className="rpw-legend-item rpw-legend-item--q">
          <span className="rpw-legend-dot" /> Clasificado
        </span>
        <span className="rpw-legend-item rpw-legend-item--t">
          <span className="rpw-legend-dot rpw-legend-dot--t" /> Mejor 3°
        </span>
      </div>

    </aside>
  );
}