// src/features/admin/hooks/useAdminMatches.js
import { useState } from 'react';
import {
  insertMatch,
  updateMatchResult,
  getMatchWithPredictions,
  deleteMatch,
  getUserStats,
  updateUserStats,
  updatePredictionPoints,
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

      // 2. Obtener partido con todas sus predicciones
      const match = await getMatchWithPredictions(matchId);
      console.log(`📊 ${match.predictions.length} predicciones a procesar`);

      // 3. Calcular y distribuir puntos
      const resultDiff = Math.sign(homeScore - awayScore);
      let exactPredictions = 0;
      let correctResults = 0;
      let correctAdvancing = 0;

      for (const prediction of match.predictions) {
        const predDiff = Math.sign(prediction.home_score - prediction.away_score);
        let pointsEarned = 0;
        let advancingPoints = 0;

        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
          exactPredictions++;
          await awardPackToUser(prediction.user_id);
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

        // Actualizar puntos de la predicción
        await updatePredictionPoints(prediction.id, pointsEarned, advancingPoints);

        // Obtener stats actuales del usuario
        const userData = await getUserStats(prediction.user_id);
        if (!userData) continue;

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
          points: (userData.points || 0) + totalPoints,
          predictions: (userData.predictions || 0) + 1,
          correct: (userData.correct || 0) + (totalPoints > 0 ? 1 : 0),
          current_streak: newCurrentStreak,
          best_streak: newBestStreak,
          monthly_points: (userData.monthly_points || 0) + totalPoints,
          monthly_predictions: (userData.monthly_predictions || 0) + 1,
          monthly_correct: (userData.monthly_correct || 0) + (totalPoints > 0 ? 1 : 0),
        });
      }

      // 4. Recargar datos
      await loadData();

      // 5. Toast con resumen
      let message = `⚽ Partido finalizado: ${homeScore}-${awayScore}\n`;
      message += `📊 ${match.predictions.length} predicciones procesadas\n`;
      message += `✅ ${exactPredictions} exactos, ${correctResults} acertaron ganador`;
      if (match.is_knockout) message += `\n⚡ ${correctAdvancing} acertaron equipo que pasa`;

      toast.success(message, 5000);

      return {
        success: true,
        data: {
          predictions_processed: match.predictions.length,
          exact: exactPredictions,
          correct: correctResults,
          advancing: correctAdvancing,
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