import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "../styles/Auth.css";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase usa hash (#) para los tokens de recuperación
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    console.log("Hash params:", { accessToken, type });

    if (type === 'recovery' && accessToken) {
      // Verificar que la sesión está activa
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("Session:", session);
        if (session?.user) {
          setIsValidToken(true);
        } else {
          setError("Invalid or expired reset link. Please request a new one.");
        }
        setCheckingToken(false);
      });
    } else {
      setError("Invalid or expired reset link. Please request a new one.");
      setCheckingToken(false);
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Redirecting...");
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Verifying...</h2>
          <p style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}>
            Please wait while we verify your reset link.
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken && error) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Invalid Link</h2>
          <p className="error-message">{error}</p>
          <div className="auth-alt" style={{ justifyContent: "center", marginTop: "24px" }}>
            <a href="/forgot-password" style={{ color: "#6a11cb", textDecoration: "none" }}>
              Request a new reset link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Reset Your Password</h2>

        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}