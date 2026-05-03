import { useState, useRef, useEffect } from "react";
import {
  Users2, Shield, Trophy, Zap, Search, Camera, Pencil,
  Trash2, Check, X, ChevronLeft, Plus, Star, Eye, EyeOff,
  Upload, RefreshCw, AlertCircle, BookOpen, Link2, Flag, Award
} from "lucide-react";
import {
  useAdminHistorical,
  getHistoricalImageUrl,
} from "../../hooks/HooksAdmin/useAdminHistorical";
import "../../styles/StylesAdmin/AdminHistorical.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "players", label: "Jugadores", Icon: Users2 },
  { key: "teams", label: "Equipos", Icon: Shield },
  { key: "competitions", label: "Competencias", Icon: Trophy },
  { key: "events", label: "Eventos", Icon: Zap },
];

const POSITIONS = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
const LEGACY_PLAYER = ["Goal Scorer", "Tactician", "Innovator", "Leader", "Goalkeeper"];
const LEGACY_TEAM = ["Dynastic", "Innovative", "Continental", "National"];
const EVENT_TYPES = ["Championship", "Historic Match", "Legendary Performance", "Era Defining", "Record"];
const COMP_TYPES = ["International", "Continental", "Domestic"];
const FORMATIONS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];
const POSITION_ROLES = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "SS"];
const TITLE_CATEGORIES = ["club", "national", "individual"];

// ─── Mapas de traducción ──────────────────────────────────────────────────────
const POSITION_LABEL = {
  "Forward": "Delantero", "Midfielder": "Centrocampista",
  "Defender": "Defensor", "Goalkeeper": "Portero",
};
const LEGACY_PLAYER_LABEL = {
  "Goal Scorer": "Goleador", "Tactician": "Táctico",
  "Innovator": "Genio", "Leader": "Líder", "Goalkeeper": "Portero",
};
const LEGACY_TEAM_LABEL = {
  "Dynastic": "Dinástico", "Innovative": "Innovador",
  "Continental": "Continental", "National": "Nacional",
};
const EVENT_TYPE_LABEL = {
  "Championship": "Campeonato", "Historic Match": "Partido Histórico",
  "Legendary Performance": "Actuación Legendaria",
  "Era Defining": "Definió una Era", "Record": "Récord",
};
const COMP_TYPE_LABEL = {
  "International": "Internacional", "Continental": "Continental",
  "Domestic": "Nacional / Doméstico",
};
const TITLE_CAT_LABEL = {
  "club": "Club", "national": "Selección", "individual": "Individual",
};

// ─── Posiciones por defecto según formación ───────────────────────────────────
const FORMATION_DEFAULTS = {
  "4-3-3": [
    { shirt_number: 1, position_role: "GK", pos_x: 50, pos_y: 88 },
    { shirt_number: 2, position_role: "RB", pos_x: 20, pos_y: 70 },
    { shirt_number: 3, position_role: "CB", pos_x: 40, pos_y: 70 },
    { shirt_number: 4, position_role: "CB", pos_x: 60, pos_y: 70 },
    { shirt_number: 5, position_role: "LB", pos_x: 80, pos_y: 70 },
    { shirt_number: 6, position_role: "CDM", pos_x: 50, pos_y: 52 },
    { shirt_number: 7, position_role: "CM", pos_x: 30, pos_y: 52 },
    { shirt_number: 8, position_role: "CM", pos_x: 70, pos_y: 52 },
    { shirt_number: 9, position_role: "ST", pos_x: 50, pos_y: 20 },
    { shirt_number: 10, position_role: "LW", pos_x: 80, pos_y: 20 },
    { shirt_number: 11, position_role: "RW", pos_x: 20, pos_y: 20 },
  ],
  "4-4-2": [
    { shirt_number: 1, position_role: "GK", pos_x: 50, pos_y: 88 },
    { shirt_number: 2, position_role: "RB", pos_x: 20, pos_y: 70 },
    { shirt_number: 3, position_role: "CB", pos_x: 38, pos_y: 70 },
    { shirt_number: 4, position_role: "CB", pos_x: 62, pos_y: 70 },
    { shirt_number: 5, position_role: "LB", pos_x: 80, pos_y: 70 },
    { shirt_number: 6, position_role: "RM", pos_x: 20, pos_y: 46 },
    { shirt_number: 7, position_role: "CM", pos_x: 38, pos_y: 46 },
    { shirt_number: 8, position_role: "CM", pos_x: 62, pos_y: 46 },
    { shirt_number: 9, position_role: "LM", pos_x: 80, pos_y: 46 },
    { shirt_number: 10, position_role: "ST", pos_x: 38, pos_y: 18 },
    { shirt_number: 11, position_role: "ST", pos_x: 62, pos_y: 18 },
  ],
  "3-5-2": [
    { shirt_number: 1, position_role: "GK", pos_x: 50, pos_y: 88 },
    { shirt_number: 2, position_role: "CB", pos_x: 25, pos_y: 70 },
    { shirt_number: 3, position_role: "CB", pos_x: 50, pos_y: 70 },
    { shirt_number: 4, position_role: "CB", pos_x: 75, pos_y: 70 },
    { shirt_number: 5, position_role: "RM", pos_x: 15, pos_y: 50 },
    { shirt_number: 6, position_role: "CM", pos_x: 35, pos_y: 50 },
    { shirt_number: 7, position_role: "CDM", pos_x: 50, pos_y: 50 },
    { shirt_number: 8, position_role: "CM", pos_x: 65, pos_y: 50 },
    { shirt_number: 9, position_role: "LM", pos_x: 85, pos_y: 50 },
    { shirt_number: 10, position_role: "ST", pos_x: 35, pos_y: 18 },
    { shirt_number: 11, position_role: "ST", pos_x: 65, pos_y: 18 },
  ],
  "4-2-3-1": [
    { shirt_number: 1, position_role: "GK", pos_x: 50, pos_y: 88 },
    { shirt_number: 2, position_role: "RB", pos_x: 20, pos_y: 70 },
    { shirt_number: 3, position_role: "CB", pos_x: 40, pos_y: 70 },
    { shirt_number: 4, position_role: "CB", pos_x: 60, pos_y: 70 },
    { shirt_number: 5, position_role: "LB", pos_x: 80, pos_y: 70 },
    { shirt_number: 6, position_role: "CDM", pos_x: 38, pos_y: 56 },
    { shirt_number: 7, position_role: "CDM", pos_x: 62, pos_y: 56 },
    { shirt_number: 8, position_role: "RW", pos_x: 20, pos_y: 36 },
    { shirt_number: 9, position_role: "CAM", pos_x: 50, pos_y: 36 },
    { shirt_number: 10, position_role: "LW", pos_x: 80, pos_y: 36 },
    { shirt_number: 11, position_role: "ST", pos_x: 50, pos_y: 16 },
  ],
};

