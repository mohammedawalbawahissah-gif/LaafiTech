import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../utils/roleHome";

const ROLE_LABELS = {
  community_user: "Individual / Community User",
  agent: "Field Agent",
  funder: "Funder / Partner",
  admin: "LaafiTech Admin",
  superadmin: "Superadmin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  // When the backend returns multiple roles for one email, show a picker
  const [availableRoles, setAvailableRoles] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setAvailableRoles(null);
    setLoading(true);
    try {
      const user = await login(email, password, role || undefined);
      navigate(roleHome(user.role));
    } catch (err) {
      // HTTP 300 means multiple accounts share this email — show role picker
      if (err.response?.status === 300) {
        setAvailableRoles(err.response.data.roles || []);
      } else {
        setError("Incorrect email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const pickRole = async (selectedRole) => {
    setRole(selectedRole);
    setAvailableRoles(null);
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, selectedRole);
      navigate(roleHome(user.role));
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>LaafiTech</h1>
        <p className="tag">Distribution &amp; impact platform</p>

        {error && <div className="auth-error">{error}</div>}

        {/* Multi-role picker — shown when backend detects >1 account */}
        {availableRoles && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 10 }}>
              This email has multiple accounts. Choose which one to sign in to:
            </p>
            <div className="role-toggle">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="role-option"
                  onClick={() => pickRole(r)}
                  disabled={loading}
                >
                  <span className="role-option-label">{ROLE_LABELS[r] || r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {!availableRoles && (
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        )}

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
