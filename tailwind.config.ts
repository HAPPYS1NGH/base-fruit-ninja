import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tangerine: {
          DEFAULT: "#FF8011",
          50: "#FFF1E8",
          100: "#FFE2D1",
          200: "#FFC6A3",
          300: "#FFAA76",
          400: "#FF9544",
          500: "#FF8011", // Base color
          600: "#DD6700",
          700: "#AB5000",
          800: "#783800",
          900: "#462100",
        },
      },
      fontFamily: {
        gotens: ['var(--font-gotens)'],
        inter: ['var(--font-inter)'],
      },
      animation: {
        "fade-out": "1s fadeOut 3s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
