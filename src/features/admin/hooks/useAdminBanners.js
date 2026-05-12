import { supabase } from '../../utils/supabaseClient';

export const useAdminBanners = (loadData, toast) => {

  // ── Subir imagen al bucket banners ──────────────────
  const uploadBannerImage = async (file) => {
    // 1. Verificar sesión activa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('No hay sesión activa. Por favor recarga la página e inicia sesión nuevamente.');
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!allowedExts.includes(ext)) {
      throw new Error(`Formato no permitido. Usa: ${allowedExts.join(', ')}`);
    }

    const fileName = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      if (uploadError.statusCode === '403' || uploadError.message?.includes('403')) {
        throw new Error('Sin permisos para subir archivos. Ve a Supabase → Storage → Policies y asegúrate de que el bucket "banners" tiene políticas INSERT para usuarios autenticados.');
      }
      if (uploadError.statusCode === '404' || uploadError.message?.includes('not found')) {
        throw new Error('El bucket "banners" no existe. Ve a Supabase → Storage y créalo manualmente como público.');
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('banners')
      .getPublicUrl(fileName);

    return publicUrl;
  };

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

      const { error } = await supabase
        .from('available_banners')
        .insert({
          name: bannerData.name,
          description: bannerData.description || '',
          image_url: imageUrl,
        });

      if (error) throw error;

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
      // Quitar banner equipado a todos los usuarios que lo tengan
      await supabase
        .from('users')
        .update({ equipped_banner_url: null })
        .eq('equipped_banner_url', imageUrl);

      // Eliminar asignaciones
      await supabase
        .from('user_banners')
        .delete()
        .eq('banner_id', bannerId);

      // Eliminar de tabla
      const { error } = await supabase
        .from('available_banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;

      // Intentar eliminar del storage
      try {
        const fileName = imageUrl.split('/').pop();
        await supabase.storage.from('banners').remove([fileName]);
      } catch (_) {
        // No crítico si falla el storage
      }

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
      const { error } = await supabase
        .from('user_banners')
        .upsert({ user_id: userId, banner_id: bannerId }, { onConflict: 'user_id,banner_id' });

      if (error) throw error;

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
      const { error } = await supabase
        .from('user_banners')
        .delete()
        .eq('user_id', userId)
        .eq('banner_id', bannerId);

      if (error) throw error;

      // Si el usuario tiene equipado este banner, quitarlo
      const { data: userData } = await supabase
        .from('users')
        .select('equipped_banner_url')
        .eq('id', userId)
        .single();

      if (userData?.equipped_banner_url === bannerImageUrl) {
        await supabase
          .from('users')
          .update({ equipped_banner_url: null })
          .eq('id', userId);
      }

      await loadData();
      toast.success('Banner revocado del usuario', 3000);
    } catch (err) {
      console.error('Error revoking banner:', err);
      toast.error('❌ Error al revocar el banner');
      throw err;
    }
  };

  // ── Cargar banners disponibles ──────────────────────
  const loadBanners = async () => {
    const { data, error } = await supabase
      .from('available_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // ── Cargar banners de un usuario ────────────────────
  const loadUserBanners = async (userId) => {
    const { data, error } = await supabase
      .from('user_banners')
      .select('*, available_banners(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(row => row.available_banners);
  };

  return {
    uploadBannerImage,
    handleCreateBanner,
    handleDeleteBanner,
    handleAssignBanner,
    handleRevokeBanner,
    loadBanners,
    loadUserBanners,
  };
};