export default function Mandala({ className = "" }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.8">
        <circle r="96" />
        <circle r="90" strokeDasharray="2 3" />
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse key={"a" + i} cx="0" cy="-68" rx="9" ry="22" transform={`rotate(${i * 22.5})`} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={"b" + i} cx="0" cy="-42" rx="8" ry="17" transform={`rotate(${i * 45 + 22.5})`} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={"c" + i} cx="0" cy="-26" r="2.2" transform={`rotate(${i * 30})`} />
        ))}
        <circle r="18" />
        <circle r="10" />
        <circle r="3.5" fill="currentColor" />
      </g>
    </svg>
  );
}
