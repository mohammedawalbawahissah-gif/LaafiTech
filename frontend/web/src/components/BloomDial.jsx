// Bloom Ledger's signature element: cycle progress shown as a flower
// opening one petal at a time, rather than a plain progress bar or percent.
// Five petals map onto the cycle -- as `day` advances through `totalDays`,
// petals fill from coral (logged/elapsed) to a soft pink ghost (ahead).
// This mirrors the small bloom mark used on "verified"/"fulfilled" badges
// elsewhere in the app, just at a larger, more personal scale here.

const PETAL_COUNT = 5;
const PETAL_ANGLES = [0, 72, 144, 216, 288];

export default function BloomDial({ day, totalDays, label, sublabel, size = 64 }) {
  const safeTotal = totalDays && totalDays > 0 ? totalDays : 28;
  const safeDay = day && day > 0 ? Math.min(day, safeTotal) : 0;
  const filledPetals = Math.max(0, Math.min(PETAL_COUNT, Math.round((safeDay / safeTotal) * PETAL_COUNT)));

  return (
    <div className="bloom-dial">
      <svg
        className="bloom-dial-figure"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label={day ? `Cycle day ${day} of ${safeTotal}` : "Cycle not yet logged"}
      >
        <g transform="translate(32,32)">
          {PETAL_ANGLES.map((angle, i) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-15"
              rx="9"
              ry="15"
              fill={i < filledPetals ? "#e8604c" : "#f4b9c2"}
              opacity={i < filledPetals ? 1 : 0.55}
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="9" fill="#faeeda" />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="11"
            fill="#854f0b"
          >
            {day || "—"}
          </text>
        </g>
      </svg>
      <div>
        <div className="bloom-dial-day">{label}</div>
        {sublabel && <div className="bloom-dial-label">{sublabel}</div>}
      </div>
    </div>
  );
}
