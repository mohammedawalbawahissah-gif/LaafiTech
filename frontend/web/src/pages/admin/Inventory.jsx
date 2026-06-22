import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

// ─── icons ────────────────────────────────────────────────────────────────────

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
      <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
    </svg>
  );
}

function IconAllocate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

// ─── component ────────────────────────────────────────────────────────────────

export default function Inventory() {
  const [batches, setBatches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // which top panel is open: null | "batch" | "allocate"
  const [panel, setPanel] = useState(null);

  // inline fulfilment form: stores the allocation id being actioned, or null
  const [fulfillingId, setFulfillingId] = useState(null);
  const [fulfilQty, setFulfilQty] = useState("");
  const [fulfilBatch, setFulfilBatch] = useState("");
  const [fulfilError, setFulfilError] = useState("");
  const [fulfilSaving, setFulfilSaving] = useState(false);

  const [batchForm, setBatchForm] = useState({
    batch_code: "", production_date: "", quantity_produced: "", unit_cost: "", notes: "",
  });
  const [allocForm, setAllocForm] = useState({ agent: "", batch: "", quantity_allocated: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── loaders ────────────────────────────────────────────────────────────────

  const loadBatches = () =>
    client.get("/batches/").then((r) => setBatches(r.data.results ?? r.data));

  const loadAgents = () =>
    client.get("/agents/").then((r) => setAgents(r.data.results ?? r.data));

  const loadAllocations = () =>
    client.get("/allocations/").then((r) => setAllocations(r.data.results ?? r.data));

  const loadAll = () => {
    setLoading(true);
    Promise.all([loadBatches(), loadAgents(), loadAllocations()]).finally(() =>
      setLoading(false)
    );
  };

  useEffect(loadAll, []);

  // ── derived ────────────────────────────────────────────────────────────────

  const restockRequests = allocations.filter((a) => a.restock_requested);

  const selectedBatchAvailable = allocForm.batch
    ? (batches.find((b) => String(b.id) === String(allocForm.batch))?.quantity_available ?? 0)
    : null;

  const fulfilBatchAvailable = fulfilBatch
    ? (batches.find((b) => String(b.id) === String(fulfilBatch))?.quantity_available ?? 0)
    : null;

  // ── submit: new batch ──────────────────────────────────────────────────────

  const submitBatch = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await client.post("/batches/", batchForm);
      setBatchForm({ batch_code: "", production_date: "", quantity_produced: "", unit_cost: "", notes: "" });
      setPanel(null);
      loadAll();
    } catch (err) {
      const data = err?.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Couldn't save batch.");
    } finally {
      setSaving(false);
    }
  };

  // ── submit: allocate stock ─────────────────────────────────────────────────

  const submitAlloc = async (e) => {
    e.preventDefault();
    setError("");
    if (selectedBatchAvailable !== null && Number(allocForm.quantity_allocated) > selectedBatchAvailable) {
      setError(`Only ${selectedBatchAvailable} units available in this batch.`);
      return;
    }
    setSaving(true);
    try {
      await client.post("/allocations/", {
        agent: Number(allocForm.agent),
        batch: Number(allocForm.batch),
        quantity_allocated: Number(allocForm.quantity_allocated),
        quantity_remaining: Number(allocForm.quantity_allocated),
      });
      setAllocForm({ agent: "", batch: "", quantity_allocated: "" });
      setPanel(null);
      loadAll();
    } catch (err) {
      const data = err?.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Couldn't create allocation.");
    } finally {
      setSaving(false);
    }
  };

  // ── open inline fulfil form ────────────────────────────────────────────────

  const openFulfil = (alloc) => {
    // Pre-fill quantity from the agent's note if available
    const notesMatch = alloc.restock_notes?.match(/Requested qty:\s*(\d+)/);
    setFulfilQty(notesMatch ? notesMatch[1] : "");
    // Default to the same batch the request came from if it still has stock
    const sameBatchAvailable = batches.find((b) => b.id === alloc.batch)?.quantity_available ?? 0;
    setFulfilBatch(sameBatchAvailable > 0 ? String(alloc.batch) : "");
    setFulfilError("");
    setFulfillingId(alloc.id);
  };

  const cancelFulfil = () => {
    setFulfillingId(null);
    setFulfilQty("");
    setFulfilBatch("");
    setFulfilError("");
  };

  // ── submit: fulfil restock ─────────────────────────────────────────────────

  const submitFulfil = async (e, alloc) => {
    e.preventDefault();
    setFulfilError("");
    if (fulfilBatchAvailable !== null && Number(fulfilQty) > fulfilBatchAvailable) {
      setFulfilError(`Only ${fulfilBatchAvailable} units available in that batch.`);
      return;
    }
    setFulfilSaving(true);
    try {
      await client.post("/allocations/", {
        agent: alloc.agent,
        batch: Number(fulfilBatch),
        quantity_allocated: Number(fulfilQty),
        quantity_remaining: Number(fulfilQty),
      });
      await client.patch(`/allocations/${alloc.id}/`, { restock_requested: false });
      cancelFulfil();
      loadAll();
    } catch (err) {
      const data = err?.response?.data;
      setFulfilError(data ? Object.values(data).flat().join(" ") : "Couldn't fulfil request. Check available batch stock.");
    } finally {
      setFulfilSaving(false);
    }
  };

  // ── dismiss restock ────────────────────────────────────────────────────────

  const dismissRestock = async (id) => {
    await client.patch(`/allocations/${id}/`, { restock_requested: false });
    loadAll();
  };

  // ── open panel helper ──────────────────────────────────────────────────────

  const togglePanel = (name) => {
    setError("");
    setPanel((p) => (p === name ? null : name));
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Inventory"
        description="Production batches, agent stock allocations, and restock requests."
        accent="coral"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => togglePanel("allocate")}>
              {panel === "allocate" ? "Cancel" : "Allocate stock"}
            </button>
            <button className="btn btn-primary" onClick={() => togglePanel("batch")}>
              {panel === "batch" ? "Cancel" : "Log new batch"}
            </button>
          </div>
        }
      />

      {/* ── Restock requests banner ──────────────────────────────────────── */}
      {restockRequests.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            borderLeft: "4px solid var(--warning)",
            background: "var(--warning-tint)",
          }}
        >
          <div className="card-title" style={{ marginBottom: 14 }}>
            <div className="icon-badge" style={{ background: "var(--warning-tint)", color: "var(--warning)" }}>
              <IconAlert />
            </div>
            <h3 style={{ color: "var(--warning)" }}>
              {restockRequests.length} restock {restockRequests.length === 1 ? "request" : "requests"} pending
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {restockRequests.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                }}
              >
                {/* request summary row */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 16px",
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>
                      {a.agent_code} — {a.agent_name}
                    </span>
                    <span style={{ color: "var(--ink-soft)", fontSize: 13, marginLeft: 10 }}>
                      {a.quantity_remaining} units remaining · batch {a.batch_detail?.batch_code ?? `#${a.batch}`}
                    </span>
                    {a.restock_notes && (
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink)" }}>
                        <span style={{ color: "var(--ink-soft)" }}>Agent note:</span> {a.restock_notes}
                      </p>
                    )}
                  </div>

                  {fulfillingId !== a.id && (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => openFulfil(a)}>
                        Allocate more
                      </button>
                      <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => dismissRestock(a.id)}>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                {/* inline fulfil form — expands below the summary row */}
                {fulfillingId === a.id && (
                  <form
                    onSubmit={(e) => submitFulfil(e, a)}
                    style={{
                      borderTop: "1px solid var(--line)",
                      padding: "16px",
                      background: "var(--surface-sunken)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                      Allocate additional stock to {a.agent_code}
                    </p>

                    {fulfilError && (
                      <p style={{ margin: 0, color: "var(--danger)", fontSize: 13 }}>{fulfilError}</p>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div className="field" style={{ margin: 0 }}>
                        <label>Batch</label>
                        <select
                          required
                          value={fulfilBatch}
                          onChange={(e) => setFulfilBatch(e.target.value)}
                        >
                          <option value="">— select batch —</option>
                          {batches
                            .filter((b) => b.quantity_available > 0)
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.batch_code} ({b.quantity_available} available)
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="field" style={{ margin: 0 }}>
                        <label>
                          Units to allocate
                          {fulfilBatchAvailable !== null && (
                            <span style={{ color: "var(--ink-soft)", fontWeight: 400, marginLeft: 6 }}>
                              (max {fulfilBatchAvailable})
                            </span>
                          )}
                        </label>
                        <input
                          required
                          type="number"
                          min="1"
                          max={fulfilBatchAvailable ?? undefined}
                          value={fulfilQty}
                          onChange={(e) => setFulfilQty(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" type="submit" disabled={fulfilSaving || !fulfilBatch || !fulfilQty}>
                        {fulfilSaving ? "Allocating..." : "Confirm allocation"}
                      </button>
                      <button className="btn btn-ghost" type="button" onClick={cancelFulfil}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Log new batch form ───────────────────────────────────────────── */}
      {panel === "batch" && (
        <form className="card" style={{ marginBottom: 20 }} onSubmit={submitBatch}>
          <div className="card-title">
            <div className="icon-badge icon-badge-coral">
              <IconBox />
            </div>
            <h3>New production batch</h3>
          </div>

          {error && (
            <p style={{ color: "var(--danger)", marginBottom: 12, fontSize: 14 }}>{error}</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>Batch code</label>
              <input
                required
                value={batchForm.batch_code}
                onChange={(e) => setBatchForm({ ...batchForm, batch_code: e.target.value })}
                placeholder="LT-2026-014"
              />
            </div>
            <div className="field">
              <label>Production date</label>
              <input
                required
                type="date"
                value={batchForm.production_date}
                onChange={(e) => setBatchForm({ ...batchForm, production_date: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Quantity produced</label>
              <input
                required
                type="number"
                min="1"
                value={batchForm.quantity_produced}
                onChange={(e) => setBatchForm({ ...batchForm, quantity_produced: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Unit cost (GHS)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={batchForm.unit_cost}
                onChange={(e) => setBatchForm({ ...batchForm, unit_cost: e.target.value })}
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Notes (optional)</label>
              <textarea
                rows={2}
                value={batchForm.notes}
                onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                placeholder="Any production notes..."
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save batch"}
          </button>
        </form>
      )}

      {/* ── Allocate stock form ──────────────────────────────────────────── */}
      {panel === "allocate" && (
        <form className="card" style={{ marginBottom: 20 }} onSubmit={submitAlloc}>
          <div className="card-title">
            <div className="icon-badge icon-badge-coral">
              <IconAllocate />
            </div>
            <h3>Allocate stock to agent</h3>
          </div>

          {error && (
            <p style={{ color: "var(--danger)", marginBottom: 12, fontSize: 14 }}>{error}</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>Agent</label>
              <select
                required
                value={allocForm.agent}
                onChange={(e) => setAllocForm({ ...allocForm, agent: e.target.value })}
              >
                <option value="">— select agent —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.agent_code} — {a.user?.first_name} {a.user?.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Batch</label>
              <select
                required
                value={allocForm.batch}
                onChange={(e) => setAllocForm({ ...allocForm, batch: e.target.value })}
              >
                <option value="">— select batch —</option>
                {batches
                  .filter((b) => b.quantity_available > 0)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_code} ({b.quantity_available} available)
                    </option>
                  ))}
              </select>
            </div>

            <div className="field">
              <label>
                Quantity to allocate
                {selectedBatchAvailable !== null && (
                  <span style={{ color: "var(--ink-soft)", fontWeight: 400, marginLeft: 6 }}>
                    (max {selectedBatchAvailable})
                  </span>
                )}
              </label>
              <input
                required
                type="number"
                min="1"
                max={selectedBatchAvailable ?? undefined}
                value={allocForm.quantity_allocated}
                onChange={(e) => setAllocForm({ ...allocForm, quantity_allocated: e.target.value })}
              />
            </div>
          </div>

          <button className="btn btn-primary" disabled={saving || agents.length === 0 || batches.filter(b => b.quantity_available > 0).length === 0}>
            {saving ? "Allocating..." : "Allocate stock"}
          </button>

          {agents.length === 0 && (
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 8 }}>
              No agents found. Verify at least one agent first.
            </p>
          )}
          {batches.filter(b => b.quantity_available > 0).length === 0 && batches.length > 0 && (
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 8 }}>
              All batches are fully allocated. Log a new production batch first.
            </p>
          )}
        </form>
      )}

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {/* ── Batch table ──────────────────────────────────────────────────── */}
      {!loading && batches.length === 0 && (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No batches logged yet</h3>
            <p>Log a production batch above to start tracking inventory.</p>
          </div>
        </div>
      )}

      {!loading && batches.length > 0 && (
        <>
          <h3 style={{ marginBottom: 10, fontSize: 15, color: "var(--ink-soft)", fontFamily: "var(--font-body)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Production batches
          </h3>
          <div className="card" style={{ padding: 0, marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Date</th>
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
                    <td style={{ fontWeight: 600 }}>{b.batch_code}</td>
                    <td>{new Date(b.production_date).toLocaleDateString()}</td>
                    <td className="mono">{b.quantity_produced}</td>
                    <td className="mono">GHS {b.unit_cost}</td>
                    <td className="mono">{b.quantity_allocated}</td>
                    <td className="mono" style={{ color: b.quantity_available === 0 ? "var(--ink-soft)" : "inherit" }}>
                      {b.quantity_available}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{b.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Allocations table ────────────────────────────────────────────── */}
      {!loading && allocations.length > 0 && (
        <>
          <h3 style={{ marginBottom: 10, fontSize: 15, color: "var(--ink-soft)", fontFamily: "var(--font-body)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Agent stock allocations
          </h3>
          <div className="card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Batch</th>
                  <th>Allocated</th>
                  <th>Remaining</th>
                  <th>Date</th>
                  <th>Restock</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{a.agent_code}</span>
                      <span style={{ color: "var(--ink-soft)", fontSize: 13, marginLeft: 6 }}>{a.agent_name}</span>
                    </td>
                    <td>{a.batch_detail?.batch_code ?? `#${a.batch}`}</td>
                    <td className="mono">{a.quantity_allocated}</td>
                    <td className="mono">{a.quantity_remaining}</td>
                    <td>{new Date(a.allocation_date).toLocaleDateString()}</td>
                    <td>
                      {a.restock_requested ? (
                        <div>
                          <span className="badge badge-pending">requested</span>
                          {a.restock_notes && (
                            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-soft)", maxWidth: 200 }}>
                              {a.restock_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
