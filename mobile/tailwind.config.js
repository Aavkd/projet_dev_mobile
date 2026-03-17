/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f5f7fb',
        ink: '#10213a',
        accent: '#1f6feb',
        success: '#1f9d55',
        warn: '#f59e0b',
        danger: '#dc2626'
      }
    }
  },
  plugins: []
}
