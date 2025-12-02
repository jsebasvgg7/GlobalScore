// src/pages/ConfigPage.jsx
import React from "react";
import AppLayout from "../components/AppLayout";
import useProfile from "../hooks/useProfile";

export default function ConfigPage() {
  const { currentUser, addLeague, addAward, addMatch, loading } = useProfile();

  if (!currentUser?.is_admin) {
    return (
      <AppLayout title="Configuración">
        <div style={{ padding: 20 }}>No tienes permisos para ver esta sección.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configuración">
      <div className="config-actions">
        <button onClick={() => addMatch({ /* ejemplo */ name: "Partido demo", date: new Date().toISOString(), status: "pending" })}>Agregar Partido</button>
        <button onClick={() => addLeague({ name: "Liga demo", season: "2025" })}>Agregar Liga</button>
        <button onClick={() => addAward({ name: "Premio demo", season: "2025" })}>Agregar Premio</button>
      </div>
    </AppLayout>
  );
}
