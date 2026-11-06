import React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { MATCH_SORT_OPTIONS } from '@/shared/utils/adminFilters';

export default function AdminMatchFilters({
  total,
  leagues,
  league,
  setLeague,
  sortBy,
  setSortBy,
  hasActiveFilters,
  onClear,
}) {
  return (
    <div className="admin-match-filters">
      <label className="amf-field">
        <span className="amf-label">Liga</span>
        <span className="amf-select-wrap">
          <select
            className="amf-select"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
          >
            <option value="all">Todas las ligas ({total})</option>
            {leagues.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label} ({l.count})
              </option>
            ))}
          </select>
          <ChevronDown size={12} />
        </span>
      </label>

      <label className="amf-field">
        <span className="amf-label">Orden</span>
        <span className="amf-select-wrap">
          <select
            className="amf-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {MATCH_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} />
        </span>
      </label>

      {hasActiveFilters && (
        <button className="amf-clear" onClick={onClear}>
          <X size={11} />
          <span>Limpiar</span>
        </button>
      )}
    </div>
  );
}
