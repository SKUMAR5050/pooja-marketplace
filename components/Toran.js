// Traditional flower toran: a marigold garland draped in swags, with a bunch of
// mango leaves and a golden bell hanging from every swag. The hanging bunch sways gently.
const W = 80;
const P0 = [0, 6];
const C = [40, 36];
const P2 = [80, 6];

function pointAt(t) {
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return [a * P0[0] + b * C[0] + c * P2[0], a * P0[1] + b * C[1] + c * P2[1]];
}

const T_VALUES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const LEAVES = [
  { r: -38, len: 34 },
  { r: -19, len: 41 },
  { r: 0, len: 47 },
  { r: 19, len: 41 },
  { r: 38, len: 34 },
];

function Leaf({ r, len }) {
  const w = 7;
  return (
    <g transform={`rotate(${r})`}>
      <path
        d={`M0 0 C${w} ${len * 0.25} ${w} ${len * 0.7} 0 ${len} C${-w} ${len * 0.7} ${-w} ${len * 0.25} 0 0 Z`}
        fill="#2f8f3a"
      />
      <path d={`M0 2 L0 ${len - 3}`} stroke="#1c5f27" strokeWidth="0.9" />
      <path d={`M0 ${len * 0.35} L${w - 2} ${len * 0.22} M0 ${len * 0.35} L${-(w - 2)} ${len * 0.22}`} stroke="#1c5f27" strokeWidth="0.5" fill="none" />
    </g>
  );
}

function Unit({ index }) {
  const [hx, hy] = pointAt(0.5);
  return (
    <svg
      viewBox={`0 0 ${W} 112`}
      width={W}
      height="112"
      className="shrink-0"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* garland string */}
      <path d={`M${P0[0]} ${P0[1]} Q${C[0]} ${C[1]} ${P2[0]} ${P2[1]}`} stroke="#3e5a1d" strokeWidth="3" fill="none" />

      {/* hanging mango leaves + bell (sways) */}
      <g
        className="animate-sway"
        style={{ transformOrigin: `${hx}px ${hy}px`, animationDelay: `${(index % 4) * 0.55}s` }}
      >
        <g transform={`translate(${hx} ${hy})`}>
          {LEAVES.map((l) => (
            <Leaf key={l.r} {...l} />
          ))}
          {/* little flower string to the bell */}
          <line x1="0" y1="40" x2="0" y2="58" stroke="#7a3b10" strokeWidth="1" />
          <circle cx="0" cy="48" r="4" fill="#f59e0b" />
          <circle cx="0" cy="48" r="1.6" fill="#fff3b0" />
          {/* golden bell */}
          <path d="M-6 66 C-6 58 6 58 6 66 L8 70 L-8 70 Z" fill="#e0a416" stroke="#8a5d00" strokeWidth="0.6" />
          <path d="M-5 66 C-5 60 -1 59 0 59" stroke="#fde68a" strokeWidth="1" fill="none" />
          <circle cx="0" cy="72" r="2" fill="#8a5d00" />
        </g>
      </g>

      {/* marigold flowers along the swag */}
      {T_VALUES.map((t, i) => {
        const [x, y] = pointAt(t);
        const big = i % 2 === 0;
        return (
          <g key={t}>
            <circle cx={x} cy={y} r={big ? 7.5 : 6.5} fill={big ? "#ea580c" : "#f59e0b"} />
            <circle cx={x} cy={y} r={big ? 5 : 4.2} fill={big ? "#f59e0b" : "#fbbf24"} />
            <circle cx={x} cy={y} r="1.9" fill="#fff3b0" />
          </g>
        );
      })}
      {/* center clasp flower */}
      <circle cx={hx} cy={hy} r="8.5" fill="#c2410c" />
      <circle cx={hx} cy={hy} r="6" fill="#f59e0b" />
      <circle cx={hx} cy={hy} r="2.6" fill="#fff3b0" />
    </svg>
  );
}

export default function Toran() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <Unit key={i} index={i} />
      ))}
    </div>
  );
}
