/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        raga: {
          50: '#fdf8f2', 100: '#f5e9d0', 200: '#e9cc9d', 300: '#d9a96a',
          400: '#c8863e', 500: '#b86b28', 600: '#9a5420', 700: '#7c401a',
          800: '#5e3016', 900: '#422010', 950: '#2a1208',
        },
        'dark-raga': '#1c0f05',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: { float: 'float 4s ease-in-out infinite' },
    },
  },
  plugins: [],
}
