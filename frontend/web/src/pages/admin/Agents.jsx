import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    client.get("/agents/").then((res) => setAgents(res.data.results ?? res.data)).finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    const res = await client.post(`/agents/${id}/set_status/`, { status });
    setAgents((prev) => prev.map((a) => (a.id === id ? res.data : a)));
  };

  const deleteAgent = async (id, label) => {
    const confirmed = window.confirm(
      `Delete agent ${label}? This permanently removes their profile and cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await client.delete(`/agents/${id}/`);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      window.alert(
        err?.response?.data?.detail ?? "Couldn't delete this agent. They may have linked inventory or order history."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Agents"
        description="Onboard, verify, and monitor distribution agents."
        accent="coral"
      />

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
              {agents.map((a) => {
                const label = `${a.agent_code} — ${a.user?.first_name} ${a.user?.last_name}`;
                return (
                  <tr key={a.id}>
                    <td>{label}</td>
                    <td>{a.catchment_area}</td>
                    <td style={{ textTransform: "capitalize" }}>{a.momo_provider}</td>
                    <td style={{ textTransform: "capitalize" }}>{a.payout_method.replace("_", " ")}</td>
                    <td className="mono">{a.current_inventory_balance}</td>
                    <td className="mono">{a.total_distributed_lifetime}</td>
                    <td><span className={`badge badge-${a.verification_status === "verified" ? "verified" : "pending"}`}>{a.verification_status}</span></td>
                    <td style={{ display: "flex", gap: 8 }}>
                      {a.verification_status === "pending" && (
                        <button className="btn btn-primary" onClick={() => setStatus(a.id, "verified")}>Verify</button>
                      )}
                      {a.verification_status === "verified" && (
                        <button className="btn btn-ghost" onClick={() => setStatus(a.id, "suspended")}>Suspend</button>
                      )}
                      {a.verification_status === "suspended" && (
                        <button className="btn btn-primary" onClick={() => setStatus(a.id, "verified")}>Reinstate</button>
                      )}
                      <button
                        className="btn btn-ghost"
                        style={{ color: "var(--danger, #b3261e)" }}
                        disabled={deletingId === a.id}
                        onClick={() => deleteAgent(a.id, label)}
                      >
                        {deletingId === a.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
