import { useState } from "react";
import { Upload, X, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// ─── Formatos de ayuda por modo ───────────────────────────────────────────────
const FORMAT_HELP = {
  // ── Competencias ─────────────────────────────────────────────────────────────
  groups: {
    label: "Grupos",
    placeholder: `Grupo A\tBrasil\t1\t6\t2\t0\t1\t5\t2\nGrupo A\tAlemania\t2\t4\t1\t1\t1\t3\t3\nGrupo B\tFrancia\t1\t9\t3\t0\t0\t7\t1`,
    hint: "Grupo · Equipo · Pos · Pts · G · E · P · GF · GC",
    columns: ["group_name", "team_name", "position", "points", "wins", "draws", "losses", "goals_for", "goals_against"],
  },
  standings: {
    label: "Tabla Liga",
    placeholder: `1\tInter de Milán\t72\t22\t6\t6\t60\t30\ttrue\n2\tJuventus\t65\t19\t8\t7\t58\t35\tfalse`,
    hint: "Pos · Equipo · Pts · G · E · P · GF · GC · Campeón(true/false)",
    columns: ["position", "team_name", "points", "wins", "draws", "losses", "goals_for", "goals_against", "champion"],
  },
  knockout: {
    label: "Eliminatorias",
    placeholder: `Cuartos\t1\tBrasil\t3\t1\tPolonia\t\t\tteam_a\t\nSemifinal\t1\tBrasil\t3\t2\tAlemania\t\t\tteam_a\tPrórroga\nFinal\t1\tBrasil\t4\t1\tItalia\t\t\tteam_a\t`,
    hint: "Ronda · Nº · Local · G(L) · G(V) · Visitante · Pen.L · Pen.V · Ganador(team_a/team_b/draw) · Nota",
    columns: ["round", "match_number", "team_a", "score_a", "score_b", "team_b", "penalties_a", "penalties_b", "winner", "notes"],
  },

  // ── Jugadores ─────────────────────────────────────────────────────────────────
  career: {
    label: "Trayectoria Clubes",
    placeholder: `FC Barcelona\tEspaña\t1995\t2000\t186\t85\t35\tCapitán\nReal Madrid\tEspaña\t2000\t2005\t210\t120\t40\t`,
    hint: "Club · País · Desde · Hasta · PJ · Goles · Asistencias · Nota (opcional)",
    columns: ["team_name", "team_country", "start_year", "end_year", "appearances", "goals", "assists", "role_note"],
  },
  national: {
    label: "Selección Nacional",
    placeholder: `Argentina\t1993\t2006\t91\t34\t12\tCapitán histórico\nArgentina Sub-20\t1991\t1992\t12\t8\t4\t`,
    hint: "Selección · Desde · Hasta · Partidos · Goles · Asistencias · Nota (opcional)",
    columns: ["country", "start_year", "end_year", "caps", "goals", "assists", "role_note"],
  },
  titles: {
    label: "Palmarés",
    placeholder: `club\tChampions League\t2000\tReal Madrid\t1\nnational\tCopa del Mundo\t1998\tFrancia\t1\nindividual\tBalón de Oro\t2001\t\t1`,
    hint: "Categoría(club/national/individual) · Título · Año · Con(equipo, opcional) · Cantidad",
    columns: ["title_category", "title_name", "year", "team_name", "quantity"],
    specialParse: true,
  },

  // ── Eventos — Alineaciones ────────────────────────────────────────────────────
  event_lineup_a: {
    label: "Alineación Equipo A",
    placeholder: `1\tFilippo Galli\tCB\tfalse\n2\tMauro Tassotti\tRB\tfalse\n3\tPaolo Maldini\tLB\tfalse\n9\tMarco van Basten\tST\ttrue\n10\tRuud Gullit\tCAM\tfalse`,
    hint: "# · Jugador · Pos(GK/CB/LB...) · Protagonista(true/false)",
    columns: ["shirt_number", "player_name", "position_role", "is_protagonist"],
  },
  event_lineup_b: {
    label: "Alineación Equipo B",
    placeholder: `1\tNeville Southall\tGK\tfalse\n5\tKevin Ratcliffe\tCB\tfalse\n10\tPeter Reid\tCM\tfalse\n9\tGraeme Sharp\tST\tfalse`,
    hint: "# · Jugador · Pos(GK/CB/LB...) · Protagonista(true/false)",
    columns: ["shirt_number", "player_name", "position_role", "is_protagonist"],
  },

  // ── Eventos — Plantel ─────────────────────────────────────────────────────────
  event_squad: {
    label: "Plantel del Evento",
    placeholder: `1\tFabio Cannavaro\tCB\tfalse\n3\tPaolo Maldini\tLB\ttrue\n7\tAndreea Pirlo\tCM\ttrue\n9\tFrancesco Totti\tST\tfalse\n10\tAllessandro Del Piero\tST\ttrue`,
    hint: "# · Nombre · Pos(GK/CB/LB...) · Clave(true/false)",
    columns: ["shirt_number", "player_name", "position_role", "is_key_player"],
  },

  // ── Eventos — Tabla de posiciones ─────────────────────────────────────────────
  event_standings: {
    label: "Tabla del Evento",
    placeholder: `1\tBayer Leverkusen\t90\t28\t6\t0\t89\t24\ttrue\n2\tBorussia Dortmund\t78\t22\t12\t0\t72\t36\tfalse\n3\tRB Leipzig\t65\t18\t11\t5\t58\t40\tfalse`,
    hint: "Pos · Equipo · Pts · G · E · P · GF · GC · Campeón(true/false)",
    columns: ["position", "team_name", "points", "wins", "draws", "losses", "goals_for", "goals_against", "is_champion"],
  },

  // ── Eventos — Eliminatorias ───────────────────────────────────────────────────
  event_knockout: {
    label: "Eliminatorias del Evento",
    placeholder: `Cuartos\tLeverkusen\t2\t0\tAtlético\tteam_a\tfalse\nSemifinal\tLeverkusen\t2\t1\tRoma\tteam_a\ttrue\nFinal\tLeverkusen\t3\t0\tAtlanta\tteam_a\ttrue`,
    hint: "Ronda · Local · G(L) · G(V) · Visitante · Ganador(team_a/team_b) · Decisivo(true/false)",
    columns: ["round", "team_a", "score_a", "score_b", "team_b", "winner", "is_decisive"],
  },
};

// ─── Parser universal (tab, coma, punto y coma, pipe) ─────────────────────────
function parseLine(line) {
  if (line.includes("\t")) return line.split("\t").map(c => c.trim());
  if (line.includes(",")) return line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
  if (line.includes("|")) return line.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1 || arr.length <= 2);
  return line.split(";").map(c => c.trim());
}

