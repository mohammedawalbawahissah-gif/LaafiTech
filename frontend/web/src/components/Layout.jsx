import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AssistantWidget from "./AssistantWidget";
import NavIcon from "./NavIcon";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", title: "Dashboard", end: true },
  { to: "/admin/verification-queue", label: "Verify", icon: "verify", title: "Verification Queue" },
  { to: "/admin/agents", label: "Agents", icon: "agents", title: "Agents" },
  { to: "/admin/inventory", label: "Stock", icon: "inventory", title: "Inventory" },
  { to: "/admin/products", label: "Products", icon: "shop", title: "Products" },
  { to: "/admin/payouts", label: "Payouts", icon: "payouts", title: "Payouts" },
  { to: "/admin/schools", label: "Schools", icon: "schools", title: "Schools & Need Scores" },
];

const FUNDER_NAV = [
  { to: "/funder", label: "Impact", icon: "impact", title: "Impact Overview", end: true },
  { to: "/funder/deliveries", label: "Deliveries", icon: "deliveries", title: "Verified Deliveries" },
  { to: "/funder/procure", label: "Procure", icon: "procure", title: "Procure Deliveries" },
  { to: "/funder/orders", label: "Orders", icon: "orders", title: "My Orders" },
  { to: "/funder/profile", label: "Profile", icon: "profile", title: "Profile" },
];

const AGENT_NAV = [
  { to: "/agent", label: "Home", icon: "home", title: "Home", end: true },
  { to: "/agent/log", label: "Log", icon: "log", title: "Log Distribution" },
  { to: "/agent/inventory", label: "Stock", icon: "inventory", title: "Inventory" },
  { to: "/agent/products", label: "Products", icon: "shop", title: "Products" },
  { to: "/agent/earnings", label: "Earnings", icon: "earnings", title: "Earnings" },
  { to: "/agent/history", label: "History", icon: "history", title: "History" },
  { to: "/agent/profile", label: "Profile", icon: "profile", title: "Profile" },
];

const COMMUNITY_NAV = [
  { to: "/community", label: "Home", icon: "home", title: "Home", end: true },
  { to: "/community/tracker", label: "Tracker", icon: "tracker", title: "Cycle Tracker" },
  { to: "/community/shop", label: "Shop", icon: "shop", title: "Shop" },
  { to: "/community/profile", label: "Profile", icon: "profile", title: "Profile" },
];

const STORAGE_KEY = "laafitech.rail.expanded";

// On mobile, show max 5 tabs; overflow items go into a "More" sheet.
// For navs with ≤5 items no overflow is needed.
const MOBILE_MAX = 5;

export default function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isAgent = user?.role === "agent";
  const isCommunity = user?.role === "community_user";
  const nav = isAdmin ? ADMIN_NAV : isAgent ? AGENT_NAV : isCommunity ? COMMUNITY_NAV : FUNDER_NAV;

  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });

  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0"); } catch { /* ignore */ }
  }, [expanded]);

  // Close more sheet on route change
  useEffect(() => { setMoreOpen(false); }, []);

  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();
  const roleLabel = isAdmin ? "Admin" : isAgent ? "Agent" : isCommunity ? "Member" : "Funder";

  const visibleTabs = nav.length <= MOBILE_MAX ? nav : nav.slice(0, MOBILE_MAX - 1);
  const overflowTabs = nav.length <= MOBILE_MAX ? [] : nav.slice(MOBILE_MAX - 1);
  const hasOverflow = overflowTabs.length > 0;

  return (
    <div className={`app-shell${expanded ? " rail-expanded" : ""}`}>
      {/* ── Desktop sidebar rail ── */}
      <aside className={`rail${expanded ? " expanded" : ""}`}>
        <div className="rail-top">
          <div className="rail-brand" title="LaafiTech">L</div>
          <button
            className="rail-toggle"
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <NavIcon name="chevron" />
          </button>
        </div>
        <nav className="rail-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="rail-link" title={item.title}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="rail-footer">
          <div className="rail-identity">
            <div className="rail-avatar" title={user?.first_name || user?.username}>{initial}</div>
            <div className="rail-identity-text">
              <span className="rail-identity-name">{user?.first_name || user?.username}</span>
              <span className="rail-identity-role">{roleLabel}</span>
            </div>
          </div>
          <button className="rail-logout" onClick={logout} title="Log out">
            <NavIcon name="logout" />
          </button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <main className="main">
        {/* Mobile top bar */}
        <header className="mobile-topbar">
          <div className="mobile-topbar-brand">
            <div className="rail-brand" style={{ width: 28, height: 28, fontSize: 12 }}>L</div>
            <span className="mobile-topbar-title">LaafiTech</span>
          </div>
          <div className="mobile-topbar-right">
            <div className="rail-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initial}</div>
            <button className="rail-logout" onClick={logout} title="Log out" style={{ width: 28, height: 28 }}>
              <NavIcon name="logout" />
            </button>
          </div>
        </header>

        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-tab-bar">
        {visibleTabs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="bottom-tab"
            title={item.title}
            onClick={() => setMoreOpen(false)}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {hasOverflow && (
          <button
            className={`bottom-tab bottom-tab-more${moreOpen ? " active" : ""}`}
            onClick={() => setMoreOpen((o) => !o)}
            aria-label="More"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" />
            </svg>
            <span>More</span>
          </button>
        )}
      </nav>

      {/* ── More sheet (overflow nav items + logout) ── */}
      {moreOpen && (
        <div className="more-sheet-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="more-sheet-handle" />
            {overflowTabs.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="more-sheet-item"
                onClick={() => setMoreOpen(false)}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button className="more-sheet-item more-sheet-logout" onClick={logout}>
              <NavIcon name="logout" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      <AssistantWidget role={user?.role} />
    </div>
  );
}
