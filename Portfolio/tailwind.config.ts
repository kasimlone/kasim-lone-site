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
        navy: { DEFAULT: "#0E2841", dark: "#081A2C", deep: "#050F1C" },
        ink: "#1F2A37",
        muted: "#556575",
        page: "#F7F8FA",
        accent: "#E97132",
        teal: "#156082",
        leafSA: "#196B24",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
