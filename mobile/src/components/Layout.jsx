import { useState } from "react";
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

const STORAGE_KEY = "laafitech_rail_expanded";

export default function Layout() {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isAgent = user?.role === "agent";
  const isCommunity = user?.role === "community_user";
  const nav = isAdmin ? ADMIN_NAV : isAgent ? AGENT_NAV : isCommunity ? COMMUNITY_NAV : FUNDER_NAV;

  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();
  const roleLabel = isAdmin ? "Admin" : isAgent ? "Agent" : isCommunity ? "Community" : "Funder";

  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="app-shell" style={{ gridTemplateColumns: expanded ? "212px 1fr" : "84px 1fr" }}>
      <aside className={`rail${expanded ? " expanded" : ""}`}>
        <div className="rail-brand-row">
          <div className="rail-brand" title="LaafiTech">L</div>
          {expanded && <div className="rail-wordmark">LaafiTech</div>}
        </div>

        <button
          className="rail-toggle"
          onClick={toggle}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <NavIcon name="chevron" className={expanded ? "flipped" : ""} />
          {expanded && <span>Collapse</span>}
        </button>

        <nav className="rail-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="rail-link" title={expanded ? undefined : item.title}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rail-footer">
          <div className="rail-avatar" title={user?.first_name || user?.username}>{initial}</div>
          {expanded && (
            <div className="rail-identity">
              <div className="rail-identity-name">{user?.first_name || user?.username}</div>
              <div className="rail-identity-role">{roleLabel}</div>
            </div>
          )}
          <button className="rail-logout" onClick={logout} title="Log out">
            <NavIcon name="logout" />
            {expanded && <span>Log out</span>}
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
