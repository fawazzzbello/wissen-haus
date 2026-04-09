/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0ecff',
          200: '#c7dcff',
          300: '#a4c7ff',
          400: '#7ba3ff',
          500: '#4f7aff',
          600: '#3052d5',
          700: '#2544bb',
          800: '#1e3599',
          900: '#1b287d',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9ff',
          200: '#ddd5ff',
          300: '#c4b3ff',
          400: '#a585ff',
          500: '#8a5bff',
          600: '#7236d5',
          700: '#6028bb',
          800: '#4e1d99',
          900: '#40137d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
