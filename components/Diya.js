"use client";
import { useId } from "react";

// A clay diya with a living, flickering flame and a soft glow.
export default function Diya({ className = "h-16 w-16" }) {
  const uid = useId().replace(/:/g, "");
  const origin = { transformBox: "fill-box", transformOrigin: "50% 100%" };
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`glow${uid}`}>
          <stop offset="0%" stopColor="#ffd45a" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#ff9a1f" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ff9a1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bowl${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9692a" />
          <stop offset="100%" stopColor="#8a3410" />
        </linearGradient>
        <linearGradient id={`fo${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff7a00" />
          <stop offset="70%" stopColor="#ffb21e" />
          <stop offset="100%" stopColor="#ffd75e" />
        </linearGradient>
      </defs>

      {/* glow */}
      <circle className="animate-glow" cx="50" cy="40" r="46" fill={`url(#glow${uid})`} />

      {/* bowl */}
      <path d="M8 60 C8 86 28 97 50 97 C72 97 92 86 92 60 Z" fill={`url(#bowl${uid})`} />
      <ellipse cx="50" cy="60" rx="42" ry="8" fill="#b34a1a" />
      <ellipse cx="50" cy="59" rx="35" ry="5.5" fill="#ffb347" />
      <path d="M20 74 Q50 86 80 74" stroke="#f2c14e" strokeWidth="1.6" fill="none" opacity="0.8" />
      <path d="M26 82 Q50 92 74 82" stroke="#f2c14e" strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* wick */}
      <rect x="48.6" y="52" width="2.8" height="8" rx="1.2" fill="#3b2410" />

      {/* flame */}
      <g className="animate-flame" style={origin}>
        <path
          d="M50 8 C63 26 70 38 63 52 C59 59 41 59 37 52 C30 38 37 26 50 8 Z"
          fill={`url(#fo${uid})`}
        />
        <g className="animate-flame2" style={origin}>
          <path d="M50 24 C58 36 60 45 56 52 C53 57 47 57 44 52 C40 45 42 36 50 24 Z" fill="#ffe27a" />
          <ellipse cx="50" cy="49" rx="3.6" ry="6" fill="#fffbe6" />
        </g>
      </g>
    </svg>
  );
}
