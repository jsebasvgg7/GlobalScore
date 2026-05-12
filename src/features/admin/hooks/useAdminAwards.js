import { supabase } from '../../utils/supabaseClient';

export const useAdminAwards = (loadData, toast) => {
  const handleAddAward = async (award) => {
    try {
      const { error } = await supabase.from('awards').insert(award);
      if (error) throw error;
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
      await supabase
        .from('awards')
        .update({ status: 'finished', winner })
        .eq('id', awardId);

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
      const { error } = await supabase.from('awards').delete().eq('id', awardId);
      if (error) throw error;
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
    handleDeleteAward
  };
};