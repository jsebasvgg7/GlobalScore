import React, { createContext, useContext, useState, useCallback } from "react";
import DashboardPage from "@/features/dashboard/page/DashboardPage";
import RankingPage from "@/features/ranking/page/RankingPage";
import StatsPage from "@/features/stats/page/StatsPage";
import HistoryPage from "@/features/history/page/HistoryPage";
import ProfileSettingsPage from "@/features/profile/page/ProfileSettingsPage";
import AdminPage from "@/features/admin/page/AdminPage";

// ── Contexto ──────────────────────────────────────────────────
const WindowManagerContext = createContext(null);

// ── Registro de apps disponibles ────────────────────────────
// Cada app define su id, título y el componente que se monta
// dentro de la ventana. currentUser/users se inyectan a todas
// automáticamente vía sharedProps (ver WindowManagerProvider);
// StatsPage e HistoryPage no usan `users`, pero recibirlo de
// más no rompe nada — React ignora props no declaradas.
// ProfileSettingsPage espera además un onBack, que agregamos
// aparte en sharedProps más abajo. AdminPage solo se muestra
// en el dock si currentUser.is_admin (ver Dock.jsx).
export const APP_REGISTRY = {
  dashboard: { title: "Dashboard", component: DashboardPage },
  ranking: { title: "Ranking", component: RankingPage },
  stats: { title: "Stats", component: StatsPage },
  history: { title: "Histórico", component: HistoryPage },
  profile: { title: "Perfil", component: ProfileSettingsPage },
  admin: { title: "Admin", component: AdminPage },
};

// ── Posición inicial en cascada para nuevas ventanas ────────
const CASCADE_OFFSET = 32;
const DEFAULT_SIZE = { width: 480, height: 560 };

export function WindowManagerProvider({ children, currentUser, users }) {
  // windows: array de { id, appId, title, position, size, zIndex, isMinimized }
  const [windows, setWindows] = useState([]);
  const [nextZIndex, setNextZIndex] = useState(1);

  const openWindow = useCallback((appId) => {
    setWindows((prev) => {
      // Si ya está abierta, solo la trae al frente
      const existing = prev.find((w) => w.appId === appId);
      if (existing) {
        return prev.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: nextZIndex }
            : w
        );
      }

      const app = APP_REGISTRY[appId];
      if (!app) {
        console.warn(`WindowManager: appId "${appId}" no está registrada`);
        return prev;
      }

      const cascadeIndex = prev.length;
      const newWindow = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: app.title,
        position: {
          x: 40 + cascadeIndex * CASCADE_OFFSET,
          y: 24 + cascadeIndex * CASCADE_OFFSET,
        },
        size: DEFAULT_SIZE,
        zIndex: nextZIndex,
        isMinimized: false,
      };

      return [...prev, newWindow];
    });
    setNextZIndex((z) => z + 1);
  }, [nextZIndex]);

  const closeWindow = useCallback((windowId) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  // onBack para páginas como ProfileSettingsPage, que esperan
  // volver atrás — dentro de una ventana, "volver" significa
  // cerrar la ventana enfocada, no usar el historial del navegador.
  const closeFocusedWindow = useCallback(() => {
    setWindows((prev) => {
      if (!prev.length) return prev;
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      return prev.filter((w) => w.zIndex !== maxZ);
    });
  }, []);

  // Props compartidos que tus páginas reales ya esperan
  // (currentUser, users, onBack) — se inyectan en cada ventana al montar.
  const sharedProps = { currentUser, users, onBack: closeFocusedWindow };

  const minimizeWindow = useCallback((windowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
  }, []);

  const focusWindow = useCallback((windowId) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
      )
    );
    setNextZIndex((z) => z + 1);
  }, [nextZIndex]);

  const isAppOpen = useCallback(
    (appId) => windows.some((w) => w.appId === appId && !w.isMinimized),
    [windows]
  );

  const value = {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    isAppOpen,
    sharedProps,
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error("useWindowManager debe usarse dentro de WindowManagerProvider");
  }
  return ctx;
}