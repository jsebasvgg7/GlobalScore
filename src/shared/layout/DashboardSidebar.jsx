import React, { useState, useEffect } from "react";
import {
  Zap, Target, Flame, TrendingUp, Trophy,
  CheckCircle2, Clock, Crown, BarChart3
} from "lucide-react";
import { supabase } from "../services/supabase/supabaseClient";
import GlobalLoader from "../ui/GlobalLoader";
import "./DashboardSidebar.css";

// ── Helpers ──────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("es-ES");
const acc = (correct, total) =>
  total > 0 ? Math.round((correct / total) * 100) : 0;
const lvlPct = (pts) => Math.round(((pts % 20) / 20) * 100);
const lvlPts = (pts) => pts % 20;

// ── Avatar ────────────────────────────────────────
function Avatar({ user, size = 40 }) {
  const initials = (user?.name || "U").slice(0, 2).toUpperCase();
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className="dsb-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="dsb-avatar-placeholder" style={{ width: size, height: size }}>
      {initials}
    </div>
  );
}

// ── Stat row ──────────────────────────────────────
function StatRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="dsb-stat-row">
      <div className="dsb-stat-row-icon" style={{ background: accent + "20", color: accent }}>
        <Icon size={13} />
      </div>
      <span className="dsb-stat-row-lbl">{label}</span>
      <span className="dsb-stat-row-val">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────
