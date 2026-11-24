// Drawn pictures for pooja items. If a product has image_url (real photo), that is shown instead.
const GOLD = "#d9a21c";

function Bowl({ fill = "#b8860b" }) {
  return (
    <>
      <path d="M16 62 C16 86 34 94 50 94 C66 94 84 86 84 62 Z" fill={fill} />
      <ellipse cx="50" cy="62" rx="34" ry="7" fill="#d9a21c" />
    </>
  );
}

const ARTS = {
  incense: () => (
    <g>
      <ellipse cx="50" cy="86" rx="28" ry="6" fill="#b8860b" />
      <rect x="42" y="74" width="16" height="12" rx="4" fill={GOLD} />
      {[[-18, 0], [0, 0], [18, 0]].map(([dx], i) => (
        <g key={i}>
          <line x1="50" y1="76" x2={50 + dx * 1.2} y2="30" stroke="#8a4b1c" strokeWidth="3" strokeLinecap="round" />
          <circle cx={50 + dx * 1.2} cy="29" r="2.6" fill="#ff6a00" />
          <path
            d={`M${50 + dx * 1.2} 26 C${44 + dx * 1.2} 18 ${56 + dx * 1.2} 14 ${50 + dx * 1.2} 4`}
            stroke="#b8c2cf"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      ))}
    </g>
  ),
  camphor: () => (
    <g>
      <ellipse cx="50" cy="72" rx="38" ry="12" fill="#cbd5e1" stroke="#94a3b8" />
      <ellipse cx="50" cy="69" rx="32" ry="9" fill="#e2e8f0" />
      {[[34, 56, -10], [52, 52, 8], [66, 60, -4]].map(([x, y, r], i) => (
        <rect key={i} x={x - 9} y={y - 9} width="18" height="18" rx="4" fill="#fff" stroke="#cbd5e1" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <circle cx="50" cy="30" r="2" fill="#ffd45a" />
      <path d="M44 24 L56 24 M50 18 L50 30" stroke="#ffd45a" strokeWidth="1.5" />
    </g>
  ),
  havan: () => (
    <g>
      <Bowl fill="#8a4b1c" />
      <path d="M20 62 Q50 24 80 62 Z" fill="#6b4423" />
      {[[40, 50], [55, 44], [62, 54], [47, 58], [34, 58], [70, 60]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill={i % 2 ? "#2f8f3a" : "#e0701a"} />
      ))}
      <path d="M50 22 C56 30 56 36 50 40 C44 36 44 30 50 22 Z" fill="#ff9a1f" />
    </g>
  ),
  garland: () => (
    <g>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x = 50 + Math.cos(a) * 31;
        const y = 48 + Math.sin(a) * 31;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill={i % 2 ? "#f59e0b" : "#ea580c"} />
            <circle cx={x} cy={y} r="5" fill={i % 2 ? "#fbbf24" : "#f59e0b"} />
            <circle cx={x} cy={y} r="2" fill="#fff3b0" />
          </g>
        );
      })}
      <path d="M50 79 L40 94 M50 79 L60 94" stroke="#2f8f3a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="79" r="6" fill="#c2410c" />
    </g>
  ),
  marigold: () => (
    <g>
      {[[34, 62], [56, 66], [46, 44], [68, 50], [28, 44], [50, 78], [72, 70], [38, 76], [60, 30]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="12" fill={i % 2 ? "#f59e0b" : "#ea580c"} />
          <circle cx={x} cy={y} r="7" fill={i % 2 ? "#fbbf24" : "#f59e0b"} />
          <circle cx={x} cy={y} r="2.6" fill="#fff3b0" />
        </g>
      ))}
    </g>
  ),
  lotus: () => (
    <g>
      <ellipse cx="50" cy="82" rx="34" ry="8" fill="#2f8f3a" />
      {[-64, -32, 32, 64, 0].map((r, i) => (
        <ellipse key={i} cx="50" cy="52" rx="10" ry="26" fill={i === 4 ? "#f9a8d4" : "#f472b6"} stroke="#be185d" strokeWidth="0.8" transform={`rotate(${r} 50 78)`} />
      ))}
      <circle cx="50" cy="60" r="4" fill="#fde047" />
    </g>
  ),
  tulsi: () => (
    <g>
      <path d="M50 92 L50 50" stroke="#3e7d1d" strokeWidth="3" />
      {[-55, -30, 0, 30, 55].map((r, i) => (
        <g key={i} transform={`rotate(${r} 50 86)`}>
          <ellipse cx="50" cy="52" rx="9" ry="19" fill={i % 2 ? "#3aa14a" : "#2f8f3a"} />
          <path d="M50 38 L50 66" stroke="#1c5f27" strokeWidth="1" />
        </g>
      ))}
    </g>
  ),
  coconut: () => (
    <g>
      <circle cx="50" cy="54" r="34" fill="#7b4a24" />
      <ellipse cx="38" cy="38" rx="10" ry="6" fill="#a86a38" opacity="0.7" />
      <circle cx="42" cy="46" r="3.4" fill="#2b1608" />
      <circle cx="58" cy="46" r="3.4" fill="#2b1608" />
      <circle cx="50" cy="58" r="3.4" fill="#2b1608" />
      <path d="M44 24 L40 14 M50 22 L50 10 M56 24 L62 14" stroke="#a86a38" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  banana: () => (
    <g>
      {[0, 11, 22, 33].map((d, i) => (
        <path key={i} d={`M${28 + d} 28 Q${22 + d} 72 ${52 + d * 0.6} 82`} stroke={i % 2 ? "#fbbf24" : "#facc15"} strokeWidth="12" strokeLinecap="round" fill="none" />
      ))}
      <rect x="30" y="16" width="24" height="10" rx="4" fill="#7a5a1a" />
    </g>
  ),
  betel: () => (
    <g>
      <path d="M38 82 C8 62 10 28 38 36 C62 28 66 62 38 82 Z" fill="#2f8f3a" />
      <path d="M38 80 L38 44" stroke="#1c5f27" strokeWidth="1.4" />
      <path d="M64 78 C40 62 44 34 66 40 C86 36 90 62 64 78 Z" fill="#3aa14a" />
      <circle cx="78" cy="84" r="5" fill="#7a4a21" />
      <circle cx="68" cy="88" r="5" fill="#8a5a2b" />
    </g>
  ),
  wick: () => (
    <g>
      {[-24, -8, 8, 24].map((r, i) => (
        <g key={i} transform={`rotate(${r} 50 90)`}>
          <rect x="45" y="22" width="10" height="64" rx="5" fill="#fff" stroke="#e2d8c3" />
          {[32, 42, 52, 62, 72].map((y) => (
            <path key={y} d={`M45 ${y} L55 ${y + 5}`} stroke="#e2d8c3" strokeWidth="1.2" />
          ))}
        </g>
      ))}
    </g>
  ),
  diya: () => (
    <g>
      <path d="M10 60 C10 84 30 94 50 94 C70 94 90 84 90 60 Z" fill="#c2531a" />
      <ellipse cx="50" cy="60" rx="40" ry="8" fill="#a8431a" />
      <ellipse cx="50" cy="59" rx="33" ry="5.5" fill="#ffb347" />
      <path d="M50 14 C62 30 68 42 62 54 C58 60 42 60 38 54 C32 42 38 30 50 14 Z" fill="#ff9a1f" />
      <path d="M50 30 C57 40 58 47 54 54 C52 57 48 57 46 54 C42 47 43 40 50 30 Z" fill="#ffe27a" />
    </g>
  ),
  ghee: () => (
    <g>
      <rect x="26" y="40" width="48" height="46" rx="9" fill="#f7c948" />
      <rect x="30" y="28" width="40" height="14" rx="4" fill="#b8860b" />
      <rect x="34" y="52" width="32" height="24" rx="4" fill="#fff8e1" />
      <text x="50" y="70" textAnchor="middle" fontSize="16" fontWeight="700" fill="#b45309">घी</text>
    </g>
  ),
  oil: () => (
    <g>
      <rect x="43" y="14" width="14" height="18" rx="3" fill="#b8860b" />
      <path d="M43 32 L57 32 C70 40 72 50 72 56 L72 82 C72 90 66 92 50 92 C34 92 28 90 28 82 L28 56 C28 50 30 40 43 32 Z" fill="#d68910" />
      <rect x="34" y="56" width="32" height="24" rx="4" fill="#fff8e1" />
      <path d="M50 60 C56 66 56 72 50 76 C44 72 44 66 50 60 Z" fill="#d68910" />
    </g>
  ),
  kumkum: () => (
    <g>
      <Bowl />
      <path d="M22 62 Q50 26 78 62 Z" fill="#dc2626" />
      <path d="M36 52 Q50 36 64 52" stroke="#f87171" strokeWidth="2" fill="none" />
    </g>
  ),
  haldi: () => (
    <g>
      <Bowl />
      <path d="M22 62 Q50 26 78 62 Z" fill="#f4b400" />
      <path d="M36 52 Q50 36 64 52" stroke="#fde047" strokeWidth="2" fill="none" />
    </g>
  ),
  roli: () => (
    <g>
      <ellipse cx="50" cy="66" rx="42" ry="20" fill="#cbd5e1" stroke="#94a3b8" />
      <ellipse cx="50" cy="63" rx="36" ry="15" fill="#e2e8f0" />
      <circle cx="38" cy="60" r="8" fill="#dc2626" />
      {[[56, 56], [62, 62], [52, 66], [66, 56], [58, 70], [70, 66]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="3.6" ry="1.8" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" transform={`rotate(${i * 25} ${x} ${y})`} />
      ))}
    </g>
  ),
  idol: () => (
    <g>
      <rect x="22" y="84" width="56" height="8" rx="3" fill="#8a4b1c" />
      <circle cx="50" cy="38" r="30" fill="none" stroke="#f2c14e" strokeWidth="2" opacity="0.7" />
      <ellipse cx="50" cy="66" rx="22" ry="20" fill="#e0a416" />
      <ellipse cx="32" cy="42" rx="11" ry="14" fill="#c98f10" />
      <ellipse cx="68" cy="42" rx="11" ry="14" fill="#c98f10" />
      <circle cx="50" cy="40" r="15" fill="#e0a416" />
      <path d="M50 46 C50 62 38 62 42 74" stroke="#e0a416" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M38 28 L50 12 L62 28 Z" fill="#f2c14e" />
      <circle cx="44" cy="38" r="2" fill="#3a1f10" />
      <circle cx="56" cy="38" r="2" fill="#3a1f10" />
    </g>
  ),
  frame: () => (
    <g>
      <rect x="18" y="14" width="64" height="72" rx="4" fill="#8a4b1c" />
      <rect x="25" y="21" width="50" height="58" rx="2" fill="#fde68a" />
      <g transform="translate(0 6)">
        {[-50, -25, 25, 50, 0].map((r, i) => (
          <ellipse key={i} cx="50" cy="48" rx="6" ry="15" fill="#f472b6" transform={`rotate(${r} 50 64)`} />
        ))}
      </g>
      <text x="50" y="40" textAnchor="middle" fontSize="14" fill="#b45309">ॐ</text>
    </g>
  ),
  mala: () => (
    <g>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={50 + Math.cos(a) * 30} cy={44 + Math.sin(a) * 30} r="6" fill={i % 2 ? "#6b3a1a" : "#7c4520"} stroke="#4a2511" strokeWidth="0.8" />;
      })}
      <circle cx="50" cy="82" r="7" fill="#7c4520" stroke="#4a2511" />
      <path d="M44 88 L42 98 M50 89 L50 99 M56 88 L58 98" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  gangajal: () => (
    <g>
      {[-30, 0, 30].map((r, i) => (
        <ellipse key={i} cx="50" cy="22" rx="6" ry="14" fill="#2f8f3a" transform={`rotate(${r} 50 38)`} />
      ))}
      <circle cx="50" cy="30" r="11" fill="#7b4a24" />
      <ellipse cx="50" cy="44" rx="14" ry="4" fill="#d9a21c" />
      <path d="M36 48 C24 70 36 90 50 90 C64 90 76 70 64 48 Z" fill={GOLD} />
      <path d="M38 62 Q50 70 62 62" stroke="#fff3b0" strokeWidth="1.5" fill="none" />
    </g>
  ),
  kit: () => (
    <g>
      <ellipse cx="50" cy="74" rx="44" ry="16" fill="#cbd5e1" stroke="#94a3b8" />
      <ellipse cx="50" cy="70" rx="38" ry="12" fill="#e2e8f0" />
      <circle cx="30" cy="56" r="12" fill="#7b4a24" />
      <circle cx="26" cy="54" r="2" fill="#2b1608" />
      <circle cx="34" cy="54" r="2" fill="#2b1608" />
      <circle cx="68" cy="60" r="9" fill="#ea580c" />
      <circle cx="68" cy="60" r="5" fill="#fbbf24" />
      <circle cx="58" cy="50" r="8" fill="#f59e0b" />
      <path d="M44 66 Q50 44 56 66 Z" fill="#dc2626" />
      <path d="M46 62 L36 22 M52 60 L52 20 M58 62 L68 24" stroke="#8a4b1c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 50 C52 54 56 54 64 50 C58 44 50 44 44 50 Z" fill="#2f8f3a" />
      <path d="M50 40 C56 46 56 50 50 52 C44 50 44 46 50 40 Z" fill="#ffb21e" />
    </g>
  ),
  om: () => (
    <g>
      <circle cx="50" cy="50" r="36" fill="#fde68a" stroke={GOLD} strokeWidth="3" />
      <text x="50" y="66" textAnchor="middle" fontSize="46" fill="#b45309">ॐ</text>
    </g>
  ),
};

