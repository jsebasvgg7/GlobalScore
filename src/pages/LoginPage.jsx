import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import LoadingDots from "../components/LoadingSpinner";
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
    
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Intentando login para:", email);
      
      // 1. Iniciar sesión
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        console.error("❌ Error de login:", signInError);
        
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Correo o contraseña incorrectos");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Por favor verifica tu correo antes de iniciar sesión");
        } else if (signInError.message.includes("User not found")) {
          setError("Esta cuenta no existe. Por favor regístrate primero");
        } else {
          setError("Error al iniciar sesión. Verifica tus credenciales");
        }
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError("Error al iniciar sesión");
        setLoading(false);
        return;
      }

      console.log("✅ Usuario autenticado:", data.user.id);

      // 2. Verificar si existe el perfil
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", data.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("❌ Error al verificar perfil:", profileError);
        setError("Error al cargar tu perfil");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 3. Si no existe perfil, crearlo
      if (!profile) {
        console.log("📝 Perfil no encontrado, creando uno nuevo...");
        
        const userName = data.user.user_metadata?.name || 
                        data.user.user_metadata?.display_name ||
                        data.user.email?.split('@')[0] || 
                        "Usuario";
        
        const { data: newProfile, error: createError } = await supabase
          .from("users")
          .insert({
            auth_id: data.user.id,
            name: userName,
            email: data.user.email,
            points: 0,
            predictions: 0,
            correct: 0,
            monthly_points: 0,
            monthly_predictions: 0,
            monthly_correct: 0,
            current_streak: 0,
            best_streak: 0,
            level: 1,
            monthly_championships: 0
          })
          .select()
          .single();

        if (createError) {
          console.error("❌ Error al crear perfil:", createError);
          
          // Si es error de duplicado, intentar obtener el perfil
          if (createError.code === '23505') {
            const { data: existingProfile } = await supabase
              .from("users")
              .select("*")
              .eq("auth_id", data.user.id)
              .single();
            
            if (existingProfile) {
              console.log("✅ Perfil duplicado encontrado");
            } else {
              setError("Error al crear tu perfil");
              await supabase.auth.signOut();
              setLoading(false);
              return;
            }
          } else {
            setError("Error al crear tu perfil");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        } else {
          console.log("✅ Perfil creado exitosamente:", newProfile);
        }
      } else {
        console.log("✅ Perfil encontrado:", profile);
      }

      console.log("✅ Inicio de sesión exitoso");
      navigate("/app");

    } catch (err) {
      console.error("💥 Error inesperado:", err);
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Inicia sesión</h2>
        <p></p>
        <form onSubmit={login}>
          <input
            type="email"
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="email"
            required
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="current-password"
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

          <div className="forgot-password-link">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            className="btn" 
            type="submit" 
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span className="btn-loading">
                <LoadingDots />
                <span>Entrando...</span>
              </span>
            ) : "Entrar"}
          </button>
        </form>

        <div className="auth-alt">
          <span>¿No tienes una cuenta?</span>
          <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}