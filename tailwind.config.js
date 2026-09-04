/** @type {import('tailwindcss').Config} */
module.exports = {
  // El tema lo controla la clase `dark` en <html> (ver core/context/ThemeContext).
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {}
  },
  plugins: [],
}

