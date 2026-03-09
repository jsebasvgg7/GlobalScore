import { useState, useCallback, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';

export const useMatches = (currentUser) => {
  const [loading, setLoading] = useState(false);
  const savingRef = useRef(new Set()); // Track de predicciones en proceso

  // ⚡ MODIFICADO: Agregar advancingTeam como parámetro + Sistema Anti-Duplicados
  const makePrediction = useCallback(async (matchId, homeScore, awayScore, advancingTeam, onSuccess, onError) => {
    if (!currentUser) return;

    // Crear key única para esta predicción
    const predictionKey = `${matchId}-${homeScore}-${awayScore}-${advancingTeam || 'none'}`;
    
    // Si ya se está guardando esta misma predicción, ignorar
    if (savingRef.current.has(predictionKey)) {
      console.log('⚠️ Predicción duplicada ignorada para match:', matchId);
      return;
    }

    setLoading(true);
    savingRef.current.add(predictionKey);

    try {
      const predictionData = {
        match_id: matchId,
        user_id: currentUser.id,
        home_score: homeScore,
        away_score: awayScore,
      };

      // ⚡ NUEVO: Solo agregar advancing_team si existe
      if (advancingTeam) {
        predictionData.predicted_advancing_team = advancingTeam;
      }

      const { data: predictionResult, error } = await supabase
        .from("predictions")
        .upsert(predictionData, {
          onConflict: 'match_id,user_id'
        })
        .select();

      if (error) throw error;

      console.log('✅ Predicción guardada:', predictionResult);

      // Recargar lista de partidos
      const { data: matchList } = await supabase
        .from("matches")
        .select("*, predictions(*)");

      onSuccess?.(matchList);
    } catch (err) {
      console.error("❌ Error al guardar predicción:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
      // Remover de tracking después de 500ms para permitir re-intentos
      setTimeout(() => {
        savingRef.current.delete(predictionKey);
      }, 500);
    }
  }, [currentUser]);

  // Agregar nuevo partido
  const addMatch = useCallback(async (match, onSuccess, onError) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("matches").insert(match);
      if (error) throw error;

      const { data } = await supabase.from("matches").select("*, predictions(*)");
      onSuccess?.(data);
    } catch (err) {
      console.error("Error al agregar partido:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ⚡ MODIFICADO: Finalizar partido ahora acepta advancingTeam
  const finishMatch = useCallback(async (matchId, homeScore, awayScore, advancingTeam, onSuccess, onError) => {
    setLoading(true);
    try {
      console.log(`🎯 Finalizando partido ${matchId}: ${homeScore}-${awayScore}`);
      if (advancingTeam) {
        console.log(`⚡ Equipo que avanza: ${advancingTeam}`);
      }

      // 1. Actualizar resultado del partido
      const updateData = { 
        result_home: homeScore, 
        result_away: awayScore, 
        status: "finished" 
      };

      // ⚡ NUEVO: Agregar advancing_team si existe
      if (advancingTeam) {
        updateData.advancing_team = advancingTeam;
      }

      const { error: updateError } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchId);

      if (updateError) throw updateError;

      // 2. Obtener partido con todas sus predicciones
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*, predictions(*)")
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      console.log(`📊 Partido encontrado con ${match.predictions.length} predicciones`);
      console.log(`⚡ Es knockout: ${match.is_knockout}`);

      // 3. Calcular y distribuir puntos
      const resultDiff = Math.sign(homeScore - awayScore);
      let exactPredictions = 0;
      let correctResults = 0;
      let correctAdvancing = 0;

      for (const prediction of match.predictions) {
        const predDiff = Math.sign(prediction.home_score - prediction.away_score);
        let pointsEarned = 0;
        let advancingPoints = 0;

        // Resultado exacto: 5 puntos
        if (prediction.home_score === homeScore && prediction.away_score === awayScore) {
          pointsEarned = 5;
          exactPredictions++;
          console.log(`✅ Usuario ${prediction.user_id}: Resultado exacto (+5 pts)`);
        } 
        // Resultado correcto (ganador/empate): 3 puntos
        else if (resultDiff === predDiff) {
          pointsEarned = 3;
          correctResults++;
          console.log(`✅ Usuario ${prediction.user_id}: Acertó resultado (+3 pts)`);
        } 
        // Incorrecto: 0 puntos
        else {
          console.log(`❌ Usuario ${prediction.user_id}: No acertó (0 pts)`);
        }

        // ⚡ NUEVO: Puntos por acertar advancing team (solo si ya ganó puntos base)
        if (match.is_knockout && advancingTeam && pointsEarned > 0) {
          if (prediction.predicted_advancing_team === advancingTeam) {
            advancingPoints = 2;
            correctAdvancing++;
            console.log(`⚡ Usuario ${prediction.user_id}: Acertó equipo que pasa (+2 pts)`);
          }
        }

        const totalPoints = pointsEarned + advancingPoints;

        // ⚡ MODIFICADO: Actualizar predicción con advancing_points separado
        await supabase
          .from("predictions")
          .update({ 
            points_earned: pointsEarned,
            advancing_points: advancingPoints
          })
          .eq("id", prediction.id);

        // Obtener datos actuales del usuario
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("points, predictions, correct, best_streak, current_streak, monthly_points, monthly_predictions, monthly_correct")
          .eq("id", prediction.user_id)
          .single();

        if (userError) {
          console.error(`❌ Error al obtener usuario ${prediction.user_id}:`, userError);
          continue;
        }

        // ========== ESTADÍSTICAS GLOBALES ==========
        const newPoints = (userData.points || 0) + totalPoints;
        const newPredictions = (userData.predictions || 0) + 1;
        const newCorrect = (userData.correct || 0) + (totalPoints > 0 ? 1 : 0);
        
        // ========== ESTADÍSTICAS MENSUALES ==========
        const newMonthlyPoints = (userData.monthly_points || 0) + totalPoints;
        const newMonthlyPredictions = (userData.monthly_predictions || 0) + 1;
        const newMonthlyCorrect = (userData.monthly_correct || 0) + (totalPoints > 0 ? 1 : 0);
        
        // ========== RACHAS ==========
        let newCurrentStreak = userData.current_streak || 0;
        let newBestStreak = userData.best_streak || 0;
        
        if (totalPoints > 0) {
          newCurrentStreak = newCurrentStreak + 1;
          newBestStreak = Math.max(newBestStreak, newCurrentStreak);
        } else {
          newCurrentStreak = 0;
        }

        // ✅ ACTUALIZAR USUARIO CON TODAS LAS ESTADÍSTICAS
        const { error: updateUserError } = await supabase
          .from("users")
          .update({
            // 🌍 Estadísticas globales
            points: newPoints,
            predictions: newPredictions,
            correct: newCorrect,
            current_streak: newCurrentStreak,
            best_streak: newBestStreak,
            // 📅 Estadísticas mensuales
            monthly_points: newMonthlyPoints,
            monthly_predictions: newMonthlyPredictions,
            monthly_correct: newMonthlyCorrect
          })
          .eq("id", prediction.user_id);

        if (updateUserError) {
          console.error(`❌ Error actualizando usuario ${prediction.user_id}:`, updateUserError);
        } else {
          console.log(`✅ Usuario ${prediction.user_id} actualizado exitosamente:`);
          console.log(`   🌍 Global: ${newPoints} pts, ${newCorrect}/${newPredictions} correctas, racha: ${newCurrentStreak}`);
          console.log(`   📅 Mensual: ${newMonthlyPoints} pts, ${newMonthlyCorrect}/${newMonthlyPredictions} correctas`);
          if (advancingPoints > 0) {
            console.log(`   ⚡ Advancing: +${advancingPoints} pts`);
          }
        }
      }

      // 4. Recargar datos actualizados
      const { data: updatedUsers } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      const { data: updatedMatches } = await supabase
        .from("matches")
        .select("*, predictions(*)");

      console.log("✅ Partido finalizado exitosamente");
      console.log(`📈 Resultados: ${exactPredictions} exactos, ${correctResults} resultados correctos`);
      if (match.is_knockout) {
        console.log(`⚡ Advancing: ${correctAdvancing} usuarios acertaron quién pasa`);
      }
      console.log(`🔄 Rankings actualizados: Global + Mensual`);

      onSuccess?.({
        users: updatedUsers || [],
        matches: updatedMatches || [],
        stats: { exactPredictions, correctResults, correctAdvancing }
      });

    } catch (err) {
      console.error("❌ Error al finalizar partido:", err);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    makePrediction,
    addMatch,
    finishMatch
  };
};