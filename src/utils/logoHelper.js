// ============================================
// LOGO HELPER - Equipos, Ligas y Premios
// ============================================

const TEAM_LOGOS_BUCKET = 'team-logos';
const LEAGUE_LOGOS_BUCKET = 'league-logos';
const AWARD_LOGOS_BUCKET = 'award-logos';

// ============================================
// MAPEO DE EQUIPOS CON ABREVIACIONES
// ============================================
export const teamData = {
  // PREMIER LEAGUE
  'Man United': { slug: 'manchesterunited', abbr: 'MUN' },
  'Liverpool': { slug: 'liverpool', abbr: 'LIV' },
  'Arsenal': { slug: 'arsenal', abbr: 'ARS' },
  'Chelsea': { slug: 'chelsea', abbr: 'CHE' },
  'Man City': { slug: 'manchestercity', abbr: 'MCI' },
  'Tottenham': { slug: 'tottenham', abbr: 'TOT' },
  'Newcastle': { slug: 'newcastle', abbr: 'NEW' },
  'Aston Villa': { slug: 'astonvilla', abbr: 'AVL' },
  'West Ham': { slug: 'westham', abbr: 'WHU' },
  'Brighton': { slug: 'brighton', abbr: 'BHA' },
  'Leeds': { slug: 'leeds', abbr: 'LEE' },
  'Sunderland': { slug: 'sunderland', abbr: 'SUN' },
  'Everton': { slug: 'everton', abbr: 'EVE' },
  'Brentford': { slug: 'brentford', abbr: 'BRE' },
  'Wolves': { slug: 'wolves', abbr: 'WOL' },
  'Fulham': { slug: 'fulham', abbr: 'FUL' },
  'Crystal P.': { slug: 'crystalpalace', abbr: 'CRY' },
  'Bournem.': { slug: 'bournemouth', abbr: 'BOU' },
  'Nottingham': { slug: 'nottingham_forest', abbr: 'NFO' },
  'Burnley': { slug: 'burnley', abbr: 'BUR' },

  // LA LIGA
  'Real Madrid': { slug: 'realmadrid', abbr: 'RMA' },
  'Barcelona': { slug: 'barcelona', abbr: 'BAR' },
  'Atl. Madrid': { slug: 'atlmadrid', abbr: 'ATM' },
  'Sevilla': { slug: 'sevilla', abbr: 'SEV' },
  'Real Betis': { slug: 'betis', abbr: 'BET' },
  'Valencia': { slug: 'valencia', abbr: 'VAL' },
  'Villarreal': { slug: 'villarreal', abbr: 'VIL' },
  'Athletic Club': { slug: 'athletic', abbr: 'ATH' },
  'Real Sociedad': { slug: 'realsociedad', abbr: 'RSO' },
  'Celta Vigo': { slug: 'celta', abbr: 'CEL' },
  'Espanyol': { slug: 'espanyol', abbr: 'ESP' },
  'Mallorca': { slug: 'mallorca', abbr: 'MLL' },
  'Rayo Valle': { slug: 'rayovallecano', abbr: 'RAY' },
  'Getafe': { slug: 'getafe', abbr: 'GET' },
  'Alaves': { slug: 'alaves', abbr: 'ALA' },
  'Elche': { slug: 'elche', abbr: 'ELC' },
  'Girona': { slug: 'girona', abbr: 'GIR' },
  'Levante': { slug: 'levante', abbr: 'LEV' },
  'Real Oviedo': { slug: 'realoviedo', abbr: 'OVI' },
  'Ozasuna': { slug: 'osasuna', abbr: 'OSA' },

  // SERIE A
  'Inter Milan': { slug: 'inter', abbr: 'INT' },
  'AC Milan': { slug: 'milan', abbr: 'MIL' },
  'Juventus': { slug: 'juventus', abbr: 'JUV' },
  'Napoli': { slug: 'napoli', abbr: 'NAP' },
  'AS Roma': { slug: 'roma', abbr: 'ROM' },
  'Lazio': { slug: 'lazio', abbr: 'LAZ' },
  'Atalanta': { slug: 'atalanta', abbr: 'ATA' },
  'Fiorentina': { slug: 'fiorentina', abbr: 'FIO' },
  'Torino': { slug: 'torino', abbr: 'TOR' },
  'Bologna': { slug: 'bologna', abbr: 'BOL' },
  'Sassuolo': { slug: 'sassuolo', abbr: 'SAS' },
  'Udinese': { slug: 'udinese', abbr: 'UDI' },
  'Genoa': { slug: 'genoa', abbr: 'GEN' },
  'Cagliari': { slug: 'cagliari', abbr: 'CAG' },
  'Verona': { slug: 'hellasverona', abbr: 'VER' },
  'Lecce': { slug: 'lecce', abbr: 'LEC' },
  'Parma': { slug: 'parma', abbr: 'PAR' },
  'Pisa': { slug: 'pisa', abbr: 'PIS' },
  'Como': { slug: 'como', abbr: 'COM' },
  'Cremonese': { slug: 'cremonese', abbr: 'CRE' },

  // BUNDESLIGA
  'Bayern M.': { slug: 'bayernmunchen', abbr: 'BAY' },
  'Dortmund': { slug: 'borussiadortmund', abbr: 'DOR' },
  'RB Leipzig': { slug: 'rbleipzig', abbr: 'RBL' },
  'Leverkusen': { slug: 'bayerleverkusen', abbr: 'B04' },
  'Augsburg': { slug: 'augsburgo', abbr: 'AUG' },
  'Borussia M.': { slug: 'bmonchengladbach', abbr: 'BMG' },
  'Frankfurt': { slug: 'eintrachtfrankfurt', abbr: 'SGE' },
  'Wolfsburg': { slug: 'wolfsburg', abbr: 'WOB' },
  'Stuttgart': { slug: 'stuttgart', abbr: 'VFB' },
  'Hoffenheim': { slug: 'hoffenheim', abbr: 'HOF' },
  'Freiburg': { slug: 'freiburg', abbr: 'SCF' },
  'Union Berlin': { slug: 'unionberlin', abbr: 'FCU' },
  'Heidenheim': { slug: 'heidenheim', abbr: 'HEI' },
  'St. Pauli': { slug: 'st_pauli', abbr: 'STP' },
  'Mainz': { slug: 'mainz05', abbr: 'M05' },
  'Hamburgo': { slug: 'hamburgo', abbr: 'HSV' },
  'Werder Bremen': { slug: 'werderbremen', abbr: 'SVW' },
  'Koln': { slug: 'koln', abbr: 'KOE' },

  // LIGUE 1
  'Paris SG': { slug: 'psg', abbr: 'PSG' },
  'Marseille': { slug: 'olimpiquemarsella', abbr: 'OGM' },
  'Lyon': { slug: 'olimpiquelyon', abbr: 'OLY' },
  'Monaco': { slug: 'monaco', abbr: 'MON' },
  'Lille': { slug: 'lille', abbr: 'LIL' },
  'Rennes': { slug: 'rennais', abbr: 'REN' },
  'Nice': { slug: 'nice', abbr: 'NIC' },
  'Nantes': { slug: 'nantes', abbr: 'NAN' },
  'Strasbourg': { slug: 'strasbourg', abbr: 'STR' },
  'Angers': { slug: 'angers', abbr: 'ANG' },
  'Auxerre': { slug: 'auxerre', abbr: 'AUX' },
  'Toulouse': { slug: 'toulouse', abbr: 'TOU' },
  'Havre': { slug: 'havre', abbr: 'HAC' },
  'Brest': { slug: 'stadebretois', abbr: 'BRE' },
  'Lorient': { slug: 'lorient', abbr: 'LOR' },
  'Metz': { slug: 'metz', abbr: 'MET' },
  'Racing': { slug: 'racingstrasbourg', abbr: 'RCS' },
  'Paris FC': { slug: 'paris_fc', abbr: 'PFC' },

  // OTROS
  'Ajax': { slug: 'ajax', abbr: 'AJA' },
  'Benfica': { slug: 'benfica', abbr: 'BEN' },
  'Sporting': { slug: 'sporting', abbr: 'SCP' },
  'Pafos': { slug: 'pafos', abbr: 'PAF' },
  'Slavia Praga': { slug: 'slavia_praga', abbr: 'SLP' },
  'Kairat': { slug: 'kairat_almaty', abbr: 'KAI' },
  'Galatasaray': { slug: 'galatasaray', abbr: 'GAL' },
  'Copenhague': { slug: 'fc_copenhague', abbr: 'FCK' },
  'Eintracht': { slug: 'eintrachtfrankfurt', abbr: 'SGE' },
  'Brujas': { slug: 'clubbrugge', abbr: 'CLB' },
  'Union SG': { slug: 'union_saint_gilloise', abbr: 'USG' },
  'Qarabag FK': { slug: 'qarabag', abbr: 'QAR' },
  'Olimpiakos': { slug: 'olympiacos', abbr: 'OLY' },
  'Psv': { slug: 'psv', abbr: 'PSV' },
  'Bodo/Glimt': { slug: 'bodo_glimt', abbr: 'BOD' },
};

