import { supabase } from '@/shared/services/supabase/client';

// ════════════════════════════════════════════════════════════
//  IMAGE HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Resuelve la URL pública de una imagen histórica.
 * - Si ya es URL completa (http...), la retorna directo.
 * - Si es un path de Supabase Storage (legacy), obtiene la URL pública.
 * @param {string|null} imagePath
 * @returns {string|null}
 */
export const getHistoricalImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
        return imagePath;
    }

    const { data } = supabase.storage
        .from('historical')
        .getPublicUrl(imagePath);

    return data?.publicUrl || null;
};

// ════════════════════════════════════════════════════════════
//  PLAYERS
// ════════════════════════════════════════════════════════════

/**
 * Obtiene todos los jugadores publicados.
 * @returns {Promise<Array>}
 */
export const fetchPublishedPlayers = async () => {
    const { data, error } = await supabase
        .from('historical_players')
        .select('*')
        .eq('is_published', true)
        .order('significance_level', { ascending: false })
        .order('name');

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene el detalle de un jugador publicado.
 * @param {string} playerId
 * @returns {Promise<Object>}
 */
export const fetchPlayerDetail = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_players')
        .select('*')
        .eq('id', playerId)
        .eq('is_published', true)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Obtiene los equipos donde jugó un jugador.
 * @param {string} playerId
 * @returns {Promise<Array>}
 */
export const fetchPlayerTeams = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_teams')
        .select(`
            start_year,
            end_year,
            roles,
            historical_teams (
                id, name, country, era_dominance, legacy_type, image_path, is_published
            )
        `)
        .eq('player_id', playerId);

    if (error) throw error;
    return (data || [])
        .filter((r) => r.historical_teams?.is_published)
        .sort((a, b) => (a.start_year || 9999) - (b.start_year || 9999));
};

/**
 * Obtiene los eventos donde participó un jugador.
 * @param {string} playerId
 * @returns {Promise<Array>}
 */
export const fetchPlayerEvents = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_events')
        .select(`
            role_note,
            historical_events (
                id, title, event_type, event_date, image_path, is_published
            )
        `)
        .eq('player_id', playerId);

    if (error) throw error;
    return (data || [])
        .filter((r) => r.historical_events?.is_published)
        .sort((a, b) => {
            const da = a.historical_events?.event_date || '';
            const db = b.historical_events?.event_date || '';
            return da < db ? -1 : 1;
        });
};

/**
 * Obtiene la trayectoria en clubes de un jugador.
 * @param {string} playerId
 * @returns {Promise<Array>}
 */
export const fetchPlayerCareer = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_career')
        .select('*')
        .eq('player_id', playerId)
        .order('start_year', { ascending: true });

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene la trayectoria en selección de un jugador.
 * @param {string} playerId
 * @returns {Promise<Array>}
 */
export const fetchPlayerNational = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_national')
        .select('*')
        .eq('player_id', playerId)
        .order('start_year', { ascending: true });

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene el palmarés de un jugador.
 * @param {string} playerId
 * @returns {Promise<Array>}
 */
export const fetchPlayerTitles = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_titles')
        .select('*')
        .eq('player_id', playerId)
        .order('year', { ascending: true });

    if (error) throw error;
    return data || [];
};

// ════════════════════════════════════════════════════════════
//  TEAMS
// ════════════════════════════════════════════════════════════

/**
 * Obtiene todos los equipos publicados.
 * @returns {Promise<Array>}
 */
