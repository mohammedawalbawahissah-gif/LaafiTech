// LaafiTech's app mark: the same five-petal Bloom Ledger flower drawn in
// BloomDial (full scale, cycle progress) and simplified in BloomMark
// (small "verified" badges), reproduced here as a self-contained circular
// tile for brand placements — the sidebar rail, auth screens, and the AI
// assistant header — that previously held a plain "L" letter or no mark
// at all.

const ANGLES = [0, 72, 144, 216, 288];

export default function LogoMark({ size = 34, bg = "#ffffff", color = "#e8604c", center = "#faeeda", className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LaafiTech"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      <circle cx="50" cy="50" r="50" fill={bg} />
      <g fill={color}>
        {ANGLES.map((angle) => (
          <ellipse key={angle} cx="50" cy="26.5625" rx="14.0625" ry="23.4375" transform={`rotate(${angle} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="14.0625" fill={center} />
    </svg>
  );
}
