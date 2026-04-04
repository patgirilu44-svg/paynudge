import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        page: "#F9F8F6",
        surface: "#FFFFFF",
        border: "#E8E4DC",
        muted: "#9A9486",
        accent: "#2563EB",
        accentDark: "#1D4ED8",
        foreground: "#1A1A1A",
        surfaceHover: "#F0EDE7",
        danger: "#DC2626",
        warning: "#D97706",
        success: "#16A34A",
      },
    },
  },
  plugins: [],
};

export default config;
