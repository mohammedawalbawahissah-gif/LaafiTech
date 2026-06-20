const FLAG_LABELS = {
  DUPLICATE_PHOTO: "Duplicate photo",
  GPS_FAR_FROM_CATCHMENT: "GPS far from catchment",
  VOLUME_SPIKE: "Unusual volume",
};

export default function AnomalyFlags({ flags }) {
  if (!flags || flags.length === 0) return <span style={{ color: "var(--ink-soft)", fontSize: 12 }}>No flags</span>;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {flags.map((f) => (
        <span key={f} className="badge badge-flagged">{FLAG_LABELS[f] || f}</span>
      ))}
    </div>
  );
}
