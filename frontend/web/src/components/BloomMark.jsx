// The three-petal flower used at small scale in "verified" badges and at
// full scale in the BloomDial, lifted out here so empty states, product
// placeholders, and anywhere else that needs the platform's signature mark
// can all reference one component instead of re-drawing it inline.

export default function BloomMark({ className, color = "#e8604c", center = "#faeeda" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill={color}>
        <circle cx="12" cy="7" r="5" />
        <circle cx="6.5" cy="15" r="5" />
        <circle cx="17.5" cy="15" r="5" />
      </g>
      <circle cx="12" cy="12.3" r="3.1" fill={center} />
    </svg>
  );
}
