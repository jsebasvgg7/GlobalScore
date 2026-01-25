import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Trophy } from "lucide-react";
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

    if (!password) {
      setError("Por favor ingresa una contraseña");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage("¡Contraseña actualizada! Redirigiendo...");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message || "Ocurrió un error. Por favor intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken && error) {
    return (
      <div className="auth-wrapper">
        {/* Banner - Solo visible en desktop */}
        <div className="auth-banner">
          <img 
            src="/GlobalscoreBanner.jpg" 
            alt="Globalscore Banner" 
          />
        </div>

        {/* Contenido */}
        <div className="auth-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Trophy size={20} />
            </div>
            <div className="auth-brand-name">Globalscore</div>
          </div>

          <div className="auth-card">
            <h2>Enlace<br/>Inválido</h2>
            <div className="error-message">{error}</div>
            <div className="auth-alt" style={{ justifyContent: "center", marginTop: "24px" }}>
              <Link to="/forgot-password">Solicitar nuevo enlace</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      {/* Banner - Solo visible en desktop */}
      <div className="auth-banner">
        <img 
          src="/GlobalscoreBanner.jpg" 
          alt="Globalscore Banner" 
        />
      </div>

      {/* Contenido del formulario */}
      <div className="auth-content">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Trophy size={20} />
          </div>
          <div className="auth-brand-name">Globalscore</div>
        </div>

        <div className="auth-card">
          <h2>Nueva<br/>Contraseña</h2>
          <p>Ingresa tu nueva contraseña</p>

          <form onSubmit={handleResetPassword}>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {password && (
              <div className="password-strength">
                Seguridad: {
                  password.length < 6 ? '❌ Muy corta' :
                  password.length < 8 ? '⚠️ Débil' :
                  password.length < 12 ? '✅ Buena' :
                  '🔒 Fuerte'
                }
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <LoadingDots />
                  <span>Actualizando...</span>
                </span>
              ) : "Actualizar Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}