const VALID_TITLE_CATEGORIES = ["club", "national", "individual"];

const VALID_ROUNDS = ["Octavos", "Cuartos", "Semifinal", "Tercero", "Final"];
const ROUND_MAP = {
  "octavos": "Octavos", "8vos": "Octavos", "r16": "Octavos",
  "cuartos": "Cuartos", "qf": "Cuartos",
  "semifinal": "Semifinal", "semis": "Semifinal", "sf": "Semifinal",
  "tercero": "Tercero", "3ro": "Tercero", "3rd": "Tercero",
  "final": "Final", "f": "Final",
};

const POSITION_ROLES = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "SS"];
const POSITION_MAP = Object.fromEntries(POSITION_ROLES.map(p => [p.toLowerCase(), p]));

function parseBool(val) {
  return val === "true" || val === "1" || val === "sí" || val === "si" || val === "yes" || val === "★" || val === "⭐";
}

function parseData(raw, mode) {
  const config = FORMAT_HELP[mode];
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const rows = [];
  const errors = [];

  lines.forEach((line, idx) => {
    if (line.startsWith("#") || line.startsWith("//")) return;

    const cells = parseLine(line);
    if (cells.length < 2) {
      errors.push(`Línea ${idx + 1}: muy pocas columnas (${cells.length})`);
      return;
    }

    const row = { _id: Date.now() + Math.random() + idx };

    config.columns.forEach((col, i) => {
      let val = cells[i] ?? "";

      // ── Conversiones por columna ─────────────────────────────────────────────
      if (col === "champion" || col === "is_champion") {
        val = parseBool(String(val));

      } else if (col === "is_protagonist" || col === "is_key_player" || col === "is_decisive") {
        val = parseBool(String(val));

      } else if (col === "title_category") {
        const map = {
          "c": "club", "cl": "club", "club": "club",
          "n": "national", "na": "national", "nat": "national", "national": "national",
          "sel": "national", "selección": "national", "seleccion": "national",
          "i": "individual", "ind": "individual", "individual": "individual",
        };
        val = map[val.toLowerCase()] || (VALID_TITLE_CATEGORIES.includes(val.toLowerCase()) ? val.toLowerCase() : "club");

      } else if (col === "quantity") {
        const n = parseInt(val, 10);
        val = isNaN(n) || n < 1 ? 1 : n;

      } else if (col === "round") {
        // Normalizar ronda a valor canónico
        const mapped = ROUND_MAP[val.toLowerCase()];
        if (mapped) {
          val = mapped;
        } else if (!VALID_ROUNDS.includes(val)) {
          errors.push(`Línea ${idx + 1}: ronda "${val}" desconocida, se usará tal cual`);
        }

      } else if (col === "position_role") {
        // Normalizar posición
        const mapped = POSITION_MAP[val.toLowerCase()];
        if (mapped) {
          val = mapped;
        } else if (val !== "" && !POSITION_ROLES.includes(val)) {
          errors.push(`Línea ${idx + 1}: posición "${val}" desconocida`);
        }

      } else if (col === "winner") {
        // Normalizar ganador
        const winnerMap = {
          "local": "team_a", "a": "team_a", "team_a": "team_a",
          "visitante": "team_b", "b": "team_b", "team_b": "team_b",
          "empate": "draw", "draw": "draw", "-": "",
        };
        val = winnerMap[val.toLowerCase()] ?? val;

      } else if ([
        "start_year", "end_year", "year", "appearances", "goals", "assists", "caps",
        "points", "wins", "draws", "losses", "goals_for", "goals_against",
        "score_a", "score_b", "penalties_a", "penalties_b", "position",
        "shirt_number", "match_number",
      ].includes(col)) {
        if (val !== "" && isNaN(Number(val))) {
          errors.push(`Línea ${idx + 1}, col "${col}": se esperaba número, recibió "${val}"`);
        }
      }

      if (typeof val === "string" && val.trim() === "") val = "";
      row[col] = val;
    });

    rows.push(row);
  });

  return { rows, errors };
}

