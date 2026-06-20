const LABELS = {
  pending: "Pending",
  verified: "Verified",
  flagged: "Flagged",
  rejected: "Rejected",
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}
