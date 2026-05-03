import { useState } from "react";
import { Upload, X, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// ─── Formatos de ayuda por modo ───────────────────────────────────────────────
const FORMAT_HELP = {
  // ── Competencias ────────────────────────────────────────────────────────────
  groups: {
    label: "Grupos",
    placeholder: `Grupo A\tBrasil\t1\t6\t2\t0\t1\t5\t2\nGrupo A\tAlemania\t2\t4\t1\t1\t1\t3\t3\nGrupo A\tArgentina\t3\t2\t0\t2\t1\t2\t4\nGrupo B\tFrancia\t1\t9\t3\t0\t0\t7\t1`,
    hint: "Grupo · Equipo · Pos · Pts · G · E · P · GF · GC",
    columns: ["group_name", "team_name", "position", "points", "wins", "draws", "losses", "goals_for", "goals_against"],
  },
  standings: {
    label: "Tabla Liga",
    placeholder: `1\tInter de Milán\t72\t22\t6\t6\t60\t30\ttrue\n2\tJuventus\t65\t19\t8\t7\t58\t35\tfalse\n3\tAC Milan\t62\t18\t8\t8\t52\t31\tfalse`,
    hint: "Pos · Equipo · Pts · G · E · P · GF · GC · Campeón(true/false)",
    columns: ["position", "team_name", "points", "wins", "draws", "losses", "goals_for", "goals_against", "champion"],
  },
  knockout: {
    label: "Eliminatorias",
    placeholder: `Cuartos\t1\tBrasil\t3\t1\tPolonia\t\t\tteam_a\t\nSemifinal\t1\tBrasil\t3\t2\tAlemania\t\t\tteam_a\tPrórroga\nFinal\t1\tBrasil\t4\t1\tItalia\t\t\tteam_a\t`,
    hint: "Ronda · Nº · Local · G(L) · G(V) · Visitante · Pen.L · Pen.V · Ganador(team_a/team_b/draw) · Nota",
    columns: ["round", "match_number", "team_a", "score_a", "score_b", "team_b", "penalties_a", "penalties_b", "winner", "notes"],
  },

  // ── Jugadores ────────────────────────────────────────────────────────────────
  career: {
    label: "Trayectoria Clubes",
    placeholder: `FC Barcelona\tEspaña\t1995\t2000\t186\t85\t35\tCapitán\nReal Madrid\tEspaña\t2000\t2005\t210\t120\t40\t\nSeleção Brasil\tBrasil\t2005\t2008\t90\t42\t18\tTítulo mundial`,
    hint: "Club · País · Desde · Hasta · PJ · Goles · Asistencias · Nota (opcional)",
    columns: ["team_name", "team_country", "start_year", "end_year", "appearances", "goals", "assists", "role_note"],
  },
  national: {
    label: "Selección Nacional",
    placeholder: `Argentina\t1993\t2006\t91\t34\t12\tCapitán histórico\nArgentina Sub-20\t1991\t1992\t12\t8\t4\tMundial Juvenil`,
    hint: "Selección · Desde · Hasta · Partidos · Goles · Asistencias · Nota (opcional)",
    columns: ["country", "start_year", "end_year", "caps", "goals", "assists", "role_note"],
  },
  titles: {
    label: "Palmarés",
    placeholder: `club\tChampions League\t2000\tReal Madrid\t1\nclub\tLa Liga\t1999\tBarcelona\t2\nnational\tCopa del Mundo\t1998\tFrancia\t1\nindividual\tBalón de Oro\t2001\t\t1`,
    hint: "Categoría(club/national/individual) · Título · Año · Con(equipo, opcional) · Cantidad",
    columns: ["title_category", "title_name", "year", "team_name", "quantity"],
    specialParse: true, // requiere lógica de validación de categoría
  },
};

// ─── Parser universal (tab, coma, punto y coma, pipe) ─────────────────────────
function parseLine(line) {
  // Primero intentamos tab (formato preferido)
  if (line.includes("\t")) return line.split("\t").map(c => c.trim());
  // Luego coma (CSV simple)
  if (line.includes(",")) return line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
  // Luego pipe
  if (line.includes("|")) return line.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1 || arr.length <= 2);
  // Punto y coma
  return line.split(";").map(c => c.trim());
}

