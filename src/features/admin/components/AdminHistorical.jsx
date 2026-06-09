import { useState, useRef, useEffect } from "react";
import {
  Users2, Shield, Trophy, Zap, Search, Camera, Pencil,
  Trash2, Check, X, ChevronLeft, Plus, Star, Eye, EyeOff,
  Upload, RefreshCw, AlertCircle, BookOpen, Link2, Flag, Award
} from "lucide-react";
import {
  useAdminHistorical,
  getHistoricalImageUrl,
} from "../hooks/useAdminHistorical";
import { DataImporter } from "./DataImporter";
import "../styles/AdminHistorical.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "players", label: "Jugadores", Icon: Users2 },
  { key: "teams", label: "Equipos", Icon: Shield },
  { key: "competitions", label: "Competencias", Icon: Trophy },
  { key: "events", label: "Eventos", Icon: Zap },
];

const POSITIONS = ["Forward", "Midfielder", "All-rounder", "Defender", "Goalkeeper", "Play-maker"];
const LEGACY_PLAYER = ["Goal Scorer", "Tactician", "Innovator", "Leader", "Goalkeeper", "Technician"];
const LEGACY_TEAM = ["Dynastic", "Innovative", "Continental", "National"];
const EVENT_TYPES = ["Championship", "Historic Match", "Legendary Performance", "Era Defining", "Record"];
const COMP_TYPES = ["International", "Continental", "Domestic"];
const FORMATIONS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];
const POSITION_ROLES = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "SS"];
const TITLE_CATEGORIES = ["club", "national", "individual"];

export const COMP_FORMATS = [
  "groups_knockout",
  "league_only",
  "knockout_only",
];

export const COMP_FORMAT_LABEL = {
  groups_knockout: "Grupos + Eliminatorias",
  league_only: "Solo Liga",
  knockout_only: "Solo Eliminatorias",
};

export const KNOCKOUT_ROUNDS = [
  "Octavos",
  "Cuartos",
  "Semifinal",
  "Tercero",
  "Final",
];

// Categorías de evento
const EVENT_CATEGORIES = [
  { value: "player", label: "🎭 Jugador" },
  { value: "team", label: "🏆 Equipo" },
];

// Tipos de competición para eventos de equipo
const EVENT_COMP_TYPES = [
  { value: "league", label: "Liga / Tabla" },
  { value: "knockout", label: "Eliminatorias" },
];
// ─── Mapas de traducción ──────────────────────────────────────────────────────
const POSITION_LABEL = {
  "Forward": "Delantero", "Midfielder": "Centrocampista", "All-rounder": "Todocampista", "Play-maker": "Media Punta",
  "Defender": "Defensor", "Goalkeeper": "Portero",
};
const LEGACY_PLAYER_LABEL = {
  "Goal Scorer": "Goleador", "Tactician": "Táctico",
  "Innovator": "Genio", "Leader": "Líder", "Goalkeeper": "Portero", "Technician": "Técnico",
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
    { shirt_number: 6, position_role: "CB", pos_x: 40, pos_y: 70 },
    { shirt_number: 4, position_role: "CB", pos_x: 60, pos_y: 70 },
    { shirt_number: 3, position_role: "LB", pos_x: 80, pos_y: 70 },
    { shirt_number: 5, position_role: "CDM", pos_x: 50, pos_y: 52 },
    { shirt_number: 10, position_role: "CM", pos_x: 30, pos_y: 52 },
    { shirt_number: 8, position_role: "CM", pos_x: 70, pos_y: 52 },
    { shirt_number: 9, position_role: "ST", pos_x: 50, pos_y: 20 },
    { shirt_number: 7, position_role: "LW", pos_x: 20, pos_y: 20 },
    { shirt_number: 11, position_role: "RW", pos_x: 80, pos_y: 20 },
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
  ballon_dor_count: 0, legacy_type: "", significance_level: 3,
  description: "", impact_summary: "", is_published: false,
  // ── Carta única ──────────────────────────────────────────────────────────
  is_special: false,
  special_owner_id: "",
};
const TEAM_EMPTY = {
  name: "", country: "", founded_year: "", era_dominance: "",
  legacy_type: "", description: "", historical_note: "",
  primary_color: "#5b4fd8", secondary_color: "#ffffff",
  formation: "4-3-3", titles_count: 0,
  active_years: "", manager: "", is_published: false,
};
// Filas vacías para las tablas
const EMPTY_GROUP_ROW = (groupName = "Grupo A") => ({
  _id: Date.now() + Math.random(),
  group_name: groupName,
  team_name: "",
  position: "",
  points: "",
  wins: "",
  draws: "",
  losses: "",
  goals_for: "",
  goals_against: "",
  sort_order: 0,
});

const EMPTY_STANDING_ROW = (position = 1) => ({
  _id: Date.now() + Math.random(),
  position: String(position),
  team_name: "",
  points: "",
  wins: "",
  draws: "",
  losses: "",
  goals_for: "",
  goals_against: "",
  champion: false,
});

const EMPTY_KNOCKOUT_ROW = (sort = 0) => ({
  _id: Date.now() + Math.random(),
  round: "Final",
  match_number: "1",
  team_a: "",
  team_b: "",
  score_a: "",
  score_b: "",
  penalties_a: "",
  penalties_b: "",
  winner: "",
  notes: "",
  sort_order: sort,
});

const COMP_EMPTY_V2 = {
  name: "",
  type: "",
  format: "",
  year: "",
  country: "",
  edition: "",
  num_teams: "",
  description: "",
  winner_team_id: "",
  winner_text: "",
  use_winner_text: false,
  is_published: false,
};

// REEMPLAZA el EVENT_EMPTY actual
const EVENT_EMPTY = {
  title: "",
  event_type: "",
  event_date: "",
  event_category: "player",
  context_text: "",
  impact_text: "",
  protagonist_id: "",
  team_protagonist_id: "",
  description: "",
  is_published: false,
  // ── Marcador del partido ──────────────────────
  score_a: "",
  score_b: "",
  team_a_name: "",
  team_b_name: "",
};

// Fila vacía de alineación de evento
const EMPTY_EVENT_LINEUP_ROW = (side = "team_a", num = 1) => ({
  _id: Date.now() + Math.random(),
  team_side: side,
  team_name: "",
  shirt_number: num,
  player_name: "",
  position_role: "",
  is_protagonist: false,
  sort_order: 0,
});

// Fila vacía de plantel de evento
const EMPTY_EVENT_SQUAD_ROW = () => ({
  _id: Date.now() + Math.random(),
  player_name: "",
  shirt_number: "",
  position_role: "",
  is_key_player: false,
  sort_order: 0,
});

// Fila vacía de standings de evento
const EMPTY_EVENT_STANDING_ROW = (pos = 1) => ({
  _id: Date.now() + Math.random(),
  position: String(pos),
  team_name: "",
  points: "",
  wins: "",
  draws: "",
  losses: "",
  goals_for: "",
  goals_against: "",
  is_champion: false,
});

// Fila vacía de knockout de evento
const EMPTY_EVENT_KNOCKOUT_ROW = (sort = 0) => ({
  _id: Date.now() + Math.random(),
  round: "Final",
  match_number: "1",
  team_a: "",
  team_b: "",
  score_a: "",
  score_b: "",
  winner: "",
  is_decisive: false,
  sort_order: sort,
});

