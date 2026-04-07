import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          bronze: '#92642A',
          'bronze-light': '#B8864A',
          'bronze-muted': '#F0E6D3',
          teal: '#2D8A8A',
          'teal-light': '#4AADAD',
          'teal-muted': '#D4EEEE',
          cream: '#FAFAF8',
          stone: '#F5F4F1',
          charcoal: '#1C1917',
          border: '#E5E3DF',
          muted: '#78716C',
          'muted-light': '#A8A29E',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          active: '#334155',
          border: '#1E293B',
          text: '#CBD5E1',
          'text-muted': '#64748B',
          'text-active': '#F1F5F9',
          accent: '#92642A',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '68': '17rem',
        '72': '18rem',
        '76': '19rem',
        '80': '20rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
        '96': '24rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.04)',
        'card-md': '0 4px 6px -1px rgba(28, 25, 23, 0.06), 0 2px 4px -2px rgba(28, 25, 23, 0.04)',
        'card-lg': '0 10px 15px -3px rgba(28, 25, 23, 0.06), 0 4px 6px -4px rgba(28, 25, 23, 0.04)',
        'sidebar': '2px 0 8px 0 rgba(15, 23, 42, 0.12)',
        'bronze': '0 4px 14px 0 rgba(146, 100, 42, 0.25)',
        'teal': '0 4px 14px 0 rgba(45, 138, 138, 0.25)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1C1917',
            a: { color: '#92642A', '&:hover': { color: '#B8864A' } },
            h1: { fontFamily: 'Playfair Display, Georgia, serif' },
            h2: { fontFamily: 'Playfair Display, Georgia, serif' },
            h3: { fontFamily: 'Playfair Display, Georgia, serif' },
          },
        },
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'slide-in-left': 'slideInLeft 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
