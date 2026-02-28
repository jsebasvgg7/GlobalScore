import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Trophy } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import LoadingDots from "../components/LoadingSpinner";
import "../styles/pagesStyles/Auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateName = (n) => /^[a-zA-ZÀ-ÿ\s]{3,50}$/.test(n.trim());

  const register = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!name.trim()) return setError("Por favor ingresa tu nombre");
    if (!validateName(name)) return setError("El nombre debe tener entre 3 y 50 caracteres");
    if (!email.trim()) return setError("Por favor ingresa tu correo electrónico");
    if (!validateEmail(email)) return setError("Correo electrónico inválido");
    if (!password) return setError("Por favor ingresa una contraseña");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");

    setLoading(true);

    try {
      const { data: existing } = await supabase
        .from("users").select("email").eq("email", email.trim().toLowerCase()).maybeSingle();

      if (existing) { setError("Este correo ya está registrado"); setLoading(false); return; }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim(), display_name: name.trim() } },
      });

      if (signUpError) {
        setError(signUpError.message.includes("already registered")
          ? "Este correo ya está registrado"
          : `Error: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      if (!authData?.user) { setError("No se pudo crear la cuenta"); setLoading(false); return; }

      const { error: insertError } = await supabase.from("users").insert({
        auth_id: authData.user.id, name: name.trim(),
        email: email.trim().toLowerCase(),
        points: 0, predictions: 0, correct: 0,
        monthly_points: 0, monthly_predictions: 0, monthly_correct: 0,
        current_streak: 0, best_streak: 0, level: 1, monthly_championships: 0,
      }).select().single();

      if (insertError && insertError.code !== "23505") {
        try { await supabase.auth.signOut(); } catch (_) {}
        setError("No se pudo crear el perfil. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      setSuccess("¡Cuenta creada! " + (authData.user.identities?.length === 0
        ? "Redirigiendo..." : "Revisa tu correo para verificar tu cuenta."));
      setName(""); setEmail(""); setPassword("");

      setTimeout(() => navigate(authData.user.identities?.length === 0 ? "/app" : "/"), 1500);
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card-container">

        {/* ── IZQUIERDA: Panel púrpura ── */}
        <div className="auth-right-panel">
          <div className="auth-right-icon"><Trophy size={52} color="white" strokeWidth={1.5} /></div>
          <h3>¡Bienvenido<br />de vuelta!</h3>
          <p>Para mantenerte conectado inicia sesión con tu cuenta personal</p>
          <Link to="/" className="auth-right-btn">Iniciar Sesión</Link>
        </div>

        {/* ── DERECHA: Formulario ── */}
        <div className="auth-content">
          <div className="auth-brand">
            <div className="auth-brand-icon"><Trophy size={18} /></div>
            <div className="auth-brand-name">Globalscore</div>
          </div>

          <div className="auth-card">
            <h2>Crear Cuenta</h2>
            <p>Regístrate y empieza a predecir</p>

            <div className="auth-divider"><span>usa tu correo para registrarte</span></div>

            <form onSubmit={register}>
              <input type="text" placeholder="Nombre completo" value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                disabled={loading} autoComplete="name" required minLength={3} maxLength={50} />

              <input type="email" placeholder="Correo electrónico" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={loading} autoComplete="email" required />

              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading} autoComplete="new-password" required minLength={6} />
                <button type="button" className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {password && (
                <div className="password-strength">
                  {password.length < 6 ? "❌ Muy corta"
                    : password.length < 8 ? "⚠️ Débil"
                    : password.length < 12 ? "✅ Buena"
                    : "🔒 Muy fuerte"}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button className="btn" type="submit" disabled={loading || !name || !email || !password}>
                {loading ? (
                  <span className="btn-loading"><LoadingDots /><span>Creando cuenta...</span></span>
                ) : "Registrarse"}
              </button>
            </form>

            <div className="info-box">🔒 Tus datos están seguros y protegidos</div>

            <div className="auth-alt">
              <span>¿Ya tienes cuenta?</span>
              <Link to="/">Inicia sesión</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}