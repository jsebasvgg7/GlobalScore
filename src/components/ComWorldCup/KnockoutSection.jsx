import React, { useMemo } from 'react';
import { Trophy, Award, AlertCircle } from 'lucide-react';
import KnockoutMatchCard from './KnockoutMatchCard';
import '../../styles/StylesOthers/KnockoutSection.css';

// ============================================
// CONFIGURACIÓN DE LLAVES FIFA - 32 EQUIPOS
// ============================================

const ROUND_OF_16_BRACKETS = {
  leftTop: [
    { id: 1, home: 'E-1', away: 'ABCDF-3', label: 'Llave 1', homeDesc: '1° Grupo E', awayDesc: '3° A/B/C/D/F' },
    { id: 2, home: 'I-1', away: 'CDFGH-3', label: 'Llave 2', homeDesc: '1° Grupo I', awayDesc: '3° C/D/F/G/H' },
    { id: 3, home: 'A-2', away: 'B-2',     label: 'Llave 3', homeDesc: '2° Grupo A', awayDesc: '2° Grupo B' },
    { id: 4, home: 'F-1', away: 'C-2',     label: 'Llave 4', homeDesc: '1° Grupo F', awayDesc: '2° Grupo C' },
  ],
  leftBottom: [
    { id: 5, home: 'K-2', away: 'L-2',     label: 'Llave 5', homeDesc: '2° Grupo K', awayDesc: '2° Grupo L' },
    { id: 6, home: 'H-1', away: 'J-2',     label: 'Llave 6', homeDesc: '1° Grupo H', awayDesc: '2° Grupo J' },
    { id: 7, home: 'D-1', away: 'BEFIJ-3', label: 'Llave 7', homeDesc: '1° Grupo D', awayDesc: '3° B/E/F/I/J' },
    { id: 8, home: 'G-1', away: 'AEHIJ-3', label: 'Llave 8', homeDesc: '1° Grupo G', awayDesc: '3° A/E/H/I/J' },
  ],
  rightTop: [
    { id: 9,  home: 'C-1', away: 'F-2',     label: 'Llave 9',  homeDesc: '1° Grupo C', awayDesc: '2° Grupo F' },
    { id: 10, home: 'E-2', away: 'I-2',     label: 'Llave 10', homeDesc: '2° Grupo E', awayDesc: '2° Grupo I' },
    { id: 11, home: 'A-1', away: 'CEFHI-3', label: 'Llave 11', homeDesc: '1° Grupo A', awayDesc: '3° C/E/F/H/I' },
    { id: 12, home: 'L-1', away: 'BHIJK-3', label: 'Llave 12', homeDesc: '1° Grupo L', awayDesc: '3° B/H/I/J/K' },
  ],
  rightBottom: [
    { id: 13, home: 'J-1', away: 'H-2',     label: 'Llave 13', homeDesc: '1° Grupo J', awayDesc: '2° Grupo H' },
    { id: 14, home: 'D-2', away: 'G-2',     label: 'Llave 14', homeDesc: '2° Grupo D', awayDesc: '2° Grupo G' },
    { id: 15, home: 'B-1', away: 'EFGIJ-3', label: 'Llave 15', homeDesc: '1° Grupo B', awayDesc: '3° E/F/G/I/J' },
    { id: 16, home: 'K-1', away: 'DEJL-3',  label: 'Llave 16', homeDesc: '1° Grupo K', awayDesc: '3° D/E/J/L' },
  ],
};

const ROUND_OF_8_BRACKETS = [
  { id: 'R8-1', matches: [1,  2],  label: 'Octavo 1' },
  { id: 'R8-2', matches: [3,  4],  label: 'Octavo 2' },
  { id: 'R8-3', matches: [5,  6],  label: 'Octavo 3' },
  { id: 'R8-4', matches: [7,  8],  label: 'Octavo 4' },
  { id: 'R8-5', matches: [9,  10], label: 'Octavo 5' },
  { id: 'R8-6', matches: [11, 12], label: 'Octavo 6' },
  { id: 'R8-7', matches: [13, 14], label: 'Octavo 7' },
  { id: 'R8-8', matches: [15, 16], label: 'Octavo 8' },
];

