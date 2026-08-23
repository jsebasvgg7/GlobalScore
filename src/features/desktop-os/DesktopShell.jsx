import React from "react";
import { useWindowManager } from "./WindowManagerContext";
import Window from "./Window";
import Dock from "./Dock";
import DesktopTopbar from "./DesktopTopbar";
import PitchWallpaper from "./PitchWallpaper";
import "./DesktopShell.css";

// ── Escritorio ────────────────────────────────────────────────
// Pantalla vacía que monta la topbar, el wallpaper de cancha,
// las ventanas abiertas y el dock. currentUser/users vienen de
// sharedProps del WindowManager — la misma fuente que alimenta
// las ventanas.
export default function DesktopShell() {
  const { windows, sharedProps } = useWindowManager();

  return (
    <div className="desktop">
      <DesktopTopbar currentUser={sharedProps.currentUser} users={sharedProps.users} />
      <div className="desktop-canvas">
        <PitchWallpaper />
        {windows.map((w) => (
          <Window key={w.id} window={w} />
        ))}
      </div>
      <Dock />
    </div>
  );
}
