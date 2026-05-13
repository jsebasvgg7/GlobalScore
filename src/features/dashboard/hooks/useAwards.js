import { useState, useCallback } from 'react';
import {
  upsertAwardPrediction,
  fetchAwardsWithPredictions,
  insertAward as insertAwardService,
  updateAwardResult,
  getAwardWithPredictions,
  updateAwardPredictionPoints,
  getUserStatsForLeague,
  updateUserStats,
  fetchAllUsersRanked,
} from '../services/dashboard.service';

export const useAwards = (currentUser) => {
  const [loading, setLoading] = useState(false);

  // Hacer predicción de premio
  const makeAwardPrediction = useCallback(async (awardId, predictedWinner, onSuccess, onError) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await upsertAwardPrediction({
        award_id: awardId,
        user_id: currentUser.id,
        predicted_winner: predictedWinner,
      });

      const awardList = await fetchAwardsWithPredictions();
      onSuccess?.(awardList);
    } catch (err) {
      console.error("Error al guardar predicción de premio:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Agregar nuevo premio
  const addAward = useCallback(async (award, onSuccess, onError) => {
    setLoading(true);
    try {
      await insertAwardService(award);
      const data = await fetchAwardsWithPredictions();
      onSuccess?.(data);
    } catch (err) {
      console.error("Error al agregar premio:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar premio y calcular puntos
  const finishAward = useCallback(async (awardId, winner, onSuccess, onError) => {
    setLoading(true);
    try {
      console.log(`🏅 Finalizando premio ${awardId} - ganador: ${winner}`);

      // 1. Actualizar premio
      await updateAwardResult(awardId, { status: "finished", winner });

      // 2. Obtener premio con predicciones
      const award = await getAwardWithPredictions(awardId);

      // 3. Repartir puntos (10 puntos por acierto)
      for (const prediction of award.award_predictions) {
        let pointsEarned = 0;

        if (prediction.predicted_winner?.toLowerCase() === winner.toLowerCase()) {
          pointsEarned = 10;
        }

        // Actualizar points_earned en predicción
        await updateAwardPredictionPoints(prediction.id, pointsEarned);

        // Actualizar puntos del usuario
        const userData = await getUserStatsForLeague(prediction.user_id);

        if (userData) {
          // Estadísticas globales
          const newPoints = (userData.points || 0) + pointsEarned;
          const newPredictions = (userData.predictions || 0) + 1;
          const newCorrect = (userData.correct || 0) + (pointsEarned > 0 ? 1 : 0);

          // Estadísticas semanales ⭐
          const newWeeklyPoints = (userData.weekly_points || 0) + pointsEarned;
          const newWeeklyPredictions = (userData.weekly_predictions || 0) + 1;
          const newWeeklyCorrect = (userData.weekly_correct || 0) + (pointsEarned > 0 ? 1 : 0);

          await updateUserStats(prediction.user_id, {
            // Globales
            points: newPoints,
            predictions: newPredictions,
            correct: newCorrect,
            // Semanales ⭐
            weekly_points: newWeeklyPoints,
            weekly_predictions: newWeeklyPredictions,
            weekly_correct: newWeeklyCorrect
          });

          console.log(`✅ Usuario ${prediction.user_id}:`);
          console.log(`   Global: ${newPoints} pts, ${newCorrect}/${newPredictions}`);
          console.log(`   Semanal: ${newWeeklyPoints} pts, ${newWeeklyCorrect}/${newWeeklyPredictions}`);
        }
      }

      // 4. Recargar datos
      const updatedUsers = await fetchAllUsersRanked();
      const updatedAwards = await fetchAwardsWithPredictions();

      onSuccess?.({
        users: updatedUsers || [],
        awards: updatedAwards || []
      });

    } catch (err) {
      console.error("Error al finalizar premio:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    makeAwardPrediction,
    addAward,
    finishAward
  };
};