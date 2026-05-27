import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef1",
          200: "#d8d8df",
          300: "#b5b5c1",
          400: "#8b8b9c",
          500: "#6b6b7c",
          600: "#54545f",
          700: "#3f3f48",
          800: "#27272e",
          900: "#18181d",
          950: "#0e0e12",
        },
        brand: {
          50: "#f4f1ff",
          100: "#ebe5ff",
          200: "#d9ceff",
          300: "#bea7ff",
          400: "#9e76ff",
          500: "#7f47ff",
          600: "#6f23ff",
          700: "#5e12eb",
          800: "#4f10c4",
          900: "#420fa0",
        },
        good: {
          500: "#10b981",
          600: "#059669",
        },
        bad: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
