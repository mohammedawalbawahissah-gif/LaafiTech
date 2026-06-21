import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

function badgeClass(status) {
  if (status === "fulfilled") return "badge-verified";
  if (status === "cancelled") return "badge-flagged";
  return "badge-pending";
}

export default function Shop() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderingId, setOrderingId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([client.get("/community/products/"), client.get("/community/orders/")])
      .then(([prodRes, orderRes]) => {
        setProducts(prodRes.data.results ?? prodRes.data);
        setOrders(orderRes.data.results ?? orderRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startOrder = (product) => {
    setOrderingId(product.id);
    setQuantity(1);
    setLocation("");
    setMessage("");
  };

  const placeOrder = async (e, productId) => {
    e.preventDefault();
    if (!location.trim()) return setMessage("Enter a delivery location.");
    setSubmitting(true);
    try {
      await client.post("/community/orders/", {
        product: productId,
        quantity,
        delivery_phone: user?.phone_number || "",
        delivery_location: location,
      });
      setOrderingId(null);
      setMessage("Order placed — a LaafiTech admin will confirm delivery shortly.");
      load();
    } catch {
      setMessage("Couldn't place the order. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Shop"
        description="Order sanitary products for delivery."
        accent="pink"
      />

      {message && <div className="card" style={{ marginBottom: 16 }}><p className="sub" style={{ margin: 0 }}>{message}</p></div>}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {products.map((p) => (
          <div key={p.id} className="card stat-card">
            {p.image_url && (
              <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
            )}
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div className="sub" style={{ textTransform: "capitalize" }}>{p.category.replace("_", " ")}</div>
            <div className="value mono" style={{ fontSize: 18, margin: "8px 0" }}>GHS {p.price}</div>
            {!p.in_stock && <p className="sub">Out of stock</p>}

            {p.in_stock && orderingId !== p.id && (
              <button className="btn btn-primary" onClick={() => startOrder(p)}>Order</button>
            )}

            {orderingId === p.id && (
              <form onSubmit={(e) => placeOrder(e, p.id)} style={{ marginTop: 8 }}>
                <div className="field">
                  <label>Quantity</label>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Delivery location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kumbungu, near the clinic" required />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" disabled={submitting}>{submitting ? "Placing..." : "Confirm order"}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setOrderingId(null)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        ))}
        {!loading && products.length === 0 && (
          <p className="sub">No products available yet — check back soon.</p>
        )}
      </div>

      <h3 style={{ marginTop: 28 }}>My orders</h3>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Delivery</th>
              <th>Status</th>
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
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={5} className="empty-state">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
