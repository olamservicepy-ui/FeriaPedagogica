/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Tipografía estilo Carnegie Endowment
        carnegie: ['"Libre Franklin"', 'News Gothic', 'Trade Gothic', 'system-ui', 'sans-serif'],
        // Tipografía para el cuerpo del texto de las investigaciones
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
