import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d8f0ff",
          200: "#b8e5ff",
          300: "#84d4ff",
          400: "#45bcff",
          500: "#129af0",
          600: "#057acb",
          700: "#0962a4",
          800: "#0f5286",
          900: "#13456f"
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 14px 40px -16px rgba(15,23,42,0.45)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(148,163,184,0.2), transparent 32%)"
      }
    }
  },
  plugins: []
};

export default config;
