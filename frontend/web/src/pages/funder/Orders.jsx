import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";
import { useAuth } from "../../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [paying, setPaying] = useState(null);
  const [payError, setPayError] = useState(null);
  const [momoPhone, setMomoPhone] = useState({});  // orderId -> phone string

  const load = () => {
    setLoading(true);
    client.get("/procurement-orders/").then((res) => setOrders(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Pre-fill phone from user profile for all momo orders
    if (user?.phone_number) {
      setMomoPhone((prev) => ({ ...prev, _default: user.phone_number }));
    }
  }, []);

  const generateReport = async (id) => {
    setGenerating(id);
    try {
      const res = await client.post(`/procurement-orders/${id}/generate-report/`);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, impact_narrative: res.data.impact_narrative } : o)));
    } finally {
      setGenerating(null);
    }
  };

  const payNow = async (order) => {
    setPaying(order.id);
    setPayError(null);
    try {
      const payPayload = { return_url: `${window.location.origin}/funder/orders` };
      if (order.payment_method === "momo_prompt") {
        const phone = momoPhone[order.id] || momoPhone._default || "";
        if (!phone) {
          setPayError("Enter your MTN MoMo phone number to pay.");
          setPaying(null);
          return;
        }
        payPayload.phone = phone;
      }

      const res = await client.post(`/procurement-orders/${order.id}/pay/`, payPayload);

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }
      if (res.data.success) {
        setPayError(null);
        load();
        return;
      }
      setPayError("Couldn't start checkout. Try again shortly.");
    } catch (err) {
      const msg = err.response?.data?.detail || "Couldn\'t start payment.";
      // 502 = payment provider rejected the call (MoMo/Hubtel config issue in this env)
      const hint = err.response?.status === 502
        ? " (Payment provider unavailable — contact support if this persists.)"
        : "";
      setPayError(msg + hint);
    } finally {
      setPaying(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Funder · Impact"
        title="My orders"
        description="Status, fulfillment, and AI-generated impact reports for your procurement orders."
        accent="coral"
      />

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {payError && <div className="auth-error" style={{ marginBottom: 16 }}>{payError}</div>}

      {!loading && orders.length === 0 && (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" color="#e8604c" />
            <h3>No orders yet</h3>
            <p>Procure a delivery to a school to see it appear here.</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((o) => (
          <div className="card" key={o.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div className="icon-badge icon-badge-coral">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="3.5" width="14" height="17" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h3.5" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontFamily: "var(--font-display)", margin: 0 }}>{o.target_school_name}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "2px 0 0" }}>
                    {o.quantity_requested} units · GHS {o.total_amount}
                    {o.payment_method && (
                      <span style={{ marginLeft: 8 }}>
                        · {o.payment_method === "momo_prompt" ? "MTN MoMo" : "Hubtel"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span className={`badge badge-${o.status === "completed" ? "verified" : o.status === "pending_payment" ? "pending" : "rejected"}`}>
                {o.status.replace(/_/g, " ")}
              </span>
            </div>

            {o.status === "pending_payment" && (
              <div style={{ marginBottom: 12 }}>
                {o.payment_method === "momo_prompt" && (
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label>MTN MoMo phone number</label>
                    <input
                      type="tel"
                      value={momoPhone[o.id] ?? momoPhone._default ?? ""}
                      onChange={(e) => setMomoPhone((prev) => ({ ...prev, [o.id]: e.target.value }))}
                      placeholder="e.g. 0244000000"
                      style={{ maxWidth: 220 }}
                    />
                  </div>
                )}
                <button className="btn btn-primary" disabled={paying === o.id} onClick={() => payNow(o)}>
                  {paying === o.id
                    ? "Starting payment..."
                    : o.payment_method === "momo_prompt"
                    ? "Send MoMo prompt"
                    : "Pay now"}
                </button>
              </div>
            )}

            {o.impact_narrative ? (
              <div className="narrative-block">{o.impact_narrative}</div>
            ) : (
              <button className="btn btn-ghost" disabled={generating === o.id} onClick={() => generateReport(o.id)}>
                {generating === o.id ? "Generating..." : "Generate impact report"}
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
