// src/pages/layout/VegaLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarDesktop from "../../components/SidebarDesktop";
import NavigationMobile from "../../components/NavigationMobile";
import "../../styles/VegaLayout.css";

export default function VegaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`vega-layout-root ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
      
      {/* Sidebar recibe el setter */}
      <SidebarDesktop onToggleSidebar={setSidebarOpen} />

      {/* Main content */}
      <main className="vega-main">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <NavigationMobile />
    </div>
  );
}
