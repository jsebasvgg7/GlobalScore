import { supabase } from '../../utils/supabaseClient';

export const useAdminAchievements = (loadData, toast) => {
  const handleSaveAchievement = async (achievement) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .upsert(achievement, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success(`⭐ Logro "${achievement.name}" guardado exitosamente`, 3000);
    } catch (err) {
      console.error('Error saving achievement:', err);
      toast.error('❌ Error al guardar el logro');
      throw err;
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    try {
      const { error } = await supabase
        .from('available_achievements')
        .delete()
        .eq('id', achievementId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Logro eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting achievement:', err);
      toast.error('❌ Error al eliminar el logro');
      throw err;
    }
  };

  const handleSaveTitle = async (title) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .upsert(title, { onConflict: 'id' });
      if (error) throw error;
      await loadData();
      toast.success(`👑 Título "${title.name}" guardado exitosamente`, 3000);
    } catch (err) {
      console.error('Error saving title:', err);
      toast.error('❌ Error al guardar el título');
      throw err;
    }
  };

  const handleDeleteTitle = async (titleId) => {
    try {
      const { error } = await supabase
        .from('available_titles')
        .delete()
        .eq('id', titleId);
      if (error) throw error;
      await loadData();
      toast.success('🗑️ Título eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting title:', err);
      toast.error('❌ Error al eliminar el título');
      throw err;
    }
  };

  return {
    handleSaveAchievement,
    handleDeleteAchievement,
    handleSaveTitle,
    handleDeleteTitle
  };
};