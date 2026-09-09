/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mitwa: {
          950: '#060a15',
          900: '#0a1128',
          850: '#0f1b3d',
          800: '#14234f',
          700: '#1e336b',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          brightCyan: '#22d3ee',
          glow: '#38bdf8'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
        'wave': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0.3' },
          '100%': { transform: 'scale(1.45)', opacity: '0' },
        },
        wave: {
          '0%': { height: '8px' },
          '100%': { height: '40px' },
        }
      }
    },
  },
  plugins: [],
}
