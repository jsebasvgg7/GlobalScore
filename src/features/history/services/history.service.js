import { supabase } from '@/shared/services/supabase/client';

// ════════════════════════════════════════════════════════════
//  IMAGE HELPERS
// ════════════════════════════════════════════════════════════

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
 * Obtiene todos los jugadores publicados y NO especiales.
 * Los jugadores especiales (is_special = true) están ocultos del módulo
 * público de Historia — RLS los filtra en Supabase, pero también los
 * excluimos aquí como segunda capa de seguridad.
 */
export const fetchPublishedPlayers = async () => {
    const { data, error } = await supabase
        .from('historical_players')
        .select('*')
        .eq('is_published', true)
        // ── NUEVO: excluir jugadores especiales de la vista pública ──────
        .eq('is_special', false)
        .order('significance_level', { ascending: false })
        .order('name');

    if (error) throw error;
    return data || [];
};

/**
 * Obtiene el detalle de un jugador publicado.
 * Incluye la verificación de is_special = false para reforzar la exclusión.
 * (La RLS ya lo protege a nivel DB, esto es defensa en profundidad.)
 */
export const fetchPlayerDetail = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_players')
        .select('*')
        .eq('id', playerId)
        .eq('is_published', true)
        // ── NUEVO: solo jugadores normales por esta ruta pública ─────────
        .eq('is_special', false)
        .single();

    if (error) throw error;
    return data;
};

/**
 * NUEVO — Obtiene el detalle de un jugador especial.
 * Solo funciona si el usuario autenticado es el dueño (RLS lo garantiza).
 * Úsalo desde la vista de colección personal del usuario, nunca desde Historia.
 */
export const fetchSpecialPlayerDetail = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_players')
        .select('*')
        .eq('id', playerId)
        .eq('is_published', true)
        .eq('is_special', true)
        .single();

    // Si RLS bloquea la consulta (usuario no es el dueño), Supabase
    // retorna un error PGRST116 (no rows) — lo tratamos como "no acceso"
    if (error) return null;
    return data;
};

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

export const fetchPlayerCareer = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_career')
        .select('*')
        .eq('player_id', playerId)
        .order('start_year', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const fetchPlayerNational = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_player_national')
        .select('*')
        .eq('player_id', playerId)
        .order('start_year', { ascending: true });

    if (error) throw error;
    return data || [];
};

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

// Listado completo — todas las columnas, sin límite (usado por la página EQUI)
export const fetchPublishedTeams = async () => {
    const { data, error } = await supabase
        .from('historical_teams')
        .select('*')
        .eq('is_published', true)
        .order('era_dominance', { ascending: true });

    if (error) throw error;
    return data || [];
};

// Landing strip — solo los campos visibles, limitado a 6 (usado solo por HistoryVaultLanding)
export const fetchLandingTeams = async () => {
    const { data, error } = await supabase
        .from('historical_teams')
        .select('id, name, era_dominance, image_path')
        .eq('is_published', true)
        .order('era_dominance', { ascending: true })
        .limit(6);

    if (error) throw error;
    return data || [];
};

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

// Landing stats — HEAD requests, cero filas viajan por la red
export const fetchLandingCounts = async () => {
    const [playersRes, compsRes, teamsRes] = await Promise.all([
        supabase
            .from('historical_players')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)
            .eq('is_special', false),

        supabase
            .from('historical_competitions')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true),

        supabase
            .from('historical_teams')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true),
    ]);

    if (playersRes.error) throw playersRes.error;
    if (compsRes.error) throw compsRes.error;
    if (teamsRes.error) throw teamsRes.error;

    return {
        players: playersRes.count ?? 0,
        competitions: compsRes.count ?? 0,
        teams: teamsRes.count ?? 0,
    };
};

export const fetchPublishedCompetitions = async () => {
    const { data, error } = await supabase
        .from('historical_competitions')
        .select('*, historical_teams(id, name, image_path)')
        .eq('is_published', true)
        .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
};

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

// Listado completo — con JOINs de protagonista/equipo, sin límite (usado por la página EVE)
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

// Landing carousel — solo los campos visibles, sin JOINs, limitado a 8 (usado solo por HistoryVaultLanding)
export const fetchLandingEvents = async () => {
    const { data, error } = await supabase
        .from('historical_events')
        .select('id, title, event_type, event_date, image_path')
        .eq('is_published', true)
        .order('event_date', { ascending: false })
        .limit(8);

    if (error) throw error;
    return data || [];
};

export const fetchEventDetail = async (eventId) => {
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

    const [linRes, sqRes, stRes, koRes, momRes, protaRes] = await Promise.all([
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
        // ── NUEVO: momentos clave del evento ──────────────────
        supabase
            .from('historical_event_moments')
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order'),
        // ── NUEVO: protagonistas del evento ───────────────────
        supabase
            .from('historical_event_protagonists')
            .select(`
                *,
                historical_players(id, name, image_path, country, position),
                historical_teams(id, name, image_path, primary_color)
            `)
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
        moments: momRes.data || [],       // ← NUEVO
        protagonists: protaRes.data || [], // ← NUEVO
    };
};

// ════════════════════════════════════════════════════════════
//  ADMIN — helpers para jugadores especiales
// ════════════════════════════════════════════════════════════

/**
 * NUEVO — Obtiene todos los jugadores (incluyendo especiales no publicados).
 * Solo para uso en el panel de administración.
 */
export const fetchAllPlayersAdmin = async () => {
    const { data, error } = await supabase
        .from('historical_players')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

/**
 * NUEVO — Crea un jugador especial con su dueño asignado.
 * El trigger SQL se encarga de la entrega al publicar.
 * @param {Object} playerData  — campos del jugador (name, country, etc.)
 * @param {string} ownerUserId — id del usuario en public.users
 */
export const createSpecialPlayer = async (playerData, ownerUserId) => {
    const { data, error } = await supabase
        .from('historical_players')
        .insert({
            ...playerData,
            significance_level: 5,       // siempre 5 estrellas
            is_special: true,
            special_owner_id: ownerUserId,
            is_published: false,    // el admin publica manualmente
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * NUEVO — Publica un jugador especial.
 * Al cambiar is_published a true, el trigger trg_special_player_publish
 * crea la carta y la entrega automáticamente al dueño.
 * @param {string} playerId
 */
export const publishSpecialPlayer = async (playerId) => {
    const { data, error } = await supabase
        .from('historical_players')
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq('id', playerId)
        .eq('is_special', true)
        .select()
        .single();

    if (error) throw error;
    return data;
};