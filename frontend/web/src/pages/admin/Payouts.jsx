import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

function methodLabel(method) {
  if (method === "native_momo") return "MTN MoMo";
  if (method === "hubtel") return "Hubtel";
  return method?.replace(/_/g, " ") || "—";
}

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [processError, setProcessError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState(null);

  const load = () => {
    setLoading(true);
    client.get("/payouts/").then((res) => setPayouts(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const process = async (id) => {
    setProcessing(id);
    setProcessError(null);
    try {
      await client.post(`/payouts/${id}/process/`);
      load();
    } catch (err) {
      const detail = err.response?.data;
      setProcessError(detail?.detail || "Couldn't process payout. Check your connection and try again.");
    } finally {
      setProcessing(null);
    }
  };


  const generatePayouts = async () => {
    setGenerating(true);
    setGenerateMsg(null);
    try {
      const res = await client.post("/payouts/generate/");
      const count = res.data?.created ?? res.data?.count ?? "new";
      setGenerateMsg({ type: "success", text: `Generated ${count} payout record(s).` });
      load();
    } catch (err) {
      setGenerateMsg({ type: "error", text: err.response?.data?.detail || "Couldn't generate payouts." });
    } finally {
      setGenerating(false);
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

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={generatePayouts} disabled={generating}>
          {generating ? "Generating..." : "Generate Payouts"}
        </button>
      </div>

      {generateMsg && (
        <div className={generateMsg.type === "error" ? "auth-error" : "banner banner-success"} style={{ marginBottom: 16 }}>
          {generateMsg.text}
        </div>
      )}

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {processError && <div className="auth-error" style={{ marginBottom: 16 }}>{processError}</div>}

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
                <th>Reference</th>
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
                  <td style={{ textTransform: "capitalize" }}>{methodLabel(p.method)}</td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{p.provider_reference || "—"}</td>
                  <td>{p.period_start} → {p.period_end}</td>
                  <td>
                    <span className={`badge badge-${p.status === "completed" ? "verified" : p.status === "failed" ? "flagged" : "pending"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === "pending" && (
                      <button className="btn btn-primary" disabled={processing === p.id} onClick={() => process(p.id)}>
                        {processing === p.id ? "Processing..." : "Process payment"}
                      </button>
                    )}
                    {p.status === "failed" && (
                      <button className="btn btn-ghost" disabled={processing === p.id} onClick={() => process(p.id)}>
                        {processing === p.id ? "Retrying..." : "Retry"}
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
