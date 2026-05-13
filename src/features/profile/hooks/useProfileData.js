import { useState, useEffect } from 'react';
import { fetchUserById, updateUserProfile } from '../services/profile.service';

export const useProfileData = (currentUser) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    favorite_team: currentUser?.favorite_team || '',
    favorite_player: currentUser?.favorite_player || '',
    gender: currentUser?.gender || '',
    nationality: currentUser?.nationality || '',
    avatar_url: currentUser?.avatar_url || null,
    level: currentUser?.level || 1,
    joined_date: currentUser?.created_at || new Date().toISOString(),
    equipped_banner_url: currentUser?.equipped_banner_url || null,
  });

  const loadUserData = async () => {
    try {
      const data = await fetchUserById(currentUser.id);

      if (data) {
        setUserData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          favorite_team: data.favorite_team || '',
          favorite_player: data.favorite_player || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          avatar_url: data.avatar_url || null,
          level: data.level || 1,
          joined_date: data.created_at,
          equipped_banner_url: data.equipped_banner_url || null,
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const saveUserData = async (toast, onBack) => {
    setLoading(true);
    try {
      await updateUserProfile(currentUser.id, {
        name: userData.name,
        bio: userData.bio,
        favorite_team: userData.favorite_team,
        favorite_player: userData.favorite_player,
        gender: userData.gender,
        nationality: userData.nationality,
        equipped_banner_url: userData.equipped_banner_url ?? null,
      });

      toast.success('¡Perfil actualizado con éxito!');

      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  return {
    userData,
    setUserData,
    loading,
    loadUserData,
    saveUserData,
  };
};