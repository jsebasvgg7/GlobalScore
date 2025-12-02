// src/components/profile/ProfileHistory.jsx
import React, { useEffect, useState } from "react";

export default function ProfileHistory({ currentUser, loadUserHistory }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await loadUserHistory(currentUser.id);
      if (mounted) setHistory(data || []);
      setLoading(false);
    }
    if (currentUser?.id) load();
    return () => (mounted = false);
  }, [currentUser, loadUserHistory]);

  return (
    <div className="card profile-history">
      <h4>Historial</h4>
      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <ul className="history-list">
          {history.length === 0 && <li>No hay registros</li>}
          {history.map((h) => (
            <li key={h.id}>
              <strong>{h.match_name || h.item_name}</strong>
              <div className="muted">
                {h.result || h.outcome} — {h.points || 0} pts
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
