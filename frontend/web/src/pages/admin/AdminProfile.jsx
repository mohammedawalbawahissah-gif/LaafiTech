import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import ProfileFields from "../../components/ProfileFields";

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();
  const roleLabel = user?.role === "superadmin" ? "Super Admin" : "Admin";

  return (
    <>
      <PageHeader eyebrow="Admin · Platform" title="Profile" accent="coral" />

      <div className="card profile-card">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: "var(--coral-tint)",
            color: "var(--coral-dark)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
          }}>
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.first_name} {user?.last_name}</div>
            <div className="sub" style={{ margin: 0 }}>{user?.phone_number} · {roleLabel}</div>
          </div>
        </div>

        <ProfileFields showLocation />

        <div className="banner banner-info" style={{ marginBottom: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Role and phone number can only be changed by a superadmin via the Django admin panel.
        </div>

        <button
          className="btn btn-ghost"
          style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
          onClick={logout}
        >
          Log out
        </button>
      </div>
    </>
  );
}
