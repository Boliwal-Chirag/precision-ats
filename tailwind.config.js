/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#005ac2',
        secondary: '#5e5f65',
        tertiary: '#5f5c78',
        error: '#9f403d',
        background: '#fcf8f9',
        surface: {
          DEFAULT: '#fcf8f9',
          bright: '#fcf8f9',
          container: {
            lowest: '#ffffff',
            low: '#f6f3f4',
            DEFAULT: '#f0edef',
            high: '#eae7ea',
            highest: '#e4e2e5'
          }
        },
        on: {
          background: '#323235',
          surface: '#323235',
          'surface-variant': '#5f5f61',
          primary: '#f7f7ff',
          secondary: '#f9f8ff',
          tertiary: '#fcf7ff',
          error: '#fff7f6'
        },
        outline: {
          DEFAULT: '#7b7a7d',
          variant: '#b3b1b4'
        }
      }
    },
  },
  plugins: [],
}
