import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import BloomMark from "../../components/BloomMark";

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

      <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <StatCard label="Pending" value={`GHS ${pendingTotal.toFixed(2)}`} icon="payouts" />
        <StatCard label="Paid out" value={`GHS ${paidTotal.toFixed(2)}`} icon="earnings" dark />
      </div>

      {!loading && payouts.length === 0 ? (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No payouts yet</h3>
            <p>Verified distributions will accrue earnings that show up here.</p>
          </div>
        </div>
      ) : (
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
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
