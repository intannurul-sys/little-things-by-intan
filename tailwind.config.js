/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F4EFE6",
        linen: "#D9CBB7",
        walnut: "#654B38",
        ink: "#352A23",
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', "serif"],
        body: ['"Lora"', "serif"],
        ui: ['"Inter"', "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};