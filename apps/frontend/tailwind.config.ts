import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        panel: 'hsl(var(--panel))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
        text: 'hsl(var(--text))',
        accent: 'hsl(var(--accent))',
        danger: 'hsl(var(--danger))',
        warning: 'hsl(var(--warning))',
        success: 'hsl(var(--success))'
      }
    }
  },
  plugins: []
};

export default config;
