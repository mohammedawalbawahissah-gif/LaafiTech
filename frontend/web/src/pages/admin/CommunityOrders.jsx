import { useEffect, useState, useCallback } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

function orderBadge(status) {
  if (status === "fulfilled") return "badge-verified";
  if (status === "cancelled") return "badge-flagged";
  return "badge-pending";
}

function payBadge(status) {
  if (status === "paid") return "badge-verified";
  if (status === "failed") return "badge-flagged";
  return "badge-pending";
}

export default function CommunityOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.payment_status = paymentFilter;
    client
      .get("/community/orders/", { params })
      .then((res) => setOrders(res.data.results ?? res.data))
      .catch(() => setError("Couldn't load orders."))
      .finally(() => setLoading(false));
  }, [statusFilter, paymentFilter]);

  useEffect(load, [load]);

  const setStatus = async (orderId, status) => {
    setActionId(`${orderId}-${status}`);
    setError(null);
    try {
      await client.post(`/community/orders/${orderId}/set_status/`, { status });
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status,
            payment_status:
              status === "fulfilled" && o.payment_method === "cash_on_delivery"
                ? "paid"
                : o.payment_status,
          };
        })
      );
      if (expanded?.id === orderId) {
        setExpanded((prev) => ({
          ...prev,
          status,
          payment_status:
            status === "fulfilled" && prev.payment_method === "cash_on_delivery"
              ? "paid"
              : prev.payment_status,
        }));
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Couldn't update order status.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin · Community"
        title="Community Orders"
        description="Manage shop orders — fulfil, cancel, and track payments."
        accent="coral"
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <select
          className="field"
          style={{ margin: 0, padding: "8px 12px", fontSize: 13 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="field"
          style={{ margin: 0, padding: "8px 12px", fontSize: 13 }}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All payment statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <button className="btn btn-ghost" onClick={load}>Refresh</button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && orders.length === 0 && (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No orders found</h3>
            <p>Adjust your filters or check back when customers place orders.</p>
          </div>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.id}>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "2px 8px", fontSize: 12 }}
                        onClick={() => setExpanded(expanded?.id === o.id ? null : o)}
                      >
                        #{o.id}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.user_name || o.user_email || "—"}</div>
                      <div className="sub">{o.delivery_phone}</div>
                    </td>
                    <td className="mono">{o.items?.length ?? "—"}</td>
                    <td className="mono">GHS {parseFloat(o.total_amount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${payBadge(o.payment_status)}`}>{o.payment_status}</span>
                      <div className="sub" style={{ marginTop: 2 }}>
                        {o.payment_method === "momo_prompt" ? "MoMo" : o.payment_method === "hubtel_checkout" ? "Hubtel" : "COD"}
                      </div>
                    </td>
                    <td><span className={`badge ${orderBadge(o.status)}`}>{o.status}</span></td>
                    <td style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      {o.status !== "fulfilled" && o.status !== "cancelled" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: "5px 10px", fontSize: 12 }}
                            disabled={actionId === `${o.id}-fulfilled`}
                            onClick={() => setStatus(o.id, "fulfilled")}
                          >
                            {actionId === `${o.id}-fulfilled` ? "..." : "Fulfil"}
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "5px 10px", fontSize: 12, color: "var(--danger)" }}
                            disabled={actionId === `${o.id}-cancelled`}
                            onClick={() => {
                              if (window.confirm(`Cancel order #${o.id}?`))
                                setStatus(o.id, "cancelled");
                            }}
                          >
                            {actionId === `${o.id}-cancelled` ? "..." : "Cancel"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {expanded?.id === o.id && (
                    <tr key={`${o.id}-detail`}>
                      <td colSpan={8} style={{ background: "var(--surface-sunken)", padding: "12px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px 24px", marginBottom: 12 }}>
                          <div><span className="label">Address</span><div>{o.delivery_address || "—"}</div></div>
                          <div><span className="label">Phone</span><div>{o.delivery_phone || "—"}</div></div>
                          <div><span className="label">Payment method</span><div style={{ textTransform: "capitalize" }}>{(o.payment_method || "—").replace(/_/g, " ")}</div></div>
                          <div><span className="label">Placed</span><div>{o.created_at ? new Date(o.created_at).toLocaleString() : "—"}</div></div>
                        </div>
                        {o.items?.length > 0 && (
                          <table style={{ fontSize: 13 }}>
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Unit price</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((item, i) => (
                                <tr key={i}>
                                  <td>{item.product_name || item.product || "—"}</td>
                                  <td className="mono">{item.quantity}</td>
                                  <td className="mono">GHS {parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                  <td className="mono">GHS {parseFloat(item.subtotal || item.quantity * (item.unit_price || 0)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
