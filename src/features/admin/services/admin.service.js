import { supabase } from '@/shared/services/supabase/client';
import { uploadToCloudinary } from '@/shared/services/cloudinary/upload.service';

// ════════════════════════════════════════════════════════════
//  MATCHES
// ════════════════════════════════════════════════════════════

/**
 * Inserta un partido nuevo en la tabla matches.
 * @param {Object} match - Datos del partido a insertar.
 */
export const insertMatch = async (match) => {
    const { error } = await supabase.from('matches').insert(match);
    if (error) throw error;
};

/**
 * Actualiza el resultado de un partido y lo marca como finalizado.
 * @param {string} matchId
 * @param {Object} updateData - { result_home, result_away, status, advancing_team? }
 */
export const updateMatchResult = async (matchId, updateData) => {
    const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);
    if (error) throw error;
};

/**
 * Obtiene un partido con todas sus predicciones.
 * @param {string} matchId
 * @returns {Object} Partido con sus predicciones.
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
 * Elimina las predicciones de un partido y luego el partido.
 * @param {string} matchId
 */
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

/**
 * Actualiza los puntos obtenidos en una predicción.
 * @param {string} predictionId
 * @param {number} pointsEarned
 * @param {number} advancingPoints
 */
export const updatePredictionPoints = async (predictionId, pointsEarned, advancingPoints) => {
    const { error } = await supabase
        .from('predictions')
        .update({ points_earned: pointsEarned, advancing_points: advancingPoints })
        .eq('id', predictionId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  USERS
// ════════════════════════════════════════════════════════════

/**
 * Obtiene las estadísticas actuales de un usuario.
 * @param {string} userId
 * @returns {Object} Datos del usuario.
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
 * Actualiza las estadísticas globales y mensuales de un usuario.
 * @param {string} userId
 * @param {Object} stats - Campos a actualizar.
 */
export const updateUserStats = async (userId, stats) => {
    const { error } = await supabase
        .from('users')
        .update(stats)
        .eq('id', userId);
    if (error) throw error;
};

/**
 * Quita el banner equipado de todos los usuarios que tenían esa URL.
 * @param {string} imageUrl
 */
export const clearEquippedBanner = async (imageUrl) => {
    const { error } = await supabase
        .from('users')
        .update({ equipped_banner_url: null })
        .eq('equipped_banner_url', imageUrl);
    if (error) throw error;
};

/**
 * Obtiene todos los usuarios ordenados por nombre.
 * @returns {Array} Lista de usuarios.
 */
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

/**
 * Inserta una nueva liga.
 * @param {Object} league
 */
export const insertLeague = async (league) => {
    const { error } = await supabase.from('leagues').insert(league);
    if (error) throw error;
};

/**
 * Finaliza una liga actualizando su estado y resultados.
 * @param {string} leagueId
 * @param {Object} results
 */
export const finishLeague = async (leagueId, results) => {
    const { error } = await supabase
        .from('leagues')
        .update({ status: 'finished', ...results })
        .eq('id', leagueId);
    if (error) throw error;
};

/**
 * Elimina una liga.
 * @param {string} leagueId
 */
export const deleteLeague = async (leagueId) => {
    const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  AWARDS
// ════════════════════════════════════════════════════════════

/**
 * Inserta un nuevo premio.
 * @param {Object} award
 */
export const insertAward = async (award) => {
    const { error } = await supabase.from('awards').insert(award);
    if (error) throw error;
};

/**
 * Finaliza un premio asignando el ganador.
 * @param {string} awardId
 * @param {string} winner
 */
export const finishAward = async (awardId, winner) => {
    const { error } = await supabase
        .from('awards')
        .update({ status: 'finished', winner })
        .eq('id', awardId);
    if (error) throw error;
};

/**
 * Elimina un premio.
 * @param {string} awardId
 */
export const deleteAward = async (awardId) => {
    const { error } = await supabase.from('awards').delete().eq('id', awardId);
    if (error) throw error;
};

// ════════════════════════════════════════════════════════════
//  ACHIEVEMENTS
// ════════════════════════════════════════════════════════════

/**
 * Guarda (crea o actualiza) un logro.
 * @param {Object} achievement
 */
export const upsertAchievement = async (achievement) => {
    const { error } = await supabase
        .from('available_achievements')
        .upsert(achievement, { onConflict: 'id' });
    if (error) throw error;
};

/**
 * Elimina un logro por su id.
 * @param {string} achievementId
 */
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

/**
 * Guarda (crea o actualiza) un título.
 * @param {Object} title
 */
export const upsertTitle = async (title) => {
    const { error } = await supabase
        .from('available_titles')
        .upsert(title, { onConflict: 'id' });
    if (error) throw error;
};

/**
 * Elimina un título por su id.
 * @param {string} titleId
 */
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

/**
 * Sube una imagen al bucket "banners" de Supabase Storage.
 * @param {File} file
 * @returns {string} URL pública de la imagen.
 */
export const uploadBannerImage = async (file) => {
    // Verificar sesión activa
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

/**
 * Inserta un banner en la tabla available_banners.
 * @param {{ name: string, description?: string, image_url: string }} bannerData
 */
export const insertBanner = async (bannerData) => {
    const { error } = await supabase.from('available_banners').insert({
        name: bannerData.name,
        description: bannerData.description || '',
        image_url: bannerData.image_url,
    });
    if (error) throw error;
};

/**
 * Elimina un banner de la tabla y, si es posible, del storage.
 * También revoca asignaciones de usuario.
 * @param {string} bannerId
 * @param {string} imageUrl
 */
export const deleteBanner = async (bannerId, imageUrl) => {
    // Quitar banner equipado de los usuarios que lo tenían
    await clearEquippedBanner(imageUrl);

    // Eliminar asignaciones de user_banners
    const { error: ubError } = await supabase
        .from('user_banners')
        .delete()
        .eq('banner_id', bannerId);
    if (ubError) throw ubError;

    // Eliminar de la tabla
    const { error } = await supabase
        .from('available_banners')
        .delete()
        .eq('id', bannerId);
    if (error) throw error;

    // Intentar eliminar del storage (no crítico si falla)
    try {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('banners').remove([fileName]);
    } catch {
        console.warn('No se pudo eliminar la imagen del storage:', imageUrl);
    }
};

/**
 * Asigna un banner a un usuario en user_banners.
 * @param {string} userId
 * @param {string} bannerId
 */
export const assignBannerToUser = async (userId, bannerId) => {
    const { error } = await supabase
        .from('user_banners')
        .insert({ user_id: userId, banner_id: bannerId });
    if (error) throw error;
};

/**
 * Revoca un banner de un usuario.
 * @param {string} userId
 * @param {string} bannerId
 * @param {string} imageUrl - Para limpiar equipped_banner_url si corresponde.
 */
export const revokeBannerFromUser = async (userId, bannerId, imageUrl) => {
    const { error } = await supabase
        .from('user_banners')
        .delete()
        .eq('user_id', userId)
        .eq('banner_id', bannerId);
    if (error) throw error;

    // Si el usuario tenía ese banner equipado, limpiarlo
    await supabase
        .from('users')
        .update({ equipped_banner_url: null })
        .eq('id', userId)
        .eq('equipped_banner_url', imageUrl);
};

/**
 * Obtiene los banners asignados a un usuario.
 * @param {string} userId
 * @returns {Array} Banners del usuario.
 */
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

/**
 * Llama al RPC de Supabase para otorgar la corona mensual.
 * @param {string} winnerId
 * @param {string} monthLabel - Formato "YYYY-MM"
 * @param {string} adminId
 * @returns {Object} Datos del resultado de la función.
 */
export const awardMonthlyCrown = async (winnerId, monthLabel, adminId) => {
    const { data, error } = await supabase.rpc('award_monthly_championship', {
        winner_user_id: winnerId,
        month_label: monthLabel,
        awarded_by_user_id: adminId,
    });
    if (error) throw error;
    return data;
};

/**
 * Llama al RPC de Supabase para resetear las estadísticas mensuales.
 * @returns {Object} Resultado con users_reset.
 */
export const resetMonthlyStats = async () => {
    const { data, error } = await supabase.rpc('reset_all_monthly_stats');
    if (error) throw error;
    if (data && !data.success) {
        throw new Error(data.error || 'Error desconocido en reset');
    }
    return data;
};

// ════════════════════════════════════════════════════════════
//  LOAD ALL ADMIN DATA
// ════════════════════════════════════════════════════════════

/**
 * Carga todos los datos necesarios para el panel de administración
 * en paralelo usando Promise.all.
 * @returns {Object} Todos los datos del admin.
 */
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
    };
};

// ════════════════════════════════════════════════════════════
//  HISTORICAL IMAGES (Cloudinary)
// ════════════════════════════════════════════════════════════

/**
 * Sube una imagen histórica a Cloudinary y devuelve la URL pública.
 * Las imágenes se guardan en globalscore/<folder>.
 * @param {File} file
 * @param {'players'|'teams'|'competitions'|'events'} folder
 * @returns {Promise<string>} URL pública con transformaciones automáticas.
 */
export const uploadHistoricalImage = async (file, folder = 'historical') => {
    return await uploadToCloudinary(file, folder);
};

/**
 * Resuelve la URL pública de una imagen histórica.
 * - Si ya es URL de Cloudinary (http...), la retorna directo.
 * - Si es un path de Supabase Storage (legacy), obtiene la URL pública.
 * @param {string|null} imagePath
 * @returns {string|null}
 */
export const getHistoricalImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Ya es URL completa de Cloudinary
    if (imagePath.startsWith('http')) return imagePath;

    // Compatibilidad con imágenes antiguas en Supabase Storage
    const { data } = supabase.storage.from('historical').getPublicUrl(imagePath);
    return data?.publicUrl || null;
};

/**
 * Elimina una imagen del bucket histórico de Supabase Storage (solo legacy).
 * Las imágenes de Cloudinary no se pueden eliminar desde el cliente.
 * @param {string|null} imagePath - Solo paths relativos (no URLs http).
 */
export const deleteHistoricalImage = async (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) return;
    await supabase.storage.from('historical').remove([imagePath]);
};