// Mapeo inverso para compatibilidad
export const teamSlugMap = Object.fromEntries(
  Object.entries(teamData).map(([name, data]) => [name, data.slug])
);

// ============================================
// MAPEO DE LIGAS
// ============================================
export const leagueMap = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Champions League': 'champions-league',
  'Serie A': 'serie-a',
  'Bundesliga': 'bundesliga',
  'Ligue 1': 'ligue-1',
};

export const leagueLogoMap = {
  'Premier League': 'inglaterra',
  'La Liga': 'espana',
  'Serie A': 'italia',
  'Bundesliga': 'alemania',
  'Ligue 1': 'francia',
  'Champions League': 'champions',
  'Europa League': 'europa',
  'Conference League': 'conference',
};

// ============================================
// MAPEO DE LOGOS DE PREMIOS
// ============================================
export const awardLogoMap = {
  'Ballon D Or': 'balondeor',
  'Bota De Or': 'botadeoro',
  'The Best': 'thebest',
  'Yashin': 'yashin',
  'Golden Boy': 'goldenboy',
  'Club Of The Year': 'club',
};

// ============================================
// FUNCIONES DE ABREVIACIONES
// ============================================

/**
 * Obtiene la abreviación de 3 letras de un equipo
 * @param {string} teamName - Nombre del equipo
 * @returns {string} Abreviación de 3 letras o el nombre si no existe
 */
