/** @type {import('tailwindcss').Config} */
module.exports = {
  // El tema lo controla la clase `dark` en <html> (ver core/context/ThemeContext).
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Tokens de shadcn/ui. Los valores viven en src/index.css y reproducen la
      // marca y el convenio claro/oscuro del proyecto (no son la paleta de shadcn).
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Un `border` sin color explícito era gray-200 también en modo oscuro (una
      // línea clara sobre slate-800). Con esto sigue el convenio del proyecto:
      // gray-200 en claro, slate-700 en oscuro. En claro no cambia nada.
      borderColor: {
        DEFAULT: "hsl(var(--border))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
