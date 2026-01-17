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
      toast.success(`✅ Partido ${match.home_team} vs ${match.away_team} agregado`, 4000);
      
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
  const handleFinishMatch = async (matchId, homeScore, awayScore) => {
    try {
      setLoading(true);
      
      console.log(`🎯 Finalizando partido ${matchId}: ${homeScore}-${awayScore}`);

      // Llamar a la función RPC que hace todo el trabajo
      const { data, error } = await supabase.rpc('finish_match_and_update_stats', {
        p_match_id: matchId,
        p_result_home: homeScore,
        p_result_away: awayScore
      });

      if (error) throw error;

      console.log('✅ Resultado de la operación:', data);
      console.log(`📊 Predicciones procesadas: ${data.predictions_processed}`);
      console.log(`👥 Usuarios actualizados: ${data.users_updated}`);

      // Recargar todos los datos
      await loadData();

      // Mostrar toast de éxito con detalles
      toast.success(
        `⚽ Partido finalizado: ${homeScore}-${awayScore}\n` +
        `📊 ${data.predictions_processed} predicciones procesadas\n` +
        `👥 ${data.users_updated} usuarios actualizados`,
        5000
      );

      return { success: true, data };

    } catch (err) {
      console.error('❌ Error al finalizar partido:', err);
      
      // Mensajes de error específicos
      if (err.message.includes('function')) {
        toast.error(
          '❌ Error: La función de base de datos no está disponible.\n' +
          'Por favor, ejecuta el script SQL para crear las funciones necesarias.',
          6000
        );
      } else {
        toast.error(`❌ Error: ${err.message}`);
      }
      
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
};