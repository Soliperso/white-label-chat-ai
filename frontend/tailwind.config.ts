import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from wireframe spec
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          dark: '#1976D2',    // Hover state
          light: '#E3F2FD',   // Backgrounds
        },
        // Status colors from spec
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        // Neutral colors from spec
        background: {
          DEFAULT: '#FAFAFA', // Light mode
          dark: '#121212',    // Dark mode
        },
        surface: {
          DEFAULT: '#FFFFFF', // Light mode
          dark: '#1E1E1E',    // Dark mode
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
          'primary-dark': '#FFFFFF',
          'secondary-dark': '#BDBDBD',
        },
        border: {
          DEFAULT: '#E0E0E0',
          dark: '#424242',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px', // Main content max-width from spec
      },
      width: {
        sidebar: '256px', // Sidebar width from spec
      },
      borderRadius: {
        DEFAULT: '8px',   // Standard from spec
        compact: '4px',   // Compact from spec
      },
      fontSize: {
        // Typography scale from spec
        'heading-1': ['32px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.5px' }],
        'heading-2': ['24px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.3px' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '400', letterSpacing: '0.4px' }],
      },
      // Spacing based on 8px grid (Tailwind already uses 4px base, so this is compatible)
      spacing: {
        // 8px grid: 1=8px, 2=16px, 3=24px, 4=32px, 6=48px, 8=64px
        // These map to Tailwind's default scale which works well
      },
    },
  },
  plugins: [],
};

export default config;
