/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for logistics platform
        primary: {
          light: '#4dabf7',
          DEFAULT: '#1e88e5',
          dark: '#1565c0',
        }
      },
    },
  },
  plugins: [],
}