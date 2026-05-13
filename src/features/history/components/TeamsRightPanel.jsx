import { Shield, Trophy, MapPin } from "lucide-react";
import { useHistoricalTeams } from "../hooks/useHistoricalTeams";
import { getHistoricalImageUrl } from "../hooks/useHistoricalPlayers";
import "../styles/TeamsRightPanel.css";

const LEGACY_COLOR = {
  "Dynastic": "#f59e0b",
  "Innovative": "#8b5cf6",
  "Continental": "#3b82f6",
  "National": "#10b981",
};

const LEGACY_LABEL = {
  "Dynastic": "Dinástico",
  "Innovative": "Innovador",
  "Continental": "Continental",
  "National": "Nacional",
};

function TeamMini({ team }) {
  const img = getHistoricalImageUrl(team.image_path);
  const initials = team.name?.slice(0, 2).toUpperCase() || "??";
  const color = team.primary_color || "var(--accent)";

  return (
    <div className="trp-team-row">
      <div className="trp-team-shield" style={{ borderColor: color, background: `${color}18` }}>
        {img ? <img src={img} alt={team.name} /> : <span style={{ color }}>{initials}</span>}
      </div>
      <div className="trp-team-info">
        <span className="trp-team-name">{team.name}</span>
        <span className="trp-team-meta">
          {[team.country, team.era_dominance].filter(Boolean).join(" · ")}
        </span>
      </div>
      {team.titles_count > 0 && (
        <div className="trp-team-titles">
          <Trophy size={9} />
          <span>{team.titles_count}</span>
        </div>
      )}
    </div>
  );
}

function StatsByLegacy({ teams }) {
  const counts = teams.reduce((acc, t) => {
    if (t.legacy_type) acc[t.legacy_type] = (acc[t.legacy_type] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;

  return (
    <div className="trp-block">
      <div className="trp-block-label"><Trophy size={9} /> Por tipo</div>
      {entries.map(([type, count]) => {
        const color = LEGACY_COLOR[type] || "var(--accent)";
        const pct = Math.round((count / teams.length) * 100);
        return (
          <div key={type} className="trp-legacy-row">
            <div className="trp-legacy-dot" style={{ background: color }} />
            <span className="trp-legacy-name">{LEGACY_LABEL[type] || type}</span>
            <div className="trp-legacy-track">
              <div className="trp-legacy-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="trp-legacy-count" style={{ color }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatsByCountry({ teams }) {
  const counts = teams.reduce((acc, t) => {
    if (t.country) acc[t.country] = (acc[t.country] || 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (!top.length) return null;

  return (
    <div className="trp-block">
      <div className="trp-block-label"><MapPin size={9} /> Por país</div>
      {top.map(([country, count]) => (
        <div key={country} className="trp-stat-row">
          <span className="trp-stat-lbl">{country}</span>
          <span className="trp-stat-val">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function TeamsRightPanel() {
  const { teams, loading } = useHistoricalTeams();

  const totalTitles = teams.reduce((s, t) => s + (t.titles_count || 0), 0);
  const topTeam = [...teams].sort((a, b) => (b.titles_count || 0) - (a.titles_count || 0))[0];

  return (
    <aside className="trp-root">
      <div className="trp-label">
        <span className="trp-label-dot" />
        EQUIPOS
        <span className="trp-label-dot" />
      </div>

      {/* Totales */}
      <div className="trp-block">
        <div className="trp-block-label"><Shield size={9} /> Catálogo</div>
        <div className="trp-stat-row">
          <span className="trp-stat-lbl">Total equipos</span>
          <span className="trp-stat-val trp-val--accent">{teams.length}</span>
        </div>
        <div className="trp-stat-row">
          <span className="trp-stat-lbl">Títulos registrados</span>
          <span className="trp-stat-val trp-val--gold">{totalTitles}</span>
        </div>
      </div>

      {/* Stats por tipo y país */}
      <StatsByLegacy teams={teams} />
      <StatsByCountry teams={teams} />

      {/* Top 4 equipos */}
      {teams.length > 0 && (
        <div className="trp-block">
          <div className="trp-block-label"><Trophy size={9} /> Equipos</div>
          <div className="trp-teams-list">
            {loading
              ? <span className="trp-loading">Cargando...</span>
              : teams.slice(0, 5).map((t) => <TeamMini key={t.id} team={t} />)
            }
          </div>
        </div>
      )}

      {/* Footer: equipo más titulado */}
      {topTeam && topTeam.titles_count > 0 && (
        <div className="trp-footer">
          <div className="trp-footer-label">MÁS TÍTULOS</div>
          <div className="trp-footer-row">
            <div className="trp-footer-shield" style={{ background: `${topTeam.primary_color || "#5b4fd8"}22`, borderColor: topTeam.primary_color || "#5b4fd8" }}>
              {getHistoricalImageUrl(topTeam.image_path)
                ? <img src={getHistoricalImageUrl(topTeam.image_path)} alt={topTeam.name} />
                : <Shield size={14} color={topTeam.primary_color || "#5b4fd8"} />
              }
            </div>
            <div className="trp-footer-info">
              <span className="trp-footer-name">{topTeam.name}</span>
              <span className="trp-footer-meta">{topTeam.country}</span>
            </div>
            <span className="trp-footer-chip">
              <Trophy size={10} /> {topTeam.titles_count}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}