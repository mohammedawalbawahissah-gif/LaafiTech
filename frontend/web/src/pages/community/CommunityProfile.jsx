import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import ProfileFields from "../../components/ProfileFields";

export default function CommunityProfile() {
  const { user, logout } = useAuth();
  const initial = (user?.first_name || user?.username || "?").charAt(0).toUpperCase();

  return (
    <>
      <PageHeader eyebrow="Community" title="Profile" accent="pink" />

      <div className="card profile-card">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: "var(--pink-tint)",
            color: "var(--coral-dark)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
          }}>
            {initial}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.first_name} {user?.last_name}</div>
            <div className="sub" style={{ margin: 0 }}>{user?.phone_number}</div>
          </div>
        </div>

        <ProfileFields />

        <div className="banner banner-info" style={{ marginBottom: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <rect x="4" y="10.5" width="16" height="9.5" rx="1.8" />
            <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
          </svg>
          Your cycle entries and order history are private and only visible to you.
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 18, width: "100%", justifyContent: "center" }} onClick={logout}>
          Log out
        </button>
      </div>
    </>
  );
}
