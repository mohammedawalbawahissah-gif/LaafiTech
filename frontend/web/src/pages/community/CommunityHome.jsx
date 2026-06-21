import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import BloomDial from "../../components/BloomDial";
import NavIcon from "../../components/NavIcon";

export default function CommunityHome() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/community/cycle-logs/prediction/")
      .then((res) => setPrediction(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title={`Hi${user?.first_name ? `, ${user.first_name}` : ""}`}
        description="Your private space for menstrual health."
        accent="pink"
      />

      <div className="card" style={{ marginBottom: 20 }}>
        {loading && <p className="sub">Loading...</p>}
        {!loading && prediction?.available && (
          <>
            <BloomDial
              day={prediction.current_cycle_day}
              totalDays={prediction.average_cycle_length_days}
              label={new Date(prediction.next_predicted_start).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
              sublabel="Next period (estimated)"
            />
            <p className="sub" style={{ marginTop: 14 }}>
              {prediction.current_cycle_day != null && `Day ${prediction.current_cycle_day} of your current cycle. `}
              Average cycle length: {prediction.average_cycle_length_days} days. {prediction.disclaimer}
            </p>
          </>
        )}
        {!loading && prediction && !prediction.available && (
          <BloomDial day={null} totalDays={28} label="Not enough history yet" sublabel={prediction.reason} />
        )}
      </div>

      <div className="card" style={{ display: "flex", gap: 14, padding: 8 }}>
        <Link to="/community/tracker" className="card" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", boxShadow: "none", border: "1px solid var(--line)" }}>
          <div className="icon-badge icon-badge-pink"><NavIcon name="tracker" /></div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>Cycle tracker</div>
            <div className="sub" style={{ margin: 0 }}>Log or view your cycle</div>
          </div>
        </Link>
        <Link to="/community/shop" className="card" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", boxShadow: "none", border: "1px solid var(--line)" }}>
          <div className="icon-badge icon-badge-pink"><NavIcon name="shop" /></div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>Shop</div>
            <div className="sub" style={{ margin: 0 }}>Order more products</div>
          </div>
        </Link>
      </div>
    </>
  );
}
