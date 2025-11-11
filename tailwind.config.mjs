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
        // Cores pastéis inspiradas no Brasil (jornal moderno)
        brand: {
          // Verde brasileiro (meio-termo)
          green: '#4FA87F',      // Verde meio-termo
          'green-dark': '#3d8a68',
          'green-light': '#C8E6D7',
          // Amarelo pastel brasileiro
          yellow: '#FFF4CC',     // Amarelo pastel suave
          'yellow-dark': '#FFE999',
          'yellow-light': '#FFFEF5',
          // Azul pastel brasileiro
          blue: '#B8D4F1',       // Azul pastel suave
          'blue-dark': '#8FB8E0',
          'blue-light': '#E3F0FA',
          // Tons complementares
          coral: '#FFD4BA',      // Coral pastel
          'coral-light': '#FFE8D9',
          beige: '#F5E6D3',      // Bege quente
          'beige-dark': '#E8D4BA',
        },
        // Palette neutra para jornal (tipografia clara) - Marrom escuro
        neutral: {
          950: '#3d2817',        // Marrom escuro editorial (era #1a1614)
          900: '#4a3422',        // Marrom principal (era #2d2621)
          800: '#5c4530',        // Marrom editorial (era #403932)
          700: '#6e5a47',        // Texto secundário
          600: '#8a7768',        // Texto terciário
          500: '#a59689',        // Texto desabilitado
          400: '#bcb6b0',        // Bordas escuras
          300: '#d4cfc9',        // Bordas médias
          200: '#e8e4de',        // Bordas suaves
          100: '#f5f2ed',        // Background alternativo
          50: '#fdfcfa',         // Background papel jornal
        },
        // Backgrounds estilo jornal
        background: {
          DEFAULT: '#fdfcfa',    // Papel jornal branco
          cream: '#f5f2ed',      // Cream suave
          sand: '#f0ebe5',       // Sand editorial
          paper: '#fffefb',      // Paper white puro
          pastel: '#FFF9E6',     // Amarelo pastel bem claro (destaque)
        },
        // Primary: Verde brasileiro (meio-termo)
        primary: {
          DEFAULT: '#4FA87F',    // Verde meio-termo (entre pastel e bandeira)
          hover: '#3d8a68',      // Verde mais escuro
          light: '#C8E6D7',      // Verde claro pastel
          lightest: '#E8F5EE',   // Verde quase imperceptível
        },
        link: {
          DEFAULT: '#4FA87F',    // Verde meio-termo para links
          hover: '#3d8a68',      // Hover mais escuro
        },
        // Accent: Amarelo pastel brasileiro
        accent: {
          DEFAULT: '#FFE999',    // Amarelo pastel médio
          hover: '#FFD666',      // Amarelo mais intenso
          light: '#FFF4CC',      // Amarelo bem claro
          lightest: '#FFFEF5',   // Amarelo quase branco
        },
        // Cores de destaque editorial
        editorial: {
          highlight: '#FFF4CC',  // Amarelo destaque
          divider: '#e8e4de',    // Linhas divisórias
          accent: '#4FA87F',     // Verde meio-termo
          tag: '#FFD4BA',        // Tags coral
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
        'card': '1.5rem',        // 24px - border radius dos cards (bem arredondado)
        'button': '1rem',        // 16px - border radius dos botões (suave)
        'badge': '9999px',       // pill shape
      },
      borderWidth: {
        'thick': '3px',          // Bordas grossas estilo ilustração
        'extra-thick': '4px',    // Bordas extra grossas para destaque
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(74, 52, 34, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(74, 52, 34, 0.1)',
        'button': '0 1px 2px 0 rgba(74, 52, 34, 0.05)',
        'illustration': '4px 4px 0px 0px rgba(74, 52, 34, 0.15)', // Shadow estilo flat illustration com marrom escuro
        'illustration-hover': '6px 6px 0px 0px rgba(74, 52, 34, 0.2)', // Shadow hover mais pronunciado
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
          outline: '2px solid #4a3422',
          outlineOffset: '2px',
          borderRadius: '0.25rem',
        },
      });
    },
  ],
};
