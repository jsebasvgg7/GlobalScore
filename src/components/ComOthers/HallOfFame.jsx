
import React, { useState, useEffect, useRef } from 'react';
import { Crown, Star, Trophy, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import '../../styles/StylesPages/HallOfFame.css';

/* ─── Avatar ─── */

function Avatar({ user, size = 80 }) {
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#60519b,#8b7fc7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: size * 0.38, flexShrink: 0,
    }}>
      {user?.name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

/* ─── Rank metadata ─── */
const RANK_META = [
  {
    gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D,#F59E0B)',
    glow: 'rgba(252,211,77,0.6)',
    label: '1er Lugar', medal: '🥇', ring: '#F59E0B',
  },
  {
    gradient: 'linear-gradient(135deg,#9CA3AF,#E5E7EB,#9CA3AF)',
    glow: 'rgba(229,231,235,0.5)',
    label: '2do Lugar', medal: '🥈', ring: '#9CA3AF',
  },
  {
    gradient: 'linear-gradient(135deg,#CD7F32,#F59E0B,#CD7F32)',
    glow: 'rgba(205,127,50,0.5)',
    label: '3er Lugar', medal: '🥉', ring: '#CD7F32',
  },
];

/* ─── Sparkle orbit dots around avatar ─── */
function SparkleOrbit() {
  return (
    <div className="hof-orbit" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="hof-orb-dot"
          style={{ '--a': `${i * 45}deg`, animationDelay: `${(i * 0.15).toFixed(2)}s` }}
        />
      ))}
    </div>
  );
}

/* ─── Background stars ─── */
function Stars() {
  const list = useRef(
    Array.from({ length: 52 }, () => ({
      l: `${(Math.random() * 100).toFixed(1)}%`,
      t: `${(Math.random() * 100).toFixed(1)}%`,
      d: `${(Math.random() * 4).toFixed(2)}s`,
      dur: `${(2.5 + Math.random() * 3).toFixed(2)}s`,
      sz: `${(1 + Math.random() * 2).toFixed(1)}px`,
    }))
  );
  return (
    <div className="hof-stars" aria-hidden="true">
      {list.current.map((s, i) => (
        <span
          key={i}
          className="hof-star"
          style={{ left: s.l, top: s.t, width: s.sz, height: s.sz, animationDelay: s.d, animationDuration: s.dur }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function HallOfFame({ champions = [], onSelectUser }) {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | exit-left | exit-right | enter
  const timerRef = useRef(null);
  const total = champions.length;

  /* Auto-advance every 6 s */
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setTimeout(() => triggerNav('right'), 6000);
    return () => clearTimeout(timerRef.current);
  }, [active, total]);

  function triggerNav(dir, target) {
    if (phase !== 'idle' || total <= 1) return;
    clearTimeout(timerRef.current);
    const next =
      target !== undefined
        ? target
        : dir === 'right'
        ? (active + 1) % total
        : (active - 1 + total) % total;
    setPhase(dir === 'right' ? 'exit-left' : 'exit-right');
    setTimeout(() => {
      setActive(next);
      setPhase('enter');
      setTimeout(() => setPhase('idle'), 420);
    }, 340);
  }

  const champ = champions[active] || null;
  const meta = RANK_META[Math.min(active, 2)];

  return (
    <>
      <div className="hof-root">
        <Stars />
        {/* ── Empty state ── */}
        {total === 0 ? (
          <div className="hof-empty">
            <Crown size={56} style={{ opacity: 0.25, color: '#F59E0B' }} />
            <p>Aún no hay campeones mensuales registrados</p>
          </div>
        ) : (
          <>
            {/* ── Carousel ── */}
            <div className="hof-stage">
              <button
                className="hof-nav"
                onClick={() => triggerNav('left')}
                disabled={phase !== 'idle' || total <= 1}
                aria-label="Anterior"
              >
                <ChevronLeft size={22} />
              </button>

              <div className={`hof-card-wrap hof-anim-${phase}`}>
                {champ && (
                  <div className="hof-card">
                    {/* glow blob */}
                    <div className="hof-glow" style={{ background: meta.glow }} />

                    {/* ribbon */}
                    <div className="hof-ribbon" style={{ background: meta.gradient }}>
                      <span className="hof-ribbon-medal">{meta.medal}</span>
                      <span className="hof-ribbon-label">{meta.label}</span>
                      <Trophy size={12} style={{ opacity: 0.75 }} />
                    </div>

                    {/* avatar with spinning ring + sparkles */}
                    <button className="hof-av-btn" onClick={() => onSelectUser?.(champ.id)} title="Ver perfil">
                      <div className="hof-av-ring" style={{ '--ring': meta.ring }}>
                        <div className="hof-av-shell">
                          <Avatar user={champ} size={116} />
                        </div>
                      </div>
                      <SparkleOrbit />
                    </button>

                    {/* name */}
                    <h2 className="hof-name">{champ.name}</h2>

                    {/* crown row */}
                    <div className="hof-crowns">
                      {Array.from({ length: Math.min(champ.monthly_championships, 10) }).map((_, i) => (
                        <Crown
                          key={i}
                          size={17}
                          className="hof-crown-mini"
                          style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
                        />
                      ))}
                      {champ.monthly_championships > 10 && (
                        <span className="hof-crowns-extra">+{champ.monthly_championships - 10}</span>
                      )}
                    </div>

                    {/* stats */}
                    <div className="hof-stats">
                      <div className="hof-stat">
                        <Crown size={15} style={{ color: '#F59E0B' }} />
                        <span className="hof-sv">{champ.monthly_championships}</span>
                        <span className="hof-sl">Coronas</span>
                      </div>
                      <div className="hof-divider" />
                      <div className="hof-stat">
                        <Star size={15} style={{ color: '#8b7fc7' }} />
                        <span className="hof-sv">{champ.championship_points}</span>
                        <span className="hof-sl">Mejor mes</span>
                      </div>
                      <div className="hof-divider" />
                      <div className="hof-stat">
                        <Sparkles size={15} style={{ color: '#10B981' }} />
                        <span className="hof-sv hof-sv-sm">{champ.championship_month_year || '—'}</span>
                        <span className="hof-sl">Último título</span>
                      </div>
                    </div>

                    <span className="hof-counter">#{active + 1} de {total}</span>
                  </div>
                )}
              </div>

              <button
                className="hof-nav"
                onClick={() => triggerNav('right')}
                disabled={phase !== 'idle' || total <= 1}
                aria-label="Siguiente"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* ── Dot indicators ── */}
            <div className="hof-dots" role="tablist">
              {champions.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  className={`hof-dot ${i === active ? 'hof-dot-on' : ''}`}
                  onClick={() => triggerNav(i > active ? 'right' : 'left', i)}
                  title={`Campeón #${i + 1}`}
                />
              ))}
            </div>

            {/* ── Thumbnail strip ── */}
            {total > 1 && (
              <div className="hof-strip">
                {champions.slice(0, 8).map((c, i) => (
                  <button
                    key={c.id}
                    className={`hof-thumb ${i === active ? 'hof-thumb-on' : ''}`}
                    onClick={() => triggerNav(i > active ? 'right' : 'left', i)}
                    title={c.name}
                  >
                    <Avatar user={c} size={38} />
                    {i === 0 && <Crown size={11} className="hof-thumb-crown" />}
                  </button>
                ))}
                {total > 8 && <div className="hof-thumb-more">+{total - 8}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
