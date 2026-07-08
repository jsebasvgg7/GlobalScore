import { supabase } from '@/shared/services/supabase/client';

// ════════════════════════════════════════════════════════════
//  USER PROFILE
// ════════════════════════════════════════════════════════════

export const fetchUserById = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

export const updateUserProfile = async (userId, updates) => {
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  ACHIEVEMENTS & TITLES
// ════════════════════════════════════════════════════════════

export const fetchAvailableAchievements = async () => {
    const { data, error } = await supabase
        .from('available_achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const fetchAvailableTitles = async () => {
    const { data, error } = await supabase
        .from('available_titles')
        .select('*');
    if (error) throw error;
    return data || [];
};

export const upsertAchievement = async (achievementData) => {
    const { error } = await supabase
        .from('available_achievements')
        .upsert(achievementData, { onConflict: 'id' });
    if (error) throw error;
};

export const deleteAchievementById = async (achievementId) => {
    const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', achievementId);
    if (error) throw error;
};

export const upsertTitle = async (titleData) => {
    const { error } = await supabase
        .from('available_titles')
        .upsert(titleData, { onConflict: 'id' });
    if (error) throw error;
};

export const deleteTitleById = async (titleId) => {
    const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', titleId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  PREDICTION HISTORY
// ════════════════════════════════════════════════════════════

export const fetchPredictionHistory = async (userId) => {
    const { data, error } = await supabase
        .from('predictions')
        .select(`
            *,
            matches (
                id, league, home_team, away_team,
                home_team_logo, away_team_logo,
                result_home, result_away, status, date, time
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ════════════════════════════════════════════════════════════
//  STREAKS
// ════════════════════════════════════════════════════════════

export const fetchUserPredictionsWithMatches = async (userId) => {
    const { data, error } = await supabase
        .from('predictions')
        .select(`
            *,
            matches (
                result_home, result_away, status, date,
                is_knockout, advancing_team
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

// ════════════════════════════════════════════════════════════
//  MONTHLY CHAMPIONSHIPS
// ════════════════════════════════════════════════════════════

export const fetchUserCrownHistory = async (userId) => {
    const { data, error } = await supabase
        .from('monthly_championship_history')
        .select('*')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const fetchUserMonthlyStats = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('monthly_points, monthly_predictions, monthly_correct, monthly_championships')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

// ════════════════════════════════════════════════════════════
//  RANKING
// ════════════════════════════════════════════════════════════

export const fetchAllUsersForRanking = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('id, points')
        .order('points', { ascending: false });
    if (error) throw error;
    return data || [];
};
