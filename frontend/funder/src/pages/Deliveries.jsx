import { useEffect, useState } from "react";
import client from "../api/client";
import EvidenceStamp from "../components/EvidenceStamp";

export default function Deliveries() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("");

  useEffect(() => {
    setLoading(true);
    client
      .get("/distributions/", { params: { verification_status: "verified", ...(district ? { school__district: district } : {}) } })
      .then((res) => setRecords(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  }, [district]);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Verified deliveries</h1>
          <p>Browse confirmed distributions with photo + GPS evidence.</p>
        </div>
      </div>

      <div className="field" style={{ maxWidth: 280, marginBottom: 20 }}>
        <label>Filter by district</label>
        <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Kumbungu" />
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && records.length === 0 && (
        <div className="card empty-state">
          <h3>No verified deliveries found</h3>
          <p>Try a different district, or check back as more are verified.</p>
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>School / Community</th>
                <th>Quantity</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.school_name || r.recipient_type}</td>
                  <td className="mono">{r.quantity}</td>
                  <td><EvidenceStamp photoUrl={r.photo_url} lat={r.gps_lat} lng={r.gps_lng} timestamp={r.timestamp} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
