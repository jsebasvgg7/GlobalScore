// ============================================
// LOGO HELPER - Equipos, Ligas y Premios
// ============================================

const TEAM_LOGOS_BUCKET = 'team-logos';
const LEAGUE_LOGOS_BUCKET = 'league-logos';
const AWARD_LOGOS_BUCKET = 'award-logos';
const WORLD_CUP_LOGOS_BUCKET = 'world-cup-logos';

// ============================================
// MAPEO DE EQUIPOS (Clubes)
// ============================================
export const teamSlugMap = {
  'MUN': 'manchesterunited',
  'LIV': 'liverpool',
  'ARS': 'arsenal',
  'CHE': 'chelsea',
  'MCI': 'manchestercity',
  'TOT': 'tottenham',
  'NEW': 'newcastle',
  'AVL': 'astonvilla',
  'WHU': 'westham',
  'BHA': 'brighton',
  'LEE': 'leeds',
  'SUN': 'sunderland',
  'EVE': 'everton',
  'BRE': 'brentford',
  'WOL': 'wolves',
  'FUL': 'fulham',
  'CRY': 'crystalpalace',
  'BOU': 'bournemouth',
  'NFO': 'nottingham_forest',
  'BUR': 'burnley',
  'RMA': 'realmadrid',
  'FCB': 'barcelona',
  'ATM': 'atlmadrid',
  'SEV': 'sevilla',
  'BET': 'betis',
  'VAL': 'valencia',
  'VIL': 'villarreal',
  'ATH': 'athletic',
  'RSO': 'realsociedad',
  'CEL': 'celta',
  'ESP': 'espanyol',
  'MLL': 'mallorca',
  'RAY': 'rayovallecano',
  'GET': 'getafe',
  'ALA': 'alaves',
  'ELC': 'elche',
  'GIR': 'girona',
  'LEV': 'levante',
  'OVI': 'realoviedo',
  'OSA': 'osasuna',
  'INT': 'inter',
  'MIL': 'milan',
  'JUV': 'juventus',
  'NAP': 'napoli',
  'ROM': 'roma',
  'LAZ': 'lazio',
  'ATA': 'atalanta',
  'FIO': 'fiorentina',
  'TOR': 'torino',
  'BOL': 'bologna',
  'SAS': 'sassuolo',
  'UDI': 'udinese',
  'GEN': 'genoa',
  'CAG': 'cagliari',
  'VER': 'hellasverona',
  'LEC': 'lecce',
  'PAR': 'parma',
  'PIS': 'pisa',
  'COM': 'como',
  'CRE': 'cremonese',
  'BAY': 'bayernmunchen',
  'DOR': 'borussiadortmund',
  'RBL': 'rbleipzig',
  'B04': 'bayerleverkusen',
  'AUG': 'augsburgo',
  'BMG': 'bmonchengladbach',
  'SGE': 'eintrachtfrankfurt',
  'WOB': 'wolfsburg',
  'VFB': 'stuttgart',
  'HOF': 'hoffenheim',
  'SCF': 'freiburg',
  'FCU': 'unionberlin',
  'HEI': 'heidenheim',
  'STP': 'st_pauli',
  'M05': 'mainz05',
  'HSV': 'hamburgo',
  'SVW': 'werderbremen',
  'KOE': 'koln',
  'PSG': 'psg',
  'OGM': 'olimpiquemarsella',
  'OLY': 'olimpiquelyon',
  'MON': 'monaco',
  'LIL': 'lille',
  'REN': 'rennais',
  'NIC': 'nice',
  'NAN': 'nantes',
  'STR': 'strasbourg',
  'ANG': 'angers',
  'AUX': 'auxerre',
  'TOU': 'toulouse',
  'HAC': 'havre',
  'SBR': 'stadebretois',
  'LOR': 'lorient',
  'MET': 'metz',
  'RCS': 'racingstrasbourg',
  'PFC': 'paris_fc',
  'LEN': 'racinglens',
  'AJA': 'ajax',
  'BEN': 'benfica',
  'SCP': 'sporting',
  'PAF': 'pafos',
  'SLP': 'slavia_praga',
  'KAI': 'kairat_almaty',
  'GAL': 'galatasaray',
  'FCK': 'fc_copenhague',
  'EIN': 'eintrachtfrankfurt',
  'CLB': 'clubbrugge',
  'USG': 'union_saint_gilloise',
  'QAR': 'qarabag',
  'OLI': 'olympiacos',
  'PSV': 'psv',
  'BOD': 'bodo_glimt',
};

