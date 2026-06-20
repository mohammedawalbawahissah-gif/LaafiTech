import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "funder", label: "Funder / Partner", hint: "NGO, CSR, or government program procuring verified deliveries" },
  { value: "admin", label: "LaafiTech Admin", hint: "Internal team — manages agents, verification, payouts" },
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "funder",
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "admin" || user.role === "superadmin" ? "/admin" : "/funder");
    } catch (err) {
      const detail = err.response?.data;
      const message = detail
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
        : "Couldn't create the account. Check the details and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="tag">LaafiTech distribution &amp; impact platform</p>
        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label>I am signing up as</label>
          <div className="role-toggle">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                className={`role-option${form.role === r.value ? " active" : ""}`}
                onClick={() => setForm({ ...form, role: r.value })}
              >
                <span className="role-option-label">{r.label}</span>
                <span className="role-option-hint">{r.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="first_name">First name</label>
            <input id="first_name" value={form.first_name} onChange={update("first_name")} required />
          </div>
          <div className="field">
            <label htmlFor="last_name">Last name</label>
            <input id="last_name" value={form.last_name} onChange={update("last_name")} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" value={form.username} onChange={update("username")} required />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={update("email")} required />
        </div>

        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" value={form.phone_number} onChange={update("phone_number")} placeholder="024 000 0000" required />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" minLength={8} value={form.password} onChange={update("password")} required />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
