import React from 'react';
import { Trash2, UserCheck, Image } from 'lucide-react';

export default function AdminBannersList({ banners, onDelete, onAssign }) {
  if (!banners || banners.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: 12,
        color: 'var(--muted)'
      }}>
        <Image size={48} opacity={0.25} />
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>No hay banners creados</p>
        <p style={{ margin: 0, fontSize: 13 }}>Haz click en "Agregar Nuevo" para crear el primer banner</p>
      </div>
    );
  }

  return (
    <div className="banners-admin-grid">
      {banners.map(banner => (
        <div key={banner.id} className="banner-admin-card">
          {/* Preview imagen */}
          <div className="banner-admin-preview">
            <img src={banner.image_url} alt={banner.name} />
          </div>

          {/* Info */}
          <div className="banner-admin-info">
            <span className="banner-admin-name">{banner.name}</span>
            {banner.description && (
              <span className="banner-admin-desc">{banner.description}</span>
            )}
            <span className="banner-admin-date">
              {new Date(banner.created_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </span>
          </div>

          {/* Acciones */}
          <div className="banner-admin-actions">
            <button
              className="action-btn finish"
              onClick={() => onAssign(banner)}
              title="Asignar a usuario"
            >
              <UserCheck size={15} />
              <span>Asignar</span>
            </button>
            <button
              className="action-btn delete"
              onClick={() => onDelete(banner.id, banner.image_url)}
              title="Eliminar banner"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}