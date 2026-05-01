import { useState, useRef } from "react";
import {
  useAdminHistorical,
  getHistoricalImageUrl,
} from "../../hooks/HooksAdmin/useAdminHistorical";
import "../../styles/StylesAdmin/AdminHistorical.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "players",      label: "Jugadores",    emoji: "⚽" },
  { key: "teams",        label: "Equipos",      emoji: "🛡️" },
  { key: "competitions", label: "Competencias", emoji: "🏆" },
  { key: "events",       label: "Eventos",      emoji: "⚡" },
];

const POSITIONS   = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const LEGACY_PLAYER = ["Goal Scorer", "Tactician", "Innovator", "Leader", "Goalkeeper"];
const LEGACY_TEAM   = ["Dynastic", "Innovative", "Continental", "National"];
const EVENT_TYPES   = ["Championship", "Historic Match", "Legendary Performance", "Era Defining", "Record"];
const COMP_TYPES    = ["International", "Continental", "Domestic"];

// ─── Estado inicial de formularios ───────────────────────────────────────────
const PLAYER_EMPTY = {
  name: "", country: "", position: "", birth_year: "", death_year: "",
  era: "", legacy_type: "", significance_level: 3,
  description: "", impact_summary: "", is_published: false,
};
const TEAM_EMPTY = {
  name: "", country: "", founded_year: "", era_dominance: "",
  legacy_type: "", description: "", is_published: false,
};
const COMP_EMPTY = {
  name: "", type: "", year: "", description: "",
  winner_team_id: "", is_published: false,
};
const EVENT_EMPTY = {
  title: "", event_type: "", event_date: "",
  description: "", is_published: false,
};

// ══════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTES
// ══════════════════════════════════════════════════════════════════════════════

// ─── ImageUploader ────────────────────────────────────────────────────────────
function ImageUploader({ currentPath, onFile, label = "Imagen" }) {
  const ref = useRef();
  const [preview, setPreview] = useState(null);
  const url = preview || getHistoricalImageUrl(currentPath);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFile(file);
  };

  return (
    <div className="ah-image-uploader" onClick={() => ref.current.click()}>
      {url ? (
        <img src={url} alt={label} className="ah-image-preview" />
      ) : (
        <div className="ah-image-placeholder">
          <span className="ah-upload-icon">📷</span>
          <span>{label}</span>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div className="ah-image-overlay">
        <span>Cambiar imagen</span>
      </div>
    </div>
  );
}

// ─── SignificancePicker ────────────────────────────────────────────────────────
function SignificancePicker({ value, onChange }) {
  return (
    <div className="ah-significance">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`ah-star ${n <= value ? "ah-star--on" : ""}`}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
      <span className="ah-significance-label">
        {value === 5 ? "GOAT Status" : value === 4 ? "Leyenda" : value === 3 ? "Estrella" : value === 2 ? "Notable" : "Histórico"}
      </span>
    </div>
  );
}

// ─── PublishToggle ─────────────────────────────────────────────────────────────
function PublishToggle({ checked, onChange }) {
  return (
    <label className="ah-publish-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ah-toggle-track">
        <span className="ah-toggle-thumb" />
      </span>
      <span className="ah-toggle-label">{checked ? "Publicado" : "Borrador"}</span>
    </label>
  );
}

