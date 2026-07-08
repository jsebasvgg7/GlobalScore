import { useState } from 'react';
import {
  insertMatch,
  updateMatchResult,
  getMatchWithPredictions,
  deleteMatch,
  getUserStats,
  updateUserStats,
  updatePredictionPoints,
  awardBotPoints,
} from '../services/admin.service';
import { awardPackToUser } from '@/features/albums/services/albums.service';

export const useAdminMatches = (loadData, toast) => {
  const [loading, setLoading] = useState(false);

  // ============================================
  // AGREGAR PARTIDO
  // ============================================
  const handleAddMatch = async (match) => {
    try {
      setLoading(true);
      await insertMatch(match);
      await loadData();
      toast.success(
        `✅ Partido ${match.home_team} vs ${match.away_team} agregado${match.is_knockout ? ' (Eliminatoria)' : ''}`,
        4000
      );
      return { success: true };
    } catch (err) {
      console.error('Error adding match:', err);
      toast.error('❌ Error al agregar el partido. Verifica los datos.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FINALIZAR PARTIDO Y ACTUALIZAR ESTADÍSTICAS
  // ============================================
  const handleFinishMatch = async (matchId, homeScore, awayScore, advancingTeam = null) => {
    try {
      setLoading(true);
      console.log(`🎯 Finalizando partido ${matchId}: ${homeScore}-${awayScore}`);

      // 1. Actualizar resultado del partido
      const updateData = {
        result_home: homeScore,
        result_away: awayScore,
        status: 'finished',
      };
      if (advancingTeam) updateData.advancing_team = advancingTeam;

      await updateMatchResult(matchId, updateData);

      // 1.b Ruleta de puntos para los bots de relleno (no bloquea el flujo si falla)
      try {
        await awardBotPoints();
      } catch (botErr) {
        console.error('⚠️ Error al otorgar puntos a los bots:', botErr);
      }

      // 2. Obtener partido con todas sus predicciones
      const match = await getMatchWithPredictions(matchId);
      console.log(`📊 ${match.predictions.length} predicciones a procesar`);

      // 3. Calcular y distribuir puntos
      const resultDiff = Math.sign(homeScore - awayScore);
      let exactPredictions = 0;
      let correctResults = 0;
      let correctAdvancing = 0;
      const failedPredictions = []; // { predictionId, userId, stage, error }

      for (const prediction of match.predictions) {
        // Cada predicción vive en su propio try/catch: si esta falla, las
        // demás del loop se siguen procesando igual. Antes, un solo error
        // (timeout, usuario faltante, etc.) abortaba TODO el resto del
        // partido y dejaba predicciones con result_type null para siempre.
        try {
          const predDiff = Math.sign(prediction.home_score - prediction.away_score);
          let pointsEarned = 0;
          let advancingPoints = 0;
          let isExact = false;

          console.log(`🔍 Comparando: pred(${prediction.home_score}-${prediction.away_score}) vs real(${homeScore}-${awayScore})`);
          if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
            console.log(`✅ EXACTA para usuario ${prediction.user_id}`);
            pointsEarned = 5;
            isExact = true;
            exactPredictions++;
          } else if (resultDiff === predDiff) {
            pointsEarned = 3;
            correctResults++;
          }

          if (match.is_knockout && advancingTeam && pointsEarned > 0) {
            if (prediction.predicted_advancing_team === advancingTeam) {
              advancingPoints = 2;
              correctAdvancing++;
            }
          }

          const totalPoints = pointsEarned + advancingPoints;

          // Actualizar puntos de la predicción — esto es lo mínimo que
          // SIEMPRE debe quedar guardado, pase lo que pase después.
          await updatePredictionPoints(prediction.id, pointsEarned, advancingPoints);

          // Otorgar sobre por predicción exacta. Aislado: si esto falla no
          // debe impedir que los puntos/stats del usuario ya se guarden.
          if (isExact) {
            try {
              await awardPackToUser(prediction.user_id);
              console.log(`📦 Sobre otorgado a ${prediction.user_id}`);
            } catch (packErr) {
              console.error(`⚠️ No se pudo otorgar sobre a ${prediction.user_id}:`, packErr);
            }
          }

          // Obtener stats actuales del usuario
          const userData = await getUserStats(prediction.user_id);
          if (!userData) {
            failedPredictions.push({
              predictionId: prediction.id,
              userId: prediction.user_id,
              stage: 'getUserStats',
              error: 'Usuario no encontrado',
            });
            continue;
          }

          // Calcular rachas
          let newCurrentStreak = userData.current_streak || 0;
          let newBestStreak = userData.best_streak || 0;
          if (totalPoints > 0) {
            newCurrentStreak += 1;
            newBestStreak = Math.max(newBestStreak, newCurrentStreak);
          } else {
            newCurrentStreak = 0;
          }

          // Actualizar usuario con todas las estadísticas
          await updateUserStats(prediction.user_id, {
            // 🌍 Estadísticas globales (histórico completo, nunca se resetea)
            points: (userData.points || 0) + totalPoints,
            predictions: (userData.predictions || 0) + 1,
            correct: (userData.correct || 0) + (totalPoints > 0 ? 1 : 0),
            current_streak: newCurrentStreak,
            best_streak: newBestStreak,
            // 📅 Estadísticas mensuales
            monthly_points: (userData.monthly_points || 0) + totalPoints,
            monthly_predictions: (userData.monthly_predictions || 0) + 1,
            monthly_correct: (userData.monthly_correct || 0) + (totalPoints > 0 ? 1 : 0),
            // 🏆 Estadísticas de temporada (usadas por el ranking global visible)
            season_points: (userData.season_points || 0) + totalPoints,
            season_predictions: (userData.season_predictions || 0) + 1,
            season_correct: (userData.season_correct || 0) + (totalPoints > 0 ? 1 : 0),
          });
        } catch (predErr) {
          // No relanzamos: seguimos con la siguiente predicción del partido.
          console.error(`❌ Error procesando predicción ${prediction.id} (user ${prediction.user_id}):`, predErr);
          failedPredictions.push({
            predictionId: prediction.id,
            userId: prediction.user_id,
            stage: 'unknown',
            error: predErr.message || String(predErr),
          });
        }
      }

      // 4. Recargar datos
      await loadData();

      // 5. Toast con resumen — refleja fallos parciales si los hubo, en vez
      // de reportar éxito total cuando en realidad algunas quedaron sin procesar.
      let message = `⚽ Partido finalizado: ${homeScore}-${awayScore}\n`;
      message += `📊 ${match.predictions.length} predicciones procesadas\n`;
      message += `✅ ${exactPredictions} exactos, ${correctResults} acertaron ganador`;
      if (match.is_knockout) message += `\n⚡ ${correctAdvancing} acertaron equipo que pasa`;

      if (failedPredictions.length > 0) {
        message += `\n⚠️ ${failedPredictions.length} predicciones fallaron y necesitan revisión manual`;
        console.error('⚠️ Predicciones que fallaron:', failedPredictions);
        toast.error(message, 8000);
      } else {
        toast.success(message, 5000);
      }

      return {
        success: failedPredictions.length === 0,
        data: {
          predictions_processed: match.predictions.length,
          exact: exactPredictions,
          correct: correctResults,
          advancing: correctAdvancing,
          failed: failedPredictions,
        },
      };
    } catch (err) {
      console.error('❌ Error al finalizar partido:', err);
      toast.error(`❌ Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ELIMINAR PARTIDO
  // ============================================
  const handleDeleteMatch = async (matchId) => {

    try {
      setLoading(true);
      await deleteMatch(matchId);
      await loadData();
      toast.success('🗑️ Partido eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting match:', err);
      toast.error('❌ Error al eliminar el partido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleAddMatch,
    handleFinishMatch,
    handleDeleteMatch,
  };
};