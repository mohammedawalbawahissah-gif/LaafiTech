import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";

export default function CommunityProfile() {
  const { user, logout } = useAuth();

  return (
    <>
      <PageHeader eyebrow="Community" title="Profile" accent="pink" />

      <div className="card" style={{ maxWidth: 420 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.first_name} {user?.last_name}</div>
        <div className="sub">{user?.phone_number}</div>
        <div className="sub">{user?.email}</div>
        <p className="sub" style={{ marginTop: 16 }}>
          Your cycle entries and order history are private and only visible to you.
        </p>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={logout}>
          Log out
        </button>
      </div>
    </>
  );
}
