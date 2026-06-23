import { useEffect, useRef, useState } from "react";
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

const EMPTY_FORM = { name: "", description: "", category: "pads", price: "", in_stock: true };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    client.get("/community/products/")
      .then((res) => setProducts(res.data.results ?? res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append("image", imageFile);

      await client.post("/community/products/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      resetForm();
      setShowForm(false);
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

  const toggleStock = async (p) => {
    await client.patch(`/community/products/${p.id}/`, { in_stock: !p.in_stock });
    load();
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove "${p.name}" from the shop?`)) return;
    await client.delete(`/community/products/${p.id}/`);
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin · Operations"
        title="Products"
        description="Manage what's for sale in the community shop."
        accent="coral"
        action={
          <button className="btn btn-primary" onClick={() => { setShowForm((s) => !s); if (showForm) resetForm(); }}>
            {showForm ? "Cancel" : "Add product"}
          </button>
        }
      />

      {showForm && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 640 }}>
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
            <label htmlFor="prod_name">Name</label>
            <input id="prod_name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Laafi Comfort Pads (Pack of 10)" />
          </div>

          <div className="field">
            <label htmlFor="prod_desc">Description</label>
            <textarea id="prod_desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details for shoppers" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div className="field">
              <label htmlFor="prod_cat">Category</label>
              <select id="prod_cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="prod_price">Price (GHS)</label>
              <input id="prod_price" required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
          </div>

          {/* Image upload */}
          <div className="field">
            <label>Product image (optional)</label>
            <div
              className="product-image-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed var(--line)",
                borderRadius: "var(--radius)",
                padding: "20px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: "var(--bg)",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
            >
              {imagePreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{imageFile?.name}</div>
                    <div className="sub">{(imageFile?.size / 1024).toFixed(1)} KB · Click to change</div>
                  </div>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32" style={{ marginBottom: 8 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Click to choose an image from your computer</div>
                  <div className="sub">JPG, PNG or WebP · max 5 MB</div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} />
            In stock
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={saving}>
              {saving ? "Saving..." : "Save product"}
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { resetForm(); setShowForm(false); }} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      )}

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--coral-tint)", flexShrink: 0 }} />
                    )}
                    {p.name}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{p.category.replace("_", " ")}</td>
                  <td className="mono">GHS {p.price}</td>
                  <td>
                    <span className={`badge ${p.in_stock ? "badge-verified" : "badge-flagged"}`}>
                      {p.in_stock ? "In stock" : "Out of stock"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost" onClick={() => toggleStock(p)}>
                      {p.in_stock ? "Mark out of stock" : "Mark in stock"}
                    </button>
                    <button className="btn btn-ghost" onClick={() => remove(p)}>Remove</button>
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
