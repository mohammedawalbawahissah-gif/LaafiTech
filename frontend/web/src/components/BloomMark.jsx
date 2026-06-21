// Reusable version of the small three-petal "bloom" mark used inside the
// .badge-verified data-URI icon elsewhere in the app. Pulled out as a real
// component (rather than another data URI) so it can pick up CSS variables
// and be sized up for empty states, where it acts as the community portal's
// signature illustration instead of a generic icon.

export default function BloomMark({ size = 40, tint = "var(--pink)", center = "var(--pink-tint)" }) {
  return (
    <svg
      className="bloom-mark"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <g fill={tint}>
        <circle cx="12" cy="7" r="5" />
        <circle cx="6.5" cy="15" r="5" />
        <circle cx="17.5" cy="15" r="5" />
      </g>
      <circle cx="12" cy="12.3" r="3.1" fill={center} />
    </svg>
  );
}
