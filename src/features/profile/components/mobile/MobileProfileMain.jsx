import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Moon, Sun,
  BarChart2, Award, Crown, FileText, NotebookPen,
  Edit2, User, Bell, Lock, ArrowLeft,
  Target, Star, Trophy,
  Heart, Globe, Activity, Shield, Gamepad2,
  Calendar, CheckCircle2, XCircle, Clock,
  ArrowUpDown, Image, Check, Save, X,
  Filter, LogOut,
} from "lucide-react";
import AvatarUpload from "../AvatarUpload";
import { MobileNotes } from '@/features/notes';
import { supabase } from '@/shared/services/supabase/client';
import {
  getPredictionResult,
  calculateAccuracy,
  calculateLevelProgress,
  getIconEmoji,
} from "@/shared/utils/profileUtils";
import "./MobileProfileMain.css";

const fmt = (n) => Number(n || 0).toLocaleString("es-ES");

/* ── Bento pattern for achievements grid: cycles through a fixed
   sequence of size/accent variants so the layout looks organic and
   asymmetric but stays stable across renders (no Math.random). ── */
const BENTO_PATTERN = [
  "big accent-a", "", "", "",
  "", "wide accent-b", "", "tall",
  "", "", "wide accent-c", "",
  "tall", "", "", "big accent-a",
];
function getBentoClass(index) {
  const variant = BENTO_PATTERN[index % BENTO_PATTERN.length];
  if (!variant) return "mpm-ach-card";
  return "mpm-ach-card " + variant.split(" ").map((v) => `mpm-ach-card--${v}`).join(" ");
}

