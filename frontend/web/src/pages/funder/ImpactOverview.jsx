import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

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
      <PageHeader
        eyebrow="Funder · Impact"
        title="Impact overview"
        description="Every figure here is backed by photo + GPS verified distribution records."
        accent="coral"
      />

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && report && (
        <div className="stat-grid">
          <StatCard label="Pads distributed" value={report.pads_distributed_count} sub="Verified units" icon="impact" dark />
          <StatCard label="Girls reached (est.)" value={report.girls_reached_estimate} sub="Based on verified distributions" icon="agents" />
          <StatCard label="Schools covered" value={report.schools_covered_count} sub="Across reporting period" icon="schools" />
          <StatCard label="Cost per girl" value={report.cost_per_girl ? `GHS ${report.cost_per_girl}` : "—"} sub="Funder contribution / girls reached" icon="procure" />
        </div>
      )}

      {!loading && !report && (
        <div className="card empty-state">
          <h3>No impact report yet</h3>
          <p>Reports are generated periodically as verified distributions accumulate.</p>
        </div>
      )}

      <div className="card">
        <div className="card-title">
          <div className="icon-badge icon-badge-coral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5 19 6.3v5.4c0 4.6-3 7.9-7 8.8-4-.9-7-4.2-7-8.8V6.3z" />
              <path d="m9 12.2 2.1 2.1L15.5 10" />
            </svg>
          </div>
          <h3>How verification works</h3>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Every distribution is logged by a local LaafiTech agent with a photo and GPS location, then
          reviewed and approved by the LaafiTech team before it counts toward any report you see here.
          Browse the underlying records under <strong>Verified Deliveries</strong>.
        </p>
      </div>
    </>
  );
}
