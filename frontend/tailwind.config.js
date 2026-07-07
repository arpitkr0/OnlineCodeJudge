/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0B0E14',
        ink: '#0B0E14',
        surface: {
          DEFAULT: '#12161F',
          card: '#151A24',
          light: '#181D29',
          border: '#222938',
          hover: '#1B212F'
        },
        dark: {
          950: '#080a0f',
          900: '#0B0E14',
          800: '#12161F',
          700: '#222938',
          600: '#333D52',
          500: '#565C6E',
          400: '#8A8FA3',
          300: '#B0B5C6',
          200: '#D4D7E3',
          100: '#E9EAF0',
        },
        amber: {
          400: '#f2c875',
          500: '#E8B85C',
          600: '#d19e38',
          accent: '#E8B85C',
        },
        verdict: {
          pass: '#5EC98C',
          fail: '#F4735E',
          queued: '#8A8FA3',
          running: '#E8B85C',
        },
        text: {
          primary: '#E9EAF0',
          muted: '#8A8FA3',
          dim: '#565C6E',
        },
        emerald: {
          400: '#5EC98C',
          500: '#5EC98C',
          600: '#4da773',
        },
        rose: {
          400: '#F4735E',
          500: '#F4735E',
          600: '#d95a45',
        },
        cyan: {
          400: '#8A8FA3', // Map away from cyan to neutral muted
          500: '#565C6E',
        },
        blue: {
          400: '#8A8FA3',
          500: '#565C6E',
          600: '#333D52',
        },
        fuchsia: {
          400: '#E8B85C', // Map legacy fuchsia references to warm amber accent
          500: '#E8B85C',
          600: '#d19e38',
        }
      },
      fontFamily: {
        sans: ['Inter', 'General Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'drift': 'drift 60s linear infinite',
        'load-nav': 'loadFadeRise 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'load-hero': 'loadFadeRise 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards',
        'load-code': 'loadFadeRise 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.24s forwards',
        'verdict-snap': 'verdictSnap 0.15s ease-in-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'loadFadeRise 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        drift: {
          '0%': { backgroundPosition: '0px 0px' },
          '100%': { backgroundPosition: '32px 32px' },
        },
        loadFadeRise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        verdictSnap: {
          '0%': { transform: 'scale(0.97)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
