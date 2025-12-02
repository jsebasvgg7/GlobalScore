// src/components/profile/ProfileStats.jsx
import React from "react";

export default function ProfileStats({ currentUser, users, userPosition }) {
  const position = userPosition();
  const accuracy = currentUser?.predictions > 0 ? Math.round((currentUser.correct / currentUser.predictions) * 100) : 0;

  return (
    <div className="card profile-stats">
      <h4>Estadísticas</h4>
      <div className="stats-grid">
        <div>
          <div className="stat-label">Posición</div>
          <div className="stat-value">#{position || "-"}</div>
        </div>

        <div>
          <div className="stat-label">Puntos</div>
          <div className="stat-value">{currentUser.points ?? 0}</div>
        </div>

        <div>
          <div className="stat-label">Aciertos</div>
          <div className="stat-value">{currentUser.correct ?? 0}/{currentUser.predictions ?? 0}</div>
        </div>

        <div>
          <div className="stat-label">Precisión</div>
          <div className="stat-value">{accuracy}%</div>
        </div>
      </div>
    </div>
  );
}
