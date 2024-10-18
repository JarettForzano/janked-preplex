const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],  // Enable class-based dark mode
  content: ["src/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],  // Scan components for classes
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: {
          DEFAULT: "hsl(var(--background))",
          dark: "hsl(var(--background-dark))",
          light: "hsl(var(--background-light))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          dark: "hsl(var(--foreground-dark))",
          light: "hsl(var(--foreground-light))",
        },
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
