// src/features/admin/hooks/useAdminLeagues.js
import {
  insertLeague,
  finishLeague,
  deleteLeague,
} from '../services/admin.service';

export const useAdminLeagues = (loadData, toast) => {

  const handleAddLeague = async (league) => {
    try {
      await insertLeague(league);
      await loadData();
      toast.success(`🏆 Liga "${league.name}" agregada exitosamente`, 4000);
      return { success: true };
    } catch (err) {
      console.error('Error adding league:', err);
      toast.error('❌ Error al agregar la liga. Verifica los datos.');
      throw err;
    }
  };

  const handleFinishLeague = async (leagueId, results) => {
    try {
      await finishLeague(leagueId, results);
      await loadData();
      toast.success('🏆 Liga finalizada y resultados guardados', 4000);
    } catch (err) {
      console.error('Error finishing league:', err);
      toast.error('❌ Error al finalizar la liga. Intenta de nuevo.');
      throw err;
    }
  };

  const handleDeleteLeague = async (leagueId) => {

    try {
      await deleteLeague(leagueId);
      await loadData();
      toast.success('🗑️ Liga eliminada correctamente', 3000);
    } catch (err) {
      console.error('Error deleting league:', err);
      toast.error('❌ Error al eliminar la liga');
      throw err;
    }
  };

  return {
    handleAddLeague,
    handleFinishLeague,
    handleDeleteLeague,
  };
};