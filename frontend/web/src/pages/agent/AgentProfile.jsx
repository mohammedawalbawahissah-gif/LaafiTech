import { useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

const NETWORKS = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "vodafone", label: "Vodafone Cash" },
  { value: "airteltigo", label: "AirtelTigo Money" },
];

export default function AgentProfile() {
  const { user, agent, refreshAgent, logout } = useAuth();
  const [network, setNetwork] = useState(agent?.momo_provider || "mtn");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const saveNetwork = async (value) => {
    setNetwork(value);
    setMessage("");
    if (!agent) return;
    setSaving(true);
    try {
      // Payout routing (native MoMo vs Hubtel) on the backend is derived
      // automatically from this field.
      await client.patch(`/agents/${agent.id}/`, { momo_provider: value });
      await refreshAgent();
    } catch {
      setMessage("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Agent · Field Ops" title="Profile" accent="coral" />

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.first_name} {user?.last_name}</div>
          <div className="sub">{user?.phone_number}</div>
          <div className="sub">{agent?.agent_code}</div>
        </div>

        <div className="field">
          <label>Mobile money network</label>
          <p className="sub" style={{ margin: "0 0 10px" }}>This determines how your payouts are sent.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {NETWORKS.map((n) => (
              <button
                key={n.value}
                type="button"
                disabled={saving}
                className={`btn ${network === n.value ? "btn-primary" : "btn-ghost"}`}
                onClick={() => saveNetwork(n.value)}
              >
                {n.label}
              </button>
            ))}
          </div>
          {message && <p className="sub" style={{ marginTop: 10 }}>{message}</p>}
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={logout}>
          Log out
        </button>
      </div>
    </>
  );
}
