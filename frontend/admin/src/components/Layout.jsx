import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/verification-queue", label: "Verification Queue" },
  { to: "/agents", label: "Agents" },
  { to: "/inventory", label: "Inventory" },
  { to: "/payouts", label: "Payouts" },
  { to: "/schools", label: "Schools & Need Scores" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="dot" />LaafiTech Admin</div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
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
