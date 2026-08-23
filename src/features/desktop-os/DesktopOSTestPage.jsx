import { WindowManagerProvider } from "./WindowManagerContext";
import DesktopShell from "./DesktopShell";

// Recibe los mismos props que App.jsx ya pasa a las demás páginas
// (currentUser, users) y los reenvía hacia abajo, para que las
// páginas reales dentro de las ventanas funcionen igual que en
// sus rutas normales.
export default function DesktopOSTestPage({ currentUser, users }) {
  return (
    <WindowManagerProvider currentUser={currentUser} users={users}>
      <DesktopShell />
    </WindowManagerProvider>
  );
}
