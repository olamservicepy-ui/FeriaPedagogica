/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        carnegie: ['"Libre Franklin"', 'News Gothic', 'Trade Gothic', 'system-ui', 'sans-serif'],
        editorial: ['"Newsreader"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
