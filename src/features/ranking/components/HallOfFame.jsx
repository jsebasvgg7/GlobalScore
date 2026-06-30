import React, { useState, useRef, useEffect } from 'react';
import { Crown, Trophy, ChevronLeft, ChevronRight, Star, Zap } from 'lucide-react';
import '../styles/HallOfFame.css';

const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

/* ── Config por tipo de salón ── */
const TYPE_CONFIG = {
  monthly: {
    Icon: Crown,
    accentColor: '#c9a227',
    subtitle: 'Campeones Mensuales',
    unitLabel: 'coronas',
    periodLabel: 'Título',
  },
  global: {
    Icon: Trophy,
    accentColor: '#0ea5a8',
    subtitle: 'Campeones del Ranking Global',
    unitLabel: 'trofeos',
    periodLabel: 'Edición',
  },
};

/* ── Avatar ── */
function Avatar({ user, size = 80, onClick }) {
  const initials = (user?.name || 'U')[0].toUpperCase();
  const cls = `hof-av${onClick ? ' hof-av--click' : ''}`;

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className={cls}
        style={{ width: size, height: size }}
        onClick={onClick}
      />
    );
  }
  return (
    <div
      className={`${cls} hof-av--ph`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      onClick={onClick}
    >
      {initials}
    </div>
  );
}

