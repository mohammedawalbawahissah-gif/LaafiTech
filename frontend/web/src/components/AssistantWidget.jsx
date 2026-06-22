import { useEffect, useRef, useState } from "react";
import client from "../api/client";

const ROLE_GREETING = {
  agent: "Ask me about your deliveries, inventory, or payouts.",
  funder: "Ask me about your procurement orders or verified impact.",
  admin: "Ask me about verification, payouts, or platform operations.",
  superadmin: "Ask me about verification, payouts, or platform operations.",
  community_user: "Ask me anything about your period or menstrual health — private and judgment-free.",
};

export default function AssistantWidget({ role }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setError("");
    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await client.post("/ai/assistant/", { messages: nextMessages });
      setMessages([...nextMessages, { role: "assistant", content: res.data.answer }]);
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 50 }}
      className="assistant-widget-root"
    >
      {open && (
        <div
          style={{
            width: 340,
            maxHeight: 460,
            display: "flex",
            flexDirection: "column",
            background: "var(--surface)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            border: "1px solid var(--line)",
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>LaafiTech Assistant</strong>
            <button onClick={() => setOpen(false)} className="btn btn-ghost" style={{ padding: "2px 8px", fontSize: 12 }}>
              ✕
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, minHeight: 200 }}>
            {messages.length === 0 && (
              <p className="sub" style={{ fontSize: 13 }}>
                {ROLE_GREETING[role] || "Ask me a question about the platform."}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  textAlign: m.role === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    maxWidth: "85%",
                    background: m.role === "user" ? "var(--primary)" : "var(--surface-sunken)",
                    color: m.role === "user" ? "#fff" : "var(--ink)",
                  }}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {sending && <p className="sub" style={{ fontSize: 12 }}>Thinking...</p>}
            {error && <p style={{ color: "var(--danger)", fontSize: 12 }}>{error}</p>}
          </div>

          <form onSubmit={send} style={{ display: "flex", borderTop: "1px solid var(--line)", padding: 8, gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
            />
            <button className="btn btn-primary" style={{ padding: "8px 14px" }} disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-primary"
        style={{ borderRadius: 999, width: 52, height: 52, padding: 0, fontSize: 20, boxShadow: "0 6px 18px rgba(0,0,0,0.2)" }}
        aria-label="Open assistant"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
