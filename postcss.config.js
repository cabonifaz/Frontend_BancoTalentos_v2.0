/**
 * Con Create React App esta cadena era implícita: react-scripts detectaba
 * tailwind.config.js e inyectaba `tailwindcss` en PostCSS por su cuenta, y
 * traía `autoprefixer` dentro. Vite no hace nada de eso, así que sin este
 * archivo la aplicación arranca sin una sola clase de Tailwind aplicada.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
