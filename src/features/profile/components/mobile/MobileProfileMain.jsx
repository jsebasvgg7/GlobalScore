import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, Moon, Sun,
  BarChart2, Award, Crown, FileText, NotebookPen,
  Edit2, User, Bell, Lock, ArrowLeft,
  Target, Zap, TrendingUp, Star, Trophy,
  Heart, Globe, Activity, Shield, Gamepad2,
  Calendar, CheckCircle2, XCircle, Clock,
  ArrowUpDown, Image, Check, Save, X,
  Filter,
} from "lucide-react";
import StyleSwitcher from "@/shared/layout";
import AvatarUpload from "../AvatarUpload";
import { MobileNotes } from '@/features/notes';
import { supabase } from '@/shared/services/supabase/client';
import {
  getPredictionResult,
  calculateAccuracy,
  calculateLevelProgress,
  getIconEmoji,
} from "@/shared/utils/profileUtils";
import "../../styles/MobileProfileMain.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

const TAB_LABELS = {
  overview: "Estadísticas",
  achievements: "Logros",
  championships: "Campeonatos",
  history: "Historial",
  edit: "Editar Perfil",
  notes: "Mis Notas",
  "settings-account": "Cuenta",
  "settings-appearance": "Apariencia",
  "settings-notifications": "Notificaciones",
  "settings-privacy": "Privacidad",
  "settings-data": "Datos",
  "settings-info": "Información",
};

/* ── Avatar ── */
function Avatar({ user, size = 64 }) {
  const s = { width: size, height: size, fontSize: size * 0.38 };
  if (user?.avatar_url) {
    return (
      <img src={user.avatar_url} alt={user.name} className="mpm-avatar-img" style={s} />
    );
  }
  return (
    <div className="mpm-avatar-ph" style={s}>
      {(user?.name || "U")[0].toUpperCase()}
    </div>
  );
}

/* ── Stat chip ── */
function StatChip({ value, label }) {
  return (
    <div className="mpm-stat">
      <span className="mpm-stat-val">{value}</span>
      <span className="mpm-stat-lbl">{label}</span>
    </div>
  );
}

/* ── Nav row ── */
function NavRow({ icon: Icon, label, desc, color, onClick, right }) {
  return (
    <button className="mpm-row" onClick={onClick}>
      <div className="mpm-row-icon" style={{ background: color }}>
        <Icon size={17} color="#fff" />
      </div>
      <div className="mpm-row-body">
        <span className="mpm-row-lbl">{label}</span>
        {desc && <span className="mpm-row-desc">{desc}</span>}
      </div>
      {right || <ChevronRight size={15} className="mpm-row-arrow" />}
    </button>
  );
}

