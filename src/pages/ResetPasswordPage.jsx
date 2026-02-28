import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Trophy, KeyRound, ChevronLeft, Check } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import LoadingDots from "../components/LoadingSpinner";
import "../styles/pagesStyles/Auth.css";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsValidToken(true);
      } else {
        setError("Enlace inválido o expirado. Por favor solicita uno nuevo");
      }
    });
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!password) { setError("Por favor ingresa una contraseña"); setLoading(false); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden"); setLoading(false); return; }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("¡Contraseña actualizada! Redirigiendo...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Ocurrió un error. Por favor intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  /* Token inválido */
  if (!isValidToken && error) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card-container">
          <div className="auth-content">
            {/* Back button móvil */}
            <Link to="/forgot-password" className="auth-back-btn" aria-label="Volver">
              <ChevronLeft size={24} />
            </Link>

            <div className="auth-brand auth-brand-desktop">
              <div className="auth-brand-icon"><Trophy size={18} /></div>
              <div className="auth-brand-name">Globalscore</div>
            </div>

            <div className="auth-card auth-card--forgot">
              <h2 className="auth-title-desktop">Enlace Inválido</h2>
              <h2 className="auth-title-mobile" style={{ display: "none" }}>Enlace inválido</h2>
              <p className="auth-sub-mobile" style={{ display: "none" }}>
                <Link to="/forgot-password" className="auth-subtitle-link">Solicitar nuevo enlace</Link>
              </p>
              <div className="error-message">{error}</div>
              <div className="auth-alt" style={{ display: "flex", marginTop: 24 }}>
                <Link to="/forgot-password">Solicitar nuevo enlace</Link>
              </div>
            </div>
          </div>

          <div className="auth-right-panel">
            <div className="auth-right-icon"><KeyRound size={52} color="white" strokeWidth={1.5} /></div>
            <h3>Enlace<br />Expirado</h3>
            <p>Solicita un nuevo enlace de recuperación para restablecer tu contraseña</p>
            <Link to="/forgot-password" className="auth-right-btn">Nuevo Enlace</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card-container">

        {/* ── Formulario ── */}
        <div className="auth-content">

          {/* Brand desktop */}
          <div className="auth-brand auth-brand-desktop">
            <div className="auth-brand-icon"><Trophy size={18} /></div>
            <div className="auth-brand-name">Globalscore</div>
          </div>

          <div className="auth-card auth-card--forgot">
            {/* Desktop header */}
            <h2 className="auth-title-desktop">Nueva Contraseña</h2>
            <p className="auth-sub-desktop">Ingresa tu nueva contraseña</p>

            {/* Móvil header */}
            <h2 className="auth-title-mobile" style={{ display: "none" }}>New password</h2>
            <p className="auth-sub-mobile" style={{ display: "none" }}>
              ¿Ya la recuerdas?{" "}
              <Link to="/" className="auth-subtitle-link">sign in</Link>
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button type="button" className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button type="button" className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {password && (
                <div className="password-strength">
                  Seguridad:{" "}
                  {password.length < 6 ? "❌ Muy corta"
                    : password.length < 8 ? "⚠️ Débil"
                    : password.length < 12 ? "✅ Buena"
                    : "🔒 Fuerte"}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}

              <button className="btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading"><LoadingDots /><span>Actualizando...</span></span>
                ) : (
                  <>
                    Actualizar
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Panel púrpura (desktop) ── */}
        <div className="auth-right-panel">
          <div className="auth-right-icon"><KeyRound size={52} color="white" strokeWidth={1.5} /></div>
          <h3>Nueva<br />Contraseña</h3>
          <p>Elige una contraseña segura para proteger tu cuenta de Globalscore</p>
          <Link to="/" className="auth-right-btn">Iniciar Sesión</Link>
        </div>

      </div>
    </div>
  );
}