import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "metal-dark":    "#1C201D",
        "metal-mid":     "#2E3530",
        "metal-light":   "#3F4841",
        "paper-cream":   "#E8DCC0",
        "paper-white":   "#F2EAD3",
        "paper-shadow":  "#A89878",
        "ink-black":     "#1A1612",
        "stamp-red":     "#B0261C",
        "stamp-red-dark":"#7A1A12",
        "lamp-orange":   "#E8954A",
        "lamp-glow":     "#FFCB88",
        "accent-green":  "#4A6B3D",
      },
      fontFamily: {
        typewriter: ["'Courier Prime'", "Courier New", "monospace"],
        stamp:      ["'Special Elite'", "Courier New", "monospace"],
        marker:     ["'Permanent Marker'", "cursive"],
      },
      keyframes: {
        stampDrop: {
          "0%":   { transform: "scale(1.5) rotate(var(--stamp-rot, -5deg))", opacity: "0" },
          "60%":  { transform: "scale(0.95) rotate(var(--stamp-rot, -5deg))", opacity: "1" },
          "100%": { transform: "scale(1.0) rotate(var(--stamp-rot, -5deg))", opacity: "0.88" },
        },
        paperDrop: {
          "0%":   { transform: "translateY(-24px) rotate(var(--paper-rot, -1deg))", opacity: "0" },
          "100%": { transform: "translateY(0) rotate(var(--paper-rot, -1deg))", opacity: "1" },
        },
        flipIn: {
          "0%":   { transform: "rotateY(-90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        typewriter: {
          from: { width: "0" },
          to:   { width: "100%" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        slideUp: {
          "0%":   { transform: "translateY(0) rotate(var(--fly-rot, -3deg))", opacity: "1" },
          "100%": { transform: "translateY(-110vh) rotate(var(--fly-rot, -3deg))", opacity: "0" },
        },
      },
      animation: {
        "stamp-drop": "stampDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "paper-drop": "paperDrop 0.4s ease-out forwards",
        "flip-in":    "flipIn 0.4s ease-out forwards",
        "typewriter": "typewriter 0.6s steps(20) forwards",
        "blink":      "blink 1s step-end infinite",
        "slide-up":   "slideUp 0.5s ease-in forwards",
      },
    },
  },
  plugins: [],
};
export default config;
