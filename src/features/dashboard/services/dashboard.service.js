import { supabase } from '@/shared/services/supabase/client';

// ════════════════════════════════════════════════════════════
//  MATCHES
// ════════════════════════════════════════════════════════════

/**
 * Carga todos los partidos pending con paginación.
 * @returns {Promise<Array>} Lista de partidos pending con predicciones.
 */
export const fetchPendingMatches = async () => {
    let all = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('matches')
            .select('*, predictions(*)')
            .eq('status', 'pending')
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        if (!data?.length) break;

        all = [...all, ...data];
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    return all;
};

/**
 * Upsert de predicción de un usuario para un partido.
 * @param {Object} predictionData - { match_id, user_id, home_score, away_score, predicted_advancing_team? }
 * @returns {Array} Datos de la predicción guardada.
 */
export const upsertMatchPrediction = async (predictionData) => {
    const { data, error } = await supabase
        .from('predictions')
        .upsert(predictionData, {
            onConflict: 'match_id,user_id'
        })
        .select();

    if (error) throw error;
    return data;
};

/**
 * Inserta un nuevo partido.
 * @param {Object} match
 */
export const insertMatch = async (match) => {
    const { error } = await supabase.from('matches').insert(match);
    if (error) throw error;
};

/**
 * Actualiza resultado de un partido.
 * @param {string} matchId
 * @param {Object} updateData
 */
export const updateMatchResult = async (matchId, updateData) => {
    const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);
    if (error) throw error;
};

/**
 * Obtiene un partido con sus predicciones.
 * @param {string} matchId
 * @returns {Object}
 */
export const getMatchWithPredictions = async (matchId) => {
    const { data, error } = await supabase
        .from('matches')
        .select('*, predictions(*)')
        .eq('id', matchId)
        .single();
    if (error) throw error;
    return data;
};

/**
 * Actualiza puntos de una predicción.
 * @param {string} predictionId
 * @param {Object} pointsData - { points_earned, advancing_points }
 */
export const updatePredictionPoints = async (predictionId, pointsData) => {
    const { error } = await supabase
        .from('predictions')
        .update(pointsData)
        .eq('id', predictionId);
    if (error) throw error;
};

/**
 * Obtiene estadísticas de un usuario.
 * @param {string} userId
 * @returns {Object}
 */
export const getUserStats = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('points, predictions, correct, best_streak, current_streak, monthly_points, monthly_predictions, monthly_correct')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

/**
 * Actualiza estadísticas de un usuario.
 * @param {string} userId
 * @param {Object} stats
 */
export const updateUserStats = async (userId, stats) => {
    const { error } = await supabase
        .from('users')
        .update(stats)
        .eq('id', userId);
    if (error) throw error;
};

/**
 * Obtiene todos los usuarios ordenados por puntos (ranking).
 * @returns {Array}
 */
export const fetchAllUsersRanked = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ════════════════════════════════════════════════════════════
//  LEAGUES
// ════════════════════════════════════════════════════════════

/**
 * Upsert de predicción de liga.
 * @param {Object} predictionData
 */
export const upsertLeaguePrediction = async (predictionData) => {
    const { error } = await supabase
        .from('league_predictions')
        .upsert(predictionData, {
            onConflict: 'league_id,user_id'
        });
    if (error) throw error;
};

/**
 * Obtiene todas las ligas con predicciones.
 * @returns {Array}
 */
export const fetchLeaguesWithPredictions = async () => {
    const { data, error } = await supabase
        .from('leagues')
        .select('*, league_predictions(*)');
    if (error) throw error;
    return data || [];
};

/**
 * Inserta una nueva liga.
 * @param {Object} league
 */
export const insertLeague = async (league) => {
    const { error } = await supabase.from('leagues').insert(league);
    if (error) throw error;
};

/**
 * Actualiza una liga (resultados finales).
 * @param {string} leagueId
 * @param {Object} updateData
 */
export const updateLeagueResult = async (leagueId, updateData) => {
    const { error } = await supabase
        .from('leagues')
        .update(updateData)
        .eq('id', leagueId);
    if (error) throw error;
};

/**
 * Obtiene una liga con sus predicciones.
 * @param {string} leagueId
 * @returns {Object}
 */
export const getLeagueWithPredictions = async (leagueId) => {
    const { data, error } = await supabase
        .from('leagues')
        .select('*, league_predictions(*)')
        .eq('id', leagueId)
        .single();
    if (error) throw error;
    return data;
};

/**
 * Actualiza puntos de una predicción de liga.
 * @param {string} predictionId
 * @param {number} pointsEarned
 */
export const updateLeaguePredictionPoints = async (predictionId, pointsEarned) => {
    const { error } = await supabase
        .from('league_predictions')
        .update({ points_earned: pointsEarned })
        .eq('id', predictionId);
    if (error) throw error;
};

/**
 * Obtiene estadísticas de usuario para ligas (incluye weekly).
 * @param {string} userId
 * @returns {Object}
 */
export const getUserStatsForLeague = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('points, predictions, correct, weekly_points, weekly_predictions, weekly_correct')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

// ════════════════════════════════════════════════════════════
//  AWARDS
// ════════════════════════════════════════════════════════════

/**
 * Upsert de predicción de premio.
 * @param {Object} predictionData
 */
export const upsertAwardPrediction = async (predictionData) => {
    const { error } = await supabase
        .from('award_predictions')
        .upsert(predictionData, {
            onConflict: 'award_id,user_id'
        });
    if (error) throw error;
};

/**
 * Obtiene todos los premios con predicciones.
 * @returns {Array}
 */
export const fetchAwardsWithPredictions = async () => {
    const { data, error } = await supabase
        .from('awards')
        .select('*, award_predictions(*)');
    if (error) throw error;
    return data || [];
};

/**
 * Inserta un nuevo premio.
 * @param {Object} award
 */
export const insertAward = async (award) => {
    const { error } = await supabase.from('awards').insert(award);
    if (error) throw error;
};

/**
 * Actualiza un premio (estado y ganador).
 * @param {string} awardId
 * @param {Object} updateData
 */
export const updateAwardResult = async (awardId, updateData) => {
    const { error } = await supabase
        .from('awards')
        .update(updateData)
        .eq('id', awardId);
    if (error) throw error;
};

/**
 * Obtiene un premio con sus predicciones.
 * @param {string} awardId
 * @returns {Object}
 */
export const getAwardWithPredictions = async (awardId) => {
    const { data, error } = await supabase
        .from('awards')
        .select('*, award_predictions(*)')
        .eq('id', awardId)
        .single();
    if (error) throw error;
    return data;
};

/**
 * Actualiza puntos de una predicción de premio.
 * @param {string} predictionId
 * @param {number} pointsEarned
 */
export const updateAwardPredictionPoints = async (predictionId, pointsEarned) => {
    const { error } = await supabase
        .from('award_predictions')
        .update({ points_earned: pointsEarned })
        .eq('id', predictionId);
    if (error) throw error;
};
