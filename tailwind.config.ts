import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0D4D73",
        "brand-magenta": "#B96F38",
        "brand-dark": "#071A2A",
        "brand-light": "#F3F0E8",
        "text-body": "#283640",
        "text-muted": "#65717A",
        // Service colors
        "svc-data": "#1A6FA8",
        "svc-finance": "#7C3AED",
        "svc-marketing": "#E91E8C",
        // Product colors
        "prod-obserian": "#7454A2",
        "prod-pharmeta": "#3B82F6",
        "prod-maturytics": "#F15A29",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
