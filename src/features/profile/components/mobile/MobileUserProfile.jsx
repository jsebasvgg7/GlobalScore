import React, { useState, useEffect, useRef } from "react";
import {
  X, Crown, Flame, Zap, Lock, ChevronRight,
  Crosshair, Target, Hash, TrendingUp, Star, BarChart2, Activity, Award, BookOpen,
  CheckCircle, Eye, Aperture, Navigation, CheckSquare, Compass,
  Repeat2, Calendar, Cpu, Timer, Infinity, Rocket, Shield,
  Circle, CircleDot, Layers, Trophy, Gem, Sparkles,
  Percent, LayoutDashboard, Medal,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/shared/services/supabase/client";
import "../../styles/MobileUserProfile.css";

/* ── helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString("es-ES");
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

/* ── Mapa de nombre-de-icon (string) → componente Lucide ── */
const ICON_MAP = {
  Crosshair, Target, Hash, TrendingUp, Star,
  BarChart2, Activity, Award, BookOpen, CheckCircle,
  Eye, Aperture, Navigation, CheckSquare, Compass,
  ShieldCheck: BadgeCheck,
  Repeat2, Flame, Zap, Calendar, Cpu,
  Timer, Infinity, Rocket, Shield, Crown,
  Circle, CircleDot, Layers, Trophy, Gem,
  Sparkles, Percent, LayoutDashboard, Medal, BadgeCheck,
  // fallback para nombres que no matcheen
  Default: Star,
};

/** Devuelve el componente Lucide dado un string de nombre */
function getIcon(iconName, size = 16, color) {
  const Icon = ICON_MAP[iconName] ?? ICON_MAP.Default;
  return <Icon size={size} color={color} />;
}

/* ── Colores por categoría ── */
const CATEGORY_COLORS = {
  predictions: "#8b7fc7",
  accuracy: "#34d399",
  streaks: "#ef4444",
  points: "#f59e0b",
  crowns: "#c9a227",
  special: "#fb923c",
};

const CATEGORY_LABELS = {
  predictions: "Predicciones",
  accuracy: "Aciertos",
  streaks: "Rachas",
  points: "Puntos",
  crowns: "Coronas",
  special: "Especiales",
};

/* ════════════════════════════════════════════
   AVATAR
════════════════════════════════════════════ */
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
    { lbl: "ACIERTOS", val: fmt(user.correct || 0), accent: "#34d399" },
    { lbl: "PRECISIÓN", val: `${acc}%`, accent: "#f59e0b" },
    { lbl: "PUNTOS TOTAL", val: fmt(user.points || 0), accent: "var(--mup2-accent)" },
    { lbl: "PUNTOS MES", val: fmt(user.monthly_points || 0), accent: "#a78bfa" },
    { lbl: "PRED. MES", val: fmt(user.monthly_predictions || 0), accent: "#34d399" },
    { lbl: "ACIERTOS MES", val: fmt(user.monthly_correct || 0), accent: "#f59e0b" },
    { lbl: "PREC. MES", val: `${mAcc}%`, accent: "#fb923c" },
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
   PANEL — TÍTULOS (Coronas + Trofeos)
════════════════════════════════════════════ */
function PanelTitles({ userId }) {
  const [crownHistory, setCrownHistory] = useState([]);
  const [trophyHistory, setTrophyHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: crowns }, { data: trophies }] = await Promise.all([
        supabase
          .from("monthly_championship_history")
          .select("*")
          .eq("user_id", userId)
          .order("awarded_at", { ascending: false }),
        supabase
          .from("global_championship_history")
          .select("*")
          .eq("user_id", userId)
          .order("awarded_at", { ascending: false }),
      ]);
      setCrownHistory(crowns || []);
      setTrophyHistory(trophies || []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="mup2-panel">
        <div className="mup2-loading-row">
          <span className="mup2-loading-dot" />
          <span className="mup2-loading-dot" style={{ animationDelay: "0.15s" }} />
          <span className="mup2-loading-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mup2-panel">
      {/* ── CORONAS (Mensual) ── */}
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "#c9a227" }} />
        <span className="mup2-sec-lbl">CORONAS · MENSUAL</span>
        <span className="mup2-sec-extra" style={{ color: "#c9a227" }}>
          {crownHistory.length}
        </span>
      </div>

      {crownHistory.length === 0 ? (
        <div className="mup2-empty">
          <Crown size={32} color="var(--mup2-border)" />
          <span>Sin campeonatos mensuales aún</span>
        </div>
      ) : (
        <div className="mup2-crown-list">
          {crownHistory.map((h, i) => (
            <div key={h.id || i} className="mup2-crown-row">
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

      {/* ── TROFEOS (Global) ── */}
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: "#0ea5a8" }} />
        <span className="mup2-sec-lbl">TROFEOS · GLOBAL</span>
        <span className="mup2-sec-extra" style={{ color: "#0ea5a8" }}>
          {trophyHistory.length}
        </span>
      </div>

      {trophyHistory.length === 0 ? (
        <div className="mup2-empty">
          <Trophy size={32} color="var(--mup2-border)" />
          <span>Sin trofeos del ranking global aún</span>
        </div>
      ) : (
        <div className="mup2-trophy-list">
          {trophyHistory.map((h, i) => (
            <div key={h.id || i} className="mup2-trophy-row">
              <div className="mup2-trophy-icon">
                <Trophy size={14} color="#0ea5a8" />
                <span className="mup2-trophy-rank">#{i + 1}</span>
              </div>
              <div className="mup2-trophy-info">
                <span className="mup2-trophy-period">{h.edition_label || "—"}</span>
                <span className="mup2-trophy-pts">+{fmt(h.points)} pts</span>
              </div>
              <span className="mup2-trophy-badge">CAMPEÓN</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   PANEL — LOGROS  (carga desde Supabase)
════════════════════════════════════════════ */
function PanelAchievements({ user }) {
  const [allAch, setAllAch] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("available_achievements")
        .select("*")
        .order("requirement_value", { ascending: true });
      setAllAch(data || []);
      setLoading(false);
    })();
  }, []);

  /** Decide si el usuario cumple el requisito del logro */
  const isUnlocked = (ach) => {
    const val = ach.requirement_value ?? 0;
    switch (ach.requirement_type) {
      case "predictions": return (user.predictions || 0) >= val;
      case "correct": return (user.correct || 0) >= val;
      case "streak": return (user.best_streak || 0) >= val;
      case "points": return (user.points || 0) >= val;
      case "monthly_championships": return (user.monthly_championships || 0) >= val;
      default: return false;
    }
  };

  const unlocked = allAch.filter(isUnlocked);
  const locked = allAch.filter((a) => !isUnlocked(a));

  /* Agrupar desbloqueados por categoría */
  const groupedUnlocked = unlocked.reduce((acc, a) => {
    const cat = a.category || "special";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="mup2-panel">
        <div className="mup2-loading-row" style={{ padding: "40px 14px" }}>
          <span className="mup2-loading-dot" />
          <span className="mup2-loading-dot" style={{ animationDelay: "0.15s" }} />
          <span className="mup2-loading-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mup2-panel">

      {/* ── Resumen compacto ── */}
      <div className="mup2-ach-summary">
        <div className="mup2-ach-summary-num">{unlocked.length}</div>
        <div className="mup2-ach-summary-sep">/</div>
        <div className="mup2-ach-summary-total">{allAch.length}</div>
        <div className="mup2-ach-summary-lbl">LOGROS DESBLOQUEADOS</div>
        {/* Barra de progreso global */}
        <div className="mup2-ach-summary-bar">
          <div
            className="mup2-ach-summary-fill"
            style={{ width: `${allAch.length > 0 ? Math.round((unlocked.length / allAch.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* ── Desbloqueados, agrupados por categoría ── */}
      {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
        const items = groupedUnlocked[catKey];
        if (!items || items.length === 0) return null;
        const color = CATEGORY_COLORS[catKey] || "var(--mup2-accent)";
        return (
          <React.Fragment key={catKey}>
            <div className="mup2-sec-hdr">
              <div className="mup2-sec-line" style={{ background: color }} />
              <span className="mup2-sec-lbl">{catLabel.toUpperCase()}</span>
              <span className="mup2-sec-extra" style={{ color }}>{items.length}</span>
            </div>
            <div className="mup2-ach-grid">
              {items.map((a) => (
                <AchievementRow key={a.id} ach={a} unlocked />
              ))}
            </div>
          </React.Fragment>
        );
      })}

      {/* ── Bloqueados ── */}
      {locked.length > 0 && (
        <>
          <div className="mup2-sec-hdr" style={{ marginTop: 8 }}>
            <div className="mup2-sec-line" style={{ background: "var(--mup2-border)" }} />
            <span className="mup2-sec-lbl" style={{ opacity: 0.45 }}>BLOQUEADOS</span>
            <span className="mup2-sec-extra" style={{ opacity: 0.4 }}>{locked.length}</span>
          </div>
          <div className="mup2-ach-grid">
            {locked.map((a) => (
              <AchievementRow key={a.id} ach={a} unlocked={false} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Fila individual de logro ── */
function AchievementRow({ ach, unlocked }) {
  const color = unlocked
    ? (CATEGORY_COLORS[ach.category] || "var(--mup2-accent)")
    : "var(--mup2-border)";

  return (
    <div
      className={`mup2-ach-card ${unlocked ? "mup2-ach-card--on" : "mup2-ach-card--off"}`}
      style={{ "--ach-color": color }}
    >
      {/* Icono Lucide en un cuadrado de acento */}
      <div className="mup2-ach-icon-wrap">
        {unlocked
          ? getIcon(ach.icon, 15, "#fff")
          : <Lock size={13} style={{ opacity: 0.35 }} />
        }
      </div>

      {/* Texto */}
      <div className="mup2-ach-text">
        <span className="mup2-ach-name" style={{ opacity: unlocked ? 1 : 0.35 }}>
          {ach.name}
        </span>
        <span className="mup2-ach-desc" style={{ opacity: unlocked ? 0.7 : 0.3 }}>
          {ach.description}
        </span>
      </div>

      {/* Badge de categoría solo si está desbloqueado */}
      {unlocked && (
        <span
          className="mup2-ach-cat-badge"
          style={{ color, borderColor: color, background: `${color}14` }}
        >
          {CATEGORY_LABELS[ach.category] || ach.category}
        </span>
      )}
    </div>
  );
}
/* ════════════════════════════════════════════════
   PANEL — ÁLBUMES LEGENDARIOS
════════════════════════════════════════════════ */
const MOB_ALB_META = [
  { id: 'legendary_1', label: 'Foundations',        shortLabel: 'LEG I',  spine: '#5b4fd8', accent: '#a599d9' },
  { id: 'legendary_2', label: 'Rising Legends',     shortLabel: 'LEG II', spine: '#7c3aed', accent: '#c4b5fd' },
  { id: 'legendary_3', label: 'Historical Depth',   shortLabel: 'LEG III',spine: '#1D9E75', accent: '#34d399' },
  { id: 'legendary_4', label: 'Elite Construction', shortLabel: 'LEG IV', spine: '#b45309', accent: '#f59e0b' },
  { id: 'legendary_5', label: 'The Immortals',      shortLabel: 'LEG V',  spine: '#9d174d', accent: '#f472b6' },
];

function PanelAlbums({ userId }) {
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('album_progress')
        .select('album_id, is_completed')
        .eq('user_id', userId)
        .in('album_id', ['legendary_1','legendary_2','legendary_3','legendary_4','legendary_5'])
        .eq('is_completed', true);
      setCompleted(data || []);
      setLoading(false);
    })();
  }, [userId]);

  const completedIds = new Set(completed.map(p => p.album_id));
  const count = completed.length;
  const isImmortal = count === 5;

  return (
    <div className="mup2-panel">
      <div className="mup2-sec-hdr">
        <div className="mup2-sec-line" style={{ background: '#5b4fd8' }} />
        <span className="mup2-sec-lbl">ÁLBUMES LEGENDARIOS</span>
        <span className="mup2-sec-extra" style={{ color: '#5b4fd8' }}>{count}/5</span>
      </div>

      {loading ? (
        <div className="mup2-loading-row">
          <span className="mup2-loading-dot" />
          <span className="mup2-loading-dot" style={{ animationDelay: '0.15s' }} />
          <span className="mup2-loading-dot" style={{ animationDelay: '0.3s' }} />
        </div>
      ) : (
        <>
          {/* Barra de progreso */}
          <div className="mup2-alb-progress-wrap">
            <div className="mup2-alb-progress-track">
              <div className="mup2-alb-progress-fill" style={{ width: `${(count / 5) * 100}%` }} />
            </div>
            <span className="mup2-alb-progress-label">{count} de 5 completados</span>
          </div>

          {/* Lista de álbumes */}
          <div className="mup2-alb-list">
            {MOB_ALB_META.map((alb) => {
              const done = completedIds.has(alb.id);
              return (
                <div
                  key={alb.id}
                  className={`mup2-alb-row${done ? ' mup2-alb-row--done' : ' mup2-alb-row--pending'}`}
                  style={{ '--alb-accent': alb.accent, '--alb-spine': alb.spine }}
                >
                  <div className="mup2-alb-spine-bar" />
                  <div className="mup2-alb-icon">
                    {done
                      ? <BookOpen size={15} strokeWidth={2} style={{ color: alb.accent }} />
                      : <Lock size={13} strokeWidth={2} style={{ color: 'var(--mup2-muted)', opacity: 0.4 }} />
                    }
                  </div>
                  <div className="mup2-alb-info">
                    <span className="mup2-alb-shortlabel">{alb.shortLabel}</span>
                    <span className="mup2-alb-name">{alb.label}</span>
                  </div>
                  {done
                    ? <Trophy size={13} style={{ color: '#1D9E75', flexShrink: 0 }} />
                    : <Lock size={11} style={{ color: 'var(--mup2-muted)', opacity: 0.3, flexShrink: 0 }} />
                  }
                </div>
              );
            })}
          </div>

          {/* Banner immortal */}
          {isImmortal && (
            <div className="mup2-alb-immortal">
              <Crown size={18} fill="#f472b6" color="#ec4899" />
              <div>
                <span className="mup2-alb-immortal-title">THE IMMORTALS</span>
                <span className="mup2-alb-immortal-sub">Todos los álbumes completados</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function MobileUserProfile({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stats");
  const [rank, setRank] = useState(null);
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
              {rank && <span className="mup2-topbar-rank">#{rank.pos}</span>}
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
            <TabBtn id="stats" active={tab === "stats"} onClick={setTab}>STATS</TabBtn>
            <TabBtn id="titulos" active={tab === "titulos"} onClick={setTab}>TÍTULOS</TabBtn>
            <TabBtn id="logros" active={tab === "logros"} onClick={setTab}>LOGROS</TabBtn>
            <TabBtn id="albums" active={tab === "albums"} onClick={setTab}>ÁLBUMES</TabBtn>
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
              {tab === "stats" && <PanelStats user={user} />}
              {tab === "titulos" && <PanelTitles userId={userId} />}
              {tab === "logros" && <PanelAchievements user={user} />}
              {tab === "albums" && <PanelAlbums userId={userId} />}
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