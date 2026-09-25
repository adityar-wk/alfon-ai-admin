/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E8623A",
          tint: "#FFF4F0",
          hover: "#D4522D",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
        },
        line: "#F0F0F0",
        subtle: "#F5F5F5",
        page: "#FBFAF7",
        surface2: "#F6F4EF",
        teal: "#2E86AB",
        purple: "#7C3AED",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#2E86AB",
      },
      fontFamily: {
        // Inter runs body and UI; Sora carries headings and key numbers
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        lift: "0 8px 24px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        card: "16px",
        control: "10px",
      },
    },
  },
  plugins: [],
};
