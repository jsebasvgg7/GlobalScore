import { supabase } from '../../utils/supabaseClient';

export const useAdminLeagues = (loadData, toast) => {
  const handleAddLeague = async (league) => {
    try {
      const { error } = await supabase.from('leagues').insert(league);
      if (error) throw error;
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
      await supabase
        .from('leagues')
        .update({ 
          status: 'finished',
          ...results
        })
        .eq('id', leagueId);

      await loadData();
      toast.success('🏆 Liga finalizada y resultados guardados', 4000);
    } catch (err) {
      console.error('Error finishing league:', err);
      toast.error('❌ Error al finalizar la liga. Intenta de nuevo.');
      throw err;
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (!confirm('¿Estás seguro de eliminar esta liga?')) return;
    
    try {
      const { error } = await supabase.from('leagues').delete().eq('id', leagueId);
      if (error) throw error;
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
    handleDeleteLeague
  };
};