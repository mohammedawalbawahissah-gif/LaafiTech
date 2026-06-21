import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";

const RECIPIENT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "school", label: "School" },
  { value: "community_group", label: "Community group" },
];

const PAYMENT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "momo", label: "Mobile money" },
  { value: "subsidized", label: "Subsidized" },
  { value: "free", label: "Free (funded)" },
];

// Placeholder upload: in production this should perform an unsigned upload
// directly to Cloudinary (see CLOUDINARY_URL on the backend) and return the
// resulting secure_url. Mirrors the same placeholder used in the mobile app.
async function uploadPhoto(file) {
  return URL.createObjectURL(file);
}

export default function AgentLogDistribution() {
  const { refreshAgent } = useAuth();
  const navigate = useNavigate();

  const [recipientType, setRecipientType] = useState("individual");
  const [school, setSchool] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");
  const [paymentType, setPaymentType] = useState("cash");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const captureLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location capture.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. Check browser permissions and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!quantity || Number(quantity) <= 0) return setError("Enter a valid quantity.");
    if (!location) return setError("Capture your location before submitting.");
    if (!photoFile) return setError("Attach a proof-of-distribution photo before submitting.");

    setSubmitting(true);
    try {
      const photoUrl = await uploadPhoto(photoFile);

      // Note: no `agent` field is sent — the backend forces this record
      // onto the logged-in agent's own profile server-side.
      await client.post("/distributions/", {
        recipient_type: recipientType,
        school: recipientType === "school" ? school || null : null,
        quantity: Number(quantity),
        unit_price: Number(unitPrice) || 0,
        payment_type: paymentType,
        gps_lat: location.lat,
        gps_lng: location.lng,
        photo_url: photoUrl,
        notes,
      });

      await refreshAgent();
      navigate("/agent");
    } catch (err) {
      const detail = err.response?.data;
      setError(
        detail
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" — ")
          : "Couldn't submit. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Agent · Field Ops"
        title="Log a distribution"
        description="Photo and GPS are required for verification."
        accent="coral"
      />

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div className="card-title">
          <div className="icon-badge icon-badge-coral">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
              <path d="M9 8.5h6M12 13v3.5M10.3 14.7h3.4" />
            </svg>
          </div>
          <h3>Distribution details</h3>
        </div>
        <div className="field">
          <label htmlFor="recipient_type">Recipient type</label>
          <select id="recipient_type" value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
            {RECIPIENT_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 10" required />
          </div>
          <div className="field">
            <label htmlFor="unit_price">Unit price (GHS)</label>
            <input id="unit_price" type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="payment_type">Payment type</label>
          <select id="payment_type" value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            {PAYMENT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context for the reviewer" />
        </div>

        <div className="field">
          <label>Location</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={captureLocation} disabled={locating}>
              {locating ? "Locating..." : location ? "Recapture location" : "Capture location"}
            </button>
            {location && (
              <span className="sub mono">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="photo">Proof photo</label>
          {photoPreview && (
            <img src={photoPreview} alt="Proof preview" style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
          )}
          <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit distribution"}
        </button>
      </form>
    </>
  );
}
