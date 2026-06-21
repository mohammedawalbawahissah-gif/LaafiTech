import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomDial from "../../components/BloomDial";
import BloomMark from "../../components/BloomMark";
import NavIcon from "../../components/NavIcon";

export default function CycleTracker() {
  const [logs, setLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      client.get("/community/cycle-logs/"),
      client.get("/community/cycle-logs/prediction/"),
    ])
      .then(([logsRes, predRes]) => {
        setLogs(logsRes.data.results ?? logsRes.data);
        setPrediction(predRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!periodStart) return setError("Enter when your period started.");
    setSaving(true);
    try {
      await client.post("/community/cycle-logs/", {
        period_start: periodStart,
        period_end: periodEnd || null,
        symptoms,
        notes,
      });
      setPeriodStart("");
      setPeriodEnd("");
      setSymptoms("");
      setNotes("");
      load();
    } catch {
      setError("Couldn't save this entry. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasPrediction = !loading && prediction?.available;

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Cycle tracker"
        description="Log your periods to get a personal prediction over time."
        accent="pink"
      />

      {/* Always show the dial -- ghost-petalled and dashed when there isn't
          enough history yet, so the page never reads as visually empty. */}
      <div className="card dial-card" style={{ marginBottom: 20 }}>
        <BloomDial
          day={hasPrediction ? prediction.current_cycle_day : null}
          totalDays={hasPrediction ? prediction.average_cycle_length_days : 28}
          label={
            hasPrediction
              ? new Date(prediction.next_predicted_start).toLocaleDateString(undefined, { month: "long", day: "numeric" })
              : "Not enough data yet"
          }
          sublabel={hasPrediction ? "Estimated next period" : "Log a few cycles to unlock predictions"}
        />
        <div className="dial-meta">
          {hasPrediction ? (
            <p>
              Average cycle: {prediction.average_cycle_length_days} days · Average period length: {prediction.average_period_length_days} days.
              {prediction.disclaimer ? ` ${prediction.disclaimer}` : ""}
            </p>
          ) : (
            <p>
              {!loading && prediction?.reason
                ? prediction.reason
                : "Once you've logged two or three periods, LaafiTech can estimate your next one and show your current cycle day here."}
            </p>
          )}
        </div>
      </div>

      <div className="tracker-grid">
        <form className="card entry-card" onSubmit={submit}>
          <h3>
            <span className="icon-badge"><NavIcon name="tracker" /></span>
            Log a period
          </h3>
          {error && <div className="banner banner-error">{error}</div>}
          <div className="field-row">
            <div className="field">
              <label>Started</label>
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
            </div>
            <div className="field">
              <label>Ended (optional)</label>
              <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Symptoms (optional)</label>
            <input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. cramps, fatigue" />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember" rows={3} />
          </div>
          <button className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>
            {saving ? "Saving..." : "Save entry"}
          </button>
        </form>

        <div>
          <div className="section-head" style={{ marginTop: 0 }}>
            <h2>History</h2>
            {!loading && <span className="count">{logs.length} {logs.length === 1 ? "entry" : "entries"}</span>}
          </div>

          {!loading && logs.length === 0 ? (
            <div className="card empty-state">
              <BloomMark size={40} />
              <h3>No entries yet</h3>
              <p>Log your first period on the left and it'll show up here, ready to build toward a prediction.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Started</th>
                    <th>Ended</th>
                    <th>Symptoms</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="mono">{l.period_start}</td>
                      <td className="mono">{l.period_end || "—"}</td>
                      <td>{l.symptoms || "—"}</td>
                      <td>{l.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
