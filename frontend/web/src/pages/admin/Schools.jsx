import { useEffect, useState } from "react";
import client from "../../api/client";
import { GHANA_REGIONS, districtsFor } from "../../data/ghanaRegions";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

const EMPTY_FORM = {
  name: "",
  district: "Kumbungu",
  region: "Northern",
  contact_person: "",
  contact_phone: "",
  estimated_girls_population: "",
  partner_organization: "",
  poverty_index: "",
  distance_to_market_km: "",
  historical_absenteeism_rate: "",
};

export default function Schools() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    setLoading(true);
    client.get("/ai/need-priority-ranking/").then((res) => setRanking(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateRegion = (e) => {
    const region = e.target.value;
    const validDistricts = districtsFor(region);
    setForm((f) => ({
      ...f,
      region,
      // Keep the current district only if it's still valid for the new
      // region; otherwise default to the first district in the list.
      district: validDistricts.includes(f.district) ? f.district : (validDistricts[0] || ""),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Empty optional numeric fields shouldn't be sent as "" -- let the
      // model defaults/nulls apply instead.
      const payload = { ...form };
      for (const key of ["estimated_girls_population", "poverty_index", "distance_to_market_km", "historical_absenteeism_rate"]) {
        if (payload[key] === "") delete payload[key];
      }
      await client.post("/schools/", payload);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      const detail = err.response?.data;
      setError(
        detail
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
          : "Couldn't save the school. Check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Schools & need scores"
        description="Explainable AI priority ranking — every score shows the factors behind it."
        accent="coral"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add school"}
          </button>
        }
      />

      {showForm && (
        <form className="card" style={{ marginBottom: 20 }} onSubmit={submit}>
          <div className="card-title">
            <div className="icon-badge icon-badge-coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.5 21 8l-9 4.5L3 8z" />
                <path d="M6.5 10.3v5.6c0 1.6 2.5 3.1 5.5 3.1s5.5-1.5 5.5-3.1v-5.6M21 8v6" />
              </svg>
            </div>
            <h3>New school</h3>
          </div>
          {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>School name</label>
              <input required value={form.name} onChange={update("name")} placeholder="e.g. Kumbungu D/A Primary" />
            </div>
            <div className="field">
              <label>Region</label>
              <select required value={form.region} onChange={updateRegion} style={{ width: "100%", boxSizing: "border-box" }}>
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>District</label>
              <select required value={form.district} onChange={update("district")} style={{ width: "100%", boxSizing: "border-box" }}>
                {districtsFor(form.region).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Estimated girls population</label>
              <input type="number" min="0" value={form.estimated_girls_population} onChange={update("estimated_girls_population")} placeholder="e.g. 180" />
            </div>
            <div className="field">
              <label>Contact person</label>
              <input value={form.contact_person} onChange={update("contact_person")} placeholder="Headteacher / liaison name" />
            </div>
            <div className="field">
              <label>Contact phone</label>
              <input value={form.contact_phone} onChange={update("contact_phone")} placeholder="024 000 0000" />
            </div>
            <div className="field">
              <label>Partner organization</label>
              <input value={form.partner_organization} onChange={update("partner_organization")} placeholder="Optional" />
            </div>
            <div className="field">
              <label>Poverty index (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.poverty_index} onChange={update("poverty_index")} placeholder="District-level, from GSS data" />
            </div>
            <div className="field">
              <label>Distance to market (km)</label>
              <input type="number" step="0.01" min="0" value={form.distance_to_market_km} onChange={update("distance_to_market_km")} />
            </div>
            <div className="field">
              <label>Historical absenteeism rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.historical_absenteeism_rate} onChange={update("historical_absenteeism_rate")} placeholder="If known" />
            </div>
          </div>
          <button className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>
            {saving ? "Saving..." : "Save school"}
          </button>
        </form>
      )}

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && ranking.length === 0 && (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No schools added yet</h3>
            <p>Add a school above to see its explainable need-priority score.</p>
          </div>
        </div>
      )}

      {!loading && ranking.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>School</th>
                <th>District</th>
                <th>Priority score</th>
                <th>Poverty</th>
                <th>Distance</th>
                <th>Absenteeism</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr key={r.school_id}>
                  <td>{r.school}</td>
                  <td>{r.district}</td>
                  <td className="mono" style={{ fontWeight: 600, color: "var(--accent)" }}>{r.score}</td>
                  <td className="mono">{r.factors.poverty_index}</td>
                  <td className="mono">{r.factors.distance_to_market}</td>
                  <td className="mono">{r.factors.absenteeism_rate}</td>
                  <td className="mono">{r.factors.population_scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
