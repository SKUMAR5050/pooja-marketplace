/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        maroon: { DEFAULT: "#6b1414", dark: "#4a0d0d" },
        gold: { DEFAULT: "#f2c14e", dark: "#b8860b" },
        cream: "#fff8ec",
      },
      fontFamily: {
        serif: [
          '"Noto Serif Devanagari"',
          '"Nirmala UI"',
          "Mangal",
          "Georgia",
          "serif",
        ],
      },
      keyframes: {
        flame: {
          "0%, 100%": { transform: "scale(1, 1) rotate(-1.5deg) skewX(-1deg)" },
          "20%": { transform: "scale(0.94, 1.1) rotate(2deg) skewX(2deg)" },
          "45%": { transform: "scale(1.05, 0.95) rotate(-2deg) skewX(-2deg)" },
          "70%": { transform: "scale(0.97, 1.07) rotate(1.5deg) skewX(1deg)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.65", transform: "scale(0.95)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        flicker: {
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(255,170,40,.9))", transform: "scale(1)" },
          "50%": { filter: "drop-shadow(0 0 16px rgba(255,200,60,1))", transform: "scale(1.06)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "spin-slow": "spin 90s linear infinite",
        flicker: "flicker 2.4s ease-in-out infinite",
        flame: "flame 1.5s ease-in-out infinite",
        flame2: "flame 0.95s ease-in-out infinite reverse",
        glow: "glow 2.2s ease-in-out infinite",
        sway: "sway 4.5s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