const QUARTERS_BRACKETS = [
  { id: 'QF1', octavos: ['R8-1', 'R8-2'], label: 'Cuarto 1' },
  { id: 'QF2', octavos: ['R8-3', 'R8-4'], label: 'Cuarto 2' },
  { id: 'QF3', octavos: ['R8-5', 'R8-6'], label: 'Cuarto 3' },
  { id: 'QF4', octavos: ['R8-7', 'R8-8'], label: 'Cuarto 4' },
];

const SEMIS_BRACKETS = [
  { id: 'SF1', quarters: ['QF1', 'QF2'], label: 'Semifinal 1' },
  { id: 'SF2', quarters: ['QF3', 'QF4'], label: 'Semifinal 2' },
];

// ============================================
// HOOK PARA CALCULAR CLASIFICADOS
// ============================================
function useQualifiedTeams(groupPredictions) {
  return useMemo(() => {
    const GROUPS_DATA = {
      A: ['Mexico','South Africa','Korea Republic','Denmark*'],
      B: ['Canada','Italy*','Qatar','Switzerland'],
      C: ['Brazil','Morocco','Haiti','Scotland'],
      D: ['USA','Paraguay','Australia','Turkey*'],
      E: ['Germany','Curacao','Ivory Coast','Ecuador'],
      F: ['Netherlands','Japan','Poland*','Tunisia'],
      G: ['Belgium','Egypt','Iran','New Zealand'],
      H: ['Spain','Cabo Verde','Saudi Arabia','Uruguay'],
      I: ['France','Senegal','Bolivia*','Norway'],
      J: ['Argentina','Algeria','Austria','Jordan'],
      K: ['Portugal','Congo*','Uzbekistan','Colombia'],
      L: ['England','Croatia','Ghana','Panama'],
    };

    const GROUPS = Object.keys(GROUPS_DATA);
    const qualified = {};
    const allThirds = [];

    GROUPS.forEach(group => {
      const standings = calculateGroupStandings(group, GROUPS_DATA[group], groupPredictions[group]);
      qualified[group] = {
        first:  standings[0]?.team || null,
        second: standings[1]?.team || null,
        third:  standings[2]?.team || null,
      };
      if (standings[2]) allThirds.push({ ...standings[2], group });
    });

    const sortedThirds = allThirds
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8);

    const bestThirds = {};
    sortedThirds.forEach((team, idx) => {
      bestThirds[team.group] = { ...team, position: idx + 1 };
    });

    return { qualified, bestThirds };
  }, [groupPredictions]);
}