// ─── Objetos vacíos ───────────────────────────────────────────────────────────
const PLAYER_EMPTY = {
  name: "", country: "", position: "", birth_year: "", death_year: "",
  era: "", legacy_type: "", significance_level: 3,
  description: "", impact_summary: "", is_published: false,
};
const TEAM_EMPTY = {
  name: "", country: "", founded_year: "", era_dominance: "",
  legacy_type: "", description: "", historical_note: "",
  primary_color: "#5b4fd8", secondary_color: "#ffffff",
  formation: "4-3-3", titles_count: 0,
  active_years: "", manager: "", is_published: false,
};
const COMP_EMPTY = {
  name: "", type: "", year: "", description: "",
  winner_team_id: "", is_published: false,
};
const EVENT_EMPTY = {
  title: "", event_type: "", event_date: "",
  description: "", is_published: false,
};

const EMPTY_LINEUP_PLAYER = (num) => ({
  shirt_number: num, player_name: "", position_role: "", pos_x: 50, pos_y: 50,
});

const EMPTY_CAREER_ROW = () => ({
  _id: Date.now() + Math.random(),
  team_name: "", team_country: "", start_year: "", end_year: "",
  appearances: "", goals: "", assists: "", role_note: "", sort_order: 0,
});

const EMPTY_NATIONAL_ROW = () => ({
  _id: Date.now() + Math.random(),
  country: "", start_year: "", end_year: "",
  caps: "", goals: "", assists: "", role_note: "",
});

const EMPTY_TITLE_ROW = () => ({
  _id: Date.now() + Math.random(),
  title_category: "club", title_name: "", year: "",
  team_name: "", quantity: 1,
});

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
      {url
        ? <img src={url} alt={label} className="ah-img-preview" />
        : <div className="ah-img-placeholder"><Camera size={22} strokeWidth={1.5} /><span>{label}</span></div>
      }
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChange} />
      <div className="ah-img-overlay"><span>Cambiar</span></div>
    </div>
  );
}

