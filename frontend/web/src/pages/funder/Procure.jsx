import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";

export default function Procure() {
  const [schools, setSchools] = useState([]);
  const [ranking, setRanking] = useState({});
  const [form, setForm] = useState({ target_school: "", quantity_requested: "", unit_price: "3.00" });
  const [submitting, setSubmitting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/schools/").then((res) => setSchools(res.data.results ?? res.data));
    client.get("/ai/need-priority-ranking/").then((res) => {
      const map = {};
      res.data.forEach((r) => (map[r.school_id] = r.score));
      setRanking(map);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await client.post("/procurement-orders/", form);
      // In production, redirect to order.data checkout flow (Hubtel Checkout
      // initiation is triggered server-side on order confirmation).
      setCheckoutUrl(`Order #${order.data.id} created — proceed to payment (Hubtel checkout) to confirm.`);
    } catch {
      setError("Couldn't create the order. Check the quantity and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sortedSchools = [...schools].sort((a, b) => (ranking[b.id] || 0) - (ranking[a.id] || 0));

  return (
    <>
      <PageHeader
        eyebrow="Funder · Impact"
        title="Procure deliveries"
        description="Fund verified pad deliveries to a specific school, not a generic campaign."
        accent="coral"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
        <form className="card" onSubmit={handleSubmit}>
          <div className="card-title">
            <div className="icon-badge icon-badge-coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 4.5h2.4l1.1 11.6a2 2 0 0 0 2 1.9h8a2 2 0 0 0 2-1.7l1.3-7.8H6.1" />
                <circle cx="9.5" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
              </svg>
            </div>
            <h3>New procurement order</h3>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {checkoutUrl && <div className="narrative-block" style={{ marginBottom: 16 }}>{checkoutUrl}</div>}

          <div className="field">
            <label>Target school</label>
            <select required value={form.target_school} onChange={(e) => setForm({ ...form, target_school: e.target.value })}>
              <option value="">Select a school</option>
              {sortedSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.district} {ranking[s.id] ? `(priority ${ranking[s.id]})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Quantity</label>
              <input required type="number" min="1" value={form.quantity_requested} onChange={(e) => setForm({ ...form, quantity_requested: e.target.value })} />
            </div>
            <div className="field">
              <label>Unit price (GHS)</label>
              <input required type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Estimated total</label>
            <input disabled value={`GHS ${(Number(form.quantity_requested || 0) * Number(form.unit_price || 0)).toFixed(2)}`} />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating order..." : "Create procurement order"}
          </button>
        </form>

        <div className="card">
          <div className="card-title">
            <div className="icon-badge icon-badge-moss">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 20.5h17" />
                <rect x="5.5" y="13" width="3.4" height="7.5" rx="0.8" />
                <rect x="10.3" y="8.5" width="3.4" height="12" rx="0.8" />
                <rect x="15.1" y="4.5" width="3.4" height="16" rx="0.8" />
              </svg>
            </div>
            <div>
              <h3>Highest-need schools</h3>
              <p className="sub" style={{ margin: 0 }}>Poverty index, distance to market, absenteeism, population scale.</p>
            </div>
          </div>
          {sortedSchools.slice(0, 5).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", width: 16 }}>{i + 1}</span>
              <span style={{ fontSize: 14, flex: 1 }}>{s.name}</span>
              <span className="mono" style={{ color: "var(--coral-dark)", fontWeight: 600 }}>{ranking[s.id] ?? "—"}</span>
            </div>
          ))}
          {sortedSchools.length === 0 && <p className="sub">No schools added yet.</p>}
        </div>
      </div>
    </>
  );
}
