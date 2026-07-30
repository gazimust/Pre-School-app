import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef6ec",
          100: "#fdebd2",
          200: "#fad3a3",
          300: "#f6b46b",
          400: "#f2953f",
          500: "#ea7a21",
          600: "#d15f17",
          700: "#ad4816",
          800: "#8c3a19",
          900: "#733018",
        },
        leaf: {
          50: "#eefbf1",
          100: "#d5f5dd",
          200: "#aeeabf",
          300: "#7ad89b",
          400: "#4abd78",
          500: "#28a05d",
          600: "#1c814b",
          700: "#19673f",
          800: "#185236",
          900: "#15442e",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
