// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Include the root HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Include ALL relevant file types in src and subfolders
  ],
  darkMode: 'class', // Make sure this is set if you use dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}