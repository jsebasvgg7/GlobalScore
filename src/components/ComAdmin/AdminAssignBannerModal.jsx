// src/components/ComAdmin/AdminAssignBannerModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search, UserCheck, Image, Check, Trash2 } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../../styles/StylesAdmin/AdminModal.css';

// Normaliza texto: minúsculas, sin acentos, sin caracteres especiales
const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function AdminAssignBannerModal({ onClose, banners, users: initialUsers, onAssign, onRevoke }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userBanners, setUserBanners] = useState([]);
  const [loadingUserBanners, setLoadingUserBanners] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [allUsers, setAllUsers] = useState(initialUsers || []);

  // Recargar usuarios frescos al abrir (captura nombres actualizados)
  useEffect(() => {
    const fetchFreshUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, points, avatar_url')
        .order('name', { ascending: true });
      if (!error && data) setAllUsers(data);
    };
    fetchFreshUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) loadUserBanners(selectedUser.id);
  }, [selectedUser]);

  // Filtro normalizado — funciona con japonés, acentos, etc.
  const filteredUsers = allUsers.filter(u => {
    if (!userSearch.trim()) return false;
    const term = normalize(userSearch);
    const name = normalize(u.name);
    // También busca sin normalizar para nombres en caracteres no latinos (japonés, árabe, etc.)
    const nameRaw = (u.name || '').toLowerCase();
    const termRaw = userSearch.toLowerCase().trim();
    return name.includes(term) || nameRaw.includes(termRaw);
  });

  const loadUserBanners = async (userId) => {
    setLoadingUserBanners(true);
    try {
      const { data, error } = await supabase
        .from('user_banners')
        .select('*, available_banners(*)')
        .eq('user_id', userId);
      if (error) throw error;
      setUserBanners((data || []).map(r => r.available_banners));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUserBanners(false);
    }
  };

  const alreadyAssigned = (bannerId) => userBanners.some(b => b.id === bannerId);

  const handleAssign = async () => {
    if (!selectedUser || !selectedBanner) return;
    setAssigning(true);
    try {
      await onAssign(selectedUser.id, selectedBanner.id);
      await loadUserBanners(selectedUser.id);
      setSelectedBanner(null);
    } finally {
      setAssigning(false);
    }
  };

  const handleRevoke = async (banner) => {
    if (!selectedUser) return;
    await onRevoke(selectedUser.id, banner.id, banner.image_url);
    await loadUserBanners(selectedUser.id);
  };

  return (
    <div className="am2-backdrop">
      <div className="am2-shell" style={{ maxWidth: 600 }}>

        {/* Header */}
        <div className="am2-header">
          <div className="am2-header-icon">
            <UserCheck size={18} />
          </div>
          <div className="am2-header-text">
            <h2>Asignar Banner a Usuario</h2>
            <p>Selecciona un usuario y el banner que quieres otorgarle</p>
          </div>
          <button className="am2-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="am2-body">

          {/* Buscar usuario */}
          <div className="am2-field">
            <label className="am2-label"><Search size={12} /> Buscar Usuario</label>
            <input
              className="am2-input"
              placeholder="Escribe el nombre del usuario..."
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); }}
            />
          </div>

          {/* Lista filtrada */}
          {userSearch.trim() && !selectedUser && (
            <div className="assign-user-list">
              {filteredUsers.slice(0, 8).map(u => (
                <button
                  key={u.id}
                  className="assign-user-item"
                  onClick={() => { setSelectedUser(u); setUserSearch(u.name); }}
                >
                  <div className="assign-user-avatar">
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt={u.name} />
                      : <span>{(u.name || 'U')[0].toUpperCase()}</span>
                    }
                  </div>
                  <div className="assign-user-info">
                    <span className="assign-user-name">{u.name}</span>
                    <span className="assign-user-pts">{u.points || 0} pts</span>
                  </div>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p style={{ padding: '12px', color: 'var(--muted)', fontSize: 13 }}>
                  No se encontraron usuarios con ese nombre
                </p>
              )}
            </div>
          )}

          {/* Banners del usuario seleccionado */}
          {selectedUser && (
            <>
              <div className="assign-section-title">
                <UserCheck size={13} />
                Banners de <strong>{selectedUser.name}</strong>
              </div>
              {loadingUserBanners ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>Cargando...</p>
              ) : userBanners.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>
                  Este usuario no tiene banners asignados todavía.
                </p>
              ) : (
                <div className="assign-banner-chips">
                  {userBanners.map(b => (
                    <div key={b.id} className="assign-banner-chip">
                      <img src={b.image_url} alt={b.name} className="assign-chip-img" />
                      <span>{b.name}</span>
                      <button
                        className="assign-chip-revoke"
                        onClick={() => handleRevoke(b)}
                        title="Revocar banner"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="assign-section-title" style={{ marginTop: 16 }}>
                <Image size={13} />
                Selecciona un banner para asignar
              </div>
              <div className="assign-banners-grid">
                {banners.map(banner => {
                  const assigned = alreadyAssigned(banner.id);
                  const selected = selectedBanner?.id === banner.id;
                  return (
                    <button
                      key={banner.id}
                      className={`assign-banner-card ${selected ? 'selected' : ''} ${assigned ? 'assigned' : ''}`}
                      onClick={() => !assigned && setSelectedBanner(banner)}
                      disabled={assigned}
                    >
                      <img src={banner.image_url} alt={banner.name} className="assign-banner-img" />
                      <div className="assign-banner-info">
                        <span className="assign-banner-name">{banner.name}</span>
                        {assigned && <span className="assign-banner-tag">Ya asignado</span>}
                      </div>
                      {selected && !assigned && (
                        <div className="assign-banner-check"><Check size={14} /></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {banners.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No hay banners creados aún. Crea uno primero.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="am2-footer">
          <button className="am2-btn am2-btn--cancel" onClick={onClose}>Cerrar</button>
          {selectedUser && selectedBanner && (
            <button className="am2-btn am2-btn--submit" onClick={handleAssign} disabled={assigning}>
              {assigning
                ? <><span className="am2-spinner" /> Asignando...</>
                : <><UserCheck size={15} /> Asignar a {selectedUser.name}</>
              }
            </button>
          )}
        </div>

      </div>
    </div>
  );
}