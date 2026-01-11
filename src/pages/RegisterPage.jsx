import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/pagesStyles/Auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateName = (name) => {
    // Solo letras, espacios y caracteres acentuados
    const regex = /^[a-zA-ZÀ-ÿ\s]{3,50}$/;
    return regex.test(name.trim());
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!validateName(name)) {
      setError("Name must be 3-50 characters and contain only letters");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      // Verificar si el email ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking email:", checkError);
        setError("Error verifying email. Please try again.");
        setLoading(false);
        return;
      }

      if (existingUser) {
        setError("This email is already registered. Please sign in instead.");
        setLoading(false);
        return;
      }

      // Crear cuenta de autenticación
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (signUpError) {
        console.error("SignUp error:", signUpError);
        
        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else if (signUpError.message.includes("Password")) {
          setError("Password is too weak. Use at least 6 characters.");
        } else {
          setError(`Registration failed: ${signUpError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Auth user created:", authData.user.id);

      // Crear perfil en la base de datos
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          auth_id: authData.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          points: 0,
          predictions: 0,
          correct: 0,
          weekly_points: 0,
          weekly_predictions: 0,
          weekly_correct: 0,
          current_streak: 0,
          best_streak: 0
        });

      if (insertError) {
        console.error("Profile creation error:", insertError);
        
        // Si falla la creación del perfil, eliminar el usuario de auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        setError("Failed to create profile. Please try again or contact support.");
        setLoading(false);
        return;
      }

      console.log("Profile created successfully");

      // Registro exitoso
      setSuccess(
        "Account created successfully! " +
        (authData.user.identities?.length === 0 
          ? "You can now sign in." 
          : "Please check your email to verify your account.")
      );

      // Limpiar formulario
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '14px', 
          marginBottom: '20px',
          textAlign: 'center' 
        }}>
          Join GlobalScore and start predicting
        </p>

        <form onSubmit={register} style={{ width: '100%' }}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="name"
            required
            minLength={3}
            maxLength={50}
            style={{
              borderColor: error && !name.trim() ? '#EF4444' : undefined
            }}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            required
            style={{
              borderColor: error && !email.trim() ? '#EF4444' : undefined
            }}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="new-password"
              required
              minLength={6}
              style={{
                borderColor: error && !password ? '#EF4444' : undefined,
                paddingRight: '40px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="new-password"
              required
              minLength={6}
              style={{
                borderColor: error && password !== confirmPassword ? '#EF4444' : undefined,
                paddingRight: '40px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Indicador de fuerza de contraseña */}
          {password && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--glass)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '12px'
            }}>
              Password strength: {
                password.length < 6 ? '❌ Too short' :
                password.length < 8 ? '⚠️ Weak' :
                password.length < 12 ? '✅ Good' :
                '🔒 Strong'
              }
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10B981',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              ✅ {success}
            </div>
          )}

          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !name || !email || !password || !confirmPassword}
            style={{
              opacity: loading || !name || !email || !password || !confirmPassword ? 0.6 : 1,
              cursor: loading || !name || !email || !password || !confirmPassword ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}/> 
                Creating Account...
              </span>
            ) : "Sign Up"}
          </button>
        </form>

        <div className="auth-alt">
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account?</span>
          <Link to="/" style={{ fontWeight: 'bold' }}>Sign In</Link>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          🔒 Your data is secure and will never be shared
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}