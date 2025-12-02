import { Home, Trophy, History, User, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "../styles/SidebarNew.css";

export default function NavigationMobile() {
  const { pathname } = useLocation();

  const isActive = (route) => pathname === route;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg flex justify-around py-2 z-50">
      
      {/* HOME */}
      <Link
        to="/app/home"
        className={`nav-item ${isActive("/app/home") || isActive("/app") ? "active" : ""}`}
      >
        <Home size={24} />
      </Link>

      {/* RANKING */}
      <Link
        to="/app/ranking"
        className={`nav-item ${isActive("/app/ranking") ? "active" : ""}`}
      >
        <Trophy size={24} />
      </Link>

      {/* CONFIG (BOTÓN CENTRAL) */}
      <Link
        to="/app/config"
        className={`nav-item center-btn ${isActive("/app/config") ? "active" : ""}`}
      >
        <Settings size={26} />
      </Link>

      {/* HISTORIAL */}
      <Link
        to="/app/historical"
        className={`nav-item ${isActive("/app/historical") ? "active" : ""}`}
      >
        <History size={24} />
      </Link>

      {/* PERFIL */}
      <Link
        to="/app/profile"
        className={`nav-item ${isActive("/app/profile") ? "active" : ""}`}
      >
        <User size={24} />
      </Link>
    </nav>
  );
}
