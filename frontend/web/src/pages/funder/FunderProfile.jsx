import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import ProfileFields from "../../components/ProfileFields";
import { useAuth } from "../../context/AuthContext";

const FUNDER_TYPES = [
  { value: "ngo", label: "NGO", hint: "Non-governmental organisation" },
  { value: "corporate_csr", label: "Corporate CSR", hint: "Corporate social responsibility fund" },
  { value: "government", label: "Government", hint: "Government agency or programme" },
  { value: "individual_donor", label: "Individual", hint: "Personal donation" },
];

export default function FunderProfile() {
  const { user, funder, refreshFunder, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", funder_type: "individual_donor", contact_person: "" });

  // Seed form whenever the funder profile loads/changes
  useEffect(() => {
    if (funder) {
      setForm({
        name: funder.name || "",
        funder_type: funder.funder_type || "individual_donor",
        contact_person: funder.contact_person || "",
      });
    }
  }, [funder]);

  const startEdit = () => {
    setError("");
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (funder) {
        await client.patch(`/funder-organizations/${funder.id}/`, form);
      } else {
        await client.post("/funder-organizations/", { ...form, user: user.id });
      }
      await refreshFunder();
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

  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();

  return (
    <>
      <PageHeader eyebrow="Funder · Profile" title="Profile" accent="coral" />

      <div className="profile-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Account card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", background: "var(--coral-tint)",
              color: "var(--coral-dark)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.first_name} {user?.last_name}</div>
              <div className="sub" style={{ margin: 0 }}>{user?.phone_number}</div>
            </div>
          </div>

          <ProfileFields showLocation />

          <button
            className="btn btn-ghost"
            style={{ marginTop: 6, width: "100%", justifyContent: "center" }}
            onClick={logout}
          >
            Log out
          </button>
        </div>

        {/* Funder organisation card */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>
            <div className="icon-badge icon-badge-coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M8 8V6a4 4 0 0 1 8 0v2" />
                <path d="M12 13v3" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Organisation</h3>
              <p className="sub" style={{ margin: 0 }}>
                {funder
                  ? funder.is_verified
                    ? "Verified funder"
                    : "Pending verification"
                  : "No organisation profile yet"}
              </p>
            </div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}

          {!editing ? (
            <>
              {funder ? (
                <div style={{ marginBottom: 16 }}>
                  <div className="field-row" style={{ marginBottom: 10 }}>
                    <div>
                      <div className="label">Organisation name</div>
                      <p style={{ margin: "2px 0 0", fontSize: 14 }}>{funder.name || "—"}</p>
                    </div>
                    <div>
                      <div className="label">Type</div>
                      <p style={{ margin: "2px 0 0", fontSize: 14, textTransform: "capitalize" }}>
                        {FUNDER_TYPES.find((t) => t.value === funder.funder_type)?.label || funder.funder_type}
                      </p>
                    </div>
                  </div>
                  {funder.contact_person && (
                    <div style={{ marginBottom: 10 }}>
                      <div className="label">Contact person</div>
                      <p style={{ margin: "2px 0 0", fontSize: 14 }}>{funder.contact_person}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="sub" style={{ marginBottom: 16 }}>
                  Set up your organisation profile to start procuring deliveries.
                </p>
              )}
              <button className="btn btn-primary" onClick={startEdit}>
                {funder ? "Edit organisation" : "Set up organisation"}
              </button>
            </>
          ) : (
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="org_name">Organisation name</label>
                <input
                  id="org_name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bloom Foundation"
                  required
                />
              </div>

              <div className="field">
                <label>Organisation type</label>
                <div className="role-toggle">
                  {FUNDER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`role-option${form.funder_type === t.value ? " active" : ""}`}
                      onClick={() => setForm({ ...form, funder_type: t.value })}
                    >
                      <span className="role-option-label">{t.label}</span>
                      <span className="role-option-hint">{t.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="contact_person">Contact person (optional)</label>
                <input
                  id="contact_person"
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                  placeholder="e.g. Amina Tahiru"
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving..." : "Save organisation"}
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
