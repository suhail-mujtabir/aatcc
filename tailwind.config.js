/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "stroke-draw": {
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "stroke-draw": "stroke-draw 2s linear forwards",
      },
    },
  },
  plugins: [],
};
