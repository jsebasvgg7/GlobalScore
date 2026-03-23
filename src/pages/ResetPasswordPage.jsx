/* ================================================================
   ResetPasswordPage.jsx — Brutalista Japonés Retro
================================================================ */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import "../styles/StylesPages/Auth.css";

function LoadingDots() {
  return (
    <span className="auth-loading-dots">
      <span /><span /><span />
    </span>
  );
}

function getStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 6)  s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
}

const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"];
const strengthClass  = ["", "s-weak", "s-fair", "s-good", "s-strong"];

function PasswordStrength({ value }) {
  const level = getStrength(value);
  if (!value) return null;
  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`auth-strength-bar ${i <= level ? strengthClass[level] : ""}`}
          />
        ))}
      </div>
      <span className="auth-strength-label">{strengthLabels[level]}</span>
    </div>
  );
}

/* ── Indicador de pasos ── */
function StepsIndicator({ current }) {
  return (
    <div className="auth-steps" style={{ marginBottom: "20px" }}>
      {[1, 2, 3].map((step, i) => (
        <span key={step} style={{ display: "contents" }}>
          <div className={`auth-step-dot ${step > current ? "inactive" : ""}`}>
            {step}
          </div>
          {i < 2 && (
            <div className={`auth-step-line ${step < current ? "active" : ""}`} />
          )}
        </span>
      ))}
    </div>
  );
}

function ResetForm() {
  const navigate = useNavigate();
  const [loading, setLoading]               = useState(false);
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [message, setMessage]               = useState("");
  const [error, setError]                   = useState("");
  const [isValidToken, setIsValidToken]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsValidToken(true);
      } else {
        setError("Enlace inválido o expirado. Por favor solicita uno nuevo.");
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(""); setError("");

    if (!password)             { setError("Por favor ingresa una contraseña"); setLoading(false); return; }
    if (password.length < 6)   { setError("La contraseña debe tener al menos 6 caracteres"); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden"); setLoading(false); return; }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("¡Contraseña actualizada! Redirigiendo...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* Token inválido */
  if (!isValidToken && error) {
    return (
      <>
        <div className="auth-sub-header">
          <Link to="/forgot-password" className="auth-back-btn">←</Link>
          <span className="auth-sub-title">Enlace inválido</span>
        </div>
        <div className="auth-inner">
          <div className="auth-form-title">Enlace<br />expirado</div>
          <div className="auth-form-sub">· el enlace ya no es válido ·</div>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <div className="auth-divider-dot" />
            <div className="auth-divider-line" />
          </div>

          <div className="auth-message auth-message--error">{error}</div>

          <div style={{ marginTop: "16px" }}>
            <Link to="/forgot-password" className="auth-cta-btn" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              textDecoration: "none"
            }}>
              Solicitar nuevo enlace <span className="auth-cta-arrow">→</span>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="auth-sub-header">
        <Link to="/" className="auth-back-btn">←</Link>
        <span className="auth-sub-title">Nueva contraseña</span>
      </div>

      <div className="auth-inner">
        <StepsIndicator current={2} />

        <div className="auth-form-title">Elige una<br />clave segura</div>
        <div className="auth-form-sub">· mínimo 6 caracteres ·</div>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-dot" />
          <div className="auth-divider-line" />
        </div>

        <form className="auth-form" onSubmit={handleReset}>
          <div className="auth-input-group">

            <div className="auth-field">
              <label className="auth-field-label">Nueva contraseña</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Lock /></span>
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <PasswordStrength value={password} />
            </div>

            <div className="auth-field">
              <label className="auth-field-label">Confirmar contraseña</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Lock /></span>
                <input
                  className="auth-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={loading}
                >
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
          </div>

          {error   && <div className="auth-message auth-message--error">{error}</div>}
          {message && <div className="auth-message auth-message--success">{message}</div>}

          <div className="auth-cta">
            <button
              className="auth-cta-btn"
              type="submit"
              disabled={loading || !password || !confirmPassword}
            >
              {loading
                ? <><LoadingDots /> Actualizando</>
                : <>Actualizar <span className="auth-cta-arrow">→</span></>
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
  const now  = new Date();
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

export default function ResetPasswordPage() {
  return (
    <div className="auth-wrapper">

      {/* ══ DESKTOP ══ */}
      <div className="auth-phone-portal">
        <div className="auth-side-panel">
          <div>
            <div className="auth-side-label">Seguridad</div>
            <div className="auth-side-title">Nueva<br />contraseña</div>
          </div>
          <div className="auth-side-divider" />
          <div className="auth-side-desc">
            Elige una contraseña<br />
            fuerte para proteger<br />
            tu cuenta.
          </div>
          <div className="auth-side-version">v2.0 · 2025–2026</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="auth-phone-frame">
            <PhoneStatusBar />
            <div className="auth-phone-content" style={{ overflowY: "auto" }}>
              <ResetForm />
            </div>
          </div>
          <div className="auth-frame-label">
            <div className="auth-frame-label-dots">
              <span /><span /><span />
            </div>
            GLOBALSCORE · ACCESO SEGURO
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="auth-mobile-direct">
        <ResetForm />
      </div>

    </div>
  );
}