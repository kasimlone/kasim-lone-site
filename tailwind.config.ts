import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1419",
        bg2: "#161b22",
        panel: "#1a1f2e",
        wood: "#8B6F47",
        woodLight: "#a98963",
        whiteboard: "#f5f5f0",
        leaf: "#7ab86a",
        leafDark: "#4a7c3a",
        note: {
          yellow: "#fbbf24",
          pink: "#f472b6",
          blue: "#60a5fa",
        },
        syntax: {
          keyword: "#82AAFF",
          string: "#C3E88D",
          fn: "#FFCB6B",
          const: "#F78C6C",
          comment: "#546E7A",
          text: "#A6ACCD",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
