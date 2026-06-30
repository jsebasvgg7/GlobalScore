import { supabase } from '@/shared/services/supabase/client';
import { uploadToCloudinary } from '@/shared/services/cloudinary/upload.service';

// ════════════════════════════════════════════════════════════
//  MATCHES
// ════════════════════════════════════════════════════════════

export const insertMatch = async (match) => {
    const { error } = await supabase.from('matches').insert(match);
    if (error) throw error;
};

export const updateMatchResult = async (matchId, updateData) => {
    const { error } = await supabase
        .from('matches')
        .update({
            ...updateData,
            status: 'finished',
        })
        .eq('id', matchId);
    if (error) throw error;
};

export const getMatchWithPredictions = async (matchId) => {
    const { data, error } = await supabase
        .from('matches')
        .select('*, predictions(*)')
        .eq('id', matchId)
        .single();
    if (error) throw error;
    return data;
};

export const deleteMatch = async (matchId) => {
    const { error: predError } = await supabase
        .from('predictions')
        .delete()
        .eq('match_id', matchId);
    if (predError) throw predError;

    const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  PREDICTIONS
// ════════════════════════════════════════════════════════════

export const updatePredictionPoints = async (predictionId, pointsEarned, advancingPoints) => {
    const resultType = pointsEarned === 5
        ? 'exact'
        : pointsEarned === 3
            ? 'result'
            : 'miss';

    const { error } = await supabase
        .from('predictions')
        .update({
            points_earned: pointsEarned,
            advancing_points: advancingPoints,
            result_type: resultType,
        })
        .eq('id', predictionId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════════════════════

export const getUserStats = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('points, predictions, correct, best_streak, current_streak, monthly_points, monthly_predictions, monthly_correct')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return data;
};

export const updateUserStats = async (userId, stats) => {
    const { error } = await supabase
        .from('users')
        .update(stats)
        .eq('id', userId);
    if (error) throw error;
};

export const clearEquippedBanner = async (imageUrl) => {
    const { error } = await supabase
        .from('users')
        .update({ equipped_banner_url: null })
        .eq('equipped_banner_url', imageUrl);
    if (error) throw error;
};

export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, points, avatar_url')
        .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
};

// ════════════════════════════════════════════════════════════
//  LEAGUES
// ════════════════════════════════════════════════════════════

export const insertLeague = async (league) => {
    // Extraer deadline_time del objeto antes de insertar
    const { deadline_time, ...leagueData } = league;
    const { error } = await supabase.from('leagues').insert(leagueData);
    if (error) throw error;
};

/**
 * Finaliza una liga, actualiza su estado y distribuye puntos a los usuarios.
 * 5 puntos por cada campo acertado (campeón, goleador, asistidor, MVP).
 */
export const finishLeague = async (leagueId, results) => {
    // 1. Marcar la liga como finalizada con sus resultados
    const { error: leagueError } = await supabase
        .from('leagues')
        .update({
            status: 'finished',
            champion: results.champion,
            top_scorer: results.top_scorer,
            top_scorer_goals: results.top_scorer_goals,
            top_assist: results.top_assist,
            top_assist_count: results.top_assist_count,
            mvp_player: results.mvp_player,
        })
        .eq('id', leagueId);
    if (leagueError) throw leagueError;

    // 2. Obtener todas las predicciones de esta liga
    const { data: predictions, error: predError } = await supabase
        .from('league_predictions')
        .select('*')
        .eq('league_id', leagueId);
    if (predError) throw predError;

    if (!predictions || predictions.length === 0) {
        console.log('No hay predicciones para esta liga.');
        return;
    }

    console.log(`📊 Procesando ${predictions.length} predicciones de liga...`);

    // 3. Calcular y distribuir puntos por cada predicción
    for (const prediction of predictions) {
        let pointsEarned = 0;
        let correctCount = 0;

        if (prediction.predicted_champion?.toLowerCase() === results.champion?.toLowerCase()) {
            pointsEarned += 5;
            correctCount++;
        }
        if (prediction.predicted_top_scorer?.toLowerCase() === results.top_scorer?.toLowerCase()) {
            pointsEarned += 5;
            correctCount++;
        }
        if (prediction.predicted_top_assist?.toLowerCase() === results.top_assist?.toLowerCase()) {
            pointsEarned += 5;
            correctCount++;
        }
        if (prediction.predicted_mvp?.toLowerCase() === results.mvp_player?.toLowerCase()) {
            pointsEarned += 5;
            correctCount++;
        }

        console.log(`Usuario ${prediction.user_id}: ${pointsEarned} pts (${correctCount}/4 aciertos)`);

        // Actualizar points_earned en la predicción
        const { error: updPredErr } = await supabase
            .from('league_predictions')
            .update({ points_earned: pointsEarned })
            .eq('id', prediction.id);
        if (updPredErr) console.error('Error actualizando predicción:', updPredErr);

        // Si no ganó puntos, no actualizar al usuario
        if (pointsEarned === 0) continue;

        // Obtener stats actuales del usuario
        const { data: userData, error: userErr } = await supabase
            .from('users')
            .select('points, predictions, correct, monthly_points, monthly_predictions, monthly_correct')
            .eq('id', prediction.user_id)
            .single();

        if (userErr || !userData) {
            console.error(`Error obteniendo usuario ${prediction.user_id}:`, userErr);
            continue;
        }

        // Actualizar estadísticas globales y mensuales del usuario
        const { error: updUserErr } = await supabase
            .from('users')
            .update({
                points: (userData.points || 0) + pointsEarned,
                predictions: (userData.predictions || 0) + 1,
                correct: (userData.correct || 0) + correctCount,
                monthly_points: (userData.monthly_points || 0) + pointsEarned,
                monthly_predictions: (userData.monthly_predictions || 0) + 1,
                monthly_correct: (userData.monthly_correct || 0) + correctCount,
            })
            .eq('id', prediction.user_id);

        if (updUserErr) console.error(`Error actualizando usuario ${prediction.user_id}:`, updUserErr);
        else console.log(`✅ Usuario ${prediction.user_id} actualizado: +${pointsEarned} pts`);
    }

    console.log('✅ Liga finalizada y puntos distribuidos correctamente.');
};

export const deleteLeague = async (leagueId) => {
    const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  AWARDS
// ════════════════════════════════════════════════════════════

export const insertAward = async (award) => {
    // Extraer deadline_time del objeto antes de insertar
    const { deadline_time, ...awardData } = award;
    const { error } = await supabase.from('awards').insert(awardData);
    if (error) throw error;
};

/**
 * Finaliza un premio, actualiza su estado y distribuye puntos a los usuarios.
 * 10 puntos por acertar el ganador.
 */
export const finishAward = async (awardId, winner) => {
    // 1. Marcar el premio como finalizado
    const { error: awardError } = await supabase
        .from('awards')
        .update({ status: 'finished', winner })
        .eq('id', awardId);
    if (awardError) throw awardError;

    // 2. Obtener todas las predicciones de este premio
    const { data: predictions, error: predError } = await supabase
        .from('award_predictions')
        .select('*')
        .eq('award_id', awardId);
    if (predError) throw predError;

    if (!predictions || predictions.length === 0) {
        console.log('No hay predicciones para este premio.');
        return;
    }

    console.log(`📊 Procesando ${predictions.length} predicciones de premio...`);

    // 3. Calcular y distribuir puntos
    for (const prediction of predictions) {
        const pointsEarned = prediction.predicted_winner?.toLowerCase() === winner.toLowerCase()
            ? 10
            : 0;

        console.log(`Usuario ${prediction.user_id}: ${pointsEarned} pts`);

        // Actualizar points_earned en la predicción
        const { error: updPredErr } = await supabase
            .from('award_predictions')
            .update({ points_earned: pointsEarned })
            .eq('id', prediction.id);
        if (updPredErr) console.error('Error actualizando predicción:', updPredErr);

        // Si no ganó puntos, no actualizar al usuario
        if (pointsEarned === 0) continue;

        // Obtener stats actuales del usuario
        const { data: userData, error: userErr } = await supabase
            .from('users')
            .select('points, predictions, correct, monthly_points, monthly_predictions, monthly_correct')
            .eq('id', prediction.user_id)
            .single();

        if (userErr || !userData) {
            console.error(`Error obteniendo usuario ${prediction.user_id}:`, userErr);
            continue;
        }

        // Actualizar estadísticas globales y mensuales del usuario
        const { error: updUserErr } = await supabase
            .from('users')
            .update({
                points: (userData.points || 0) + pointsEarned,
                predictions: (userData.predictions || 0) + 1,
                correct: (userData.correct || 0) + 1,
                monthly_points: (userData.monthly_points || 0) + pointsEarned,
                monthly_predictions: (userData.monthly_predictions || 0) + 1,
                monthly_correct: (userData.monthly_correct || 0) + 1,
            })
            .eq('id', prediction.user_id);

        if (updUserErr) console.error(`Error actualizando usuario ${prediction.user_id}:`, updUserErr);
        else console.log(`✅ Usuario ${prediction.user_id} actualizado: +${pointsEarned} pts`);
    }

    console.log('✅ Premio finalizado y puntos distribuidos correctamente.');
};

export const deleteAward = async (awardId) => {
    const { error } = await supabase.from('awards').delete().eq('id', awardId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  ACHIEVEMENTS
// ════════════════════════════════════════════════════════════

export const upsertAchievement = async (achievement) => {
    const { error } = await supabase
        .from('available_achievements')
        .upsert(achievement, { onConflict: 'id' });
    if (error) throw error;
};

export const deleteAchievement = async (achievementId) => {
    const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', achievementId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  TITLES
// ════════════════════════════════════════════════════════════

export const upsertTitle = async (title) => {
    const { error } = await supabase
        .from('available_titles')
        .upsert(title, { onConflict: 'id' });
    if (error) throw error;
};

export const deleteTitle = async (titleId) => {
    const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', titleId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  BANNERS
// ════════════════════════════════════════════════════════════

export const uploadBannerImage = async (file) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        throw new Error('No hay sesión activa. Por favor recarga la página e inicia sesión nuevamente.');
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExts.includes(ext)) {
        throw new Error(`Formato no permitido. Usa: ${allowedExts.join(', ')}`);
    }

    const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
        });

    if (uploadError) {
        if (uploadError.statusCode === '403' || uploadError.message?.includes('403')) {
            throw new Error('Sin permisos para subir archivos. Ve a Supabase → Storage → Policies y revisa las políticas INSERT del bucket "banners".');
        }
        if (uploadError.statusCode === '404' || uploadError.message?.includes('not found')) {
            throw new Error('El bucket "banners" no existe. Ve a Supabase → Storage y créalo como público.');
        }
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);
    return publicUrl;
};

export const insertBanner = async (bannerData) => {
    const { error } = await supabase.from('available_banners').insert({
        name: bannerData.name,
        description: bannerData.description || '',
        image_url: bannerData.image_url,
    });
    if (error) throw error;
};

export const deleteBanner = async (bannerId, imageUrl) => {
    await clearEquippedBanner(imageUrl);

    const { error: ubError } = await supabase
        .from('user_banners')
        .delete()
        .eq('banner_id', bannerId);
    if (ubError) throw ubError;

    const { error } = await supabase
        .from('available_banners')
        .delete()
        .eq('id', bannerId);
    if (error) throw error;

    try {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('banners').remove([fileName]);
    } catch {
        console.warn('No se pudo eliminar la imagen del storage:', imageUrl);
    }
};

export const assignBannerToUser = async (userId, bannerId) => {
    const { error } = await supabase
        .from('user_banners')
        .insert({ user_id: userId, banner_id: bannerId });
    if (error) throw error;
};

export const revokeBannerFromUser = async (userId, bannerId, imageUrl) => {
    const { error } = await supabase
        .from('user_banners')
        .delete()
        .eq('user_id', userId)
        .eq('banner_id', bannerId);
    if (error) throw error;

    await supabase
        .from('users')
        .update({ equipped_banner_url: null })
        .eq('id', userId)
        .eq('equipped_banner_url', imageUrl);
};

export const getUserBanners = async (userId) => {
    const { data, error } = await supabase
        .from('user_banners')
        .select('*, available_banners(*)')
        .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((r) => r.available_banners);
};

// ════════════════════════════════════════════════════════════
//  CROWNS / MONTHLY CHAMPIONSHIPS
// ════════════════════════════════════════════════════════════

export const awardMonthlyCrown = async (winnerId, monthLabel, adminId) => {
    const { data, error } = await supabase.rpc('award_monthly_championship', {
        winner_user_id: winnerId,
        month_label: monthLabel,
        awarded_by_user_id: adminId,
    });
    if (error) throw error;
    return data;
};

export const resetMonthlyStats = async () => {
    const { data, error } = await supabase.rpc('reset_all_monthly_stats');
    if (error) throw error;
    if (data && !data.success) {
        throw new Error(data.error || 'Error desconocido en reset');
    }
    return data;
};

// ════════════════════════════════════════════════════════════
//  TROPHIES / GLOBAL CHAMPIONSHIPS
// ════════════════════════════════════════════════════════════

export const awardGlobalTrophy = async (winnerId, editionLabel, adminId) => {
    const { data, error } = await supabase.rpc('award_global_championship', {
        winner_user_id: winnerId,
        edition_label: editionLabel,
        awarded_by_user_id: adminId,
    });
    if (error) throw error;
    return data;
};

export const resetGlobalStats = async () => {
    const { data, error } = await supabase.rpc('reset_all_global_stats');
    if (error) throw error;
    if (data && !data.success) {
        throw new Error(data.error || 'Error desconocido en reset');
    }
    return data;
};

// ════════════════════════════════════════════════════════════
//  LOAD ALL ADMIN DATA
// ════════════════════════════════════════════════════════════

export const loadAllAdminData = async () => {
    const [
        matchData,
        leagueData,
        awardData,
        achievementData,
        titleData,
        userData,
        historyData,
        bannerData,
        globalUserData,
        trophyHistoryData,
    ] = await Promise.all([
        supabase
            .from('matches')
            .select('*, predictions(*)')
            .order('created_at', { ascending: false })
            .range(0, 5000),
        supabase.from('leagues').select('*, league_predictions(*)'),
        supabase.from('awards').select('*, award_predictions(*)'),
        supabase.from('available_achievements').select('*'),
        supabase.from('available_titles').select('*'),
        supabase
            .from('users')
            .select('*')
            .order('monthly_points', { ascending: false })
            .limit(10),
        supabase
            .from('monthly_championship_history')
            .select('*, users(name)')
            .order('awarded_at', { ascending: false }),
        supabase
            .from('available_banners')
            .select('*')
            .order('created_at', { ascending: false }),
        supabase
            .from('users')
            .select('*')
            .order('points', { ascending: false })
            .limit(10),
        supabase
            .from('global_championship_history')
            .select('*, users(name)')
            .order('awarded_at', { ascending: false }),
    ]);

    return {
        matches: matchData.data || [],
        leagues: leagueData.data || [],
        awards: awardData.data || [],
        achievements: achievementData.data || [],
        titles: titleData.data || [],
        users: userData.data || [],
        crownHistory: historyData.data || [],
        banners: bannerData.data || [],
        globalUsers: globalUserData.data || [],
        trophyHistory: trophyHistoryData.data || [],
    };
};

// ════════════════════════════════════════════════════════════
//  HISTORICAL IMAGES (Cloudinary)
// ════════════════════════════════════════════════════════════

export const uploadHistoricalImage = async (file, folder = 'historical') => {
    return await uploadToCloudinary(file, folder);
};

export const getHistoricalImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const { data } = supabase.storage.from('historical').getPublicUrl(imagePath);
    return data?.publicUrl || null;
};

export const deleteHistoricalImage = async (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) return;
    await supabase.storage.from('historical').remove([imagePath]);
};

