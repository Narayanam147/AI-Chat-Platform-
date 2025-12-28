import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: {
          bg: '#131314',
          sidebar: '#1E1E1E',
          text: '#E3E3E3',
          'text-secondary': '#C4C7C5',
          accent: '#8AB4F8',
          hover: '#333537',
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-2px)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(2px)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-2px)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(2px)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "in": "fade-in 0.2s ease-out",
        "fade-in-0": "fade-in 0.2s ease-out",
        "zoom-in-95": "zoom-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
