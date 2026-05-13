// src/features/admin/hooks/useAdminAwards.js
import {
  insertAward,
  finishAward,
  deleteAward,
} from '../services/admin.service';

export const useAdminAwards = (loadData, toast) => {

  const handleAddAward = async (award) => {
    try {
      await insertAward(award);
      await loadData();
      toast.success(`🏅 Premio "${award.name}" agregado exitosamente`, 4000);
      return { success: true };
    } catch (err) {
      console.error('Error adding award:', err);
      toast.error('❌ Error al agregar el premio. Verifica los datos.');
      throw err;
    }
  };

  const handleFinishAward = async (awardId, winner) => {
    try {
      await finishAward(awardId, winner);
      await loadData();
      toast.success(`🏅 Premio finalizado. Ganador: ${winner}`, 4000);
    } catch (err) {
      console.error('Error finishing award:', err);
      toast.error('❌ Error al finalizar el premio. Intenta de nuevo.');
      throw err;
    }
  };

  const handleDeleteAward = async (awardId) => {
    if (!confirm('¿Estás seguro de eliminar este premio?')) return;

    try {
      await deleteAward(awardId);
      await loadData();
      toast.success('🗑️ Premio eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting award:', err);
      toast.error('❌ Error al eliminar el premio');
      throw err;
    }
  };

  return {
    handleAddAward,
    handleFinishAward,
    handleDeleteAward,
  };
};