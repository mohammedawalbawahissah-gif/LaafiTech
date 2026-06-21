import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  const load = () => {
    setLoading(true);
    client.get("/procurement-orders/").then((res) => setOrders(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const generateReport = async (id) => {
    setGenerating(id);
    try {
      const res = await client.post(`/procurement-orders/${id}/generate-report/`);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, impact_narrative: res.data.impact_narrative } : o)));
    } finally {
      setGenerating(null);
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

      {!loading && orders.length === 0 && (
        <div className="card empty-state">
          <h3>No orders yet</h3>
          <p>Procure a delivery to a school to see it appear here.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((o) => (
          <div className="card" key={o.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 16 }}>{o.target_school_name}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "2px 0 0" }}>
                  {o.quantity_requested} units · GHS {o.total_amount}
                </p>
              </div>
              <span className={`badge badge-${o.status === "completed" ? "verified" : o.status === "pending_payment" ? "pending" : "rejected"}`}>
                {o.status.replace("_", " ")}
              </span>
            </div>

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
