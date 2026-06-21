import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";

function badgeClass(status) {
  if (status === "completed") return "badge-verified";
  if (status === "failed") return "badge-flagged";
  if (status === "pending") return "badge-pending";
  return "badge-rejected";
}

export default function AgentEarnings() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/payouts/")
      .then((res) => setPayouts(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  const pendingTotal = payouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);
  const paidTotal = payouts.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <>
      <PageHeader
        eyebrow="Agent · Field Ops"
        title="My earnings"
        description="Pending and completed payouts."
        accent="coral"
      />

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="card stat-card">
          <div className="label">Pending</div>
          <div className="value mono">GHS {pendingTotal.toFixed(2)}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Paid out</div>
          <div className="value mono">GHS {paidTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Period</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td className="mono">GHS {p.amount}</td>
                <td>{p.period_start} → {p.period_end}</td>
                <td style={{ textTransform: "capitalize" }}>{p.method?.replace("_", " ") || "—"}</td>
                <td><span className={`badge ${badgeClass(p.status)}`}>{p.status}</span></td>
              </tr>
            ))}
            {!loading && payouts.length === 0 && (
              <tr><td colSpan={4} className="empty-state">No payouts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
