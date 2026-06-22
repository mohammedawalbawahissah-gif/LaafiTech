// The platform's signature visual element: every verified claim is backed
// by photo + GPS + timestamp evidence, shown here like a small certification
// stamp rather than a plain data row -- reinforcing "verified," not just "submitted."
export default function EvidenceStamp({ photoUrl, lat, lng, locationName, timestamp }) {
  return (
    <div className="evidence-stamp">
      <img className="thumb" src={photoUrl} alt="Distribution evidence" onError={(e) => (e.target.style.visibility = "hidden")} />
      <div className="meta">
        <div className="gps">
          {locationName || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`}
        </div>
        {locationName && (
          <div className="gps mono" style={{ fontSize: 11, opacity: 0.7 }}>
            {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
          </div>
        )}
        <div className="time">{new Date(timestamp).toLocaleString()}</div>
      </div>
    </div>
  );
}
