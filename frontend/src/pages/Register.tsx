import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { apiMessage } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.adminPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.adminPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        businessName: form.businessName.trim(),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(apiMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card register-card" onSubmit={handleSubmit}>
        <div className="login-logo">F</div>
        <h1>FundOps ERP</h1>
        <p className="login-subtitle">Create your business account</p>

        <div className="form-group">
          <label>Business Name</label>
          <input
            type="text"
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="Acme Traders"
            required
          />
        </div>

        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            value={form.adminName}
            onChange={(e) => set("adminName", e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.adminEmail}
            onChange={(e) => set("adminEmail", e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={form.adminPassword}
            onChange={(e) => set("adminPassword", e.target.value)}
            placeholder="Min. 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            placeholder="Repeat password"
            required
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="primary-button login-button" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="register-signin-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