function calculateGroupStandings(group, teams, groupData) {
  if (!groupData?.matches) return [];
  const table = teams.map(team => ({
    team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0,
  }));
  const matches = [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]],
  ];
  Object.entries(groupData.matches).forEach(([idx, pred]) => {
    if (!pred.homeScore || !pred.awayScore) return;
    const [home, away] = matches[idx];
    const hi = teams.indexOf(home), ai = teams.indexOf(away);
    const hs = parseInt(pred.homeScore), as_ = parseInt(pred.awayScore);
    table[hi].played++; table[ai].played++;
    table[hi].gf += hs; table[hi].ga += as_;
    table[ai].gf += as_; table[ai].ga += hs;
    if (hs > as_)      { table[hi].won++; table[hi].points += 3; table[ai].lost++; }
    else if (hs < as_) { table[ai].won++; table[ai].points += 3; table[hi].lost++; }
    else               { table[hi].drawn++; table[ai].drawn++; table[hi].points++; table[ai].points++; }
    table[hi].gd = table[hi].gf - table[hi].ga;
    table[ai].gd = table[ai].gf - table[ai].ga;
  });
  return table.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function KnockoutSection({ groupPredictions, knockoutPredictions, onUpdatePrediction }) {
  const { qualified, bestThirds } = useQualifiedTeams(groupPredictions);
  const usedThirds = new Set();

  function getTeam(code) {
    if (code.includes('-1')) return qualified[code.charAt(0)]?.first;
    if (code.includes('-2')) return qualified[code.charAt(0)]?.second;
    if (code.includes('-3')) {
      const groups = code.split('-')[0].split('');
      for (let g of groups) {
        if (bestThirds[g] && !usedThirds.has(g)) {
          usedThirds.add(g);
          return bestThirds[g].team;
        }
      }
      for (let g of groups) {
        if (bestThirds[g]) return bestThirds[g].team;
      }
    }
    return null;
  }

  function getAllRound16Teams() {
    usedThirds.clear();
    const teams = {};
    const all = [
      ...ROUND_OF_16_BRACKETS.leftTop,
      ...ROUND_OF_16_BRACKETS.leftBottom,
      ...ROUND_OF_16_BRACKETS.rightTop,
      ...ROUND_OF_16_BRACKETS.rightBottom,
    ].sort((a, b) => a.id - b.id);
    all.forEach(m => { teams[m.id] = { home: getTeam(m.home), away: getTeam(m.away) }; });
    return teams;
  }

  function handlePrediction(stage, id, team) {
    onUpdatePrediction({ ...knockoutPredictions, [stage]: { ...knockoutPredictions[stage], [id]: team } });
  }

  function getWinner(stage, id) { return knockoutPredictions[stage]?.[id]; }

  const isRound16Complete  = Object.keys(knockoutPredictions.round16  || {}).length === 16;
  const isRound8Complete   = Object.keys(knockoutPredictions.round8   || {}).length === 8;
  const isQuartersComplete = Object.keys(knockoutPredictions.quarters || {}).length === 4;
  const isSemisComplete    = Object.keys(knockoutPredictions.semis    || {}).length === 2;

  const hasGroupPredictions = Object.values(groupPredictions).some(
    g => g?.matches && Object.keys(g.matches).length > 0
  );

  if (!hasGroupPredictions) {
    return (
      <div className="knockout-empty-state">
        <AlertCircle size={48} />
        <h3>Completa primero la Fase de Grupos</h3>
        <p>Las eliminatorias se habilitarán una vez que hayas predicho los partidos de la fase de grupos.</p>
      </div>
    );
  }

  const round16Teams = getAllRound16Teams();

  return (
    <div className="knockout-section">

      {/* ══════════ 16AVOS DE FINAL ══════════ */}
      <div className="knockout-stage">
        <div className="knockout-stage-header">
          <Trophy size={24} style={{ color: '#F59E0B' }} />
          <div>
            <h2>16AVOS DE FINAL</h2>
            <p>32 equipos clasificados · Selecciona los ganadores de cada llave</p>
          </div>
          <span className="knockout-badge">16 Llaves</span>
        </div>

        <div className="knockout-bracket-container">
          {/* Lado Izquierdo */}
          <div className="knockout-side">
            <h3 className="knockout-side-title">Lado Izquierdo</h3>

            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Superior</h4>
              <div className="knockout-matches-grid">
                {ROUND_OF_16_BRACKETS.leftTop.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ id: match.id, label: match.label, home: match.homeDesc, away: match.awayDesc }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={team => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>

            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Inferior</h4>
              <div className="knockout-matches-grid">
                {ROUND_OF_16_BRACKETS.leftBottom.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ id: match.id, label: match.label, home: match.homeDesc, away: match.awayDesc }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={team => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="knockout-side">
            <h3 className="knockout-side-title">Lado Derecho</h3>

            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Superior</h4>
              <div className="knockout-matches-grid">
                {ROUND_OF_16_BRACKETS.rightTop.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ id: match.id, label: match.label, home: match.homeDesc, away: match.awayDesc }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={team => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>

            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Inferior</h4>
              <div className="knockout-matches-grid">
                {ROUND_OF_16_BRACKETS.rightBottom.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ id: match.id, label: match.label, home: match.homeDesc, away: match.awayDesc }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={team => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ OCTAVOS DE FINAL ══════════ */}
      {isRound16Complete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={24} style={{ color: '#8B5CF6' }} />
            <div>
              <h2>OCTAVOS DE FINAL</h2>
              <p>16 equipos restantes · Los mejores enfrentándose</p>
            </div>
            <span className="knockout-badge">8 Llaves</span>
          </div>

          <div className="knockout-quarters-grid">
            {ROUND_OF_8_BRACKETS.map(octavo => (
              <KnockoutMatchCard
                key={octavo.id}
                match={{
                  id: octavo.id,
                  label: octavo.label,
                  home: `Ganador Llave ${octavo.matches[0]}`,
                  away: `Ganador Llave ${octavo.matches[1]}`,
                }}
                homeTeam={getWinner('round16', octavo.matches[0])}
                awayTeam={getWinner('round16', octavo.matches[1])}
                selectedWinner={knockoutPredictions.round8?.[octavo.id]}
                onSelect={team => handlePrediction('round8', octavo.id, team)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ CUARTOS DE FINAL ══════════ */}
      {isRound8Complete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={24} style={{ color: '#EF4444' }} />
            <div>
              <h2>CUARTOS DE FINAL</h2>
              <p>8 equipos restantes · Definiendo a los semifinalistas</p>
            </div>
            <span className="knockout-badge">4 Llaves</span>
          </div>

          <div className="knockout-semis-grid">
            {QUARTERS_BRACKETS.map(qf => (
              <KnockoutMatchCard
                key={qf.id}
                match={{
                  id: qf.id,
                  label: qf.label,
                  home: `Ganador ${qf.octavos[0]}`,
                  away: `Ganador ${qf.octavos[1]}`,
                }}
                homeTeam={getWinner('round8', qf.octavos[0])}
                awayTeam={getWinner('round8', qf.octavos[1])}
                selectedWinner={knockoutPredictions.quarters?.[qf.id]}
                onSelect={team => handlePrediction('quarters', qf.id, team)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ SEMIFINALES ══════════ */}
      {isQuartersComplete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={24} style={{ color: '#10B981' }} />
            <div>
              <h2>SEMIFINALES</h2>
              <p>4 equipos restantes · A un paso de la gloria</p>
            </div>
            <span className="knockout-badge">2 Llaves</span>
          </div>

          <div className="knockout-final-grid">
            {SEMIS_BRACKETS.map(sf => (
              <KnockoutMatchCard
                key={sf.id}
                match={{
                  id: sf.id,
                  label: sf.label,
                  home: `Ganador ${sf.quarters[0]}`,
                  away: `Ganador ${sf.quarters[1]}`,
                }}
                homeTeam={getWinner('quarters', sf.quarters[0])}
                awayTeam={getWinner('quarters', sf.quarters[1])}
                selectedWinner={knockoutPredictions.semis?.[sf.id]}
                onSelect={team => handlePrediction('semis', sf.id, team)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ FINAL Y TERCER PUESTO ══════════ */}
      {isSemisComplete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={24} style={{ color: '#F59E0B' }} />
            <div>
              <h2>FINAL Y TERCER PUESTO</h2>
              <p>Los últimos partidos del torneo</p>
            </div>
          </div>

          <div className="knockout-final-grid">
            {/* Tercer Puesto */}
            <div className="knockout-final-card third-place">
              <div className="knockout-final-header">
                <Award size={20} style={{ color: '#CD7F32' }} />
                <h3>🥉 Tercer Puesto</h3>
              </div>
              <p className="knockout-final-description">
                Los perdedores de las semifinales disputarán el tercer lugar
              </p>
              {(() => {
                const sf1Winner = getWinner('semis', 'SF1');
                const sf2Winner = getWinner('semis', 'SF2');
                const sf1Team1 = getWinner('quarters', 'QF1');
                const sf1Team2 = getWinner('quarters', 'QF2');
                const sf1Loser = sf1Winner && (sf1Team1 !== sf1Winner ? sf1Team1 : sf1Team2);
                const sf2Team1 = getWinner('quarters', 'QF3');
                const sf2Team2 = getWinner('quarters', 'QF4');
                const sf2Loser = sf2Winner && (sf2Team1 !== sf2Winner ? sf2Team1 : sf2Team2);
                return (
                  <KnockoutMatchCard
                    match={{ id: 'thirdPlace', label: 'TERCER PUESTO', home: 'Perdedor SF1', away: 'Perdedor SF2' }}
                    homeTeam={sf1Loser}
                    awayTeam={sf2Loser}
                    selectedWinner={knockoutPredictions.thirdPlace?.winner}
                    onSelect={team => handlePrediction('thirdPlace', 'winner', team)}
                  />
                );
              })()}
            </div>

            {/* Final */}
            <div className="knockout-final-card champion">
              <div className="knockout-final-header">
                <Trophy size={20} style={{ color: '#F59E0B' }} />
                <h3>🏆 Gran Final</h3>
              </div>
              <p className="knockout-final-description">
                ¿Quién será el campeón del mundo?
              </p>
              <KnockoutMatchCard
                match={{ id: 'final', label: 'FINAL', home: 'Ganador SF1', away: 'Ganador SF2' }}
                homeTeam={getWinner('semis', 'SF1')}
                awayTeam={getWinner('semis', 'SF2')}
                selectedWinner={knockoutPredictions.final?.champion}
                onSelect={team => handlePrediction('final', 'champion', team)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}