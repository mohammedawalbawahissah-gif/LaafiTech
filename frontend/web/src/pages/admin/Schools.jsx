import { useEffect, useState } from "react";
import client from "../../api/client";

export default function Schools() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/ai/need-priority-ranking/").then((res) => setRanking(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Schools &amp; need scores</h1>
          <p>Explainable AI priority ranking — every score shows the factors behind it.</p>
        </div>
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>School</th>
                <th>District</th>
                <th>Priority score</th>
                <th>Poverty</th>
                <th>Distance</th>
                <th>Absenteeism</th>
                <th>Scale</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr key={r.school_id}>
                  <td>{r.school}</td>
                  <td>{r.district}</td>
                  <td className="mono" style={{ fontWeight: 600, color: "var(--accent)" }}>{r.score}</td>
                  <td className="mono">{r.factors.poverty_index}</td>
                  <td className="mono">{r.factors.distance_to_market}</td>
                  <td className="mono">{r.factors.absenteeism_rate}</td>
                  <td className="mono">{r.factors.population_scale}</td>
                </tr>
              ))}
              {ranking.length === 0 && <tr><td colSpan={7} className="empty-state">No schools added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
