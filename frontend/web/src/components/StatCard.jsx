import NavIcon from "./NavIcon";

// One stat-card implementation shared by admin Dashboard, funder
// ImpactOverview, and agent AgentHome -- previously each page defined its
// own near-identical version inline. `icon` takes a NavIcon name; `accent`
// tints the icon chip to match the portal (coral/pink/moss/navy).
export default function StatCard({ label, value, sub, icon, accent = "coral", dark }) {
  return (
    <div className={`card stat-card${dark ? " stat-card-dark" : ""}`}>
      <div className="stat-card-top">
        <div className="label">{label}</div>
        {icon && (
          <div className={`icon-badge icon-badge-${dark ? "navy" : accent}`} style={dark ? { background: "rgba(244,185,194,0.18)", color: "#faeeda" } : undefined}>
            <NavIcon name={icon} />
          </div>
        )}
      </div>
      <div className="value mono">{value ?? "—"}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
