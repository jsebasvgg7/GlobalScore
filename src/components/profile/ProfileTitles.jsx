// src/components/profile/ProfileTitles.jsx
import React from "react";

export default function ProfileTitles({ currentUser }) {
  // assume user has a titles array or title fields
  const titles = currentUser?.titles || [];

  return (
    <div className="card profile-titles">
      <h4>Títulos</h4>
      {titles.length === 0 ? (
        <p>No tienes títulos aún</p>
      ) : (
        <div className="titles-list">
          {titles.map((t) => (
            <div className="title-item" key={t.id || t.name}>
              <strong>{t.name}</strong>
              <div className="muted">{t.year || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