// Categorías válidas para palmarés de jugador
const VALID_TITLE_CATEGORIES = ["club", "national", "individual"];

function parseData(raw, mode) {
  const config = FORMAT_HELP[mode];
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const rows = [];
  const errors = [];

  lines.forEach((line, idx) => {
    // Ignorar líneas que parecen encabezados o comentarios
    if (line.startsWith("#") || line.startsWith("//")) return;

    const cells = parseLine(line);
    if (cells.length < 2) {
      errors.push(`Línea ${idx + 1}: muy pocas columnas (${cells.length})`);
      return;
    }

    const row = { _id: Date.now() + Math.random() + idx };
    config.columns.forEach((col, i) => {
      let val = cells[i] ?? "";

      // ── Conversiones por tipo de campo ──────────────────────────────────────
      if (col === "champion") {
        // Booleano para tabla liga
        val = val === "true" || val === "1" || val === "sí" || val === "si" || val === "yes";

      } else if (col === "title_category") {
        // Normalizar categoría de palmarés: acepta abreviaturas
        const map = {
          "c": "club", "cl": "club", "club": "club",
          "n": "national", "na": "national", "nat": "national", "national": "national",
          "sel": "national", "selección": "national", "seleccion": "national",
          "i": "individual", "ind": "individual", "individual": "individual",
        };
        val = map[val.toLowerCase()] || (VALID_TITLE_CATEGORIES.includes(val.toLowerCase()) ? val.toLowerCase() : "club");

      } else if (col === "quantity") {
        // Número, mínimo 1
        const n = parseInt(val, 10);
        val = isNaN(n) || n < 1 ? 1 : n;

      } else if (["start_year", "end_year", "year", "appearances", "goals", "assists", "caps",
        "points", "wins", "draws", "losses", "goals_for", "goals_against",
        "score_a", "score_b", "penalties_a", "penalties_b", "position"].includes(col)) {
        // Limpiar a string vacío si no es número válido, pero no forzar conversión
        // (las columnas de tabla son strings en el componente EditableTable)
        if (val !== "" && isNaN(Number(val))) {
          errors.push(`Línea ${idx + 1}, columna "${col}": se esperaba número, se recibió "${val}"`);
        }
      }

      // Limpiar espacios vacíos a string vacío
      if (typeof val === "string" && val.trim() === "") val = "";
      row[col] = val;
    });

    rows.push(row);
  });

  return { rows, errors };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function DataImporter({ mode, onImport }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null); // { rows, errors }
  const [importMode, setImportMode] = useState("replace"); // "replace" | "append"

  const config = FORMAT_HELP[mode];

  const handleParse = () => {
    if (!raw.trim()) return;
    const parsed = parseData(raw, mode);
    setResult(parsed);
  };

  const handleConfirm = () => {
    if (!result) return;
    onImport(result.rows, importMode);
    setOpen(false);
    setRaw("");
    setResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    setRaw("");
    setResult(null);
  };

  // Vista previa: primeras 3 filas parseadas
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

      {/* Panel desplegable */}
      {open && (
        <div className="di-panel">
          <div className="di-panel-head">
            <span className="di-panel-title">IMPORTAR · {config.label.toUpperCase()}</span>
            <button type="button" className="di-close" onClick={handleClose}>
              <X size={11} />
            </button>
          </div>

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
              <input
                type="radio" name={`di-mode-${mode}`}
                checked={importMode === "replace"}
                onChange={() => setImportMode("replace")}
              />
              Reemplazar todo
            </label>
            <label className="di-radio">
              <input
                type="radio" name={`di-mode-${mode}`}
                checked={importMode === "append"}
                onChange={() => setImportMode("append")}
              />
              Añadir al final
            </label>
          </div>

          {/* Resultado del parse */}
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
              {/* Vista previa mini */}
              {preview.length > 0 && (
                <div className="di-preview">
                  <span className="di-preview-label">Vista previa (primeras {preview.length} filas):</span>
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
            <button type="button" className="di-btn di-btn--parse" onClick={handleParse} disabled={!raw.trim()}>
              Parsear
            </button>
            <button
              type="button"
              className="di-btn di-btn--confirm"
              onClick={handleConfirm}
              disabled={!result || result.rows.length === 0}
            >
              <Check size={10} /> Confirmar importación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}