/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', ...defaultTheme.fontFamily.sans],
        serif: ['Crimson Pro', 'Georgia', ...defaultTheme.fontFamily.serif],
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
        // Brand colors from logo (Brazil-inspired)
        brand: {
          green: '#3aaf54',      // Bandeira BR verde
          'green-dark': '#2d8a42',
          yellow: '#f7d55c',     // Ouro brasileiro
          'yellow-light': '#f8d466',
          coral: '#f2af72',      // Tom quente
          'coral-light': '#f3b075',
          brown: '#bd7855',      // Terra
          'brown-dark': '#b5805a',
        },
        // Warm neutral palette (replacing cold grays)
        neutral: {
          950: '#1a1612',        // Preto caloroso (brown-black)
          900: '#2d2821',        // Texto principal (warm dark)
          800: '#3d362e',        // Texto escuro suave
          700: '#57504a',        // Texto secundário
          600: '#74696a',        // Texto terciário
          500: '#9a8f8a',        // Texto desabilitado
          400: '#b5aca7',        // Bordas escuras
          300: '#d4cdc7',        // Bordas médias
          200: '#e8e2dc',        // Bordas suaves (warm)
          100: '#f5f1ed',        // Background alternativo (cream)
          50: '#faf8f5',         // Background principal (warm white)
        },
        // Background variants for depth
        background: {
          DEFAULT: '#faf8f5',    // Warm white principal
          cream: '#f5f1ed',      // Cream suave
          sand: '#f0ebe5',       // Sand mais escuro
          paper: '#fefdfb',      // Paper white (quase branco)
        },
        // Semantic colors (mantém os mesmos)
        primary: {
          DEFAULT: '#3aaf54',    // Verde do logo
          hover: '#2d8a42',
          light: '#e8f5eb',
        },
        link: {
          DEFAULT: '#2d8a42',    // Verde escuro para links (WCAG AA)
          hover: '#236a34',      // Hover ainda mais escuro
        },
        accent: {
          DEFAULT: '#f7d55c',    // Amarelo do logo
          hover: '#f5d03b',
          light: '#fffbea',      // Amarelo bem claro
          lightest: '#fffef5',   // Amarelo quase imperceptível
        },
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
        'card': '0.75rem',       // 12px - border radius dos cards
        'button': '0.5rem',      // 8px - border radius dos botões
        'badge': '9999px',       // pill shape
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
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
        'slide-in-right': {
          '0%': { 
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
    },
  },
  plugins: [
    // Plugin para adicionar estilos de focus consistentes
    function ({ addBase }) {
      addBase({
        '*:focus-visible': {
          outline: '2px solid #3aaf54',
          outlineOffset: '2px',
          borderRadius: '0.25rem',
        },
      });
    },
  ],
};
