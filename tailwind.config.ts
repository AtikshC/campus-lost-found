import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mustang: {
          50: "#f6f3ff",
          100: "#ece7ff",
          200: "#d8d0ff",
          300: "#b9a8ff",
          400: "#9a7cff",
          500: "#7b4dff", // primary purple
          600: "#6237f2",
          700: "#4a27c7",
          800: "#351d93",
          900: "#241560",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(123,77,255,0.25), 0 10px 30px rgba(123,77,255,0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;
