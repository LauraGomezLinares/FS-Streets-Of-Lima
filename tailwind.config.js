const { transform } = require('framer-motion');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    //clases gradient
    "from-yellow-300",
    "via-yellow-500",
    "to-yellow-900",
    "from-blue-400",
    "via-blue-700",
    "from-purple-500",
    "via-fuchsia-700",
    "from-yellow-200",
    "to-yellow-950",
    "to-black",

    //rareza
    "text-yellow-300",
    "text-blue-300",
    "text-fuchsia-300",

    // bordes
    "border-yellow-400",
    "border-blue-500",
    "border-fuchsia-500",

    // sombras
    "shadow-[0_0_45px_rgba(250,204,21,0.35)]",
    "shadow-[0_0_35px_rgba(59,130,246,0.25)]",
    "shadow-[0_0_35px_rgba(217,70,239,0.25)]",
    //todo: cambiar esto omfg q pereza hacer esto para cada uno 
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
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}

