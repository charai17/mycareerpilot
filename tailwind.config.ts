import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f1f1f",
        canvas: "#fbfbfa",
        line: "#e8e8e3",
        muted: "#73736d",
        pilot: {
          green: "#208579",
          greenSoft: "#eaf5f3",
          blue: "#3f618a",
          gold: "#8c6a37",
          red: "#a6423a"
        }
      },
      boxShadow: {
        quiet: "0 22px 70px rgba(31, 31, 31, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
