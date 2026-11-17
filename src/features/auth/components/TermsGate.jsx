import { useEffect, useRef, useState } from "react";
import { supabase } from "@/shared/services/supabase/client";

import "./TermsGate.css";

export const termsVersion = "2026-11-16";

const terms = [
  ["El servicio", "GlobalScore permite registrar pronósticos deportivos, consultar resultados, participar en clasificaciones y organizar plantillas y salas en la Libreta Futbolera."],
  ["Acceso gratuito", "El acceso a GlobalScore es gratuito. La versión actual no incluye anuncios ni suscripciones de pago."],
  ["Edad mínima", "Debes tener 18 años o más para crear una cuenta en GlobalScore."],
  ["Tu cuenta", "Usa tu propia cuenta, protege tus credenciales y respeta a los demás participantes. Evita suplantar a otras personas, automatizar el envío de pronósticos o manipular resultados y clasificaciones."],
  ["Pronósticos y puntos", "Puedes guardar o editar pronósticos mientras estén abiertos. GlobalScore calcula los puntos a partir de los resultados registrados y las reglas de cada modalidad. Las probabilidades que aparecen en la app son orientativas."],
  ["Perfil y salas", "Comparte únicamente contenido que tengas derecho a publicar. Al compartir un código de sala, otras personas pueden usarlo para unirse y comparar resultados según la modalidad de la sala."],
  ["Incumplimientos", "Ante trampas, suplantación, manipulación de clasificaciones o abuso, GlobalScore puede suspender la cuenta o restringir temporalmente su participación en el ranking."],
  ["Contacto", "Para consultas sobre estas reglas, escribe a globalscore.oficial@gmail.com."],
];

export default function TermsGate() {
  const dialog = useRef(null);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  async function submit(action, message) {
    setBusy(true);
    setError("");
    try {
      const { error } = await action();
      if (error) setError(message);
    } catch {
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby="terms-title" onCancel={(event) => event.preventDefault()}
      className="terms-gate">
      <header className="terms-gate__header">
        <h1 id="terms-title">Términos y condiciones</h1>
        <p>Vigentes desde el 16 de noviembre de 2026</p>
      </header>
      <div className="terms-gate__document" tabIndex={0} role="region" aria-label="Texto de los términos y condiciones">
        {terms.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <form className="terms-gate__footer" onSubmit={(event) => {
        event.preventDefault();
        if (accepted && !busy) {
          submit(() => supabase.auth.updateUser({ data: { terms_version: termsVersion } }),
            "No se pudo guardar la aceptación. Inténtalo de nuevo.");
        }
      }}>
        <label className="terms-gate__check">
          <input type="checkbox" required checked={accepted} disabled={busy} onChange={(event) => setAccepted(event.target.checked)} />
          Acepto los términos y condiciones
        </label>
        {error && <p role="alert" className="terms-gate__error">{error}</p>}
        <div className="terms-gate__actions">
          <button type="button" disabled={busy} onClick={() =>
            submit(() => supabase.auth.signOut(), "No se pudo cerrar la sesión.")}>
            Cerrar sesión
          </button>
          <button type="submit" disabled={!accepted || busy}
            className="terms-gate__primary">
            Confirmar
          </button>
        </div>
      </form>
    </dialog>
  );
}
