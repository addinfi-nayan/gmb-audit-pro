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
        // Addinfi brand palette (addinfi.com): primary #3666a3, navy #164a8c, light #F0F5FA.
        // Overrides Tailwind's blue/cyan so every existing blue-* / cyan-* class follows the brand.
        blue: {
          50: "#f0f5fa",
          100: "#dde8f4",
          200: "#bfd3ea",
          300: "#93b4da",
          400: "#6590c6",
          500: "#4677b3",
          600: "#3666a3",
          700: "#265898",
          800: "#164a8c",
          900: "#123c70",
          950: "#0c2a50",
        },
        cyan: {
          50: "#eef7fd",
          100: "#d6ecfa",
          200: "#aed8f4",
          300: "#7cc0ec",
          400: "#3297ef",
          500: "#1683c4",
          600: "#066aab",
          700: "#05578c",
          800: "#064770",
          900: "#083a5a",
          950: "#05263d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
