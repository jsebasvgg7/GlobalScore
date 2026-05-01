import { useState, useRef } from "react";
import {
  Users2, Shield, Trophy, Zap, Search, Camera, Pencil,
  Trash2, Check, X, ChevronLeft, Plus, Star, Eye, EyeOff,
  Upload, RefreshCw, AlertCircle, BookOpen, Link2
} from "lucide-react";
import {
  useAdminHistorical,
  getHistoricalImageUrl,
} from "../../hooks/HooksAdmin/useAdminHistorical";
import "../../styles/StylesAdmin/AdminHistorical.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "players",      label: "Jugadores",    Icon: Users2  },
  { key: "teams",        label: "Equipos",      Icon: Shield  },
  { key: "competitions", label: "Competencias", Icon: Trophy  },
  { key: "events",       label: "Eventos",      Icon: Zap     },
];

const POSITIONS    = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const LEGACY_PLAYER = ["Goal Scorer", "Tactician", "Innovator", "Leader", "Goalkeeper"];
const LEGACY_TEAM   = ["Dynastic", "Innovative", "Continental", "National"];
const EVENT_TYPES   = ["Championship", "Historic Match", "Legendary Performance", "Era Defining", "Record"];
const COMP_TYPES    = ["International", "Continental", "Domestic"];

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
//  SUB-COMPONENTES COMPARTIDOS
// ══════════════════════════════════════════════════════════════════════════════

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
    <div className="ah-img-uploader" onClick={() => ref.current.click()}>
      {url ? (
        <img src={url} alt={label} className="ah-img-preview" />
      ) : (
        <div className="ah-img-placeholder">
          <Camera size={22} strokeWidth={1.5} />
          <span>{label}</span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
      <div className="ah-img-overlay"><span>Cambiar</span></div>
    </div>
  );
}

function SignificancePicker({ value, onChange }) {
  const labels = ["", "Histórico", "Notable", "Estrella", "Leyenda", "GOAT Status"];
  return (
    <div className="ah-significance">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          className={`ah-star ${n <= value ? "ah-star--on" : ""}`}
          onClick={() => onChange(n)}>
          <Star size={16} fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
      <span className="ah-sig-label">{labels[value]}</span>
    </div>
  );
}

function PublishToggle({ checked, onChange }) {
  return (
    <label className="ah-pub-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="ah-pub-track"><span className="ah-pub-thumb" /></span>
      <span className="ah-pub-label">{checked ? "Publicado" : "Borrador"}</span>
    </label>
  );
}

// Campo reutilizable del panel
function PField({ label, required, hint, children }) {
  return (
    <div className="ah-pfield">
      <label className="ah-plabel">
        {label}{required && <span className="ah-preq">*</span>}
      </label>
      {children}
      {hint && <span className="ah-phint">{hint}</span>}
    </div>
  );
}