// ============================================
// MAPEO DE SELECCIONES NACIONALES (FIFA)
// ============================================
export const countrySlugMap = {
  // Europa
  'GER': 'alemania',
  'AUT': 'austria',
  'BEL': 'belgica',
  'CRO': 'croacia',
  'DEN': 'dinamarca',
  'SCO': 'escocia',
  'ESP': 'espana',
  'FRA': 'francia',
  'NED': 'paisesbajos',
  'NOR': 'noruega',
  'POL': 'polonia',
  'POR': 'portugal',
  'SUI': 'suiza',
  'TUR': 'turquia',
  'ITA': 'italia',
  'ENG': 'inglaterra',

  // América
  'ARG': 'argentina',
  'BOL': 'bolivia',
  'BRA': 'brasil',
  'CAN': 'canada',
  'COL': 'colombia',
  'CRC': 'costarica',
  'CUR': 'curacao',
  'ECU': 'ecuador',
  'MEX': 'mexico',
  'PAN': 'panama',
  'PAR': 'paraguay',
  'URU': 'uruguay',
  'USA': 'usa',
  'HTI': 'haiti',

  // África
  'ALG': 'argelia',
  'CPV': 'caboverde',
  'CIV': 'costamarfil',
  'COG': 'congo',
  'EGY': 'egipto',
  'GHA': 'ghana',
  'MAR': 'marruecos',
  'SEN': 'senegal',
  'RSA': 'sudafrica',
  'TUN': 'tunez',

  // Asia
  'IRN': 'iran',
  'JPN': 'japon',
  'JOR': 'jordan',
  'KOR': 'coreadelsur',
  'QAT': 'qatar',
  'UZB': 'uzbekistan',
  'KSA': 'arabiasaudita',

  // Oceanía
  'AUS': 'australia',
  'NZL': 'nuevazelanda',
};

// ============================================
// MAPEO DE LIGAS (para equipos de clubes)
// ============================================
export const leagueMap = {
  // Competiciones Europeas
  'Champions League': 'champions-league',
  'Europa League': 'champions-league',
  'Conference League': 'champions-league',

  // España
  'La Liga': 'la-liga',
  'Copa del Rey': 'la-liga',
  'Supercopa de España': 'la-liga',

  // Inglaterra
  'Premier League': 'premier-league',
  'FA Cup': 'premier-league',
  'EFL Cup': 'premier-league',
  'Carabao Cup': 'premier-league',
  'Community Shield': 'premier-league',

  // Italia
  'Serie A': 'serie-a',
  'Coppa Italia': 'serie-a',
  'Supercoppa Italiana': 'serie-a',

  // Alemania
  'Bundesliga': 'bundesliga',
  'DFB Pokal': 'bundesliga',
  'Copa de Alemania': 'bundesliga',
  'Supercopa de Alemania': 'bundesliga',

  // Francia
  'Ligue 1': 'ligue-1',
  'Coupe de France': 'ligue-1',
  'Supercopa de Francia': 'ligue-1',
};

