import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // "@/…" → src/. Debe coincidir con "paths" de tsconfig.json.
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // CRA servía en 3000; se mantiene para no romper hábitos ni configuraciones
    // de CORS del backend que dependan del origen de desarrollo.
    port: 3000,
    open: true,
  },

  build: {
    // El workflow de Azure Static Web Apps publica `output_location: "build"`.
    // Vite escribe en `dist` por defecto, así que se fuerza `build` y el
    // pipeline sigue funcionando sin tocar los YAML ni los secretos.
    outDir: "build",
    // Equivalente al GENERATE_SOURCEMAP=false que CRA recibía vía cross-env.
    sourcemap: false,
  },
});
