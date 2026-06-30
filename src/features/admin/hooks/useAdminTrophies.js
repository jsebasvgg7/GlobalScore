// src/features/admin/hooks/useAdminTrophies.js
import {
  awardGlobalTrophy,
  resetGlobalStats,
} from '../services/admin.service';

export const useAdminTrophies = (loadData, toast) => {

  const handleAwardTrophy = async (winnerId, editionLabel, currentUserId) => {
    try {
      const data = await awardGlobalTrophy(winnerId, editionLabel, currentUserId);
      await loadData();
      toast.success(
        `🏆 Trofeo otorgado exitosamente a ${data.winner_name} para ${editionLabel}`,
        4000
      );
      return { success: true, data };
    } catch (err) {
      console.error('Error awarding trophy:', err);
      if (err.message.includes('Ya existe un campeón')) {
        toast.error('⚠️ Ya se otorgó un trofeo para esta edición');
      } else if (err.message.includes('Usuario no encontrado')) {
        toast.error('❌ Usuario no encontrado');
      } else {
        toast.error('❌ Error al otorgar el trofeo. Intenta de nuevo.');
      }
      throw err;
    }
  };

  const handleResetGlobalStats = async () => {
    try {
      const data = await resetGlobalStats();
      await loadData();
      toast.success(
        `🔄 Ranking global reseteado. ${data?.users_reset || 0} usuarios actualizados.`,
        4000
      );
      return { success: true, data };
    } catch (err) {
      console.error('Error resetting global stats:', err);
      const errorMessage = err.message || err.hint || 'Error desconocido';
      toast.error(`❌ Error al resetear ranking global: ${errorMessage}`);
      throw err;
    }
  };

  return {
    handleAwardTrophy,
    handleResetGlobalStats,
  };
};