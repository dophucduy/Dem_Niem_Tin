/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: { colors: { night: "#070b14", trust: "#d4a64a" } },
  },
  plugins: [],
};
