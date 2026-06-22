import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomMark from "../../components/BloomMark";

const CATEGORIES = [
  { value: "pads", label: "Sanitary Pads" },
  { value: "tampons", label: "Tampons" },
  { value: "cups", label: "Menstrual Cups" },
  { value: "hygiene", label: "Hygiene Essentials" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM = { name: "", description: "", category: "pads", price: "", image_url: "" };

export default function AgentProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    client.get("/community/products/").then((res) => setProducts(res.data.results ?? res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await client.post("/community/products/", form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setMessage("Product added — it's now visible in the community shop.");
      load();
    } catch (err) {
      const detail = err.response?.data;
      setError(
        detail
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
          : "Couldn't save the product. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Agent · Field Ops"
        title="Products"
        description="Add new products to the community shop."
        accent="coral"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add product"}
          </button>
        }
      />

      {message && <div className="banner banner-success">{message}</div>}

      {showForm && (
        <form className="card" style={{ marginBottom: 20, maxWidth: 640 }} onSubmit={submit}>
          <div className="card-title">
            <div className="icon-badge icon-badge-coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8.5 4.8 4h14.4l1.3 4.5" />
                <path d="M3.5 8.5h17v9.8a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7z" />
                <path d="M8.3 8.5v2a3.7 3.7 0 0 0 7.4 0v-2" />
              </svg>
            </div>
            <h3>New product</h3>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}

          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laafi Comfort Pads (Pack of 10)" />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details for shoppers" />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="price">Price (GHS)</label>
              <input id="price" required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="image_url">Image URL (optional)</label>
            <input id="image_url" type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>

          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save product"}</button>
        </form>
      )}

      <div className="section-head">
        <div className="icon-badge icon-badge-coral">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5 4.8 4h14.4l1.3 4.5" />
            <path d="M3.5 8.5h17v9.8a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7z" />
            <path d="M8.3 8.5v2a3.7 3.7 0 0 0 7.4 0v-2" />
          </svg>
        </div>
        <div>
          <h3>Current shop listing</h3>
          <p className="sub">Editing or removing a listing requires a LaafiTech admin.</p>
        </div>
      </div>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading...</p>}

      {!loading && products.length === 0 && (
        <div className="card">
          <div className="empty-state-rich">
            <BloomMark className="bloom-mark" />
            <h3>No products yet</h3>
            <p>Add a product above to make it available in the community shop.</p>
          </div>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.category.replace("_", " ")}</td>
                  <td className="mono">GHS {p.price}</td>
                  <td>
                    <span className={`badge ${p.in_stock ? "badge-verified" : "badge-flagged"}`}>
                      {p.in_stock ? "In stock" : "Out of stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
