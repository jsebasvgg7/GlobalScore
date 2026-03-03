// src/hooks/adminHooks/useAdminCrowns.js
import { supabase } from '../../utils/supabaseClient';

export const useAdminCrowns = (loadData, toast) => {
  const handleAwardCrown = async (winnerId, monthLabel, currentUserId) => {
    try {
      // Llamar a la función de Supabase para otorgar la corona
      const { data, error } = await supabase.rpc('award_monthly_championship', {
        winner_user_id: winnerId,
        month_label: monthLabel,
        awarded_by_user_id: currentUserId
      });

      if (error) throw error;

      await loadData();
      toast.success(
        `👑 Corona otorgada exitosamente a ${data.winner_name} para ${monthLabel}`,
        4000
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error awarding crown:', err);
      
      // Mensajes de error específicos
      if (err.message.includes('Ya existe un campeón')) {
        toast.error('⚠️ Ya se otorgó una corona para este mes');
      } else if (err.message.includes('Usuario no encontrado')) {
        toast.error('❌ Usuario no encontrado');
      } else {
        toast.error('❌ Error al otorgar la corona. Intenta de nuevo.');
      }
      
      throw err;
    }
  };

  const handleResetMonthlyStats = async () => {
    if (!confirm('⚠️ ¿Estás seguro de resetear las estadísticas mensuales de TODOS los usuarios? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('🔄 Reseteando estadísticas mensuales...');
      
      const { data, error } = await supabase.rpc('reset_all_monthly_stats');

      console.log('Respuesta de reset:', { data, error });

      if (error) {
        console.error('Error en RPC:', error);
        throw error;
      }

      // Verificar si la función retornó un error dentro del JSON
      if (data && !data.success) {
        throw new Error(data.error || 'Error desconocido en reset');
      }

      await loadData();
      
      const usersReset = data?.users_reset || 0;
      toast.success(
        `🔄 Estadísticas mensuales reseteadas. ${usersReset} usuarios actualizados.`,
        4000
      );
      
      return { success: true, data };
    } catch (err) {
      console.error('Error resetting monthly stats:', err);
      
      // Mensaje de error más específico
      const errorMessage = err.message || err.hint || 'Error desconocido';
      toast.error(`❌ Error al resetear estadísticas: ${errorMessage}`);
      
      throw err;
    }
  };

  return {
    handleAwardCrown,
    handleResetMonthlyStats
  };
};