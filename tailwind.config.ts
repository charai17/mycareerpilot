import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20211f",
        canvas: "#f7f5f0",
        line: "#dfdcd4",
        muted: "#6f706a",
        pilot: {
          green: "#1f7a72",
          greenSoft: "#e4f2ef",
          blue: "#365b8c",
          gold: "#9a6b2f",
          red: "#a6423a"
        }
      },
      boxShadow: {
        quiet: "0 18px 60px rgba(45, 43, 36, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
