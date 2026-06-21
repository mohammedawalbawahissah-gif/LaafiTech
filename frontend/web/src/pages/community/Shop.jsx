import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";
import NavIcon from "../../components/NavIcon";
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
  const [messageTone, setMessageTone] = useState("info");

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
    if (!location.trim()) {
      setMessageTone("error");
      return setMessage("Enter a delivery location.");
    }
    setSubmitting(true);
    try {
      await client.post("/community/orders/", {
        product: productId,
        quantity,
        delivery_phone: user?.phone_number || "",
        delivery_location: location,
      });
      setOrderingId(null);
      setMessageTone("success");
      setMessage("Order placed — a LaafiTech admin will confirm delivery shortly.");
      load();
    } catch {
      setMessageTone("error");
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

      {message && (
        <div className={`banner banner-${messageTone}`}>
          {messageTone === "success" && <BloomMark size={20} />}
          <p>{message}</p>
        </div>
      )}

      <div className="section-head" style={{ marginTop: 0 }}>
        <h2>Available now</h2>
        {!loading && products.length > 0 && (
          <span className="count">{products.length} {products.length === 1 ? "product" : "products"}</span>
        )}
      </div>

      {!loading && products.length === 0 ? (
        <div className="card empty-state">
          <BloomMark size={40} />
          <h3>Nothing in stock yet</h3>
          <p>New sanitary products are added here as soon as they're available — check back soon.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="card product-card">
              {p.image_url ? (
                <img className="product-image" src={p.image_url} alt={p.name} />
              ) : (
                <div className="product-image-placeholder">
                  <NavIcon name="shop" />
                </div>
              )}
              <span className="product-category">{p.category.replace("_", " ")}</span>
              <div className="product-name">{p.name}</div>
              <div className="product-price">GHS {p.price}</div>
              {!p.in_stock && <p className="product-out">Out of stock</p>}

              {p.in_stock && orderingId !== p.id && (
                <button className="btn btn-primary" onClick={() => startOrder(p)}>Order</button>
              )}

              {orderingId === p.id && (
                <form onSubmit={(e) => placeOrder(e, p.id)} className="order-form">
                  <div className="field">
                    <label>Quantity</label>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                  </div>
                  <div className="field">
                    <label>Delivery location</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kumbungu, near the clinic" required />
                  </div>
                  <div className="order-form-actions">
                    <button className="btn btn-primary" disabled={submitting}>{submitting ? "Placing..." : "Confirm"}</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setOrderingId(null)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="section-head">
        <h2>My orders</h2>
        {!loading && orders.length > 0 && <span className="count">{orders.length} total</span>}
      </div>

      {!loading && orders.length === 0 ? (
        <div className="card empty-state">
          <BloomMark size={40} />
          <h3>No orders yet</h3>
          <p>Orders you place above will show up here with their delivery status.</p>
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
