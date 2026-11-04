/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        salvia: { 50: '#F1F6F2', 100: '#DFEBE3', 200: '#BFD6C7', 300: '#9BBFA8', 400: '#7FAE91', 500: '#6E9E84', 600: '#567F69', 700: '#436452', 800: '#304838' },
        turquesa: { 50: '#E8F7F6', 100: '#C8ECEA', 400: '#3FB8B0', 500: '#22A39B', 600: '#1A857E', 700: '#14665F' },
        crema: { 50: '#FFFDF9', 100: '#FBF8F3', 200: '#F4EEE4' },
        lavanda: { 50: '#F5F2FB', 100: '#EAE3F7', 300: '#C3B3E8', 500: '#9479CF', 600: '#7A5EB8' },
        coral: { 50: '#FFF3EF', 100: '#FFE1D7', 400: '#F4917A', 500: '#EC7559', 600: '#D35D42' },
        cielo: { 50: '#EEF5FC', 100: '#D9E8F7', 400: '#6FA3D8', 500: '#4F8BC9', 600: '#3B71AB' },
        piedra: { 400: '#A39B90', 500: '#857D72', 600: '#6A635A', 700: '#4E4943', 800: '#36322E' },
      },
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'], display: ['Fraunces', 'Georgia', 'serif'] },
      boxShadow: { suave: '0 2px 10px rgba(70, 60, 45, 0.07)', flota: '0 8px 24px rgba(70, 60, 45, 0.12)' },
    },
  },
  plugins: [],
}
