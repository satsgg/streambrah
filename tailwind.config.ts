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
        // primary: "#DAA520",
        primary: {
          DEFAULT: "#DAA520",
          100: "#EAC871",
          200: "#E7Z15F",
          300: "#E2BA4E",
          400: "#E2B33C",
          500: "#DAA520",
          600: "#D5A220",
          700: "#C3941D",
          800: "#B1871B",
          900: "#A07918",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        alert: {
          "0%,100%": { opacity: "0" },
          "10%,90%": { opacity: "1" },
        },
      },
      animation: {
        alert: "alert 10s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
