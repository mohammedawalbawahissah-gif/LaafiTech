import { useEffect, useState } from "react";
import client from "../../api/client";

export default function ImpactOverview() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/impact-reports/?scope=national")
      .then((res) => setReport((res.data.results ?? res.data)[0] || null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Impact overview</h1>
          <p>Every figure here is backed by photo + GPS verified distribution records.</p>
        </div>
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && report && (
        <div className="stat-grid">
          <StatCard label="Pads distributed" value={report.pads_distributed_count} sub="Verified units" />
          <StatCard label="Girls reached (est.)" value={report.girls_reached_estimate} sub="Based on verified distributions" />
          <StatCard label="Schools covered" value={report.schools_covered_count} sub="Across reporting period" />
          <StatCard label="Cost per girl" value={report.cost_per_girl ? `GHS ${report.cost_per_girl}` : "—"} sub="Funder contribution / girls reached" />
        </div>
      )}

      {!loading && !report && (
        <div className="card empty-state">
          <h3>No impact report yet</h3>
          <p>Reports are generated periodically as verified distributions accumulate.</p>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 8 }}>How verification works</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6 }}>
          Every distribution is logged by a local LaafiTech agent with a photo and GPS location, then
          reviewed and approved by the LaafiTech team before it counts toward any report you see here.
          Browse the underlying records under <strong>Verified Deliveries</strong>.
        </p>
      </div>
    </>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card stat-card">
      <div className="label">{label}</div>
      <div className="value mono">{value ?? "—"}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}
