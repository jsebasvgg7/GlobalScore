// src/features/admin/hooks/useAdminBots.js
import {
  updateBotProfile,
  uploadBotAvatar,
} from '../services/admin.service';

export const useAdminBots = (loadData, toast) => {

  // ============================================
  // GUARDAR BOT (nombre y/o foto)
  // ============================================
  const handleSaveBot = async (data) => {
    try {
      let avatar_url = data.avatar_url;

      // Si vino un archivo nuevo, primero lo subimos a Cloudinary
      if (data.file) {
        avatar_url = await uploadBotAvatar(data.file);
      }

      await updateBotProfile(data.id, { name: data.name, avatar_url });
      await loadData();
      toast.success(`✅ Bot "${data.name}" actualizado`, 3000);
      return { success: true };
    } catch (err) {
      console.error('Error al actualizar bot:', err);
      toast.error('❌ Error al actualizar el bot. Intenta de nuevo.');
      throw err;
    }
  };

  return {
    handleSaveBot,
  };
};