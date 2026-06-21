import { useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

const NETWORKS = [
  { value: "mtn", label: "MTN MoMo", hint: "Payouts sent via native MoMo" },
  { value: "vodafone", label: "Vodafone Cash", hint: "Payouts routed through Hubtel" },
  { value: "airteltigo", label: "AirtelTigo Money", hint: "Payouts routed through Hubtel" },
];

export default function AgentProfile() {
  const { user, agent, refreshAgent, logout } = useAuth();
  const [network, setNetwork] = useState(agent?.momo_provider || "mtn");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: "var(--coral-tint)",
            color: "var(--coral-dark)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
          }}>
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.first_name} {user?.last_name}</div>
            <div className="sub" style={{ margin: 0 }}>{user?.phone_number} · {agent?.agent_code}</div>
          </div>
        </div>

        <div className="field">
          <label>Mobile money network</label>
          <p className="sub" style={{ margin: "0 0 10px" }}>This determines how your payouts are sent.</p>
          <div className="role-toggle">
            {NETWORKS.map((n) => (
              <button
                key={n.value}
                type="button"
                disabled={saving}
                className={`role-option${network === n.value ? " active" : ""}`}
                onClick={() => saveNetwork(n.value)}
              >
                <span className="role-option-label">{n.label}</span>
                <span className="role-option-hint">{n.hint}</span>
              </button>
            ))}
          </div>
          {message && <p className="sub" style={{ marginTop: 10 }}>{message}</p>}
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 6, width: "100%", justifyContent: "center" }} onClick={logout}>
          Log out
        </button>
      </div>
    </>
  );
}
