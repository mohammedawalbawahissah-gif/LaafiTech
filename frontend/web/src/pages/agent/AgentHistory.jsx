import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";

function badgeClass(status) {
  if (status === "verified") return "badge-verified";
  if (status === "flagged") return "badge-flagged";
  if (status === "pending") return "badge-pending";
  return "badge-rejected";
}

export default function AgentHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/distributions/", { params: { ordering: "-timestamp" } })
      .then((res) => setRecords(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Agent · Field Ops"
        title="Distribution history"
        description="Everything you've logged, most recent first."
        accent="coral"
      />

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Quantity</th>
              <th>Recipient</th>
              <th>Date</th>
              <th>Flags</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.photo_url ? (
                    <img src={r.photo_url} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--surface-sunken)" }} />
                  )}
                </td>
                <td className="mono">{r.quantity}</td>
                <td style={{ textTransform: "capitalize" }}>{r.recipient_type.replace("_", " ")}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.ai_anomaly_flags?.length > 0 ? `${r.ai_anomaly_flags.length} flag(s)` : "—"}</td>
                <td><span className={`badge ${badgeClass(r.verification_status)}`}>{r.verification_status}</span></td>
              </tr>
            ))}
            {!loading && records.length === 0 && (
              <tr><td colSpan={6} className="empty-state">No distributions logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
