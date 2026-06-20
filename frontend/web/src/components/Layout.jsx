import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/verification-queue", label: "Verification Queue" },
  { to: "/admin/agents", label: "Agents" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/payouts", label: "Payouts" },
  { to: "/admin/schools", label: "Schools & Need Scores" },
];

const FUNDER_NAV = [
  { to: "/funder", label: "Impact Overview", end: true },
  { to: "/funder/deliveries", label: "Verified Deliveries" },
  { to: "/funder/procure", label: "Procure Deliveries" },
  { to: "/funder/orders", label: "My Orders" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const nav = isAdmin ? ADMIN_NAV : FUNDER_NAV;
  const brand = isAdmin ? "LaafiTech Admin" : "LaafiTech";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="dot" />{brand}</div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8 }}>{user?.first_name || user?.username}</div>
          <button className="btn btn-ghost" style={{ color: "#cfe4e0", borderColor: "rgba(255,255,255,0.2)" }} onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