const TINT = {
  incense: "from-orange-50 to-amber-100",
  camphor: "from-slate-50 to-sky-100",
  havan: "from-amber-50 to-orange-100",
  garland: "from-yellow-50 to-orange-100",
  marigold: "from-yellow-50 to-amber-100",
  lotus: "from-pink-50 to-rose-100",
  tulsi: "from-emerald-50 to-lime-100",
  coconut: "from-amber-50 to-stone-100",
  banana: "from-yellow-50 to-lime-100",
  betel: "from-emerald-50 to-green-100",
  wick: "from-amber-50 to-yellow-100",
  diya: "from-orange-50 to-amber-100",
  ghee: "from-yellow-50 to-amber-100",
  oil: "from-amber-50 to-orange-100",
  kumkum: "from-red-50 to-rose-100",
  haldi: "from-yellow-50 to-amber-100",
  roli: "from-rose-50 to-orange-100",
  idol: "from-amber-50 to-yellow-100",
  frame: "from-orange-50 to-amber-100",
  mala: "from-stone-50 to-amber-100",
  gangajal: "from-sky-50 to-amber-100",
  kit: "from-orange-100 to-amber-200",
  om: "from-amber-50 to-orange-100",
};

export function pickArt(p) {
  const n = (p.name || "").toLowerCase();
  if (p.is_kit || n.includes("kit")) return "kit";
  const rules = [
    ["agarbatti", "incense"], ["dhoop", "incense"], ["camphor", "camphor"], ["havan", "havan"],
    ["garland", "garland"], ["marigold", "marigold"], ["lotus", "lotus"], ["tulsi", "tulsi"],
    ["coconut", "coconut"], ["banana", "banana"], ["betel", "betel"], ["wick", "wick"],
    ["diya", "diya"], ["ghee", "ghee"], ["oil", "oil"], ["kumkum", "kumkum"], ["sindoor", "kumkum"],
    ["haldi", "haldi"], ["roli", "roli"], ["idol", "idol"], ["frame", "frame"],
    ["rudraksha", "mala"], ["mala", "mala"], ["gangajal", "gangajal"],
  ];
  for (const [k, v] of rules) if (n.includes(k)) return v;
  return "om";
}

export default function ItemArt({ product, className = "" }) {
  if (product.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.image_url} alt={product.name} className={`object-cover ${className}`} />;
  }
  const key = pickArt(product);
  const Art = ARTS[key];
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${TINT[key]} ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full p-3" role="img" aria-label={product.name}>
        <Art />
      </svg>
    </div>
  );
}
