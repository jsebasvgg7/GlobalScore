import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/pagesStyles/Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validaciones antes de intentar login
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Intentar login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        console.error("Login error:", signInError);
        
        // Mensajes de error más específicos
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Incorrect email or password. Please try again.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Please verify your email before logging in. Check your inbox.");
        } else if (signInError.message.includes("User not found")) {
          setError("This account doesn't exist. Please sign up first.");
        } else {
          setError("Login failed. Please check your credentials and try again.");
        }
        setLoading(false);
        return;
      }

      // Verificar que el usuario existe en la base de datos
      if (data?.user) {
        console.log("User authenticated:", data.user.id);

        // Verificar si el perfil del usuario existe
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile check error:", profileError);
          setError("Error loading your profile. Please try again.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Si no existe el perfil, crearlo
        if (!profile) {
          console.log("Profile not found, creating one...");
          
          const { error: createError } = await supabase
            .from("users")
            .insert({
              auth_id: data.user.id,
              name: data.user.email?.split('@')[0] || "Usuario",
              email: data.user.email,
              points: 0,
              predictions: 0,
              correct: 0,
              weekly_points: 0,
              weekly_predictions: 0,
              weekly_correct: 0,
              current_streak: 0,
              best_streak: 0
            });

          if (createError) {
            console.error("Profile creation error:", createError);
            setError("Error creating your profile. Please contact support.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          console.log("Profile created successfully");
        }

        // Login exitoso
        console.log("Login successful, redirecting...");
        navigate("/app");
      }

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
        <h2>GlobalScore</h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '14px', 
          marginBottom: '20px',
          textAlign: 'center' 
        }}>
          Sign in to start predicting
        </p>

        <form onSubmit={login} style={{ width: '100%' }}>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            required
            style={{
              borderColor: error && email === "" ? '#EF4444' : undefined
            }}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="current-password"
              required
              style={{
                borderColor: error && password === "" ? '#EF4444' : undefined,
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
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

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

          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !email || !password}
            style={{
              opacity: loading || !email || !password ? 0.6 : 1,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer'
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
                Signing in...
              </span>
            ) : "Enter"}
          </button>
        </form>

        <div className="auth-alt">
          <Link to="/forgot-password">Forgot Your Password?</Link>
          <Link to="/register" style={{ fontWeight: 'bold' }}>
            Create Account
          </Link>
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
          💡 <strong>New here?</strong> Create an account to start predicting matches!
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