// ════════════════════════════════════════════════════════════
//  HISTORICAL — EVENT MOMENTS
// ════════════════════════════════════════════════════════════

export const getEventMoments = async (eventId) => {
    const { data, error } = await supabase
        .from('historical_event_moments')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const setEventMoments = async (eventId, rows) => {
    const { error: delErr } = await supabase
        .from('historical_event_moments')
        .delete()
        .eq('event_id', eventId);
    if (delErr) throw delErr;
    if (!rows?.length) return;

    const toInsert = rows.map((r, idx) => ({
        event_id: eventId,
        minute: r.minute !== '' && r.minute != null ? parseInt(r.minute, 10) : null,
        moment_date: r.moment_date?.trim() || null,
        title: r.title?.trim() || '',
        description: r.description?.trim() || null,
        icon: r.icon?.trim() || null,
        sort_order: r.sort_order != null ? parseInt(r.sort_order, 10) : idx,
    }));

    const { error } = await supabase
        .from('historical_event_moments')
        .insert(toInsert);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  HISTORICAL — EVENT PROTAGONISTS
// ════════════════════════════════════════════════════════════

export const getEventProtagonists = async (eventId) => {
    const { data, error } = await supabase
        .from('historical_event_protagonists')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const setEventProtagonists = async (eventId, rows) => {
    const { error: delErr } = await supabase
        .from('historical_event_protagonists')
        .delete()
        .eq('event_id', eventId);
    if (delErr) throw delErr;
    if (!rows?.length) return;

    const toInsert = rows.map((r, idx) => {
        // Garantizar constraint: player_id XOR team_id XOR name_override
        const player_id = r.player_id?.trim() || null;
        const team_id = r.team_id?.trim() || null;
        const name_override = r.name_override?.trim() || null;

        return {
            event_id: eventId,
            player_id: player_id || null,
            team_id: team_id || null,
            name_override: name_override || null,
            role_label: r.role_label?.trim() || null,
            icon: r.icon?.trim() || null,
            sort_order: r.sort_order != null ? parseInt(r.sort_order, 10) : idx,
        };
        // Descartar filas donde ningún sujeto esté definido (violarían el constraint)
    }).filter(r => r.player_id || r.team_id || r.name_override);

    if (!toInsert.length) return;

    const { error } = await supabase
        .from('historical_event_protagonists')
        .insert(toInsert);
    if (error) throw error;
};