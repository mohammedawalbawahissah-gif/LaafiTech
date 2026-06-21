import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";
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
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

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
    setMessage(null);
  };

  const placeOrder = async (e, productId) => {
    e.preventDefault();
    if (!location.trim()) return setMessage({ type: "error", text: "Enter a delivery location." });
    setSubmitting(true);
    try {
      await client.post("/community/orders/", {
        product: productId,
        quantity,
        delivery_phone: user?.phone_number || "",
        delivery_location: location,
      });
      setOrderingId(null);
      setMessage({ type: "success", text: "Order placed — a LaafiTech admin will confirm delivery shortly." });
      load();
    } catch {
      setMessage({ type: "error", text: "Couldn't place the order. Check your connection and try again." });
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

      {message && (
        <div className={message.type === "success" ? "banner banner-success" : "auth-error"}>
          {message.type === "success" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12.5 2.5 2.5L16 9.5" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      <div className="section-head">
        <div className="icon-badge icon-badge-pink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5 4.8 4h14.4l1.3 4.5" />
            <path d="M3.5 8.5h17v9.8a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7z" />
            <path d="M8.3 8.5v2a3.7 3.7 0 0 0 7.4 0v-2" />
          </svg>
        </div>
        <div>
          <h3>Products</h3>
          <p className="sub">Paid via MoMo or Hubtel on confirmation.</p>
        </div>
      </div>

      {!loading && products.length === 0 ? (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No products available yet</h3>
            <p>Check back soon — new stock is added regularly.</p>
          </div>
        </div>
      ) : (
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", marginBottom: 28 }}>
          {products.map((p) => (
            <div key={p.id} className="card product-card">
              <div className="product-card-media">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} />
                ) : (
                  <BloomMark className="bloom-mark" />
                )}
                {!p.in_stock && <div className="product-card-out">Out of stock</div>}
              </div>
              <div className="product-card-body">
                <span className="product-pill">{p.category.replace("_", " ")}</span>
                <h4 className="product-card-name">{p.name}</h4>
                <div className="product-card-price">GHS {p.price}</div>

                <div className="product-card-footer">
                  {p.in_stock && orderingId !== p.id && (
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => startOrder(p)}>Order</button>
                  )}

                  {orderingId === p.id && (
                    <form onSubmit={(e) => placeOrder(e, p.id)}>
                      <div className="field">
                        <label>Quantity</label>
                        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <label>Delivery location</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kumbungu, near the clinic" required />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-primary" disabled={submitting}>{submitting ? "Placing..." : "Confirm"}</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setOrderingId(null)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-head">
        <div className="icon-badge icon-badge-pink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3.5" width="14" height="17" rx="2" />
            <path d="M9 8h6M9 12h6M9 16h3.5" />
          </svg>
        </div>
        <div>
          <h3>My orders</h3>
          <p className="sub">{orders.length} order{orders.length === 1 ? "" : "s"} placed</p>
        </div>
      </div>

      {!loading && orders.length === 0 ? (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No orders yet</h3>
            <p>Orders you place above will show up here with delivery status.</p>
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
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
