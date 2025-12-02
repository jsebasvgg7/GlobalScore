// src/components/Header.jsx (Actualizado)

import React from "react";
import { Link, useLocation } from "react-router-dom"; // <-- AGREGAR Link y useLocation
import { Trophy, LogOut, User2, Award as AwardIcon, TrendingUp } from "lucide-react"; 
import { supabase } from "../utils/supabaseClient";
import "../styles/Header.css";

// Recibimos isAdmin como prop
export default function Header({ currentUser, isAdmin }) { 
  const location = useLocation(); // Para saber qué ruta está activa

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getNavLinkClass = (path) => 
    `nav-link ${location.pathname === path || (path === '/app' && location.pathname === '/') ? 'active' : ''}`;

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-box">
          <Trophy size={28} />
        </div>
        <div className="title-wrap">
          <h1 className="app-title">Vega Score</h1>
          <div className="app-sub">
             {/* Navegación Principal */}
             <nav className="main-nav">
                <Link to="/app" className={getNavLinkClass('/app')}>
                    <span className="link-text">Dashboard</span>
                </Link>
                <Link to="/ranking" className={getNavLinkClass('/ranking')}>
                    <span className="link-text">Ranking</span>
                </Link>
                {/* Botón de Admin Condicional */}
                {isAdmin && (
                    <Link to="/admin" className={getNavLinkClass('/admin')}>
                        <span className="link-text">Admin</span>
                    </Link>
                )}
             </nav>
          </div>
        </div>
      </div>

     <div className="header-right">
        <span className="user-name-display">{currentUser?.name}</span>

        {/* Botón de perfil (Ahora navega a la ruta /profile) */}
        <Link to="/profile" className="icon-btn profile-btn" aria-label="Ver perfil">
          <User2 size={18} />
        </Link>

        <button className="icon-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}