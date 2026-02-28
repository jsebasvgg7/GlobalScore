import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Trophy, LogIn } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import LoadingDots from "../components/LoadingSpinner";
import "../styles/pagesStyles/Auth.css";

const WELCOME_KEY = "gs_welcome_seen";

export default function LoginPage() {
  const navigate = useNavigate();

  const isMobile = () => window.innerWidth <= 640;
  const [showWelcome, setShowWelcome] = useState(false);
  const [waveUp, setWaveUp] = useState(false);

  useEffect(() => {
    if (isMobile() && !localStorage.getItem(WELCOME_KEY)) {
      setShowWelcome(true);
    }
  }, []);

  const handleContinue = () => {
    setWaveUp(true);
    setTimeout(() => {
      localStorage.setItem(WELCOME_KEY, "1");
      setShowWelcome(false);
      setWaveUp(false);
    }, 600);
  };

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Por favor ingresa tu correo electrónico");
    if (!validateEmail(email)) return setError("Por favor ingresa un correo electrónico válido");
    if (!password) return setError("Por favor ingresa tu contraseña");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (signInError) {
        setError(signInError.message.includes("Invalid login credentials")
          ? "Correo o contraseña incorrectos"
          : signInError.message.includes("Email not confirmed")
          ? "Por favor verifica tu correo antes de iniciar sesión"
          : "Error al iniciar sesión. Verifica tus credenciales");
        setLoading(false); return;
      }
      if (!data?.user) { setError("Error al iniciar sesión"); setLoading(false); return; }
      const { data: profile, error: profileError } = await supabase
        .from("users").select("*").eq("auth_id", data.user.id).maybeSingle();
      if (profileError && profileError.code !== "PGRST116") {
        setError("Error al cargar tu perfil");
        await supabase.auth.signOut(); setLoading(false); return;
      }
      if (!profile) {
        const userName = data.user.user_metadata?.name ||
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
          await supabase.auth.signOut(); setLoading(false); return;
        }
      }
      navigate("/app");
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════
     PANTALLA DE BIENVENIDA (móvil)
  ══════════════════════════════════ */
  if (showWelcome) {
    return (
      <div className={`welcome-screen ${waveUp ? "wave-exit" : ""}`}>
        <div className="welcome-dots-row">
          <span/><span/><span/><span/><span/>
        </div>
        <div className="welcome-hero">
          <div className="welcome-icon-bg">
            <div className="welcome-icon-ring">
              <Trophy size={64} color="white" strokeWidth={1.3} />
            </div>
          </div>
          <div className="welcome-particle p1" />
          <div className="welcome-particle p2" />
          <div className="welcome-particle p3" />
        </div>
        <div className="welcome-body">
          <h1 className="welcome-title">Globalscore</h1>
          <p className="welcome-subtitle">
            Entra y predice tus partidos favoritos,
            compite con amigos y escala en el ranking global.
          </p>
          <button
            className={`welcome-enter-btn ${waveUp ? "btn-exiting" : ""}`}
            onClick={handleContinue}
            disabled={waveUp}
          >
            {waveUp ? "..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     LOGIN
  ══════════════════════════════════ */
  return (
    <div className="auth-wrapper">
      <div className="auth-card-container">

        {/* Panel izquierdo / único en móvil */}
        <div className="auth-content">

          {/* Ola púrpura — visible solo en móvil via CSS (legacy, kept for compat) */}
          <div className="auth-mobile-wave">
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center", margin: "0 0 6px" }}>
              Ingresa los datos de tu cuenta
            </p>
            <div className="auth-brand">
              <div className="auth-brand-icon"><Trophy size={18} /></div>
              <div className="auth-brand-name">Globalscore</div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center", margin: "6px 0 0" }}>
              usa tu correo y contraseña
            </p>
            <svg
              className="auth-mobile-wave-svg"
              viewBox="0 0 390 60"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0,60 L0,28 Q97,0 195,24 Q293,48 390,18 L390,60 Z" fill="#ffffff"/>
            </svg>
          </div>

          {/* Brand para desktop (oculto en móvil) */}
          <div className="auth-brand auth-brand-desktop">
            <div className="auth-brand-icon"><Trophy size={18} /></div>
            <div className="auth-brand-name">Globalscore</div>
          </div>

          {/* Card */}
          <div className="auth-card auth-card--login">
            {/* Título desktop */}
            <h2 className="auth-title-desktop">Iniciar Sesión</h2>
            <p className="auth-sub-desktop">Ingresa los datos de tu cuenta</p>
            <div className="auth-divider auth-divider-desktop"><span>usa tu correo y contraseña</span></div>

            {/* Título móvil (visible solo en móvil vía CSS) */}
            <h2 className="auth-title-mobile" style={{ display: "none" }}>Login</h2>
            <p className="auth-sub-mobile" style={{ display: "none" }}>
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="auth-subtitle-link">sign up</Link>
            </p>

            <form onSubmit={login}>
              <input
                type="email" placeholder="Correo electrónico" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={loading} autoComplete="email" required
              />
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"} placeholder="Contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading} autoComplete="current-password" required
                />
                <button type="button" className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <div className="forgot-password-link">
                <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
              </div>
              {error && <div className="error-message">{error}</div>}
              <button className="btn" type="submit" disabled={loading || !email || !password}>
                {loading ? (
                  <span className="btn-loading"><LoadingDots /><span>Iniciando sesión...</span></span>
                ) : (
                  <>
                    Entrar
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

        {/* Panel derecho púrpura — solo desktop */}
        <div className="auth-right-panel">
          <div className="auth-right-icon"><Trophy size={52} color="white" strokeWidth={1.5} /></div>
          <h3>¡Hola,<br />Amigo!</h3>
          <p>Regístrate con tus datos para disfrutar todas las funciones de Globalscore</p>
          <Link to="/register" className="auth-right-btn">Registrarse</Link>
        </div>

      </div>
    </div>
  );
}