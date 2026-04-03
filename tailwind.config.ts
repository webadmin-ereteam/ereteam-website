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
        "brand-primary": "#1A6FA8",
        "brand-magenta": "#E91E8C",
        "brand-dark": "#1A1A2E",
        "brand-light": "#F7F8FA",
        "text-body": "#3D3D3D",
        "text-muted": "#6B7280",
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
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
