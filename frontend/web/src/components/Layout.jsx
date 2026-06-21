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
  { to: "/admin/payouts", label: "Payouts", icon: "payouts", title: "Payouts" },
  { to: "/admin/schools", label: "Schools", icon: "schools", title: "Schools & Need Scores" },
];

const FUNDER_NAV = [
  { to: "/funder", label: "Impact", icon: "impact", title: "Impact Overview", end: true },
  { to: "/funder/deliveries", label: "Deliveries", icon: "deliveries", title: "Verified Deliveries" },
  { to: "/funder/procure", label: "Procure", icon: "procure", title: "Procure Deliveries" },
  { to: "/funder/orders", label: "Orders", icon: "orders", title: "My Orders" },
];

const AGENT_NAV = [
  { to: "/agent", label: "Home", icon: "home", title: "Home", end: true },
  { to: "/agent/log", label: "Log", icon: "log", title: "Log Distribution" },
  { to: "/agent/inventory", label: "Stock", icon: "inventory", title: "Inventory" },
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

export default function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isAgent = user?.role === "agent";
  const isCommunity = user?.role === "community_user";
  const nav = isAdmin ? ADMIN_NAV : isAgent ? AGENT_NAV : isCommunity ? COMMUNITY_NAV : FUNDER_NAV;

  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0");
    } catch {
      /* ignore storage errors (private browsing, etc.) */
    }
  }, [expanded]);

  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();
  const roleLabel = isAdmin ? "Admin" : isAgent ? "Agent" : isCommunity ? "Member" : "Funder";

  return (
    <div className={`app-shell${expanded ? " rail-expanded" : ""}`}>
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
      <main className="main">
        <Outlet />
      </main>
      <AssistantWidget role={user?.role} />
    </div>
  );
}
