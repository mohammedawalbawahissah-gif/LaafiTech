import { useEffect, useState } from "react";
import client from "../../api/client";
import PageHeader from "../../components/PageHeader";
import BloomDial from "../../components/BloomDial";
import BloomMark from "../../components/BloomMark";

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

      {/* The bloom dial always shows -- ghost petals before there's enough
          history to predict, rather than the whole card disappearing. */}
      <div className="card" style={{ marginBottom: 20 }}>
        {loading ? (
          <p className="sub">Loading...</p>
        ) : prediction?.available ? (
          <>
            <BloomDial
              day={prediction.current_cycle_day}
              totalDays={prediction.average_cycle_length_days}
              label={new Date(prediction.next_predicted_start).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
              sublabel="Estimated next period"
            />
            <p className="sub" style={{ marginTop: 14 }}>
              Average cycle: {prediction.average_cycle_length_days} days · Average period length: {prediction.average_period_length_days} days
            </p>
          </>
        ) : (
          <BloomDial
            day={null}
            totalDays={28}
            label="Not enough history yet"
            sublabel={prediction?.reason || "Log a few cycles to unlock predictions"}
          />
        )}
      </div>

      <div className="tracker-grid">
        <form className="card" onSubmit={submit}>
          <div className="card-title">
            <div className="icon-badge icon-badge-pink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
                <path d="M3.5 9h17M8 3v3M16 3v3" />
              </svg>
            </div>
            <div>
              <h3>Log a period</h3>
              <p className="sub">Takes a few seconds — symptoms and notes are optional.</p>
            </div>
          </div>
          {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
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
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you want to remember" />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save entry"}</button>
        </form>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "20px 20px 0" }}>
            <div className="card-title" style={{ marginBottom: 14 }}>
              <div className="icon-badge icon-badge-pink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12.5" r="8.2" />
                  <path d="M12 7.8V12.5l3.4 2" />
                </svg>
              </div>
              <div>
                <h3>History</h3>
                <p className="sub">{logs.length} entr{logs.length === 1 ? "y" : "ies"} logged</p>
              </div>
            </div>
          </div>

          {!loading && logs.length === 0 ? (
            <div className="empty-state-rich">
              <BloomMark className="bloom-mark" />
              <h3>No entries yet</h3>
              <p>Log your first period on the left to start building a personal prediction.</p>
            </div>
          ) : (
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
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
