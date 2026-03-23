import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import "../styles/StylesPages/Auth.css";

/* ── Loading dots ── */
function LoadingDots() {
  return (
    <span className="auth-loading-dots">
      <span /><span /><span />
    </span>
  );
}

/* ── El contenido real del formulario (compartido entre desktop y mobile) ── */
function LoginForm({ onNavigate }) {
  const navigate = useNavigate();
  const [loading, setLoading]         = useState(false);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Por favor ingresa tu correo electrónico");
    if (!validateEmail(email)) return setError("Correo electrónico inválido");
    if (!password) return setError("Por favor ingresa tu contraseña");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });

      if (signInError) {
        setError(
          signInError.message.includes("Invalid login credentials")
            ? "Correo o contraseña incorrectos"
            : signInError.message.includes("Email not confirmed")
            ? "Por favor verifica tu correo antes de iniciar sesión"
            : "Error al iniciar sesión. Verifica tus credenciales"
        );
        setLoading(false);
        return;
      }

      if (!data?.user) { setError("Error al iniciar sesión"); setLoading(false); return; }

      const { data: profile, error: profileError } = await supabase
        .from("users").select("*").eq("auth_id", data.user.id).maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        setError("Error al cargar tu perfil");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!profile) {
        const userName =
          data.user.user_metadata?.name ||
          data.user.user_metadata?.display_name ||
          data.user.email?.split("@")[0] || "Usuario";

        const { error: createError } = await supabase.from("users").insert({
          auth_id: data.user.id, name: userName, email: data.user.email,
          points: 0, predictions: 0, correct: 0,
          monthly_points: 0, monthly_predictions: 0, monthly_correct: 0,
          current_streak: 0, best_streak: 0, level: 1, monthly_championships: 0,
        }).select().single();

        if (createError && createError.code !== "23505") {
          setError("Error al crear tu perfil");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      }

      navigate("/app");
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-inner">
      {/* Brand */}
      <div className="auth-brand-mark">
        <div className="auth-brand-sq" />
        <span className="auth-brand-name">GLOBALSCORE</span>
      </div>

      {/* Título */}
      <div className="auth-form-title">Iniciar<br />sesión</div>
      <div className="auth-form-sub">· accede a tu cuenta ·</div>

      {/* Divisor */}
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <div className="auth-divider-dot" />
        <div className="auth-divider-line" />
      </div>

      <form className="auth-form" onSubmit={login}>
        <div className="auth-input-group">

          {/* Email */}
          <div className="auth-field">
            <label className="auth-field-label">Correo</label>
            <div className="auth-field-wrap">
              <span className="auth-field-icon">
                <Mail />
              </span>
              <input
                className="auth-input"
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-field-label">Contraseña</label>
            <div className="auth-field-wrap">
              <span className="auth-field-icon">
                <Lock />
              </span>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="current-password"
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
          </div>
        </div>

        {/* Forgot */}
        <div className="auth-forgot-link">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-message auth-message--error">{error}</div>
        )}

        {/* CTA */}
        <div className="auth-cta">
          <button
            className="auth-cta-btn"
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <><LoadingDots /> Entrando</>
            ) : (
              <>Entrar <span className="auth-cta-arrow">→</span></>
            )}
          </button>
        </div>

        {/* Alt link */}
        <div className="auth-alt-link">
          ¿Sin cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WELCOME SCREEN (mobile, primera vez)
═══════════════════════════════════════════════ */
function WelcomeScreen({ onContinue }) {
  const [waveUp, setWaveUp] = useState(false);

  const handleContinue = () => {
    setWaveUp(true);
    setTimeout(onContinue, 600);
  };

  return (
    <div className={`welcome-screen ${waveUp ? "wave-exit" : ""}`}>
      <div className="welcome-dots-row">
        <span /><span /><span /><span /><span />
      </div>

      <div className="welcome-hero">
        <div className="welcome-icon-bg">
          <div className="welcome-icon-inner" />
        </div>
        <div className="welcome-particle p1" />
        <div className="welcome-particle p2" />
        <div className="welcome-particle p3" />
      </div>

      <div className="welcome-body">
        <h1 className="welcome-title">Globalscore</h1>
        <p className="welcome-subtitle">
          Predice tus partidos favoritos,<br />
          compite y escala en el ranking.
        </p>
        <button
          className={`welcome-enter-btn ${waveUp ? "btn-exiting" : ""}`}
          onClick={handleContinue}
          disabled={waveUp}
        >
          {waveUp ? "···" : "Entrar"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STATUS BAR del teléfono (solo desktop)
═══════════════════════════════════════════════ */
function PhoneStatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="auth-phone-status">
      <span className="auth-status-time">{time}</span>
      <div className="auth-status-notch">
        <span /><span />
      </div>
      <div className="auth-status-icons">
        <span className="auth-sig-bar" style={{ height: "4px" }} />
        <span className="auth-sig-bar" style={{ height: "6px" }} />
        <span className="auth-sig-bar" style={{ height: "9px" }} />
        <span className="auth-sig-bar" style={{ height: "12px" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════ */
export default function LoginPage() {
  const isMobile = () => window.innerWidth <= 640;
  const [showWelcome, setShowWelcome] = useState(() => isMobile());

  if (showWelcome) {
    return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
  }

  return (
    <div className="auth-wrapper">

      {/* ══ DESKTOP: Phone Portal ══ */}
      <div className="auth-phone-portal">

        {/* Panel lateral izquierdo */}
        <div className="auth-side-panel">
          <div>
            <div className="auth-side-label">Plataforma</div>
            <div className="auth-side-title">Tu zona<br />de predicciones</div>
          </div>
          <div className="auth-side-divider" />
          <div className="auth-side-desc">
            Compite con amigos,<br />
            predice resultados<br />
            y escala en el ranking.
          </div>
          <div className="auth-side-version">v2.0 · 2025–2026</div>
        </div>

        {/* Frame del teléfono */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="auth-phone-frame">
            <PhoneStatusBar />
            <div className="auth-phone-content">
              <LoginForm />
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

      {/* ══ MOBILE: Interfaz directa ══ */}
      <div className="auth-mobile-direct">
        <LoginForm />
      </div>

    </div>
  );
}