import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../utils/roleHome";
import { GHANA_REGIONS, districtsFor } from "../data/ghanaRegions";

const ROLES = [
  { value: "community_user", label: "Individual", hint: "Daily menstrual health guidance, just for you" },
  { value: "agent", label: "Field Agent", hint: "Distribute pads in your community and earn payouts" },
  { value: "funder", label: "Funder / Partner", hint: "NGO, CSR, or government program procuring verified deliveries" },
  { value: "admin", label: "LaafiTech Admin", hint: "Internal team — manages agents, verification, payouts" },
];

const MOMO_PROVIDERS = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "vodafone", label: "Vodafone Cash" },
  { value: "airteltigo", label: "AirtelTigo Money" },
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "community_user",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    invite_code: "",
    region: "Northern",
    district: "Tamale Metropolitan",
    catchment_area: "",
    mobile_money_number: "",
    momo_provider: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateRegion = (e) => {
    const region = e.target.value;
    const validDistricts = districtsFor(region);
    setForm((f) => ({
      ...f,
      region,
      district: validDistricts.includes(f.district) ? f.district : (validDistricts[0] || ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(roleHome(user.role));
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

        <div className="field-row" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div className="field" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label htmlFor="first_name" style={{ marginBottom: "0.5rem" }}>First name</label>
            <input
              id="first_name"
              value={form.first_name}
              onChange={update("first_name")}
              required
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <div className="field" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label htmlFor="last_name" style={{ marginBottom: "0.5rem" }}>Last name</label>
            <input
              id="last_name"
              value={form.last_name}
              onChange={update("last_name")}
              required
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" required />
          <p className="sub" style={{ marginTop: 4 }}>You can use the same email for multiple roles (e.g. agent + community user).</p>
        </div>
        </div>

        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" value={form.phone_number} onChange={update("phone_number")} placeholder="024 000 0000" required />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" minLength={8} value={form.password} onChange={update("password")} required />
        </div>

        {form.role === "admin" && (
          <div className="field">
            <label htmlFor="invite_code">Admin invite code</label>
            <input
              id="invite_code"
              value={form.invite_code}
              onChange={update("invite_code")}
              placeholder="Provided by your team lead"
              required
            />
          </div>
        )}

        {form.role === "agent" && (
          <>
            <div className="field-row" style={{ display: "flex", gap: "1rem" }}>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="region">Region</label>
                <select id="region" value={form.region} onChange={updateRegion} required style={{ width: "100%", boxSizing: "border-box" }}>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="district">District</label>
                <select id="district" value={form.district} onChange={update("district")} required style={{ width: "100%", boxSizing: "border-box" }}>
                  {districtsFor(form.region).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="catchment_area">Catchment area</label>
              <input
                id="catchment_area"
                value={form.catchment_area}
                onChange={update("catchment_area")}
                placeholder="e.g. Kumbungu Central, or the specific community you cover"
                required
              />
              <p className="sub" style={{ fontSize: 12, marginTop: 4 }}>
                The specific community/area within your district that you personally serve —
                this is operational, not an official list, so type it in.
              </p>
            </div>
            <div className="field">
              <label htmlFor="mobile_money_number">Mobile money number</label>
              <input
                id="mobile_money_number"
                value={form.mobile_money_number}
                onChange={update("mobile_money_number")}
                placeholder="024 000 0000"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="momo_provider">Mobile money network</label>
              <select
                id="momo_provider"
                value={form.momo_provider}
                onChange={update("momo_provider")}
                required
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                <option value="" disabled>Select network</option>
                {MOMO_PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <p className="sub" style={{ fontSize: 13, marginTop: -8 }}>
              Your account will be reviewed by a LaafiTech admin before you can start logging
              distributions — you'll see your status as soon as you sign in.
            </p>
          </>
        )}

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
