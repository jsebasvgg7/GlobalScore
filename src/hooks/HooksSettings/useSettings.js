// src/hooks/settingsHooks/useSettings.js
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const DEFAULT_PREFERENCES = {
  // Apariencia
  theme: 'light',
  font_size: 'medium',
  
  // Notificaciones
  push_enabled: false,
  notif_new_matches: true,
  notif_finished_matches: true,
  notif_new_leagues: true,
  notif_reminders: true,
  notif_sound: true,
  
  // Predicciones
  confirm_before_save: false,
  auto_save: true,
  show_probabilities: false,
  predictions_public: true,
  
  // Privacidad
  profile_public: true,
  show_stats_in_ranking: true,
  share_activity: true
};

export const useSettings = (currentUser) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ============================================
  // CARGAR PREFERENCIAS
  // ============================================
  useEffect(() => {
    if (currentUser?.id) {
      loadPreferences();
    }
  }, [currentUser]);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      // Si no existe, crear preferencias por defecto
      if (!data) {
        await createDefaultPreferences();
      } else {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error in loadPreferences:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CREAR PREFERENCIAS POR DEFECTO
  // ============================================
  const createDefaultPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: currentUser.id,
          ...DEFAULT_PREFERENCES
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      console.log('✅ Preferencias creadas:', data);
    } catch (err) {
      console.error('Error creating preferences:', err);
    }
  };

  // ============================================
  // GUARDAR PREFERENCIAS
  // ============================================
  const savePreferences = async (newPreferences) => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      console.log('✅ Preferencias guardadas:', data);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error saving preferences:', err);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ACTUALIZAR PREFERENCIA INDIVIDUAL
  // ============================================
  const updatePreference = async (key, value) => {
    const updatedPrefs = { ...preferences, [key]: value };
    setPreferences(updatedPrefs); // Actualización optimista
    
    const result = await savePreferences(updatedPrefs);
    
    if (!result.success) {
      // Revertir si falla
      setPreferences(preferences);
    }
    
    return result;
  };

  // ============================================
  // RESETEAR A VALORES POR DEFECTO
  // ============================================
  const resetToDefaults = async () => {
    return await savePreferences(DEFAULT_PREFERENCES);
  };

  // ============================================
  // EXPORTAR DATOS DEL USUARIO
  // ============================================
  const exportUserData = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const { data: predictions } = await supabase
        .from('predictions')
        .select('*, matches(*)')
        .eq('user_id', currentUser.id);

      const { data: leaguePreds } = await supabase
        .from('league_predictions')
        .select('*, leagues(*)')
        .eq('user_id', currentUser.id);

      const { data: awardPreds } = await supabase
        .from('award_predictions')
        .select('*, awards(*)')
        .eq('user_id', currentUser.id);

      const exportData = {
        user: userData,
        preferences,
        predictions,
        league_predictions: leaguePreds,
        award_predictions: awardPreds,
        exported_at: new Date().toISOString()
      };

      // Crear archivo JSON y descargarlo
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `globalscore_data_${currentUser.name}_${Date.now()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      console.error('Error exporting data:', err);
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // ELIMINAR CUENTA (Acción peligrosa)
  // ============================================
  const deleteAccount = async () => {
    try {
      // Eliminar datos relacionados (cascada manejada por DB)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', currentUser.id);

      if (error) throw error;

      // Cerrar sesión
      await supabase.auth.signOut();
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting account:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    savePreferences,
    resetToDefaults,
    exportUserData,
    deleteAccount,
    loadPreferences
  };
};