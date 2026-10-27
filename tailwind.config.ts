import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E53945",
          "red-hover": "#CC2B37",
          "red-light": "#FEE2E2",
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          "blue-light": "#DBEAFE",
          dark: "#172033",
          secondary: "#64748B",
          bg: "#FFFFFF",
          "bg-light": "#F8FAFC",
          border: "#E2E8F0",
        },
        status: {
          success: "#16A34A",
          "success-bg": "#DCFCE7",
          warning: "#D97706",
          "warning-bg": "#FEF3C7",
          error: "#DC2626",
          "error-bg": "#FEE2E2",
          info: "#2563EB",
          "info-bg": "#DBEAFE",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
