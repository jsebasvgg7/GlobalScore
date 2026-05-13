import { supabase } from '@/shared/services/supabase/client';

// ════════════════════════════════════════════════════════════
//  WORLD CUP PREDICTIONS
// ════════════════════════════════════════════════════════════

export const fetchWorldCupPredictions = async (userId) => {
    const { data, error } = await supabase
        .from('worldcup_predictions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
};

export const upsertWorldCupPredictions = async (userId, predictions) => {
    const { error } = await supabase
        .from('worldcup_predictions')
        .upsert({
            user_id: userId,
            groups_predictions: predictions.groups,
            knockout_predictions: predictions.knockout,
            awards_predictions: predictions.awards,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });
    if (error) throw error;
};
