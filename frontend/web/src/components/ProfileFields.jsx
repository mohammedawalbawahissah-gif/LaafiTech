import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Inline edit/save form for the fields the backend actually allows a user
 * to self-update (see accounts.serializers.ProfileUpdateSerializer):
 * first_name, last_name, email, region, district. Shared between the
 * community and agent Profile pages so the editing behavior — and the set
 * of editable fields — stays in sync with what the backend accepts.
 */
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
        <div className="field-row">
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
      <div className="field-row">
        <div className="field">
          <label htmlFor="first_name">First name</label>
          <input id="first_name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
        </div>
        <div className="field">
          <label htmlFor="last_name">Last name</label>
          <input id="last_name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      {showLocation && (
        <div className="field-row">
          <div className="field">
            <label htmlFor="region">Region</label>
            <input id="region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Northern" />
          </div>
          <div className="field">
            <label htmlFor="district">District</label>
            <input id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Kumbungu" />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
