import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import BloomMark from "../../components/BloomMark";
import { useAuth } from "../../context/AuthContext";

export default function AgentInventory() {
  const { agent, refreshAgent } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // restock form state
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [restockQty, setRestockQty] = useState("");
  const [restockNote, setRestockNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: "success" | "error"

  const load = () => {
    setLoading(true);
    client
      .get("/allocations/")
      .then((res) => setAllocations(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const latestAllocation = allocations.length > 0
    ? [...allocations].sort((a, b) => b.id - a.id)[0]
    : null;
  const alreadyRequested = latestAllocation?.restock_requested ?? false;

  const openRestockForm = () => {
    if (!latestAllocation) {
      setMessage({ text: "No active allocation yet — contact a LaafiTech admin to receive your first stock.", type: "error" });
      return;
    }
    if (alreadyRequested) {
      setMessage({ text: "A restock request is already pending. A LaafiTech admin will action it soon.", type: "error" });
      return;
    }
    setMessage({ text: "", type: "" });
    setRestockQty("");
    setRestockNote("");
    setShowRestockForm(true);
  };

  const cancelRestock = () => {
    setShowRestockForm(false);
    setMessage({ text: "", type: "" });
  };

  const submitRestock = async (e) => {
    e.preventDefault();
    if (!restockQty || Number(restockQty) < 1) return;
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      // Set the restock flag and store the agent's note + requested quantity
      // so the admin can see the context on their dashboard.
      const notePayload = restockNote.trim()
        ? `Requested qty: ${restockQty}. Note: ${restockNote.trim()}`
        : `Requested qty: ${restockQty}`;
      await client.patch(`/allocations/${latestAllocation.id}/`, {
        restock_requested: true,
        restock_notes: notePayload,
      });
      setShowRestockForm(false);
      setMessage({ text: `Restock request for ${restockQty} units sent to LaafiTech admin.`, type: "success" });
      await refreshAgent();
      load();
    } catch {
      setMessage({ text: "Couldn't send request. Check your connection and try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Agent · Field Ops"
        title="My inventory"
        description="Current stock and allocation history."
        accent="coral"
      />

      {/* ── top stat + restock card ───────────────────────────────────────── */}
      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 20 }}>
        <StatCard
          label="Current balance"
          value={agent?.current_inventory_balance ?? 0}
          sub="units on hand"
          icon="inventory"
        />

        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {alreadyRequested ? (
            <>
              <span className="badge badge-pending" style={{ alignSelf: "flex-start", marginBottom: 8 }}>
                Restock requested
              </span>
              <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: 14 }}>
                Your request is pending. A LaafiTech admin will allocate more stock shortly.
              </p>
            </>
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={openRestockForm}
                disabled={!latestAllocation}
              >
                Request restock
              </button>
              {!latestAllocation && !loading && (
                <p style={{ margin: "8px 0 0", color: "var(--ink-soft)", fontSize: 13 }}>
                  No active allocation yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── feedback message ─────────────────────────────────────────────── */}
      {message.text && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: message.type === "success" ? "var(--success-tint)" : "var(--danger-tint)",
            color: message.type === "success" ? "var(--success)" : "var(--danger)",
            fontSize: 14,
            borderLeft: `4px solid ${message.type === "success" ? "var(--success)" : "var(--danger)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* ── restock form ─────────────────────────────────────────────────── */}
      {showRestockForm && (
        <form
          className="card"
          style={{ marginBottom: 20 }}
          onSubmit={submitRestock}
        >
          <div className="card-title" style={{ marginBottom: 16 }}>
            <div className="icon-badge icon-badge-coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
                <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
              </svg>
            </div>
            <h3>Request restock</h3>
          </div>

          <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 16, marginTop: 0 }}>
            Tell LaafiTech how many units you need. An admin will review and allocate stock to you.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <div className="field">
              <label>Units requested</label>
              <input
                required
                type="number"
                min="1"
                placeholder="e.g. 50"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label>Note for admin <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Running low ahead of community visit on Friday"
                value={restockNote}
                onChange={(e) => setRestockNote(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" type="submit" disabled={submitting || !restockQty}>
              {submitting ? "Sending..." : "Send request"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={cancelRestock}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── allocation history table ──────────────────────────────────────── */}
      {!loading && allocations.length === 0 ? (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No allocations yet</h3>
            <p>Stock allocated to you by a LaafiTech admin will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
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
                  <td>{a.batch_detail?.batch_code ?? `#${a.batch}`}</td>
                  <td className="mono">{a.quantity_allocated}</td>
                  <td className="mono">{a.quantity_remaining}</td>
                  <td>{new Date(a.allocation_date).toLocaleDateString()}</td>
                  <td>
                    {a.restock_requested ? (
                      <span className="badge badge-pending">requested</span>
                    ) : (
                      <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
