import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

export default function AgentHome() {
  const { user, agent, refreshAgent } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([refreshAgent(), client.get("/distributions/", { params: { ordering: "-timestamp" } })])
      .then(([, res]) => {
        if (!active) return;
        const records = res.data.results ?? res.data;
        const today = new Date().toDateString();
        setTodayCount(records.filter((r) => new Date(r.timestamp).toDateString() === today).length);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Agent · Field Ops"
        title={`Welcome, ${user?.first_name || "Agent"}`}
        description={agent?.catchment_area || "Catchment area not set"}
        accent="coral"
      />

      {!loading && agent && agent.verification_status !== "verified" && (
        <div className="card" style={{ background: "var(--surface-sunken)", borderColor: "var(--line)", marginBottom: 16 }}>
          <strong>Your account is {agent.verification_status}.</strong>
          <p className="sub" style={{ marginTop: 4 }}>
            A LaafiTech admin needs to verify your account before you can log distributions or
            receive inventory. This usually doesn't take long — check back soon.
          </p>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Stock balance" value={loading ? "—" : agent?.current_inventory_balance ?? 0} sub="Units on hand" />
        <StatCard label="Today's logs" value={loading ? "—" : todayCount} sub="Distributions logged today" />
        <StatCard
          label="Lifetime distributed"
          value={loading ? "—" : agent?.total_distributed_lifetime ?? 0}
          sub="Verified units, all time"
        />
        <StatCard
          label="Agent status"
          value={loading ? "—" : agent?.verification_status ?? "—"}
          sub="Set by LaafiTech admin"
        />
      </div>

      <div className="card" style={{ display: "flex", gap: 16 }}>
        {agent?.verification_status === "verified" ? (
          <>
            <Link to="/agent/log" className="btn btn-primary">
              Log a distribution
            </Link>
            <Link to="/agent/inventory" className="btn btn-ghost">
              Request restock
            </Link>
          </>
        ) : (
          <button className="btn btn-primary" disabled>
            Log a distribution (pending verification)
          </button>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card stat-card">
      <div className="label">{label}</div>
      <div className="value mono" style={{ textTransform: "capitalize" }}>{value}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}
