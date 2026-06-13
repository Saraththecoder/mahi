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
        primary: {
          50: '#f2f9f5',
          100: '#e2f2e9',
          200: '#c5e5d3',
          300: '#99d0b3',
          400: '#67b38d',
          500: '#40966d',
          600: '#2d7a56',
          700: '#246146',
          800: '#1d4e38',
          900: '#18402f',
          950: '#0c241b',
        },
        earth: {
          50: '#faf7f2',
          100: '#f3ece0',
          200: '#e5d7c0',
          300: '#d2bc97',
          400: '#bd9e6f',
          500: '#ab834e',
          600: '#9b7141',
          700: '#815c35',
          800: '#694a2e',
          900: '#563d27',
          950: '#2e1f14',
        },
        gold: {
          50: '#fdfbeb',
          100: '#fbf7c7',
          200: '#f7ee90',
          300: '#f2dc50',
          400: '#ecc622',
          500: '#d4a817',
          600: '#b78611',
          700: '#926110',
          800: '#774d13',
          900: '#633f14',
          950: '#3a2107',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
      }
    },
  },
  plugins: [],
}
