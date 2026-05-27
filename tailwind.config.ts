import type { Config } from "tailwindcss";

// Rococo Punch palette — coral primary on neutral grey paper,
// cool grey ink. Asterisk wordmark in bold geometric sans.
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral paper background (matches the logo plate)
        paper: {
          50: "#F7F7F7",
          100: "#EFEFEF",
          200: "#E5E5E5",
          300: "#D6D6D6",
          400: "#B8B8B8",
        },
        ink: {
          50: "#F7F7F7",
          100: "#EBEBEB",
          200: "#D4D4D4",
          300: "#A3A3A3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#2D2D2D",
          800: "#1A1A1A",
          900: "#0F0F0F",
          950: "#080808",
        },
        // Coral "punch"
        brand: {
          50: "#FEF1EF",
          100: "#FDDFDB",
          200: "#FBB9B0",
          300: "#F89588",
          400: "#F58379",
          500: "#F47369",
          600: "#E05144",
          700: "#B83C32",
          800: "#8F2D26",
          900: "#661F1A",
        },
        good: {
          500: "#3D9970",
          600: "#2F7A57",
        },
        bad: {
          500: "#E05144",
          600: "#B83C32",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["var(--font-display)", "Archivo Black", "ui-sans-serif", "system-ui", "Impact", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
