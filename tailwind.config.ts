import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "2xs": ".625rem",
      },
      dropShadow: {
        "hard": [
          "0 1px 2px rgba(0, 0, 0, 0.55)",
          "0 2px 4px rgba(0, 0, 0, 0.55)",
          "0 4px 8px rgba(0, 0, 0, 0.55)",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "rainbow":
          "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
      },
      animation: {
        "shake": "shake 0.82s cubic-bezier(.36,.07,.19,.97) both",
        "pop-in": "pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        "notification-in": "notification-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
      },
      keyframes: {
        "shake": {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        "notification-in": {
          "0%": { transform: "translateY(100%) scale(0.8)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
