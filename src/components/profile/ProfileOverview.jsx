// src/components/profile/ProfileOverview.jsx
import React from "react";

export default function ProfileOverview({ currentUser, uploadAvatar, updateProfile }) {
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
  };

  return (
    <div className="card profile-overview">
      <div className="avatar-row">
        <img src={currentUser?.avatar_url || "/default-avatar.png"} alt="avatar" className="avatar-lg" />
        <div className="profile-meta">
          <h3>{currentUser?.name || currentUser?.email}</h3>
          <p className="muted">{currentUser?.email}</p>
          <p>#{currentUser?.id}</p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="btn small">
          Cambiar avatar
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </label>
        <button className="btn small" onClick={() => updateProfile({ name: currentUser.name })}>Guardar perfil</button>
      </div>
    </div>
  );
}