function SignificancePicker({ value, onChange }) {
  const labels = ["", "Histórico", "Notable", "Estrella", "Leyenda", "GOAT Status"];
  return (
    <div className="ah-significance">
      {[1, 2, 3, 4, 5].map(n => (
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
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span className="ah-pub-track"><span className="ah-pub-thumb" /></span>
      <span className="ah-pub-label">{checked ? "Publicado" : "Borrador"}</span>
    </label>
  );
}

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

function PInput(props) { return <input className="ah-pinput" {...props} />; }
function PSelect({ children, ...props }) {
  return <select className="ah-pinput" {...props}>{children}</select>;
}
function PTextarea(props) {
  return <textarea className="ah-pinput ah-ptextarea" {...props} />;
}

// ── Tabla editable genérica ───────────────────────────────────────────────────
function EditableTable({ columns, rows, onAdd, onRemove, onUpdate, addLabel = "Añadir fila" }) {
  return (
    <div className="ah-etable-wrap">
      <div className="ah-etable">
        <div className="ah-etable-head">
          {columns.map(col => (
            <span key={col.key} className="ah-etable-th" style={{ flex: col.flex || 1 }}>{col.label}</span>
          ))}
          <span className="ah-etable-th ah-etable-th--del" />
        </div>
        {rows.length === 0 && (
          <div className="ah-etable-empty">Sin registros — usa el botón para añadir</div>
        )}
        {rows.map((row, idx) => (
          <div key={row.id || row._id || idx} className="ah-etable-row">
            {columns.map(col => (
              <div key={col.key} style={{ flex: col.flex || 1, minWidth: 0 }}>
                {col.type === "select" ? (
                  <select
                    className="ah-pinput ah-etable-input"
                    value={row[col.key] ?? ""}
                    onChange={e => onUpdate(idx, col.key, e.target.value)}
                  >
                    {col.options.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="ah-pinput ah-etable-input"
                    type={col.type || "text"}
                    placeholder={col.placeholder || ""}
                    value={row[col.key] ?? ""}
                    onChange={e => onUpdate(idx, col.key, e.target.value)}
                  />
                )}
              </div>
            ))}
            <button type="button" className="ah-etable-del" onClick={() => onRemove(idx)}>
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="ah-add-link-btn ah-etable-add" onClick={onAdd}>
        <Plus size={11} /> {addLabel}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL: JUGADOR
// ══════════════════════════════════════════════════════════════════════════════
function PlayerPanel({ player, teams, onSave, onClose, onGetPlayerTeams, onSetPlayerTeams,
  onGetCareer, onSetCareer, onGetNational, onSetNational, onGetTitles, onSetTitles }) {
  const isEdit = !!player?.id;
  const [form, setForm] = useState(player?.id ? { ...player } : { ...PLAYER_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");

  // Equipos donde jugó (relación legacy)
  const [playerTeams, setPlayerTeams] = useState([]);
  const [teamLink, setTeamLink] = useState({ team_id: "", start_year: "", end_year: "", roles: "" });

  // Nuevas secciones
  const [career, setCareer] = useState([]);
  const [national, setNational] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useState(() => {
    if (!isEdit) return;
    setLoadingData(true);
    Promise.all([
      onGetPlayerTeams(player.id),
      onGetCareer ? onGetCareer(player.id) : Promise.resolve([]),
      onGetNational ? onGetNational(player.id) : Promise.resolve([]),
      onGetTitles ? onGetTitles(player.id) : Promise.resolve([]),
    ]).then(([pt, ca, na, ti]) => {
      setPlayerTeams(pt || []);
      setCareer((ca || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
      setNational((na || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
      setTitles((ti || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
    }).catch(() => { }).finally(() => setLoadingData(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Helpers para tablas
  const updateRow = (setter) => (idx, key, val) =>
    setter(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

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
      const id = saved?.id || player?.id;
      if (id) {
        await onSetPlayerTeams(id, playerTeams);
        if (onSetCareer) await onSetCareer(id, career.map(({ _id, ...r }) => r));
        if (onSetNational) await onSetNational(id, national.map(({ _id, ...r }) => r));
        if (onSetTitles) await onSetTitles(id, titles.map(({ _id, ...r }) => r));
      }
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Columnas de tablas
  const careerCols = [
    { key: "team_name", label: "Club", flex: 2, placeholder: "FC Barcelona" },
    { key: "team_country", label: "País", flex: 1, placeholder: "España" },
    { key: "start_year", label: "Desde", flex: 1, type: "number", placeholder: "1995" },
    { key: "end_year", label: "Hasta", flex: 1, type: "number", placeholder: "2000" },
    { key: "appearances", label: "PJ", flex: 1, type: "number", placeholder: "0" },
    { key: "goals", label: "Goles", flex: 1, type: "number", placeholder: "0" },
    { key: "assists", label: "Asist.", flex: 1, type: "number", placeholder: "0" },
    { key: "role_note", label: "Nota", flex: 1, placeholder: "Capitán..." },
  ];

  const nationalCols = [
    { key: "country", label: "Selección", flex: 2, placeholder: "Argentina" },
    { key: "start_year", label: "Desde", flex: 1, type: "number", placeholder: "1995" },
    { key: "end_year", label: "Hasta", flex: 1, type: "number", placeholder: "2006" },
    { key: "caps", label: "Partidos", flex: 1, type: "number", placeholder: "0" },
    { key: "goals", label: "Goles", flex: 1, type: "number", placeholder: "0" },
    { key: "assists", label: "Asist.", flex: 1, type: "number", placeholder: "0" },
    { key: "role_note", label: "Nota", flex: 1, placeholder: "Capitán..." },
  ];

  const titleCols = [
    {
      key: "title_category", label: "Categoría", flex: 1, type: "select",
      options: TITLE_CATEGORIES.map(c => ({ value: c, label: TITLE_CAT_LABEL[c] })),
    },
    { key: "title_name", label: "Título", flex: 2, placeholder: "Champions League" },
    { key: "year", label: "Año", flex: 1, type: "text", placeholder: "2000" },
    { key: "team_name", label: "Con", flex: 2, placeholder: "Real Madrid" },
    { key: "quantity", label: "×", flex: 1, type: "number", placeholder: "1" },
  ];

  const PLAYER_TABS = [
    { key: "info", label: "Info" },
    { key: "career", label: "Trayectoria Clubes" },
    { key: "national", label: "Selección" },
    { key: "titles", label: "Palmarés" },
    { key: "teams", label: "Vínculos" },
  ];

  return (
    <div className="ah-panel-form">
      <div className="ah-inner-tabs ah-inner-tabs--scroll">
        {PLAYER_TABS.map(({ key, label }) => (
          <button key={key} type="button"
            className={`ah-inner-tab ${tab === key ? "ah-inner-tab--active" : ""}`}
            onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB INFO ── */}
      {tab === "info" && <>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Imagen</span>
          <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Foto del jugador" />
        </div>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Identidad</span>
          <div className="ah-pgrid-3">
            <PField label="Nombre" required>
              <PInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="Pelé" />
            </PField>
            <PField label="País">
              <PInput value={form.country || ""} onChange={e => set("country", e.target.value)} placeholder="Brasil" />
            </PField>
            <PField label="Posición">
              <PSelect value={form.position || ""} onChange={e => set("position", e.target.value)}>
                <option value="">— Selecciona —</option>
                {POSITIONS.map(p => <option key={p} value={p}>{POSITION_LABEL[p] || p}</option>)}
              </PSelect>
            </PField>
            <PField label="Tipo de legado">
              <PSelect value={form.legacy_type || ""} onChange={e => set("legacy_type", e.target.value)}>
                <option value="">— Selecciona —</option>
                {LEGACY_PLAYER.map(l => <option key={l} value={l}>{LEGACY_PLAYER_LABEL[l] || l}</option>)}
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
          <PField label="Descripción">
            <PTextarea rows={4} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Biografía e historia..." />
          </PField>
          <PField label="Por qué importa">
            <PTextarea rows={2} value={form.impact_summary || ""} onChange={e => set("impact_summary", e.target.value)} placeholder="Su impacto en la historia..." />
          </PField>
        </div>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Visibilidad</span>
          <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
        </div>
      </>}

      {/* ── TAB TRAYECTORIA CLUBES ── */}
      {tab === "career" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep"><Shield size={10} /> Trayectoria en Clubes</span>
          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={careerCols}
              rows={career}
              onAdd={() => setCareer(prev => [...prev, EMPTY_CAREER_ROW()])}
              onRemove={idx => setCareer(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={updateRow(setCareer)}
              addLabel="Añadir club"
            />
          )}
          <span className="ah-phint" style={{ marginTop: 4 }}>
            PJ = Partidos jugados. Deja en 0 si no tienes el dato.
          </span>
        </div>
      )}

      {/* ── TAB SELECCIÓN NACIONAL ── */}
      {tab === "national" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep"><Flag size={10} /> Trayectoria en Selección</span>
          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={nationalCols}
              rows={national}
              onAdd={() => setNational(prev => [...prev, EMPTY_NATIONAL_ROW()])}
              onRemove={idx => setNational(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={updateRow(setNational)}
              addLabel="Añadir selección"
            />
          )}
          <span className="ah-phint" style={{ marginTop: 4 }}>
            Partidos = Caps internacionales.
          </span>
        </div>
      )}

      {/* ── TAB PALMARÉS ── */}
      {tab === "titles" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep"><Award size={10} /> Palmarés</span>
          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={titleCols}
              rows={titles}
              onAdd={() => setTitles(prev => [...prev, EMPTY_TITLE_ROW()])}
              onRemove={idx => setTitles(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={updateRow(setTitles)}
              addLabel="Añadir título"
            />
          )}
          <div className="ah-titles-legend">
            <span className="ah-tleg-item ah-tleg--club">Club</span>
            <span className="ah-tleg-item ah-tleg--national">Selección</span>
            <span className="ah-tleg-item ah-tleg--individual">Individual</span>
          </div>
        </div>
      )}

      {/* ── TAB VÍNCULOS (legacy) ── */}
      {tab === "teams" && (
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Equipos vinculados</span>
          <span className="ah-phint" style={{ marginBottom: 8 }}>
            Vinculación de referencia cruzada entre jugador y equipo histórico.
          </span>
          {playerTeams.length > 0 && (
            <div className="ah-team-chips">
              {playerTeams.map(pt => {
                const team = teams.find(t => t.id === pt.team_id);
                return (
                  <div key={pt.team_id} className="ah-team-chip">
                    <span className="ah-tc-name">{team?.name || pt.team_id}</span>
                    <span className="ah-tc-years">{pt.start_year || "?"} – {pt.end_year || "?"}</span>
                    <button type="button" className="ah-tc-remove"
                      onClick={() => setPlayerTeams(prev => prev.filter(t => t.team_id !== pt.team_id))}>
                      <X size={10} />
                    </button>
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
            <PInput type="number" placeholder="Desde" value={teamLink.start_year}
              onChange={e => setTeamLink(t => ({ ...t, start_year: e.target.value }))} />
            <PInput type="number" placeholder="Hasta" value={teamLink.end_year}
              onChange={e => setTeamLink(t => ({ ...t, end_year: e.target.value }))} />
            <button type="button" className="ah-add-link-btn" onClick={addTeamLink}>
              <Plus size={12} /> Añadir
            </button>
          </div>
        </div>
      )}

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

function TeamPanel({ team, competitions, onSave, onClose, onGetLineup, onSetLineup, onGetTitles, onSetTitles }) {
  const isEdit = !!team?.id;
  const [form, setForm] = useState(team?.id ? { ...team } : { ...TEAM_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");
  const [loadingData, setLoadingData] = useState(false);

  const [lineup, setLineup] = useState(
    Array.from({ length: 11 }, (_, i) => EMPTY_LINEUP_PLAYER(i + 1))
  );
  const [titles, setTitles] = useState([]);
  const [newTitle, setNewTitle] = useState({ title_name: "", year: "", competition_id: "" });

  // ✅ BUG 1 CORREGIDO: useEffect en lugar de useState para cargar datos async
  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);
    Promise.all([onGetLineup(team.id), onGetTitles(team.id)])
      .then(([lin, tit]) => {
        if (lin && lin.length > 0) {
          setLineup(
            Array.from({ length: 11 }, (_, i) => {
              const found = lin.find(p => p.shirt_number === i + 1);
              return found
                ? {
                  shirt_number: i + 1,
                  player_name: found.player_name || "",
                  position_role: found.position_role || "",
                  pos_x: found.pos_x ?? 50,
                  pos_y: found.pos_y ?? 50,
                }
                : EMPTY_LINEUP_PLAYER(i + 1);
            })
          );
        }
        // ✅ BUG 2 CORREGIDO: guardamos solo los campos que necesitamos de los títulos existentes
        setTitles(
          (tit || []).map(t => ({
            _dbId: t.id,            // referencia interna, no se envía a Supabase
            title_name: t.title_name,
            year: t.year || "",
            competition_id: t.competition_id || "",
          }))
        );
      })
      .catch(() => { })
      .finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyFormation = (formation) => {
    const defaults = FORMATION_DEFAULTS[formation];
    if (!defaults) return;
    setLineup(prev =>
      prev.map(p => {
        const def = defaults.find(d => d.shirt_number === p.shirt_number);
        return def ? { ...p, position_role: def.position_role, pos_x: def.pos_x, pos_y: def.pos_y } : p;
      })
    );
    set("formation", formation);
  };

  const updateLineupPlayer = (num, field, val) =>
    setLineup(prev => prev.map(p => p.shirt_number === num ? { ...p, [field]: val } : p));

  const addTitle = () => {
    if (!newTitle.title_name.trim()) return;
    setTitles(prev => [
      ...prev,
      {
        title_name: newTitle.title_name.trim(),
        year: newTitle.year || "",
        competition_id: newTitle.competition_id || "",
      },
    ]);
    setNewTitle({ title_name: "", year: "", competition_id: "" });
  };

  const removeTitle = (idx) => setTitles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      console.log("1. Guardando form...");
      const saved = await onSave(form, imageFile);
      console.log("2. Equipo guardado:", saved);
      const id = saved?.id || team?.id;
      console.log("3. ID del equipo:", id);
      console.log("4. Títulos a guardar:", titles);

      if (id) {
        const lineupToSave = lineup.filter(p => p.player_name && p.player_name.trim() !== "");
        console.log("5. Lineup a guardar:", lineupToSave);
        await onSetLineup(id, lineupToSave);
        console.log("6. Lineup guardado OK");

        const titlesToSave = titles.map(({ title_name, year, competition_id }) => ({
          title_name,
          year: year ? String(year).trim() : null,
          competition_id: competition_id || null,
        }));
        console.log("7. titlesToSave:", titlesToSave);
        await onSetTitles(id, titlesToSave);
        console.log("8. Títulos guardados OK");
      }
      onClose();
    } catch (err) {
      console.error("ERROR:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ah-panel-form">
      <div className="ah-inner-tabs">
        {[["info", "Info"], ["lineup", "Alineación"], ["titles", "Títulos"]].map(([k, l]) => (
          <button key={k} type="button"
            className={`ah-inner-tab ${tab === k ? "ah-inner-tab--active" : ""}`}
            onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === "info" && <>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Imagen</span>
          <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Escudo / Logo" />
        </div>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Datos básicos</span>
          <div className="ah-pgrid-3">
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
            <PField label="Años activos">
              <PInput value={form.active_years || ""} onChange={e => set("active_years", e.target.value)} placeholder="1974-1982" />
            </PField>
            <PField label="DT Emblemático">
              <PInput value={form.manager || ""} onChange={e => set("manager", e.target.value)} placeholder="Johan Cruyff" />
            </PField>
            <PField label="Tipo de legado">
              <PSelect value={form.legacy_type || ""} onChange={e => set("legacy_type", e.target.value)}>
                <option value="">— Selecciona —</option>
                {LEGACY_TEAM.map(l => <option key={l} value={l}>{LEGACY_TEAM_LABEL[l] || l}</option>)}
              </PSelect>
            </PField>
          </div>
        </div>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Colores del equipo</span>
          <div className="ah-pgrid-3">
            <PField label="Color primario (camiseta)">
              <div className="ah-color-row">
                <input type="color" className="ah-color-pick"
                  value={form.primary_color || "#5b4fd8"}
                  onChange={e => set("primary_color", e.target.value)} />
                <PInput value={form.primary_color || "#5b4fd8"}
                  onChange={e => set("primary_color", e.target.value)} placeholder="#5b4fd8" />
              </div>
            </PField>
            <PField label="Color secundario (detalles)">
              <div className="ah-color-row">
                <input type="color" className="ah-color-pick"
                  value={form.secondary_color || "#ffffff"}
                  onChange={e => set("secondary_color", e.target.value)} />
                <PInput value={form.secondary_color || "#ffffff"}
                  onChange={e => set("secondary_color", e.target.value)} placeholder="#ffffff" />
              </div>
            </PField>
          </div>
        </div>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Narrativa</span>
          <PField label="Descripción general">
            <PTextarea rows={3} value={form.description || ""}
              onChange={e => set("description", e.target.value)} placeholder="Historia del equipo..." />
          </PField>
          <PField label="Por qué es histórico">
            <PTextarea rows={3} value={form.historical_note || ""}
              onChange={e => set("historical_note", e.target.value)}
              placeholder="Lo que lo hace único e irrepetible..." />
          </PField>
        </div>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Visibilidad</span>
          <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
        </div>
      </>}

      {tab === "lineup" && (
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Formación y 11 titular</span>
          <div className="ah-formation-row">
            <PSelect value={form.formation || "4-3-3"}
              onChange={e => set("formation", e.target.value)}
              style={{ flex: 1 }}>
              {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </PSelect>
            <button type="button" className="ah-add-link-btn"
              onClick={() => applyFormation(form.formation || "4-3-3")}>
              Auto-posicionar
            </button>
          </div>
          {loadingData ? (
            <div className="ah-loading-msg">
              <RefreshCw size={12} className="ah-spin" /> Cargando...
            </div>
          ) : (
            <div className="ah-lineup-list">
              {lineup.map(p => (
                <div key={p.shirt_number} className="ah-lineup-row">
                  <span className="ah-lineup-num">{p.shirt_number}</span>
                  <PInput
                    placeholder="Nombre del jugador"
                    value={p.player_name || ""}
                    onChange={e => updateLineupPlayer(p.shirt_number, "player_name", e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <PSelect
                    value={p.position_role || ""}
                    onChange={e => updateLineupPlayer(p.shirt_number, "position_role", e.target.value)}
                    style={{ flex: 1 }}>
                    <option value="">Pos.</option>
                    {POSITION_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </PSelect>
                  <div className="ah-pos-inputs">
                    <input type="number" min="0" max="100" className="ah-pinput ah-pos-xy"
                      title="Pos X" placeholder="X" value={p.pos_x ?? 50}
                      onChange={e => updateLineupPlayer(p.shirt_number, "pos_x", parseFloat(e.target.value) || 0)} />
                    <input type="number" min="0" max="100" className="ah-pinput ah-pos-xy"
                      title="Pos Y" placeholder="Y" value={p.pos_y ?? 50}
                      onChange={e => updateLineupPlayer(p.shirt_number, "pos_y", parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <span className="ah-phint" style={{ marginTop: 6, display: "block" }}>
            X/Y 0–100. Y=88 portero · Y=16 delantero. Usa "Auto-posicionar" para rellenar desde la formación.
          </span>
        </div>
      )}

      {tab === "titles" && (
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Palmarés</span>

          {loadingData ? (
            <div className="ah-loading-msg">
              <RefreshCw size={12} className="ah-spin" /> Cargando...
            </div>
          ) : (
            <>
              {titles.length > 0 && (
                <div className="ah-team-chips">
                  {titles.map((t, i) => (
                    <div key={i} className="ah-team-chip">
                      <span className="ah-tc-name">{t.title_name}</span>
                      {t.year && <span className="ah-tc-years">{t.year}</span>}
                      <button type="button" className="ah-tc-remove" onClick={() => removeTitle(i)}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="ah-pgrid-2" style={{ marginTop: 10 }}>
                <PField label="Nombre del título" required>
                  <PInput
                    value={newTitle.title_name}
                    onChange={e => setNewTitle(t => ({ ...t, title_name: e.target.value }))}
                    placeholder="Copa del Mundo 1974"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTitle(); } }}
                  />
                </PField>
                <PField label="Año">
                  <PInput
                    type="text"
                    value={newTitle.year}
                    placeholder="1974 o 1971-1975"
                    onChange={e => setNewTitle(t => ({ ...t, year: e.target.value }))}
                  />
                </PField>
              </div>
              <PField label="Competencia (opcional)">
                <PSelect
                  value={newTitle.competition_id}
                  onChange={e => setNewTitle(t => ({ ...t, competition_id: e.target.value }))}>
                  <option value="">— Ninguna —</option>
                  {(competitions || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </PSelect>
              </PField>
              <button
                type="button"
                className="ah-add-link-btn"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                onClick={addTitle}
                disabled={!newTitle.title_name.trim()}>
                <Plus size={12} /> Añadir título
              </button>
            </>
          )}
        </div>
      )}

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
            <PInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="Copa del Mundo 1986" />
          </PField>
          <PField label="Tipo">
            <PSelect value={form.type || ""} onChange={e => set("type", e.target.value)}>
              <option value="">— Selecciona —</option>
              {COMP_TYPES.map(t => <option key={t} value={t}>{COMP_TYPE_LABEL[t] || t}</option>)}
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
          playerIds: rel.players.map(p => p.player_id),
          teamIds: rel.teams.map(t => t.team_id),
          competitionIds: rel.competitions.map(c => c.competition_id),
        });
      });
    }
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleId = (key, id) =>
    setRelations(r => ({
      ...r,
      [key]: r[key].includes(id) ? r[key].filter(x => x !== id) : [...r[key], id],
    }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      const saved = await onSave(form, imageFile);
      if (saved?.id) await onSetRelations(saved.id, relations);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
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
              {EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_TYPE_LABEL[t] || t}</option>)}
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
        <span className="ah-panel-sep">Equipos involucrados</span>
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
        <span className="ah-panel-sep">Competencias involucradas</span>
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
//  PANEL VACÍO
// ══════════════════════════════════════════════════════════════════════════════
function EmptyPanel({ activeTab }) {
  const tab = TABS.find(t => t.key === activeTab);
  const Icon = tab?.Icon || BookOpen;
  return (
    <div className="ah-empty-panel">
      <div className="ah-ep-icon"><Icon size={28} strokeWidth={1.2} /></div>
      <p className="ah-ep-title">Selecciona un registro</p>
      <p className="ah-ep-sub">Haz clic en <Pencil size={11} /> para editar, o usa "Nuevo" para crear.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LISTA GENÉRICA
// ══════════════════════════════════════════════════════════════════════════════
function HistoricalList({ items, onEdit, onDelete, onTogglePublish, renderTitle, renderMeta, emptyMsg, selectedId }) {
  const [confirmId, setConfirmId] = useState(null);
  if (items.length === 0) return <p className="ah-list-empty">{emptyMsg}</p>;
  return (
    <div className="ah-list">
      {items.map(item => (
        <div key={item.id} className={`ah-list-row ${item.id === selectedId ? "ah-list-row--active" : ""}`}>
          {item.image_path
            ? <img src={getHistoricalImageUrl(item.image_path)} alt="" className="ah-list-img" />
            : <div className="ah-list-img-ph">📷</div>
          }
          <div className="ah-list-info">
            <span className="ah-list-title">{renderTitle(item)}</span>
            <span className="ah-list-meta">{renderMeta(item)}</span>
          </div>
          <div className="ah-list-actions">
            <button
              className={`ah-pub-pill ${item.is_published ? "ah-pub-pill--on" : "ah-pub-pill--off"}`}
              onClick={() => onTogglePublish(item.id, item.is_published)}>
              {item.is_published ? <><Eye size={10} /> Pub</> : <><EyeOff size={10} /> Borrador</>}
            </button>
            <button className="ah-list-btn ah-list-btn--edit" onClick={() => onEdit(item)}>
              <Pencil size={12} />
            </button>
            {confirmId === item.id ? (
              <>
                <button className="ah-list-btn ah-list-btn--confirm"
                  onClick={() => { onDelete(item.id); setConfirmId(null); }}>
                  <Check size={12} />
                </button>
                <button className="ah-list-btn ah-list-btn--cancel-del" onClick={() => setConfirmId(null)}>
                  <X size={12} />
                </button>
              </>
            ) : (
              <button className="ah-list-btn ah-list-btn--del" onClick={() => setConfirmId(item.id)}>
                <Trash2 size={12} />
              </button>
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
  const [panel, setPanel] = useState(null);
  const [search, setSearch] = useState("");

  const {
    players, teams, competitions, events,
    loading, error, loadAll,
    createPlayer, updatePlayer, deletePlayer, togglePlayerPublished,
    createTeam, updateTeam, deleteTeam, toggleTeamPublished,
    getTeamLineup, setTeamLineup,
    getTeamTitles, setTeamTitles,
    createCompetition, updateCompetition, deleteCompetition, toggleCompetitionPublished,
    createEvent, updateEvent, deleteEvent, toggleEventPublished,
    getPlayerTeams, setPlayerTeams,
    getEventRelations, setEventRelations,
    // Nuevas funciones (agregar al hook)
    getPlayerCareer, setPlayerCareer,
    getPlayerNational, setPlayerNational,
    getPlayerTitles, setPlayerTitles,
  } = useAdminHistorical();

  const q = search.toLowerCase();
  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(q));
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(q));
  const filteredCompetitions = competitions.filter(c => c.name.toLowerCase().includes(q));
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(q));

  const openCreate = () => setPanel({ type: activeTab, data: null });
  const openEdit = (data) => setPanel({ type: activeTab, data });
  const closePanel = () => setPanel(null);

  const handleSavePlayer = (form, file) => form.id ? updatePlayer(form.id, form, file) : createPlayer(form, file);
  const handleSaveTeam = (form, file) => form.id ? updateTeam(form.id, form, file) : createTeam(form, file);
  const handleSaveCompetition = (form, file) => form.id ? updateCompetition(form.id, form, file) : createCompetition(form, file);
  const handleSaveEvent = (form, file) => form.id ? updateEvent(form.id, form, file) : createEvent(form, file);

  const tabCounts = {
    players: players.length, teams: teams.length,
    competitions: competitions.length, events: events.length,
  };
  const selectedId = panel?.data?.id || null;

  const renderPlayerMeta = (p) =>
    [p.country, POSITION_LABEL[p.position] || p.position, p.era, LEGACY_PLAYER_LABEL[p.legacy_type] || p.legacy_type]
      .filter(Boolean).join(" · ");

  const renderTeamMeta = (t) =>
    [t.country, t.era_dominance, LEGACY_TEAM_LABEL[t.legacy_type] || t.legacy_type]
      .filter(Boolean).join(" · ");

  const renderCompMeta = (c) =>
    [COMP_TYPE_LABEL[c.type] || c.type, c.year ? String(c.year) : null].filter(Boolean).join(" · ");

  const renderEventMeta = (e) =>
    [EVENT_TYPE_LABEL[e.event_type] || e.event_type, e.event_date].filter(Boolean).join(" · ");

  return (
    <div className="ah-root">
      <div className="ah-shell">

        {/* ── LEFT ── */}
        <div className="ah-left">
          <div className="ah-tabs">
            {TABS.map(t => (
              <button key={t.key}
                className={`ah-tab ${activeTab === t.key ? "ah-tab--active" : ""}`}
                onClick={() => { setActiveTab(t.key); setSearch(""); closePanel(); }}>
                <t.Icon size={13} />
                <span>{t.label}</span>
                <span className="ah-tab-count">{tabCounts[t.key]}</span>
              </button>
            ))}
          </div>

          <div className="ah-controls">
            <div className="ah-search">
              <Search size={12} className="ah-search-ico" />
              <input className="ah-search-input"
                placeholder={`Buscar ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()}...`}
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button className="ah-search-clear" onClick={() => setSearch("")}><X size={11} /></button>
              )}
            </div>
            <button className="ah-new-btn" onClick={openCreate}>
              <Plus size={12} />
              Nuevo {TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}
            </button>
          </div>

          <div className="ah-list-area">
            {loading && (
              <div className="ah-loading-msg"><RefreshCw size={14} className="ah-spin" /> Cargando...</div>
            )}
            {error && (
              <div className="ah-error-msg">
                <AlertCircle size={16} /><p>{error}</p>
                <button className="ah-retry-btn" onClick={loadAll}><RefreshCw size={11} /> Reintentar</button>
              </div>
            )}
            {!loading && !error && <>
              {activeTab === "players" && (
                <HistoricalList items={filteredPlayers} selectedId={selectedId}
                  onEdit={openEdit} onDelete={deletePlayer} onTogglePublish={togglePlayerPublished}
                  renderTitle={p => p.name} renderMeta={renderPlayerMeta}
                  emptyMsg="No hay jugadores históricos." />
              )}
              {activeTab === "teams" && (
                <HistoricalList items={filteredTeams} selectedId={selectedId}
                  onEdit={openEdit} onDelete={deleteTeam} onTogglePublish={toggleTeamPublished}
                  renderTitle={t => t.name} renderMeta={renderTeamMeta}
                  emptyMsg="No hay equipos históricos." />
              )}
              {activeTab === "competitions" && (
                <HistoricalList items={filteredCompetitions} selectedId={selectedId}
                  onEdit={openEdit} onDelete={deleteCompetition} onTogglePublish={toggleCompetitionPublished}
                  renderTitle={c => c.name} renderMeta={renderCompMeta}
                  emptyMsg="No hay competencias." />
              )}
              {activeTab === "events" && (
                <HistoricalList items={filteredEvents} selectedId={selectedId}
                  onEdit={openEdit} onDelete={deleteEvent} onTogglePublish={toggleEventPublished}
                  renderTitle={e => e.title} renderMeta={renderEventMeta}
                  emptyMsg="No hay eventos históricos." />
              )}
            </>}
          </div>
        </div>

        {/* ── RIGHT (50%) ── */}
        <aside className="ah-right">
          <div className="ah-panel-header">
            <div className="ah-panel-header-left">
              <span className="ah-panel-dot" />
              <span className="ah-panel-title">
                {panel
                  ? (panel.data
                    ? `Editar ${TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}`
                    : `Nuevo ${TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}`)
                  : "Panel"}
              </span>
            </div>
            {panel && (
              <button className="ah-panel-back" onClick={closePanel}>
                <ChevronLeft size={12} /> Volver
              </button>
            )}
          </div>

          <div className="ah-panel-body">
            {!panel && <EmptyPanel activeTab={activeTab} />}

            {panel?.type === "players" && (
              <PlayerPanel
                player={panel.data} teams={teams}
                onSave={handleSavePlayer} onClose={closePanel}
                onGetPlayerTeams={getPlayerTeams} onSetPlayerTeams={setPlayerTeams}
                onGetCareer={getPlayerCareer} onSetCareer={setPlayerCareer}
                onGetNational={getPlayerNational} onSetNational={setPlayerNational}
                onGetTitles={getPlayerTitles} onSetTitles={setPlayerTitles}
              />
            )}

            {panel?.type === "teams" && (
              <TeamPanel
                team={panel.data} competitions={competitions}
                onSave={handleSaveTeam} onClose={closePanel}
                onGetLineup={getTeamLineup} onSetLineup={setTeamLineup}
                onGetTitles={getTeamTitles} onSetTitles={setTeamTitles}
              />
            )}

            {panel?.type === "competitions" && (
              <CompetitionPanel
                competition={panel.data} teams={teams}
                onSave={handleSaveCompetition} onClose={closePanel}
              />
            )}

            {panel?.type === "events" && (
              <EventPanel
                event={panel.data} players={players} teams={teams} competitions={competitions}
                onSave={handleSaveEvent} onClose={closePanel}
                onGetRelations={getEventRelations} onSetRelations={setEventRelations}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}