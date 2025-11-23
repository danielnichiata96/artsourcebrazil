/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        // Enhanced typography scale with line heights
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.625rem' }],      // 26px line height for better readability
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],     // 44px line height
        '5xl': ['3rem', { lineHeight: '3.5rem' }],         // 56px line height
        '6xl': ['3.75rem', { lineHeight: '4rem' }],
        '7xl': ['4.5rem', { lineHeight: '4.75rem' }],
        // Display sizes for hero sections
        'display-sm': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],
        'display-md': ['3.75rem', { lineHeight: '4rem', letterSpacing: '-0.02em' }],
        'display-lg': ['4.5rem', { lineHeight: '4.75rem', letterSpacing: '-0.03em' }],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        paper: '#f4f3f0',
        ink: '#1a1918',
        primary: {
          DEFAULT: '#F7DD00', // Brazil yellow
          hover: '#D1B000',
          dark: '#B89000',
          light: '#FFF3A6',
          lightest: '#FFFADE',
        },
        brazil: {
          blue: '#33C7FF',
          'blue-dark': '#1FA0D4',
          green: '#009F4D',
          'green-dark': '#0B7A3A',
          purple: '#9A7BFF',
        },
        accent: {
          lime: '#F7DD00',
          pink: '#ff99cc',
          purple: '#b388ff',
          orange: '#ffaa00',
          teal: '#00e5ff',
        },
      },
      backgroundImage: {
        'brazil-hero': 'linear-gradient(90deg, #9A7BFF 0%, #33C7FF 50%, #17E0FF 100%)',
      },
      spacing: {
        // Custom spacing scale (além do Tailwind padrão)
        'section': '5rem',       // 80px - espaçamento entre seções
        'section-sm': '3rem',    // 48px - espaçamento menor
        'container': '1.5rem',   // 24px - padding do container
        'card': '1.5rem',        // 24px - padding interno dos cards
        'card-sm': '1rem',       // 16px - padding menor
        'card-lg': '2rem',       // 32px - padding maior
      },
      borderRadius: {
        'card': '1.5rem',        // 24px - border radius dos cards (bem arredondado)
        'button': '1rem',        // 16px - border radius dos botões (suave)
        'badge': '9999px',       // pill shape
      },
      borderWidth: {
        'thick': '3px',          // Bordas grossas estilo ilustração
        'extra-thick': '4px',    // Bordas extra grossas para destaque
      },
      boxShadow: {
        'hard': '5px 5px 0px 0px rgba(26, 25, 24, 1)',
        'hard-sm': '3px 3px 0px 0px rgba(26, 25, 24, 1)',
        'hard-lg': '10px 10px 0px 0px rgba(26, 25, 24, 1)',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'slide-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      transitionTimingFunction: {
        'in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',   // Suave e natural
        'out-soft': 'cubic-bezier(0.2, 0, 0.2, 1)',      // Saída suave
        'spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)',      // Leve bounce (opcional)
      },
      willChange: {
        transform: 'transform',
      },
    },
  },
  plugins: [
    // Plugin para adicionar estilos de focus consistentes
    function ({ addBase }) {
      addBase({
        '*:focus-visible': {
          outline: '2px solid #4a3422',
          outlineOffset: '2px',
          borderRadius: '0.25rem',
        },
      });
    },
  ],
};
