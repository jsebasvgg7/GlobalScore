// src/features/admin/hooks/useAdminBanners.js
import {
  uploadBannerImage,
  insertBanner,
  deleteBanner,
  assignBannerToUser,
  revokeBannerFromUser,
  getUserBanners,
} from '../services/admin.service';

export const useAdminBanners = (loadData, toast) => {

  // ── Crear nuevo banner ──────────────────────────────
  const handleCreateBanner = async (bannerData, imageFile) => {
    try {
      let imageUrl = bannerData.image_url || '';

      if (imageFile) {
        imageUrl = await uploadBannerImage(imageFile);
      }

      if (!imageUrl) {
        throw new Error('Se requiere una imagen para el banner');
      }

      await insertBanner({ ...bannerData, image_url: imageUrl });
      await loadData();
      toast.success(`🖼️ Banner "${bannerData.name}" creado exitosamente`, 4000);
      return { success: true };
    } catch (err) {
      console.error('Error creating banner:', err);
      toast.error(`❌ Error al crear el banner: ${err.message}`);
      throw err;
    }
  };

  // ── Eliminar banner ─────────────────────────────────
  const handleDeleteBanner = async (bannerId, imageUrl) => {
    if (!confirm('¿Eliminar este banner? Se quitará de los usuarios que lo tengan equipado.')) return;

    try {
      await deleteBanner(bannerId, imageUrl);
      await loadData();
      toast.success('🗑️ Banner eliminado correctamente', 3000);
    } catch (err) {
      console.error('Error deleting banner:', err);
      toast.error('❌ Error al eliminar el banner');
      throw err;
    }
  };

  // ── Asignar banner a usuario ────────────────────────
  const handleAssignBanner = async (userId, bannerId) => {
    try {
      await assignBannerToUser(userId, bannerId);
      await loadData();
      toast.success('✅ Banner asignado al usuario correctamente', 3000);
      return { success: true };
    } catch (err) {
      console.error('Error assigning banner:', err);
      toast.error('❌ Error al asignar el banner');
      throw err;
    }
  };

  // ── Revocar banner de usuario ───────────────────────
  const handleRevokeBanner = async (userId, bannerId, bannerImageUrl) => {
    try {
      await revokeBannerFromUser(userId, bannerId, bannerImageUrl);
      await loadData();
      toast.success('Banner revocado del usuario', 3000);
    } catch (err) {
      console.error('Error revoking banner:', err);
      toast.error('❌ Error al revocar el banner');
      throw err;
    }
  };

  // ── Cargar banners de un usuario ────────────────────
  const loadUserBanners = async (userId) => {
    return await getUserBanners(userId);
  };

  return {
    handleCreateBanner,
    handleDeleteBanner,
    handleAssignBanner,
    handleRevokeBanner,
    loadUserBanners,
  };
};