import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = () => {
    setLoading(true);
    client.get("/payouts/").then((res) => setPayouts(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const process = async (id) => {
    setProcessing(id);
    try {
      await client.post(`/payouts/${id}/process/`);
      load();
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Payouts"
        description="Routed automatically: MTN agents via native MoMo, Vodafone/AirtelTigo via Hubtel."
        accent="coral"
      />

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && payouts.length === 0 && (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No payouts yet</h3>
            <p>Payouts appear here once verified distributions accrue earnings for agents.</p>
          </div>
        </div>
      )}

      {!loading && payouts.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Period</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td>{p.agent_code}</td>
                  <td className="mono">GHS {p.amount}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.method?.replace("_", " ") || "—"}</td>
                  <td>{p.period_start} → {p.period_end}</td>
                  <td><span className={`badge badge-${p.status === "completed" ? "verified" : p.status === "failed" ? "flagged" : "pending"}`}>{p.status}</span></td>
                  <td>
                    {p.status === "pending" && (
                      <button className="btn btn-primary" disabled={processing === p.id} onClick={() => process(p.id)}>
                        {processing === p.id ? "Processing..." : "Process payment"}
                      </button>
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
