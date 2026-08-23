import React from "react";
import { Home, Award, BarChart3, History, User2, Shield } from "lucide-react";
import { useWindowManager, APP_REGISTRY } from "./WindowManagerContext";
import "./Dock.css";

// ── Dock inferior ────────────────────────────────────────────
// Componente "tonto": solo dispara openWindow(appId).
// No conoce posiciones, z-index ni estado interno de ventanas.
// El último botón es especial: Admin para admins, Perfil para
// el resto — separado del resto por una línea divisoria, igual
// que Header.jsx hace con el bloque is_admin condicional.
const MAIN_ITEMS = [
  { appId: "dashboard", icon: Home, label: "Dashboard" },
  { appId: "ranking", icon: Award, label: "Ranking" },
  { appId: "stats", icon: BarChart3, label: "Stats" },
  { appId: "history", icon: History, label: "Histórico" },
];

export default function Dock() {
  const { openWindow, isAppOpen, sharedProps } = useWindowManager();
  const isAdmin = sharedProps?.currentUser?.is_admin;

  const finalItem = isAdmin
    ? { appId: "admin", icon: Shield, label: "Admin" }
    : { appId: "profile", icon: User2, label: "Perfil" };

  return (
    <div className="dock">
      {MAIN_ITEMS.map(({ appId, icon: Icon, label }) => (
        <button
          key={appId}
          className={`dock-key ${isAppOpen(appId) ? "dock-key--active" : ""}`}
          onClick={() => openWindow(appId)}
          aria-label={APP_REGISTRY[appId]?.title ?? label}
          title={label}
        >
          <Icon size={18} />
        </button>
      ))}

      <div className="dock-divider" />

      <button
        className={`dock-key ${isAppOpen(finalItem.appId) ? "dock-key--active" : ""}`}
        onClick={() => openWindow(finalItem.appId)}
        aria-label={APP_REGISTRY[finalItem.appId]?.title ?? finalItem.label}
        title={finalItem.label}
      >
        <finalItem.icon size={18} />
      </button>
    </div>
  );
}