const TAB_LABELS = {
  overview: "Estadísticas",
  achievements: "Logros",
  titles: "Títulos",
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

/* ── Nav row ── */
function NavRow({ icon: Icon, label, desc, onClick, right, className = "" }) {
  return (
    <button className={`mpm-row ${className}`.trim()} onClick={onClick}>
      <div className="mpm-row-icon">
        <Icon size={16} color="#fff" />
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
    const header = document.querySelector(".mhd-header");
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

  const smallStats = [
    { label: "Predicciones", value: fmt(currentUser?.season_predictions || 0) },
    { label: "Ranking", value: `#${userRanking?.position || "—"}` },
    { label: "Nivel", value: userData.level || 1 },
  ];

  return (
    <div className="mpm-tab-content mpm-tab-content--overview">
      <div className="mpm-level-block mpm-level-block--hero">
        <div className="mpm-level-hero-row">
          <div className="mpm-level-hero-num">
            <span className="mpm-level-hero-lbl">NIVEL</span>
            <span className="mpm-level-hero-val">{userData.level || 1}</span>
          </div>
          <div className="mpm-level-hero-progress">
            <div className="mpm-level-row">
              <span className="mpm-level-pts">{pointsInLevel}/20 XP</span>
              <span className="mpm-level-next">—{pointsToNextLevel} pts</span>
            </div>
            <div className="mpm-level-track">
              <div className="mpm-level-fill" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mpm-bento-main">
        <div className="mpm-bento-cell mpm-bento-cell--points">
          <span className="mpm-bento-lbl">Puntos temporada</span>
          <span className="mpm-bento-val">{fmt(currentUser?.season_points || 0)}</span>
        </div>
        <div className="mpm-bento-cell mpm-bento-cell--accuracy">
          <span className="mpm-bento-lbl">Precisión</span>
          <span className="mpm-bento-val">{accuracy}%</span>
        </div>
        {smallStats.map((item) => (
          <div className="mpm-bento-cell mpm-bento-cell--neutral" key={item.label}>
            <span className="mpm-bento-lbl">{item.label}</span>
            <span className="mpm-bento-val">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mpm-bento-champs">
        <div className="mpm-bento-cell mpm-bento-cell--champ-month">
          <Crown size={18} className="mpm-bento-champ-icon" />
          <div>
            <span className="mpm-bento-val">{currentUser?.monthly_championships || 0}</span>
            <span className="mpm-bento-lbl">Camp. del mes</span>
          </div>
        </div>
        <div className="mpm-bento-cell mpm-bento-cell--champ-global">
          <Crown size={18} className="mpm-bento-champ-icon" />
          <div>
            <span className="mpm-bento-val">{currentUser?.global_championships || 0}</span>
            <span className="mpm-bento-lbl">Camp. global</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: TITLES
══════════════════════════════════════════ */
function TitlesTab({ activeTitle, userTitles, achievementsLoading }) {
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
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: ACHIEVEMENTS
══════════════════════════════════════════ */
function AchievementsTab({ userAchievements, availableAchievements, achievementsLoading }) {
  return (
    <div className="mpm-tab-content">
      <div className="mpm-section-hdr">
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
          {userAchievements.map((ach, i) => (
            <div key={ach.id} className={getBentoClass(i)}>
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
        <Crown size={40} style={{ color: "var(--mpm-accent)" }} />
        <div className="mpm-crowns-num" style={{ color: "var(--mpm-accent)" }}>{total}</div>
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
                    background: i === 0 ? "var(--mpm-accent-deep)" : i === 1 ? "var(--mpm-accent)" : "var(--mpm-accent-soft)",
                  }}
                >
                  #{i + 1}
                </div>
                <div>
                  <div className="mpm-crown-month">{c.month_year}</div>
                  <div className="mpm-crown-pts">{fmt(c.points)} pts</div>
                </div>
                <Crown size={14} style={{ color: "var(--mpm-accent)", marginLeft: "auto" }} />
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
        <div className="mpm-hist-grid">
          {filtered.map((pred) => {
            const result = getPredictionResult(pred);
            const match = pred.matches;
            return (
              <div key={pred.id} className={`mpm-hist-card mpm-hist-card--${result.status}`}>
                <div className="mpm-hist-card-hdr">
                  <span className="mpm-hist-league">{match?.league}</span>
                  <span className="mpm-hist-date">{match?.date}</span>
                </div>

                <div className="mpm-hist-teams-row">
                  <span className="mpm-hist-tname">{match?.home_team}</span>
                  <span className="mpm-hist-vs">vs</span>
                  <span className="mpm-hist-tname">{match?.away_team}</span>
                </div>

                <div className={`mpm-hist-scoreboard mpm-hist-scoreboard--${result.status}`}>
                  {pred.home_score}-{pred.away_score}
                </div>

                {match?.status === "finished" ? (
                  <div className="mpm-hist-real-lbl">
                    Real: {match.result_home}-{match.result_away}
                  </div>
                ) : (
                  <div className="mpm-hist-real-lbl">{match?.time || "Por jugar"}</div>
                )}

                <div className={`mpm-hist-badge mpm-hist-badge--${result.status}`}>
                  {result.status === "exact" && <Trophy size={10} />}
                  {result.status === "correct" && <CheckCircle2 size={10} />}
                  {result.status === "wrong" && <XCircle size={10} />}
                  {result.status === "pending" && <Clock size={10} />}
                  <span>{result.label}</span>
                  {result.points > 0 && <span className="mpm-hist-badge-pts">+{result.points}</span>}
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
          <div className="mpm-banner-grid">
            <button
              className={`mpm-banner-cell mpm-banner-cell--first${!userData.equipped_banner_url ? " active" : ""}`}
              onClick={() => setUserData({ ...userData, equipped_banner_url: null })}
            >
              <div className="mpm-banner-cell-bg mpm-banner-cell-bg--base" />
              <span className="mpm-banner-cell-lbl">Banner Base</span>
              {!userData.equipped_banner_url && (
                <span className="mpm-banner-cell-check"><Check size={11} /></span>
              )}
            </button>
            {userBanners.map((b) => (
              <button
                key={b.id}
                className={`mpm-banner-cell${userData.equipped_banner_url === b.image_url ? " active" : ""}`}
                onClick={() =>
                  setUserData({
                    ...userData,
                    equipped_banner_url:
                      b.image_url === userData.equipped_banner_url ? null : b.image_url,
                  })
                }
              >
                <img src={b.image_url} alt="" className="mpm-banner-cell-bg" />
                <span className="mpm-banner-cell-lbl">{b.name}</span>
                {userData.equipped_banner_url === b.image_url && (
                  <span className="mpm-banner-cell-check"><Check size={11} /></span>
                )}
              </button>
            ))}
            {userBanners.length === 0 && (
              <p className="mpm-form-note">No tienes banners desbloqueados.</p>
            )}
          </div>
        )}
      </div>

      <div className="mpm-form-bento">
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} className="mpm-form-group mpm-form-group--half">
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

        <div className="mpm-form-group mpm-form-group--half">
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

      <div className="mpm-form-actions mpm-form-actions--bento">
        <button className="mpm-save-btn" onClick={handleSave} disabled={loading}>
          {loading ? <Activity size={14} className="spinner" /> : <Save size={14} />}
          {loading ? "Guardando..." : "Guardar"}
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
            userAchievements={userAchievements}
            availableAchievements={availableAchievements}
            achievementsLoading={achievementsLoading}
          />
        );
      case "titles":
        return (
          <TitlesTab
            activeTitle={activeTitle}
            userTitles={userTitles}
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

  /* ── Secciones de la vista principal (orden del mockup) ── */
  const toggleDark = onToggleDark;

  const NAV_SECTIONS = [
    {
      label: "Progreso",
      items: [
        { id: "overview", icon: BarChart2, label: "Estadísticas", desc: "verificación de rendimiento" },
      ],
      pair: [
        { id: "achievements", icon: Award, label: "Logros", desc: `${userAchievements?.length || 0} items` },
        { id: "titles", icon: Trophy, label: "Títulos", desc: `${userTitles?.length || 0} items` },
      ],
    },
    {
      label: "Mi Actividad",
      items: [
        { id: "history", icon: FileText, label: "Historial", desc: "todas tus predicciones" },
        { id: "notes", icon: NotebookPen, label: "Mis notas", desc: "bloc de notas cifrado" },
        { id: "championships", icon: Crown, label: "Campeonatos", desc: `${currentUser?.monthly_championships || 0} items` },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { id: "edit", icon: Edit2, label: "Editar perfil", desc: "personalización de tu info." },
        { id: "settings-account", icon: User, label: "Cuenta", desc: "configuración y gestión" },
        ...(isAdmin
          ? [{ id: "admin", icon: Lock, label: "Admin", desc: "panel de administración", action: () => navigate("/admin") }]
          : []),
        { id: "logout", icon: LogOut, label: "Cerrar sesión", desc: "salir de tu cuenta de GL", action: onLogout },
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
  const bannerSrc = currentUser?.equipped_banner_url || currentUser?.banner_url;

  return (
    <div className="mpm-root">

      {/* ── HERO: banner + bloque de identidad ── */}
      <div className="mpm-hero">
        <div className="mpm-banner">
          {bannerSrc ? (
            <img src={bannerSrc} alt="" className="mpm-banner-img" />
          ) : (
            <div className="mpm-banner-gradient" />
          )}
        </div>
        <div className="mpm-hero-id">
          <button
            className="mpm-avatar-wrap"
            onClick={() => handleNavigate("edit")}
            aria-label="Editar perfil"
          >
            <Avatar user={currentUser} size={72} />
          </button>
          <span className="mpm-user-name">{currentUser?.name || "Usuario"}</span>
          <span className="mpm-user-sub">nivel {currentUser?.level || 1}</span>
        </div>
      </div>

      {/* ── GENERAL ── */}
      <div className="mpm-section-label">General</div>
      <div className="mpm-group">
        <div
          className="mpm-row mpm-row--toggle"
          role="button"
          tabIndex={0}
          onClick={toggleDark}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleDark(); }}
        >
          <div className="mpm-row-icon">
            {isDark ? <Moon size={16} color="#fff" /> : <Sun size={16} color="#fff" />}
          </div>
          <div className="mpm-row-body">
            <span className="mpm-row-lbl">Modo oscuro</span>
            <span className="mpm-row-desc">apariencia de la página</span>
          </div>
          <span className={`mpm-toggle${isDark ? " mpm-toggle--on" : ""}`} aria-hidden="true">
            <span className="mpm-toggle-knob" />
          </span>
        </div>
        <NavRow
          icon={Bell}
          label="Notificaciones"
          desc="centro de avisos e info."
          onClick={() => navigate("/notifications")}
        />
      </div>

      {/* ── SECCIONES ── */}
      {NAV_SECTIONS.map((section) => (
        <React.Fragment key={section.label}>
          <div className="mpm-section-label">{section.label}</div>
          <div className="mpm-group">
            {section.items.map((item) => (
              <NavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                onClick={item.action || (() => handleNavigate(item.id))}
              />
            ))}
            {section.pair && (
              <div className="mpm-activity-pair">
                {section.pair.map((item) => (
                  <NavRow
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    desc={item.desc}
                    onClick={() => handleNavigate(item.id)}
                    className="mpm-row--tile"
                  />
                ))}
              </div>
            )}
          </div>
        </React.Fragment>
      ))}

    </div>
  );
}
