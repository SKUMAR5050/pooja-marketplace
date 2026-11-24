// A hanging marigold flower mala (garland strand) that sways gently.
function Strand({ flowers = 4, delay = 0, className = "" }) {
  const gap = 15;
  const height = flowers * gap + 34;
  return (
    <div
      className={`origin-top animate-sway ${className}`}
      style={{ animationDelay: `${delay}s`, width: 28 }}
    >
      <svg viewBox={`0 0 28 ${height}`} width="28" height={height} aria-hidden="true">
        <line x1="14" y1="0" x2="14" y2={height - 20} stroke="#7a3b10" strokeWidth="1.2" />
        {Array.from({ length: flowers }).map((_, i) => {
          const y = 10 + i * gap;
          const c1 = i % 2 === 0 ? "#f59e0b" : "#ea580c";
          return (
            <g key={i}>
              <circle cx="14" cy={y} r="7.5" fill={c1} />
              <circle cx="14" cy={y} r="4.6" fill="#fbbf24" opacity="0.9" />
              <circle cx="14" cy={y} r="1.8" fill="#fff3b0" />
            </g>
          );
        })}
        {/* tassel flower at the end */}
        <g>
          <ellipse cx="9" cy={height - 12} rx="4" ry="2" fill="#2f8f3a" transform={`rotate(-30 9 ${height - 12})`} />
          <ellipse cx="19" cy={height - 12} rx="4" ry="2" fill="#2f8f3a" transform={`rotate(30 19 ${height - 12})`} />
          <circle cx="14" cy={height - 12} r="9" fill="#ea580c" />
          <circle cx="14" cy={height - 12} r="6" fill="#f59e0b" />
          <circle cx="14" cy={height - 12} r="2.6" fill="#fff3b0" />
        </g>
      </svg>
    </div>
  );
}

const LENGTHS = [3, 5, 2, 4, 3, 5, 2, 4, 3, 5];

export default function MalaRow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-3 sm:px-8">
      {LENGTHS.map((n, i) => (
        <Strand
          key={i}
          flowers={n}
          delay={(i % 5) * 0.45}
          className={i > 5 ? "hidden sm:block" : i > 3 ? "hidden min-[420px]:block" : ""}
        />
      ))}
    </div>
  );
}
