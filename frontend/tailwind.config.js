/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sport-blue': '#002147',   // Your Navy Blue
        'sport-orange': '#FF6F00', // Your Orange
        'sport-light': '#F0F8FF',  // Alice Blue (Text color from your code)
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}