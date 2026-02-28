import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, KeyRound } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import LoadingDots from "../components/LoadingSpinner";
import "../styles/pagesStyles/Auth.css";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");

    if (!email) { setError("Por favor ingresa tu correo electrónico"); setLoading(false); return; }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage("¡Revisa tu correo! Te enviamos el enlace para restablecer tu contraseña.");
      setEmail("");
    } catch (err) {
      setError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-container">

        {/* ── IZQUIERDA: Formulario ── */}
        <div className="auth-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><Trophy size={18} /></div>
            <div className="auth-brand-name">Globalscore</div>
          </div>

          <div className="auth-card">
            <h2>¿Olvidaste tu contraseña?</h2>
            <p>Ingresa tu correo y te enviaremos un enlace de recuperación</p>

            <div className="auth-divider"><span>ingresa tu correo registrado</span></div>

            <form onSubmit={handleReset}>
              <input type="email" placeholder="Correo electrónico" value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} required />

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <button className="btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading"><LoadingDots /><span>Enviando...</span></span>
                ) : "Enviar enlace"}
              </button>
            </form>

            <div className="auth-alt" style={{ display: "flex" }}>
              <Link to="/">← Volver al inicio de sesión</Link>
            </div>
          </div>
        </div>

        {/* ── DERECHA: Panel púrpura ── */}
        <div className="auth-right-panel">
          <div className="auth-right-icon"><KeyRound size={52} color="white" strokeWidth={1.5} /></div>
          <h3>¡No te<br />preocupes!</h3>
          <p>¿Recuerdas tu contraseña? Vuelve atrás y continúa con tus predicciones</p>
          <Link to="/" className="auth-right-btn">Iniciar Sesión</Link>
        </div>

      </div>
    </div>
  );
}