import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
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
        <div className="banner banner-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 11v5.5" />
          </svg>
          <div>
            <strong>Your account is {agent.verification_status}.</strong>{" "}
            A LaafiTech admin needs to verify your account before you can log distributions or
            receive inventory. This usually doesn't take long — check back soon.
          </div>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Stock balance" value={loading ? "—" : agent?.current_inventory_balance ?? 0} sub="Units on hand" icon="inventory" />
        <StatCard label="Today's logs" value={loading ? "—" : todayCount} sub="Distributions logged today" icon="log" />
        <StatCard
          label="Lifetime distributed"
          value={loading ? "—" : agent?.total_distributed_lifetime ?? 0}
          sub="Verified units, all time"
          icon="history"
        />
        <StatCard
          label="Agent status"
          value={loading ? "—" : agent?.verification_status ?? "—"}
          sub="Set by LaafiTech admin"
          icon="agents"
          dark
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
