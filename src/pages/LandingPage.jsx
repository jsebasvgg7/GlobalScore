import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Target, Flame, Star, Crown, TrendingUp,
  ChevronRight, Zap, Award, Users, BarChart3, Shield
} from "lucide-react";
import "../styles/LandingPage.css";

// ── Datos de ejemplo para las previews ──────────────────────────
const SAMPLE_MATCHES = [
  { home: "Real Madrid", away: "Barcelona", league: "La Liga", time: "21:00", homePred: 2, awayPred: 1, flag: "🇪🇸" },
  { home: "Man City", away: "Arsenal", league: "Premier League", time: "20:45", homePred: 1, awayPred: 1, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { home: "Bayern", away: "Dortmund", league: "Bundesliga", time: "18:30", homePred: 3, awayPred: 0, flag: "🇩🇪" },
];

const SAMPLE_RANKING = [
  { name: "Luis Vega", pts: 2840, correct: 142, avatar: "LV", badge: "🥇" },
  { name: "Sebas Vega", pts: 2610, correct: 131, avatar: "SV", badge: "🥈" },
  { name: "Brainy BH", pts: 2480, correct: 124, avatar: "BB", badge: "🥉" },
  { name: "Francisco D.", pts: 2190, correct: 109, avatar: "FD", badge: "" },
  { name: "Bryan T.", pts: 1970, correct: 98, avatar: "BT", badge: "" },
];

const HALL_USERS = [
  { name: "Luis Vega", crowns: 7, pts: 2840, avatar: "LV", last: "Ene 2025" },
  { name: "Sebas Vega", crowns: 5, pts: 2610, avatar: "SV", last: "Feb 2025" },
  { name: "Brainy BH", crowns: 3, pts: 2480, avatar: "BB", last: "Mar 2025" },
];

const FEATURES = [
  {
    icon: Target,
    title: "Predice Partidos",
    desc: "Pronostica marcadores exactos y gana puntos. 5 pts por resultado exacto, 3 pts por resultado correcto.",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
  },
  {
    icon: Trophy,
    title: "Compite en Rankings",
    desc: "Rankings global, mensual y Salón de la Fama. Demuestra quién sabe más de fútbol.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    icon: Flame,
    title: "Sistema de Rachas",
    desc: "Mantén tu racha de aciertos y desbloquea logros exclusivos. ¡La constancia tiene recompensa!",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
  },
  {
    icon: Crown,
    title: "Títulos y Logros",
    desc: "De Novato a Leyenda. Desbloquea títulos únicos y exhibe tus logros en tu perfil.",
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
  },
  {
    icon: BarChart3,
    title: "Estadísticas Avanzadas",
    desc: "Analiza tu rendimiento por liga, día de la semana y distribución de puntos.",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
  },
  {
    icon: Users,
    title: "Comunidad",
    desc: "Compite con amigos. Ve sus perfiles, estadísticas y predicciones en tiempo real.",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
  },
];

// ── Hook para animación de contadores ───────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Hook para detectar si elemento es visible ───────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView(0.3);
  const users  = useCounter(20, 1800, statsInView);
  const preds  = useCounter(500, 2000, statsInView);
  const points = useCounter(3120, 2200, statsInView);

  return (
    <div className="landing-root">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="landing-hero">
        {/* Orbes decorativos */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        {/* Grid de puntos */}
        <div className="hero-grid" />

        <nav className="landing-nav">
          <div className="landing-brand">
            <div className="brand-icon"><Trophy size={18} /></div>
            <span className="brand-name">Globalscore</span>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={13} />
            <span>Plataforma de predicciones #1</span>
          </div>

          <h1 className="hero-title">
            <span className="title-line">Predice.</span>
            <span className="title-line accent-line">Compite.</span>
            <span className="title-line">Domina.</span>
          </h1>

          <p className="hero-subtitle">
            Demuestra que sabes más de fútbol que nadie. Predice partidos,
            ligas y premios. Sube en el ranking y conviértete en leyenda.
          </p>

          <div className="hero-cta">
            <button className="cta-main" onClick={() => navigate("/register")}>
              <span>Empezar gratis</span>
              <ChevronRight size={20} />
            </button>
            <button className="cta-secondary" onClick={() => navigate("/login")}>
              Ya tengo cuenta
            </button>
          </div>

          {/* Mini stats en hero */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hs-value">+20</span>
              <span className="hs-label">Usuarios activos</span>
            </div>
            <div className="hs-divider" />
            <div className="hero-stat">
              <span className="hs-value">+500</span>
              <span className="hs-label">Predicciones hechas</span>
            </div>
            <div className="hs-divider" />
            <div className="hero-stat">
              <span className="hs-value">Mundial 2026</span>
              <span className="hs-label">Proximamente</span>
            </div>
          </div>
        </div>

        {/* Tarjetas flotantes decorativas */}
        <div className="hero-cards">
          <div className="floating-card fc-1">
            <div className="fc-header">
              <span className="fc-league">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</span>
              <span className="fc-badge exact">+5 pts</span>
            </div>
            <div className="fc-match">
              <span className="fc-team">Man City</span>
              <div className="fc-score">
                <span>2</span>
                <span className="fc-sep">-</span>
                <span>1</span>
              </div>
              <span className="fc-team">Arsenal</span>
            </div>
          </div>

          <div className="floating-card fc-2">
            <div className="fc-top">
              <Crown size={16} className="fc-crown" />
              <span>Racha actual</span>
            </div>
            <div className="fc-streak">8🔥</div>
            <div className="fc-streak-label">predicciones correctas</div>
          </div>

          <div className="floating-card fc-3">
            <div className="fc-rank-title">🏆 Tu posición</div>
            <div className="fc-rank-number">#3</div>
            <div className="fc-rank-pts">2,480 puntos</div>
          </div>
        </div>
      </section>

      {/* ── STATS ANIMADAS ───────────────────────────────────── */}
      <section className="landing-stats" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-block">
            <div className="sb-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6" }}>
              <Users size={22} />
            </div>
            <div className="sb-value">{users.toLocaleString()}+</div>
            <div className="sb-label">Jugadores registrados</div>
          </div>
          <div className="stat-block">
            <div className="sb-icon" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
              <Target size={22} />
            </div>
            <div className="sb-value">{preds.toLocaleString()}+</div>
            <div className="sb-label">Predicciones realizadas</div>
          </div>
          <div className="stat-block">
            <div className="sb-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
              <Zap size={22} />
            </div>
            <div className="sb-value">{points.toLocaleString()}+</div>
            <div className="sb-label">Puntos repartidos</div>
          </div>
          <div className="stat-block">
            <div className="sb-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
              <Shield size={22} />
            </div>
            <div className="sb-value">Mundial</div>
            <div className="sb-label">2026 proximanente</div>
          </div>
        </div>
      </section>

      {/* ── VISTA PREVIA DE LA APP ───────────────────────────── */}
      <section className="landing-preview">
        <div className="section-header">
          <div className="section-badge">
            <Star size={13} />
            <span>Vista previa</span>
          </div>
          <h2 className="section-title">Todo en un solo lugar</h2>
          <p className="section-sub">
            Partidos, ligas, rankings y más. Una experiencia completa
            para el fanático del fútbol.
          </p>
        </div>

        <div className="preview-wrapper">
          {/* Panel izquierdo: Partidos */}
          <div className="preview-panel panel-matches">
            <div className="panel-topbar">
              <span className="panel-dot red" />
              <span className="panel-dot yellow" />
              <span className="panel-dot green" />
              <span className="panel-label">Predicciones del día</span>
            </div>
            <div className="panel-tabs">
              <span className="ptab active">⚽ Partidos</span>
              <span className="ptab">🏆 Ligas</span>
              <span className="ptab">🥇 Premios</span>
            </div>
            <div className="match-list">
              {SAMPLE_MATCHES.map((m, i) => (
                <div className="preview-match" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="pm-league">{m.flag} {m.league} · {m.time}</div>
                  <div className="pm-body">
                    <span className="pm-team home">{m.home}</span>
                    <div className="pm-inputs">
                      <div className="pm-score filled">{m.homePred}</div>
                      <span className="pm-vs">vs</span>
                      <div className="pm-score filled">{m.awayPred}</div>
                    </div>
                    <span className="pm-team away">{m.away}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho: Ranking */}
          <div className="preview-panel panel-ranking">
            <div className="panel-topbar">
              <span className="panel-dot red" />
              <span className="panel-dot yellow" />
              <span className="panel-dot green" />
              <span className="panel-label">Ranking Global</span>
            </div>
            <div className="rank-list">
              {SAMPLE_RANKING.map((u, i) => (
                <div className={`rank-row ${i < 3 ? "top" : ""}`} key={i}>
                  <span className="rr-pos">{u.badge || `#${i + 1}`}</span>
                  <div className="rr-avatar">{u.avatar}</div>
                  <div className="rr-info">
                    <span className="rr-name">{u.name}</span>
                    <span className="rr-correct">{u.correct} aciertos</span>
                  </div>
                  <span className="rr-pts">{u.pts.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="landing-features">
        <div className="section-header">
          <div className="section-badge">
            <Zap size={13} />
            <span>Características</span>
          </div>
          <h2 className="section-title">Todo lo que necesitas</h2>
          <p className="section-sub">
            Más que un juego de predicciones. Una experiencia completa
            con gamificación, estadísticas y competencia real.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i} style={{ "--fc-color": f.color, "--fc-bg": f.bg, animationDelay: `${i * 0.08}s` }}>
              <div className="fc-icon-wrap">
                <f.icon size={24} />
              </div>
              <h3 className="fc-title">{f.title}</h3>
              <p className="fc-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HALL OF FAME PREVIEW ─────────────────────────────── */}
      <section className="landing-hof">
        <div className="hof-bg-orb" />
        <div className="section-header">
          <div className="section-badge gold">
            <Crown size={13} />
            <span>Salón de la Fama</span>
          </div>
          <h2 className="section-title">Las leyendas de GlobalScore</h2>
          <p className="section-sub">
            Los campeones mensuales más consistentes. ¿Podrás entrar al
            salón de la fama?
          </p>
        </div>

        <div className="hof-podium">
          {/* 2do lugar */}
          <div className="hof-card silver">
            <div className="hof-pos">2</div>
            <div className="hof-avatar">{HALL_USERS[1].avatar}</div>
            <div className="hof-name">{HALL_USERS[1].name}</div>
            <div className="hof-crowns">
              <Crown size={14} />
              <span>{HALL_USERS[1].crowns} coronas</span>
            </div>
            <div className="hof-pts">{HALL_USERS[1].pts.toLocaleString()} pts</div>
          </div>

          {/* 1er lugar */}
          <div className="hof-card gold first">
            <div className="hof-glow" />
            <div className="hof-pos">👑</div>
            <div className="hof-avatar large">{HALL_USERS[0].avatar}</div>
            <div className="hof-name">{HALL_USERS[0].name}</div>
            <div className="hof-crowns gold-crowns">
              <Crown size={14} />
              <span>{HALL_USERS[0].crowns} coronas</span>
            </div>
            <div className="hof-pts">{HALL_USERS[0].pts.toLocaleString()} pts</div>
          </div>

          {/* 3er lugar */}
          <div className="hof-card bronze">
            <div className="hof-pos">3</div>
            <div className="hof-avatar">{HALL_USERS[2].avatar}</div>
            <div className="hof-name">{HALL_USERS[2].name}</div>
            <div className="hof-crowns">
              <Crown size={14} />
              <span>{HALL_USERS[2].crowns} coronas</span>
            </div>
            <div className="hof-pts">{HALL_USERS[2].pts.toLocaleString()} pts</div>
          </div>
        </div>

        {/* Lista debajo del podio */}
        <div className="hof-list-preview">
          {HALL_USERS.map((u, i) => (
            <div className="hof-list-row" key={i}>
              <span className="hlr-pos">0{i + 1}</span>
              <div className="hlr-av">{u.avatar}</div>
              <div className="hlr-info">
                <span className="hlr-name">{u.name}</span>
                <span className="hlr-last">Último título: {u.last}</span>
              </div>
              <div className="hlr-crowns">
                <Crown size={14} />
                <span>{u.crowns}</span>
              </div>
              <span className="hlr-pts">{u.pts.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="landing-cta-final">
        <div className="ctaf-orb-1" />
        <div className="ctaf-orb-2" />
        <div className="ctaf-content">
          <Trophy size={48} className="ctaf-icon" />
          <h2 className="ctaf-title">¿Listo para demostrar<br />que sabes de fútbol?</h2>
          <p className="ctaf-sub">
            Únete a más jugadores y empieza a competir hoy mismo.
            Es gratis.
          </p>
          <div className="ctaf-actions">
            <button className="cta-main large" onClick={() => navigate("/register")}>
              Crear cuenta gratis
              <ChevronRight size={20} />
            </button>
            <button className="cta-secondary" onClick={() => navigate("/login")}>
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="brand-icon small"><Trophy size={14} /></div>
          <span>Globalscore</span>
        </div>
        <p className="footer-copy"> Hermanos Vega · 2025</p>
        <div className="footer-links">
          <button onClick={() => navigate("/login")}>Iniciar sesión</button>
          <span>·</span>
          <button onClick={() => navigate("/register")}>Registrarse</button>
        </div>
      </footer>
    </div>
  );
}