// ============================================
// MAPEO DE LOGOS DE LIGAS (URLs directas)
// ============================================
export const leagueLogoUrlMap = {
  // FIFA
  'FIFA': 'https://auquyjigjceqzwpjbbff.supabase.co/storage/v1/object/public/league-logos/FIFA.png',

  // Competiciones Europeas
  'Champions League': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png',
  'Europa League': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/73.png',
  'Conference League': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/10216.png',

  // España
  'La Liga': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png',
  'Copa del Rey': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/138.png',
  'Supercopa de España': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/139.png',

  // Inglaterra
  'Premier League': 'https://image-service.onefootball.com/transform?w=256&dpr=2&image=https://images.onefootball.com/icons/leagueColoredCompetition/128/9.png',
  'FA Cup': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/132.png',
  'EFL Cup': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/133.png',
  'Carabao Cup': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/133.png',
  'Community Shield': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/247.png',

  // Italia
  'Serie A': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png',
  'Coppa Italia': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/141.png',
  'Supercoppa Italiana': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/222.png',

  // Alemania
  'Bundesliga': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/54.png',
  'DFB Pokal': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/209.png',
  'Copa de Alemania': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/209.png',
  'Supercopa de Alemania': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/8924.png',

  // Francia
  'Ligue 1': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/53.png',
  'Coupe de France': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/134.png',
  'Supercopa de Francia': 'https://images.fotmob.com/image_resources/logo/leaguelogo/dark/207.png',
};

// Mantener compatibilidad con código antiguo
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
// FUNCIONES PARA LOGOS DE EQUIPOS (Clubes)
// ============================================

export function getTeamLogoUrl(supabase, leagueSlug, teamSlug) {
  const path = `leagues/${leagueSlug}/${teamSlug}.png`;
  const { data } = supabase.storage
    .from(TEAM_LOGOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function getLogoUrlByTeamName(supabase, teamName, leagueName) {
  // Si es liga FIFA, usar logos de selecciones nacionales
  if (leagueName === 'FIFA') {
    return getCountryLogoUrl(supabase, teamName);
  }

  const teamSlug = teamSlugMap[teamName];
  const leagueSlug = leagueMap[leagueName];

  if (!teamSlug || !leagueSlug) {
    console.warn(`⚠️ Logo de equipo no encontrado: "${teamName}" en "${leagueName}"`);
    return null;
  }

  return getTeamLogoUrl(supabase, leagueSlug, teamSlug);
}

// ============================================
// FUNCIONES PARA LOGOS DE SELECCIONES (FIFA)
// ============================================

/**
 * Obtiene la URL pública del logo de una selección nacional
 * @param {object} supabase - Cliente de Supabase
 * @param {string} countryCode - Abreviación del país (ej: 'MEX', 'ARG')
 * @returns {string|null} URL pública del logo o null si no existe
 */
export function getCountryLogoUrl(supabase, countryCode) {
  const slug = countrySlugMap[countryCode];

  if (!slug) {
    console.warn(`⚠️ Logo de selección no encontrado: "${countryCode}"`);
    return null;
  }

  const { data } = supabase.storage
    .from(WORLD_CUP_LOGOS_BUCKET)
    .getPublicUrl(`${slug}.png`);

  return data.publicUrl;
}

/**
 * Obtiene la URL pública del logo de una selección por nombre completo
 * @param {object} supabase - Cliente de Supabase
 * @param {string} countryName - Nombre del país en español (ej: 'México', 'Paraguay')
 * @returns {string|null} URL pública del logo o null si no existe
 */
export function getCountryLogoUrlByName(supabase, countryName) {
  // Normalizar: minúsculas, sin acentos
  const normalized = countryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');

  // Buscar directamente por slug normalizado
  const slugValues = Object.values(countrySlugMap);
  const match = slugValues.find(slug => slug === normalized);

  if (!match) {
    console.warn(`⚠️ Logo de selección no encontrado por nombre: "${countryName}"`);
    return null;
  }

  const { data } = supabase.storage
    .from(WORLD_CUP_LOGOS_BUCKET)
    .getPublicUrl(`${match}.png`);

  return data.publicUrl;
}

// ============================================
// FUNCIONES PARA LOGOS DE LIGAS
// ============================================

export function getLeagueLogoUrlDirect(leagueName) {
  const url = leagueLogoUrlMap[leagueName];

  if (!url) {
    console.warn(`⚠️ Logo de liga no encontrado: "${leagueName}"`);
    return null;
  }

  return url;
}

export function getLeagueLogoUrl(supabase, leagueSlug) {
  const path = `${leagueSlug}.png`;
  const { data } = supabase.storage
    .from(LEAGUE_LOGOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export function getLogoUrlByLeagueName(supabase, leagueName) {
  const directUrl = getLeagueLogoUrlDirect(leagueName);
  if (directUrl) return directUrl;

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