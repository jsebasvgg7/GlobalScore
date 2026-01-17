// src/hooks/adminHooks/useAdminCrowns.js
import { supabase } from '../../utils/supabaseClient';

export const useAdminCrowns = (loadData, toast) => {
  
  // ============================================
  // OTORGAR CORONA MENSUAL
  // ============================================
  const handleAwardCrown = async (winnerId, monthLabel, currentUserId) => {
    try {
      console.log('👑 Otorgando corona...', { winnerId, monthLabel, currentUserId });
      
      // Llamar a la función RPC
      const { data, error } = await supabase.rpc('award_monthly_championship', {
        winner_user_id: winnerId,
        month_label: monthLabel,
        awarded_by_user_id: currentUserId
      });

      if (error) throw error;

      console.log('✅ Corona otorgada:', data);

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
      } else if (err.message.includes('function')) {
        toast.error(
          '❌ Error: La función de base de datos no está disponible.\n' +
          'Por favor, ejecuta el script SQL para crear las funciones necesarias.'
        );
      } else {
        toast.error(`❌ Error al otorgar la corona: ${err.message}`);
      }
      
      throw err;
    }
  };

  // ============================================
  // RESETEAR ESTADÍSTICAS MENSUALES
  // ============================================
  const handleResetMonthlyStats = async () => {
    const confirmed = confirm(
      '⚠️ ¿Estás seguro de resetear las estadísticas mensuales de TODOS los usuarios?\n\n' +
      'Esta acción:\n' +
      '• Pondrá en 0 los puntos mensuales\n' +
      '• Reiniciará las predicciones mensuales\n' +
      '• Reiniciará los aciertos mensuales\n\n' +
      'Esta acción NO se puede deshacer.'
    );
    
    if (!confirmed) return;

    try {
      console.log('🔄 Reseteando estadísticas mensuales...');
      
      const { data, error } = await supabase.rpc('reset_all_monthly_stats');

      if (error) throw error;

      console.log('✅ Estadísticas reseteadas:', data);

      await loadData();
      
      toast.success(
        `🔄 Estadísticas mensuales reseteadas\n` +
        `👥 ${data.users_reset} usuarios actualizados`,
        4000
      );
      
      return { success: true, data };
      
    } catch (err) {
      console.error('Error resetting monthly stats:', err);
      
      if (err.message.includes('function')) {
        toast.error(
          '❌ Error: La función de base de datos no está disponible.\n' +
          'Por favor, ejecuta el script SQL para crear las funciones necesarias.'
        );
      } else {
        toast.error(`❌ Error al resetear estadísticas: ${err.message}`);
      }
      
      throw err;
    }
  };

  return {
    handleAwardCrown,
    handleResetMonthlyStats
  };
};