/* ══════════════════════════════════════════
   SUB-VIEW WRAPPER (header + body)
══════════════════════════════════════════ */
function MobileSubView({ tabId, onBack, children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const header = document.querySelector(".gs-mobile-header");
    if (header) header.style.display = "none";
    return () => {
      if (header) header.style.display = "";
    };
  }, []);

  return (
    <div className="mpm-sub">
      <div className="mpm-sub-hdr">
        <button className="mpm-sub-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="mpm-sub-title">{TAB_LABELS[tabId] || ""}</h2>
      </div>
      <div className="mpm-sub-body">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: OVERVIEW
══════════════════════════════════════════ */
function OverviewTab({ userData, currentUser, userRanking }) {
  const accuracy = calculateAccuracy(currentUser);
  const { pointsInLevel, pointsToNextLevel, levelProgress } =
    calculateLevelProgress(userData, currentUser);

  const items = [
    { label: "Predicciones", value: fmt(currentUser?.predictions || 0), icon: Target, color: "#c9a227" },
    { label: "Puntos", value: fmt(currentUser?.points || 0), icon: Zap, color: "#5b4fd8" },
    { label: "Precisión", value: `${accuracy}%`, icon: TrendingUp, color: "#1D9E75" },
    { label: "Nivel", value: userData.level || 1, icon: Star, color: "#a0652a" },
    { label: "Ranking", value: `#${userRanking?.position || "—"}`, icon: Trophy, color: "#8a8a8a" },
    { label: "Campeonatos", value: userData.monthly_championships || 0, icon: Crown, color: "#c9a227" },
  ];

  return (
    <div className="mpm-tab-content">
      <div className="mpm-level-block">
        <div className="mpm-level-row">
          <span className="mpm-level-lbl">NIVEL {userData.level || 1}</span>
          <span className="mpm-level-pts">{pointsInLevel}/20 XP</span>
          <span className="mpm-level-next">—{pointsToNextLevel} pts</span>
        </div>
        <div className="mpm-level-track">
          <div className="mpm-level-fill" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>

      <div className="mpm-stats-grid">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="mpm-stat-cell" key={item.label}>
              <div className="mpm-stat-icon" style={{ background: item.color }}>
                <Icon size={13} color="#fff" />
              </div>
              <div className="mpm-stat-val">{item.value}</div>
              <div className="mpm-stat-lbl">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: ACHIEVEMENTS
══════════════════════════════════════════ */
function AchievementsTab({
  activeTitle, userTitles, userAchievements,
  availableAchievements, achievementsLoading,
}) {
  return (
    <div className="mpm-tab-content">
      {activeTitle && (
        <div className="mpm-active-title" style={{ borderColor: activeTitle.color }}>
          <Star size={14} style={{ color: activeTitle.color }} />
          <div>
            <div className="mpm-title-name" style={{ color: activeTitle.color }}>
              {activeTitle.name}
            </div>
            <div className="mpm-title-desc">{activeTitle.description}</div>
          </div>
          <span className="mpm-equipped-tag">EQUIPADO</span>
        </div>
      )}

      <div className="mpm-section-hdr">
        <span>TÍTULOS</span>
        <span className="mpm-count-badge">{userTitles.length}</span>
      </div>

      {achievementsLoading ? (
        <div className="mpm-empty"><Activity size={24} className="spinner" /></div>
      ) : userTitles.length === 0 ? (
        <div className="mpm-empty"><Shield size={28} /><p>Sin títulos aún</p></div>
      ) : (
        <div className="mpm-titles-list">
          {userTitles.map((t) => (
            <div key={t.id} className="mpm-title-row" style={{ borderLeftColor: t.color }}>
              <Crown size={13} style={{ color: t.color }} />
              <div>
                <div className="mpm-title-name" style={{ color: t.color }}>{t.name}</div>
                <div className="mpm-title-desc">{t.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mpm-section-hdr" style={{ marginTop: 16 }}>
        <span>LOGROS</span>
        <span className="mpm-count-badge">
          {userAchievements.length}/{availableAchievements.length}
        </span>
      </div>

      {achievementsLoading ? (
        <div className="mpm-empty"><Activity size={24} className="spinner" /></div>
      ) : userAchievements.length === 0 ? (
        <div className="mpm-empty">
          <Target size={28} /><p>Haz predicciones para desbloquear logros</p>
        </div>
      ) : (
        <div className="mpm-achievements-grid">
          {userAchievements.map((ach) => (
            <div key={ach.id} className="mpm-ach-card">
              <div className="mpm-ach-emoji">{getIconEmoji(ach.icon)}</div>
              <div className="mpm-ach-name">{ach.name}</div>
              <div className="mpm-ach-desc">{ach.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: CHAMPIONSHIPS
══════════════════════════════════════════ */
function ChampionshipsTab({ userData, crownHistory }) {
  const total = userData?.monthly_championships || 0;
  return (
    <div className="mpm-tab-content">
      <div className="mpm-crowns-hero">
        <Crown size={40} style={{ color: "#c9a227" }} />
        <div className="mpm-crowns-num" style={{ color: "#c9a227" }}>{total}</div>
        <div className="mpm-crowns-lbl">CAMPEONATOS GANADOS</div>
      </div>

      <div className="mpm-month-grid">
        <div className="mpm-month-cell">
          <div className="mpm-month-val">{userData?.monthly_points || 0}</div>
          <div className="mpm-month-lbl">PTS MES</div>
        </div>
        <div className="mpm-month-cell">
          <div className="mpm-month-val">{userData?.monthly_predictions || 0}</div>
          <div className="mpm-month-lbl">PREDS</div>
        </div>
        <div className="mpm-month-cell">
          <div className="mpm-month-val">{userData?.monthly_correct || 0}</div>
          <div className="mpm-month-lbl">ACIERTOS</div>
        </div>
      </div>

      {crownHistory?.length > 0 && (
        <>
          <div className="mpm-section-hdr" style={{ marginTop: 16 }}>
            <span>HISTORIAL</span>
          </div>
          <div className="mpm-crown-list">
            {crownHistory.map((c, i) => (
              <div key={c.id} className="mpm-crown-row">
                <div
                  className="mpm-crown-rank"
                  style={{
                    background: i === 0 ? "#c9a227" : i === 1 ? "#8a8a8a" : "#a0652a",
                  }}
                >
                  #{i + 1}
                </div>
                <div>
                  <div className="mpm-crown-month">{c.month_year}</div>
                  <div className="mpm-crown-pts">{fmt(c.points)} pts</div>
                </div>
                <Crown size={14} style={{ color: "#c9a227", marginLeft: "auto" }} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: HISTORY
══════════════════════════════════════════ */
function HistoryTab({ predictionHistory, historyLoading }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSort, setShowSort] = useState(false);

  const filtered = predictionHistory.filter((pred) => {
    if (activeFilter === "all") return true;
    const result = getPredictionResult(pred);
    if (activeFilter === "active") return pred.matches?.status === "pending";
    if (activeFilter === "finished") return pred.matches?.status === "finished";
    return result.status === activeFilter;
  });

  const counts = {
    all: predictionHistory.length,
    active: predictionHistory.filter((p) => p.matches?.status === "pending").length,
    finished: predictionHistory.filter((p) => p.matches?.status === "finished").length,
    exact: predictionHistory.filter((p) => getPredictionResult(p).status === "exact").length,
    correct: predictionHistory.filter((p) => getPredictionResult(p).status === "correct").length,
    wrong: predictionHistory.filter((p) => getPredictionResult(p).status === "wrong").length,
  };

  const filterLabel = {
    all: "Todas", active: "Activas", finished: "Terminadas",
    exact: "Exactas", correct: "Acertadas", wrong: "Falladas",
  };

  if (historyLoading) {
    return (
      <div className="mpm-tab-content mpm-empty">
        <Activity size={28} className="spinner" /><p>Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="mpm-tab-content">
      <div className="mpm-hist-hdr">
        <div className="mpm-hist-title">
          <Gamepad2 size={16} /><span>Historial</span>
        </div>
        <div style={{ position: "relative" }}>
          <button
            className={`mpm-sort-btn${showSort ? " active" : ""}`}
            onClick={() => setShowSort((v) => !v)}
          >
            <ArrowUpDown size={13} />
            <span>{filterLabel[activeFilter]}</span>
          </button>
          {showSort && (
            <>
              <div className="mpm-sort-backdrop" onClick={() => setShowSort(false)} />
              <div className="mpm-sort-modal">
                {Object.entries(filterLabel).map(([key, lbl]) => (
                  <button
                    key={key}
                    className={`mpm-sort-opt${activeFilter === key ? " active" : ""}`}
                    onClick={() => { setActiveFilter(key); setShowSort(false); }}
                  >
                    <span>{lbl}</span>
                    <span className="mpm-sort-count">{counts[key]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="mpm-count-badge">{counts.all}</div>
      </div>

      {filtered.length === 0 ? (
        <div className="mpm-empty" style={{ marginTop: 24 }}>
          <Gamepad2 size={36} /><p>Sin predicciones</p>
        </div>
      ) : (
        <div className="mpm-hist-list">
          {filtered.map((pred) => {
            const result = getPredictionResult(pred);
            const match = pred.matches;
            return (
              <div key={pred.id} className={`mpm-hist-card mpm-hist-card--${result.status}`}>
                <div className="mpm-hist-card-hdr">
                  <span className="mpm-hist-league">{match?.league}</span>
                  <span className="mpm-hist-date">
                    <Calendar size={10} />{match?.date}
                  </span>
                </div>
                <div className="mpm-hist-body">
                  <div className="mpm-hist-team">
                    <div className="mpm-hist-logo">
                      {match?.home_team_logo_url
                        ? <img src={match.home_team_logo_url} alt="" onError={(e) => (e.target.style.display = "none")} />
                        : <span>{match?.home_team_logo || "⚽"}</span>}
                    </div>
                    <span className="mpm-hist-tname">{match?.home_team}</span>
                  </div>

                  <div className="mpm-hist-scores">
                    <div className="mpm-hist-score-wrap">
                      <div className="mpm-hist-score">{pred.home_score}</div>
                      <div className="mpm-hist-score">{pred.away_score}</div>
                    </div>
                    {match?.status === "finished" && (
                      <div className="mpm-hist-real">
                        <span>{match.result_home}</span>
                        <span className="mpm-hist-sep">-</span>
                        <span>{match.result_away}</span>
                      </div>
                    )}
                  </div>

                  <div className="mpm-hist-team mpm-hist-team--right">
                    <span className="mpm-hist-tname">{match?.away_team}</span>
                    <div className="mpm-hist-logo">
                      {match?.away_team_logo_url
                        ? <img src={match.away_team_logo_url} alt="" onError={(e) => (e.target.style.display = "none")} />
                        : <span>{match?.away_team_logo || "⚽"}</span>}
                    </div>
                  </div>
                </div>
                <div className="mpm-hist-card-ftr">
                  <div className={`mpm-hist-result mpm-hist-result--${result.status}`}>
                    {result.status === "exact" && <Trophy size={12} />}
                    {result.status === "correct" && <CheckCircle2 size={12} />}
                    {result.status === "wrong" && <XCircle size={12} />}
                    {result.status === "pending" && <Clock size={12} />}
                    <span>{result.label}</span>
                  </div>
                  {result.points > 0 && (
                    <div className="mpm-hist-pts">+{result.points} pts</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: EDIT
══════════════════════════════════════════ */
function EditTab({
  userData, setUserData, currentUser,
  loading, handleSave, handleAvatarUpload,
  loadUserData, onBack,
}) {
  const [userBanners, setUserBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) loadUserBanners();
  }, [currentUser?.id]);

  const loadUserBanners = async () => {
    setBannersLoading(true);
    try {
      const { data } = await supabase
        .from("user_banners")
        .select("*, available_banners(*)")
        .eq("user_id", currentUser.id);
      setUserBanners((data || []).map((r) => r.available_banners).filter(Boolean));
    } catch (err) { console.error(err); }
    finally { setBannersLoading(false); }
  };

  const fields = [
    { key: "name", label: "Nombre", icon: User, placeholder: "Tu nombre" },
    { key: "favorite_team", label: "Equipo favorito", icon: Trophy, placeholder: "Ej: Real Madrid" },
    { key: "favorite_player", label: "Jugador favorito", icon: Heart, placeholder: "Ej: Messi" },
    { key: "nationality", label: "Nacionalidad", icon: Globe, placeholder: "Ej: Colombia" },
  ];

  return (
    <div className="mpm-tab-content">
      <div className="mpm-edit-avatar">
        <AvatarUpload
          currentUrl={userData.avatar_url}
          userId={currentUser.id}
          onUploadComplete={handleAvatarUpload}
          userLevel={userData.level}
        />
      </div>

      <div className="mpm-form-group">
        <label className="mpm-form-label"><Image size={13} /> Banner de Perfil</label>
        {bannersLoading ? (
          <p className="mpm-form-note">Cargando banners...</p>
        ) : (
          <div className="mpm-banner-list">
            <button
              className={`mpm-banner-opt${!userData.equipped_banner_url ? " active" : ""}`}
              onClick={() => setUserData({ ...userData, equipped_banner_url: null })}
            >
              <div className="mpm-banner-preview mpm-banner-base" />
              <span>Banner Base</span>
              {!userData.equipped_banner_url && <Check size={12} className="mpm-banner-check" />}
            </button>
            {userBanners.map((b) => (
              <button
                key={b.id}
                className={`mpm-banner-opt${userData.equipped_banner_url === b.image_url ? " active" : ""}`}
                onClick={() =>
                  setUserData({
                    ...userData,
                    equipped_banner_url:
                      b.image_url === userData.equipped_banner_url ? null : b.image_url,
                  })
                }
              >
                <img src={b.image_url} alt={b.name} className="mpm-banner-preview" />
                <span>{b.name}</span>
                {userData.equipped_banner_url === b.image_url && (
                  <Check size={12} className="mpm-banner-check" />
                )}
              </button>
            ))}
            {userBanners.length === 0 && (
              <p className="mpm-form-note">No tienes banners desbloqueados.</p>
            )}
          </div>
        )}
      </div>

      {fields.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.key} className="mpm-form-group">
            <label className="mpm-form-label"><Icon size={13} /> {f.label}</label>
            <input
              type="text"
              className="mpm-form-input"
              value={userData[f.key] || ""}
              onChange={(e) => setUserData({ ...userData, [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          </div>
        );
      })}

      <div className="mpm-form-group">
        <label className="mpm-form-label"><User size={13} /> Género</label>
        <select
          className="mpm-form-input"
          value={userData.gender || ""}
          onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
        >
          <option value="">Seleccionar...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
          <option value="Prefiero no decir">Prefiero no decir</option>
        </select>
      </div>

      <div className="mpm-form-group">
        <label className="mpm-form-label"><Star size={13} /> Biografía</label>
        <textarea
          className="mpm-form-input mpm-form-textarea"
          rows={3}
          value={userData.bio || ""}
          onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
          placeholder="Cuéntanos sobre ti..."
        />
      </div>

      <div className="mpm-form-actions">
        <button className="mpm-save-btn" onClick={handleSave} disabled={loading}>
          {loading ? <Activity size={14} className="spinner" /> : <Save size={14} />}
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
        <button
          className="mpm-cancel-btn"
          onClick={() => { loadUserData(); onBack(); }}
        >
          <X size={14} />Cancelar
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: SETTINGS SECTIONS
══════════════════════════════════════════ */
function SettingsSection({
  section, preferences, saving, handleToggle, handleSelect,
  handleLogout, handleReset, handleExport, setShowDeleteConfirm,
  currentUser, theme, toggleTheme,
}) {
  const Toggle = ({ checked, onChange, disabled }) => (
    <button
      className={`mpm-toggle${checked ? " mpm-toggle--on" : ""}`}
      onClick={onChange}
      disabled={disabled || saving}
    >
      <div className="mpm-toggle-knob" />
    </button>
  );

  const Row = ({ label, desc, danger, children }) => (
    <div className={`mpm-setting-row${danger ? " mpm-setting-row--danger" : ""}`}>
      <div className="mpm-setting-info">
        <div className={`mpm-setting-lbl${danger ? " mpm-text-danger" : ""}`}>{label}</div>
        {desc && <div className="mpm-setting-desc">{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const Card = ({ title, children }) => (
    <div className="mpm-settings-card">
      <div className="mpm-settings-card-hdr">{title}</div>
      <div className="mpm-settings-card-body">{children}</div>
    </div>
  );

  switch (section) {
    case "account":
      return (
        <div className="mpm-tab-content">
          <div className="mpm-section-hdr"><span>CUENTA</span></div>
          <Card title="Información personal">
            <Row label="Nombre" desc={currentUser?.name} />
            <Row label="Correo" desc={currentUser?.email} />
          </Card>
          <Card title="Sesión">
            <Row label="Cerrar sesión" desc="Salir de tu cuenta actual" danger>
              <button className="mpm-btn-danger" onClick={handleLogout}>Salir</button>
            </Row>
          </Card>
        </div>
      );

    case "appearance":
      return (
        <div className="mpm-tab-content">
          <div className="mpm-section-hdr"><span>APARIENCIA</span></div>
          <Card title="Tema">
            <Row label="Modo oscuro" desc="Cambiar entre tema claro y oscuro">
              <Toggle checked={theme === "dark"} onChange={toggleTheme} />
            </Row>
          </Card>
          <Card title="Estilo visual">
            <div className="mpm-appearance-panel">
              <StyleSwitcher />
            </div>
          </Card>
          <Card title="Texto">
            <Row label="Tamaño de fuente" desc="Ajusta el tamaño del texto">
              <select
                className="mpm-select"
                value={preferences.font_size}
                onChange={(e) => handleSelect("font_size", e.target.value)}
              >
                <option value="small">Pequeña</option>
                <option value="medium">Mediana</option>
                <option value="large">Grande</option>
              </select>
            </Row>
          </Card>
        </div>
      );

    case "notifications":
      return (
        <div className="mpm-tab-content">
          <div className="mpm-section-hdr"><span>NOTIFICACIONES</span></div>
          <Card title="Push">
            <Row label="Notificaciones push" desc="Recibir alertas en tu dispositivo">
              <Toggle checked={preferences.push_enabled} onChange={() => handleToggle("push_enabled")} />
            </Row>
          </Card>
          <Card title="Tipos">
            <Row label="Nuevos partidos" desc="Cuando se publiquen partidos"><Toggle checked={preferences.notif_new_matches} onChange={() => handleToggle("notif_new_matches")} disabled={!preferences.push_enabled} /></Row>
            <Row label="Resultados" desc="Cuando terminen tus partidos"><Toggle checked={preferences.notif_finished_matches} onChange={() => handleToggle("notif_finished_matches")} disabled={!preferences.push_enabled} /></Row>
            <Row label="Nuevas ligas" desc="Ligas y torneos disponibles"> <Toggle checked={preferences.notif_new_leagues} onChange={() => handleToggle("notif_new_leagues")} disabled={!preferences.push_enabled} /></Row>
            <Row label="Sonido" desc="Reproducir sonido">           <Toggle checked={preferences.notif_sound} onChange={() => handleToggle("notif_sound")} disabled={!preferences.push_enabled} /></Row>
          </Card>
        </div>
      );

    case "privacy":
      return (
        <div className="mpm-tab-content">
          <div className="mpm-section-hdr"><span>PRIVACIDAD</span></div>
          <Card title="Visibilidad">
            <Row label="Perfil público" desc="Otros usuarios pueden ver tu perfil">  <Toggle checked={preferences.profile_public} onChange={() => handleToggle("profile_public")} /></Row>
            <Row label="Estadísticas en ranking" desc="Aparecer en rankings públicos">         <Toggle checked={preferences.show_stats_in_ranking} onChange={() => handleToggle("show_stats_in_ranking")} /></Row>
            <Row label="Compartir actividad" desc="Mostrar tu actividad reciente">         <Toggle checked={preferences.share_activity} onChange={() => handleToggle("share_activity")} /></Row>
            <Row label="Predicciones públicas" desc="Otros pueden ver tus predicciones">    <Toggle checked={preferences.predictions_public} onChange={() => handleToggle("predictions_public")} /></Row>
          </Card>
        </div>
      );

    case "data":
      return (
        <div className="mpm-tab-content">
          <div className="mpm-section-hdr"><span>DATOS</span></div>
          <Card title="Exportar">
            <Row label="Exportar mis datos" desc="Descargar toda tu información en JSON"><button className="mpm-btn-primary" onClick={handleExport}>Exportar</button></Row>
            <Row label="Restaurar configuración" desc="Volver a los valores por defecto">     <button className="mpm-btn-secondary" onClick={handleReset}>Restaurar</button></Row>
          </Card>
          <Card title="Zona de peligro">
            <Row label="Cerrar sesión" desc="Salir de tu cuenta" danger>                            <button className="mpm-btn-danger" onClick={handleLogout}>Salir</button></Row>
            <Row label="Eliminar cuenta" desc="Acción irreversible, elimina todos tus datos" danger>  <button className="mpm-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Eliminar</button></Row>
          </Card>
        </div>
      );

    case "info":
      return (
        <div className="mpm-tab-content">
          <div className="mpm-section-hdr"><span>INFORMACIÓN</span></div>
          <Card title="App">
            <Row label="Versión" desc="GlobalScore v21.0.0" />
          </Card>
          <Card title="Legal">
            <Row label="Política de privacidad" desc="Cómo manejamos tus datos" />
            <Row label="Términos y condiciones" desc="Reglas de uso de la plataforma" />
          </Card>
        </div>
      );

    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — MobileProfileMain
══════════════════════════════════════════════════════════════ */
export default function MobileProfileMain({
  /* user */
  currentUser,
  /* data from hooks (passed from ProfileSettingsPage) */
  userData,
  setUserData,
  loading,
  loadUserData,
  handleSave,
  predictionHistory,
  historyLoading,
  userRanking,
  crownHistory,
  monthlyStats,
  userAchievements,
  userTitles,
  availableAchievements,
  achievementsLoading,
  activeTitle,
  preferences,
  saving,
  handleToggle,
  handleSelect,
  handleReset,
  handleExport,
  /* theme */
  isDark,
  onToggleDark,
  theme,
  toggleTheme,
  /* handlers */
  onLogout,
  handleAvatarUpload,
  setShowDeleteConfirm,
}) {
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState("main");
  const [showMobileNotes, setShowMobileNotes] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const accuracy =
    currentUser?.predictions > 0
      ? Math.round((currentUser.correct / currentUser.predictions) * 100)
      : 0;

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.email === "tian@admin.com";

  /* ── Navigate to sub-view ── */
  const handleNavigate = (section) => {
    if (section === "notes") { setShowMobileNotes(true); return; }
    setMobileView(`tab:${section}`);
  };

  /* ── Render tab content ── */
  const renderContent = (tab) => {
    const settingsProps = {
      preferences, saving, handleToggle, handleSelect,
      handleLogout: onLogout, handleReset, handleExport,
      setShowDeleteConfirm, currentUser, theme, toggleTheme,
    };

    if (tab.startsWith("settings-")) {
      return <SettingsSection section={tab.replace("settings-", "")} {...settingsProps} />;
    }

    switch (tab) {
      case "overview":
        return (
          <OverviewTab
            userData={userData}
            currentUser={currentUser}
            userRanking={userRanking}
          />
        );
      case "achievements":
        return (
          <AchievementsTab
            activeTitle={activeTitle}
            userTitles={userTitles}
            userAchievements={userAchievements}
            availableAchievements={availableAchievements}
            achievementsLoading={achievementsLoading}
          />
        );
      case "championships":
        return (
          <ChampionshipsTab
            userData={{ ...userData, ...monthlyStats }}
            crownHistory={crownHistory}
          />
        );
      case "history":
        return (
          <HistoryTab
            predictionHistory={predictionHistory}
            historyLoading={historyLoading}
          />
        );
      case "edit":
        return (
          <EditTab
            userData={userData}
            setUserData={setUserData}
            currentUser={currentUser}
            loading={loading}
            handleSave={handleSave}
            handleAvatarUpload={handleAvatarUpload}
            loadUserData={loadUserData}
            onBack={() => setMobileView("main")}
          />
        );
      default:
        return null;
    }
  };

  const isMobileSub = mobileView.startsWith("tab:");
  const currentMobileTab = isMobileSub ? mobileView.replace("tab:", "") : null;

  /* ── Nav groups ── */
  const NAV_GROUPS = [
    {
      label: "Mi actividad",
      items: [
        { id: "overview", icon: BarChart2, label: "Estadísticas", desc: "Ver tu rendimiento", color: "#1d9e75" },
        { id: "achievements", icon: Award, label: "Logros", desc: `${currentUser?.achievements?.length || 0} desbloqueados`, color: "#f59e0b" },
        { id: "championships", icon: Crown, label: "Campeonatos", desc: `${currentUser?.monthly_championships || 0} coronas`, color: "#8b7fc7" },
        { id: "history", icon: FileText, label: "Historial", desc: "Todas tus predicciones", color: "#60a5fa" },
        { id: "notes", icon: NotebookPen, label: "Mis Notas", desc: "Bloc de notas cifrado", color: "#5b4fd8" },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { id: "edit", icon: Edit2, label: "Editar Perfil", desc: null, color: "#6b7280" },
        { id: "settings-account", icon: User, label: "Cuenta", desc: null, color: "#60519b" },
        {
          id: "notifications", icon: Bell, label: "Notificaciones", desc: null, color: "#f97316",
          action: () => navigate("/notifications")
        },
        ...(isAdmin
          ? [{
            id: "admin", icon: Lock, label: "Admin", desc: "Panel de administración", color: "#e11d48",
            action: () => navigate("/admin")
          }]
          : []),
      ],
    },
  ];

  /* ════════ RENDER ════════ */

  /* Notes overlay */
  if (showMobileNotes) {
    return (
      <MobileNotes
        currentUser={currentUser}
        onBack={() => { setShowMobileNotes(false); setMobileView("main"); }}
      />
    );
  }

  /* Sub-view */
  if (isMobileSub) {
    return (
      <MobileSubView tabId={currentMobileTab} onBack={() => setMobileView("main")}>
        {renderContent(currentMobileTab)}
      </MobileSubView>
    );
  }

  /* Main profile list */
  return (
    <div className="mpm-root">

      {/* ── BANNER ── */}
      <div className="mpm-banner">
        {(currentUser?.equipped_banner_url || currentUser?.banner_url) ? (
          <img
            src={currentUser.equipped_banner_url || currentUser.banner_url}
            alt=""
            className="mpm-banner-img"
          />
        ) : (
          <div className="mpm-banner-gradient" />
        )}
        <div className="mpm-banner-overlay" />
        <span className="mpm-banner-tag">PERFIL · GlobalScore</span>
      </div>

      {/* ── USER ROW ── */}
      <div className="mpm-user-row" onClick={() => handleNavigate("edit")}>
        <div
          className="mpm-avatar-wrap"
          onClick={(e) => { e.stopPropagation(); handleNavigate("edit"); }}
        >
          <Avatar user={currentUser} size={56} />
        </div>
        <div className="mpm-user-info">
          <span className="mpm-user-name">{currentUser?.name || "Usuario"}</span>
          <span className="mpm-user-sub">
            {currentUser?.country || "Global"} · Niv.{currentUser?.level || 1}
          </span>
        </div>
        <ChevronRight size={16} className="mpm-user-arrow" />
      </div>

      {/* ── STATS ── */}
      <div className="mpm-stats-row">
        <StatChip value={fmt(currentUser?.points)} label="Puntos" />
        <div className="mpm-stats-sep" />
        <StatChip value={fmt(currentUser?.correct)} label="Aciertos" />
        <div className="mpm-stats-sep" />
        <StatChip value={`${accuracy}%`} label="Precisión" />
      </div>

      {/* ── PREFERENCIAS ── */}
      <div className="mpm-section-label">Preferencias</div>
      <div className="mpm-group">

        {/* Dark mode toggle */}
        <div className="mpm-row mpm-row--toggle">
          <div className="mpm-row-icon" style={{ background: "#6366f1" }}>
            {isDark ? <Moon size={17} color="#fff" /> : <Sun size={17} color="#fff" />}
          </div>
          <div className="mpm-row-body">
            <span className="mpm-row-lbl">Dark Mode</span>
          </div>
          <button
            className={`mpm-toggle${isDark ? " mpm-toggle--on" : ""}`}
            onClick={onToggleDark}
          >
            <div className="mpm-toggle-knob" />
          </button>
        </div>

        {/* Apariencia */}
        <div>
          <button className="mpm-row" onClick={() => setAppearanceOpen((o) => !o)}>
            <div className="mpm-row-icon" style={{ background: "#eab308" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div className="mpm-row-body">
              <span className="mpm-row-lbl">Apariencia</span>
              <span className="mpm-row-desc">Tema y estilo visual</span>
            </div>
            {appearanceOpen
              ? <ChevronDown size={14} className="mpm-row-arrow" />
              : <ChevronRight size={14} className="mpm-row-arrow" />}
          </button>

          {appearanceOpen && (
            <div className="mpm-appearance-panel">
              <StyleSwitcher />
            </div>
          )}
        </div>
      </div>

      {/* ── GRUPOS DE NAV ── */}
      {NAV_GROUPS.map((group) => (
        <React.Fragment key={group.label}>
          <div className="mpm-section-label">{group.label}</div>
          <div className="mpm-group">
            {group.items.map((item) => (
              <NavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                color={item.color}
                onClick={item.action || (() => handleNavigate(item.id))}
              />
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* ── LOGOUT ── */}
      <div className="mpm-section-label">Salir</div>
      <div className="mpm-logout-wrap">
        <button className="mpm-logout" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="mpm-logout-lbl">Cerrar sesión</span>
          <ChevronRight size={14} className="mpm-logout-arrow" />
        </button>
      </div>

    </div>
  );
}