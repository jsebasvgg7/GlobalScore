// src/features/admin/hooks/useAdminAchievements.js
import {
  upsertAchievement,
  deleteAchievement,
  upsertTitle,
  deleteTitle,
} from '../services/admin.service';

export const useAdminAchievements = (loadData, toast) => {

  const handleSaveAchievement = async (achievement) => {
    try {
      await upsertAchievement(achievement);
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
      await deleteAchievement(achievementId);
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
      await upsertTitle(title);
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
      await deleteTitle(titleId);
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
    handleDeleteTitle,
  };
};