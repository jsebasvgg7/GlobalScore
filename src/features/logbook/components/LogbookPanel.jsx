import { ChevronRight } from 'lucide-react';
import { useLogbookSummary } from '../hooks/useLogbookSummary';
import '../styles/LogbookPanel.css';

function formatDiff(value) {
  return value > 0 ? `+${value}` : String(value);
}

export default function LogbookPanel({ currentUser, onNavigate }) {
  const { loading, error, reload, team, topScorer } = useLogbookSummary(currentUser);

  if (loading) {
    return (
      <div className="mob2-bento-grid">
        <div className="mob2-fw-card mob2-bento-wide lb-panel__status" role="status">
          Cargando libreta…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mob2-bento-grid">
        <div className="mob2-fw-card mob2-bento-wide lb-panel__empty">
          <span className="mob2-sm-tag">TU LIBRETA</span>
          <p className="lb-panel__empty-text">No se pudo cargar tu libreta.</p>
          <button type="button" className="mob2-alb-cta lb-panel__cta" onClick={reload}>
            <span>Reintentar</span>
            <ChevronRight size={14} className="mob2-alb-cta-arrow" />
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mob2-bento-grid">
        <div className="mob2-fw-card mob2-bento-wide lb-panel__empty">
          <span className="mob2-sm-tag">TU LIBRETA</span>
          <p className="lb-panel__empty-text">Aún no tienes equipos. Lleva tus partidos y goles en un solo lugar.</p>
          <button type="button" className="mob2-alb-cta lb-panel__cta" onClick={onNavigate}>
            <span>Crear mi primer equipo</span>
            <ChevronRight size={14} className="mob2-alb-cta-arrow" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mob2-bento-grid">
      <div className="mob2-fw-card mob2-fw-card--hero mob2-bento-hero">
        <div className="mob2-hero-body">
          <span className="mob2-hero-tag">TU LIBRETA · GA</span>
          <div className="mob2-bento-hero-val">{team.goalsFor}</div>
          <span className="mob2-hero-meta lb-panel__meta">
            {team.name} · {team.game}
          </span>
        </div>
      </div>
      <div className="mob2-fw-card mob2-fw-card--small mob2-bento-small">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag">JUG</span>
          <span className="mob2-sm-title mob2-sm-title--lg">{team.played}</span>
        </div>
      </div>
      <div className="mob2-fw-card mob2-fw-card--small mob2-bento-small">
        <div className="mob2-sm-body">
          <span className="mob2-sm-tag mob2-sm-tag--green">+/-</span>
          <span className="mob2-sm-title mob2-sm-title--lg mob2-sm-title--green">
            {formatDiff(team.goalDiff)}
          </span>
        </div>
      </div>
      <div className="mob2-fw-card mob2-bento-wide">
        <div className="mob2-sm-body mob2-sm-body--row">
          <span className="mob2-sm-tag">MÁX. GOLEADOR</span>
          <span className="mob2-sm-title lb-panel__scorer">
            {topScorer ? `${topScorer.name} · ${topScorer.goals}` : '—'}
          </span>
        </div>
      </div>
      <button type="button" className="mob2-alb-cta lb-panel__cta" onClick={onNavigate}>
        <span>Abrir Libreta</span>
        <ChevronRight size={14} className="mob2-alb-cta-arrow" />
      </button>
    </div>
  );
}
