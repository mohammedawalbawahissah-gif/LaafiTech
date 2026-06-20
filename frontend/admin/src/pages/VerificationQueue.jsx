import { useEffect, useState } from "react";
import client from "../api/client";
import StatusBadge from "../components/StatusBadge";
import EvidenceStamp from "../components/EvidenceStamp";
import AnomalyFlags from "../components/AnomalyFlags";

export default function VerificationQueue() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const load = () => {
    setLoading(true);
    client
      .get("/distributions/verification-queue/")
      .then((res) => setRecords(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const decide = async (id, decision) => {
    setActingOn(id);
    try {
      await client.post(`/distributions/${id}/verify/`, { decision });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActingOn(null);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Verification queue</h1>
          <p>AI-flagged records are surfaced first. Approving unlocks payout eligibility.</p>
        </div>
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && records.length === 0 && (
        <div className="card empty-state">
          <h3>Queue is clear</h3>
          <p>No pending or flagged distribution records right now.</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Qty</th>
                <th>Recipient</th>
                <th>Evidence</th>
                <th>AI flags</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.agent_code}</td>
                  <td className="mono">{r.quantity}</td>
                  <td>{r.school_name || r.recipient_type}</td>
                  <td>
                    <EvidenceStamp photoUrl={r.photo_url} lat={r.gps_lat} lng={r.gps_lng} timestamp={r.timestamp} />
                  </td>
                  <td><AnomalyFlags flags={r.ai_anomaly_flags} /></td>
                  <td><StatusBadge status={r.verification_status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-primary"
                        disabled={actingOn === r.id}
                        onClick={() => decide(r.id, "verified")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={actingOn === r.id}
                        onClick={() => decide(r.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
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
