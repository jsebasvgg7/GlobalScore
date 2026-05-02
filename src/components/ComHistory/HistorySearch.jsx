// src/components/ComHistory/HistorySearch.jsx
import React from "react";
import { Search, X } from "lucide-react";

export default function HistorySearch({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="hsrch-wrap">
      <Search size={13} className="hsrch-icon" />
      <input
        className="hsrch-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="hsrch-clear" onClick={() => onChange("")}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}
