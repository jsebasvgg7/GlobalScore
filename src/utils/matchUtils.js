// src/utils/matchUtils.js
import { supabase } from './supabaseClient';

/**
 * Calcula los puntos de una predicción
 * @param {Object} prediction - Predicción del usuario
 * @param {number} resultHome - Resultado real equipo local
 * @param {number} resultAway - Resultado real equipo visitante
 * @returns {Object} { points, isCorrect }
 */
export function calculatePoints(prediction, resultHome, resultAway) {
  const predHome = parseInt(prediction.home_score);
  const predAway = parseInt(prediction.away_score);
  
  // Resultado exacto: 5 puntos
  if (predHome === resultHome && predAway === resultAway) {
    return { points: 5, isCorrect: true };
  }
  
  // Solo el ganador correcto: 3 puntos
  const predDiff = Math.sign(predHome - predAway);
  const resultDiff = Math.sign(resultHome - resultAway);
  
  if (predDiff === resultDiff) {
    return { points: 3, isCorrect: true };
  }
  
  // Incorrecto: 0 puntos
  return { points: 0, isCorrect: false };
}

/**
 * Finaliza un partido y actualiza estadísticas de usuarios
 * @param {string} matchId - ID del partido
 * @param {number} homeScore - Marcador equipo local
 * @param {number} awayScore - Marcador equipo visitante
 */
export async function finishMatch(matchId, homeScore, awayScore) {
  try {
    // 1. Obtener todas las predicciones del partido
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_id', matchId);

    if (predError) throw predError;

    console.log(`📊 Procesando ${predictions?.length || 0} predicciones...`);

    // 2. Actualizar estadísticas de cada usuario
    for (const prediction of predictions || []) {
      const { points, isCorrect } = calculatePoints(prediction, homeScore, awayScore);
      
      console.log(`Usuario ${prediction.user_id}: +${points} pts, correcto: ${isCorrect}`);

      // 3. Usar la función SQL para actualizar stats globales Y semanales
      const { error: updateError } = await supabase.rpc('update_user_stats', {
        user_id: prediction.user_id,
        points_to_add: points,
        is_correct: isCorrect
      });

      if (updateError) {
        console.error(`Error actualizando usuario ${prediction.user_id}:`, updateError);
        throw updateError;
      }
    }

    // 4. Marcar el partido como finalizado
    const { error: matchError } = await supabase
      .from('matches')
      .update({ 
        result_home: homeScore, 
        result_away: awayScore, 
        status: 'finished' 
      })
      .eq('id', matchId);

    if (matchError) throw matchError;

    console.log('✅ Partido finalizado correctamente');
    return { success: true };

  } catch (error) {
    console.error('❌ Error en finishMatch:', error);
    throw error;
  }
}