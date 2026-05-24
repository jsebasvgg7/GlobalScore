// src/features/admin/hooks/useAdminCrowns.js
import {
  awardMonthlyCrown,
  resetMonthlyStats,
} from '../services/admin.service';

export const useAdminCrowns = (loadData, toast) => {

  const handleAwardCrown = async (winnerId, monthLabel, currentUserId) => {
    try {
      const data = await awardMonthlyCrown(winnerId, monthLabel, currentUserId);
      await loadData();
      toast.success(
        `👑 Corona otorgada exitosamente a ${data.winner_name} para ${monthLabel}`,
        4000
      );
      return { success: true, data };
    } catch (err) {
      console.error('Error awarding crown:', err);
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

    try {
      const data = await resetMonthlyStats();
      await loadData();
      toast.success(
        `🔄 Estadísticas mensuales reseteadas. ${data?.users_reset || 0} usuarios actualizados.`,
        4000
      );
      return { success: true, data };
    } catch (err) {
      console.error('Error resetting monthly stats:', err);
      const errorMessage = err.message || err.hint || 'Error desconocido';
      toast.error(`❌ Error al resetear estadísticas: ${errorMessage}`);
      throw err;
    }
  };

  return {
    handleAwardCrown,
    handleResetMonthlyStats,
  };
};