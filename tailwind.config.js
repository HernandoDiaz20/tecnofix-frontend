/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F9FB",
        surface: "#FFFFFF",
        "on-surface": "#191C1E",
        "on-surface-variant": "#434655",
        primary: {
          DEFAULT: "#004AC6",
          hover: "#003EA8",
          container: "#2563EB",
          "on-container": "#FFFFFF",
          fixed: "#DBE1FF",
          "fixed-dim": "#B4C5FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00687A",
          container: "#57DFFE",
          "on-container": "#004E5C",
          foreground: "#FFFFFF",
        },
        "surface-container": {
          lowest: "#FFFFFF",
          low: "#F2F4F6",
          DEFAULT: "#ECEEF0",
          high: "#E6E8EA",
          highest: "#E0E3E5",
        },
        outline: {
          DEFAULT: "#737686",
          variant: "#E0E3E5",
        },
        success: {
          DEFAULT: "#16A34A",
          container: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          container: "#FEF3C7",
        },
        error: {
          DEFAULT: "#DC2626",
          container: "#FFDAD6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0px 10px 25px -5px rgba(15, 23, 42, 0.08), 0px 8px 10px -6px rgba(15, 23, 42, 0.04)",
      },
      maxWidth: {
        "container-max": "1280px",
      },
    },
  },
  plugins: [],
}
