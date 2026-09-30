import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#a78bfa',
          muted: 'rgba(124, 58, 237, 0.12)',
          glow: 'rgba(124, 58, 237, 0.35)',
        },
        bg: {
          DEFAULT: 'var(--color-bg)',
          elevated: 'var(--color-bg-elevated)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
          active: 'var(--color-surface-active)',
          subtle: 'var(--color-surface-subtle)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
          subtle: 'var(--color-border-subtle)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
        },

        // Work types
        'deep-work': '#06b6d4',
        'meetings': '#f59e0b',
        'errands': '#ef4444',
        'learning': '#8b5cf6',
        'personal': '#ec4899',

        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f43f5e',
        info: '#3b82f6',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'Instrument Sans', 'system-ui', 'sans-serif'],
        body: ['Instrument Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px -2px rgba(124, 58, 237, 0.3)',
        'glow-sm': '0 0 10px -1px rgba(124, 58, 237, 0.25)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
