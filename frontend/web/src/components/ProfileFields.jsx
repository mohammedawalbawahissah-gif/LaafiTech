import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileFields({ showLocation = false }) {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    region: user?.region || "",
    district: user?.district || "",
  });

  const startEdit = () => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      region: user?.region || "",
      district: user?.district || "",
    });
    setError("");
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) {
      const detail = err.response?.data;
      setError(
        detail
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
          : "Couldn't save. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <div className="label">Email</div>
            <p style={{ margin: "0 0 4px", fontSize: 14 }}>{user?.email || "—"}</p>
          </div>
          {showLocation && (
            <div>
              <div className="label">Location</div>
              <p style={{ margin: "0 0 4px", fontSize: 14 }}>
                {[user?.district, user?.region].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          )}
        </div>
        <button type="button" className="btn btn-ghost" onClick={startEdit}>Edit profile</button>
      </div>
    );
  }

  return (
    <form onSubmit={save} style={{ marginBottom: 18 }}>
      {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <div className="field">
          <label htmlFor="pf_first_name">First name</label>
          <input
            id="pf_first_name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pf_last_name">Last name</label>
          <input
            id="pf_last_name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="pf_email">Email</label>
        <input
          id="pf_email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      {showLocation && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <div className="field">
            <label htmlFor="pf_region">Region</label>
            <input
              id="pf_region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              placeholder="e.g. Northern"
            />
          </div>
          <div className="field">
            <label htmlFor="pf_district">District</label>
            <input
              id="pf_district"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="e.g. Kumbungu"
            />
          </div>
        </div>
      )}

      {/* Buttons always stay inside the card — full width row */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
