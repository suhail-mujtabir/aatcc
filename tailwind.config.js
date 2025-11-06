// tailwind.config.js

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'black': '#000000',
        'light-black': '#343541',
      },
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