export const fetchPublishedTeams = async () => {
    const { data, error } = await supabase
        .from('historical_teams')
        .select('*')
        .eq('is_published', true)
        .order('era_dominance', { ascending: true });

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene detalle de un equipo con lineup y títulos.
 * @param {string} teamId
 * @returns {Promise<{ team, lineup, titles }>}
 */
export const fetchTeamDetail = async (teamId) => {
    const [teamRes, lineupRes, titlesRes] = await Promise.all([
        supabase
            .from('historical_teams')
            .select('*')
            .eq('id', teamId)
            .eq('is_published', true)
            .single(),
        supabase
            .from('historical_team_lineup')
            .select('*, historical_players(id, name, image_path)')
            .eq('team_id', teamId)
            .order('shirt_number'),
        supabase
            .from('historical_team_titles')
            .select('*')
            .eq('team_id', teamId)
            .order('year'),
    ]);

    if (teamRes.error) throw teamRes.error;

    return {
        team: teamRes.data,
        lineup: lineupRes.data || [],
        titles: titlesRes.data || [],
    };
};

// ════════════════════════════════════════════════════════════
//  COMPETITIONS
// ════════════════════════════════════════════════════════════

/**
 * Obtiene todas las competiciones publicadas.
 * @returns {Promise<Array>}
 */
export const fetchPublishedCompetitions = async () => {
    const { data, error } = await supabase
        .from('historical_competitions')
        .select('*, historical_teams(id, name, image_path)')
        .eq('is_published', true)
        .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene detalle de una competición con grupos, standings y knockout.
 * @param {string} competitionId
 * @returns {Promise<{ competition, groups, standings, knockout }>}
 */
export const fetchCompetitionDetail = async (competitionId) => {
    const [compRes, groupsRes, standRes, knockRes] = await Promise.all([
        supabase
            .from('historical_competitions')
            .select('*, historical_teams(id, name, image_path, country)')
            .eq('id', competitionId)
            .eq('is_published', true)
            .single(),
        supabase
            .from('historical_competition_groups')
            .select('*')
            .eq('competition_id', competitionId)
            .order('group_name')
            .order('sort_order'),
        supabase
            .from('historical_competition_standings')
            .select('*')
            .eq('competition_id', competitionId)
            .order('position'),
        supabase
            .from('historical_competition_knockout')
            .select('*')
            .eq('competition_id', competitionId)
            .order('sort_order'),
    ]);

    if (compRes.error) throw compRes.error;

    return {
        competition: compRes.data,
        groups: groupsRes.data || [],
        standings: standRes.data || [],
        knockout: knockRes.data || [],
    };
};

// ════════════════════════════════════════════════════════════
//  EVENTS
// ════════════════════════════════════════════════════════════

/**
 * Obtiene todos los eventos publicados con protagonistas.
 * @returns {Promise<Array>}
 */
export const fetchPublishedEvents = async () => {
    const { data, error } = await supabase
        .from('historical_events')
        .select(`
            *,
            historical_players!historical_events_protagonist_id_fkey(id, name, image_path, country, position),
            historical_teams!historical_events_team_protagonist_id_fkey(id, name, image_path, primary_color)
        `)
        .eq('is_published', true)
        .order('event_date', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene detalle de un evento con lineups, squad, standings y knockout.
 * @param {string} eventId
 * @returns {Promise<{ event, lineups, squad, standings, knockout }>}
 */
export const fetchEventDetail = async (eventId) => {
    // Evento principal con protagonistas
    const { data: ev, error: evErr } = await supabase
        .from('historical_events')
        .select(`
            *,
            historical_players!historical_events_protagonist_id_fkey(id, name, image_path, country, position, legacy_type, impact_summary),
            historical_teams!historical_events_team_protagonist_id_fkey(id, name, image_path, primary_color, secondary_color, country, formation, manager)
        `)
        .eq('id', eventId)
        .single();

    if (evErr) throw evErr;

    // Datos adicionales en paralelo
    const [linRes, sqRes, stRes, koRes] = await Promise.all([
        supabase
            .from('historical_event_lineups')
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order'),
        supabase
            .from('historical_event_squad')
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order'),
        supabase
            .from('historical_event_standings')
            .select('*')
            .eq('event_id', eventId)
            .order('position'),
        supabase
            .from('historical_event_knockout')
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order'),
    ]);

    const allLineups = linRes.data || [];

    return {
        event: ev,
        lineups: {
            team_a: allLineups.filter((l) => l.team_side === 'team_a'),
            team_b: allLineups.filter((l) => l.team_side === 'team_b'),
        },
        squad: sqRes.data || [],
        standings: stRes.data || [],
        knockout: koRes.data || [],
    };
};