export function getTeamAbbreviation(teamName) {
  const data = teamData[teamName];
  return data ? data.abbr : teamName.substring(0, 3).toUpperCase();
}

/**
 * Obtiene slug y abreviación de un equipo
 * @param {string} teamName - Nombre del equipo
 * @returns {Object|null} { slug, abbr } o null si no existe
 */
export function getTeamData(teamName) {
  return teamData[teamName] || null;
}

// ============================================
// FUNCIONES PARA LOGOS DE EQUIPOS
// ============================================

export function getTeamLogoUrl(supabase, leagueSlug, teamSlug) {
  const path = `leagues/${leagueSlug}/${teamSlug}.png`;
  const { data } = supabase.storage
    .from(TEAM_LOGOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function getLogoUrlByTeamName(supabase, teamName, leagueName) {
  const data = teamData[teamName];
  const leagueSlug = leagueMap[leagueName];
  
  if (!data || !leagueSlug) {
    console.warn(`⚠️ Logo de equipo no encontrado: "${teamName}" en "${leagueName}"`);
    return null;
  }
  
  return getTeamLogoUrl(supabase, leagueSlug, data.slug);
}

// ============================================
// FUNCIONES PARA LOGOS DE LIGAS
// ============================================

export function getLeagueLogoUrl(supabase, leagueSlug) {
  const path = `${leagueSlug}.png`;
  const { data } = supabase.storage
    .from(LEAGUE_LOGOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function getLogoUrlByLeagueName(supabase, leagueName) {
  const leagueSlug = leagueLogoMap[leagueName];
  if (!leagueSlug) {
    console.warn(`⚠️ Logo de liga no encontrado: "${leagueName}"`);
    return null;
  }
  return getLeagueLogoUrl(supabase, leagueSlug);
}

// ============================================
// FUNCIONES PARA LOGOS DE PREMIOS
// ============================================

export function getAwardLogoUrl(supabase, awardSlug) {
  const path = `${awardSlug}.png`;
  const { data } = supabase.storage
    .from(AWARD_LOGOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function getLogoUrlByAwardName(supabase, awardName) {
  const awardSlug = awardLogoMap[awardName];
  if (!awardSlug) {
    console.warn(`⚠️ Logo de premio no encontrado: "${awardName}"`);
    return null;
  }
  return getAwardLogoUrl(supabase, awardSlug);
}