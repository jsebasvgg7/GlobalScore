import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Target, Flame, Clock, Calendar } from "lucide-react";
import "../../styles/StylesOthers/RightPanel.css";

const fmt   = (n) => Number(n || 0).toLocaleString("es-ES");
const acc   = (c, t) => (t > 0 ? Math.round((c / t) * 100) : 0);
const lvlPct = (pts) => Math.round(((pts % 20) / 20) * 100);
const lvlPts = (pts) => pts % 20;
const initials = (name = "") => (name || "U").slice(0, 2).toUpperCase();

export default function RightPanel({ currentUser, users = [], matches = [] }) {
  const navigate = useNavigate();

  // ── Top 5 ranking ─────────────────────────────────
  const top5 = useMemo(
    () => [...users].sort((a, b) => b.points - a.points).slice(0, 4),
    [users]
  );

  const myPos = useMemo(() => {
    const sorted = [...users].sort((a, b) => b.points - a.points);
    const idx = sorted.findIndex((u) => u.id === currentUser?.id);
    return idx >= 0 ? idx + 1 : null;
  }, [users, currentUser]);

  // ── Próximo partido pendiente ──────────────────────
  const nextMatch = useMemo(() => {
    return matches
      .filter((m) => m.status === "pending")
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || "00:00"}`);
        const db = new Date(`${b.date}T${b.time || "00:00"}`);
        return da - db;
      })[0] || null;
  }, [matches]);

  if (!currentUser) return null;

  const points      = currentUser.points       || 0;
  const predictions = currentUser.predictions  || 0;
  const correct     = currentUser.correct      || 0;
  const streak      = currentUser.current_streak || 0;
  const bestStreak  = currentUser.best_streak  || 0;
  const level       = currentUser.level        || 1;
  const monthPts    = currentUser.monthly_points || 0;
  const accuracy    = acc(correct, predictions);
  const pct         = lvlPct(points);
  const ptsInLevel  = lvlPts(points);

  return (
    <aside className="rp-root">

      {/* ══ PERFIL ══ */}
      <div className="rp-section rp-section--profile">
        <div className="rp-section-label">Jugador</div>

        <div className="rp-user-row">
          <div className="rp-avatar">
            {currentUser.avatar_url
              ? <img src={currentUser.avatar_url} alt={currentUser.name} />
              : <span>{initials(currentUser.name)}</span>
            }
          </div>
          <div className="rp-user-info">
            <span className="rp-user-name">{currentUser.name || "Jugador"}</span>
            <span className="rp-user-role">
              Nivel {level} · {currentUser.is_admin ? "Admin" : "Jugador"}
            </span>
          </div>
        </div>

        <div className="rp-level-wrap">
          <div className="rp-level-row">
            <span className="rp-level-lbl">XP · {ptsInLevel}/20</span>
            <span className="rp-level-val">{pct}%</span>
          </div>
          <div className="rp-level-track">
            <div className="rp-level-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ══ ESTADÍSTICAS ══ */}
      <div className="rp-section">
        <div className="rp-section-label">Estadísticas</div>

        <div className="rp-stats-grid">
          <div className="rp-stat">
            <span className="rp-stat-val rp-stat-val--accent">{fmt(points)}</span>
            <span className="rp-stat-lbl">Puntos</span>
            <span className="rp-stat-sub">+{fmt(monthPts)} mes</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-val rp-stat-val--green">{accuracy}%</span>
            <span className="rp-stat-lbl">Precisión</span>
            <span className="rp-stat-sub">{fmt(predictions)} pred.</span>
          </div>
          <div className="rp-stat rp-stat--full">
            <span className="rp-stat-val rp-stat-val--amber">{streak}</span>
            <span className="rp-stat-lbl">Racha · Récord: {bestStreak}</span>
          </div>
        </div>
      </div>

      {/* ══ RANKING ══ */}
      <div className="rp-section">
        <div className="rp-section-label">Ranking</div>

        <div className="rp-rank-list">
          {top5.map((u, i) => {
            const isMe = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                className={`rp-rank-item${isMe ? " rp-rank-item--me" : ""}`}
                onClick={() => navigate("/ranking")}
              >
                <span className={`rp-rank-pos${i < 2 ? " rp-rank-pos--top" : ""}`}>
                  {i + 1}
                </span>
                <div className="rp-rank-avatar">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.name} />
                    : <span>{initials(u.name)}</span>
                  }
                </div>
                <span className="rp-rank-name">
                  {u.name}
                  {isMe && <span className="rp-you-tag">Tú</span>}
                </span>
                <span className="rp-rank-pts">{fmt(u.points)}</span>
              </div>
            );
          })}

          {myPos && myPos > 5 && (
            <div className="rp-rank-item rp-rank-item--me rp-rank-item--outside">
              <span className="rp-rank-pos rp-rank-pos--top">{myPos}</span>
              <div className="rp-rank-avatar rp-rank-avatar--me">
                {currentUser.avatar_url
                  ? <img src={currentUser.avatar_url} alt={currentUser.name} />
                  : <span>{initials(currentUser.name)}</span>
                }
              </div>
              <span className="rp-rank-name">
                {currentUser.name}
                <span className="rp-you-tag">Tú</span>
              </span>
              <span className="rp-rank-pts">{fmt(points)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ══ PRÓXIMO PARTIDO ══ */}
      {nextMatch && (
        <div className="rp-next-match">
          <span className="rp-next-label">Próximo partido</span>

          <div className="rp-next-teams">
            <div className="rp-next-team">
              <div className="rp-next-shield">
                {nextMatch.home_team_logo_url
                  ? <img src={nextMatch.home_team_logo_url} alt={nextMatch.home_team} />
                  : <span>{nextMatch.home_team_logo || "⚽"}</span>
                }
              </div>
              <span className="rp-next-team-name">
                {(nextMatch.home_team || "").slice(0, 3).toUpperCase()}
              </span>
            </div>

            <span className="rp-next-vs">VS</span>

            <div className="rp-next-team">
              <div className="rp-next-shield">
                {nextMatch.away_team_logo_url
                  ? <img src={nextMatch.away_team_logo_url} alt={nextMatch.away_team} />
                  : <span>{nextMatch.away_team_logo || "⚽"}</span>
                }
              </div>
              <span className="rp-next-team-name">
                {(nextMatch.away_team || "").slice(0, 3).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="rp-next-meta">
            <span className="rp-next-time">
              <Clock size={10} />
              {nextMatch.time || "—"}
            </span>
            <span className="rp-next-league">{nextMatch.league}</span>
            <span className="rp-next-date">
              <Calendar size={10} />
              {nextMatch.date}
            </span>
          </div>
        </div>
      )}

    </aside>
  );
}