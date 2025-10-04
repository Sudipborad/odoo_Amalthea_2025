/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F7CFF',
        secondary: '#2D3748',
        success: '#48BB78',
        warning: '#ED8936',
        danger: '#F56565',
      }
    },
  },
  plugins: [],
}