const EMPTY_LINEUP_PLAYER = (num) => ({
  _id: Date.now() + Math.random(),
  shirt_number: num,      // sugerido, pero el admin puede cambiarlo
  player_name: "",
  position_role: "",
  pos_x: 50,
  pos_y: 50,
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

// ── Banner panorámico (16:9) ──────────────────────────────────────────────────
function BannerUploader({ currentPath, onFile }) {
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
    <div className="ah-banner-uploader" onClick={() => ref.current.click()}>
      {url
        ? <img src={url} alt="Banner" className="ah-banner-preview" />
        : (
          <div className="ah-banner-placeholder">
            <Camera size={20} strokeWidth={1.5} />
            <span>Banner panorámico (16:9)</span>
          </div>
        )
      }
      <input ref={ref} type="file" accept="image/*"
        style={{ display: "none" }} onChange={handleChange} />
      <div className="ah-banner-overlay"><span>Cambiar Banner</span></div>
    </div>
  );
}

function SignificancePicker({ value, onChange }) {
  const labels = ["", "Actual", "Notable", "Iconico", "Leyenda", "GOAT Status"];
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
function PlayerPanel({ player, teams, users, onSave, onClose, onGetPlayerTeams, onSetPlayerTeams,
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

  useEffect(() => {
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

  const handleImport = (setter) => (newRows, mode) => {
    if (mode === "append") {
      setter(prev => [...prev, ...newRows]);
    } else {
      setter(newRows);
    }
  };

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
            <PField label="Balones de Oro" hint="0 si no tiene">
              <PInput
                type="number"
                min="0"
                max="10"
                value={form.ballon_dor_count ?? 0}
                onChange={e => set("ballon_dor_count", parseInt(e.target.value) || 0)}
                placeholder="0"
              />
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

        {/* ── Carta Única — solo aparece cuando is_special está activo ── */}
        <div className="ah-panel-section ah-special-section">
          <span className="ah-panel-sep ah-panel-sep--special">
            ✦ Carta Única · Edición Especial
          </span>

          <label className="ah-pub-toggle" style={{ marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={!!form.is_special}
              onChange={e => {
                set("is_special", e.target.checked);
                if (!e.target.checked) set("special_owner_id", "");
              }}
            />
            <span className="ah-pub-track"><span className="ah-pub-thumb" /></span>
            <span className="ah-pub-label ah-pub-label--special">
              {form.is_special ? "Carta única activada" : "Carta normal"}
            </span>
          </label>

          {form.is_special && (
            <>
              <div className="ah-special-warning">
                <span>⚠</span>
                <span>
                  Al publicar, la carta se entrega automáticamente al usuario
                  seleccionado y <strong>no aparecerá en sobres ni en Historia pública</strong>.
                  Esta acción es irreversible.
                </span>
              </div>

              <PField label="Entregar a usuario" required>
                <PSelect
                  value={form.special_owner_id || ""}
                  onChange={e => set("special_owner_id", e.target.value)}
                >
                  <option value="">— Selecciona el dueño —</option>
                  {(users || []).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.email ? `· ${u.email}` : ""}
                    </option>
                  ))}
                </PSelect>
              </PField>

              <div className="ah-special-badge-preview">
                <span className="ah-special-star">✦</span>
                <span className="ah-special-badge-text">EDICIÓN ÚNICA · 1 DE 1</span>
                <span className="ah-special-star">✦</span>
              </div>
            </>
          )}
        </div>
      </>}

      {/* ── TAB TRAYECTORIA CLUBES ── */}
      {tab === "career" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep"><Shield size={10} /> Trayectoria en Clubes</span>

          <DataImporter
            mode="career"
            onImport={handleImport(setCareer)}
          />

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

          <DataImporter
            mode="national"
            onImport={handleImport(setNational)}
          />

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

          <DataImporter
            mode="titles"
            onImport={handleImport(setTitles)}
          />

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
//  FIELD PREVIEW — Vista táctica del campo
// ══════════════════════════════════════════════════════════════════════════════

function FieldPreview({ lineup, primaryColor = "#ffffff", secondaryColor = "#1a1a2e" }) {
  const active = lineup.filter(p => p.player_name && p.player_name.trim() !== "");

  return (
    <div className="ah-field-preview" style={{ aspectRatio: "3 / 4.2" }}>
      <svg
        className="ah-field-svg"
        viewBox="0 0 300 420"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="10" y="10" width="280" height="400" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <line x1="10" y1="210" x2="290" y2="210" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        <circle cx="150" cy="210" r="38" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        <circle cx="150" cy="210" r="2" fill="rgba(255,255,255,0.5)" />
        <rect x="65" y="10" width="170" height="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <rect x="105" y="10" width="90" height="25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <rect x="65" y="350" width="170" height="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <rect x="105" y="385" width="90" height="25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <circle cx="150" cy="45" r="2" fill="rgba(255,255,255,0.4)" />
        <circle cx="150" cy="375" r="2" fill="rgba(255,255,255,0.4)" />
        <path d="M 100 70 A 38 38 0 0 1 200 70" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <path d="M 100 350 A 38 38 0 0 0 200 350" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <path d="M 10 10 Q 18 10 18 18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M 290 10 Q 282 10 282 18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M 10 410 Q 18 410 18 402" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M 290 410 Q 282 410 282 402" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <rect x="127" y="4" width="46" height="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
        <rect x="127" y="408" width="46" height="8" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      </svg>

      {active.map((p) => {
        const isGK = p.position_role === "GK";
        const x = `${Math.min(Math.max(p.pos_x ?? 50, 5), 95)}%`;
        const y = `${Math.min(Math.max(p.pos_y ?? 50, 5), 95)}%`;
        const shortName = (p.player_name || "").split(" ").pop() || p.player_name;

        return (
          <div
            key={p._id || p.shirt_number}
            className={`ah-field-player ${isGK ? "ah-field-player--gk" : "ah-field-player--field"}`}
            style={{ left: x, top: y }}
          >
            <div
              className="ah-field-player-dot"
              style={isGK ? undefined : { "--player-color": primaryColor, "--player-text": secondaryColor }}
            >
              {p.shirt_number || "?"}
            </div>
            <span className="ah-field-player-name">{shortName}</span>
            {p.position_role && <span className="ah-field-player-pos">{p.position_role}</span>}
          </div>
        );
      })}

      {active.length === 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 6, pointerEvents: "none",
        }}>
          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Sin jugadores aún
          </span>
        </div>
      )}
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
  const [showField, setShowField] = useState(true); // toggle del preview

  // Lineup dinámico — ya no es fijo de 1-11
  const [lineup, setLineup] = useState(
    Array.from({ length: 11 }, (_, i) => EMPTY_LINEUP_PLAYER(i + 1))
  );
  const [titles, setTitles] = useState([]);
  const [newTitle, setNewTitle] = useState({ title_name: "", year: "", competition_id: "" });

  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);
    Promise.all([onGetLineup(team.id), onGetTitles(team.id)])
      .then(([lin, tit]) => {
        if (lin && lin.length > 0) {
          // Cargar tal cual desde BD — el dorsal es el valor guardado
          setLineup(
            lin.map(p => ({
              _id: p.id || Date.now() + Math.random(),
              shirt_number: p.shirt_number,
              player_name: p.player_name || "",
              position_role: p.position_role || "",
              pos_x: p.pos_x ?? 50,
              pos_y: p.pos_y ?? 50,
            }))
          );
        }
        setTitles(
          (tit || []).map(t => ({
            _dbId: t.id,
            title_name: t.title_name,
            year: t.year || "",
            competition_id: t.competition_id || "",
          }))
        );
      })
      .catch(() => { })
      .finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Auto-posicionar desde formación — por índice, no por dorsal ────────────
  const applyFormation = (formation) => {
    const defaults = FORMATION_DEFAULTS[formation];
    if (!defaults) return;
    setLineup(prev =>
      prev.map((p, idx) => {
        const def = defaults[idx];
        return def
          ? { ...p, position_role: def.position_role, pos_x: def.pos_x, pos_y: def.pos_y }
          : p;
      })
    );
    set("formation", formation);
  };

  // ── Actualizar campo de un jugador por _id ─────────────────────────────────
  const updateLineupPlayer = (_id, field, val) =>
    setLineup(prev => prev.map(p => p._id === _id ? { ...p, [field]: val } : p));

  // ── Añadir / quitar jugador ─────────────────────────────────────────────────
  const addLineupPlayer = () => {
    const usedNums = lineup.map(p => Number(p.shirt_number)).filter(Boolean);
    let next = 1;
    while (usedNums.includes(next)) next++;
    setLineup(prev => [...prev, EMPTY_LINEUP_PLAYER(next)]);
  };

  const removeLineupPlayer = (_id) =>
    setLineup(prev => prev.filter(p => p._id !== _id));

  // ── Importar desde DataImporter ────────────────────────────────────────────
  const handleLineupImport = (rows, importMode) => {
    const mapped = rows.map(r => ({
      _id: Date.now() + Math.random(),
      shirt_number: Number(r.shirt_number) || 1,
      player_name: r.player_name || "",
      position_role: r.position_role || "",
      pos_x: Number(r.pos_x) || 50,
      pos_y: Number(r.pos_y) || 50,
    }));
    if (importMode === "append") {
      setLineup(prev => [...prev, ...mapped]);
    } else {
      setLineup(mapped);
    }
  };

  // ── Palmarés ────────────────────────────────────────────────────────────────
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

  // ── Guardar ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }

    // Validar dorsales 1-11 (constraint de BD)
    const invalid = lineup.filter(p => p.player_name.trim() && (Number(p.shirt_number) < 1 || Number(p.shirt_number) > 11));
    if (invalid.length > 0) {
      setError(`Los dorsales deben ser entre 1 y 11. Revisa: ${invalid.map(p => p.shirt_number).join(", ")}`);
      return;
    }

    setSaving(true); setError(null);
    try {
      const saved = await onSave(form, imageFile);
      const id = saved?.id || team?.id;

      if (id) {
        const lineupToSave = lineup
          .filter(p => p.player_name && p.player_name.trim() !== "")
          .map(({ _id, ...r }) => ({ ...r, shirt_number: Number(r.shirt_number) }));
        await onSetLineup(id, lineupToSave);

        const titlesToSave = titles.map(({ title_name, year, competition_id }) => ({
          title_name,
          year: year ? String(year).trim() : null,
          competition_id: competition_id || null,
        }));
        await onSetTitles(id, titlesToSave);
      }
      onClose();
    } catch (err) {
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

      {/* ── TAB INFO ── */}
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

      {/* ── TAB ALINEACIÓN ── */}
      {tab === "lineup" && (
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Formación y alineación</span>

          {/* Importador masivo */}
          <DataImporter
            mode="team_lineup"
            onImport={handleLineupImport}
          />

          {/* Selector de formación + auto-posicionar */}
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

          {/* ── Vista previa del campo (toggle) ─────────────────────── */}
          <div className="ah-field-wrap">
            <button
              type="button"
              className="ah-field-toggle"
              onClick={() => setShowField(v => !v)}
            >
              <span className="ah-field-toggle-label">
                {showField ? <EyeOff size={10} /> : <Eye size={10} />}
                {showField ? "Ocultar vista previa del campo" : "Ver campo táctico"}
              </span>
              {lineup.filter(p => p.player_name.trim()).length > 0 && (
                <span style={{
                  fontSize: 8, fontFamily: "'DM Mono', monospace",
                  color: "var(--accent)", fontWeight: 700,
                }}>
                  {lineup.filter(p => p.player_name.trim()).length} jugadores
                </span>
              )}
            </button>

            {showField && (
              <>
                <FieldPreview
                  lineup={lineup}
                  primaryColor={form.primary_color || "#ffffff"}
                  secondaryColor={form.secondary_color || "#1a1a2e"}
                />
                <p className="ah-field-hint">
                  Ajusta X · Y en la tabla de abajo para mover jugadores en el campo.
                  X=0 izquierda · X=100 derecha · Y=0 arriba · Y=100 abajo
                </p>
              </>
            )}
          </div>

          {/* ── Lista editable de jugadores ──────────────────────────── */}
          {loadingData ? (
            <div className="ah-loading-msg">
              <RefreshCw size={12} className="ah-spin" /> Cargando...
            </div>
          ) : (
            <>
              <div className="ah-lineup-list">
                {lineup.map(p => (
                  <div key={p._id} className="ah-lineup-row-dyn">
                    {/* Dorsal editable */}
                    <PInput
                      type="number"
                      min="1"
                      max="11"
                      value={p.shirt_number ?? ""}
                      onChange={e => updateLineupPlayer(p._id, "shirt_number", e.target.value)}
                      className="ah-lineup-dorsal"
                      title="Dorsal (1-11)"
                      placeholder="#"
                    />
                    {/* Nombre */}
                    <PInput
                      placeholder="Nombre del jugador"
                      value={p.player_name || ""}
                      onChange={e => updateLineupPlayer(p._id, "player_name", e.target.value)}
                      style={{ flex: 2 }}
                    />
                    {/* Posición */}
                    <PSelect
                      value={p.position_role || ""}
                      onChange={e => updateLineupPlayer(p._id, "position_role", e.target.value)}
                      style={{ flex: 1 }}>
                      <option value="">Pos.</option>
                      {POSITION_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </PSelect>
                    {/* X / Y */}
                    <div className="ah-pos-inputs">
                      <input type="number" min="0" max="100" className="ah-pinput ah-pos-xy"
                        title="Pos X (0=izq · 100=der)" placeholder="X" value={p.pos_x ?? 50}
                        onChange={e => updateLineupPlayer(p._id, "pos_x", parseFloat(e.target.value) || 0)} />
                      <input type="number" min="0" max="100" className="ah-pinput ah-pos-xy"
                        title="Pos Y (0=arriba · 100=abajo)" placeholder="Y" value={p.pos_y ?? 50}
                        onChange={e => updateLineupPlayer(p._id, "pos_y", parseFloat(e.target.value) || 0)} />
                    </div>
                    {/* Quitar */}
                    <button type="button" className="ah-lineup-remove"
                      onClick={() => removeLineupPlayer(p._id)}
                      title="Quitar jugador">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botón añadir jugador */}
              <button
                type="button"
                className="ah-add-link-btn"
                style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
                onClick={addLineupPlayer}>
                <Plus size={11} /> Añadir jugador
              </button>

              {/* Nota sobre constraint de BD */}
              <div className="ah-lineup-db-note">
                ⚠ La base de datos acepta dorsales del 1 al 11. Jugadores con dorsal fuera de ese rango no se guardarán.
              </div>
            </>
          )}

          <span className="ah-phint" style={{ marginTop: 4, display: "block" }}>
            X/Y 0–100. Y=0 portería arriba · Y=100 portería abajo. Usa "Auto-posicionar" para rellenar desde la formación.
          </span>
        </div>
      )}

      {/* ── TAB TÍTULOS ── */}
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
function CompetitionPanel({
  competition, teams, onSave, onClose,
  onGetGroups, onSetGroups,
  onGetStandings, onSetStandings,
  onGetKnockout, onSetKnockout,
}) {
  const isEdit = !!competition?.id;

  // Combinar campos del objeto existente con nuevos campos
  const baseForm = competition?.id
    ? {
      ...COMP_EMPTY_V2,
      ...competition,
      use_winner_text: !!competition.winner_text && !competition.winner_team_id,
    }
    : { ...COMP_EMPTY_V2 };

  const [form, setForm] = useState(baseForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");
  const [loadingData, setLoadingData] = useState(false);

  // Datos de las 3 sub-secciones
  const [groups, setGroups] = useState([]);
  const [standings, setStandings] = useState([]);
  const [knockout, setKnockout] = useState([]);

  // Cargar datos al editar
  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);
    Promise.all([
      onGetGroups ? onGetGroups(competition.id) : Promise.resolve([]),
      onGetStandings ? onGetStandings(competition.id) : Promise.resolve([]),
      onGetKnockout ? onGetKnockout(competition.id) : Promise.resolve([]),
    ]).then(([g, s, k]) => {
      setGroups((g || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
      setStandings((s || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
      setKnockout((k || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
    }).catch(() => { }).finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Helper genérico para actualizar fila en array
  const updateRow = (setter) => (idx, key, val) =>
    setter(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

  // ── Columnas tablas ────────────────────────────────────────────────────────
  const groupCols = [
    { key: "group_name", label: "Grupo", flex: 1, placeholder: "Grupo A" },
    { key: "team_name", label: "Equipo", flex: 2, placeholder: "Brasil" },
    { key: "position", label: "Pos.", flex: 1, type: "number", placeholder: "1" },
    { key: "points", label: "Pts", flex: 1, type: "number", placeholder: "6" },
    { key: "wins", label: "G", flex: 1, type: "number", placeholder: "2" },
    { key: "draws", label: "E", flex: 1, type: "number", placeholder: "0" },
    { key: "losses", label: "P", flex: 1, type: "number", placeholder: "1" },
    { key: "goals_for", label: "GF", flex: 1, type: "number", placeholder: "5" },
    { key: "goals_against", label: "GC", flex: 1, type: "number", placeholder: "2" },
  ];

  const standingCols = [
    { key: "position", label: "#", flex: 1, type: "number", placeholder: "1" },
    { key: "team_name", label: "Equipo", flex: 2, placeholder: "Inter de Milán" },
    { key: "points", label: "Pts", flex: 1, type: "number", placeholder: "72" },
    { key: "wins", label: "G", flex: 1, type: "number", placeholder: "22" },
    { key: "draws", label: "E", flex: 1, type: "number", placeholder: "6" },
    { key: "losses", label: "P", flex: 1, type: "number", placeholder: "6" },
    { key: "goals_for", label: "GF", flex: 1, type: "number", placeholder: "60" },
    { key: "goals_against", label: "GC", flex: 1, type: "number", placeholder: "30" },
    {
      key: "champion", label: "🏆", flex: 1, type: "select",
      options: [
        { value: "false", label: "—" },
        { value: "true", label: "Campeón" },
      ],
    },
  ];

  const knockoutCols = [
    {
      key: "round", label: "Ronda", flex: 2, type: "select",
      options: KNOCKOUT_ROUNDS.map(r => ({ value: r, label: r })),
    },
    { key: "match_number", label: "Nº", flex: 1, type: "number", placeholder: "1" },
    { key: "team_a", label: "Local", flex: 2, placeholder: "Brasil" },
    { key: "score_a", label: "G(L)", flex: 1, type: "number", placeholder: "4" },
    { key: "score_b", label: "G(V)", flex: 1, type: "number", placeholder: "1" },
    { key: "team_b", label: "Visitante", flex: 2, placeholder: "Italia" },
    { key: "penalties_a", label: "Pen.L", flex: 1, type: "number", placeholder: "" },
    { key: "penalties_b", label: "Pen.V", flex: 1, type: "number", placeholder: "" },
    {
      key: "winner", label: "Ganador", flex: 1, type: "select",
      options: [
        { value: "", label: "—" },
        { value: "team_a", label: "Local" },
        { value: "team_b", label: "Visitante" },
        { value: "draw", label: "Empate" },
      ],
    },
    { key: "notes", label: "Nota", flex: 1, placeholder: "Prórroga..." },
  ];

  // ── Determinar qué tabs mostrar según formato ──────────────────────────────
  const fmt = form.format;
  const showGroups = fmt === "groups_knockout";
  const showStandings = fmt === "league_only";
  const showKnockout = fmt === "groups_knockout" || fmt === "knockout_only";

  const COMP_TABS = [
    { key: "info", label: "Info" },
    showGroups && { key: "groups", label: "Grupos" },
    showStandings && { key: "standings", label: "Tabla Liga" },
    showKnockout && { key: "knockout", label: "Eliminatorias" },
  ].filter(Boolean);

  // Si el tab activo ya no es válido (cambió el formato), volver a info
  useEffect(() => {
    const validKeys = COMP_TABS.map(t => t.key);
    if (!validKeys.includes(tab)) setTab("info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fmt]);

  const handleImport = (setter, currentRows) => (newRows, mode) => {
    if (mode === "append") {
      setter(prev => [...prev, ...newRows]);
    } else {
      setter(newRows);
    }
  };

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      // Limpiar winner según modo seleccionado
      const payload = { ...form };
      if (payload.use_winner_text) {
        payload.winner_team_id = null;
      } else {
        payload.winner_text = null;
      }
      delete payload.use_winner_text;

      const saved = await onSave(payload, imageFile);
      const id = saved?.id || competition?.id;

      if (id) {
        const cleanRows = (arr) => arr.map(({ _id, id: _rid, ...r }) => r);
        if (onSetGroups) await onSetGroups(id, cleanRows(groups));
        if (onSetStandings) await onSetStandings(id, cleanRows(standings));
        if (onSetKnockout) await onSetKnockout(id, cleanRows(knockout));
      }
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="ah-panel-form">
      {/* Tabs dinámicas */}
      <div className="ah-inner-tabs ah-inner-tabs--scroll">
        {COMP_TABS.map(({ key, label }) => (
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
          <ImageUploader currentPath={form.image_path} onFile={setImageFile} label="Logo de la competencia" />
        </div>

        <div className="ah-panel-section">
          <span className="ah-panel-sep">Datos básicos</span>
          <div className="ah-pgrid-2">
            <PField label="Nombre" required>
              <PInput value={form.name} onChange={e => set("name", e.target.value)} placeholder="Copa del Mundo 1970" />
            </PField>
            <PField label="Tipo">
              <PSelect value={form.type || ""} onChange={e => set("type", e.target.value)}>
                <option value="">— Selecciona —</option>
                {COMP_TYPES.map(t => <option key={t} value={t}>{COMP_TYPE_LABEL[t] || t}</option>)}
              </PSelect>
            </PField>
            <PField label="Formato">
              <PSelect value={form.format || ""} onChange={e => set("format", e.target.value)}>
                <option value="">— Selecciona —</option>
                {COMP_FORMATS.map(f => <option key={f} value={f}>{COMP_FORMAT_LABEL[f]}</option>)}
              </PSelect>
            </PField>
            <PField label="Año">
              <PInput type="number" value={form.year || ""} onChange={e => set("year", e.target.value)} placeholder="1970" />
            </PField>
            <PField label="País / Sede">
              <PInput value={form.country || ""} onChange={e => set("country", e.target.value)} placeholder="México" />
            </PField>
            <PField label="Nº equipos">
              <PInput type="number" value={form.num_teams || ""} onChange={e => set("num_teams", e.target.value)} placeholder="16" />
            </PField>
          </div>
        </div>

        <div className="ah-panel-section">
          <span className="ah-panel-sep">Campeón</span>
          <div className="ah-comp-winner-toggle">
            <label className="ah-cwt-opt">
              <input type="radio" name="winner_mode" checked={!form.use_winner_text}
                onChange={() => set("use_winner_text", false)} />
              <span>Equipo registrado</span>
            </label>
            <label className="ah-cwt-opt">
              <input type="radio" name="winner_mode" checked={!!form.use_winner_text}
                onChange={() => set("use_winner_text", true)} />
              <span>Texto libre</span>
            </label>
          </div>

          {!form.use_winner_text ? (
            <PField label="Equipo campeón">
              <PSelect value={form.winner_team_id || ""} onChange={e => set("winner_team_id", e.target.value)}>
                <option value="">— Ninguno —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </PSelect>
            </PField>
          ) : (
            <PField label="Nombre del campeón" hint="Útil para equipos no registrados en el sistema">
              <PInput value={form.winner_text || ""} onChange={e => set("winner_text", e.target.value)} placeholder="Selección de Brasil" />
            </PField>
          )}
        </div>

        <div className="ah-panel-section">
          <span className="ah-panel-sep">Contexto histórico</span>
          <PField label="Descripción">
            <PTextarea rows={5} value={form.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descripción y contexto del torneo..." />
          </PField>
        </div>

        <div className="ah-panel-section">
          <span className="ah-panel-sep">Visibilidad</span>
          <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
        </div>
      </>}

      {/* ── TAB GRUPOS ── */}
      {tab === "groups" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep">Fase de Grupos</span>
          <p className="ah-phint" style={{ marginBottom: 8 }}>
            Agrupa los equipos por nombre de grupo (ej. "Grupo A"). Ordena por posición dentro de cada grupo.
          </p>

          <DataImporter
            mode="groups"
            onImport={handleImport(setGroups, groups)}
          />

          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={groupCols}
              rows={groups}
              onAdd={() => {
                // Detectar el último grupo para sugerir el mismo
                const lastGroup = groups.length > 0 ? groups[groups.length - 1].group_name : "Grupo A";
                setGroups(prev => [...prev, EMPTY_GROUP_ROW(lastGroup)]);
              }}
              onRemove={idx => setGroups(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={updateRow(setGroups)}
              addLabel="Añadir equipo al grupo"
            />
          )}
          <div className="ah-comp-groups-legend">
            <span className="ah-cgl-item">G = Ganados · E = Empatados · P = Perdidos</span>
            <span className="ah-cgl-item">GF = Goles a favor · GC = Goles en contra</span>
          </div>
        </div>
      )}

      {/* ── TAB TABLA LIGA ── */}
      {tab === "standings" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep">Clasificación Final de Liga</span>

          <DataImporter
            mode="standings"
            onImport={handleImport(setStandings, standings)}
          />

          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={standingCols}
              rows={standings}
              onAdd={() => setStandings(prev => [...prev, EMPTY_STANDING_ROW(prev.length + 1)])}
              onRemove={idx => setStandings(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={(idx, key, val) => {
                // champion es boolean, el select devuelve string
                const parsed = key === "champion" ? val === "true" : val;
                updateRow(setStandings)(idx, key, parsed);
              }}
              addLabel="Añadir equipo"
            />
          )}
        </div>
      )}

      {/* ── TAB ELIMINATORIAS ── */}
      {tab === "knockout" && (
        <div className="ah-panel-section ah-panel-section--table">
          <span className="ah-panel-sep">Fases Eliminatorias</span>
          <p className="ah-phint" style={{ marginBottom: 8 }}>
            Ordena de fases previas a la final. "Nº" sirve para diferenciar SF1/SF2, etc.
          </p>

          <DataImporter
            mode="knockout"
            onImport={handleImport(setKnockout, knockout)}
          />

          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <>
              {/* Vista previa de llave */}
              {knockout.length > 0 && (
                <KnockoutPreview rows={knockout} />
              )}
              <EditableTable
                columns={knockoutCols}
                rows={knockout}
                onAdd={() => setKnockout(prev => [...prev, EMPTY_KNOCKOUT_ROW(prev.length)])}
                onRemove={idx => setKnockout(prev => prev.filter((_, i) => i !== idx))}
                onUpdate={updateRow(setKnockout)}
                addLabel="Añadir partido"
              />
            </>
          )}
        </div>
      )}

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

// ── Vista previa compacta de la llave (solo lectura dentro del admin) ─────────
function KnockoutPreview({ rows }) {
  // Agrupa por ronda
  const byRound = rows.reduce((acc, r) => {
    const rnd = r.round || "Final";
    if (!acc[rnd]) acc[rnd] = [];
    acc[rnd].push(r);
    return acc;
  }, {});

  const ORDER = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];
  const rounds = ORDER.filter(r => byRound[r]);

  if (rounds.length === 0) return null;

  return (
    <div className="ah-ko-preview">
      {rounds.map(rnd => (
        <div key={rnd} className="ah-ko-round">
          <span className="ah-ko-round-label">{rnd}</span>
          {byRound[rnd].map((m, i) => {
            const winA = m.winner === "team_a";
            const winB = m.winner === "team_b";
            const sa = m.score_a !== "" && m.score_a != null ? m.score_a : "–";
            const sb = m.score_b !== "" && m.score_b != null ? m.score_b : "–";
            return (
              <div key={i} className="ah-ko-match">
                <span className={`ah-ko-team ${winA ? "ah-ko-team--win" : ""}`}>{m.team_a || "—"}</span>
                <span className="ah-ko-score">{sa} – {sb}</span>
                <span className={`ah-ko-team ah-ko-team--right ${winB ? "ah-ko-team--win" : ""}`}>{m.team_b || "—"}</span>
                {m.notes && <span className="ah-ko-notes">{m.notes}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANEL: EVENTO
// ══════════════════════════════════════════════════════════════════════════════
function EventPanel({
  event, players, teams, competitions, onSave, onClose,
  onGetRelations, onSetRelations,
  // Nuevas props de datos de evento
  onGetEventLineups, onSetEventLineups,
  onGetEventSquad, onSetEventSquad,
  onGetEventStandings, onSetEventStandings,
  onGetEventKnockout, onSetEventKnockout,
  onGetEventMoments, onSetEventMoments,
  onGetEventProtagonists, onSetEventProtagonists,
}) {
  const isEdit = !!event?.id;
  const [form, setForm] = useState(event?.id ? { ...EVENT_EMPTY, ...event } : { ...EVENT_EMPTY });
  const [imageFile, setImageFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("info");
  const [loadingData, setLoadingData] = useState(false);

  // Relaciones legacy
  const [relations, setRelations] = useState({ playerIds: [], teamIds: [], competitionIds: [] });

  // Alineaciones (evento jugador): filas team_a y team_b por separado
  const [lineupA, setLineupA] = useState([]);
  const [lineupB, setLineupB] = useState([]);
  // team_a_name, team_b_name, score_a, score_b viven en form

  // Plantel (evento equipo)
  const [squad, setSquad] = useState([]);

  // Competición (evento equipo)
  const [eventCompType, setEventCompType] = useState("league"); // "league" | "knockout"
  const [eventStandings, setEventStandings] = useState([]);
  const [eventKnockout, setEventKnockout] = useState([]);

  // Momentos y protagonistas (ambas categorías)
  const [moments, setMoments] = useState([]);
  const [protagonists, setProtagonists] = useState([]);

  // Cargar datos al editar
  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);

    // Cargar relaciones legacy + nuevas tablas
    Promise.all([
      onGetRelations(event.id),
      onGetEventLineups ? onGetEventLineups(event.id) : Promise.resolve([]),
      onGetEventSquad ? onGetEventSquad(event.id) : Promise.resolve([]),
      onGetEventStandings ? onGetEventStandings(event.id) : Promise.resolve([]),
      onGetEventKnockout ? onGetEventKnockout(event.id) : Promise.resolve([]),
      onGetEventMoments ? onGetEventMoments(event.id) : Promise.resolve([]),
      onGetEventProtagonists ? onGetEventProtagonists(event.id) : Promise.resolve([]),
    ]).then(([rel, lins, sq, sts, ko, mom, prot]) => {
      setRelations({
        playerIds: rel.players.map(p => p.player_id),
        teamIds: rel.teams.map(t => t.team_id),
        competitionIds: rel.competitions.map(c => c.competition_id),
      });

      // Alineaciones: separar por team_side
      const la = (lins || []).filter(r => r.team_side === "team_a")
        .map(r => ({ ...r, _id: r.id || Date.now() + Math.random() }));
      const lb = (lins || []).filter(r => r.team_side === "team_b")
        .map(r => ({ ...r, _id: r.id || Date.now() + Math.random() }));

      // Recuperar nombres de equipo desde las filas de alineación (solo si el form no los tiene ya)
      if (la.length > 0 && !form.team_a_name) set("team_a_name", la[0].team_name || "");
      if (lb.length > 0 && !form.team_b_name) set("team_b_name", lb[0].team_name || "");
      setLineupA(la);
      setLineupB(lb);

      setSquad((sq || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
      setEventStandings((sts || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));

      const koData = (ko || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() }));
      setEventKnockout(koData);
      if (koData.length > 0) setEventCompType("knockout");

      setMoments((mom || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));
      setProtagonists((prot || []).map(r => ({ ...r, _id: r.id || Date.now() + Math.random() })));

    }).catch(() => { }).finally(() => setLoadingData(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleId = (key, id) =>
    setRelations(r => ({
      ...r,
      [key]: r[key].includes(id) ? r[key].filter(x => x !== id) : [...r[key], id],
    }));

  const updateRow = (setter) => (idx, key, val) =>
    setter(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  const handleEventImport = (rows, importMode, subMode) => {
    const apply = (setter) => {
      if (importMode === "append") {
        setter(prev => [...prev, ...rows]);
      } else {
        setter(rows);
      }
    };

    switch (subMode) {
      case "event_lineup_a": apply(setLineupA); break;
      case "event_lineup_b": apply(setLineupB); break;
      case "event_squad": apply(setSquad); break;
      case "event_standings": apply(setEventStandings); break;
      case "event_knockout": apply(setEventKnockout); break;
      case "event_moments": apply(setMoments); break;
      case "event_protagonists": apply(setProtagonists); break;
      default: break;
    }
  };


  // ── Columnas tablas ────────────────────────────────────────────────────────
  const lineupCols = [
    { key: "shirt_number", label: "#", flex: 0.6, type: "number", placeholder: "10" },
    { key: "player_name", label: "Jugador", flex: 2, placeholder: "Maradona" },
    {
      key: "position_role", label: "Pos.", flex: 1, type: "select",
      options: [{ value: "", label: "—" }, ...POSITION_ROLES.map(r => ({ value: r, label: r }))],
    },
    {
      key: "is_protagonist", label: "★", flex: 0.5, type: "select",
      options: [{ value: "false", label: "—" }, { value: "true", label: "★" }],
    },
  ];

  const squadCols = [
    { key: "shirt_number", label: "#", flex: 0.6, type: "number", placeholder: "10" },
    { key: "player_name", label: "Nombre", flex: 2, placeholder: "Wirtz" },
    {
      key: "position_role", label: "Pos.", flex: 1, type: "select",
      options: [{ value: "", label: "—" }, ...POSITION_ROLES.map(r => ({ value: r, label: r }))],
    },
    {
      key: "is_key_player", label: "⭐ Clave", flex: 0.8, type: "select",
      options: [{ value: "false", label: "—" }, { value: "true", label: "⭐" }],
    },
  ];

  const evStandingCols = [
    { key: "position", label: "#", flex: 0.6, type: "number", placeholder: "1" },
    { key: "team_name", label: "Equipo", flex: 2, placeholder: "Bayer Leverkusen" },
    { key: "points", label: "Pts", flex: 0.8, type: "number", placeholder: "90" },
    { key: "wins", label: "G", flex: 0.7, type: "number", placeholder: "28" },
    { key: "draws", label: "E", flex: 0.7, type: "number", placeholder: "6" },
    { key: "losses", label: "P", flex: 0.7, type: "number", placeholder: "0" },
    { key: "goals_for", label: "GF", flex: 0.7, type: "number", placeholder: "89" },
    { key: "goals_against", label: "GC", flex: 0.7, type: "number", placeholder: "24" },
    {
      key: "is_champion", label: "🏆", flex: 0.7, type: "select",
      options: [{ value: "false", label: "—" }, { value: "true", label: "🏆" }],
    },
  ];

  const evKnockoutCols = [
    {
      key: "round", label: "Ronda", flex: 1.5, type: "select",
      options: KNOCKOUT_ROUNDS.map(r => ({ value: r, label: r })),
    },
    { key: "team_a", label: "Local", flex: 2, placeholder: "Leverkusen" },
    { key: "score_a", label: "G(L)", flex: 0.7, type: "number", placeholder: "1" },
    { key: "score_b", label: "G(V)", flex: 0.7, type: "number", placeholder: "0" },
    { key: "team_b", label: "Visitante", flex: 2, placeholder: "Kaiserslautern" },
    {
      key: "winner", label: "Ganador", flex: 1, type: "select",
      options: [
        { value: "", label: "—" },
        { value: "team_a", label: "Local" },
        { value: "team_b", label: "Visitante" },
      ],
    },
    {
      key: "is_decisive", label: "🔑", flex: 0.5, type: "select",
      options: [{ value: "false", label: "—" }, { value: "true", label: "🔑" }],
    },
  ];

  // ── Tabs dinámicas ─────────────────────────────────────────────────────────
  const isPlayer = form.event_category === "player";
  const isTeam = form.event_category === "team";

  const EVENT_TABS = [
    { key: "info", label: "Info" },
    isPlayer && { key: "lineup", label: "Alineaciones" },
    isTeam && { key: "squad", label: "Plantel" },
    isTeam && { key: "tabla", label: "Competición" },
    { key: "impacto", label: "Impacto" },
    { key: "vinculos", label: "Vínculos" },
  ].filter(Boolean);

  // Si el tab activo dejó de ser válido al cambiar categoría, volver a info
  useEffect(() => {
    const keys = EVENT_TABS.map(t => t.key);
    if (!keys.includes(tab)) setTab("info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.event_category]);

  // ── Guardar ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      const saved = await onSave(form, imageFile, bannerFile);
      const id = saved?.id || event?.id;

      if (id) {
        // Relaciones legacy
        await onSetRelations(id, relations);

        // Alineaciones: unir team_a + team_b con team_name inyectado
        if (onSetEventLineups) {
          const allLineup = [
            ...lineupA.map(({ _id, ...r }) => ({ ...r, team_side: "team_a", team_name: form.team_a_name || "" })),
            ...lineupB.map(({ _id, ...r }) => ({ ...r, team_side: "team_b", team_name: form.team_b_name || "" })),
          ];
          await onSetEventLineups(id, allLineup);
        }

        if (onSetEventSquad) {
          await onSetEventSquad(id, squad.map(({ _id, ...r }) => r));
        }
        if (onSetEventStandings) {
          await onSetEventStandings(id, eventStandings.map(({ _id, ...r }) => r));
        }
        if (onSetEventKnockout) {
          await onSetEventKnockout(id, eventKnockout.map(({ _id, ...r }) => r));
        }
        if (onSetEventMoments) {
          await onSetEventMoments(id, moments.map(({ _id, ...r }) => r));
        }
        if (onSetEventProtagonists) {
          await onSetEventProtagonists(id, protagonists.map(({ _id, ...r }) => r));
        }
      }
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="ah-panel-form">
      {/* Tabs */}
      <div className="ah-inner-tabs ah-inner-tabs--scroll">
        {EVENT_TABS.map(({ key, label }) => (
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
          <span className="ah-panel-sep">Imágenes</span>
          <div className="ah-event-images-row">
            <div className="ah-event-img-col">
              <span className="ah-phint" style={{ marginBottom: 4 }}>Principal (1:1)</span>
              <ImageUploader
                currentPath={form.image_path}
                onFile={setImageFile}
                label="Imagen principal" />
            </div>
            <div className="ah-event-banner-col">
              <span className="ah-phint" style={{ marginBottom: 4 }}>Banner panorámico (16:9)</span>
              <BannerUploader
                currentPath={form.banner_image_path}
                onFile={setBannerFile} />
            </div>
          </div>
        </div>

        <div className="ah-panel-section">
          <span className="ah-panel-sep">Datos del evento</span>

          {/* Categoría */}
          <div className="ah-event-category-toggle">
            {EVENT_CATEGORIES.map(({ value, label }) => (
              <label key={value} className="ah-ecat-opt">
                <input
                  type="radio"
                  name="event_category"
                  checked={form.event_category === value}
                  onChange={() => set("event_category", value)} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <PField label="Título" required>
            <PInput value={form.title} onChange={e => set("title", e.target.value)} placeholder="Maradona vs Inglaterra" />
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
          <PField label="Contexto (setup del momento)">
            <PTextarea rows={3} value={form.context_text || ""}
              onChange={e => set("context_text", e.target.value)}
              placeholder="El telón de fondo del evento histórico..." />
          </PField>
          <PField label="Descripción general">
            <PTextarea rows={3} value={form.description || ""}
              onChange={e => set("description", e.target.value)}
              placeholder="Descripción breve del evento..." />
          </PField>
        </div>

        <div className="ah-panel-section">
          <span className="ah-panel-sep">Visibilidad</span>
          <PublishToggle checked={form.is_published} onChange={v => set("is_published", v)} />
        </div>
      </>}

      {/* ── TAB ALINEACIONES (evento jugador) ── */}
      {tab === "lineup" && (
        <div className="ah-panel-section">

          <DataImporter
            mode="event_lineup_a"
            allowModeSwitch={true}
            onImport={handleEventImport}
          />

          <span className="ah-panel-sep">Protagonista</span>
          <PField label="Jugador protagonista">
            <PSelect value={form.protagonist_id || ""} onChange={e => set("protagonist_id", e.target.value)}>
              <option value="">— Selecciona —</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </PSelect>
          </PField>

          <span className="ah-panel-sep" style={{ marginTop: 8 }}>Resultado del partido</span>
          <div className="ah-event-score-row">
            <PInput
              placeholder="Equipo A"
              value={form.team_a_name || ""}
              onChange={e => set("team_a_name", e.target.value)}
              style={{ flex: 2 }}
            />
            <PInput
              type="number" placeholder="0"
              value={form.score_a ?? ""}
              onChange={e => set("score_a", e.target.value)}
              style={{ flex: 1, textAlign: "center" }}
            />
            <span className="ah-event-score-sep">–</span>
            <PInput
              type="number" placeholder="0"
              value={form.score_b ?? ""}
              onChange={e => set("score_b", e.target.value)}
              style={{ flex: 1, textAlign: "center" }}
            />
            <PInput
              placeholder="Equipo B"
              value={form.team_b_name || ""}
              onChange={e => set("team_b_name", e.target.value)}
              style={{ flex: 2 }}
            />
          </div>

          {/* Alineación Equipo A */}
          <span className="ah-panel-sep" style={{ marginTop: 8 }}>
            Equipo A — {form.team_a_name || "Local"}
          </span>
          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={lineupCols}
              rows={lineupA}
              onAdd={() => setLineupA(prev => [...prev, EMPTY_EVENT_LINEUP_ROW("team_a", prev.length + 1)])}
              onRemove={idx => setLineupA(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={(idx, key, val) => {
                const parsed = key === "is_protagonist" ? val === "true" : val;
                updateRow(setLineupA)(idx, key, parsed);
              }}
              addLabel="Añadir jugador (A)"
            />
          )}

          {/* Alineación Equipo B */}
          <span className="ah-panel-sep" style={{ marginTop: 8 }}>
            Equipo B — {form.team_b_name || "Visitante"}
          </span>
          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={lineupCols}
              rows={lineupB}
              onAdd={() => setLineupB(prev => [...prev, EMPTY_EVENT_LINEUP_ROW("team_b", prev.length + 1)])}
              onRemove={idx => setLineupB(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={(idx, key, val) => {
                const parsed = key === "is_protagonist" ? val === "true" : val;
                updateRow(setLineupB)(idx, key, parsed);
              }}
              addLabel="Añadir jugador (B)"
            />
          )}
          <span className="ah-phint">★ marca al jugador protagonista del evento.</span>
        </div>
      )}

      {/* ── TAB PLANTEL (evento equipo) ── */}
      {tab === "squad" && (
        <div className="ah-panel-section ah-panel-section--table">
          <DataImporter
            mode="event_squad"
            allowModeSwitch={false}
            onImport={(rows, importMode) => handleEventImport(rows, importMode, "event_squad")}
          />

          <span className="ah-panel-sep">Equipo protagonista</span>
          <PField label="Equipo">
            <PSelect value={form.team_protagonist_id || ""} onChange={e => set("team_protagonist_id", e.target.value)}>
              <option value="">— Selecciona —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </PSelect>
          </PField>

          <span className="ah-panel-sep" style={{ marginTop: 8 }}>Plantel del evento</span>
          {loadingData ? (
            <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
          ) : (
            <EditableTable
              columns={squadCols}
              rows={squad}
              onAdd={() => setSquad(prev => [...prev, EMPTY_EVENT_SQUAD_ROW()])}
              onRemove={idx => setSquad(prev => prev.filter((_, i) => i !== idx))}
              onUpdate={(idx, key, val) => {
                const parsed = key === "is_key_player" ? val === "true" : val;
                updateRow(setSquad)(idx, key, parsed);
              }}
              addLabel="Añadir jugador"
            />
          )}
          <span className="ah-phint">⭐ marca a los jugadores clave del momento histórico.</span>
        </div>
      )}

      {/* ── TAB COMPETICIÓN (evento equipo) ── */}
      {tab === "tabla" && (
        <div className="ah-panel-section ah-panel-section--table">

          <DataImporter
            mode="event_standings"
            allowModeSwitch={false}
            onImport={(rows, importMode) => handleEventImport(rows, importMode, "event_standings")}
          />

          <span className="ah-panel-sep">Tipo de competición</span>
          <div className="ah-event-comptype-toggle">
            {EVENT_COMP_TYPES.map(({ value, label }) => (
              <label key={value} className="ah-ecat-opt">
                <input
                  type="radio"
                  name="ev_comp_type"
                  checked={eventCompType === value}
                  onChange={() => setEventCompType(value)} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {eventCompType === "league" && <>
            <span className="ah-panel-sep" style={{ marginTop: 8 }}>Tabla de posiciones</span>
            {loadingData ? (
              <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
            ) : (
              <EditableTable
                columns={evStandingCols}
                rows={eventStandings}
                onAdd={() => setEventStandings(prev => [...prev, EMPTY_EVENT_STANDING_ROW(prev.length + 1)])}
                onRemove={idx => setEventStandings(prev => prev.filter((_, i) => i !== idx))}
                onUpdate={(idx, key, val) => {
                  const parsed = key === "is_champion" ? val === "true" : val;
                  updateRow(setEventStandings)(idx, key, parsed);
                }}
                addLabel="Añadir equipo"
              />
            )}
          </>}

          {eventCompType === "knockout" && <>
            <DataImporter
              mode="event_knockout"
              allowModeSwitch={false}
              onImport={(rows, importMode) => handleEventImport(rows, importMode, "event_knockout")}
            />

            <span className="ah-panel-sep" style={{ marginTop: 8 }}>Partidos clave</span>
            {loadingData ? (
              <div className="ah-loading-msg"><RefreshCw size={12} className="ah-spin" /> Cargando...</div>
            ) : (
              <EditableTable
                columns={evKnockoutCols}
                rows={eventKnockout}
                onAdd={() => setEventKnockout(prev => [...prev, EMPTY_EVENT_KNOCKOUT_ROW(prev.length)])}
                onRemove={idx => setEventKnockout(prev => prev.filter((_, i) => i !== idx))}
                onUpdate={(idx, key, val) => {
                  const parsed = key === "is_decisive" ? val === "true" : val;
                  updateRow(setEventKnockout)(idx, key, parsed);
                }}
                addLabel="Añadir partido"
              />
            )}
          </>}
        </div>
      )}

      {/* ── TAB IMPACTO ── */}
      {tab === "impacto" && (
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Legado e impacto</span>
          <PField label="Impacto y legado">
            <PTextarea rows={5} value={form.impact_text || ""}
              onChange={e => set("impact_text", e.target.value)}
              placeholder="Las consecuencias y el legado que dejó este momento..." />
          </PField>
        </div>
      )}

      {/* ── TAB VÍNCULOS (legacy) ── */}
      {tab === "vinculos" && <>
        <div className="ah-panel-section">
          <span className="ah-panel-sep">Jugadores involucrados</span>
          <div className="ah-check-list">
            {players.map(p => (
              <label key={p.id} className="ah-check-item">
                <input type="checkbox" checked={relations.playerIds.includes(p.id)}
                  onChange={() => toggleId("playerIds", p.id)} />
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
                <input type="checkbox" checked={relations.teamIds.includes(t.id)}
                  onChange={() => toggleId("teamIds", t.id)} />
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
                <input type="checkbox" checked={relations.competitionIds.includes(c.id)}
                  onChange={() => toggleId("competitionIds", c.id)} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      </>}

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
              {item.is_published ? <><Eye size={10} /></> : <><EyeOff size={10} /> </>}
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

// ── Lista de eventos en grid ──────────────────────────────────────
function EventListGrid({ items, onEdit, onDelete, onTogglePublish, selectedId }) {
  const [confirmId, setConfirmId] = useState(null);

  if (items.length === 0) return <p className="ah-list-empty">No hay eventos históricos.</p>;

  return (
    <div className="ah-event-grid">
      {items.map(item => (
        <div key={item.id} className={`ah-event-card ${item.id === selectedId ? "ah-event-card--active" : ""}`}>
          {/* Banner background */}
          <div className="ah-event-card-bg"
            style={{ backgroundImage: `url(${getHistoricalImageUrl(item.banner_image_path)})` }}>
            <div className="ah-event-card-overlay" />

            {/* Badge tipo de evento */}
            <div className="ah-event-card-badge">{EVENT_TYPE_LABEL[item.event_type] || item.event_type}</div>

            {/* Actions - top right */}
            <div className="ah-event-card-actions">
              <button
                className={`ah-pub-pill ${item.is_published ? "ah-pub-pill--on" : "ah-pub-pill--off"}`}
                onClick={() => onTogglePublish(item.id, item.is_published)}>
                {item.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button className="ah-list-btn ah-list-btn--edit" onClick={() => onEdit(item)}>
                <Pencil size={14} />
              </button>
              {confirmId === item.id ? (
                <>
                  <button className="ah-list-btn ah-list-btn--confirm"
                    onClick={() => { onDelete(item.id); setConfirmId(null); }}>
                    <Check size={14} />
                  </button>
                  <button className="ah-list-btn ah-list-btn--cancel-del" onClick={() => setConfirmId(null)}>
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button className="ah-list-btn ah-list-btn--del" onClick={() => setConfirmId(item.id)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Footer con título y fecha */}
          <div className="ah-event-card-footer">
            <span className="ah-event-card-title">{item.title}</span>
            <span className="ah-event-card-date">{item.event_date}</span>
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
  const [filterPosition, setFilterPosition] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterSignificance, setFilterSignificance] = useState("");

  const {
    players, teams, competitions, events, users,
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
    getCompetitionGroups, setCompetitionGroups,
    getCompetitionStandings, setCompetitionStandings,
    getCompetitionKnockout, setCompetitionKnockout,
    getEventLineups, setEventLineups,
    getEventSquad, setEventSquad,
    getEventStandings, setEventStandings,
    getEventKnockout, setEventKnockout,
  } = useAdminHistorical();

  const q = search.toLowerCase();
  const filteredPlayers = players
    .filter(p => p.name.toLowerCase().includes(q))
    .filter(p => !filterPosition || p.position === filterPosition)
    .filter(p => !filterCountry || (p.country || "").toLowerCase().includes(filterCountry.toLowerCase()))
    .filter(p => !filterSignificance || p.significance_level === Number(filterSignificance))
    .sort((a, b) => (b.significance_level ?? 0) - (a.significance_level ?? 0));
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(q));
  const filteredCompetitions = competitions.filter(c => c.name.toLowerCase().includes(q));
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(q));

  const openCreate = () => setPanel({ type: activeTab, data: null });
  const openEdit = (data) => setPanel({ type: activeTab, data });
  const closePanel = () => setPanel(null);

  const handleSavePlayer = (form, file) => form.id ? updatePlayer(form.id, form, file) : createPlayer(form, file);
  const handleSaveTeam = (form, file) => form.id ? updateTeam(form.id, form, file) : createTeam(form, file);
  const handleSaveCompetition = (form, file) => form.id ? updateCompetition(form.id, form, file) : createCompetition(form, file);
  const handleSaveEvent = (form, imageFile, bannerFile) =>
    form.id
      ? updateEvent(form.id, form, imageFile, bannerFile)
      : createEvent(form, imageFile, bannerFile);

  const tabCounts = {
    players: players.length, teams: teams.length,
    competitions: competitions.length, events: events.length,
  };
  const selectedId = panel?.data?.id || null;

  const renderPlayerMeta = (p) =>
    [
      POSITION_LABEL[p.position] || p.position,
    ].filter(Boolean).join("");

  const renderTeamMeta = (t) =>
    [LEGACY_TEAM_LABEL[t.legacy_type] || t.legacy_type]
      .filter(Boolean).join(" · ");

  const renderCompMeta = (c) =>
    [c.year ? String(c.year) : null, COMP_TYPE_LABEL[c.type] || c.type].filter(Boolean).join(" · ");

  const renderEventMeta = (e) =>
    [EVENT_TYPE_LABEL[e.event_type] || e.event_type, e.event_date].filter(Boolean).join(" · ");

  // ── Bloquear scroll del body cuando el drawer está abierto ──
  useEffect(() => {
    if (panel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [panel]);

  const isOpen = !!panel;

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
              {activeTab === "players" && <>
                <div className="ah-controls" style={{ height: "auto", padding: "6px 14px", gap: 6, flexWrap: "wrap" }}>
                  <select className="ah-pinput" style={{ flex: 1, minWidth: 100, height: 28, fontSize: 10 }}
                    value={filterPosition} onChange={e => setFilterPosition(e.target.value)}>
                    <option value="">Todas las posiciones</option>
                    {POSITIONS.map(p => <option key={p} value={p}>{POSITION_LABEL[p] || p}</option>)}
                  </select>
                  <select className="ah-pinput" style={{ flex: 1, minWidth: 90, height: 28, fontSize: 10 }}
                    value={filterSignificance} onChange={e => setFilterSignificance(e.target.value)}>
                    <option value="">Todas las estrellas</option>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}
                  </select>
                  <input className="ah-pinput" style={{ flex: 1, minWidth: 80, height: 28, fontSize: 10 }}
                    placeholder="País..." value={filterCountry}
                    onChange={e => setFilterCountry(e.target.value)} />
                  {(filterPosition || filterCountry || filterSignificance) && (
                    <button className="ah-search-clear" style={{ height: 28, padding: "0 8px", border: "0.5px solid var(--border)" }}
                      onClick={() => { setFilterPosition(""); setFilterCountry(""); setFilterSignificance(""); }}>
                      Limpiar
                    </button>
                  )}
                </div>
                <HistoricalList items={filteredPlayers} selectedId={selectedId}
                  onEdit={openEdit} onDelete={deletePlayer} onTogglePublish={togglePlayerPublished}
                  renderTitle={p => p.name} renderMeta={renderPlayerMeta}
                  emptyMsg="No hay jugadores históricos." />
              </>}
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
                <EventListGrid items={filteredEvents} selectedId={selectedId}
                  onEdit={openEdit} onDelete={deleteEvent} onTogglePublish={toggleEventPublished} />
              )}
            </>}
          </div>
        </div>

        {/* ── OVERLAY ── */}
        <div
          className={`ah-overlay ${isOpen ? "ah-overlay--visible" : ""}`}
          onClick={closePanel}
          aria-hidden="true"
        />

        {/* ── DRAWER (right panel) ── */}
        <aside
          className={`ah-right ${isOpen ? "ah-right--open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Panel de edición"
        >
          {/* Header */}
          <div className="ah-panel-header">
            <div className="ah-panel-header-left">
              <span className="ah-panel-dot" />
              <span className="ah-panel-title">
                {panel
                  ? TABS.find(t => t.key === activeTab)?.label.slice(0, -1) ?? "Registro"
                  : "Panel"}
              </span>
              {panel && (
                <span className={`ah-panel-badge ${panel.data ? "ah-panel-badge--edit" : "ah-panel-badge--new"}`}>
                  {panel.data ? "Editar" : "Nuevo"}
                </span>
              )}
            </div>

            {panel && (
              <button
                className="ah-panel-back"
                onClick={closePanel}
                aria-label="Cerrar panel"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="ah-panel-body">
            {!panel && <EmptyPanel activeTab={activeTab} />}

            {panel?.type === "players" && (
              <PlayerPanel
                player={panel.data} teams={teams} users={users}
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
                onGetGroups={getCompetitionGroups} onSetGroups={setCompetitionGroups}
                onGetStandings={getCompetitionStandings} onSetStandings={setCompetitionStandings}
                onGetKnockout={getCompetitionKnockout} onSetKnockout={setCompetitionKnockout}
              />
            )}

            {panel?.type === "events" && (
              <EventPanel
                event={panel.data} players={players} teams={teams} competitions={competitions}
                onSave={handleSaveEvent} onClose={closePanel}
                onGetRelations={getEventRelations} onSetRelations={setEventRelations}
                onGetEventLineups={getEventLineups} onSetEventLineups={setEventLineups}
                onGetEventSquad={getEventSquad} onSetEventSquad={setEventSquad}
                onGetEventStandings={getEventStandings} onSetEventStandings={setEventStandings}
                onGetEventKnockout={getEventKnockout} onSetEventKnockout={setEventKnockout}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}