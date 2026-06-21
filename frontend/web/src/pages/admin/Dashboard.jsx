import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get("/distributions/verification-queue/"),
      client.get("/allocations/?restock_requested=true"),
      client.get("/payouts/?status=pending"),
      client.get("/impact-reports/?scope=national"),
    ])
      .then(([queue, restocks, pendingPayouts, reports]) => {
        const queueCount = queue.data.count ?? queue.data.length;
        const restockCount = restocks.data.count ?? restocks.data.length;
        const payoutCount = pendingPayouts.data.count ?? pendingPayouts.data.length;
        const latestReport = (reports.data.results ?? reports.data)[0];
        setStats({ queueCount, restockCount, payoutCount, latestReport });
      })
      .catch(() => setStats({ error: true }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Operations overview"
        description="What needs your attention right now."
        accent="coral"
      />

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && stats && !stats.error && (
        <div className="stat-grid">
          <StatCard label="Pending verification" value={stats.queueCount} sub="Distribution records to review" icon="verify" />
          <StatCard label="Restock requests" value={stats.restockCount} sub="Agents waiting on inventory" icon="inventory" />
          <StatCard label="Pending payouts" value={stats.payoutCount} sub="Verified, awaiting payment" icon="payouts" />
          <StatCard
            label="Pads distributed"
            value={stats.latestReport?.pads_distributed_count ?? "—"}
            sub={stats.latestReport ? `As of last report` : "No report generated yet"}
            icon="impact"
            dark
          />
        </div>
      )}

      {!loading && stats?.error && (
        <div className="card empty-state">
          <h3>Couldn't load live stats</h3>
          <p>Check that the backend API is running and reachable.</p>
        </div>
      )}

      <div className="card">
        <div className="card-title">
          <div className="icon-badge icon-badge-coral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5l3 2" />
            </svg>
          </div>
          <h3>Quick start</h3>
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          New distribution records land in the <strong>Verification Queue</strong> first — AI-flagged
          records surface at the top. Approving a record is what makes it eligible for an agent payout.
          Inventory restock requests and agent onboarding live under <strong>Agents</strong> and{" "}
          <strong>Inventory</strong>.
        </p>
      </div>
    </>
  );
}
