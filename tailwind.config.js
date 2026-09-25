/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F15A24",
          tint: "#FEEFE6",
          hover: "#D94E1C",
        },
        ink: {
          DEFAULT: "#2B2E35",
          secondary: "#6B7280",
          tertiary: "#A0A4AB",
        },
        line: "#EDEDED",
        subtle: "#FAFAFA",
        success: "#16A34A",
        warning: "#F5A623",
        danger: "#E11D2E",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: [
          "Sora", // digits only (see index.html) — everything else falls through to Inter
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
