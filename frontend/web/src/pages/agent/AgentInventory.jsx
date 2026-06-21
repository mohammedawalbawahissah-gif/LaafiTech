import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

export default function AgentInventory() {
  const { agent, refreshAgent } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    client
      .get("/allocations/")
      .then((res) => setAllocations(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const requestRestock = async () => {
    setMessage("");
    if (allocations.length === 0) {
      setMessage("No active stock allocation to flag for restock yet — contact a LaafiTech admin.");
      return;
    }
    setRequesting(true);
    try {
      const latest = allocations[0];
      await client.patch(`/allocations/${latest.id}/`, { restock_requested: true });
      setMessage("Restock request sent to LaafiTech admin.");
      await refreshAgent();
      load();
    } catch {
      setMessage("Couldn't send request. Check your connection and try again.");
    } finally {
      setRequesting(false);
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

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="card stat-card">
          <div className="label">Current balance</div>
          <div className="value mono">{agent?.current_inventory_balance ?? 0}</div>
          <div className="sub">units on hand</div>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={requestRestock} disabled={requesting}>
            {requesting ? "Sending..." : "Request restock"}
          </button>
          {message && <p className="sub" style={{ marginTop: 10 }}>{message}</p>}
        </div>
      </div>

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
                <td>#{a.batch}</td>
                <td className="mono">{a.quantity_allocated}</td>
                <td className="mono">{a.quantity_remaining}</td>
                <td>{new Date(a.allocation_date).toLocaleDateString()}</td>
                <td>{a.restock_requested && <span className="badge badge-pending">requested</span>}</td>
              </tr>
            ))}
            {!loading && allocations.length === 0 && (
              <tr><td colSpan={5} className="empty-state">No allocations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