export default function DashboardSidebar({ currentUser, users = [] }) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [userRankPos, setUserRankPos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      // Actividad reciente: últimas 5 predicciones finalizadas
      const { data: preds } = await supabase
        .from("predictions")
        .select(`
          points_earned,
          home_score,
          away_score,
          matches ( home_team, away_team, status, date )
        `)
        .eq("user_id", currentUser.id)
        .eq("matches.status", "finished")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(preds || []);

      // Posición en ranking
      const sorted = [...users].sort((a, b) => b.points - a.points);
      const pos = sorted.findIndex((u) => u.id === currentUser.id);
      setUserRankPos(pos >= 0 ? pos + 1 : null);
    } catch (err) {
      console.error("DashboardSidebar error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const points = currentUser.points || 0;
  const monthPts = currentUser.monthly_points || 0;
  const predictions = currentUser.predictions || 0;
  const correct = currentUser.correct || 0;
  const streak = currentUser.current_streak || 0;
  const bestStreak = currentUser.best_streak || 0;
  const level = currentUser.level || 1;
  const accuracy = acc(correct, predictions);
  const pct = lvlPct(points);
  const ptsInLevel = lvlPts(points);
  const firstName = (currentUser.name || "Jugador").split(" ")[0];

  return (
    <aside className="dsb-root">

      {/* ── USER CARD ── */}
      <div className="dsb-card dsb-user-card">
        <div className="dsb-user-banner" />
        <div className="dsb-user-body">
          <div className="dsb-user-av-wrap">
            <Avatar user={currentUser} size={52} />
            <span className="dsb-level-badge">Nv {level}</span>
          </div>
          <div className="dsb-user-info">
            <span className="dsb-user-name">{currentUser.name || "Jugador"}</span>
            <span className="dsb-user-role">
              {currentUser.is_admin ? "Administrador" : "Jugador"}
            </span>
          </div>
        </div>

        {/* Barra de nivel */}
        <div className="dsb-level-section">
          <div className="dsb-level-row">
            <span className="dsb-level-lbl">
              <Zap size={11} /> Nivel {level}
            </span>
            <span className="dsb-level-pts">{ptsInLevel}/20 pts</span>
          </div>
          <div className="dsb-level-track">
            <div className="dsb-level-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* 4 números clave */}
        <div className="dsb-num-grid">
          <div className="dsb-num-box dsb-num-accent">
            <span className="dsb-num-val">{fmt(points)}</span>
            <span className="dsb-num-lbl">Puntos</span>
          </div>
          <div className="dsb-num-box">
            <span className="dsb-num-val">
              {userRankPos ? `#${userRankPos}` : "—"}
            </span>
            <span className="dsb-num-lbl">Ranking</span>
          </div>
          <div className="dsb-num-box">
            <span className="dsb-num-val">{accuracy}%</span>
            <span className="dsb-num-lbl">Precisión</span>
          </div>
          <div className="dsb-num-box">
            <span className="dsb-num-val">{fmt(monthPts)}</span>
            <span className="dsb-num-lbl">Este mes</span>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="dsb-card">
        <div className="dsb-card-header">
          <BarChart3 size={14} />
          <span>Estadísticas</span>
        </div>
        <div className="dsb-stats-list">
          <StatRow
            icon={Target}
            label="Predicciones"
            value={fmt(predictions)}
            accent="#60519b"
          />
          <StatRow
            icon={CheckCircle2}
            label="Correctas"
            value={fmt(correct)}
            accent="#1D9E75"
          />
          <StatRow
            icon={Flame}
            label="Racha actual"
            value={`🔥 ${streak}`}
            accent="#f59e0b"
          />
          <StatRow
            icon={TrendingUp}
            label="Mejor racha"
            value={bestStreak}
            accent="#3b82f6"
          />
          <StatRow
            icon={Crown}
            label="Campeonatos"
            value={currentUser.monthly_championships || 0}
            accent="#f59e0b"
          />
        </div>
      </div>

      {/* ── ACTIVIDAD RECIENTE ── */}
      <div className="dsb-card">
        <div className="dsb-card-header">
          <Clock size={14} />
          <span>Actividad reciente</span>
        </div>

        {loading ? (
          <GlobalLoader variant="inline" size="sm" />
        ) : recentActivity.length === 0 ? (
          <div className="dsb-empty">
            <Trophy size={28} />
            <p>Aún sin predicciones finalizadas</p>
          </div>
        ) : (
          <div className="dsb-activity-list">
            {recentActivity.map((pred, i) => {
              const pts = pred.points_earned || 0;
              const match = pred.matches;
              if (!match) return null;
              const home = (match.home_team || "").slice(0, 3).toUpperCase();
              const away = (match.away_team || "").slice(0, 3).toUpperCase();
              const isPos = pts > 0;
              return (
                <div key={i} className="dsb-act-item">
                  <div
                    className="dsb-act-dot"
                    style={{ background: isPos ? "#1D9E75" : "#E24B4A" }}
                  />
                  <div className="dsb-act-info">
                    <span className="dsb-act-match">
                      {match.home_team} vs {match.away_team}
                    </span>
                    <span className="dsb-act-pred">
                      Tu pred: {pred.home_score} – {pred.away_score}
                    </span>
                  </div>
                  <span
                    className="dsb-act-pts"
                    style={{ color: isPos ? "#1D9E75" : "#E24B4A" }}
                  >
                    {isPos ? `+${pts}` : "0"} pts
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TOP RIVALS ── */}
      {users.length > 1 && (
        <div className="dsb-card">
          <div className="dsb-card-header">
            <TrendingUp size={14} />
            <span>Podio actual</span>
          </div>
          <div className="dsb-rivals-list">
            {[...users]
              .sort((a, b) => b.points - a.points)
              .slice(0, 4)
              .map((u, i) => {
                const isMe = u.id === currentUser.id;
                const medals = ["🥇", "🥈", "🥉", ""];
                return (
                  <div
                    key={u.id}
                    className={`dsb-rival-row${isMe ? " dsb-rival-me" : ""}`}
                  >
                    <span className="dsb-rival-pos">
                      {medals[i] || `#${i + 1}`}
                    </span>
                    <div className="dsb-rival-av">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name} />
                      ) : (
                        <span>{(u.name || "U")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="dsb-rival-info">
                      <span className="dsb-rival-name">
                        {u.name}
                        {isMe && <span className="dsb-you-tag">Tú</span>}
                      </span>
                      <span className="dsb-rival-pts">{fmt(u.points)} pts</span>
                    </div>
                    <div
                      className="dsb-rival-bar-wrap"
                    >
                      <div
                        className="dsb-rival-bar"
                        style={{
                          width: `${users[0]?.points > 0
                            ? Math.round((u.points / (users.sort((a, b) => b.points - a.points)[0]?.points || 1)) * 100)
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </aside>
  );
}