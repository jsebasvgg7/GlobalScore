/* ================================================================
   ForgotPasswordPage.jsx — Brutalista Japonés Retro
================================================================ */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from '@/shared/services/supabase/client';
import "./Auth.css";

function LoadingDots() {
  return (
    <span className="auth-loading-dots">
      <span /><span /><span />
    </span>
  );
}

function ForgotForm() {
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
    <>
      {/* Ilustración de acceso */}
      <div className="auth-forgot-illus">
        <div className="auth-forgot-illus-grid" />
        <div className="auth-forgot-illus-content">
          <div className="auth-key-icon">
            <div className="auth-key-circle" />
            <div className="auth-key-stem" />
          </div>
        </div>
        <div className="auth-forgot-illus-tag">RECOVERY</div>
      </div>

      {/* Sub-header */}
      <div className="auth-sub-header">
        <Link to="/" className="auth-back-btn">←</Link>
        <span className="auth-sub-title">Recuperar acceso</span>
      </div>

      <div className="auth-inner">
        <div className="auth-form-title">¿Olvidaste<br />tu clave?</div>
        <div className="auth-form-sub">· te enviamos un enlace ·</div>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-dot" />
          <div className="auth-divider-line" />
        </div>

        <div className="auth-message auth-message--info" style={{ marginBottom: "16px" }}>
          Ingresa tu correo y recibirás un enlace para restablecer tu contraseña.
        </div>

        <form className="auth-form" onSubmit={handleReset}>
          <div className="auth-input-group">
            <div className="auth-field">
              <label className="auth-field-label">Correo registrado</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Mail /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>

          {message && <div className="auth-message auth-message--success">{message}</div>}
          {error && <div className="auth-message auth-message--error">{error}</div>}

          <div className="auth-cta">
            <button
              className="auth-cta-btn"
              type="submit"
              disabled={loading || !email}
            >
              {loading
                ? <><LoadingDots /> Enviando</>
                : <>Enviar enlace <span className="auth-cta-arrow">→</span></>
              }
            </button>
          </div>

          <div className="auth-alt-link">
            ¿La recuerdas? <Link to="/">Iniciar sesión</Link>
          </div>
        </form>
      </div>
    </>
  );
}

function PhoneStatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="auth-phone-status">
      <span className="auth-status-time">{time}</span>
      <div className="auth-status-notch"><span /><span /></div>
      <div className="auth-status-icons">
        <span className="auth-sig-bar" style={{ height: "4px" }} />
        <span className="auth-sig-bar" style={{ height: "6px" }} />
        <span className="auth-sig-bar" style={{ height: "9px" }} />
        <span className="auth-sig-bar" style={{ height: "12px" }} />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="auth-wrapper">

      {/* ══ DESKTOP ══ */}
      <div className="auth-phone-portal">
        <div className="auth-side-panel">
          <div>
            <div className="auth-side-label">Recuperación</div>
            <div className="auth-side-title">No te<br />preocupes</div>
          </div>
          <div className="auth-side-divider" />
          <div className="auth-side-desc">
            Te enviamos un enlace<br />
            seguro para que puedas<br />
            acceder de nuevo.
          </div>
          <div className="auth-side-version">v2.0 · 2025–2026</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="auth-phone-frame">
            <PhoneStatusBar />
            <div className="auth-phone-content" style={{ overflowY: "auto" }}>
              <ForgotForm />
            </div>
          </div>
          <div className="auth-frame-label">
            <div className="auth-frame-label-dots">
              <span /><span /><span />
            </div>
            GLOBALSCORE · RECUPERACIÓN SEGURA
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="auth-mobile-direct">
        <ForgotForm />
      </div>

    </div>
  );
}