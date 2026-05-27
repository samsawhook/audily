import type { Config } from "tailwindcss";

// Rococo Punch palette — warm cream background, deep ink text,
// crimson "punch" primary, gold accent. Hex values are best-guess
// since rococopunch.com is blocked by the sandbox; swap in the
// real brand hexes here and they propagate to every component.
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream / parchment background
        cream: {
          50: "#FDFAF4",
          100: "#FAF4E8",
          200: "#F5EBD6",
          300: "#EEDFC0",
          400: "#E2CBA0",
        },
        ink: {
          50: "#F7F4EE",
          100: "#EEE9DD",
          200: "#D8D2C2",
          300: "#B5AC97",
          400: "#8B8270",
          500: "#6B6354",
          600: "#544D42",
          700: "#3F3A32",
          800: "#272420",
          900: "#1A1612",
          950: "#0E0B09",
        },
        // Crimson "punch"
        brand: {
          50: "#FCEEEA",
          100: "#F8D6CD",
          200: "#F1AC9C",
          300: "#E78468",
          400: "#DA5C3C",
          500: "#C8412E",
          600: "#A93423",
          700: "#85261A",
          800: "#621A12",
          900: "#3F100A",
        },
        // Warm gold accent
        accent: {
          50: "#FDF6E3",
          100: "#FBEAB6",
          200: "#F6D472",
          300: "#E9B934",
          400: "#D9A02C",
          500: "#B68420",
        },
        good: {
          500: "#3F7A4A",
          600: "#2F5B37",
        },
        bad: {
          500: "#C8412E",
          600: "#A93423",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
