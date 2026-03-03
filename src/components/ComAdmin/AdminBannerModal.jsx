// src/components/ComAdmin/AdminBannerModal.jsx
import React, { useState, useRef } from 'react';
import { X, Plus, Image, Upload, Loader } from 'lucide-react';
import '../../styles/StylesAdmin/AdminModal.css';

export default function AdminBannerModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { alert('El nombre es obligatorio'); return; }
    if (!imageFile) { alert('Debes seleccionar una imagen'); return; }

    setUploading(true);
    try {
      await onCreate(form, imageFile);
      onClose();
    } catch (_) {
      // error ya manejado en el hook
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="am2-backdrop">
      <div className="am2-shell" style={{ maxWidth: 520 }}>

        {/* Header */}
        <div className="am2-header">
          <div className="am2-header-icon">
            <Image size={18} />
          </div>
          <div className="am2-header-text">
            <h2>Crear Banner</h2>
            <p>Sube una imagen y configura el banner (1308×654 recomendado)</p>
          </div>
          <button className="am2-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="am2-body">

          {/* Zona de upload */}
          <div
            className={`banner-drop-zone ${dragOver ? 'banner-drop-zone--active' : ''} ${imagePreview ? 'banner-drop-zone--has-image' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="banner-preview-img" />
                <div className="banner-preview-overlay">
                  <Upload size={20} />
                  <span>Cambiar imagen</span>
                </div>
              </>
            ) : (
              <div className="banner-drop-content">
                <div className="banner-drop-icon">
                  <Upload size={28} />
                </div>
                <p className="banner-drop-text">Arrastra aquí o haz click para subir</p>
                <p className="banner-drop-hint">PNG, JPG, WEBP · Recomendado: 1308×654px</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Nombre */}
          <div className="am2-field">
            <label className="am2-label">
              Nombre del Banner <span className="am2-req">*</span>
            </label>
            <input
              className="am2-input"
              name="name"
              placeholder="Ej: Banner Clásico, Galaxia, Campeón..."
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Descripción */}
          <div className="am2-field">
            <label className="am2-label">Descripción</label>
            <input
              className="am2-input"
              name="description"
              placeholder="Descripción opcional del banner"
              value={form.description}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="am2-footer">
          <button className="am2-btn am2-btn--cancel" onClick={onClose} disabled={uploading}>
            Cancelar
          </button>
          <button className="am2-btn am2-btn--submit" onClick={handleSubmit} disabled={uploading || !imageFile}>
            {uploading ? (
              <><Loader size={15} className="am2-spinner" /> Subiendo...</>
            ) : (
              <><Plus size={15} /> Crear Banner</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}