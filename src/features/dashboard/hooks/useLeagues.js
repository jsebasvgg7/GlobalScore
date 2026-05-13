import { useState, useCallback } from 'react';
import {
  upsertLeaguePrediction,
  fetchLeaguesWithPredictions,
  insertLeague as insertLeagueService,
  updateLeagueResult,
  getLeagueWithPredictions,
  updateLeaguePredictionPoints,
  getUserStatsForLeague,
  updateUserStats,
  fetchAllUsersRanked,
} from '../services/dashboard.service';

export const useLeagues = (currentUser) => {
  const [loading, setLoading] = useState(false);

  // Hacer predicción de liga
  const makeLeaguePrediction = useCallback(async (leagueId, champion, topScorer, topAssist, mvp, onSuccess, onError) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await upsertLeaguePrediction({
        league_id: leagueId,
        user_id: currentUser.id,
        predicted_champion: champion,
        predicted_top_scorer: topScorer,
        predicted_top_assist: topAssist,
        predicted_mvp: mvp,
      });

      const leagueList = await fetchLeaguesWithPredictions();
      onSuccess?.(leagueList);
    } catch (err) {
      console.error("Error al guardar predicción de liga:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Agregar nueva liga
  const addLeague = useCallback(async (league, onSuccess, onError) => {
    setLoading(true);
    try {
      await insertLeagueService(league);
      const data = await fetchLeaguesWithPredictions();
      onSuccess?.(data);
    } catch (err) {
      console.error("Error al agregar liga:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar liga y calcular puntos
  const finishLeague = useCallback(async (leagueId, results, onSuccess, onError) => {
    setLoading(true);
    try {
      console.log(`🏆 Finalizando liga ${leagueId}`);

      // 1. Actualizar liga con resultados
      await updateLeagueResult(leagueId, {
        status: "finished",
        champion: results.champion,
        top_scorer: results.top_scorer,
        top_scorer_goals: results.top_scorer_goals,
        top_assist: results.top_assist,
        top_assist_count: results.top_assist_count,
        mvp_player: results.mvp_player
      });

      // 2. Obtener liga con predicciones
      const league = await getLeagueWithPredictions(leagueId);
      console.log(`📊 Liga encontrada con ${league.league_predictions.length} predicciones`);

      // 3. Calcular puntos (5 por cada predicción correcta)
      for (const prediction of league.league_predictions) {
        let pointsEarned = 0;
        let correctPredictions = 0;

        if (prediction.predicted_champion?.toLowerCase() === results.champion.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }
        if (prediction.predicted_top_scorer?.toLowerCase() === results.top_scorer.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }
        if (prediction.predicted_top_assist?.toLowerCase() === results.top_assist.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }
        if (prediction.predicted_mvp?.toLowerCase() === results.mvp_player.toLowerCase()) {
          pointsEarned += 5;
          correctPredictions++;
        }

        console.log(`Usuario ${prediction.user_id}: ${pointsEarned} puntos (${correctPredictions}/4 aciertos)`);

        // Actualizar points_earned en predicción
        await updateLeaguePredictionPoints(prediction.id, pointsEarned);

        // Actualizar puntos del usuario
        const userData = await getUserStatsForLeague(prediction.user_id);

        if (userData) {
          // Estadísticas globales
          const newPoints = (userData.points || 0) + pointsEarned;
          const newPredictions = (userData.predictions || 0) + 1;
          const newCorrect = (userData.correct || 0) + correctPredictions;

          // Estadísticas semanales ⭐
          const newWeeklyPoints = (userData.weekly_points || 0) + pointsEarned;
          const newWeeklyPredictions = (userData.weekly_predictions || 0) + 1;
          const newWeeklyCorrect = (userData.weekly_correct || 0) + correctPredictions;

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
          console.log(`   Global: ${newPoints} pts, ${newCorrect} aciertos`);
          console.log(`   Semanal: ${newWeeklyPoints} pts, ${newWeeklyCorrect} aciertos`);
        }
      }

      // 4. Recargar datos
      const updatedUsers = await fetchAllUsersRanked();
      const updatedLeagues = await fetchLeaguesWithPredictions();

      onSuccess?.({
        users: updatedUsers || [],
        leagues: updatedLeagues || []
      });

    } catch (err) {
      console.error("Error al finalizar liga:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    makeLeaguePrediction,
    addLeague,
    finishLeague
  };
};