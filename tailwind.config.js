/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dogica: ['Dogica', 'sans-serif'],
        karmaticarcade: ['Karmatic-Arcade', 'cursive'],
      },
      boxShadow: {
        pixelart: "4px 0 0 0 #64748b, -4px 0 0 0 #64748b, 0 4px 0 0 #64748b, 0 -4px 0 0 #64748b",
      },
    },
  },
  plugins: [],
}

