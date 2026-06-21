import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomDial from "../../components/BloomDial";

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

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Cycle tracker"
        description="Log your periods to get a personal prediction over time."
        accent="pink"
      />

      {!loading && prediction?.available && (
        <div className="card" style={{ marginBottom: 20 }}>
          <BloomDial
            day={prediction.current_cycle_day}
            totalDays={prediction.average_cycle_length_days}
            label={new Date(prediction.next_predicted_start).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
            sublabel="Estimated next period"
          />
          <p className="sub" style={{ marginTop: 14 }}>
            Average cycle: {prediction.average_cycle_length_days} days · Average period length: {prediction.average_period_length_days} days
          </p>
        </div>
      )}

      <form className="card" onSubmit={submit} style={{ maxWidth: 480, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Log a period</h3>
        {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="field-row" style={{ display: "flex", gap: 16 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Started</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
          </div>
          <div className="field" style={{ flex: 1 }}>
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
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember" />
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save entry"}</button>
      </form>

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
                <td>{l.period_start}</td>
                <td>{l.period_end || "—"}</td>
                <td>{l.symptoms || "—"}</td>
                <td>{l.notes || "—"}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={4} className="empty-state">No entries yet — log your first period above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
