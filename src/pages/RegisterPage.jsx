import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import "../styles/StylesPages/Auth.css";

function LoadingDots() {
  return (
    <span className="auth-loading-dots">
      <span /><span /><span />
    </span>
  );
}

/* ── Calcula la fortaleza de la contraseña ── */
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

function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(false);
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validateName  = (n) => /^[a-zA-ZÀ-ÿ\s]{3,50}$/.test(n.trim());

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
        setError(
          signUpError.message.includes("already registered")
            ? "Este correo ya está registrado"
            : `Error: ${signUpError.message}`
        );
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

      setSuccess("¡Cuenta creada! " + (
        authData.user.identities?.length === 0
          ? "Redirigiendo..."
          : "Revisa tu correo para verificar tu cuenta."
      ));
      setName(""); setEmail(""); setPassword("");
      setTimeout(() => navigate(authData.user.identities?.length === 0 ? "/app" : "/"), 1500);
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sub-header con back */}
      <div className="auth-sub-header">
        <Link to="/" className="auth-back-btn">←</Link>
        <span className="auth-sub-title">Crear cuenta</span>
      </div>

      <div className="auth-inner">
        <div className="auth-form-title">Únete a<br />Globalscore</div>
        <div className="auth-form-sub">· regístrate gratis ·</div>

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-dot" />
          <div className="auth-divider-line" />
        </div>

        <form className="auth-form" onSubmit={register}>
          <div className="auth-input-group">

            <div className="auth-field">
              <label className="auth-field-label">Nombre</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><User /></span>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  disabled={loading}
                  autoComplete="name"
                  required minLength={3} maxLength={50}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field-label">Correo</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Mail /></span>
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

            <div className="auth-field">
              <label className="auth-field-label">Contraseña</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Lock /></span>
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mín. 6 caracteres"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  autoComplete="new-password"
                  required minLength={6}
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
          </div>

          <div className="auth-info-box">
            🔒 Tus datos están seguros y protegidos
          </div>

          {error   && <div className="auth-message auth-message--error">{error}</div>}
          {success && <div className="auth-message auth-message--success">{success}</div>}

          <div className="auth-cta">
            <button
              className="auth-cta-btn"
              type="submit"
              disabled={loading || !name || !email || !password}
            >
              {loading ? <><LoadingDots /> Creando</> : <>Registrar <span className="auth-cta-arrow">→</span></>}
            </button>
          </div>

          <div className="auth-alt-link">
            ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </>
  );
}

/* ── Phone Status Bar ── */
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

export default function RegisterPage() {
  return (
    <div className="auth-wrapper">

      {/* ══ DESKTOP ══ */}
      <div className="auth-phone-portal">
        <div className="auth-side-panel">
          <div>
            <div className="auth-side-label">Registro</div>
            <div className="auth-side-title">Empieza<br />a predecir</div>
          </div>
          <div className="auth-side-divider" />
          <div className="auth-side-desc">
            Crea tu cuenta gratis<br />
            y empieza a competir<br />
            con otros predictores.
          </div>
          <div className="auth-side-version">v2.0 · 2025–2026</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="auth-phone-frame">
            <PhoneStatusBar />
            <div className="auth-phone-content">
              <RegisterForm />
            </div>
          </div>
          <div className="auth-frame-label">
            <div className="auth-frame-label-dots">
              <span /><span /><span />
            </div>
            GLOBALSCORE · REGISTRO SEGURO
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="auth-mobile-direct">
        <RegisterForm />
      </div>

    </div>
  );
}