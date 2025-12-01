import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function AvatarUpload({ currentUrl, userId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB');
      return;
    }

    setUploading(true);

    try {
      // Crear preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Actualizar URL en la base de datos
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUploadComplete?.(publicUrl);
    } catch (error) {
      console.error('Error al subir avatar:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUrl) return;

    setUploading(true);
    try {
      // Actualizar URL en la base de datos
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      setPreview(null);
      onUploadComplete?.(null);
    } catch (error) {
      console.error('Error al eliminar avatar:', error);
      alert('Error al eliminar la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload-container">
      <div className="avatar-preview-wrapper">
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className="avatar-preview-image"
            onError={() => setPreview(null)}
          />
        ) : (
          <div className="avatar-placeholder">
            <Camera size={32} />
          </div>
        )}
        
        {uploading && (
          <div className="avatar-loading-overlay">
            <Loader2 size={24} className="spinner" />
          </div>
        )}
      </div>

      <div className="avatar-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        <button
          className="avatar-btn primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={16} />
          <span>{preview ? 'Cambiar' : 'Subir foto'}</span>
        </button>

        {preview && (
          <button
            className="avatar-btn secondary"
            onClick={handleRemoveAvatar}
            disabled={uploading}
          >
            <X size={16} />
            <span>Eliminar</span>
          </button>
        )}
      </div>

      <p className="avatar-hint">
        JPG, PNG o GIF. Máximo 2MB.
      </p>

      <style>{`
        .avatar-upload-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .avatar-preview-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #f0f0f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .avatar-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #60519b 0%, #8b7fc7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .avatar-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .avatar-actions {
          display: flex;
          gap: 8px;
        }

        .avatar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .avatar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .avatar-btn.primary {
          background: linear-gradient(135deg, #60519b 0%, #8b7fc7 100%);
          color: white;
        }

        .avatar-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(96, 81, 155, 0.4);
        }

        .avatar-btn.secondary {
          background: #f5f5f5;
          color: #666;
        }

        .avatar-btn.secondary:hover:not(:disabled) {
          background: #e5e5e5;
        }

        .avatar-hint {
          font-size: 11px;
          color: #888;
          margin: 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
}