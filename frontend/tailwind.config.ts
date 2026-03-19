import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ["var(--font-cinzel)"],
        lora: ["var(--font-lora)"],
      },
      colors: {
        primary: "oklch(33% 0.17 295)",
        secondary: "oklch(74% 0.17 75)",
        accent: "oklch(74% 0.17 75)",
        background: "oklch(94.4% 0.045 83)",
        foreground: "oklch(30% 0.06 45)",
      },
    },
  },
  plugins: [],
};

export default config;
