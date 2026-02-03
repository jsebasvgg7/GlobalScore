// src/hooks/adminHooks/useAdminMatches.js
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export const useAdminMatches = (currentUser, loadData, toast) => {
  const [loading, setLoading] = useState(false);

  // ============================================
  // AGREGAR NUEVO PARTIDO
  // ============================================
  const handleAddMatch = async (match) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.from('matches').insert(match);
      if (error) throw error;
      
      await loadData();
      toast.success(`✅ Partido ${match.home_team} vs ${match.away_team} agregado${match.is_knockout ? ' (Eliminatoria)' : ''}`, 4000);
      
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
  // ⚡ MODIFICADO: Ahora acepta advancingTeam
  // ============================================
  const handleFinishMatch = async (matchId, homeScore, awayScore, advancingTeam = null) => {
    try {
      setLoading(true);
      
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
          console.log(`   🌍 Global: ${newPoints} pts (${pointsEarned} base + ${advancingPoints} advancing)`);
          console.log(`   📅 Mensual: ${newMonthlyPoints} pts`);
        }
      }

      // 4. Recargar datos actualizados
      await loadData();

      // 5. Toast con información detallada
      let message = `⚽ Partido finalizado: ${homeScore}-${awayScore}\n`;
      message += `📊 ${match.predictions.length} predicciones procesadas\n`;
      message += `✅ ${exactPredictions} exactos, ${correctResults} acertaron ganador`;
      
      if (match.is_knockout) {
        message += `\n⚡ ${correctAdvancing} acertaron equipo que pasa`;
      }

      toast.success(message, 5000);

      return { 
        success: true, 
        data: {
          predictions_processed: match.predictions.length,
          exact: exactPredictions,
          correct: correctResults,
          advancing: correctAdvancing
        }
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
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;
    
    try {
      setLoading(true);
      
      // Primero eliminar predicciones asociadas
      const { error: predError } = await supabase
        .from('predictions')
        .delete()
        .eq('match_id', matchId);
      
      if (predError) throw predError;
      
      // Luego eliminar el partido
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);
      
      if (error) throw error;
      
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
    handleDeleteMatch
  };
}