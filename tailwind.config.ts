import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#060913",
          900: "#0B1120",
          850: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        brand: {
          50: "#EEF2FC",
          100: "#DCE5F9",
          200: "#B8CAF3",
          300: "#8FAEEB",
          400: "#5D8CE1",
          500: "#3156D3",
          600: "#2745AD",
          700: "#233F9D",
          800: "#1A2F75",
          900: "#101D4B",
          DEFAULT: "#3156D3",
          dark: "#233F9D",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          muted: "#F1F5F9",
          border: "#E2E8F0",
        },
        slate: {
          primary: "#0F172A",
          muted: "#64748B",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          critical: "#EF4444",
          info: "#3B82F6",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 1px 0 rgba(0, 0, 0, 0.02)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)",
        elevated: "0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
        glow: "0 0 25px -5px rgba(49, 86, 211, 0.25)",
        glowRose: "0 0 20px -3px rgba(239, 68, 68, 0.2)",
        glowAmber: "0 0 20px -3px rgba(245, 158, 11, 0.2)",
        glowEmerald: "0 0 20px -3px rgba(16, 185, 129, 0.2)",
      }
    },
  },
  plugins: [],
};
export default config;
