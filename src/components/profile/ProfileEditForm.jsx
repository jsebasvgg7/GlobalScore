// src/components/profile/ProfileEditForm.jsx
import React, { useState } from "react";

export default function ProfileEditForm({ currentUser, updateProfile }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name, phone });
    setSaving(false);
  };

  return (
    <div className="card profile-edit">
      <h4>Editar perfil</h4>
      <div className="form-row">
        <label>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Teléfono</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div style={{ marginTop: 8 }}>
        <button className="btn" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
