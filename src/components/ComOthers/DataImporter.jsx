import { useState } from "react";
import { Upload, X, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// ─── Formatos de ayuda por modo ───────────────────────────────────────────────
const FORMAT_HELP = {
  groups: {
    label: "Grupos",
    placeholder: `Grupo A	Brasil	1	6	2	0	1	5	2
Grupo A	Alemania	2	4	1	1	1	3	3
Grupo A	Argentina	3	2	0	2	1	2	4
Grupo B	Francia	1	9	3	0	0	7	1`,
    hint: "Columnas: Grupo · Equipo · Pos · Pts · G · E · P · GF · GC",
    columns: ["group_name", "team_name", "position", "points", "wins", "draws", "losses", "goals_for", "goals_against"],
  },
  standings: {
    label: "Tabla Liga",
    placeholder: `1	Inter de Milán	72	22	6	6	60	30	true
2	Juventus	65	19	8	7	58	35	false
3	AC Milan	62	18	8	8	52	31	false`,
    hint: "Columnas: Pos · Equipo · Pts · G · E · P · GF · GC · Campeón(true/false)",
    columns: ["position", "team_name", "points", "wins", "draws", "losses", "goals_for", "goals_against", "champion"],
  },
  knockout: {
    label: "Eliminatorias",
    placeholder: `Cuartos	1	Brasil	3	1	Polonia	 	 	team_a	
Cuartos	2	Alemania	2	0	España	 	 	team_a	
Semifinal	1	Brasil	3	2	Alemania	 	 	team_a	Prórroga
Final	1	Brasil	4	1	Italia	 	 	team_a	`,
    hint: "Columnas: Ronda · Nº · Local · G(L) · G(V) · Visitante · Pen.L · Pen.V · Ganador(team_a/team_b/draw) · Nota",
    columns: ["round", "match_number", "team_a", "score_a", "score_b", "team_b", "penalties_a", "penalties_b", "winner", "notes"],
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

function parseData(raw, mode) {
  const config = FORMAT_HELP[mode];
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const rows = [];
  const errors = [];

  lines.forEach((line, idx) => {
    // Ignorar líneas que parecen encabezados
    if (line.startsWith("#") || line.startsWith("//")) return;

    const cells = parseLine(line);
    if (cells.length < 2) {
      errors.push(`Línea ${idx + 1}: muy pocas columnas (${cells.length})`);
      return;
    }

    const row = { _id: Date.now() + Math.random() + idx };
    config.columns.forEach((col, i) => {
      let val = cells[i] ?? "";
      // Conversión booleana para champion
      if (col === "champion") {
        val = val === "true" || val === "1" || val === "sí" || val === "si" || val === "yes";
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
            <span className="di-hint-label">Formato (separado por tabulaciones, comas o punto y coma):</span>
            <code className="di-hint-cols">{config.hint}</code>
            <details className="di-example-details">
              <summary className="di-example-summary">Ver ejemplo</summary>
              <pre className="di-example-pre">{config.placeholder}</pre>
            </details>
          </div>

          {/* Textarea */}
          <textarea
            className="di-textarea"
            rows={8}
            placeholder={config.placeholder}
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
