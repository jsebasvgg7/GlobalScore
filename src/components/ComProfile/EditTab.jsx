import React, { useState, useEffect } from 'react';
import { Edit2, User, Trophy, Heart, Flag, Star, Save, X, Activity, Image, Check } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { supabase } from '../../utils/supabaseClient';

export default function EditTab({
  userData,
  setUserData,
  currentUser,
  loading,
  handleSave,
  handleAvatarUpload,
  loadUserData,
  setActiveTab
}) {
  const [userBanners, setUserBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  // Cargar banners disponibles para este usuario
  useEffect(() => {
    if (currentUser?.id) loadUserBanners();
  }, [currentUser?.id]);

  const loadUserBanners = async () => {
    setBannersLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_banners')
        .select('*, available_banners(*)')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setUserBanners((data || []).map(r => r.available_banners).filter(Boolean));
    } catch (err) {
      console.error('Error loading user banners:', err);
    } finally {
      setBannersLoading(false);
    }
  };

  const handleSelectBanner = (bannerUrl) => {
    // Toggle: si ya está seleccionado, deseleccionar (volver al base)
    const newUrl = userData.equipped_banner_url === bannerUrl ? null : bannerUrl;
    setUserData({ ...userData, equipped_banner_url: newUrl });
  };

  const handleEquipBase = () => {
    setUserData({ ...userData, equipped_banner_url: null });
  };

  return (
    <div className="tab-content-wrapper">
      <div className="section-header-modern">
        <Edit2 size={18} />
        <h3>Editar Perfil</h3>
      </div>

      <div className="edit-avatar-wrapper">
        <AvatarUpload
          currentUrl={userData.avatar_url}
          userId={currentUser.id}
          onUploadComplete={handleAvatarUpload}
          userLevel={userData.level}
        />
      </div>

      <div className="edit-form-modern">

        {/* ── Banner selector ──────────────────────────── */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            <Image size={16} />
            <span>Banner de Perfil</span>
            <span className="optional-badge">Cosmético</span>
          </label>

          {bannersLoading ? (
            <p style={{ fontSize: 13, color: 'var(--profile-text-secondary)', padding: '8px 0' }}>
              Cargando banners...
            </p>
          ) : (
            <div className="banner-selector">
              {/* Opción base (morado) */}
              <button
                type="button"
                className={`banner-option ${!userData.equipped_banner_url ? 'banner-option--selected' : ''}`}
                onClick={handleEquipBase}
              >
                <div className="banner-option-preview banner-option-preview--base">
                  <div className="banner-base-orb banner-base-orb--1" />
                  <div className="banner-base-orb banner-base-orb--2" />
                  <span className="banner-base-label">Base</span>
                </div>
                <div className="banner-option-info">
                  <span className="banner-option-name">Banner Base</span>
                  <span className="banner-option-desc">Gradiente morado por defecto</span>
                </div>
                {!userData.equipped_banner_url && (
                  <div className="banner-option-check">
                    <Check size={13} />
                  </div>
                )}
              </button>

              {/* Banners disponibles del usuario */}
              {userBanners.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--profile-text-secondary)', padding: '8px 0', fontStyle: 'italic' }}>
                  No tienes banners desbloqueados aún.
                </p>
              )}

              {userBanners.map(banner => {
                const isSelected = userData.equipped_banner_url === banner.image_url;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    className={`banner-option ${isSelected ? 'banner-option--selected' : ''}`}
                    onClick={() => handleSelectBanner(banner.image_url)}
                  >
                    <div className="banner-option-preview">
                      <img src={banner.image_url} alt={banner.name} className="banner-option-img" />
                    </div>
                    <div className="banner-option-info">
                      <span className="banner-option-name">{banner.name}</span>
                      {banner.description && (
                        <span className="banner-option-desc">{banner.description}</span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="banner-option-check">
                        <Check size={13} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Nombre */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            <User size={16} />
            <span>Nombre Completo</span>
            <span className="optional-badge">Opcional</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.name || ''}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>

        {/* Equipo favorito */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            <Trophy size={16} />
            <span>Equipo Favorito</span>
            <span className="optional-badge">Opcional</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.favorite_team || ''}
            onChange={(e) => setUserData({ ...userData, favorite_team: e.target.value })}
            placeholder="Ej: Real Madrid"
          />
        </div>

        {/* Jugador favorito */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            <Heart size={16} />
            <span>Jugador Favorito</span>
            <span className="optional-badge">Opcional</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.favorite_player || ''}
            onChange={(e) => setUserData({ ...userData, favorite_player: e.target.value })}
            placeholder="Ej: Lionel Messi"
          />
        </div>

        {/* Género */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            <User size={16} />
            <span>Género</span>
            <span className="optional-badge">Opcional</span>
          </label>
          <select
            className="form-select-modern"
            value={userData.gender || ''}
            onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
            <option value="Prefiero no decir">Prefiero no decir</option>
          </select>
        </div>

        {/* Nacionalidad */}
        <div className="form-group-modern">
          <label className="form-label-modern">
            <Flag size={16} />
            <span>Nacionalidad</span>
            <span className="optional-badge">Opcional</span>
          </label>
          <input
            type="text"
            className="form-input-modern"
            value={userData.nationality || ''}
            onChange={(e) => setUserData({ ...userData, nationality: e.target.value })}
            placeholder="Ej: Colombia"
          />
        </div>

        {/* Bio */}
        <div className="form-group-modern full-width">
          <label className="form-label-modern">
            <Star size={16} />
            <span>Biografía</span>
            <span className="optional-badge">Opcional</span>
          </label>
          <textarea
            className="form-textarea-modern"
            value={userData.bio || ''}
            onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            placeholder="Cuéntanos sobre ti..."
            rows={3}
          />
        </div>

        {/* Acciones */}
        <div className="form-actions-modern">
          <button
            className="save-button-modern"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Activity size={16} className="spinner" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
          <button
            className="cancel-button-modern"
            onClick={() => {
              loadUserData();
              setActiveTab('overview');
            }}
          >
            <X size={16} />
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
}