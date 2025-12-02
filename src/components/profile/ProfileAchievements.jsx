// src/components/profile/ProfileAchievements.jsx
import React from "react";

export default function ProfileAchievements({ currentUser }) {
  const achievements = currentUser?.achievements || [];

  return (
    <div className="card profile-achievements">
      <h4>Logros</h4>
      {achievements.length === 0 ? (
        <p>No tienes logros aún</p>
      ) : (
        <div className="achievements-grid">
          {achievements.map((a) => (
            <div className="achievement-item" key={a.id || a.key}>
              <div className="achievement-title">{a.name}</div>
              <div className="muted">{a.description || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
