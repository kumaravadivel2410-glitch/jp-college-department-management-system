/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F5FF',
          100: '#E0EBFF',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E3A8A',
          900: '#0F172A'
        },
        brand: {
          blue: '#1E3A8A',
          gold: '#D97706',
          accent: '#2563EB'
        }
      }
    },
  },
  plugins: [],
}
