/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#040711",
          900: "#0A0F1D",
          850: "#0F172A",
          800: "#162036",
          700: "#1E293B",
          600: "#334155",
          500: "#475569",
        },
        trust: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          DEFAULT: "#D4A64A",
        },
        justice: {
          50: "#EFF6FF",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        corruption: {
          50: "#FEF2F2",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        righteous: {
          50: "#ECFDF5",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(212, 166, 74, 0.3)",
        "glow-danger": "0 0 25px -5px rgba(239, 68, 68, 0.4)",
        "glow-justice": "0 0 25px -5px rgba(59, 130, 246, 0.4)",
        "glow-righteous": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "badge-pop": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "badge-pop": "badge-pop 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