// ─── Confirm Delete ────────────────────────────────────────────────────────────
function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div className="ah-confirm-overlay">
      <div className="ah-confirm-box">
        <p className="ah-confirm-text">
          ¿Eliminar <strong>{name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="ah-confirm-actions">
          <button className="ah-btn ah-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className="ah-btn ah-btn--danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL JUGADOR
// ══════════════════════════════════════════════════════════════════════════════
function PlayerModal({ player, teams, onSave, onClose, onGetPlayerTeams, onSetPlayerTeams }) {
  const isEdit = !!player?.id;
  const [form, setForm] = useState(player?.id ? { ...player } : { ...PLAYER_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [playerTeams, setPlayerTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamLink, setTeamLink] = useState({ team_id: "", start_year: "", end_year: "", roles: "" });

  // Cargar equipos del jugador si es edición
  useState(() => {
    if (isEdit) {
      setLoadingTeams(true);
      onGetPlayerTeams(player.id)
        .then(setPlayerTeams)
        .finally(() => setLoadingTeams(false));
    }
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addTeamLink = () => {
    if (!teamLink.team_id) return;
    setPlayerTeams((prev) => [...prev.filter((t) => t.team_id !== teamLink.team_id), { ...teamLink }]);
    setTeamLink({ team_id: "", start_year: "", end_year: "", roles: "" });
  };

  const removeTeamLink = (teamId) =>
    setPlayerTeams((prev) => prev.filter((t) => t.team_id !== teamId));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave(form, imageFile);
      // Guardar relaciones jugador-equipos
      if (saved?.id) {
        await onSetPlayerTeams(saved.id, playerTeams);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ah-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ah-modal">
        <div className="ah-modal-header">
          <h2>{isEdit ? "Editar Jugador" : "Nuevo Jugador"}</h2>
          <button className="ah-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ah-modal-body">
          {/* Imagen */}
          <div className="ah-section">
            <ImageUploader
              currentPath={form.image_path}
              onFile={setImageFile}
              label="Foto del jugador"
            />
          </div>

          {/* Identidad */}
          <div className="ah-section">
            <h3 className="ah-section-title">Identidad</h3>
            <div className="ah-grid-2">
              <div className="ah-field">
                <label>Nombre *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Pelé" />
              </div>
              <div className="ah-field">
                <label>País</label>
                <input value={form.country || ""} onChange={(e) => set("country", e.target.value)} placeholder="Brasil" />
              </div>
              <div className="ah-field">
                <label>Posición</label>
                <select value={form.position || ""} onChange={(e) => set("position", e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {POSITIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="ah-field">
                <label>Tipo de legado</label>
                <select value={form.legacy_type || ""} onChange={(e) => set("legacy_type", e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {LEGACY_PLAYER.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="ah-field">
                <label>Año nacimiento</label>
                <input type="number" value={form.birth_year || ""} onChange={(e) => set("birth_year", e.target.value)} placeholder="1940" />
              </div>
              <div className="ah-field">
                <label>Año fallecimiento</label>
                <input type="number" value={form.death_year || ""} onChange={(e) => set("death_year", e.target.value)} placeholder="(vacío si vive)" />
              </div>
              <div className="ah-field">
                <label>Era</label>
                <input value={form.era || ""} onChange={(e) => set("era", e.target.value)} placeholder="1956-1977" />
              </div>
            </div>
          </div>

          {/* Significancia */}
          <div className="ah-section">
            <h3 className="ah-section-title">Significancia histórica</h3>
            <SignificancePicker
              value={form.significance_level || 3}
              onChange={(v) => set("significance_level", v)}
            />
          </div>

          {/* Narrativa */}
          <div className="ah-section">
            <h3 className="ah-section-title">Narrativa</h3>
            <div className="ah-field">
              <label>Descripción histórica (2-3 párrafos)</label>
              <textarea
                rows={5}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Biografía e historia del jugador..."
              />
            </div>
            <div className="ah-field">
              <label>Por qué importa (1 párrafo)</label>
              <textarea
                rows={3}
                value={form.impact_summary || ""}
                onChange={(e) => set("impact_summary", e.target.value)}
                placeholder="Su impacto en la historia del fútbol..."
              />
            </div>
          </div>

          {/* Relaciones: Equipos */}
          <div className="ah-section">
            <h3 className="ah-section-title">Equipos donde jugó</h3>
            {loadingTeams ? (
              <p className="ah-loading-text">Cargando...</p>
            ) : (
              <>
                {playerTeams.length > 0 && (
                  <div className="ah-team-links">
                    {playerTeams.map((pt) => {
                      const team = teams.find((t) => t.id === pt.team_id);
                      return (
                        <div key={pt.team_id} className="ah-team-link-row">
                          <span className="ah-team-link-name">
                            {team?.name || pt.team_id}
                          </span>
                          <span className="ah-team-link-years">
                            {pt.start_year || "?"} – {pt.end_year || "?"}
                          </span>
                          {pt.roles && <span className="ah-team-link-role">{pt.roles}</span>}
                          <button
                            type="button"
                            className="ah-btn-icon"
                            onClick={() => removeTeamLink(pt.team_id)}
                          >✕</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="ah-team-link-form">
                  <select
                    value={teamLink.team_id}
                    onChange={(e) => setTeamLink((t) => ({ ...t, team_id: e.target.value }))}
                  >
                    <option value="">— Equipo —</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Desde"
                    value={teamLink.start_year}
                    onChange={(e) => setTeamLink((t) => ({ ...t, start_year: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={teamLink.end_year}
                    onChange={(e) => setTeamLink((t) => ({ ...t, end_year: e.target.value }))}
                  />
                  <input
                    placeholder="Roles (ej: Capitán)"
                    value={teamLink.roles}
                    onChange={(e) => setTeamLink((t) => ({ ...t, roles: e.target.value }))}
                  />
                  <button type="button" className="ah-btn ah-btn--secondary" onClick={addTeamLink}>
                    + Añadir
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Publicar */}
          <div className="ah-section">
            <PublishToggle checked={form.is_published} onChange={(v) => set("is_published", v)} />
          </div>
        </div>

        {error && <p className="ah-modal-error">{error}</p>}

        <div className="ah-modal-footer">
          <button className="ah-btn ah-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="ah-btn ah-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear jugador"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL EQUIPO
// ══════════════════════════════════════════════════════════════════════════════
function TeamModal({ team, onSave, onClose }) {
  const isEdit = !!team?.id;
  const [form, setForm] = useState(team?.id ? { ...team } : { ...TEAM_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(form, imageFile);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ah-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ah-modal">
        <div className="ah-modal-header">
          <h2>{isEdit ? "Editar Equipo" : "Nuevo Equipo"}</h2>
          <button className="ah-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ah-modal-body">
          <div className="ah-section">
            <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Escudo / Logo" />
          </div>
          <div className="ah-section">
            <h3 className="ah-section-title">Datos del equipo</h3>
            <div className="ah-grid-2">
              <div className="ah-field">
                <label>Nombre *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="FC Barcelona" />
              </div>
              <div className="ah-field">
                <label>País</label>
                <input value={form.country || ""} onChange={(e) => set("country", e.target.value)} placeholder="España" />
              </div>
              <div className="ah-field">
                <label>Año de fundación</label>
                <input type="number" value={form.founded_year || ""} onChange={(e) => set("founded_year", e.target.value)} placeholder="1899" />
              </div>
              <div className="ah-field">
                <label>Era de dominancia</label>
                <input value={form.era_dominance || ""} onChange={(e) => set("era_dominance", e.target.value)} placeholder="2008-2015" />
              </div>
              <div className="ah-field">
                <label>Tipo de legado</label>
                <select value={form.legacy_type || ""} onChange={(e) => set("legacy_type", e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {LEGACY_TEAM.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="ah-field">
              <label>Descripción histórica</label>
              <textarea
                rows={4}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Historia y legado del equipo..."
              />
            </div>
          </div>
          <div className="ah-section">
            <PublishToggle checked={form.is_published} onChange={(v) => set("is_published", v)} />
          </div>
        </div>
        {error && <p className="ah-modal-error">{error}</p>}
        <div className="ah-modal-footer">
          <button className="ah-btn ah-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="ah-btn ah-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear equipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL COMPETENCIA
// ══════════════════════════════════════════════════════════════════════════════
function CompetitionModal({ competition, teams, onSave, onClose }) {
  const isEdit = !!competition?.id;
  const [form, setForm] = useState(competition?.id ? { ...competition } : { ...COMP_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(form, imageFile);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ah-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ah-modal">
        <div className="ah-modal-header">
          <h2>{isEdit ? "Editar Competencia" : "Nueva Competencia"}</h2>
          <button className="ah-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ah-modal-body">
          <div className="ah-section">
            <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Logo de la competencia" />
          </div>
          <div className="ah-section">
            <h3 className="ah-section-title">Datos</h3>
            <div className="ah-grid-2">
              <div className="ah-field">
                <label>Nombre *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="World Cup 1986" />
              </div>
              <div className="ah-field">
                <label>Tipo</label>
                <select value={form.type || ""} onChange={(e) => set("type", e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {COMP_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="ah-field">
                <label>Año</label>
                <input type="number" value={form.year || ""} onChange={(e) => set("year", e.target.value)} placeholder="1986" />
              </div>
              <div className="ah-field">
                <label>Equipo campeón</label>
                <select value={form.winner_team_id || ""} onChange={(e) => set("winner_team_id", e.target.value)}>
                  <option value="">— Ninguno / Sin definir —</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="ah-field">
              <label>Contexto histórico</label>
              <textarea
                rows={4}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Descripción y contexto de la competencia..."
              />
            </div>
          </div>
          <div className="ah-section">
            <PublishToggle checked={form.is_published} onChange={(v) => set("is_published", v)} />
          </div>
        </div>
        {error && <p className="ah-modal-error">{error}</p>}
        <div className="ah-modal-footer">
          <button className="ah-btn ah-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="ah-btn ah-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear competencia"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MODAL EVENTO
// ══════════════════════════════════════════════════════════════════════════════
function EventModal({ event, players, teams, competitions, onSave, onClose, onGetRelations, onSetRelations }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState(event?.id ? { ...event } : { ...EVENT_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [relations, setRelations] = useState({ playerIds: [], teamIds: [], competitionIds: [] });
  const [loadingRel, setLoadingRel] = useState(false);

  useState(() => {
    if (isEdit && event?.id) {
      setLoadingRel(true);
      onGetRelations(event.id).then((rel) => {
        setRelations({
          playerIds: rel.players.map((p) => p.player_id),
          teamIds: rel.teams.map((t) => t.team_id),
          competitionIds: rel.competitions.map((c) => c.competition_id),
        });
      }).finally(() => setLoadingRel(false));
    }
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleId = (key, id) => {
    setRelations((r) => ({
      ...r,
      [key]: r[key].includes(id) ? r[key].filter((x) => x !== id) : [...r[key], id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave(form, imageFile);
      if (saved?.id) await onSetRelations(saved.id, relations);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ah-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ah-modal ah-modal--wide">
        <div className="ah-modal-header">
          <h2>{isEdit ? "Editar Evento" : "Nuevo Evento"}</h2>
          <button className="ah-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ah-modal-body">
          <div className="ah-section">
            <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Foto del evento" />
          </div>
          <div className="ah-section">
            <h3 className="ah-section-title">Datos del evento</h3>
            <div className="ah-grid-2">
              <div className="ah-field ah-field--full">
                <label>Título *</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="La Mano de Dios" />
              </div>
              <div className="ah-field">
                <label>Tipo de evento</label>
                <select value={form.event_type || ""} onChange={(e) => set("event_type", e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="ah-field">
                <label>Fecha</label>
                <input type="date" value={form.event_date || ""} onChange={(e) => set("event_date", e.target.value)} />
              </div>
            </div>
            <div className="ah-field">
              <label>Narrativa completa</label>
              <textarea
                rows={5}
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Descripción detallada del evento histórico..."
              />
            </div>
          </div>

          {/* Relaciones */}
          {loadingRel ? (
            <p className="ah-loading-text">Cargando relaciones...</p>
          ) : (
            <div className="ah-relations-grid">
              {/* Jugadores */}
              <div className="ah-section ah-relations-col">
                <h3 className="ah-section-title">Jugadores involucrados</h3>
                <div className="ah-checkbox-list">
                  {players.map((p) => (
                    <label key={p.id} className="ah-checkbox-item">
                      <input
                        type="checkbox"
                        checked={relations.playerIds.includes(p.id)}
                        onChange={() => toggleId("playerIds", p.id)}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Equipos */}
              <div className="ah-section ah-relations-col">
                <h3 className="ah-section-title">Equipos</h3>
                <div className="ah-checkbox-list">
                  {teams.map((t) => (
                    <label key={t.id} className="ah-checkbox-item">
                      <input
                        type="checkbox"
                        checked={relations.teamIds.includes(t.id)}
                        onChange={() => toggleId("teamIds", t.id)}
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Competencias */}
              <div className="ah-section ah-relations-col">
                <h3 className="ah-section-title">Competencias</h3>
                <div className="ah-checkbox-list">
                  {competitions.map((c) => (
                    <label key={c.id} className="ah-checkbox-item">
                      <input
                        type="checkbox"
                        checked={relations.competitionIds.includes(c.id)}
                        onChange={() => toggleId("competitionIds", c.id)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="ah-section">
            <PublishToggle checked={form.is_published} onChange={(v) => set("is_published", v)} />
          </div>
        </div>
        {error && <p className="ah-modal-error">{error}</p>}
        <div className="ah-modal-footer">
          <button className="ah-btn ah-btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="ah-btn ah-btn--primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LISTA GENÉRICA (card row)
// ══════════════════════════════════════════════════════════════════════════════
function HistoricalList({ items, onEdit, onDelete, onTogglePublish, renderTitle, renderMeta, emptyMsg }) {
  const [confirm, setConfirm] = useState(null); // { id, name }

  if (items.length === 0)
    return <p className="ah-empty">{emptyMsg}</p>;

  return (
    <div className="ah-list">
      {confirm && (
        <ConfirmDelete
          name={confirm.name}
          onConfirm={() => { onDelete(confirm.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {items.map((item) => (
        <div key={item.id} className="ah-list-row">
          {/* Imagen */}
          {item.image_path && (
            <img
              src={getHistoricalImageUrl(item.image_path)}
              alt=""
              className="ah-list-img"
            />
          )}
          {!item.image_path && (
            <div className="ah-list-img-placeholder">📷</div>
          )}

          {/* Info */}
          <div className="ah-list-info">
            <span className="ah-list-title">{renderTitle(item)}</span>
            <span className="ah-list-meta">{renderMeta(item)}</span>
          </div>

          {/* Acciones */}
          <div className="ah-list-actions">
            <button
              className={`ah-pill ${item.is_published ? "ah-pill--green" : "ah-pill--gray"}`}
              onClick={() => onTogglePublish(item.id, item.is_published)}
              title={item.is_published ? "Publicado — click para ocultar" : "Borrador — click para publicar"}
            >
              {item.is_published ? "✓ Publicado" : "Borrador"}
            </button>
            <button className="ah-btn-icon ah-btn-icon--edit" onClick={() => onEdit(item)} title="Editar">✏️</button>
            <button
              className="ah-btn-icon ah-btn-icon--del"
              onClick={() => setConfirm({ id: item.id, name: renderTitle(item) })}
              title="Eliminar"
            >🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminHistorical() {
  const [activeTab, setActiveTab] = useState("players");
  const [modal, setModal] = useState(null); // { type, data? }
  const [search, setSearch] = useState("");

  const {
    players, teams, competitions, events,
    loading, error, loadAll,
    createPlayer, updatePlayer, deletePlayer, togglePlayerPublished,
    createTeam, updateTeam, deleteTeam, toggleTeamPublished,
    createCompetition, updateCompetition, deleteCompetition, toggleCompetitionPublished,
    createEvent, updateEvent, deleteEvent, toggleEventPublished,
    getPlayerTeams, setPlayerTeams,
    getEventRelations, setEventRelations,
  } = useAdminHistorical();

  // ── Filtro de búsqueda ────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredPlayers      = players.filter((p) => p.name.toLowerCase().includes(q));
  const filteredTeams        = teams.filter((t) => t.name.toLowerCase().includes(q));
  const filteredCompetitions = competitions.filter((c) => c.name.toLowerCase().includes(q));
  const filteredEvents       = events.filter((e) => e.title.toLowerCase().includes(q));

  // ── Handlers de modal ─────────────────────────────────────────────────────
  const openCreate = () => setModal({ type: activeTab, data: null });
  const openEdit   = (data) => setModal({ type: activeTab, data });
  const closeModal = () => setModal(null);

  // ── Saves ─────────────────────────────────────────────────────────────────
  const handleSavePlayer = async (form, file) => {
    if (form.id) return updatePlayer(form.id, form, file);
    return createPlayer(form, file);
  };
  const handleSaveTeam = async (form, file) => {
    if (form.id) return updateTeam(form.id, form, file);
    return createTeam(form, file);
  };
  const handleSaveCompetition = async (form, file) => {
    if (form.id) return updateCompetition(form.id, form, file);
    return createCompetition(form, file);
  };
  const handleSaveEvent = async (form, file) => {
    if (form.id) return updateEvent(form.id, form, file);
    return createEvent(form, file);
  };

  // ── Stats rápidos ─────────────────────────────────────────────────────────
  const stats = [
    { label: "Jugadores",    count: players.length,      pub: players.filter((x) => x.is_published).length,      emoji: "⚽" },
    { label: "Equipos",      count: teams.length,        pub: teams.filter((x) => x.is_published).length,        emoji: "🛡️" },
    { label: "Competencias", count: competitions.length, pub: competitions.filter((x) => x.is_published).length, emoji: "🏆" },
    { label: "Eventos",      count: events.length,       pub: events.filter((x) => x.is_published).length,       emoji: "⚡" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="ah-root">
      {/* ── Header ── */}
      <div className="ah-header">
        <div className="ah-header-left">
          <h1 className="ah-title">
            <span className="ah-title-icon">🏆</span>
            Sección Histórica
          </h1>
          <p className="ah-subtitle">Gestiona el catálogo histórico de GlobalScore</p>
        </div>
        <button className="ah-btn ah-btn--primary ah-btn--lg" onClick={openCreate}>
          + Nuevo {TABS.find((t) => t.key === activeTab)?.label.slice(0, -1)}
        </button>
      </div>

      {/* ── Stats rápidos ── */}
      <div className="ah-stats-row">
        {stats.map((s) => (
          <div key={s.label} className="ah-stat-card">
            <span className="ah-stat-emoji">{s.emoji}</span>
            <div className="ah-stat-info">
              <span className="ah-stat-count">{s.count}</span>
              <span className="ah-stat-label">{s.label}</span>
            </div>
            <span className="ah-stat-pub">{s.pub} publicados</span>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="ah-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`ah-tab ${activeTab === t.key ? "ah-tab--active" : ""}`}
            onClick={() => { setActiveTab(t.key); setSearch(""); }}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
            <span className="ah-tab-count">
              {t.key === "players" ? players.length
                : t.key === "teams" ? teams.length
                : t.key === "competitions" ? competitions.length
                : events.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Búsqueda ── */}
      <div className="ah-search-bar">
        <span className="ah-search-icon">🔍</span>
        <input
          className="ah-search-input"
          placeholder={`Buscar ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="ah-search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="ah-content">
        {loading && <div className="ah-loading">Cargando...</div>}
        {error && (
          <div className="ah-error">
            <p>{error}</p>
            <button className="ah-btn ah-btn--ghost" onClick={loadAll}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === "players" && (
              <HistoricalList
                items={filteredPlayers}
                onEdit={openEdit}
                onDelete={deletePlayer}
                onTogglePublish={togglePlayerPublished}
                renderTitle={(p) => p.name}
                renderMeta={(p) =>
                  [p.country, p.position, p.era, p.legacy_type]
                    .filter(Boolean)
                    .join(" · ")
                }
                emptyMsg="No hay jugadores históricos. ¡Crea el primero!"
              />
            )}
            {activeTab === "teams" && (
              <HistoricalList
                items={filteredTeams}
                onEdit={openEdit}
                onDelete={deleteTeam}
                onTogglePublish={toggleTeamPublished}
                renderTitle={(t) => t.name}
                renderMeta={(t) =>
                  [t.country, t.era_dominance, t.legacy_type]
                    .filter(Boolean)
                    .join(" · ")
                }
                emptyMsg="No hay equipos históricos. ¡Crea el primero!"
              />
            )}
            {activeTab === "competitions" && (
              <HistoricalList
                items={filteredCompetitions}
                onEdit={openEdit}
                onDelete={deleteCompetition}
                onTogglePublish={toggleCompetitionPublished}
                renderTitle={(c) => c.name}
                renderMeta={(c) =>
                  [c.type, c.year ? String(c.year) : null]
                    .filter(Boolean)
                    .join(" · ")
                }
                emptyMsg="No hay competencias. ¡Crea la primera!"
              />
            )}
            {activeTab === "events" && (
              <HistoricalList
                items={filteredEvents}
                onEdit={openEdit}
                onDelete={deleteEvent}
                onTogglePublish={toggleEventPublished}
                renderTitle={(e) => e.title}
                renderMeta={(e) =>
                  [e.event_type, e.event_date]
                    .filter(Boolean)
                    .join(" · ")
                }
                emptyMsg="No hay eventos históricos. ¡Crea el primero!"
              />
            )}
          </>
        )}
      </div>

      {/* ── Modales ── */}
      {modal?.type === "players" && (
        <PlayerModal
          player={modal.data}
          teams={teams}
          onSave={handleSavePlayer}
          onClose={closeModal}
          onGetPlayerTeams={getPlayerTeams}
          onSetPlayerTeams={setPlayerTeams}
        />
      )}
      {modal?.type === "teams" && (
        <TeamModal
          team={modal.data}
          onSave={handleSaveTeam}
          onClose={closeModal}
        />
      )}
      {modal?.type === "competitions" && (
        <CompetitionModal
          competition={modal.data}
          teams={teams}
          onSave={handleSaveCompetition}
          onClose={closeModal}
        />
      )}
      {modal?.type === "events" && (
        <EventModal
          event={modal.data}
          players={players}
          teams={teams}
          competitions={competitions}
          onSave={handleSaveEvent}
          onClose={closeModal}
          onGetRelations={getEventRelations}
          onSetRelations={setEventRelations}
        />
      )}
    </div>
  );
}
