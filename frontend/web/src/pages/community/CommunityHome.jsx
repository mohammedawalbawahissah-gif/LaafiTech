import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import BloomDial from "../../components/BloomDial";

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
          <>
            <div className="label">Cycle tracker</div>
            <p className="sub" style={{ marginTop: 6 }}>{prediction.reason}</p>
          </>
        )}
      </div>

      <div className="card" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link to="/community/tracker" className="btn btn-primary">Log or view my cycle</Link>
        <Link to="/community/shop" className="btn btn-ghost">Visit the shop</Link>
      </div>
    </>
  );
}