/* ── Metadatos por posición (rank), independiente del tipo ── */
const META = [
  { label: 'ORO', color: '#c9a227', bg: 'rgba(201,162,39,0.08)', border: '#c9a227' },
  { label: 'PLATA', color: '#8a8a8a', bg: 'rgba(138,138,138,0.07)', border: '#8a8a8a' },
  { label: 'BRONCE', color: '#a0652a', bg: 'rgba(160,101,42,0.08)', border: '#a0652a' },
];

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function HallOfFame({ champions = [], onSelectUser, type = 'monthly' }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(null); // 'left' | 'right' | null
  const timerRef = useRef(null);
  const total = champions.length;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.monthly;
  const TypeIcon = cfg.Icon;

  /* Reiniciar el carrusel al cambiar de tipo (mensual/global) */
  useEffect(() => {
    setActive(0);
  }, [type]);

  /* Auto-advance 6s */
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setTimeout(() => nav('right'), 6000);
    return () => clearTimeout(timerRef.current);
  }, [active, total]);

  function nav(direction, target) {
    if (total <= 1) return;
    clearTimeout(timerRef.current);

    const next =
      target !== undefined
        ? target
        : direction === 'right'
          ? (active + 1) % total
          : (active - 1 + total) % total;

    setDir(direction);
    setTimeout(() => {
      setActive(next);
      setDir(null);
    }, 240);
  }

  const champ = champions[active] || null;
  const meta = META[Math.min(active, 2)];

  /* ── Top 3 lateral ── */
  const top3 = champions.slice(0, 3);

  return (
    <div className="hof-root">

      {/* ════ HEADER ════ */}
      <div className="hof-header">
        <div className="hof-header-line hof-header-line--left" />
        <TypeIcon size={14} className="hof-header-crown" style={{ color: cfg.accentColor }} />
        <span className="hof-header-title" style={{ color: cfg.accentColor }}>Salón de la Fama</span>
        <div className="hof-header-line hof-header-line--right" />
      </div>

      <div className="hof-sub">{cfg.subtitle} · {total} registrado{total !== 1 ? 's' : ''}</div>

      {/* ════ EMPTY ════ */}
      {total === 0 ? (
        <div className="hof-empty">
          <TypeIcon size={48} className="hof-empty-icon" />
          <p>Aún no hay campeones registrados</p>
        </div>
      ) : (
        <div className="hof-body">

          {/* ── Carrusel principal ── */}
          <div className="hof-carousel-wrap">

            <div className={`hof-card-wrap${dir ? ` hof-card-wrap--exit-${dir}` : ''}`}>
              {champ && (
                <div
                  className="hof-card"
                  style={{
                    '--hof-color': meta.color,
                    '--hof-bg': meta.bg,
                    borderTopColor: meta.border,
                  }}
                >
                  {/* Barra superior de color */}
                  <div className="hof-card-stripe" style={{ background: meta.color }} />

                  {/* Medalla + número */}
                  <div className="hof-card-top">
                    <span className="hof-card-medal" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="hof-card-pos" style={{ background: meta.color }}>
                      #{active + 1}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="hof-card-av-wrap">
                    <div className="hof-card-av-ring" style={{ background: `linear-gradient(135deg, ${meta.color}88, ${meta.color})` }}>
                      <Avatar
                        user={champ}
                        size={100}
                        onClick={() => onSelectUser?.(champ.id)}
                      />
                    </div>
                  </div>

                  {/* Nombre */}
                  <h2 className="hof-card-name">{champ.name}</h2>

                  {/* Íconos de campeonatos (coronas o trofeos) */}
                  <div className="hof-card-crowns">
                    {Array.from({ length: Math.min(champ.championships, 8) }).map((_, i) => (
                      <TypeIcon
                        key={i}
                        size={16}
                        className="hof-crown-mini"
                        style={{ color: meta.color, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                    {champ.championships > 8 && (
                      <span className="hof-crowns-extra" style={{ color: meta.color }}>
                        +{champ.championships - 8}
                      </span>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="hof-card-stats">
                    <div className="hof-card-stat">
                      <TypeIcon size={13} style={{ color: meta.color }} />
                      <span className="hof-stat-val" style={{ color: meta.color }}>
                        {champ.championships}
                      </span>
                      <span className="hof-stat-lbl">{cfg.unitLabel}</span>
                    </div>
                    <div className="hof-card-stat-sep" />
                    <div className="hof-card-stat">
                      <Zap size={13} style={{ color: '#5b4fd8' }} />
                      <span className="hof-stat-val">{fmt(champ.points)}</span>
                      <span className="hof-stat-lbl">Max pts</span>
                    </div>
                    <div className="hof-card-stat-sep" />
                    <div className="hof-card-stat">
                      <Star size={13} style={{ color: '#1D9E75' }} />
                      <span className="hof-stat-val hof-stat-val--sm">
                        {champ.period || '—'}
                      </span>
                      <span className="hof-stat-lbl">{cfg.periodLabel}</span>
                    </div>
                  </div>

                  <span className="hof-card-counter">
                    {active + 1} / {total}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* ── Dots ── */}
          <div className="hof-dots">
            {champions.map((_, i) => (
              <button
                key={i}
                className={`hof-dot${i === active ? ' hof-dot--active' : ''}`}
                onClick={() => nav(i > active ? 'right' : 'left', i)}
                aria-label={`Campeón ${i + 1}`}
              />
            ))}
          </div>

          {/* ── Top 3 lista lateral ── */}
          {top3.length > 0 && (
            <div className="hof-top3">
              <div className="hof-top3-label">Top campeones</div>
              {top3.map((u, i) => {
                const m = META[i];
                return (
                  <div
                    key={u.id}
                    className={`hof-top3-row${i === active ? ' hof-top3-row--active' : ''}`}
                    onClick={() => nav(i > active ? 'right' : 'left', i)}
                    style={{ borderLeftColor: i === active ? m.color : 'transparent' }}
                  >
                    <span className="hof-top3-badge" style={{ background: m.color }}>
                      {i + 1}
                    </span>
                    <Avatar user={u} size={32} />
                    <div className="hof-top3-info">
                      <span className="hof-top3-name">{u.name}</span>
                      <span className="hof-top3-crowns" style={{ color: m.color }}>
                        <TypeIcon size={10} /> {u.championships} {cfg.unitLabel}
                      </span>
                    </div>
                    <span className="hof-top3-pts">{fmt(u.points)}</span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}