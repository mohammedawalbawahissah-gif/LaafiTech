import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

function badgeClass(status) {
  if (status === "confirmed" || status === "fulfilled") return "badge-verified";
  if (status === "cancelled") return "badge-flagged";
  return "badge-pending";
}

function paymentBadgeClass(status) {
  if (status === "paid") return "badge-verified";
  if (status === "failed") return "badge-flagged";
  return "badge-pending";
}

const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Cash on delivery" },
  { value: "momo_prompt", label: "MTN MoMo (USSD prompt)" },
  { value: "hubtel_checkout", label: "Card / bank / other MoMo (Hubtel)" },
];

export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderingId, setOrderingId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  const load = () => {
    setLoading(true);
    Promise.all([
      client.get("/community/products/").then((r) => setProducts(r.data.results ?? r.data)),
      client.get("/community/orders/").then((r) => setOrders(r.data.results ?? r.data)),
    ]).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startOrder = (product) => {
    setOrderingId(product.id);
    setQuantity(1);
    setLocation("");
    setPhone(user?.phone_number || "");
    setPaymentMethod("cash_on_delivery");
    setMessage(null);
  };

  const handleOrder = async (e, productId) => {
    e.preventDefault();
    if (!location.trim()) return setMessage({ type: "error", text: "Enter a delivery location." });
    const deliveryPhone = phone.trim() || user?.phone_number || "";
    if (!deliveryPhone) return setMessage({ type: "error", text: "Enter a phone number for delivery confirmation." });

    setSubmitting(true);
    try {
      const orderRes = await client.post("/community/orders/", {
        product: productId,
        quantity,
        delivery_phone: deliveryPhone,
        delivery_location: location,
        payment_method: paymentMethod,
      });

      if (paymentMethod === "cash_on_delivery") {
        setOrderingId(null);
        setMessage({ type: "success", text: "Order placed — pay the agent in cash when it's delivered." });
        load();
        return;
      }

      const order = orderRes.data;
      let payRes;
      try {
        const payBody = {};
        if (paymentMethod === "momo_prompt") {
          payBody.phone = (phone.trim()) || user?.phone_number || "";
        }
        if (paymentMethod === "hubtel_checkout") {
          payBody.return_url = window.location.origin + "/community/shop";
        }
        payRes = await client.post(`/community/orders/${order.id}/pay/`, payBody);
      } catch (payErr) {
        const detail = payErr.response?.data;
        const msg = detail
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
          : "Order placed, but starting payment failed. Try paying again from your orders below.";
        setMessage({ type: "error", text: msg });
        load();
        setSubmitting(false);
        return;
      }

      if (payRes.data.checkout_url) {
        // Hubtel hosted checkout (card/bank/other MoMo) — hand off the browser.
        window.location.href = payRes.data.checkout_url;
        return;
      }
      if (payRes.data.success) {
        setOrderingId(null);
        setMessage({ type: "success", text: "Order placed — approve the MoMo prompt on your phone to complete payment." });
      } else {
        setMessage({ type: "error", text: payRes.data.error || "Order placed, but starting payment failed. Try paying again from your orders below." });
      }
      load();
    } catch (err) {
      const detail = err.response?.data;
      const msg = detail
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
        : "Couldn't place the order. Check your connection and try again.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const retryPayment = async (order) => {
    setMessage(null);
    try {
      const payBody = {};
      if (order.payment_method === "momo_prompt") {
        payBody.phone = user?.phone_number || order.delivery_phone || phone;
      }
      if (order.payment_method === "hubtel_checkout") {
        payBody.return_url = window.location.origin + "/community/shop";
      }
      const payRes = await client.post(`/community/orders/${order.id}/pay/`, payBody);
      if (payRes.data.checkout_url) {
        window.location.href = payRes.data.checkout_url;
        return;
      }
      if (payRes.data.success) {
        setMessage({ type: "success", text: "Approve the MoMo prompt on your phone to complete payment." });
      } else {
        setMessage({ type: "error", text: payRes.data.error || "Couldn't start payment. Try again shortly." });
      }
      load();
    } catch (err) {
      const detail = err.response?.data;
      setMessage({ type: "error", text: detail?.detail || "Couldn't start payment. Check your connection and try again." });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community · Shop"
        title="Shop"
        description="Pay by MoMo prompt, card/bank via Hubtel, or cash on delivery."
        accent="coral"
      />

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {message && (
        <div className={message.type === "error" ? "auth-error" : "auth-success"} style={{ marginBottom: 16 }}>
          {message.text}
        </div>
      )}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3>Products</h3>
                <p className="sub">Pay by MoMo prompt, card/bank via Hubtel, or cash on delivery.</p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="card">
                <div className="empty-state-rich">
                  <BloomMark className="bloom-mark" />
                  <h3>No products yet</h3>
                  <p>Check back soon.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                {products.map((p) => (
                  <div className="card" key={p.id}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div className="sub" style={{ marginBottom: 8 }}>{p.description}</div>
                    <div className="mono" style={{ marginBottom: 12 }}>GHS {p.price}</div>

                    {orderingId === p.id ? (
                      <form onSubmit={(e) => handleOrder(e, p.id)}>
                        <div className="field">
                          <label>Quantity</label>
                          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
                        </div>
                        <div className="field">
                          <label>Phone number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 0244000000"
                            required
                          />
                        </div>
                        <div className="field">
                          <label>Delivery location</label>
                          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kumbungu, near the clinic" required />
                        </div>
                        <div className="field">
                          <label>Payment method</label>
                          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Placing..." : paymentMethod === "cash_on_delivery" ? "Confirm" : "Confirm & pay"}
                          </button>
                          <button type="button" className="btn btn-ghost" onClick={() => setOrderingId(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button className="btn btn-primary" onClick={() => startOrder(p)}>Order</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: 12 }}>My orders</h3>
            {orders.length === 0 ? (
              <div className="card">
                <div className="empty-state-rich">
                  <BloomMark className="bloom-mark" />
                  <h3>No orders yet</h3>
                  <p>Place an order above.</p>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Delivery</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.product_name}</td>
                        <td className="mono">{o.quantity}</td>
                        <td className="mono">GHS {o.total_price}</td>
                        <td>{o.delivery_location}</td>
                        <td><span className={`badge ${badgeClass(o.status)}`}>{o.status}</span></td>
                        <td>
                          <span className={`badge ${paymentBadgeClass(o.payment_status)}`}>{o.payment_status.replace(/_/g, " ")}</span>
                          {(o.payment_status === "pending" || o.payment_status === "failed") && (
                            <button className="btn btn-ghost" style={{ marginLeft: 8, padding: "2px 10px" }} onClick={() => retryPayment(o)}>
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
