import React, { useState, useEffect, useRef } from "react";
import { X, Crown, Flame, Zap, Target, Star, Lock, ChevronRight } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import "../../styles/StylesProfile/MobileUserProfile.css";

/* ── helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString("es-ES");
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

/* ── Avatar ── */
function MupAvatar({ user, size = 56 }) {
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className="mup2-avatar"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="mup2-avatar mup2-avatar--ph"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {(user?.name || "?")[0].toUpperCase()}
    </div>
  );
}

/* ── Stat block ── */
function StatBlock({ val, lbl, accent }) {
  return (
    <div className="mup2-stat-block" style={accent ? { "--sb-accent": accent } : {}}>
      <span className="mup2-stat-val">{val}</span>
      <span className="mup2-stat-lbl">{lbl}</span>
    </div>
  );
}

/* ── Tab button ── */
function TabBtn({ id, active, onClick, children }) {
  return (
    <button
      className={`mup2-tab${active ? " mup2-tab--active" : ""}`}
      onClick={() => onClick(id)}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════
   PANEL — STATS
════════════════════════════════════════════ */
function PanelStats({ user }) {
  const acc = pct(user.correct || 0, user.predictions || 0);
  const mAcc = pct(user.monthly_correct || 0, user.monthly_predictions || 0);

  const rows = [
    { lbl: "PREDICCIONES", val: fmt(user.predictions || 0), accent: "var(--mup2-accent)" },
    { lbl: "ACIERTOS",     val: fmt(user.correct     || 0), accent: "#34d399" },
    { lbl: "PRECISIÓN",    val: `${acc}%`,                  accent: "#f59e0b" },
    { lbl: "PUNTOS TOTAL", val: fmt(user.points       || 0), accent: "var(--mup2-accent)" },
    { lbl: "PUNTOS MES",   val: fmt(user.monthly_points || 0), accent: "#a78bfa" },
    { lbl: "PRED. MES",    val: fmt(user.monthly_predictions || 0), accent: "#34d399" },
    { lbl: "ACIERTOS MES", val: fmt(user.monthly_correct || 0), accent: "#f59e0b" },
    { lbl: "PREC. MES",    val: `${mAcc}%`,                accent: "#fb923c" },
  ];

  return (
    <div className="mup2-panel">
      
      {/* Racha */}
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "#ef4444" }} />
        <span className="mup2-sec-lbl">RACHA</span>
      </div>
      <div className="mup2-streaks">
        <div className="mup2-streak-cell">
          <Flame size={18} color="#ef4444" />
          <span className="mup2-streak-num" style={{ color: "#ef4444" }}>
            {user.current_streak || 0}
          </span>
          <span className="mup2-streak-tag">ACTUAL</span>
        </div>
        <div className="mup2-streak-sep" />
        <div className="mup2-streak-cell">
          <Zap size={18} color="#f59e0b" />
          <span className="mup2-streak-num" style={{ color: "#f59e0b" }}>
            {user.best_streak || 0}
          </span>
          <span className="mup2-streak-tag">MEJOR</span>
        </div>
      </div>
      {/* Nivel */}
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "#a78bfa" }} />
        <span className="mup2-sec-lbl">NIVEL</span>
      </div>
      <div className="mup2-level-block">
        <div className="mup2-level-header">
          <span className="mup2-level-badge">NV {user.level || 1}</span>
          <span className="mup2-level-pts">{fmt(user.points || 0)} pts</span>
        </div>
        <div className="mup2-level-track">
          <div
            className="mup2-level-fill"
            style={{ width: `${Math.min(100, ((user.points || 0) % 500) / 5)}%` }}
          />
        </div>
        <span className="mup2-level-sub">
          {500 - ((user.points || 0) % 500)} pts para nivel {(user.level || 1) + 1}
        </span>
      </div>

      {/* Grid stats */}
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "var(--mup2-accent)" }} />
        <span className="mup2-sec-lbl">ESTADÍSTICAS</span>
      </div>
      <div className="mup2-stats-grid">
        {rows.map((r) => (
          <div
            key={r.lbl}
            className="mup2-stat-row"
            style={{ "--sr-accent": r.accent }}
          >
            <span className="mup2-stat-row-lbl">{r.lbl}</span>
            <span className="mup2-stat-row-val">{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PANEL — CAMPEONATOS
════════════════════════════════════════════ */
function PanelChampions({ userId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("monthly_championship_history")
        .select("*")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });
      setHistory(data || []);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <div className="mup2-panel">
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "#c9a227" }} />
        <span className="mup2-sec-lbl">CORONAS</span>
        <span className="mup2-sec-extra" style={{ color: "#c9a227" }}>
          {history.length}
        </span>
      </div>

      {loading ? (
        <div className="mup2-loading-row">
          <span className="mup2-loading-dot" />
          <span className="mup2-loading-dot" style={{ animationDelay: "0.15s" }} />
          <span className="mup2-loading-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      ) : history.length === 0 ? (
        <div className="mup2-empty">
          <Crown size={32} color="var(--mup2-border)" />
          <span>Sin campeonatos aún</span>
        </div>
      ) : (
        <div className="mup2-crown-list">
          {history.map((h, i) => (
            <div key={i} className="mup2-crown-row">
              <div className="mup2-crown-icon">
                <Crown size={14} color="#c9a227" />
                <span className="mup2-crown-rank">#{i + 1}</span>
              </div>
              <div className="mup2-crown-info">
                <span className="mup2-crown-month">{h.month_year || "—"}</span>
                <span className="mup2-crown-pts">+{fmt(h.points)} pts</span>
              </div>
              <span className="mup2-crown-badge">CAMPEÓN</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   PANEL — LOGROS
════════════════════════════════════════════ */
const ACHIEVEMENTS_DEFS = [
  { id: "first_pred",    emoji: "🎯", name: "PRIMER DISPARO",  desc: "Primera predicción",          req: (u) => (u.predictions || 0) >= 1 },
  { id: "ten_preds",     emoji: "🔟", name: "DIEZ RONDAS",     desc: "10 predicciones",             req: (u) => (u.predictions || 0) >= 10 },
  { id: "fifty_preds",   emoji: "⚡", name: "CINCUENTA",       desc: "50 predicciones",             req: (u) => (u.predictions || 0) >= 50 },
  { id: "first_correct", emoji: "✅", name: "ACIERTO",         desc: "Primera predicción correcta", req: (u) => (u.correct || 0) >= 1 },
  { id: "ten_correct",   emoji: "🏹", name: "ARQUERO",         desc: "10 aciertos",                 req: (u) => (u.correct || 0) >= 10 },
  { id: "streak_3",      emoji: "🔥", name: "EN LLAMAS",       desc: "Racha de 3",                  req: (u) => (u.best_streak || 0) >= 3 },
  { id: "streak_7",      emoji: "💥", name: "IMPARABLE",       desc: "Racha de 7",                  req: (u) => (u.best_streak || 0) >= 7 },
  { id: "accuracy_70",   emoji: "🎖", name: "FRANCOTIRADOR",   desc: "70% precisión",               req: (u) => pct(u.correct, u.predictions) >= 70 },
  { id: "pts_100",       emoji: "💯", name: "CENTURIA",        desc: "100 puntos",                  req: (u) => (u.points || 0) >= 100 },
  { id: "pts_500",       emoji: "🏆", name: "MAESTRO",         desc: "500 puntos",                  req: (u) => (u.points || 0) >= 500 },
  { id: "champion",      emoji: "👑", name: "REY",             desc: "Campeón mensual",             req: (u) => (u.monthly_championships || 0) >= 1 },
  { id: "triple_crown",  emoji: "🌟", name: "TRIPLE CORONA",   desc: "3 campeonatos",               req: (u) => (u.monthly_championships || 0) >= 3 },
];

function PanelAchievements({ user }) {
  const unlocked = ACHIEVEMENTS_DEFS.filter((a) => a.req(user));
  const locked   = ACHIEVEMENTS_DEFS.filter((a) => !a.req(user));

  return (
    <div className="mup2-panel">
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "#34d399" }} />
        <span className="mup2-sec-lbl">DESBLOQUEADOS</span>
        <span className="mup2-sec-extra" style={{ color: "#34d399" }}>
          {unlocked.length}/{ACHIEVEMENTS_DEFS.length}
        </span>
      </div>

      <div className="mup2-ach-grid">
        {unlocked.map((a) => (
          <div key={a.id} className="mup2-ach-card mup2-ach-card--on">
            <span className="mup2-ach-emoji">{a.emoji}</span>
            <span className="mup2-ach-name">{a.name}</span>
            <span className="mup2-ach-desc">{a.desc}</span>
          </div>
        ))}
      </div>

      {locked.length > 0 && (
        <>
          <div className="mup2-sec-hdr" style={{ marginTop: 8 }}>
            <div className="mup2-sec-line" style={{ background: "var(--mup2-border)" }} />
            <span className="mup2-sec-lbl" style={{ opacity: 0.5 }}>BLOQUEADOS</span>
          </div>
          <div className="mup2-ach-grid">
            {locked.map((a) => (
              <div key={a.id} className="mup2-ach-card mup2-ach-card--off">
                <Lock size={16} style={{ opacity: 0.3, flexShrink: 0 }} />
                <span className="mup2-ach-name" style={{ opacity: 0.35 }}>{a.name}</span>
                <span className="mup2-ach-desc" style={{ opacity: 0.3 }}>{a.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function MobileUserProfile({ userId, onClose }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("stats");
  const [rank,    setRank]    = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.from("users").select("*").eq("id", userId).single();
      if (u) {
        setUser(u);
        const { data: all } = await supabase
          .from("users").select("id, points").order("points", { ascending: false });
        if (all) {
          const pos = all.findIndex((x) => x.id === userId) + 1;
          setRank({ pos, total: all.length });
        }
      }
      setLoading(false);
    })();
  }, [userId]);

  // scroll to top on tab change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  const acc = user ? pct(user.correct || 0, user.predictions || 0) : 0;

  return (
    <div className="mup2-overlay" onClick={onClose}>
      <div className="mup2-window" onClick={(e) => e.stopPropagation()}>

        {/* ═══ FIXED HEADER ═══ */}
        <div className="mup2-fixed-header">

          {/* Top bar */}
          <div className="mup2-topbar">
            <div className="mup2-topbar-id">
              <span className="mup2-topbar-tag">USER_PROFILE</span>
              {rank && (
                <span className="mup2-topbar-rank">#{rank.pos}</span>
              )}
            </div>
            <button className="mup2-close-btn" onClick={onClose}>
              <X size={14} />
            </button>
          </div>

          {/* Hero */}
          {loading ? (
            <div className="mup2-hero-skeleton">
              <div className="mup2-sk mup2-sk--banner" />
              <div className="mup2-hero-skeleton-row">
                <div className="mup2-sk mup2-sk--circle" style={{ width: 56, height: 56 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="mup2-sk" style={{ width: "55%", height: 14 }} />
                  <div className="mup2-sk" style={{ width: "35%", height: 9 }} />
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="mup2-hero">
              {/* Banner */}
              <div className="mup2-hero-banner">
                {user.equipped_banner_url ? (
                  <>
                    <img src={user.equipped_banner_url} alt="Banner" className="mup2-hero-banner-img" />
                    <div className="mup2-hero-banner-overlay" />
                  </>
                ) : (
                  <>
                    <div className="mup2-hero-banner-grid" />
                    <div className="mup2-hero-banner-orb mup2-hero-banner-orb--1" />
                    <div className="mup2-hero-banner-orb mup2-hero-banner-orb--2" />
                  </>
                )}
              </div>
              {/* Info row */}
              <div className="mup2-hero-body">
                <div className="mup2-hero-av-wrap">
                  <MupAvatar user={user} size={56} />
                  <span className="mup2-hero-lv">NV {user.level || 1}</span>
                </div>
                <div className="mup2-hero-info">
                  <div className="mup2-hero-name-row">
                    <span className="mup2-hero-name">{user.name}</span>
                    {(user.monthly_championships || 0) > 0 && (
                      <span className="mup2-hero-crown-badge">
                        <Crown size={9} />
                        {user.monthly_championships}
                      </span>
                    )}
                  </div>
                  {user.active_title && (
                    <span className="mup2-hero-title">{user.active_title}</span>
                  )}
                </div>
                {rank && (
                  <div className="mup2-hero-rank-block">
                    <span className="mup2-rank-num">#{rank.pos}</span>
                    <span className="mup2-rank-sub">de {rank.total}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          
          {/* Quick stats strip */}
          {user && (
            <div className="mup2-quick-strip">
              <div className="mup2-quick-cell">
                <span className="mup2-quick-val">{fmt(user.points || 0)}</span>
                <span className="mup2-quick-lbl">PTS</span>
              </div>
              <div className="mup2-quick-sep" />
              <div className="mup2-quick-cell">
                <span className="mup2-quick-val">{fmt(user.correct || 0)}</span>
                <span className="mup2-quick-lbl">✓</span>
              </div>
              <div className="mup2-quick-sep" />
              <div className="mup2-quick-cell">
                <span className="mup2-quick-val">{acc}%</span>
                <span className="mup2-quick-lbl">PREC</span>
              </div>
              <div className="mup2-quick-sep" />
              <div className="mup2-quick-cell">
                <span className="mup2-quick-val" style={{ color: "#ef4444" }}>
                  {user.current_streak || 0}
                </span>
                <span className="mup2-quick-lbl">🔥</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mup2-tabs">
            <TabBtn id="stats"    active={tab === "stats"}    onClick={setTab}>STATS</TabBtn>
            <TabBtn id="crowns"   active={tab === "crowns"}   onClick={setTab}>CORONAS</TabBtn>
            <TabBtn id="logros"   active={tab === "logros"}   onClick={setTab}>LOGROS</TabBtn>
          </div>
        </div>

        {/* ═══ SCROLLABLE BODY ═══ */}
        <div className="mup2-scroll-body" ref={scrollRef}>
          {loading ? (
            <div className="mup2-loading-state">
              <span className="mup2-loading-dot" />
              <span className="mup2-loading-dot" style={{ animationDelay: "0.15s" }} />
              <span className="mup2-loading-dot" style={{ animationDelay: "0.3s" }} />
            </div>
          ) : !user ? (
            <div className="mup2-error">Error al cargar usuario</div>
          ) : (
            <>
              {tab === "stats"  && <PanelStats user={user} />}
              {tab === "crowns" && <PanelChampions userId={userId} />}
              {tab === "logros" && <PanelAchievements user={user} />}
            </>
          )}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="mup2-footer">
          <span className="mup2-footer-id">UID_{userId?.toString().slice(0, 8).toUpperCase()}</span>
          <span className="mup2-footer-dot" />
          <span className="mup2-footer-tag">GLOBALSCORE</span>
        </div>

      </div>
    </div>
  );
}