// ─── Etiquetas para el selector de modo en eventos ────────────────────────────
const EVENT_MODE_OPTIONS = [
  { value: "event_lineup_a", label: "📋 Alineación A" },
  { value: "event_lineup_b", label: "📋 Alineación B" },
  { value: "event_squad", label: "👥 Plantel" },
  { value: "event_standings", label: "📊 Tabla" },
  { value: "event_knockout", label: "⚔️ Eliminatorias" },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export function DataImporter({ mode, onImport, allowModeSwitch = false }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [importMode, setImportMode] = useState("replace");
  // Para el panel de eventos, permite cambiar entre sub-modos
  const [activeMode, setActiveMode] = useState(mode);

  // Si mode cambia externamente, sincronizar
  const effectiveMode = allowModeSwitch ? activeMode : mode;
  const config = FORMAT_HELP[effectiveMode];

  const handleParse = () => {
    if (!raw.trim()) return;
    setResult(parseData(raw, effectiveMode));
  };

  const handleConfirm = () => {
    if (!result) return;
    onImport(result.rows, importMode, effectiveMode); // ← pasa effectiveMode para que el caller sepa a qué lista aplicar
    setOpen(false);
    setRaw("");
    setResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    setRaw("");
    setResult(null);
  };

  const preview = result?.rows?.slice(0, 3) ?? [];

  return (
    <div className="di-root">
      {/* Trigger */}
      <button
        type="button"
        className={`di-trigger ${open ? "di-trigger--active" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <Upload size={10} />
        <span>Importar datos en masa</span>
        {open ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="di-panel">
          <div className="di-panel-head">
            <span className="di-panel-title">IMPORTAR · {config.label.toUpperCase()}</span>
            <button type="button" className="di-close" onClick={handleClose}>
              <X size={11} />
            </button>
          </div>

          {/* Selector de sub-modo (solo en panel de eventos) */}
          {allowModeSwitch && (
            <div className="di-mode-switch">
              {EVENT_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`di-mode-switch-btn ${activeMode === opt.value ? "di-mode-switch-btn--active" : ""}`}
                  onClick={() => { setActiveMode(opt.value); setRaw(""); setResult(null); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Hint de formato */}
          <div className="di-hint-box">
            <span className="di-hint-label">Columnas esperadas:</span>
            <div className="di-hint-cols-wrap">
              {config.columns.map((col, i) => (
                <span key={col} className="di-hint-col-pill">
                  <span className="di-hint-col-n">{i + 1}</span>
                  {col}
                </span>
              ))}
            </div>
            <span className="di-hint-label" style={{ marginTop: 4 }}>
              Separadores aceptados: <code className="di-inline-code">Tab · , · ; · |</code>
              &nbsp;— Pega directo desde Excel o Google Sheets.
            </span>
            <details className="di-example-details">
              <summary className="di-example-summary">Ver ejemplo</summary>
              <pre className="di-example-pre">{config.placeholder}</pre>
            </details>
          </div>

          {/* Textarea */}
          <textarea
            className="di-textarea"
            rows={7}
            placeholder={`Pega aquí tus datos...\n${config.hint}`}
            value={raw}
            onChange={e => { setRaw(e.target.value); setResult(null); }}
            spellCheck={false}
          />

          {/* Modo importación */}
          <div className="di-mode-row">
            <span className="di-mode-label">Al importar:</span>
            <label className="di-radio">
              <input type="radio" name={`di-mode-${effectiveMode}`}
                checked={importMode === "replace"} onChange={() => setImportMode("replace")} />
              Reemplazar todo
            </label>
            <label className="di-radio">
              <input type="radio" name={`di-mode-${effectiveMode}`}
                checked={importMode === "append"} onChange={() => setImportMode("append")} />
              Añadir al final
            </label>
          </div>

          {/* Resultado */}
          {result && (
            <div className={`di-result ${result.errors.length > 0 ? "di-result--warn" : "di-result--ok"}`}>
              <div className="di-result-summary">
                <Check size={11} />
                <span>{result.rows.length} filas listas para importar</span>
                {result.errors.length > 0 && (
                  <span className="di-result-errs">
                    <AlertCircle size={10} /> {result.errors.length} advertencia(s)
                  </span>
                )}
              </div>
              {result.errors.length > 0 && (
                <ul className="di-errors-list">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
              {preview.length > 0 && (
                <div className="di-preview">
                  <span className="di-preview-label">Vista previa ({preview.length} filas):</span>
                  <div className="di-preview-table">
                    <div className="di-preview-head">
                      {config.columns.map(col => (
                        <span key={col} className="di-preview-th">{col}</span>
                      ))}
                    </div>
                    {preview.map((row, i) => (
                      <div key={i} className="di-preview-row">
                        {config.columns.map(col => (
                          <span key={col} className="di-preview-td">
                            {String(row[col] ?? "—")}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="di-actions">
            <button type="button" className="di-btn di-btn--parse"
              onClick={handleParse} disabled={!raw.trim()}>
              Parsear
            </button>
            <button type="button" className="di-btn di-btn--confirm"
              onClick={handleConfirm} disabled={!result || result.rows.length === 0}>
              <Check size={10} /> Confirmar importación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}