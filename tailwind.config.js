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
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        section: {
          work: '#3b82f6',       // Blue
          health: '#10b981',     // Green / Emerald
          activities: '#f59e0b', // Amber / Orange
          hobbies: '#8b5cf6',    // Purple / Violet
          production: '#ec4899', // Pink / Rose
        }
      }
    },
  },
  plugins: [],
}
