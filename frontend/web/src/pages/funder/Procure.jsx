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
          <div className="field">
            <label>Quantity</label>
            <input required type="number" min="1" value={form.quantity_requested} onChange={(e) => setForm({ ...form, quantity_requested: e.target.value })} />
          </div>
          <div className="field">
            <label>Unit price (GHS)</label>
            <input required type="number" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
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
          <h3 style={{ marginBottom: 12 }}>Highest-need schools</h3>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
            Ranked by an explainable need-priority score (poverty index, distance to market, absenteeism, population scale).
          </p>
          {sortedSchools.slice(0, 5).map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 14 }}>{s.name}</span>
              <span className="mono" style={{ color: "var(--accent)", fontWeight: 600 }}>{ranking[s.id] ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
