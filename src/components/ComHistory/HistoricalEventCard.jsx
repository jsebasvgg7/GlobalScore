// src/components/ComHistory/HistoricalEventCard.jsx
import React from "react";
import { Calendar } from "lucide-react";

const EVENT_COLORS = {
  "Championship":          "#c9a227",
  "Historic Match":        "#3b82f6",
  "Legendary Performance": "#E24B4A",
  "Era Defining":          "#8b7fc7",
  "Record":                "#1D9E75",
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric"
  });
}

export default function HistoricalEventCard({ event, onClick }) {
  const accentColor = EVENT_COLORS[event.event_type] || "#60519b";

  return (
    <button
      className="hec-card"
      onClick={() => onClick(event)}
      style={{ "--hec-accent": accentColor }}
    >
      {/* Accent bar top */}
      <div className="hec-accent-bar" style={{ background: accentColor }} />

      {/* Image */}
      <div className="hec-img-wrap">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="hec-img" />
        ) : (
          <div className="hec-img-ph">
            <span className="hec-img-ph-text">{event.event_type?.slice(0,2).toUpperCase()}</span>
          </div>
        )}
        <div className="hec-img-overlay" />
      </div>

      {/* Body */}
      <div className="hec-body">
        <span
          className="hec-type-badge"
          style={{ color: accentColor, borderColor: accentColor + "50", background: accentColor + "15" }}
        >
          {event.event_type}
        </span>

        <h3 className="hec-title">{event.title}</h3>

        {event.event_date && (
          <div className="hec-date">
            <Calendar size={10} />
            <span>{formatDate(event.event_date)}</span>
          </div>
        )}

        {event.description && (
          <p className="hec-desc">{event.description.slice(0, 120)}…</p>
        )}
      </div>
    </button>
  );
}
