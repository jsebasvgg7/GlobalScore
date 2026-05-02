// src/components/ComHistory/HistoryNavigation.jsx
import React from "react";
import { Users, Zap, Clock } from "lucide-react";

const TABS = [
  { id: "players", label: "Jugadores",  Icon: Users },
  { id: "events",  label: "Eventos",    Icon: Zap   },
  { id: "timeline",label: "Cronología", Icon: Clock },
];

export default function HistoryNavigation({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="hnav-root">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`hnav-tab ${activeTab === id ? "hnav-tab--active" : ""}`}
          onClick={() => onTabChange(id)}
        >
          <Icon size={15} />
          <span>{label}</span>
          {counts[id] != null && (
            <span className="hnav-count">{counts[id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