function PInput(props) {
  return <input className="ah-pinput" {...props} />;
}
function PSelect({ children, ...props }) {
  return <select className="ah-pinput" {...props}>{children}</select>;
}
function PTextarea(props) {
  return <textarea className="ah-pinput ah-ptextarea" {...props} />;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL: JUGADOR
// ══════════════════════════════════════════════════════════════════════════════
function PlayerPanel({ player, teams, onSave, onClose, onGetPlayerTeams, onSetPlayerTeams }) {
  const isEdit = !!player?.id;
  const [form, setForm] = useState(player?.id ? { ...player } : { ...PLAYER_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [playerTeams, setPlayerTeams] = useState([]);
  const [teamLink, setTeamLink] = useState({ team_id: "", start_year: "", end_year: "", roles: "" });

  useState(() => {
    if (isEdit) {
      onGetPlayerTeams(player.id).then(setPlayerTeams);
    }
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTeamLink = () => {
    if (!teamLink.team_id) return;
    setPlayerTeams(prev => [...prev.filter(t => t.team_id !== teamLink.team_id), { ...teamLink }]);
    setTeamLink({ team_id: "", start_year: "", end_year: "", roles: "" });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      const saved = await onSave(form, imageFile);
      if (saved?.id) await onSetPlayerTeams(saved.id, playerTeams);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ah-panel-form">
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Imagen</span>
        <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Foto del jugador" />
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Identidad</span>
        <div className="ah-pgrid-2">
          <PField label="Nombre" required>
            <PInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="Pelé" />
          </PField>
          <PField label="País">
            <PInput value={form.country || ""} onChange={e => set("country", e.target.value)} placeholder="Brasil" />
          </PField>
          <PField label="Posición">
            <PSelect value={form.position || ""} onChange={e => set("position", e.target.value)}>
              <option value="">— Selecciona —</option>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </PSelect>
          </PField>
          <PField label="Tipo de legado">
            <PSelect value={form.legacy_type || ""} onChange={e => set("legacy_type", e.target.value)}>
              <option value="">— Selecciona —</option>
              {LEGACY_PLAYER.map(l => <option key={l}>{l}</option>)}
            </PSelect>
          </PField>
          <PField label="Año nac.">
            <PInput type="number" value={form.birth_year || ""} onChange={e => set("birth_year", e.target.value)} placeholder="1940" />
          </PField>
          <PField label="Año fallec.">
            <PInput type="number" value={form.death_year || ""} onChange={e => set("death_year", e.target.value)} placeholder="(si aplica)" />
          </PField>
          <PField label="Era" hint="Ej: 1956-1977">
            <PInput value={form.era || ""} onChange={e => set("era", e.target.value)} placeholder="1956-1977" />
          </PField>
        </div>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Significancia histórica</span>
        <SignificancePicker value={form.significance_level || 3} onChange={v => set("significance_level", v)} />
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Narrativa</span>
        <PField label="Descripción (2-3 párrafos)">
          <PTextarea rows={4} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Biografía e historia..." />
        </PField>
        <PField label="Por qué importa (1 párrafo)">
          <PTextarea rows={2} value={form.impact_summary || ""} onChange={e => set("impact_summary", e.target.value)} placeholder="Su impacto en la historia..." />
        </PField>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Equipos donde jugó</span>
        {playerTeams.length > 0 && (
          <div className="ah-team-chips">
            {playerTeams.map(pt => {
              const team = teams.find(t => t.id === pt.team_id);
              return (
                <div key={pt.team_id} className="ah-team-chip">
                  <span className="ah-tc-name">{team?.name || pt.team_id}</span>
                  <span className="ah-tc-years">{pt.start_year || "?"} – {pt.end_year || "?"}</span>
                  <button type="button" className="ah-tc-remove" onClick={() => setPlayerTeams(prev => prev.filter(t => t.team_id !== pt.team_id))}><X size={10} /></button>
                </div>
              );
            })}
          </div>
        )}
        <div className="ah-team-add-row">
          <PSelect value={teamLink.team_id} onChange={e => setTeamLink(t => ({ ...t, team_id: e.target.value }))}>
            <option value="">— Equipo —</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </PSelect>
          <PInput type="number" placeholder="Desde" value={teamLink.start_year} onChange={e => setTeamLink(t => ({ ...t, start_year: e.target.value }))} />
          <PInput type="number" placeholder="Hasta" value={teamLink.end_year} onChange={e => setTeamLink(t => ({ ...t, end_year: e.target.value }))} />
          <button type="button" className="ah-add-link-btn" onClick={addTeamLink}><Plus size={12} /> Añadir</button>
        </div>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Visibilidad</span>
        <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
      </div>

      {error && <div className="ah-panel-error">{error}</div>}

      <div className="ah-panel-actions">
        <button className="ah-paction-cancel" onClick={onClose}>Cancelar</button>
        <button className="ah-paction-save" onClick={handleSubmit} disabled={saving}>
          {saving ? <span className="ah-pspin" /> : null}
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear jugador"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL: EQUIPO
// ══════════════════════════════════════════════════════════════════════════════
function TeamPanel({ team, onSave, onClose }) {
  const isEdit = !!team?.id;
  const [form, setForm] = useState(team?.id ? { ...team } : { ...TEAM_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError(null);
    try { await onSave(form, imageFile); onClose(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="ah-panel-form">
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Imagen</span>
        <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Escudo / Logo" />
      </div>
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Datos del equipo</span>
        <div className="ah-pgrid-2">
          <PField label="Nombre" required>
            <PInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="FC Barcelona" />
          </PField>
          <PField label="País">
            <PInput value={form.country || ""} onChange={e => set("country", e.target.value)} placeholder="España" />
          </PField>
          <PField label="Año fundación">
            <PInput type="number" value={form.founded_year || ""} onChange={e => set("founded_year", e.target.value)} placeholder="1899" />
          </PField>
          <PField label="Era de dominancia">
            <PInput value={form.era_dominance || ""} onChange={e => set("era_dominance", e.target.value)} placeholder="2008-2015" />
          </PField>
          <PField label="Tipo de legado">
            <PSelect value={form.legacy_type || ""} onChange={e => set("legacy_type", e.target.value)}>
              <option value="">— Selecciona —</option>
              {LEGACY_TEAM.map(l => <option key={l}>{l}</option>)}
            </PSelect>
          </PField>
        </div>
        <PField label="Descripción histórica">
          <PTextarea rows={4} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Historia y legado del equipo..." />
        </PField>
      </div>
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Visibilidad</span>
        <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
      </div>
      {error && <div className="ah-panel-error">{error}</div>}
      <div className="ah-panel-actions">
        <button className="ah-paction-cancel" onClick={onClose}>Cancelar</button>
        <button className="ah-paction-save" onClick={handleSubmit} disabled={saving}>
          {saving ? <span className="ah-pspin" /> : null}
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear equipo"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL: COMPETENCIA
// ══════════════════════════════════════════════════════════════════════════════
function CompetitionPanel({ competition, teams, onSave, onClose }) {
  const isEdit = !!competition?.id;
  const [form, setForm] = useState(competition?.id ? { ...competition } : { ...COMP_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError(null);
    try { await onSave(form, imageFile); onClose(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="ah-panel-form">
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Imagen</span>
        <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Logo de la competencia" />
      </div>
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Datos</span>
        <div className="ah-pgrid-2">
          <PField label="Nombre" required>
            <PInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="World Cup 1986" />
          </PField>
          <PField label="Tipo">
            <PSelect value={form.type || ""} onChange={e => set("type", e.target.value)}>
              <option value="">— Selecciona —</option>
              {COMP_TYPES.map(t => <option key={t}>{t}</option>)}
            </PSelect>
          </PField>
          <PField label="Año">
            <PInput type="number" value={form.year || ""} onChange={e => set("year", e.target.value)} placeholder="1986" />
          </PField>
          <PField label="Equipo campeón">
            <PSelect value={form.winner_team_id || ""} onChange={e => set("winner_team_id", e.target.value)}>
              <option value="">— Ninguno —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </PSelect>
          </PField>
        </div>
        <PField label="Contexto histórico">
          <PTextarea rows={4} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descripción y contexto..." />
        </PField>
      </div>
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Visibilidad</span>
        <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
      </div>
      {error && <div className="ah-panel-error">{error}</div>}
      <div className="ah-panel-actions">
        <button className="ah-paction-cancel" onClick={onClose}>Cancelar</button>
        <button className="ah-paction-save" onClick={handleSubmit} disabled={saving}>
          {saving ? <span className="ah-pspin" /> : null}
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear competencia"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL: EVENTO
// ══════════════════════════════════════════════════════════════════════════════
function EventPanel({ event, players, teams, competitions, onSave, onClose, onGetRelations, onSetRelations }) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState(event?.id ? { ...event } : { ...EVENT_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [relations, setRelations] = useState({ playerIds: [], teamIds: [], competitionIds: [] });

  useState(() => {
    if (isEdit && event?.id) {
      onGetRelations(event.id).then(rel => {
        setRelations({
          playerIds:      rel.players.map(p => p.player_id),
          teamIds:        rel.teams.map(t => t.team_id),
          competitionIds: rel.competitions.map(c => c.competition_id),
        });
      });
    }
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleId = (key, id) => {
    setRelations(r => ({
      ...r,
      [key]: r[key].includes(id) ? r[key].filter(x => x !== id) : [...r[key], id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      const saved = await onSave(form, imageFile);
      if (saved?.id) await onSetRelations(saved.id, relations);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="ah-panel-form">
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Imagen</span>
        <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Foto del evento" />
      </div>
      <div className="ah-panel-section">
        <span className="ah-panel-sep">Datos del evento</span>
        <PField label="Título" required>
          <PInput value={form.title} onChange={e => set("title", e.target.value)} placeholder="La Mano de Dios" />
        </PField>
        <div className="ah-pgrid-2">
          <PField label="Tipo de evento">
            <PSelect value={form.event_type || ""} onChange={e => set("event_type", e.target.value)}>
              <option value="">— Selecciona —</option>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </PSelect>
          </PField>
          <PField label="Fecha">
            <PInput type="date" value={form.event_date || ""} onChange={e => set("event_date", e.target.value)} />
          </PField>
        </div>
        <PField label="Narrativa completa">
          <PTextarea rows={4} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descripción detallada..." />
        </PField>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Jugadores involucrados</span>
        <div className="ah-check-list">
          {players.map(p => (
            <label key={p.id} className="ah-check-item">
              <input type="checkbox" checked={relations.playerIds.includes(p.id)} onChange={() => toggleId("playerIds", p.id)} />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Equipos</span>
        <div className="ah-check-list">
          {teams.map(t => (
            <label key={t.id} className="ah-check-item">
              <input type="checkbox" checked={relations.teamIds.includes(t.id)} onChange={() => toggleId("teamIds", t.id)} />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Competencias</span>
        <div className="ah-check-list">
          {competitions.map(c => (
            <label key={c.id} className="ah-check-item">
              <input type="checkbox" checked={relations.competitionIds.includes(c.id)} onChange={() => toggleId("competitionIds", c.id)} />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="ah-panel-section">
        <span className="ah-panel-sep">Visibilidad</span>
        <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
      </div>

      {error && <div className="ah-panel-error">{error}</div>}
      <div className="ah-panel-actions">
        <button className="ah-paction-cancel" onClick={onClose}>Cancelar</button>
        <button className="ah-paction-save" onClick={handleSubmit} disabled={saving}>
          {saving ? <span className="ah-pspin" /> : null}
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL VACÍO (placeholder)
// ══════════════════════════════════════════════════════════════════════════════
function EmptyPanel({ activeTab }) {
  const tab = TABS.find(t => t.key === activeTab);
  const Icon = tab?.Icon || BookOpen;
  return (
    <div className="ah-empty-panel">
      <div className="ah-ep-icon"><Icon size={28} strokeWidth={1.2} /></div>
      <p className="ah-ep-title">Selecciona un registro</p>
      <p className="ah-ep-sub">Haz click en <Pencil size={11} /> para editar, o usa el botón "Nuevo" para crear.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LISTA GENÉRICA
// ══════════════════════════════════════════════════════════════════════════════
function HistoricalList({ items, onEdit, onDelete, onTogglePublish, renderTitle, renderMeta, emptyMsg, selectedId }) {
  const [confirmId, setConfirmId] = useState(null);

  if (items.length === 0)
    return <p className="ah-list-empty">{emptyMsg}</p>;

  return (
    <div className="ah-list">
      {items.map(item => (
        <div key={item.id} className={`ah-list-row ${item.id === selectedId ? "ah-list-row--active" : ""}`}>
          {item.image_path ? (
            <img src={getHistoricalImageUrl(item.image_path)} alt="" className="ah-list-img" />
          ) : (
            <div className="ah-list-img-ph">📷</div>
          )}
          <div className="ah-list-info">
            <span className="ah-list-title">{renderTitle(item)}</span>
            <span className="ah-list-meta">{renderMeta(item)}</span>
          </div>
          <div className="ah-list-actions">
            <button
              className={`ah-pub-pill ${item.is_published ? "ah-pub-pill--on" : "ah-pub-pill--off"}`}
              onClick={() => onTogglePublish(item.id, item.is_published)}
              title={item.is_published ? "Publicado — click para ocultar" : "Borrador — click para publicar"}
            >
              {item.is_published
                ? <><Eye size={10} /> Pub</>
                : <><EyeOff size={10} /> Draft</>
              }
            </button>
            <button className="ah-list-btn ah-list-btn--edit" onClick={() => onEdit(item)} title="Editar"><Pencil size={12} /></button>
            {confirmId === item.id ? (
              <>
                <button className="ah-list-btn ah-list-btn--confirm" onClick={() => { onDelete(item.id); setConfirmId(null); }}><Check size={12} /></button>
                <button className="ah-list-btn ah-list-btn--cancel-del" onClick={() => setConfirmId(null)}><X size={12} /></button>
              </>
            ) : (
              <button className="ah-list-btn ah-list-btn--del" onClick={() => setConfirmId(item.id)} title="Eliminar"><Trash2 size={12} /></button>
            )}
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
  const [panel, setPanel]         = useState(null); // { type, data }
  const [search, setSearch]       = useState("");

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

  const q = search.toLowerCase();
  const filteredPlayers      = players.filter(p => p.name.toLowerCase().includes(q));
  const filteredTeams        = teams.filter(t => t.name.toLowerCase().includes(q));
  const filteredCompetitions = competitions.filter(c => c.name.toLowerCase().includes(q));
  const filteredEvents       = events.filter(e => e.title.toLowerCase().includes(q));

  const openCreate = () => setPanel({ type: activeTab, data: null });
  const openEdit   = (data) => setPanel({ type: activeTab, data });
  const closePanel = () => setPanel(null);

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

  const stats = [
    { label: "Jugadores",    count: players.length,      pub: players.filter(x => x.is_published).length,      Icon: Users2  },
    { label: "Equipos",      count: teams.length,        pub: teams.filter(x => x.is_published).length,        Icon: Shield  },
    { label: "Competencias", count: competitions.length, pub: competitions.filter(x => x.is_published).length, Icon: Trophy  },
    { label: "Eventos",      count: events.length,       pub: events.filter(x => x.is_published).length,       Icon: Zap     },
  ];

  const tabCounts = {
    players: players.length,
    teams: teams.length,
    competitions: competitions.length,
    events: events.length,
  };

  const selectedId = panel?.data?.id || null;

  return (
    <div className="ah-root">

      {/* ── Stats strip ── */}
      <div className="ah-stats-strip">
        {stats.map(s => (
          <div key={s.label} className="ah-stat-cell">
            <div className="ah-stat-icon-wrap"><s.Icon size={18} /></div>
            <div className="ah-stat-body">
              <span className="ah-stat-n">{s.count}</span>
              <span className="ah-stat-lbl">{s.label}</span>
            </div>
            <span className="ah-stat-pub">{s.pub} pub.</span>
          </div>
        ))}
      </div>

      {/* ── Shell: list + panel ── */}
      <div className="ah-shell">

        {/* ── LEFT: tabs + search + list ── */}
        <div className="ah-left">

          {/* Tabs */}
          <div className="ah-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`ah-tab ${activeTab === t.key ? "ah-tab--active" : ""}`}
                onClick={() => { setActiveTab(t.key); setSearch(""); closePanel(); }}
              >
                <t.Icon size={13} />
                <span>{t.label}</span>
                <span className="ah-tab-count">{tabCounts[t.key]}</span>
              </button>
            ))}
          </div>

          {/* Controls bar */}
          <div className="ah-controls">
            <div className="ah-search">
              <Search size={12} className="ah-search-ico" />
              <input
                className="ah-search-input"
                placeholder={`Buscar ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="ah-search-clear" onClick={() => setSearch("")}><X size={11} /></button>}
            </div>
            <button className="ah-new-btn" onClick={openCreate}>
              <Plus size={12} />
              Nuevo {TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}
            </button>
          </div>

          {/* List */}
          <div className="ah-list-area">
            {loading && <div className="ah-loading-msg"><RefreshCw size={14} className="ah-spin" /> Cargando...</div>}
            {error && (
              <div className="ah-error-msg">
                <AlertCircle size={16} />
                <p>{error}</p>
                <button className="ah-retry-btn" onClick={loadAll}><RefreshCw size={11} /> Reintentar</button>
              </div>
            )}
            {!loading && !error && (
              <>
                {activeTab === "players" && (
                  <HistoricalList
                    items={filteredPlayers}
                    selectedId={selectedId}
                    onEdit={openEdit}
                    onDelete={deletePlayer}
                    onTogglePublish={togglePlayerPublished}
                    renderTitle={p => p.name}
                    renderMeta={p => [p.country, p.position, p.era, p.legacy_type].filter(Boolean).join(" · ")}
                    emptyMsg="No hay jugadores históricos."
                  />
                )}
                {activeTab === "teams" && (
                  <HistoricalList
                    items={filteredTeams}
                    selectedId={selectedId}
                    onEdit={openEdit}
                    onDelete={deleteTeam}
                    onTogglePublish={toggleTeamPublished}
                    renderTitle={t => t.name}
                    renderMeta={t => [t.country, t.era_dominance, t.legacy_type].filter(Boolean).join(" · ")}
                    emptyMsg="No hay equipos históricos."
                  />
                )}
                {activeTab === "competitions" && (
                  <HistoricalList
                    items={filteredCompetitions}
                    selectedId={selectedId}
                    onEdit={openEdit}
                    onDelete={deleteCompetition}
                    onTogglePublish={toggleCompetitionPublished}
                    renderTitle={c => c.name}
                    renderMeta={c => [c.type, c.year ? String(c.year) : null].filter(Boolean).join(" · ")}
                    emptyMsg="No hay competencias."
                  />
                )}
                {activeTab === "events" && (
                  <HistoricalList
                    items={filteredEvents}
                    selectedId={selectedId}
                    onEdit={openEdit}
                    onDelete={deleteEvent}
                    onTogglePublish={toggleEventPublished}
                    renderTitle={e => e.title}
                    renderMeta={e => [e.event_type, e.event_date].filter(Boolean).join(" · ")}
                    emptyMsg="No hay eventos históricos."
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: panel ── */}
        <aside className="ah-right">
          {/* Panel header */}
          <div className="ah-panel-header">
            <div className="ah-panel-header-left">
              <span className="ah-panel-dot" />
              <span className="ah-panel-title">
                {panel
                  ? (panel.data ? `Editar ${TABS.find(t => t.key === activeTab)?.label.slice(0,-1)}` : `Nuevo ${TABS.find(t => t.key === activeTab)?.label.slice(0,-1)}`)
                  : "Panel"}
              </span>
            </div>
            {panel && (
              <button className="ah-panel-back" onClick={closePanel}>
                <ChevronLeft size={12} /> Volver
              </button>
            )}
          </div>

          {/* Panel body */}
          <div className="ah-panel-body">
            {!panel && <EmptyPanel activeTab={activeTab} />}

            {panel?.type === "players" && (
              <PlayerPanel
                player={panel.data}
                teams={teams}
                onSave={handleSavePlayer}
                onClose={closePanel}
                onGetPlayerTeams={getPlayerTeams}
                onSetPlayerTeams={setPlayerTeams}
              />
            )}
            {panel?.type === "teams" && (
              <TeamPanel
                team={panel.data}
                onSave={handleSaveTeam}
                onClose={closePanel}
              />
            )}
            {panel?.type === "competitions" && (
              <CompetitionPanel
                competition={panel.data}
                teams={teams}
                onSave={handleSaveCompetition}
                onClose={closePanel}
              />
            )}
            {panel?.type === "events" && (
              <EventPanel
                event={panel.data}
                players={players}
                teams={teams}
                competitions={competitions}
                onSave={handleSaveEvent}
                onClose={closePanel}
                onGetRelations={getEventRelations}
                onSetRelations={setEventRelations}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}