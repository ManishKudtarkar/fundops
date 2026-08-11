import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiMessage } from "../services/api";
import { login } from "../services/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = (location.state as any)?.registered;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || "/dashboard", { replace: true });
    } catch (err) {
      setError(apiMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">F</div>
        <h1>FundOps</h1>
        <p className="login-subtitle">ERP Portal</p>
        {registered && (
          <div className="success-message" style={{ textAlign: "left", marginBottom: 16 }}>
            Account created! Sign in to get started.
          </div>
        )}
        <p className="login-hint">
          Sign in to manage customers, products,
          inventory, and challans in one place.
        </p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@fundops.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="primary-button login-button" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p className="register-signin-link">
          New business? <Link to="/register">Create an account</Link>
        </p>
        <p className="register-signin-link">
          <Link to="/">← Back to Home</Link>
        </p>
      </form>
    </div>
  );
}
