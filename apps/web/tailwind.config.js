/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#008F49',
          secondary: '#AAA014',
          accent: '#BC8A5F',
          cream: '#FEFAE0',
        },
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(40px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 500ms ease-out',
        'slide-down-out': 'slide-down-out 350ms ease-in forwards',
        'fade-in': 'fade-in 300ms ease-out',
        'fade-out': 'fade-out 350ms ease-in forwards',
      },
    },
  },
  plugins: [],
}
