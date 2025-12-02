// src/components/AppLayout.jsx
import React from "react";
import SidebarDesktop from "./SidebarDesktop";
import NavigationMobile from "./NavigationMobile";
import Header from "./Header";

export default function AppLayout({ children, title }) {
  return (
    <div className="app-layout">

      {/* Sidebar en desktop */}
      <aside className="sidebar-desktop-wrapper">
        <SidebarDesktop />
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <Header title={title} />
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* Barra inferior mobile */}
      <nav className="mobile-nav-wrapper">
        <NavigationMobile />
      </nav>

    </div>
  );
}
