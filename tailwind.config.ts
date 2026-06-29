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
        // Nature Distilled palette — organic, high-end art gallery
        primary: {
          50: "#faf7f2",
          100: "#f3ede3",
          200: "#e6d9c5",
          300: "#d4bfa0",
          400: "#c2a47b",
          500: "#b08d5e",
          600: "#9a7548",
          700: "#7d5d3b",
          800: "#674c33",
          900: "#56402d",
          950: "#302117",
        },
        accent: {
          50: "#f0f7f4",
          100: "#dbede3",
          200: "#b9dbc9",
          300: "#8ec2a7",
          400: "#62a582",
          500: "#418a66",
          600: "#306e51",
          700: "#275842",
          800: "#214736",
          900: "#1c3b2e",
          950: "#0e211a",
        },
        surface: {
          50: "#fafaf8",
          100: "#f5f4f0",
          200: "#eae8e0",
          300: "#d9d5c9",
          400: "#c4bead",
          500: "#aea68f",
          600: "#9a8f76",
          700: "#807563",
          800: "#6a6153",
          900: "#575046",
          950: "#2e2a24",
        },
        cream: "#FAF7F2",
        charcoal: "#2D2926",
        warm: {
          white: "#FEFCF9",
          gray: "#8A8279",
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Montserrat"', "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      transitionDuration: {
        250: "250ms",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
