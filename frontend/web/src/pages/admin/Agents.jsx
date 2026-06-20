import { useEffect, useState } from "react";
import client from "../../api/client";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/agents/").then((res) => setAgents(res.data.results ?? res.data)).finally(() => setLoading(false));
  }, []);

  const verify = async (id) => {
    await client.patch(`/agents/${id}/`, { verification_status: "verified" });
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, verification_status: "verified" } : a)));
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Agents</h1>
          <p>Onboard, verify, and monitor distribution agents.</p>
        </div>
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Catchment area</th>
                <th>Network</th>
                <th>Payout method</th>
                <th>Stock balance</th>
                <th>Lifetime distributed</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td>{a.agent_code} — {a.user?.first_name} {a.user?.last_name}</td>
                  <td>{a.catchment_area}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.momo_provider}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.payout_method.replace("_", " ")}</td>
                  <td className="mono">{a.current_inventory_balance}</td>
                  <td className="mono">{a.total_distributed_lifetime}</td>
                  <td><span className={`badge badge-${a.verification_status === "verified" ? "verified" : "pending"}`}>{a.verification_status}</span></td>
                  <td>
                    {a.verification_status !== "verified" && (
                      <button className="btn btn-primary" onClick={() => verify(a.id)}>Verify</button>
                    )}
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr><td colSpan={8} className="empty-state">No agents yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
