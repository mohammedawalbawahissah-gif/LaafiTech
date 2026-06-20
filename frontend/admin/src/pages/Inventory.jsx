import { useEffect, useState } from "react";
import client from "../api/client";

export default function Inventory() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ batch_code: "", production_date: "", quantity_produced: "", unit_cost: "" });

  const load = () => {
    setLoading(true);
    client.get("/batches/").then((res) => setBatches(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await client.post("/batches/", form);
    setForm({ batch_code: "", production_date: "", quantity_produced: "", unit_cost: "" });
    setShowForm(false);
    load();
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Inventory</h1>
          <p>Production batches from LaafiTech manufacturing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Log new batch"}
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ marginBottom: 20 }} onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>Batch code</label>
              <input required value={form.batch_code} onChange={(e) => setForm({ ...form, batch_code: e.target.value })} placeholder="LT-2026-014" />
            </div>
            <div className="field">
              <label>Production date</label>
              <input required type="date" value={form.production_date} onChange={(e) => setForm({ ...form, production_date: e.target.value })} />
            </div>
            <div className="field">
              <label>Quantity produced</label>
              <input required type="number" value={form.quantity_produced} onChange={(e) => setForm({ ...form, quantity_produced: e.target.value })} />
            </div>
            <div className="field">
              <label>Unit cost (GHS)</label>
              <input required type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary">Save batch</button>
        </form>
      )}

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Produced</th>
                <th>Unit cost</th>
                <th>Allocated</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id}>
                  <td>{b.batch_code}</td>
                  <td className="mono">{b.quantity_produced}</td>
                  <td className="mono">GHS {b.unit_cost}</td>
                  <td className="mono">{b.quantity_allocated}</td>
                  <td className="mono">{b.quantity_available}</td>
                  <td style={{ textTransform: "capitalize" }}>{b.status.replace("_", " ")}</td>
                </tr>
              ))}
              {batches.length === 0 && <tr><td colSpan={6} className="empty-state">No batches logged yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
