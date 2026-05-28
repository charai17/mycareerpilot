import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17191c",
        canvas: "#f6f7f8",
        line: "#dfe4e7",
        muted: "#626b72",
        pilot: {
          green: "#0f6b57",
          greenSoft: "#e3f0ec",
          blue: "#315f91",
          gold: "#8a641f",
          red: "#a6423a"
        }
      },
      boxShadow: {
        quiet: "0 16px 50px rgba(27, 36, 44, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
