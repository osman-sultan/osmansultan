/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        background: "rgb(17, 17, 17)",
        "bg-opaque": "rgba(17, 17, 17, 0.25)",
        "background-light": "rgb(35, 35, 35)",
        "background-dark": "rgb(8, 8, 8)",
        textcolour: "rgb(235, 236, 243)",
        brand: "rgb(0, 255, 234)",
      },
    },
  },
  plugins: [],
};
